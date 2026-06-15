module.exports = {
  darkMode: 'class',
  content: ['./*.html', './**/*.js', '!./node_modules/**'],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#1e2433',
        accent: '#f59e0b',
        background: '#ecf0f1',
        textColor: '#333',
        border: '#bdc3c7',
        success: '#22c55e',
        error: '#ef4444',
        // Blue-slate ramp matching the maintenance page. Light shades keep
        // light mode working; dark shades (700-900) drive the dark surfaces.
        gray: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#232a3a', // nested panels (dark:bg-gray-700)
          800: '#1a1f2c', // main card / tooltips (dark:bg-gray-800, bg-gray-800)
          900: '#0f1117', // app background (dark:bg-gray-900)
          950: '#0a0c12',
        },
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
        'mono': ['Roboto Mono', 'monospace'],
        'display': ['Montserrat', 'sans-serif'],
      }
    }
  }
}
