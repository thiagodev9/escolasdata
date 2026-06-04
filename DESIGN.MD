---
name: EduNest Core
colors:
  surface: '#fff8f2'
  surface-dim: '#dfd9d3'
  surface-bright: '#fff8f2'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f9f2ec'
  surface-container: '#f3ede7'
  surface-container-high: '#eee7e1'
  surface-container-highest: '#e8e1dc'
  on-surface: '#1e1b18'
  on-surface-variant: '#434655'
  inverse-surface: '#33302c'
  inverse-on-surface: '#f6f0ea'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#425e91'
  on-secondary: '#ffffff'
  secondary-container: '#a8c4fe'
  on-secondary-container: '#345083'
  tertiary: '#8e3c00'
  on-tertiary: '#ffffff'
  tertiary-container: '#b54e00'
  on-tertiary-container: '#ffece5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#d7e2ff'
  secondary-fixed-dim: '#acc7ff'
  on-secondary-fixed: '#001a40'
  on-secondary-fixed-variant: '#294678'
  tertiary-fixed: '#ffdbca'
  tertiary-fixed-dim: '#ffb690'
  on-tertiary-fixed: '#341100'
  on-tertiary-fixed-variant: '#783200'
  background: '#fff8f2'
  on-background: '#1e1b18'
  surface-variant: '#e8e1dc'
typography:
  display-lg:
    fontFamily: Nunito Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Nunito Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Nunito Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Nunito Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  title-lg:
    fontFamily: Nunito Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Nunito Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Nunito Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Nunito Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  caption:
    fontFamily: Nunito Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style
The design system is built to balance institutional reliability with the nurturing warmth essential to early childhood education. The target audience includes Brazilian school administrators who require efficiency and parents who seek a reassuring, modern connection to their child’s daily life.

The aesthetic follows a **Corporate / Modern** foundation softened by **Friendly Minimalism**. It utilizes generous whitespace to reduce cognitive load for busy staff and parents. The interface should feel organized and "safe," using soft transitions and rounded geometry to evoke a sense of care and accessibility.

## Colors
This design system uses a palette that communicates both authority and energy. 
- **Primary (Institutional Blue):** Used for main actions, active states, and primary branding.
- **Secondary (Navy Blue):** Reserved for the sidebar and high-level navigation to provide a grounded, professional frame.
- **Accent (Solar Orange):** Used sparingly for "delight" moments, notifications, and call-to-actions that require high visibility.
- **Background (Warm Cream):** Replaces clinical whites with a soft, organic tone to reduce eye strain and increase the "welcoming" feel.
- **Neutrals:** Utilize cool greys for text and borders to maintain contrast against the warm background.

## Typography
The design system employs **Nunito Sans** across all levels. Its naturally rounded terminals provide a friendly, approachable character without sacrificing the legibility required for administrative data entry. 

For the Brazilian market, ensure text containers account for Portuguese word lengths, which are often 20-30% longer than English equivalents. Use 'Display' and 'Headline' styles for dashboard overviews and parent-facing greetings, while 'Body' and 'Label' styles prioritize clarity in dense management tables.

## Layout & Spacing
The layout follows a **Fluid Grid** model.
- **Desktop (Admin):** 12-column grid with a fixed 280px sidebar in Navy Blue. Content utilizes a 24px gutter.
- **Mobile (Parents):** Single column with 16px side margins. Navigation is handled via a bottom bar for easy thumb reach.

Spacing follows an 8pt rhythm (4pt for tight components) to ensure visual harmony. Generous padding within cards and around text blocks is mandatory to maintain the "warm and open" feel of the preschool context.

## Elevation & Depth
This design system uses **Ambient Shadows** to create a soft, tactile hierarchy. Shadows should not be harsh or "black"; instead, use the Secondary color (Navy) at very low opacities (4-8%) to tint the shadows, making them feel integrated with the Warm Cream background.

- **Level 0 (Flat):** Main background and layout containers.
- **Level 1 (Soft):** Default state for cards, input fields, and chips. 4px Y-offset, 12px blur.
- **Level 2 (Floating):** Hover states, dropdowns, and navigation bars. 8px Y-offset, 20px blur.
- **Level 3 (Modal):** Dialogs and alerts. 16px Y-offset, 32px blur.

## Shapes
The shape language is consistently **Rounded**. Avoid sharp corners entirely to maintain the "child-safe" and friendly metaphor. 
- **Standard (0.5rem):** Buttons, inputs, and small cards.
- **Large (1rem):** Main content containers and parent-facing feed cards.
- **Full (Pill):** Used for status badges, search bars, and decorative elements.

## Components
- **Buttons:** Primary buttons use Institutional Blue with white text. Secondary buttons use an outline of the primary color. "Add child" or "New Record" buttons can use the Solar Orange accent to stand out. All buttons have a minimum height of 48px for better mobile ergonomics.
- **Cards:** Cards are the primary container. They must feature a white background (not cream) to pop against the page background, with Level 1 shadows and 1rem corner radius.
- **Input Fields:** Use a 1px light border (Primary Blue at 20% opacity). On focus, the border thickens to 2px and gains a soft outer glow.
- **Chips/Badges:** Used for student status (e.g., "Present", "Absent"). Use high-radius (Pill) shapes with low-saturation versions of the status colors for the background.
- **Icons:** Use "Linear" or "Bold" rounded icon sets. Icons should always be accompanied by labels in administrative views to ensure no ambiguity.
- **Sidebar:** Fixed Navy Blue (#1B3A6B) container. Links use a subtle white-to-blue transition on hover, with a Solar Orange vertical indicator for the active state.