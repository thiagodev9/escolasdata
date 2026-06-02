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
      fontFamily: {
        sans: ['Nunito', 'Nunito Sans', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          container: '#3B82F6',
          foreground: '#ffffff',
          fixed: '#DBEAFE',
          'fixed-dim': '#BFDBFE',
        },
        secondary: {
          DEFAULT: '#5B8EF5',
          container: '#BFDBFE',
          foreground: '#ffffff',
        },
        background: '#F2F6FF',
        navy:   '#FFFFFF',
        border: '#DDE5F5',
        input:  '#CBD5E1',
        ring:   '#2563EB',
        foreground:  '#111827',
        muted:       { DEFAULT: '#EEF2FA', foreground: '#64748B' },
        accent:      { DEFAULT: '#F97316', foreground: '#ffffff' },
        destructive: { DEFAULT: '#E53935', foreground: '#ffffff' },
        card:        { DEFAULT: '#ffffff', foreground: '#111827' },
        popover:     { DEFAULT: '#ffffff', foreground: '#111827' },
      },
      borderRadius: {
        sm:      '0.375rem',
        DEFAULT: '0.875rem',
        md:      '1rem',
        lg:      '1.25rem',
        xl:      '1.5rem',
        '2xl':   '2rem',
        full:    '9999px',
      },
      boxShadow: {
        soft:         '0 2px 12px 0 rgba(37, 99, 235, 0.08)',
        float:        '0 8px 24px 0 rgba(37, 99, 235, 0.12)',
        modal:        '0 16px 48px 0 rgba(37, 99, 235, 0.15)',
        glow:         '0 0 0 3px rgba(37, 99, 235, 0.15)',
        'orange-glow':'0 4px 16px 0 rgba(249, 115, 22, 0.25)',
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up':   { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        'fade-in':  { from: { opacity: '0', transform: 'translateY(8px)' },  to: { opacity: '1', transform: 'translateY(0)' } },
        'slide-in': { from: { opacity: '0', transform: 'translateX(-12px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        'fade-in':  'fade-in 0.3s ease-out',
        'slide-in': 'slide-in 0.25s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
