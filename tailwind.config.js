/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {

      // ── FONTES ──────────────────────────────────────────────────────────────
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans:    ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-mono)', 'monospace'],
      },

      // ── CORES ───────────────────────────────────────────────────────────────
      colors: {

        // Primário — Verde Sálvia
        primary: {
          50:  '#f2f9f5',
          100: '#e0f2e9',
          200: '#c2e5d4',
          300: '#96d0b5',
          400: '#5cb490',
          500: '#359872',
          600: '#237a5a',   // DEFAULT
          700: '#1c6049',
          800: '#174d3c',
          900: '#133f32',
          950: '#092318',
          DEFAULT:    '#237a5a',
          foreground: '#ffffff',
          light:      '#e0f2e9',
        },

        // Acento — Âmbar Mel
        accent: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',   // DEFAULT
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          DEFAULT:    '#f59e0b',
          foreground: '#1c1008',
          light:      '#fef3c7',
        },

        // Neutros quentes
        neutral: {
          0:   '#ffffff',
          50:  '#faf8f4',
          100: '#f4f0ea',
          200: '#e8e2d9',
          300: '#d6ccbf',
          400: '#b8ac9c',
          500: '#968a78',
          600: '#786c5c',
          700: '#5e5447',
          800: '#3e3830',
          900: '#26211b',
          950: '#151210',
        },

        // Semânticas
        success: { DEFAULT: '#16a34a', light: '#dcfce7', dark: '#166534', foreground: '#166534' },
        warning: { DEFAULT: '#d97706', light: '#fef3c7', dark: '#92400e', foreground: '#92400e' },
        danger:  { DEFAULT: '#dc2626', light: '#fee2e2', dark: '#991b1b', foreground: '#991b1b' },
        info:    { DEFAULT: '#0891b2', light: '#e0f7fa', dark: '#0e7490', foreground: '#0e7490' },

        // shadcn/ui compatível (CSS vars)
        background:  'hsl(var(--background))',
        foreground:  'hsl(var(--foreground))',
        card:        { DEFAULT: 'hsl(var(--card))',        foreground: 'hsl(var(--card-foreground))' },
        popover:     { DEFAULT: 'hsl(var(--popover))',     foreground: 'hsl(var(--popover-foreground))' },
        secondary:   { DEFAULT: 'hsl(var(--secondary))',   foreground: 'hsl(var(--secondary-foreground))' },
        muted:       { DEFAULT: 'hsl(var(--muted))',       foreground: 'hsl(var(--muted-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        border:      'hsl(var(--border))',
        input:       'hsl(var(--input))',
        ring:        'hsl(var(--ring))',
      },

      // ── RAIOS ───────────────────────────────────────────────────────────────
      borderRadius: {
        none: '0',
        xs:   '0.25rem',
        sm:   '0.375rem',
        DEFAULT: '0.625rem',
        md:   '0.625rem',
        lg:   '0.875rem',
        xl:   '1.125rem',
        '2xl':'1.5rem',
        '3xl':'2rem',
        full: '9999px',
      },

      // ── SOMBRAS ─────────────────────────────────────────────────────────────
      boxShadow: {
        xs:    '0 1px 2px rgba(28,96,73,0.06)',
        sm:    '0 1px 4px rgba(28,96,73,0.08), 0 1px 2px rgba(28,96,73,0.04)',
        soft:  '0 2px 12px rgba(28,96,73,0.08)',
        md:    '0 4px 16px rgba(28,96,73,0.10)',
        float: '0 8px 28px rgba(28,96,73,0.12)',
        lg:    '0 12px 36px rgba(28,96,73,0.13)',
        modal: '0 20px 56px rgba(28,96,73,0.16)',
        glow:  '0 0 0 3px rgba(35,122,90,0.22)',
        'glow-accent':'0 0 0 3px rgba(245,158,11,0.28)',
        'glow-danger': '0 0 0 3px rgba(220,38,38,0.22)',
        'green-glow':  '0 4px 20px rgba(35,122,90,0.28)',
        'amber-glow':  '0 4px 20px rgba(245,158,11,0.32)',
        inset: 'inset 0 1px 3px rgba(28,96,73,0.06)',
      },

      // ── ANIMAÇÕES ───────────────────────────────────────────────────────────
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-fast': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'slide-in': {
          from: { opacity: '0', transform: 'translateX(-12px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
        'shimmer': {
          from: { backgroundPosition: '200% 0' },
          to:   { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'accordion-up':   'accordion-up 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in':        'fade-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in-fast':   'fade-in-fast 0.15s ease',
        'slide-in':       'slide-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up':       'slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in':       'scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'spin-slow':      'spin-slow 2s linear infinite',
        'pulse-soft':     'pulse-soft 2s ease-in-out infinite',
        'shimmer':        'shimmer 2s linear infinite',
      },

      // ── TAMANHOS ────────────────────────────────────────────────────────────
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        26: '6.5rem',
        30: '7.5rem',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
