import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

// Dark-first, neutral blue-slate. Tokens are CSS variables (see src/index.css)
// so shadcn primitives and app code share one palette. No orange, no gradients.
const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        success: 'hsl(var(--success))',
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        // asn1click brand aurora (exact palette from Lovable's asn1click.login) — /login brand page only.
        'brand-1': 'oklch(0.78 0.28 150 / <alpha-value>)',
        'brand-2': 'oklch(0.88 0.26 135 / <alpha-value>)',
        'brand-3': 'oklch(0.78 0.22 185 / <alpha-value>)',
        'brand-4': 'oklch(0.85 0.24 110 / <alpha-value>)',
        night: 'oklch(0.14 0.04 150)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Roboto Mono"', 'monospace'],
      },
      boxShadow: {
        glow: '0 10px 40px -10px color-mix(in oklab, oklch(0.88 0.26 135) 50%, transparent)',
      },
      keyframes: {
        aurora1: {
          '0%,100%': { transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: '0.85' },
          '25%': { transform: 'translate(18vw,8vh) scale(1.2) rotate(20deg)', opacity: '1' },
          '50%': { transform: 'translate(10vw,22vh) scale(0.95) rotate(-10deg)', opacity: '0.7' },
          '75%': { transform: 'translate(-8vw,12vh) scale(1.15) rotate(15deg)', opacity: '0.95' },
        },
        aurora2: {
          '0%,100%': { transform: 'translate(0,0) scale(1.1) rotate(0deg)', opacity: '0.8' },
          '33%': { transform: 'translate(-16vw,14vh) scale(0.9) rotate(-25deg)', opacity: '1' },
          '66%': { transform: 'translate(-6vw,-10vh) scale(1.25) rotate(18deg)', opacity: '0.75' },
        },
        aurora3: {
          '0%,100%': { transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: '0.9' },
          '30%': { transform: 'translate(14vw,-14vh) scale(1.25) rotate(22deg)', opacity: '1' },
          '60%': { transform: 'translate(-10vw,-6vh) scale(0.95) rotate(-18deg)', opacity: '0.7' },
        },
        aurora4: {
          '0%,100%': { transform: 'translate(-50%,-50%) scale(1) rotate(0deg)', opacity: '0.7' },
          '25%': { transform: 'translate(-35%,-60%) scale(1.3) rotate(30deg)', opacity: '0.95' },
          '50%': { transform: 'translate(-55%,-40%) scale(0.9) rotate(-20deg)', opacity: '0.6' },
          '75%': { transform: 'translate(-65%,-55%) scale(1.2) rotate(15deg)', opacity: '0.9' },
        },
      },
      animation: {
        'aurora-1': 'aurora1 22s ease-in-out infinite',
        'aurora-2': 'aurora2 28s ease-in-out infinite',
        'aurora-3': 'aurora3 32s ease-in-out infinite',
        'aurora-4': 'aurora4 36s ease-in-out infinite',
      },
    },
  },
  plugins: [animate],
};

export default config;
