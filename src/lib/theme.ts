export const colors = {
  background: "#f1f5f9",
  surface: "#ffffff",
  surfaceMuted: "#f8fafc",
  border: "#e2e8f0",
  text: "#0f172a",
  textMuted: "#64748b",
  textFaint: "#94a3b8",

  primary: "#2563eb",
  primarySoft: "#dbeafe",
  primaryText: "#1d4ed8",

  success: "#16a34a",
  successSoft: "#dcfce7",
  warning: "#d97706",
  warningSoft: "#ffedd5",
  danger: "#dc2626",
  dangerSoft: "#fee2e2",

  sidebar: "#0f172a",
  sidebarText: "#e2e8f0",

  chart1: "#2563eb",
  chart2: "#16a34a",
  chart3: "#d97706",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
};

export const font = {
  size: {
    xs: 12,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 26,
  },
};

export type BadgeTone = "primary" | "success" | "warning" | "danger" | "muted";

export const badgeColors: Record<
  BadgeTone,
  { bg: string; fg: string }
> = {
  primary: { bg: colors.primarySoft, fg: colors.primaryText },
  success: { bg: colors.successSoft, fg: colors.success },
  warning: { bg: colors.warningSoft, fg: colors.warning },
  danger: { bg: colors.dangerSoft, fg: colors.danger },
  muted: { bg: "#e2e8f0", fg: "#475569" },
};
