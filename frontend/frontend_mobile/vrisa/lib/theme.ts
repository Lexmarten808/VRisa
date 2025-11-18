export const theme = {
  colors: {
    background: '#f0f4f8',
    surface: '#ffffff',
    primary: '#0d6efd',
    primaryDark: '#1e3a8a',
    border: '#e2e8f0',
    muted: '#64748b',
    text: '#1e293b',
    success: '#16a34a',
    warning: '#f59e0b',
    danger: '#dc2626',
    critical: '#7f1d1d'
  },
  spacing: (n: number) => n * 4,
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24
  },
  shadow: {
    card: {
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
      elevation: 3
    }
  }
};

export const statusPalette: Record<string, { stroke: string }> = {
  good: { stroke: '#16a34a' },
  moderate: { stroke: '#f59e0b' },
  unhealthy: { stroke: '#dc2626' },
  critical: { stroke: '#7f1d1d' }
};
