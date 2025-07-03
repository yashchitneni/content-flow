/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Use class-based dark mode
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary colors
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
        
        // Semantic colors
        success: {
          50: '#D1FAE5',
          100: '#A7F3D0',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
        },
        warning: {
          50: '#FEF3C7',
          100: '#FDE68A',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        },
        error: {
          50: '#FEE2E2',
          100: '#FECACA',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
        },
        info: {
          50: '#DBEAFE',
          100: '#BFDBFE',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
        },
        
        // Premium dark theme colors
        dark: {
          bg: {
            primary: '#0d0e14',
            secondary: '#1a1b26',
            tertiary: '#242530',
            hover: '#2a2b38',
            border: '#2a2b38',
            elevated: '#242530',
            borderSecondary: '#1f2029',
          },
          text: {
            primary: '#e4e6eb',
            secondary: '#a8b2d1',
            tertiary: '#64748b',
            disabled: '#525966',
            muted: '#6b7785',
          },
          states: {
            hover: 'rgba(255, 255, 255, 0.05)',
            pressed: 'rgba(255, 255, 255, 0.08)',
            focus: 'rgba(0, 102, 255, 0.4)',
            selected: 'rgba(0, 102, 255, 0.2)',
            glow: 'rgba(107, 70, 193, 0.5)',
            glowIntense: 'rgba(107, 70, 193, 0.7)',
          },
          glass: {
            light: 'rgba(255, 255, 255, 0.1)',
            dark: 'rgba(0, 0, 0, 0.2)',
            ultra: 'rgba(13, 14, 20, 0.7)',
            border: 'rgba(255, 255, 255, 0.1)',
            borderHover: 'rgba(255, 255, 255, 0.2)',
          },
        },
        
        // Light theme colors
        light: {
          bg: {
            primary: '#FFFFFF',
            secondary: '#F9FAFB',
            tertiary: '#F3F4F6',
            hover: '#E5E7EB',
            border: '#D1D5DB',
            elevated: '#FFFFFF',
          },
          text: {
            primary: '#111827',
            secondary: '#374151',
            tertiary: '#6B7280',
            disabled: '#9CA3AF',
            muted: '#D1D5DB',
          },
          states: {
            hover: 'rgba(0, 0, 0, 0.05)',
            pressed: 'rgba(0, 0, 0, 0.08)',
            focus: 'rgba(0, 102, 255, 0.2)',
            selected: 'rgba(0, 102, 255, 0.1)',
          },
        },
        
        // Legacy gray for compatibility
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
      
      // CSS Variables for dynamic theming
      backgroundColor: {
        'theme-primary': 'var(--bg-primary)',
        'theme-secondary': 'var(--bg-secondary)',
        'theme-tertiary': 'var(--bg-tertiary)',
        'theme-hover': 'var(--bg-hover)',
        'theme-elevated': 'var(--bg-elevated)',
      },
      
      textColor: {
        'theme-primary': 'var(--text-primary)',
        'theme-secondary': 'var(--text-secondary)',
        'theme-tertiary': 'var(--text-tertiary)',
        'theme-disabled': 'var(--text-disabled)',
        'theme-muted': 'var(--text-muted)',
      },
      
      borderColor: {
        'theme-border': 'var(--border-color)',
      },
      
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'monospace'],
      },
      fontSize: {
        xs: ['12px', '16px'],
        sm: ['14px', '20px'],
        base: ['16px', '24px'],
        lg: ['18px', '28px'],
        xl: ['20px', '30px'],
        '2xl': ['24px', '32px'],
        '3xl': ['30px', '38px'],
        '4xl': ['36px', '44px'],
      },
      spacing: {
        0: '0px',
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        8: '32px',
        10: '40px',
        12: '48px',
        16: '64px',
        modal: '32px',
      },
      borderRadius: {
        none: '0px',
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        full: '9999px',
      },
      backgroundImage: {
        // Gradient presets
        'gradient-primary': 'linear-gradient(135deg, #6B46C1 0%, #0066FF 100%)',
        'gradient-dark': 'radial-gradient(circle at 20% 50%, #6B46C1 0%, transparent 50%)',
        'gradient-surface': 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%)',
        'gradient-glow': 'radial-gradient(circle at 50% 50%, rgba(107,70,193,0.4) 0%, transparent 70%)',
        'gradient-mesh': 'radial-gradient(at 27% 37%, hsla(215, 98%, 61%, 0.15) 0px, transparent 50%), radial-gradient(at 97% 21%, hsla(125, 98%, 72%, 0.15) 0px, transparent 50%)',
        'gradient-text': 'linear-gradient(135deg, #e4e6eb 0%, #a8b2d1 100%)',
        'gradient-button-primary': 'linear-gradient(135deg, #6B46C1 0%, #0066FF 100%)',
        'gradient-button-secondary': 'linear-gradient(135deg, #553C9A 0%, #6B46C1 100%)',
        'gradient-button-hover': 'linear-gradient(135deg, #7c3aed 0%, #3385FF 100%)',
      },
      
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
      },
      
      boxShadow: {
        // Enhanced shadows with glow effects
        sm: '0 1px 2px rgba(0,0,0,0.05)',
        DEFAULT: '0 4px 6px rgba(0,0,0,0.1)',
        md: '0 8px 16px rgba(0,0,0,0.15)',
        lg: '0 16px 32px rgba(0,0,0,0.2)',
        xl: '0 24px 48px rgba(0,0,0,0.25)',
        
        // Glow effects
        'glow': '0 0 40px rgba(107,70,193,0.3)',
        'glow-intense': '0 0 60px rgba(107,70,193,0.5)',
        'glow-blue': '0 0 40px rgba(0,102,255,0.3)',
        'glow-subtle': '0 0 20px rgba(107,70,193,0.2)',
        
        // Inner shadows
        'inner-subtle': 'inset 0 2px 4px rgba(0,0,0,0.06)',
        'inner': 'inset 0 2px 4px rgba(0,0,0,0.2)',
        'inner-glow': 'inset 0 0 20px rgba(107,70,193,0.1)',
        
        // Glass effects
        'glass': '0 8px 32px rgba(0,0,0,0.1), inset 0 2px 0 rgba(255,255,255,0.1)',
        'elevation': '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
        
        // Dark mode optimized
        'dark-sm': '0 2px 4px rgba(0,0,0,0.3)',
        'dark-md': '0 10px 20px rgba(0,0,0,0.4)',
        'dark-lg': '0 20px 40px rgba(0,0,0,0.5)',
      },
      transitionDuration: {
        instant: '75ms',
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
        xl: '700ms',
      },
      
      transitionTimingFunction: {
        'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'out': 'cubic-bezier(0, 0, 0.2, 1)',
        'in': 'cubic-bezier(0.4, 0, 1, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.6, 1)',
      },
      
      animation: {
        'fade-in': 'fadeIn 300ms ease-out',
        'slide-up': 'slideUp 300ms ease-out',
        'theme-transition': 'themeTransition 200ms ease-out',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      
      keyframes: {
        fadeIn: {
          'from': { opacity: '0', transform: 'translateY(10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        themeTransition: {
          '0%': { opacity: '0.8' },
          '100%': { opacity: '1' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(107,70,193,0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(107,70,193,0.8)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      
      // Transform utilities for micro-interactions
      scale: {
        '98': '0.98',
        '102': '1.02',
      },
    },
  },
  plugins: [],
}