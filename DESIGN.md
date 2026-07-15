---
name: Modern SaaS Clarity
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#47464b'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#78767b'
  outline-variant: '#c8c5cb'
  surface-tint: '#5f5e64'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1b1b20'
  on-primary-container: '#85838a'
  inverse-primary: '#c8c5cd'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1f1b14'
  on-tertiary-container: '#8b8379'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e4e1e9'
  primary-fixed-dim: '#c8c5cd'
  on-primary-fixed: '#1b1b20'
  on-primary-fixed-variant: '#47464c'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#ebe1d5'
  tertiary-fixed-dim: '#cfc5ba'
  on-tertiary-fixed: '#1f1b14'
  on-tertiary-fixed-variant: '#4c463d'
  background: '#ffffff'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-padding: 2rem
  gutter: 1.5rem
  card-gap: 1rem
  stack-sm: 0.5rem
  stack-md: 1rem
---

## Brand & Style

The design system is rooted in **Corporate Modernism** with a focus on data clarity and executive precision. It is designed for high-performance SaaS environments where information density must coexist with visual breathing room. The aesthetic is professional, reliable, and strictly functional, avoiding unnecessary ornamentation in favor of crisp boundaries and purposeful contrast.

The target audience consists of data-driven decision-makers who require an interface that minimizes cognitive load while maximizing the visibility of key performance indicators (KPIs). The emotional response should be one of "effortless control"—a sense that complex data is being structured logically and elegantly.

## Colores (Colors)

The palette is monochromatic and high-contrast, utilizing deep blacks against soft, cool grays to establish a clear information hierarchy.

- **Primario (Negro Intenso):** `#0D0D12`. Used for primary headings, call-to-action buttons, and active states. It provides the "anchor" for the interface.
- **Secundario (Gris Pizarra):** `#64748B`. Used for supporting text, icons, and secondary labels to reduce visual noise.
- **Superficie (Blanco y Gris Claro):** `#FFFFFF` for the main dashboard canvas and primary page background. Use `#F7F9FB` for internal setting/content panels that need separation from the canvas. This creates a subtle "layered" effect.
- **Acento (Verde Éxito):** `#10B981`. Used sparingly for trend indicators, "in-stock" badges, and positive growth metrics.
- **Borde (Gris Humo):** `#E2E8F0`. Ultra-thin lines to define structure without adding bulk.

## Typography

This design system uses a dual-font strategy to balance character with utility. **Plus Jakarta Sans** provides a modern, slightly geometric feel for headings, while **Inter** ensures maximum readability for dense data sets. **JetBrains Mono** is introduced for specific data points and timestamps to emphasize the technical accuracy of the dashboard.

For mobile viewports, `display-lg` scales down to 24px and `headline-md` scales to 20px to maintain vertical rhythm without overwhelming the smaller screen real estate.

## Layout & Spacing

The system follows a **Fixed Grid** approach for the main sidebar (260px) with a **Fluid Content Area** that adapts to the viewport. A 12-column grid is utilized within the content area, allowing cards to span 3, 4, 6, or 12 columns depending on information priority.

- **Desktop:** 32px external margins, 24px gutters.
- **Tablet:** 24px external margins, 16px gutters (sidebar collapses to icons).
- **Mobile:** 16px external margins, 16px vertical stacking.

A strict 8px-based spacing scale (4, 8, 16, 24, 32, 48, 64) ensures consistent alignment across all components.

## Elevation & Depth

Hierarchy is established primarily through **Tonal Layers** rather than heavy shadows. 

1. **Base Layer:** Dashboard pages use a pure white canvas (`#FFFFFF`).
2. **Surface Layer:** Navigation cards and primary containers use soft off-white (`#F7F9FB`) with a 1px solid border (`#E2E8F0`). Internal settings/content panels also use `#F7F9FB` against the white page canvas.
3. **Interactive Layer:** Active elements or modals may utilize a "High-Precision" shadow: `0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)`.

This creates a "flat-plus" appearance where depth is felt through contrast rather than artificial lighting effects.

## Shapes

The design system adopts a **Rounded** profile. This softens the high-contrast color palette, making the professional interface feel more approachable.

- **Buttons & Inputs:** 0.5rem (8px) radius.
- **Cards & Sections:** 1rem (16px) radius.
- **Badges & Tags:** Full pill (999px) for status indicators, or 0.25rem (4px) for small labels.
- **Icons:** Enclosed in circles or 8px rounded boxes when used as secondary visual cues.

## Components

- **Buttons:** Primary buttons are solid `#0D0D12` with white text. Secondary buttons use a ghost style with a `#E2E8F0` border.
- **Cards:** Primary cards use a soft off-white background, 16px padding, and 16px corner radius. Internal settings greeting/content cards use `#F7F9FB` against the white page canvas. Every card must have a 1px border to distinguish it from the background layer.
- **Input Fields:** Minimalist design with a 1px border that thickens and darkens on focus. Use placeholder text in `#94A3B8`.
- **Status Chips:** Small, condensed labels using `label-caps` typography. Background colors for chips should be high-transparency versions of the status color (e.g., Success is 10% opacity green).
- **Data Visualizations:** Line charts use a 2px stroke width with smooth interpolation. Grid lines within charts must be faint (`#F1F5F9`) to keep the focus on the data trend.
- **Sidebar:** Fixed width with a light gray border on the right. Active states are indicated by a subtle background fill or a vertical bar on the left.

## Theme System

The dashboard supports two visual themes: **light** and **dark**. Components must use semantic Tailwind tokens instead of raw hex colors so both themes remain consistent.

### Light Theme Tokens

Light mode is the default dashboard theme and maps to the original palette above.

- **Canvas:** `bg-background` / `text-on-surface` -> `#FFFFFF` / `#191C1E`.
- **Primary surface:** `bg-card` or `bg-surface` -> `#F7F9FB`.
- **Nested surface:** `bg-surface-container` -> `#ECEEF0`.
- **Raised or hover surface:** `bg-surface-container-highest` -> `#E0E3E5`.
- **Primary action:** `bg-primary` / `text-primary-foreground` -> `#0D0D12` / `#FFFFFF`.
- **Secondary text:** `text-on-surface-variant` -> `#47464B`.
- **Borders:** `border-border` for structural borders and `border-outline-variant` for controls.
- **Focus:** `outline-ring`, `ring-primary/15`, or `focus-visible:outline-ring`.

### Dark Theme Tokens

Dark mode is an inverted tonal system, not a pure color negative. It preserves hierarchy and contrast while reducing light emission.

- **Canvas:** `bg-background` / `text-on-surface` -> `#0D0F12` / `#EFF1F3`.
- **Primary surface:** `bg-card` or `bg-surface` -> `#12161A`.
- **Nested surface:** `bg-surface-container` -> `#191D22`.
- **Raised or hover surface:** `bg-surface-container-highest` -> `#2A3036`.
- **Primary action:** `bg-primary` / `text-primary-foreground` -> `#EFF1F3` / `#0D0D12`.
- **Secondary text:** `text-on-surface-variant` -> `#C8C5CB`.
- **Borders:** `border-border` -> `#343A40`; use `border-outline-variant` for controls that need clearer separation.
- **Focus:** `outline-ring` uses the inverted primary/focus tone and must remain visible on dark surfaces.

### Component Rules For Both Themes

- Use semantic tokens (`bg-card`, `text-on-surface`, `border-border`, `bg-primary`) instead of raw hex colors in dashboard components.
- Page-level dashboard containers use `bg-background`; repeated panels and cards use `bg-card`; nested inputs and search fields use `bg-surface-container`.
- Active navigation and primary actions use `bg-primary text-primary-foreground`; inactive navigation uses `text-on-surface-variant` and `hover:bg-surface-container-highest`.
- Text hierarchy must use `text-on-surface` for headings/body and `text-on-surface-variant` or `text-outline` for supporting labels.
- Controls must define visible focus states with `focus-visible:outline-ring` or `focus-visible:ring-primary/15`.
- New components should be validated in both themes before shipping. Do not add new hex values unless they become named tokens in `app/globals.css` and are documented here.
