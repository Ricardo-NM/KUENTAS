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
  background: '#f7f9fb'
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
- **Superficie (Blanco y Gris Claro):** `#FFFFFF` for cards and `#F8FAFC` for the main canvas background. This creates a subtle "layered" effect.
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

1. **Base Layer:** The background uses a subtle off-white (`#F8FAFC`).
2. **Surface Layer:** Cards and containers are pure white (`#FFFFFF`) with a 1px solid border (`#E2E8F0`). 
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
- **Cards:** White background, 16px padding, and 16px corner radius. Every card must have a 1px border to distinguish it from the background layer.
- **Input Fields:** Minimalist design with a 1px border that thickens and darkens on focus. Use placeholder text in `#94A3B8`.
- **Status Chips:** Small, condensed labels using `label-caps` typography. Background colors for chips should be high-transparency versions of the status color (e.g., Success is 10% opacity green).
- **Data Visualizations:** Line charts use a 2px stroke width with smooth interpolation. Grid lines within charts must be faint (`#F1F5F9`) to keep the focus on the data trend.
- **Sidebar:** Fixed width with a light gray border on the right. Active states are indicated by a subtle background fill or a vertical bar on the left.