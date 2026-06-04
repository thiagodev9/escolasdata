/**
 * EduNest Design System — Tokens
 *
 * Paleta: Verde Sálvia (primário) + Âmbar Mel (acento)
 * Display: Fraunces (serif variável, quente)
 * Body: Outfit (sans geométrico, legível)
 *
 * Use estes tokens como fonte da verdade.
 * O tailwind.config.js e globals.css derivam daqui.
 */

// ─── CORES ────────────────────────────────────────────────────────────────────

export const colors = {

  /** Verde sálvia — confiança, crescimento, natureza */
  primary: {
    50:  '#f2f9f5',
    100: '#e0f2e9',
    200: '#c2e5d4',
    300: '#96d0b5',
    400: '#5cb490',
    500: '#359872',
    600: '#237a5a',   // ← DEFAULT — botões, links, foco
    700: '#1c6049',   // ← hover
    800: '#174d3c',
    900: '#133f32',
    950: '#092318',
    DEFAULT:     '#237a5a',
    foreground:  '#ffffff',
    light:       '#e0f2e9',
    glow:        'rgba(35,122,90,0.18)',
  },

  /** Âmbar mel — alegria, calor, destaques */
  accent: {
    50:  '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',   // ← DEFAULT
    600: '#d97706',   // ← hover
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    DEFAULT:     '#f59e0b',
    foreground:  '#1c1008',
    light:       '#fef3c7',
    glow:        'rgba(245,158,11,0.28)',
  },

  /** Neutros quentes — sem cinza frio */
  neutral: {
    0:   '#ffffff',
    50:  '#faf8f4',   // background padrão
    100: '#f4f0ea',   // muted background
    200: '#e8e2d9',   // border
    300: '#d6ccbf',   // input border
    400: '#b8ac9c',
    500: '#968a78',
    600: '#786c5c',   // muted text
    700: '#5e5447',
    800: '#3e3830',
    900: '#26211b',   // foreground principal
    950: '#151210',
  },

  /** Semânticas */
  success: { DEFAULT: '#16a34a', light: '#dcfce7', dark: '#166534', fg: '#166534' },
  warning: { DEFAULT: '#d97706', light: '#fef3c7', dark: '#92400e', fg: '#92400e' },
  danger:  { DEFAULT: '#dc2626', light: '#fee2e2', dark: '#991b1b', fg: '#991b1b' },
  info:    { DEFAULT: '#0891b2', light: '#e0f7fa', dark: '#0e7490', fg: '#0e7490' },

} as const

// ─── TIPOGRAFIA ───────────────────────────────────────────────────────────────

export const typography = {

  fontFamily: {
    display: '"Fraunces", Georgia, serif',      // headings, hero, números grandes
    sans:    '"Outfit", system-ui, sans-serif', // body, UI
    mono:    '"JetBrains Mono", monospace',     // code, IDs
  },

  /** Google Fonts URL para importar no layout */
  googleFontsUrl:
    'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;0,9..144,700;0,9..144,900;1,9..144,400;1,9..144,700&family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap',

  size: {
    '2xs': '0.625rem',   // 10px
    xs:    '0.75rem',    // 12px
    sm:    '0.875rem',   // 14px
    base:  '1rem',       // 16px — body default
    md:    '1.0625rem',  // 17px
    lg:    '1.125rem',   // 18px
    xl:    '1.25rem',    // 20px
    '2xl': '1.5rem',     // 24px
    '3xl': '1.875rem',   // 30px
    '4xl': '2.25rem',    // 36px
    '5xl': '3rem',       // 48px
    '6xl': '3.75rem',    // 60px
    '7xl': '4.5rem',     // 72px
  },

  weight: {
    light:    '300',
    regular:  '400',
    medium:   '500',
    semibold: '600',
    bold:     '700',
    black:    '900',
  },

  lineHeight: {
    none:    '1',
    tight:   '1.2',
    snug:    '1.35',
    normal:  '1.5',
    relaxed: '1.65',
    loose:   '1.8',
  },

  letterSpacing: {
    tighter: '-0.04em',
    tight:   '-0.025em',
    normal:  '0',
    wide:    '0.04em',
    wider:   '0.08em',
    widest:  '0.12em',
  },

} as const

// ─── ESPAÇAMENTO ──────────────────────────────────────────────────────────────

export const spacing = {
  /** Base: 4px (0.25rem) */
  0:    '0',
  px:   '1px',
  0.5:  '0.125rem',
  1:    '0.25rem',
  1.5:  '0.375rem',
  2:    '0.5rem',
  2.5:  '0.625rem',
  3:    '0.75rem',
  3.5:  '0.875rem',
  4:    '1rem',
  5:    '1.25rem',
  6:    '1.5rem',
  7:    '1.75rem',
  8:    '2rem',
  10:   '2.5rem',
  12:   '3rem',
  14:   '3.5rem',
  16:   '4rem',
  18:   '4.5rem',
  20:   '5rem',
  24:   '6rem',
  28:   '7rem',
  32:   '8rem',
} as const

// ─── BORDAS ───────────────────────────────────────────────────────────────────

export const radii = {
  none: '0',
  xs:   '0.25rem',   // 4px  — tags inline
  sm:   '0.375rem',  // 6px  — small badges
  md:   '0.625rem',  // 10px — inputs, buttons
  lg:   '0.875rem',  // 14px — cards pequenos
  xl:   '1.125rem',  // 18px — cards padrão
  '2xl':'1.5rem',    // 24px — cards grandes, modais
  '3xl':'2rem',      // 32px — hero elements
  full: '9999px',    // pills, avatares
} as const

// ─── SOMBRAS ─────────────────────────────────────────────────────────────────

export const shadows = {
  /** Tintadas de verde — coerência com a paleta */
  xs:    '0 1px 2px rgba(28,96,73,0.06)',
  sm:    '0 1px 4px rgba(28,96,73,0.08), 0 1px 2px rgba(28,96,73,0.04)',
  soft:  '0 2px 12px rgba(28,96,73,0.08)',
  md:    '0 4px 16px rgba(28,96,73,0.10)',
  float: '0 8px 28px rgba(28,96,73,0.12)',
  lg:    '0 12px 36px rgba(28,96,73,0.13)',
  modal: '0 20px 56px rgba(28,96,73,0.16)',
  /** Focus rings */
  glow:         '0 0 0 3px rgba(35,122,90,0.22)',
  'glow-accent':'0 0 0 3px rgba(245,158,11,0.28)',
  'glow-danger':'0 0 0 3px rgba(220,38,38,0.22)',
  /** Ambient glow para elementos destacados */
  'green-glow': '0 4px 20px rgba(35,122,90,0.28)',
  'amber-glow': '0 4px 20px rgba(245,158,11,0.32)',
  /** Inset (inputs) */
  inset: 'inset 0 1px 3px rgba(28,96,73,0.06)',
} as const

// ─── ANIMAÇÕES ───────────────────────────────────────────────────────────────

export const animation = {
  duration: {
    instant: '80ms',
    fast:    '150ms',
    normal:  '220ms',
    slow:    '350ms',
    slower:  '500ms',
  },
  easing: {
    default:   'cubic-bezier(0.16, 1, 0.3, 1)',  // spring out
    in:        'cubic-bezier(0.4, 0, 1, 1)',
    out:       'cubic-bezier(0, 0, 0.2, 1)',
    inOut:     'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce:    'cubic-bezier(0.34, 1.56, 0.64, 1)',
    spring:    'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
} as const

// ─── BREAKPOINTS ─────────────────────────────────────────────────────────────

export const breakpoints = {
  sm:  '640px',
  md:  '768px',
  lg:  '1024px',
  xl:  '1280px',
  '2xl': '1536px',
} as const

// ─── Z-INDEX ─────────────────────────────────────────────────────────────────

export const zIndex = {
  base:    0,
  raised:  10,
  dropdown: 100,
  sticky:  200,
  overlay: 300,
  modal:   400,
  popover: 500,
  toast:   600,
  tooltip: 700,
} as const

// ─── TOKENS COMPOSTOS (atalhos) ───────────────────────────────────────────────

/** Tokens semânticos prontos para usar em componentes */
export const tokens = {
  color: {
    brand:           colors.primary[600],
    brandHover:      colors.primary[700],
    brandLight:      colors.primary[100],
    brandText:       colors.primary.foreground,
    accentBrand:     colors.accent[500],
    accentHover:     colors.accent[600],
    accentLight:     colors.accent[100],
    bg:              colors.neutral[50],
    surface:         colors.neutral[0],
    surfaceSubtle:   colors.neutral[100],
    border:          colors.neutral[200],
    borderStrong:    colors.neutral[300],
    text:            colors.neutral[900],
    textSecondary:   colors.neutral[700],
    textMuted:       colors.neutral[600],
    textDisabled:    colors.neutral[400],
  },
  font: {
    display: typography.fontFamily.display,
    body:    typography.fontFamily.sans,
    mono:    typography.fontFamily.mono,
  },
  radius: {
    button:  radii.md,
    input:   radii.md,
    card:    radii.xl,
    badge:   radii.sm,
    pill:    radii.full,
    modal:   radii['2xl'],
  },
  shadow: {
    card:    shadows.soft,
    cardHover: shadows.float,
    button:  shadows.sm,
    modal:   shadows.modal,
    focus:   shadows.glow,
  },
} as const
