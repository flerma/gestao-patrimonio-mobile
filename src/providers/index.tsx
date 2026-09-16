import * as React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { loadApiBaseUrl } from "@/lib/config";
import { QueryProvider } from "./query";
import { AuthProvider } from "./auth";
import { SelectedUserProvider } from "./selected-user";
import { PushRegistrar } from "./push";
import { ToastProvider } from "./toast";

export function AppProviders({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    loadApiBaseUrl();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryProvider>
          <AuthProvider>
            <SelectedUserProvider>
              <PushRegistrar />
              <ToastProvider>{children}</ToastProvider>
            </SelectedUserProvider>
          </AuthProvider>
        </QueryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
