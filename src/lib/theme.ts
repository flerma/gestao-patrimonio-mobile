// Paleta "Azul sereno": fundo off-white, superfícies brancas, azul calmo.
export const colors = {
  background: "#F7F9FC",
  surface: "#ffffff",
  surfaceMuted: "#F1F5FB",
  border: "#E9EEF5",
  text: "#1F2733",
  textMuted: "#6A7686",
  textFaint: "#9AA6B4",

  primary: "#3B82F6",
  primarySoft: "#E8F1FE",
  primaryText: "#1D4ED8",

  success: "#1FA463",
  successSoft: "#E4F5EC",
  warning: "#E0A100",
  warningSoft: "#FBF1DA",
  danger: "#E5484D",
  dangerSoft: "#FCE9EA",

  sidebar: "#ffffff",
  sidebarText: "#1F2733",

  chart1: "#3B82F6",
  chart2: "#1FA463",
  chart3: "#E0A100",
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
  sm: 10,
  md: 14,
  lg: 18,
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
  muted: { bg: "#EAEEF4", fg: "#5A6675" },
};
