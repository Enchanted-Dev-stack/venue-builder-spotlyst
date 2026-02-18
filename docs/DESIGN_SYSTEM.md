# Venue Builder — Design System

> **Version:** 1.0.0
> **Last Updated:** 2025
> **Status:** Definitive Reference

This document is the **single source of truth** for all visual design decisions in the `venue-builder` package. Every color, spacing value, typography choice, and interaction state is codified here. All contributors and consumers of this library should reference this document when making or reviewing UI decisions.

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color Palette](#color-palette)
   - [Canvas Area](#canvas-area)
   - [UI Chrome (Sidebar & Toolbar)](#ui-chrome-sidebar--toolbar)
   - [Element Default Styles](#element-default-styles)
   - [Table Status Colors](#table-status-colors-4-state-booking-system)
   - [Selection & Interaction States](#selection--interaction-states)
3. [Typography](#typography)
4. [Element Shapes](#element-shapes)
5. [Spacing & Grid System](#spacing--grid-system)
6. [UI Layout](#ui-layout)
7. [Iconography](#iconography)
8. [Design Tokens (CSS Custom Properties)](#design-tokens-css-custom-properties)
9. [Accessibility](#accessibility)
10. [Quick Reference Cheat Sheet](#quick-reference-cheat-sheet)

---

## Design Philosophy

The `venue-builder` visual language is built on five core principles:

| Principle | Description |
|-----------|-------------|
| **Top-Down 2D Flat View** | Bird's-eye perspective. All elements are rendered as flat 2D shapes viewed from directly above. No vanishing points, no perspective distortion. |
| **Minimal Flat Design** | Simple geometric shapes, no gradients, no 3D effects, no drop shadows (except during drag). Clean, precise lines throughout. |
| **High-Contrast Chrome** | Light/white canvas paired with a deep dark sidebar creates a strong visual separation between the editing area and the tool palette. |
| **Single Accent Color** | Indigo (`#4F46E5`) is the sole accent color. All other color usage is reserved strictly for status indicators. This keeps the UI calm and professional. |
| **Rounded Furniture, Sharp Architecture** | Furniture elements (tables, chairs) use rounded corners for a softer, approachable feel. Architectural elements (walls, doors) use sharper geometry to convey structure. |

### Design Goals

- **Professional & Clean** — Suitable for a production booking/reservation application
- **Scannable at a Glance** — Status colors are immediately distinguishable without reading labels
- **Non-Distracting Canvas** — The venue layout is the hero; UI chrome stays out of the way
- **Consistent & Predictable** — Every interaction state follows the same visual language

---

## Color Palette

### Canvas Area

The canvas is the primary workspace. It uses a near-white background with subtle grid lines to provide spatial reference without visual noise.

| Element | Color Name | Hex | Preview |
|---------|-----------|-----|---------|
| Canvas background | Near-white | `#FAFBFC` | ![#FAFBFC](https://via.placeholder.com/16/FAFBFC/FAFBFC) |
| Grid minor lines | Subtle gray | `#EAEEF2` | ![#EAEEF2](https://via.placeholder.com/16/EAEEF2/EAEEF2) |
| Grid major lines (every 5th) | Medium gray | `#D1D9E0` | ![#D1D9E0](https://via.placeholder.com/16/D1D9E0/D1D9E0) |
| Snap guide | Indigo dashed | `#4F46E5` | ![#4F46E5](https://via.placeholder.com/16/4F46E5/4F46E5) |

**Grid rendering rules:**
- Minor grid lines: solid, 1px, `#EAEEF2`
- Major grid lines: solid, 1px, `#D1D9E0`
- Snap guides: dashed (4px dash, 4px gap), 1px, `#4F46E5`

---

### UI Chrome (Sidebar & Toolbar)

The UI chrome uses a dark sidebar for tool selection and a light top toolbar for contextual actions, creating a strong visual frame around the canvas.

| Element | Color / Style | Hex | Notes |
|---------|--------------|-----|-------|
| Sidebar background | Deep slate | `#1E293B` | Full-height left panel |
| Sidebar text | Light gray | `#E2E8F0` | Primary labels |
| Sidebar muted text | Slate | `#94A3B8` | Secondary / hint text |
| Sidebar divider | Dark slate | `#334155` | Horizontal separator lines |
| Tool button — default | Transparent bg | — | Icon color: `#94A3B8` |
| Tool button — hover | Slate bg | `#334155` bg, `#FFFFFF` icon | Subtle highlight |
| Tool button — active | Indigo bg | `#4F46E5` bg, `#FFFFFF` icon | Currently selected tool |
| Top toolbar bg | White | `#FFFFFF` | `border-bottom: 1px solid #E2E8F0` |
| Primary button | Indigo | `#4F46E5` bg → `#4338CA` on hover | White text (`#FFFFFF`) |
| Secondary button | Light slate | `#F1F5F9` bg, `#475569` text | Hover: `#E2E8F0` bg |
| Danger button | Red | `#EF4444` bg → `#DC2626` on hover | White text, use sparingly |

**Button specifications:**

```
Primary Button:
  background: #4F46E5
  color: #FFFFFF
  border: none
  border-radius: 6px
  padding: 8px 16px
  font-weight: 500
  :hover → background: #4338CA
  :active → background: #3730A3

Secondary Button:
  background: #F1F5F9
  color: #475569
  border: 1px solid #E2E8F0
  border-radius: 6px
  padding: 8px 16px
  font-weight: 500
  :hover → background: #E2E8F0
```

---

### Element Default Styles

These are the default visual styles for venue elements when placed on the canvas. All elements are rendered as SVG or Canvas 2D shapes.

| Element | Fill | Stroke | Stroke Width | Border Radius |
|---------|------|--------|--------------|---------------|
| Walls | `#475569` | `#334155` | `3px` | `0` (sharp) |
| Tables (rectangular) | `#FDF6EC` (warm wood) | `#D4A574` | `1.5px` | `6px` |
| Tables (round) | `#FDF6EC` (warm wood) | `#D4A574` | `1.5px` | `50%` (circle) |
| Chairs | `#F1F5F9` | `#94A3B8` | `1px` | `4px` |
| Doors | `#FFFFFF` | `#64748B` | `1.5px` | `0` |
| Windows | `#DBEAFE` | `#93C5FD` | `1.5px` | `0` |

**Element rendering notes:**
- **Walls** are thick line segments. They should feel structural and heavy.
- **Tables** use a warm wood tone (`#FDF6EC`) to feel natural and inviting. The stroke (`#D4A574`) reinforces the warm palette.
- **Chairs** are intentionally subtle (light gray) so they don't compete with tables for visual attention.
- **Doors** use a white fill with a medium-gray stroke. An arc indicator shows the swing direction.
- **Windows** use a light blue fill (`#DBEAFE`) to suggest glass. A dashed center line runs along their length.

---

### Table Status Colors (4-State Booking System)

Tables support four mutually exclusive booking states. The color system uses **soft pastel fills** with **saturated borders** — visible at a glance but not overwhelming.

| Status | Fill | Border | Badge Color | Icon |
|--------|------|--------|-------------|------|
| **Available** | `#ECFDF5` | `#10B981` | `#10B981` (emerald) | ● (solid dot) |
| **Reserved** | `#FFFBEB` | `#F59E0B` | `#F59E0B` (amber) | ◐ (half dot) |
| **Occupied** | `#FEF2F2` | `#EF4444` | `#EF4444` (red) | ■ (solid square) |
| **Blocked** | `#F3F4F6` | `#9CA3AF` | `#6B7280` (gray) | ✕ (cross + hatch pattern) |

**Status rendering rules:**

```
Available:
  fill: #ECFDF5
  stroke: #10B981
  stroke-width: 2px
  badge: 8px circle, #10B981 fill, positioned top-right

Reserved:
  fill: #FFFBEB
  stroke: #F59E0B
  stroke-width: 2px
  badge: 8px circle, #F59E0B fill, positioned top-right

Occupied:
  fill: #FEF2F2
  stroke: #EF4444
  stroke-width: 2px
  badge: 8px circle, #EF4444 fill, positioned top-right

Blocked:
  fill: #F3F4F6
  stroke: #9CA3AF
  stroke-width: 2px
  pattern: 45° hatch lines, #D1D9E0, 4px spacing
  badge: 8px circle, #6B7280 fill + "✕" glyph, positioned top-right
```

**Color rationale:**
- Green/Emerald for available — universal "go" signal
- Amber for reserved — "caution/pending" semantic
- Red for occupied — "stop/in-use" semantic
- Gray for blocked — "disabled/inactive" semantic, reinforced with hatch pattern for additional visual distinction (accessibility)

---

### Selection & Interaction States

All interactive states follow a consistent visual language anchored to the indigo accent color.

| State | Style | Details |
|-------|-------|---------|
| **Hover** | Stroke color shift | Stroke changes to `#818CF8` (indigo-400). No fill change. Cursor: `pointer`. |
| **Selected** | Dashed indigo border + handles | `#4F46E5` dashed border (`2px`, dash pattern `6,3`). White resize handles with indigo stroke at corners and midpoints. |
| **Multi-selected** | Same as selected | Each selected element gets its own selection border. |
| **Dragging** | Reduced opacity + shadow | Element rendered at `opacity: 0.7`. Subtle drop shadow: `0 4px 12px rgba(0,0,0,0.15)`. |
| **Group outline** | Light dashed bounding box | `#94A3B8` dashed border (`1px`, dash pattern `4,4`) around the bounding box of all grouped elements. |
| **Snap alignment** | Indigo guide lines | `#4F46E5` dashed lines extend across canvas to show alignment. |
| **Invalid placement** | Red highlight | Stroke flashes `#EF4444`, fill tints with `rgba(239,68,68,0.1)`. |

**Resize handle specification:**

```
Resize Handles:
  shape: square
  size: 8×8px
  fill: #FFFFFF
  stroke: #4F46E5
  stroke-width: 1.5px
  positions: four corners + four midpoints of bounding box
  cursor: appropriate resize cursor (nw-resize, n-resize, etc.)
```

**Selection box (marquee) specification:**

```
Marquee Selection:
  fill: rgba(79, 70, 229, 0.08)
  stroke: #4F46E5
  stroke-width: 1px
  stroke-dasharray: none (solid)
```

---

## Typography

The type system uses a native system font stack for maximum performance and platform-native feel.

### Font Stack

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, 'Helvetica Neue', Arial, sans-serif;
```

### Type Scale

| Role | Size | Weight | Color | Line Height | Usage |
|------|------|--------|-------|-------------|-------|
| **Heading 1** | `18px` | `600` | `#1E293B` | `1.4` | Panel titles |
| **Heading 2** | `14px` | `600` | `#1E293B` | `1.4` | Section headers |
| **Body** | `13px` | `400` | `#475569` | `1.5` | General UI text |
| **Caption / Label** | `12px` | `400` | `#64748B` | `1.4` | Secondary info, form labels |
| **Small / Hint** | `11px` | `400` | `#94A3B8` | `1.3` | Tertiary info, keyboard shortcuts |
| **Canvas element label** | `11px` | `500` | `#475569` | `1.0` | Table numbers, element names (centered) |
| **Canvas status badge** | `9px` | `600` | `#FFFFFF` | `1.0` | Status text inside badges |
| **Sidebar label** | `11px` | `500` | `#E2E8F0` | `1.3` | Tool names in expanded sidebar |
| **Sidebar muted** | `10px` | `400` | `#94A3B8` | `1.3` | Category headers in sidebar |

### Text Colors

| Context | Color | Hex |
|---------|-------|-----|
| Primary text (light bg) | Dark slate | `#1E293B` |
| Secondary text (light bg) | Slate | `#475569` |
| Tertiary text (light bg) | Gray | `#64748B` |
| Muted text (light bg) | Light gray | `#94A3B8` |
| Primary text (dark bg) | Off-white | `#E2E8F0` |
| Muted text (dark bg) | Slate | `#94A3B8` |
| Link text | Indigo | `#4F46E5` |
| Error text | Red | `#EF4444` |
| Success text | Emerald | `#10B981` |

---

## Element Shapes

Detailed specifications for each venue element as rendered on the canvas.

### Tables (Rectangular)

```
Shape: Rounded rectangle
Default size: 80×50px
Border radius: 6px
Fill: #FDF6EC
Stroke: #D4A574
Stroke width: 1.5px
Label: Centered, 11px, #475569
Min size: 40×30px
Seat indicators: Small semicircles on edges (optional)
```

### Tables (Round)

```
Shape: Circle (or ellipse for oval tables)
Default diameter: 60px
Fill: #FDF6EC
Stroke: #D4A574
Stroke width: 1.5px
Label: Centered, 11px, #475569
Min diameter: 30px
Seat indicators: Small semicircles around circumference (optional)
```

### Chairs

```
Shape: Small rounded rectangle
Default size: 20×20px
Border radius: 4px
Fill: #F1F5F9
Stroke: #94A3B8
Stroke width: 1px
Auto-placement: Snap to table edges when placed nearby
Rotation: Follows table edge orientation
```

### Walls

```
Shape: Thick line segment
Default thickness: 3px (visual), 10px (hit area for selection)
Fill: #475569
Stroke: #334155
Stroke width: 3px
Line cap: square
Endpoints: Small square handles when selected (6×6px)
```

### Doors

```
Shape: Rectangle + arc indicator
Default width: 40px
Fill: #FFFFFF
Stroke: #64748B
Stroke width: 1.5px
Arc: Dashed arc showing swing direction (90° by default)
Arc stroke: #64748B, 1px, dasharray 3,3
Types: single-swing, double-swing, sliding
```

### Windows

```
Shape: Rectangle
Default width: 60px, height: 8px
Fill: #DBEAFE
Stroke: #93C5FD
Stroke width: 1.5px
Center line: Dashed line along length, #93C5FD, 1px
Placement: Typically on wall segments
```

### Staging / Dance Floor (Special Areas)

```
Shape: Rectangle or polygon
Fill: rgba(79, 70, 229, 0.06) — very subtle indigo tint
Stroke: #4F46E5
Stroke width: 1px
Stroke dasharray: 8, 4
Label: Centered, 12px, #4F46E5, uppercase
```

### Bar Counter

```
Shape: Rounded rectangle (elongated)
Default size: 120×30px
Border radius: 8px
Fill: #475569
Stroke: #334155
Stroke width: 2px
Label: Centered, 11px, #E2E8F0 (light text on dark fill)
```

---

## Spacing & Grid System

### Grid Configuration

| Property | Value | Notes |
|----------|-------|-------|
| Grid cell size | `20px` | Base unit for snapping |
| Minor grid interval | Every `20px` | Thin subtle lines |
| Major grid interval | Every `100px` (5 cells) | Slightly bolder lines |
| Snap threshold | `10px` | Elements snap when within 10px of grid/guide |
| Default canvas size | `1200×800px` | Can be resized by user |
| Canvas min size | `400×300px` | Minimum allowed |
| Canvas max size | `4000×3000px` | Maximum allowed |

### Grid Rendering

```
Minor grid:
  color: #EAEEF2
  width: 1px
  interval: 20px

Major grid:
  color: #D1D9E0
  width: 1px
  interval: 100px

Origin marker:
  color: #D1D9E0
  style: crosshair at (0,0), 20px arms
```

### Spacing Scale (UI Components)

Used for padding, margins, and gaps throughout the UI chrome:

| Token | Value | Usage |
|-------|-------|-------|
| `space-xs` | `4px` | Tight gaps, icon padding |
| `space-sm` | `8px` | Button padding (vertical), small gaps |
| `space-md` | `12px` | Standard padding, panel internal spacing |
| `space-lg` | `16px` | Button padding (horizontal), section spacing |
| `space-xl` | `24px` | Panel padding, major section gaps |
| `space-2xl` | `32px` | Panel outer margins |

---

## UI Layout

### Overall Structure

```
┌──────────────────────────────────────────────────────┐
│                  Top Toolbar (48px)                   │
├────────┬─────────────────────────────────┬───────────┤
│        │                                 │ Properties│
│ Side-  │                                 │  Panel    │
│ bar    │         Canvas Area             │  (280px)  │
│ (56px  │       (fills remaining)         │           │
│  or    │                                 │  Slides   │
│ 200px) │                                 │  in when  │
│        │                                 │  element  │
│        │                                 │  selected │
├────────┴─────────────────────────────────┴───────────┤
│              Status Bar (28px, optional)              │
└──────────────────────────────────────────────────────┘
```

### Left Sidebar

| Property | Collapsed | Expanded |
|----------|-----------|----------|
| Width | `56px` | `200px` |
| Background | `#1E293B` | `#1E293B` |
| Content | Icons only | Icons + text labels |
| Icon size | `20×20px` | `20×20px` |
| Item height | `44px` | `40px` |
| Item padding | `18px` centered | `12px 16px` |
| Divider | Full width, `#334155` | Full width, `#334155` |
| Toggle button | Bottom, chevron icon | Bottom, chevron icon |

### Top Toolbar

| Property | Value |
|----------|-------|
| Height | `48px` |
| Background | `#FFFFFF` |
| Border | `border-bottom: 1px solid #E2E8F0` |
| Padding | `0 16px` |
| Content alignment | Vertically centered, horizontal flex |
| Left section | Undo/Redo, zoom controls |
| Center section | Element-specific tools (appears contextually) |
| Right section | View toggles, export, settings |

### Properties Panel

| Property | Value |
|----------|-------|
| Width | `280px` |
| Background | `#FFFFFF` |
| Border | `border-left: 1px solid #E2E8F0` |
| Padding | `16px` |
| Visibility | Slides in from right when an element is selected |
| Animation | `transform: translateX` over `200ms ease` |
| Sections | Position (x/y), Size (w/h), Rotation, Style overrides, Status (tables), Custom properties |

### Canvas Area

| Property | Value |
|----------|-------|
| Background | `#FAFBFC` |
| Sizing | Fills all remaining space |
| Overflow | Hidden (pan/zoom to navigate) |
| Zoom range | `25%` – `400%` |
| Default zoom | `100%` |
| Pan | Middle-mouse drag or Space+drag |

---

## Iconography

### Icon Specifications

| Property | Value |
|----------|-------|
| Style | Line-stroke (outline) |
| Size | `20×20px` |
| Stroke width | `1.5px` |
| Corner radius | `2px` (where applicable) |
| Color (dark bg) | `#FFFFFF` (active), `#94A3B8` (default) |
| Color (light bg) | `#475569` (default), `#4F46E5` (active) |

### Icon Set

| Tool | Icon Description |
|------|-----------------|
| Select (pointer) | Arrow cursor |
| Wall | Diagonal line segment |
| Rectangle table | Rounded rectangle |
| Round table | Circle |
| Chair | Small square with back-rest line |
| Door | Rectangle with arc |
| Window | Rectangle with dashed center |
| Eraser/Delete | Trash can outline |
| Pan/Hand | Open hand |
| Zoom in | Magnifying glass with `+` |
| Zoom out | Magnifying glass with `−` |
| Undo | Curved arrow left |
| Redo | Curved arrow right |
| Grid toggle | Grid pattern (2×2) |
| Snap toggle | Magnet |
| Export | Download arrow |
| Group | Overlapping squares |
| Lock | Padlock |

---

## Design Tokens (CSS Custom Properties)

For implementation, all design values should be exposed as CSS custom properties:

```css
:root {
  /* ─── Canvas ─── */
  --vb-canvas-bg: #FAFBFC;
  --vb-grid-minor: #EAEEF2;
  --vb-grid-major: #D1D9E0;
  --vb-snap-guide: #4F46E5;

  /* ─── Accent ─── */
  --vb-accent: #4F46E5;
  --vb-accent-hover: #4338CA;
  --vb-accent-active: #3730A3;
  --vb-accent-light: #818CF8;
  --vb-accent-subtle: rgba(79, 70, 229, 0.08);

  /* ─── Sidebar ─── */
  --vb-sidebar-bg: #1E293B;
  --vb-sidebar-text: #E2E8F0;
  --vb-sidebar-muted: #94A3B8;
  --vb-sidebar-divider: #334155;
  --vb-sidebar-hover: #334155;

  /* ─── Toolbar ─── */
  --vb-toolbar-bg: #FFFFFF;
  --vb-toolbar-border: #E2E8F0;

  /* ─── Buttons ─── */
  --vb-btn-primary-bg: #4F46E5;
  --vb-btn-primary-hover: #4338CA;
  --vb-btn-primary-text: #FFFFFF;
  --vb-btn-secondary-bg: #F1F5F9;
  --vb-btn-secondary-text: #475569;
  --vb-btn-secondary-border: #E2E8F0;
  --vb-btn-danger-bg: #EF4444;
  --vb-btn-danger-hover: #DC2626;

  /* ─── Elements ─── */
  --vb-wall-fill: #475569;
  --vb-wall-stroke: #334155;
  --vb-table-fill: #FDF6EC;
  --vb-table-stroke: #D4A574;
  --vb-chair-fill: #F1F5F9;
  --vb-chair-stroke: #94A3B8;
  --vb-door-fill: #FFFFFF;
  --vb-door-stroke: #64748B;
  --vb-window-fill: #DBEAFE;
  --vb-window-stroke: #93C5FD;

  /* ─── Status: Available ─── */
  --vb-status-available-fill: #ECFDF5;
  --vb-status-available-border: #10B981;
  --vb-status-available-badge: #10B981;

  /* ─── Status: Reserved ─── */
  --vb-status-reserved-fill: #FFFBEB;
  --vb-status-reserved-border: #F59E0B;
  --vb-status-reserved-badge: #F59E0B;

  /* ─── Status: Occupied ─── */
  --vb-status-occupied-fill: #FEF2F2;
  --vb-status-occupied-border: #EF4444;
  --vb-status-occupied-badge: #EF4444;

  /* ─── Status: Blocked ─── */
  --vb-status-blocked-fill: #F3F4F6;
  --vb-status-blocked-border: #9CA3AF;
  --vb-status-blocked-badge: #6B7280;

  /* ─── Selection ─── */
  --vb-select-stroke: #4F46E5;
  --vb-select-handle-fill: #FFFFFF;
  --vb-select-handle-stroke: #4F46E5;
  --vb-hover-stroke: #818CF8;
  --vb-drag-opacity: 0.7;
  --vb-group-outline: #94A3B8;
  --vb-marquee-fill: rgba(79, 70, 229, 0.08);

  /* ─── Typography ─── */
  --vb-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, 'Helvetica Neue', Arial, sans-serif;
  --vb-text-primary: #1E293B;
  --vb-text-secondary: #475569;
  --vb-text-tertiary: #64748B;
  --vb-text-muted: #94A3B8;
  --vb-text-on-dark: #E2E8F0;
  --vb-text-error: #EF4444;
  --vb-text-success: #10B981;

  /* ─── Spacing ─── */
  --vb-space-xs: 4px;
  --vb-space-sm: 8px;
  --vb-space-md: 12px;
  --vb-space-lg: 16px;
  --vb-space-xl: 24px;
  --vb-space-2xl: 32px;

  /* ─── Layout ─── */
  --vb-sidebar-width-collapsed: 56px;
  --vb-sidebar-width-expanded: 200px;
  --vb-toolbar-height: 48px;
  --vb-properties-width: 280px;
  --vb-statusbar-height: 28px;

  /* ─── Grid ─── */
  --vb-grid-size: 20px;
  --vb-grid-major-interval: 5;
  --vb-snap-threshold: 10px;

  /* ─── Borders ─── */
  --vb-radius-sm: 4px;
  --vb-radius-md: 6px;
  --vb-radius-lg: 8px;
  --vb-radius-full: 9999px;

  /* ─── Transitions ─── */
  --vb-transition-fast: 100ms ease;
  --vb-transition-normal: 200ms ease;
  --vb-transition-slow: 300ms ease;

  /* ─── Z-Index Scale ─── */
  --vb-z-canvas: 0;
  --vb-z-elements: 10;
  --vb-z-selection: 20;
  --vb-z-guides: 30;
  --vb-z-sidebar: 100;
  --vb-z-toolbar: 100;
  --vb-z-properties: 100;
  --vb-z-modal: 200;
  --vb-z-tooltip: 300;
  --vb-z-dropdown: 250;
}
```

---

## Accessibility

### Color Contrast

All text and interactive elements meet **WCAG 2.1 AA** contrast requirements:

| Pair | Foreground | Background | Ratio | Pass |
|------|-----------|------------|-------|------|
| Sidebar text | `#E2E8F0` | `#1E293B` | 11.3:1 | ✅ AAA |
| Body text | `#475569` | `#FAFBFC` | 7.1:1 | ✅ AAA |
| Caption text | `#64748B` | `#FAFBFC` | 4.9:1 | ✅ AA |
| Primary button | `#FFFFFF` | `#4F46E5` | 7.8:1 | ✅ AAA |
| Status: Available | `#10B981` | `#ECFDF5` | 3.2:1 | ✅ AA (large text/icons) |
| Status: Occupied | `#EF4444` | `#FEF2F2` | 3.6:1 | ✅ AA (large text/icons) |

### Status Differentiation

Status colors are **not conveyed by color alone**:

| Status | Color | Secondary Indicator |
|--------|-------|-------------------|
| Available | Green | Solid dot badge |
| Reserved | Amber | Half-filled dot badge |
| Occupied | Red | Solid square badge |
| Blocked | Gray | Cross mark + hatch pattern overlay |

### Focus States

```
All interactive elements:
  :focus-visible → outline: 2px solid #4F46E5, outline-offset: 2px
  No focus ring on mouse click (use :focus-visible, not :focus)
```

### Keyboard Navigation

- `Tab` / `Shift+Tab`: Navigate between tools and panels
- `Arrow keys`: Nudge selected elements by 1px (or 1 grid unit with Shift)
- `Delete` / `Backspace`: Remove selected elements
- `Escape`: Deselect all / close panel
- `Ctrl+A`: Select all elements
- `Ctrl+G`: Group selected elements

---

## Quick Reference Cheat Sheet

### Core Colors at a Glance

```
Accent:       #4F46E5  (indigo)
Canvas:       #FAFBFC  (near-white)
Sidebar:      #1E293B  (deep slate)
Table fill:   #FDF6EC  (warm wood)
Chair fill:   #F1F5F9  (light gray)
Wall fill:    #475569  (dark slate)

Status — Available:  #10B981 border on #ECFDF5
Status — Reserved:   #F59E0B border on #FFFBEB
Status — Occupied:   #EF4444 border on #FEF2F2
Status — Blocked:    #9CA3AF border on #F3F4F6

Hover:     #818CF8 stroke
Selected:  #4F46E5 dashed + handles
Dragging:  70% opacity + shadow
```

### Key Dimensions

```
Grid:             20px cells, major every 100px
Sidebar:          56px (collapsed) / 200px (expanded)
Toolbar:          48px height
Properties panel: 280px width
Resize handles:   8×8px squares
Snap threshold:   10px
Canvas default:   1200×800px
```

### File Quick Reference

```
Design tokens:    venue-builder/src/styles/tokens.css
Component styles: venue-builder/src/styles/components/
Theme overrides:  venue-builder/src/styles/theme.css
```

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025 | Initial design system specification |

---

> **Note:** This document is the definitive reference for all visual design decisions in the `venue-builder` package. Any deviation from these specifications should be discussed and approved before implementation, and this document should be updated accordingly.
