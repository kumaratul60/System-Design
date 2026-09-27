# 01. CSS Units & Values

> A comprehensive deep-dive into CSS sizing units, relative vs. absolute dimensions, viewport dynamics, container query units, and design system dependency models.

---

## Table of Contents

- [01. CSS Units \& Values](#01-css-units--values)
  - [Table of Contents](#table-of-contents)
  - [Quick Reference \& Comparison Table](#quick-reference--comparison-table)
  - [1. Relative Units](#1-relative-units)
    - [`rem` (Root EM)](#rem-root-em)
      - [Why `rem` is Critical for Accessibility:](#why-rem-is-critical-for-accessibility)
    - [`em` (Element EM) \& Compounding](#em-element-em--compounding)
      - [⚠️ The Compounding Trap (Why NOT to use `em` for Typography):](#️-the-compounding-trap-why-not-to-use-em-for-typography)
    - [`%` (Percentage)](#-percentage)
    - [`ch` (Character Width)](#ch-character-width)
    - [`ex` (x-Height)](#ex-x-height)
    - [`lh` \& `rlh` (Line Height Units)](#lh--rlh-line-height-units)
  - [2. Viewport Units](#2-viewport-units)
    - [`vw` \& `vh`](#vw--vh)
    - [`vmin` \& `vmax`](#vmin--vmax)
    - [Modern Viewport Units (`svh` / `lvh` / `dvh`, `svw` / `lvw` / `dvw`)](#modern-viewport-units-svh--lvh--dvh-svw--lvw--dvw)
  - [3. Container Query Units](#3-container-query-units)
    - [Fallback Resolution Without `container-type`](#fallback-resolution-without-container-type)
  - [4. Grid Fraction Units (`fr`)](#4-grid-fraction-units-fr)
  - [5. Absolute \& Physical Print Units](#5-absolute--physical-print-units)
    - [`px` (CSS Pixels vs Physical Pixels)](#px-css-pixels-vs-physical-pixels)
    - [`pt`, `pc`, `cm`, `mm`, `in`, `q` (Print Only)](#pt-pc-cm-mm-in-q-print-only)
  - [6. Design System Architecture: `rem` vs `em` Dependency Models](#6-design-system-architecture-rem-vs-em-dependency-models)
  - [7. Property-to-Unit Recommendation Guide](#7-property-to-unit-recommendation-guide)

---

## Quick Reference & Comparison Table

| Unit                       | Relative To                       | Responsive | Best Use Cases                                      | Avoid For                            |
| :------------------------- | :-------------------------------- | :--------- | :-------------------------------------------------- | :----------------------------------- |
| **`rem`**                  | Root (`html`) font size           | ✅ Yes     | Typography, Global Spacing, Layout Margins/Paddings | Component-internal scaling           |
| **`em`**                   | Element's own font size           | ✅ Yes     | Button padding, Badges, Inline icons                | Nested typography (Compounding!)     |
| **`%`**                    | Parent container dimension        | ✅ Yes     | Grid column widths, Max-widths, Fluid images        | `font-size`, Vertical spacing hacks  |
| **`vw` / `vh`**            | 1% of viewport width/height       | ✅ Yes     | Fullscreen hero banners, Desktop splash layouts     | General body text                    |
| **`dvh` / `svh`**          | Dynamic / Small mobile viewport   | ✅ Yes     | Mobile fullscreen heights, Drawers, Modals          | Desktop-only layouts                 |
| **`cqi` / `cqw`**          | 1% of Container inline size/width | ✅ Yes     | Modular UI components (Cards, Sidebars, Modals)     | Macro page layout                    |
| **`ch`**                   | Width of "0" (zero) character     | ✅ Yes     | Paragraph reading width (`max-width: 65ch`)         | Layout widths                        |
| **`lh` / `rlh`**           | Element / Root line-height        | ✅ Yes     | Sizing inline icons and tags to match line height   | General layout spacing               |
| **`fr`**                   | Fraction of free grid space       | ✅ Yes     | CSS Grid column / row track division                | Non-grid elements                    |
| **`px`**                   | Absolute CSS pixel (1/96th in)    | ❌ No      | Borders, Hairlines, Box-shadows                     | Typography (Accessibility violation) |
| **`pt`, `pc`, `cm`, `in`** | Physical real-world dimensions    | ❌ No      | Print stylesheets (`@media print`), PDF exports     | Digital screens                      |

---

## 1. Relative Units

### `rem` (Root EM)

Relative to the **root (`html`) element's computed font-size**. By default, `1rem = 16px`.

```
Computed Value = rem value × html font-size
```

```css
html {
  font-size: 16px; /* User default */
}

h1 {
  font-size: 2.25rem; /* 2.25 * 16px = 36px */
}

.container {
  max-width: 80rem; /* 80 * 16px = 1280px */
  padding: 2rem; /* 32px */
}
```

#### Why `rem` is Critical for Accessibility:

When a low-vision user changes their browser's default font size to `20px` in system settings:

- An element with `font-size: 16px` **remains frozen at 16px** (unreadable).
- An element with `font-size: 1rem` **automatically scales to 20px**, preserving the entire application's readability.

---

### `em` (Element EM) & Compounding

Relative to the **current element's computed `font-size`**.

```
Computed Value = em value × element's current font-size
```

```css
.button {
  font-size: 16px;
  padding: 0.75em 1.25em; /* Top/Bottom: 12px, Left/Right: 20px */
}

/* When button font increases, padding automatically scales proportionally */
.button.large {
  font-size: 24px;
  /* Padding automatically becomes: 18px 30px without writing extra CSS! */
}
```

#### ⚠️ The Compounding Trap (Why NOT to use `em` for Typography):

When nested typography uses `em`, each layer multiplies against its parent's computed size:

```
Parent (font-size: 20px)
  └── Child (font-size: 1.5em) → 30px
        └── Grandchild (font-size: 1.5em) → 45px
              └── Great-Grandchild (font-size: 1.5em) → 67.5px (Uncontrolled explosion!)
```

**Rule:** Use `rem` for typography; use `em` strictly for component-local internals (padding, icons, badges).

---

### `%` (Percentage)

Relative to the **parent container's dimensions**.

- On `width` / `max-width`: Relative to parent width.
- On `height`: Relative to parent height (parent must have an explicit computed height).
- On `font-size`: Relative to parent's font size (compounds like `em`).
- On `padding` / `margin`: **Always resolves relative to the parent's WIDTH** (even for `padding-top` / `margin-top` to avoid infinite circular reflow loops).

```css
.fluid-card {
  width: 100%;
  max-width: 600px;
}

img.responsive {
  width: 100%;
  height: auto;
}
```

---

### `ch` (Character Width)

Represents the **width of the "0" (zero) character** in the current font.

```css
/* Optimal typography line length for human reading is 45-75 characters */
.article-body {
  max-width: 65ch;
  line-height: 1.6;
}
```

---

### `ex` (x-Height)

Represents the **height of the lowercase letter "x"** in the current font. Used in specialized typographical layout alignments.

---

### `lh` & `rlh` (Line Height Units)

- **`lh`**: Relative to the current element's computed `line-height`.
- **`rlh`**: Relative to the root (`html`) element's computed `line-height`.

```css
/* Perfectly size and align an inline status icon to match line height */
.badge-icon {
  width: 1lh;
  height: 1lh;
  vertical-align: middle;
}
```

---

## 2. Viewport Units

### `vw` & `vh`

- **`1vw`** = 1% of the browser viewport width.
- **`1vh`** = 1% of the browser viewport height.

```css
.hero-section {
  min-height: 100vh;
}

.splash-title {
  font-size: 6vw; /* Warning: Can get too small on mobile or massive on 4K; pair with clamp() */
}
```

---

### `vmin` & `vmax`

- **`vmin`**: 1% of the **smaller** dimension between viewport width and height.
- **`vmax`**: 1% of the **larger** dimension between viewport width and height.

```css
/* Perfectly square responsive modal that never overflows screen on any orientation */
.square-modal {
  width: 80vmin;
  height: 80vmin;
}
```

---

### Modern Viewport Units (`svh` / `lvh` / `dvh`, `svw` / `lvw` / `dvw`)

Solves the mobile browser address bar jump bug (Safari / Chrome dynamic UI bars).

```
┌─────────────────────────────────┐
│ Browser Bar (Expanded)          │
├─────────────────────────────────┤ ◄─── Small Viewport (svh / svw)
│                                 │
│ Visible Viewport Area           │
│                                 │
├─────────────────────────────────┤ ◄─── Large Viewport (lvh / lvw)
│ Browser Bar (Collapsed)         │
└─────────────────────────────────┘
```

- **`svh` / `svw` (Small Viewport)**: Assumes browser bars are **fully expanded** (visible). Safest viewport area.
- **`lvh` / `lvw` (Large Viewport)**: Assumes browser bars are **fully collapsed** (hidden).
- **`dvh` / `dvw` (Dynamic Viewport)**: Dynamically recalculates as the user scrolls and the browser address bar expands/contracts.

```css
/* Mobile-friendly fullscreen hero */
.hero {
  min-height: 100dvh; /* Adapts dynamically */
}

.modal-dialog {
  max-height: 90svh; /* Guaranteed never to hide under mobile address bars */
}
```

---

## 3. Container Query Units

Container query units size elements relative to their nearest **query container** ancestor (established via `container-type: inline-size`).

| Unit        | Full Name                  | Calculation                                                  | Axis     |
| :---------- | :------------------------- | :----------------------------------------------------------- | :------- |
| **`cqi`**   | **Container Query Inline** | **1% of container's inline size (width in horizontal mode)** | Logical  |
| **`cqb`**   | Container Query Block      | 1% of container's block size (height in horizontal mode)     | Logical  |
| **`cqw`**   | Container Query Width      | 1% of container's physical width                             | Physical |
| **`cqh`**   | Container Query Height     | 1% of container's physical height                            | Physical |
| **`cqmin`** | Container Query Minimum    | Smaller of `cqi` and `cqb`                                   | Logical  |
| **`cqmax`** | Container Query Maximum    | Larger of `cqi` and `cqb`                                    | Logical  |

```css
.card-wrapper {
  container-type: inline-size; /* Contains inline axis */
  container-name: card;
}

.card-title {
  /* Fluid typography proportional to card width */
  font-size: clamp(1.1rem, 3.5cqi + 0.5rem, 2.25rem);
}

.card-body {
  padding: 4cqi; /* Proportional padding */
}
```

### Fallback Resolution Without `container-type`

If an element declares `cqi` / `cqw` without any ancestor having `container-type`, CSS Containment Level 3 dictates that the units **silently fall back to Small Viewport units (`1cqi` → `1svi` / `1svw`)**.

---

## 4. Grid Fraction Units (`fr`)

The `fr` unit represents a **fraction of the leftover available free space** within a CSS Grid container.

```css
.grid-layout {
  display: grid;
  /* Creates 3 columns: Column 1 takes 1/4th, Column 2 takes 2/4th (half), Column 3 takes 1/4th */
  grid-template-columns: 1fr 2fr 1fr;
  gap: 1.5rem;
}

/* Auto-fitting responsive grid without media queries */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}
```

---

## 5. Absolute & Physical Print Units

### `px` (CSS Pixels vs Physical Pixels)

An absolute CSS pixel is defined as $1/96\text{th}$ of a physical inch.

$$\text{Physical Pixels} = \text{CSS Pixels} \times \text{Device Pixel Ratio (DPR)}$$

- **Retina / Hi-DPI ($DPR = 2$)**: 1 CSS pixel renders across a $2 \times 2$ grid (4 physical hardware dots).
- **Best for**: `border: 1px solid`, `box-shadow`, fixed hairlines.
- **Avoid for**: `font-size` (breaks browser zoom accessibility).

---

### `pt`, `pc`, `cm`, `mm`, `in`, `q` (Print Only)

Physical units map directly to real-world physical measurements:

- **`in` (Inch)**: $1\text{in} = 96\text{px} = 2.54\text{cm}$
- **`cm` (Centimeter)**: $1\text{cm} = 37.8\text{px}$
- **`mm` (Millimeter)**: $1\text{mm} = 0.1\text{cm}$
- **`q` (Quarter of a Millimeter)**: $1\text{q} = 0.25\text{mm} = 1/40\text{th}\text{ cm}$
- **`pt` (Point)**: $1\text{pt} = 1/72\text{th}\text{ inch}$ ($72\text{pt} = 1\text{in}$)
- **`pc` (Pica)**: $1\text{pc} = 12\text{pt} = 1/6\text{th}\text{ inch}$

```css
/* Strictly for print stylesheets */
@media print {
  body {
    font-size: 11pt;
    margin: 2cm 1.5cm;
    color: black;
  }
}
```

---

## 6. Design System Architecture: `rem` vs `em` Dependency Models

In design system engineering, sizing choices govern where visual context is derived:

- **Application Scale (`rem`)**: Bound to global root font size. Use for typography scale, page layouts, container widths, and standardized design tokens (`--spacing-4: 1rem`).
- **Component Scale (`em`)**: Bound to local element typography. Use for button padding, badge gutters, and text-adjacent icons.

```css
/* Clean Boundary Example */
.button {
  font-size: 1rem; /* Global Application Scale */
  padding: 0.75em 1.2em; /* Local Component Scale */
}

.button .icon {
  width: 1em; /* Local Component Scale (matches button text size) */
  height: 1em;
}
```

---

## 7. Property-to-Unit Recommendation Guide

| CSS Property                      | Recommended Unit    | Architectural Rationale                                        |
| :-------------------------------- | :------------------ | :------------------------------------------------------------- |
| **`font-size` (Global)**          | `rem`               | Respects user accessibility preferences and root scaling.      |
| **`font-size` (Fluid Component)** | `clamp() + cqi`     | Scales smoothly with component width.                          |
| **`margin` / `gap` (Global)**     | `rem`               | Keeps spacing tokens uniform across layout.                    |
| **`padding` (Component)**         | `em` / `cqi`        | Scales proportionally with local font size or container width. |
| **`border` / `box-shadow`**       | `px`                | Precision hairlines that should not blur on font zoom.         |
| **`width` / `max-width`**         | `%` / `rem` / `cqi` | Fluid constraints across parent containers.                    |
| **`height` (Mobile Fullscreen)**  | `dvh` / `svh`       | Handles collapsing mobile address bars safely.                 |
| **`max-width` (Articles)**        | `ch`                | Caps line length at 60–75 characters for optimal readability.  |
| **Print rules**                   | `pt` / `cm`         | Accurate scaling on physical paper output.                     |
