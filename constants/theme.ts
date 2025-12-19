export const colors = {
  primary: '#FF6B35',
  secondary: '#F7931E',
  dark: '#1A1A2E',
  darker: '#0F0F1E',
  gray: '#34495E',
  lightGray: '#95A5A6',
  white: '#FFFFFF',
  success: '#27AE60',
  danger: '#E74C3C',
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: colors.white,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    color: colors.white,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.white,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: colors.lightGray,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: colors.lightGray,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
