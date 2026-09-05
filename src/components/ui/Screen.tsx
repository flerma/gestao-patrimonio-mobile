import * as React from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, spacing } from "@/lib/theme";

interface ScreenProps extends ScrollViewProps {
  children: React.ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  padded?: boolean;
}

export function Screen({
  children,
  scroll = true,
  refreshing,
  onRefresh,
  padded = true,
  contentContainerStyle,
  ...props
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const pad = {
    paddingHorizontal: padded ? spacing.lg : 0,
    paddingTop: spacing.lg,
    paddingBottom: insets.bottom + spacing.xxl,
  };

  if (!scroll) {
    return <View style={[styles.root, pad]}>{children}</View>;
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[pad, contentContainerStyle]}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={Boolean(refreshing)}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        ) : undefined
      }
      {...props}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
});
