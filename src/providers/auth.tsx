import * as React from "react";

import {
  authApi,
  type LoginResponse,
  type RegistrarRequest,
  type UsuarioAutenticado,
} from "@/lib/api/auth";
import {
  clearSession,
  getRefreshToken,
  loadSession,
  onSessionExpired,
  saveSession,
  type UsuarioSessao,
} from "@/lib/auth/token-storage";
import { sairDoGoogle } from "@/lib/google-signin";

interface AuthContextValue {
  usuario: UsuarioSessao | null;
  carregando: boolean;
  login: (usuario: string, senha: string) => Promise<void>;
  loginGoogle: (idToken: string) => Promise<void>;
  registrar: (dados: RegistrarRequest) => Promise<UsuarioAutenticado>;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth precisa ser usado dentro de <AuthProvider>");
  }
  return ctx;
}

function paraUsuarioSessao(usuario: UsuarioAutenticado): UsuarioSessao {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    role: usuario.role,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = React.useState<UsuarioSessao | null>(null);
  const [carregando, setCarregando] = React.useState(true);

  // Hidratação inicial a partir do SecureStore. Otimista: se há tokens
  // salvos, assume a sessão válida e mostra o usuário em cache — a
  // validade real é verificada de forma preguiçosa na primeira chamada de
  // API real (401 dispara o refresh silencioso do client.ts).
  React.useEffect(() => {
    let ativo = true;
    loadSession()
      .then(({ accessToken, refreshToken, usuario: usuarioCache }) => {
        if (!ativo) return;
        if (accessToken && refreshToken && usuarioCache) {
          setUsuario(usuarioCache);
        }
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, []);

  // Quando o client HTTP esgota a tentativa de refresh silencioso (refresh
  // token ausente/expirado/revogado), ele já limpou a sessão persistida —
  // aqui só precisamos refletir isso no estado em memória.
  React.useEffect(() => onSessionExpired(() => setUsuario(null)), []);

  const iniciarSessao = React.useCallback(async (resposta: LoginResponse) => {
    await saveSession({
      accessToken: resposta.accessToken,
      refreshToken: resposta.refreshToken,
      usuario: paraUsuarioSessao(resposta.usuario),
    });
    setUsuario(paraUsuarioSessao(resposta.usuario));
  }, []);

  const login = React.useCallback(
    async (usuarioLogin: string, senha: string) => {
      await iniciarSessao(await authApi.login({ usuario: usuarioLogin, senha }));
    },
    [iniciarSessao],
  );

  const loginGoogle = React.useCallback(
    async (idToken: string) => {
      await iniciarSessao(await authApi.loginGoogle(idToken));
    },
    [iniciarSessao],
  );

  const registrar = React.useCallback(
    async (dados: RegistrarRequest) => authApi.registrar(dados),
    [],
  );

  const logout = React.useCallback(async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // Best-effort: mesmo se o backend falhar, a sessão local é limpa.
      }
    }
    await clearSession();
    await sairDoGoogle();
    setUsuario(null);
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({ usuario, carregando, login, loginGoogle, registrar, logout }),
    [usuario, carregando, login, loginGoogle, registrar, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
