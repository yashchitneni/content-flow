export const colors = {
  primary: {
    50: '#E6F0FF',
    100: '#E6F0FF',
    400: '#3385FF',
    500: '#0066FF',
    600: '#0052CC',
    700: '#0041A3',
  },
  secondary: {
    100: '#F3F0FF',
    500: '#6B46C1',
    600: '#553C9A',
  },
  semantic: {
    success: {
      50: '#D1FAE5',
      100: '#A7F3D0',
      500: '#10B981',
      600: '#059669',
    },
    warning: {
      50: '#FEF3C7',
      100: '#FDE68A',
      500: '#F59E0B',
      600: '#D97706',
    },
    error: {
      50: '#FEE2E2',
      100: '#FECACA',
      500: '#EF4444',
      600: '#DC2626',
    },
    info: {
      50: '#DBEAFE',
      100: '#BFDBFE',
      500: '#3B82F6',
      600: '#2563EB',
    },
  },
  // Flattened semantic colors for direct access
  success: {
    50: '#D1FAE5',
    100: '#A7F3D0',
    500: '#10B981',
    600: '#059669',
  },
  warning: {
    50: '#FEF3C7',
    100: '#FDE68A',
    500: '#F59E0B',
    600: '#D97706',
  },
  error: {
    50: '#FEE2E2',
    100: '#FECACA',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
  },
  info: {
    50: '#DBEAFE',
    100: '#BFDBFE',
    500: '#3B82F6',
    600: '#2563EB',
  },
  // Flattened for direct access
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  white: '#FFFFFF',
  black: '#000000',
  // Keep nested structure for backward compatibility
  neutral: {
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
    white: '#FFFFFF',
    black: '#000000',
  },
} as const

export type Colors = typeof colors