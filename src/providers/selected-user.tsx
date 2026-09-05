import * as React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "gpi:selected-usuario";

interface SelectedUserContextValue {
  usuarioId: string | null;
  setUsuarioId: (id: string | null) => void;
  hydrated: boolean;
}

const SelectedUserContext = React.createContext<SelectedUserContextValue>({
  usuarioId: null,
  setUsuarioId: () => {},
  hydrated: false,
});

export function useSelectedUser() {
  return React.useContext(SelectedUserContext);
}

export function SelectedUserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [usuarioId, setUsuarioIdState] = React.useState<string | null>(null);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored) setUsuarioIdState(stored);
      })
      .catch(() => {})
      .finally(() => setHydrated(true));
  }, []);

  const setUsuarioId = React.useCallback((id: string | null) => {
    setUsuarioIdState(id);
    if (id) {
      AsyncStorage.setItem(STORAGE_KEY, id).catch(() => {});
    } else {
      AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
    }
  }, []);

  const value = React.useMemo(
    () => ({ usuarioId, setUsuarioId, hydrated }),
    [usuarioId, setUsuarioId, hydrated],
  );

  return (
    <SelectedUserContext.Provider value={value}>
      {children}
    </SelectedUserContext.Provider>
  );
}
