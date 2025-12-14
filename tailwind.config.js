/** @type {import('tailwindcss').Config} */
module.exports = {
  // Specify which files to scan for Tailwind classes
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
  ],
  
  // Use NativeWind preset for React Native compatibility
  presets: [require("nativewind/preset")],
  
  theme: {
    extend: {
      // =================================================================
      // COLOR PALETTE
      // Modern, event-focused design with vibrant primary colors
      // =================================================================
      colors: {
        // Primary Brand Color - Deep Indigo/Electric Blue
        // USE: Primary buttons, links, key UI elements, active states
        primary: {
          50: '#eef2ff',   // Lightest - backgrounds, hover states
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#4F46E5',  // Main brand color - primary actions
          600: '#4338ca',  // Darker - pressed states
          700: '#3730a3',
          800: '#312e81',
          900: '#1e1b4b',  // Darkest - text on light backgrounds
          950: '#0f0d27',
        },
        
        // Secondary/Accent Color - Vibrant Teal
        // USE: Accents, secondary buttons, highlights, success indicators
        secondary: {
          50: '#f0fdfa',   // Lightest
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14B8A6',  // Main accent color
          600: '#0d9488',  // Darker
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',  // Darkest
          950: '#042f2e',
        },
        
        // Success Colors - Green
        // USE: Confirmation messages, success states, positive indicators
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',  // Main success color
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        
        // Warning Colors - Amber/Yellow
        // USE: Warning messages, caution indicators, pending states
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',  // Main warning color
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        
        // Error/Danger Colors - Red
        // USE: Error messages, destructive actions, critical alerts
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',  // Main error color
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        
        // Neutral Colors - Grays
        // USE: Text, borders, backgrounds, disabled states
        gray: {
          50: '#F9FAFB',   // Very light gray - main background
          100: '#f3f4f6',  // Subtle backgrounds
          200: '#e5e7eb',  // Borders, dividers
          300: '#d1d5db',  // Disabled backgrounds
          400: '#9ca3af',  // Placeholder text
          500: '#6b7280',  // Secondary text
          600: '#4b5563',  // Primary text
          700: '#374151',  // Headings
          800: '#1f2937',  // Dark headings
          900: '#111827',  // Darkest text
          950: '#030712',  // Near black
        },
        
        // Semantic Color Aliases
        // USE: Direct access to commonly used colors
        background: {
          DEFAULT: '#F9FAFB',  // Main app background
          card: '#FFFFFF',     // Card/surface backgrounds
          elevated: '#FFFFFF', // Elevated surfaces
        },
        
        text: {
          primary: '#1f2937',    // Main text color (gray-800)
          secondary: '#6b7280',  // Secondary/helper text (gray-500)
          tertiary: '#9ca3af',   // Tertiary/placeholder text (gray-400)
          inverse: '#ffffff',    // Text on dark backgrounds
        },
        
        border: {
          DEFAULT: '#e5e7eb',    // Standard borders (gray-200)
          light: '#f3f4f6',      // Lighter borders (gray-100)
          dark: '#d1d5db',       // Darker borders (gray-300)
        },
      },
      
      // =================================================================
      // SPACING SCALE
      // Generous, consistent spacing for white space and clarity
      // All values in pixels for precise control
      // =================================================================
      spacing: {
        // Micro spacing (< 8px) - fine adjustments
        '0.5': '2px',
        '1': '4px',
        '1.5': '6px',
        
        // Base spacing (8px increments) - most common usage
        '2': '8px',      // 0.5rem - tight spacing
        '2.5': '10px',
        '3': '12px',     // 0.75rem - small spacing
        '3.5': '14px',
        '4': '16px',     // 1rem - base unit
        '5': '20px',     // 1.25rem
        '6': '24px',     // 1.5rem - medium spacing
        '7': '28px',
        '8': '32px',     // 2rem - large spacing
        '9': '36px',
        '10': '40px',    // 2.5rem - extra large
        
        // Large spacing - generous white space
        '11': '44px',    // Minimum touch target size
        '12': '48px',    // 3rem
        '14': '56px',    // 3.5rem
        '16': '64px',    // 4rem - section spacing
        '18': '72px',
        '20': '80px',    // 5rem
        '24': '96px',    // 6rem - major section breaks
        '28': '112px',
        '32': '128px',   // 8rem - hero spacing
        '36': '144px',
        '40': '160px',   // 10rem
        '48': '192px',   // 12rem
        '56': '224px',
        '64': '256px',   // 16rem - very large spacing
      },
      
      // =================================================================
      // TYPOGRAPHY
      // Custom font sizes, weights, and line heights
      // Format: [fontSize, { lineHeight, letterSpacing, fontWeight }]
      // =================================================================
      fontSize: {
        // Extra small sizes - captions, badges, metadata
        '2xs': ['10px', { 
          lineHeight: '14px',
          letterSpacing: '0.01em',
        }],
        'xs': ['12px', { 
          lineHeight: '16px',
          letterSpacing: '0.01em',
        }],
        
        // Small size - helper text, labels
        'sm': ['14px', { 
          lineHeight: '20px',
          letterSpacing: '0',
        }],
        
        // Base size - body text (DEFAULT)
        'base': ['16px', { 
          lineHeight: '24px',
          letterSpacing: '0',
        }],
        
        // Large size - emphasized body text
        'lg': ['18px', { 
          lineHeight: '28px',
          letterSpacing: '-0.01em',
        }],
        
        // Heading sizes
        // H5 - Small headings, card titles
        'xl': ['20px', { 
          lineHeight: '28px',
          letterSpacing: '-0.01em',
          fontWeight: '600',
        }],
        
        // H4 - Section headings
        '2xl': ['24px', { 
          lineHeight: '32px',
          letterSpacing: '-0.02em',
          fontWeight: '700',
        }],
        
        // H3 - Subsection headings
        '3xl': ['30px', { 
          lineHeight: '36px',
          letterSpacing: '-0.02em',
          fontWeight: '700',
        }],
        
        // H2 - Page headings
        '4xl': ['36px', { 
          lineHeight: '44px',
          letterSpacing: '-0.02em',
          fontWeight: '800',
        }],
        
        // H1 - Hero headings
        '5xl': ['48px', { 
          lineHeight: '56px',
          letterSpacing: '-0.03em',
          fontWeight: '800',
        }],
        
        // Display - Extra large hero text
        '6xl': ['60px', { 
          lineHeight: '68px',
          letterSpacing: '-0.03em',
          fontWeight: '900',
        }],
        
        '7xl': ['72px', { 
          lineHeight: '80px',
          letterSpacing: '-0.04em',
          fontWeight: '900',
        }],
      },
      
      // Font weights - semantic naming
      fontWeight: {
        thin: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },
      
      // =================================================================
      // BORDER RADIUS
      // Consistent rounding for buttons, cards, and UI elements
      // =================================================================
      borderRadius: {
        'none': '0px',
        'sm': '4px',      // Subtle rounding - inputs, small buttons
        'DEFAULT': '8px', // Standard rounding - cards, buttons
        'md': '12px',     // Medium rounding - larger cards
        'lg': '16px',     // Large rounding - modals, major elements
        'xl': '20px',     // Extra large
        '2xl': '24px',    // Very rounded
        '3xl': '32px',    // Extremely rounded
        'full': '9999px', // Fully rounded - pills, circles
      },
      
      // =================================================================
      // SHADOWS
      // Elevation system for depth and hierarchy
      // Note: Shadows work differently on React Native vs Web
      // These are optimized for iOS/Android elevation
      // =================================================================
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'none': 'none',
      },
      
      // =================================================================
      // OPACITY
      // Standard opacity values for overlays, disabled states
      // =================================================================
      opacity: {
        '0': '0',
        '5': '0.05',
        '10': '0.1',
        '20': '0.2',
        '25': '0.25',
        '30': '0.3',
        '40': '0.4',
        '50': '0.5',
        '60': '0.6',
        '70': '0.7',
        '75': '0.75',
        '80': '0.8',
        '90': '0.9',
        '95': '0.95',
        '100': '1',
      },
      
      // =================================================================
      // ANIMATIONS
      // Custom animation utilities
      // =================================================================
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'spin-fast': 'spin 0.5s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'fade-in': 'fadeIn 0.3s ease-in',
        'fade-out': 'fadeOut 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      
      // =================================================================
      // Z-INDEX SCALE
      // Layering system for modals, dropdowns, tooltips
      // =================================================================
      zIndex: {
        '0': '0',
        '10': '10',
        '20': '20',
        '30': '30',
        '40': '40',
        '50': '50',      // Dropdowns
        'dropdown': '50',
        'sticky': '100',  // Sticky headers
        'fixed': '200',   // Fixed elements
        'modal': '300',   // Modal overlays
        'popover': '400', // Popovers, tooltips
        'toast': '500',   // Toast notifications
        'max': '9999',    // Maximum z-index
      },
      
      // =================================================================
      // MINIMUM DIMENSIONS
      // Accessibility - minimum touch targets
      // =================================================================
      minHeight: {
        'touch': '44px',  // iOS minimum touch target
        'button': '44px', // Minimum button height
      },
      
      minWidth: {
        'touch': '44px',  // iOS minimum touch target
        'button': '88px', // Minimum button width
      },
    },
  },
  
  plugins: [],
}
