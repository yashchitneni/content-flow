export const colors = {
  primary: {
    100: '#E6F0FF',
    400: '#3385FF',
    500: '#0066FF',
    600: '#0052CC',
    700: '#0040A8',
  },
  secondary: {
    100: '#F3F0FF',
    500: '#6B46C1',
    600: '#553C9A',
  },
  semantic: {
    success: {
      500: '#10B981',
    },
    warning: {
      500: '#F59E0B',
    },
    error: {
      100: '#FEE2E2',
      500: '#EF4444',
    },
    info: {
      500: '#3B82F6',
    },
  },
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