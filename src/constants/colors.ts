// Global color constants
export const colors = {
  // Primary colors
  primary: "#000000",
  primaryLight: "#333333",
  primaryDark: "#000000",

  // Secondary colors
  secondary: "#ffffff",
  secondaryLight: "#f5f5f5",
  secondaryDark: "#cccccc",

  // Background colors
  background: "#ffffff",
  backgroundDark: "#f0f0f0",
  backgroundLight: "#fafafa",

  // Text colors
  text: "#000000",
  textLight: "#666666",
  textDark: "#333333",
  textSecondary: "#888888",
  textDisabled: "#999999",

  // Border colors
  border: "#cccccc",
  borderLight: "#e0e0e0",
  borderDark: "#999999",

  // Status colors
  success: "#4CAF50",
  error: "#f44336",
  warning: "#ff9800",
  info: "#2196F3",

  // Overlay colors
  overlay: "rgba(0,0,0,0.5)",
  overlayLight: "rgba(0,0,0,0.3)",
  overlayDark: "rgba(0,0,0,0.7)",
  overlayWhite: "rgba(255,255,255,0.9)",
  overlayWhiteLight: "rgba(255,255,255,0.3)",

  // Loading colors
  loading: "#cccccc",
  loadingBackground: "rgba(0,0,0,0.5)",

  // Button colors
  buttonPrimary: "#000000",
  buttonSecondary: "#ffffff",
  buttonDisabled: "#cccccc",

  // Input colors
  inputBackground: "#ffffff",
  inputBorder: "#cccccc",
  inputDisabled: "#f0f0f0",
  inputText: "#000000",
  inputPlaceholder: "#999999",

  // Status tag colors
  statusActive: {
    bg: "#E8F5E8",
    text: "#2E7D32",
  },
  statusPaused: {
    bg: "#FFF3E0",
    text: "#F57C00",
  },
  statusCancelled: {
    bg: "#FFEBEE",
    text: "#D32F2F",
  },
  statusDefault: {
    bg: "#F5F5F5",
    text: "#666666",
  },

  // Category tag colors
  categoryProductivity: {
    bg: "#E3F2FD",
    text: "#1976D2",
  },
  categoryEntertainment: {
    bg: "#F3E5F5",
    text: "#7B1FA2",
  },
  categoryUtilities: {
    bg: "#E8F5E8",
    text: "#388E3C",
  },
  categoryDefault: {
    bg: "#F5F5F5",
    text: "#666666",
  },
} as const;

export type ColorKey = keyof typeof colors;
