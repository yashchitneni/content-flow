export const colors = {
  // Shared accent colors - adjusted for optimal contrast in both themes
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
  
  // Semantic colors - slightly adjusted for dark mode visibility
  success: {
    50: '#D1FAE5',
    100: '#A7F3D0',
    400: '#34D399', // Brighter for dark mode
    500: '#10B981',
    600: '#059669',
  },
  warning: {
    50: '#FEF3C7',
    100: '#FDE68A',
    400: '#FBBF24', // Brighter for dark mode
    500: '#F59E0B',
    600: '#D97706',
  },
  error: {
    50: '#FEE2E2',
    100: '#FECACA',
    400: '#F87171', // Softer for dark mode
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
  },
  info: {
    50: '#DBEAFE',
    100: '#BFDBFE',
    400: '#60A5FA', // Lighter for dark mode
    500: '#3B82F6',
    600: '#2563EB',
  },
  
  // Theme-specific colors
  dark: {
    // Background colors - premium dark theme
    bg: {
      primary: '#0d0e14',    // Main background (deepest)
      secondary: '#1a1b26',  // Content backgrounds
      tertiary: '#242530',   // Elevated surfaces, cards
      hover: '#2a2b38',      // Hover states on dark bg
      border: '#2a2b38',     // Primary borders
      elevated: '#242530',   // Elevated surfaces
      borderSecondary: '#1f2029', // Subtle borders
    },
    // Text colors
    text: {
      primary: '#e4e6eb',    // Primary text on dark
      secondary: '#a8b2d1',  // Secondary text on dark
      tertiary: '#64748b',   // Tertiary/muted text
      disabled: '#525966',   // Disabled state
      muted: '#6b7785',      // Very low emphasis
    },
    // Interactive states
    states: {
      hover: 'rgba(255, 255, 255, 0.05)',
      pressed: 'rgba(255, 255, 255, 0.08)',
      focus: 'rgba(0, 102, 255, 0.4)',
      selected: 'rgba(0, 102, 255, 0.2)',
      glow: 'rgba(107, 70, 193, 0.5)',
      glowIntense: 'rgba(107, 70, 193, 0.7)',
    },
    // Glass effects
    glass: {
      light: 'rgba(255, 255, 255, 0.1)',
      dark: 'rgba(0, 0, 0, 0.2)',
      ultra: 'rgba(13, 14, 20, 0.7)',
      border: 'rgba(255, 255, 255, 0.1)',
      borderHover: 'rgba(255, 255, 255, 0.2)',
    }
  },
  
  light: {
    // Background colors - existing light theme
    bg: {
      primary: '#FFFFFF',    // Main background
      secondary: '#F9FAFB',  // Slightly gray background
      tertiary: '#F3F4F6',   // Gray background
      hover: '#E5E7EB',      // Hover states
      border: '#D1D5DB',     // Borders and dividers
      elevated: '#FFFFFF',   // Elevated elements (same as primary in light)
    },
    // Text colors
    text: {
      primary: '#111827',    // High emphasis
      secondary: '#374151',  // Medium emphasis
      tertiary: '#6B7280',   // Low emphasis
      disabled: '#9CA3AF',   // Disabled state
      muted: '#D1D5DB',      // Very low emphasis
    },
    // Interactive states
    states: {
      hover: 'rgba(0, 0, 0, 0.05)',
      pressed: 'rgba(0, 0, 0, 0.08)',
      focus: 'rgba(0, 102, 255, 0.2)',
      selected: 'rgba(0, 102, 255, 0.1)',
    }
  },
  
  // Legacy color mappings for backward compatibility
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
  
  // Semantic mappings for backward compatibility
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
  
  // Nested structure for backward compatibility
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

// Gradient definitions
export const gradients = {
  primary: 'linear-gradient(135deg, #6B46C1 0%, #0066FF 100%)',
  dark: 'radial-gradient(circle at 20% 50%, #6B46C1 0%, transparent 50%)',
  surface: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%)',
  glow: 'radial-gradient(circle at 50% 50%, rgba(107,70,193,0.4) 0%, transparent 70%)',
  mesh: 'radial-gradient(at 27% 37%, hsla(215, 98%, 61%, 0.15) 0px, transparent 50%), radial-gradient(at 97% 21%, hsla(125, 98%, 72%, 0.15) 0px, transparent 50%)',
  text: 'linear-gradient(135deg, #e4e6eb 0%, #a8b2d1 100%)',
  button: {
    primary: 'linear-gradient(135deg, #6B46C1 0%, #0066FF 100%)',
    secondary: 'linear-gradient(135deg, #553C9A 0%, #6B46C1 100%)',
    hover: 'linear-gradient(135deg, #7c3aed 0%, #3385FF 100%)',
  }
} as const

export type Colors = typeof colors
export type Gradients = typeof gradients