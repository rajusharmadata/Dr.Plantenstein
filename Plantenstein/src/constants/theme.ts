const COLORS = {
  background: "#F2F5E9",
  cardBackground: "#FAFBFA",
  primary: "#1C6B38", // Deep forest green
  textPrimary: "#1F3523",
  textSecondary: "#526D57",
  border: "#DCE5D1",
  white: "#FFFFFF",
  inactive: "#99AFA0",

  brandLight: "#E8EFE5",
  success: "#4CAF50",
  warningText: "#A32B2B",
  warningBg: "#FCEAEA",
  healthyText: "#257A3A",
  healthyBg: "#EAF5EC",
  infoText: "#2D7091",
  infoBg: "#EBF5FB",
  criticalText: "#B65814",
  criticalBg: "#FDF1E6",
  soilText: "#6F5035",
  soilBg: "#F2EBE5",
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

const RADIUS = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 9999,
  full: 9999,
};

const SHADOWS = {
  sm: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5.46,
    elevation: 9,
  },
};

export { COLORS, SPACING, RADIUS, SHADOWS };
