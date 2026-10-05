// Paleta da marca (logo icon.png): azul-marinho, dourado e branco. Espelha
// gestao-patrimonio-frontend/src/app/globals.css — altere os dois juntos.
export const colors = {
  background: "#F5F7FA",
  surface: "#ffffff",
  surfaceMuted: "#EEF2F7",
  border: "#DFE5EE",
  text: "#0C1A33",
  textMuted: "#62708A",
  textFaint: "#97A3B6",

  primary: "#003C85",
  primarySoft: "#E6EEF8",
  primaryText: "#003C85",

  gold: "#F0B424",
  goldSoft: "#FDF3D7",
  goldText: "#8A5F00",

  success: "#188A4F",
  successSoft: "#E3F4EA",
  warning: "#E07B09",
  warningSoft: "#FDEEDC",
  danger: "#D9363C",
  dangerSoft: "#FBE7E8",

  sidebar: "#001A4D",
  sidebarText: "#ffffff",

  chart1: "#003C99",
  chart2: "#F0B424",
  chart3: "#188A4F",
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
