/** @type {import('tailwindcss').Config} */
const config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary colors - updated to match STYLE_GUIDE.md and CSS
        'off-white': '#F8F8F8',
        'off-black': '#1A1A1A',
        'accent-black': '#000000',
        'brutal-gray': '#222222', // Updated from #333333 to match CSS
        'light-gray': '#CCCCCC', // Updated from #AAAAAA to match STYLE_GUIDE.md
        'destructive-red': '#FF0000', // Updated from #D32F2F to match STYLE_GUIDE.md and CSS

        // Semantic colors
        'success-green': '#16a34a', // Toast success
        'info-blue': '#2563eb', // Toast info

        // Accent colors (keeping existing)
        'accent-red': '#FF4136',
        'accent-yellow': '#FFDC00',
        'accent-green': '#2ECC40',
        'accent-blue': '#0074D9',
        'accent-orange': '#FF851B',
        'accent-purple': '#B10DC9',

        // Google brand colors (for reference/documentation - SVG colors remain hardcoded for brand compliance)
        'google-blue': '#4285F4',
        'google-green': '#34A853',
        'google-yellow': '#FBBC05',
        'google-red': '#EA4335',
        'google-focus-blue': 'rgba(66, 133, 244, 0.5)', // For focus rings
      },
      fontFamily: {
        sans: ['"Inter", sans-serif'],
        mono: ['"Roboto Mono", monospace'],
      },
      spacing: {
        // Sidebar dimensions
        'sidebar-collapsed-mobile': '72px',
        'sidebar-collapsed': '80px',
        'sidebar-expanded-mobile': '280px',
        'sidebar-expanded': '320px',

        // Accessibility and UX requirements
        'min-touch-target': '44px', // Accessibility minimum
        'min-button-height': '48px', // Google UX requirement

        // Design-specific spacing
        'grid-pattern-size': '28px',
        'button-min-width': '240px', // Google Sign-In
      },
      borderRadius: {
        'radius-modal': '1.5rem',
        'radius-modal-large': '1.75rem',
        'radius-code': '3px',
        'radius-toast': '2px',
        'radius-button': '0', // Brutalist - sharp corners
      },
      zIndex: {
        'z-toast': '60',
        'z-modal': '60', // Base modal z-index
        'z-modal-overlay': '70', // For modals that appear above other modals (e.g., ConfirmationModal)
        'z-dropdown': '50',
        'z-tooltip': '9999',
        'z-export-menu': '9999',
        'z-export-button': '100',
        'z-bulk-action': '40',
      },
      boxShadow: {
        // Brutalist shadows - using theme() to reference color tokens
        brutal: '4px 4px 0px theme(colors.off-black)',
        'brutal-dark': '4px 4px 0px theme(colors.off-white)',
        'brutalist-reduced': '2px 2px 0px theme(colors.off-black)',
        'brutalist-dark-reduced': '2px 2px 0px theme(colors.off-white)',

        // Component-specific shadows
        'bulk-action': '0 -4px 8px rgba(0, 0, 0, 0.1)',
        'bulk-action-dark': '0 -4px 8px rgba(255, 255, 255, 0.1)',
        toast: '6px 6px 0 var(--toast-border)', // References CSS variable
      },
      letterSpacing: {
        tight: '0.08em',
        normal: '0.12em',
        wide: '0.18em',
        wider: '0.2em',
        widest: '0.22em',
        'modal-title': '0.25em', // For modal titles
        heading: '0.35em', // For headings
        extreme: '0.24em',
        ultra: '0.26em',
        google: '0.2px', // Google Sign-In (note: uses px not em)
      },
      transitionDuration: {
        fast: '100ms',
        normal: '150ms',
        medium: '200ms',
        slow: '250ms',
        layout: '300ms',
      },
      borderWidth: {
        3: '3px',
        5: '5px',
        6: '6px',
      },
    },
  },
  plugins: [],
};

// Export breakpoints for JavaScript use (e.g., in useSidebarCollapse.ts)
config.breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
};

module.exports = config;
