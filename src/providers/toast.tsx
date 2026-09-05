import * as React from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { setToastHandler, type ToastKind } from "@/lib/toast";
import { colors, radius, spacing } from "@/lib/theme";

interface ToastState {
  id: number;
  kind: ToastKind;
  message: string;
}

const kindColor: Record<ToastKind, string> = {
  success: colors.success,
  error: colors.danger,
  info: colors.text,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toastState, setToastState] = React.useState<ToastState | null>(null);
  const opacity = React.useRef(new Animated.Value(0)).current;
  const hideTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    setToastHandler((kind, message) => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setToastState({ id: Date.now(), kind, message });
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
      hideTimer.current = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }).start(() => setToastState(null));
      }, 3200);
    });
    return () => {
      setToastHandler(null);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [opacity]);

  return (
    <View style={styles.root}>
      {children}
      {toastState && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.toast,
            { opacity, bottom: insets.bottom + spacing.xl },
          ]}
        >
          <View
            style={[
              styles.dot,
              { backgroundColor: kindColor[toastState.kind] },
            ]}
          />
          <Text style={styles.text}>{toastState.message}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  toast: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.text,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  text: { color: "#fff", flex: 1, fontSize: 14 },
});
