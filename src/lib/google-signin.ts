/**
 * Login com Google (via @react-native-google-signin/google-signin).
 *
 * O módulo é nativo: só existe num development build / build de loja, não no
 * Expo Go. Por isso é carregado com `require` protegido — sem ele (ou sem
 * `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`), `googleSigninDisponivel` é false e a
 * tela de login simplesmente não mostra o botão.
 *
 * O ID token é pedido com o client "Aplicativo da Web" (`webClientId`) como
 * audiência — é esse ID que o backend valida (GOOGLE_CLIENT_IDS).
 */
import type * as GoogleSigninModule from "@react-native-google-signin/google-signin";

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "";
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || undefined;

function carregarModulo(): typeof GoogleSigninModule | null {
  if (!WEB_CLIENT_ID) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("@react-native-google-signin/google-signin") as typeof GoogleSigninModule;
  } catch {
    return null; // Expo Go: módulo nativo ausente.
  }
}

const modulo = carregarModulo();
let configurado = false;

export const googleSigninDisponivel = modulo !== null;

/**
 * Abre o seletor de contas do Google e devolve o ID token da conta escolhida,
 * ou `null` se o usuário cancelar. Lança erro com mensagem amigável nos
 * demais casos.
 */
export async function obterIdTokenGoogle(): Promise<string | null> {
  if (!modulo) {
    throw new Error("Login com Google indisponível neste aplicativo.");
  }
  const { GoogleSignin, isSuccessResponse, isErrorWithCode, statusCodes } = modulo;
  if (!configurado) {
    GoogleSignin.configure({ webClientId: WEB_CLIENT_ID, iosClientId: IOS_CLIENT_ID });
    configurado = true;
  }
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const resposta = await GoogleSignin.signIn();
    if (!isSuccessResponse(resposta)) return null; // cancelado
    if (!resposta.data.idToken) {
      throw new Error("O Google não retornou o token de identificação.");
    }
    return resposta.data.idToken;
  } catch (e) {
    if (isErrorWithCode(e)) {
      if (e.code === statusCodes.SIGN_IN_CANCELLED) return null;
      if (e.code === statusCodes.IN_PROGRESS) return null;
      if (e.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error("Google Play Services indisponível ou desatualizado neste aparelho.");
      }
    }
    throw e instanceof Error ? e : new Error("Não foi possível entrar com o Google.");
  }
}

/**
 * Desconecta a conta Google do app (best-effort), para que o próximo login
 * volte a mostrar o seletor de contas em vez de reutilizar a última.
 */
export async function sairDoGoogle(): Promise<void> {
  if (!modulo || !configurado) return;
  try {
    await modulo.GoogleSignin.signOut();
  } catch {
    // Ignora — a sessão do app já é encerrada de qualquer forma.
  }
}
