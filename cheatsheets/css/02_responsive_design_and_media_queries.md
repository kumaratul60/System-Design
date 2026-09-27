# 02. Responsive Design, Media Queries & Breakpoints

> A complete master guide to responsive architecture: Media Queries vs. Container Queries, Media Types, modern range comparison syntax, standard 5-device breakpoint matrix, Mobile-First strategies, and fluid typography.

---

## Table of Contents

- [02. Responsive Design, Media Queries \& Breakpoints](#02-responsive-design-media-queries--breakpoints)
  - [Table of Contents](#table-of-contents)
  - [1. Media Queries vs. Container Queries](#1-media-queries-vs-container-queries)
  - [2. Media Types \& Stylesheet Loading](#2-media-types--stylesheet-loading)
    - [Loading Stylesheets Conditionally:](#loading-stylesheets-conditionally)
  - [3. Media Features](#3-media-features)
    - [Active Features \& User Preferences](#active-features--user-preferences)
    - [3.1 Deep Dive: `prefers-reduced-motion` (When to Use \& When NOT to Use)](#31-deep-dive-prefers-reduced-motion-when-to-use--when-not-to-use)
      - [Why It Matters:](#why-it-matters)
      - [Values Matrix:](#values-matrix)
      - [✅ WHEN TO USE `prefers-reduced-motion` (What MUST be reduced):](#-when-to-use-prefers-reduced-motion-what-must-be-reduced)
      - [❌ WHEN NOT TO USE / Anti-Patterns (What NOT to do):](#-when-not-to-use--anti-patterns-what-not-to-do)
      - [Implementation Strategies:](#implementation-strategies)
    - [⚠️ Deprecated `device-*` Media Features](#️-deprecated-device--media-features)
  - [4. Modern Range Comparison Syntax](#4-modern-range-comparison-syntax)
  - [5. Standard 5-Device Breakpoint Matrix](#5-standard-5-device-breakpoint-matrix)
  - [6. Mobile-First (`min-width`) Architecture](#6-mobile-first-min-width-architecture)
    - [Why Mobile-First is the Industry Standard:](#why-mobile-first-is-the-industry-standard)
  - [7. Fluid Typography with `clamp()` (Bypassing Breakpoints)](#7-fluid-typography-with-clamp-bypassing-breakpoints)

---

## 1. Media Queries vs. Container Queries

| Dimension               | Media Queries (`@media`)                                                | Container Queries (`@container`)                                                                                              |
| :---------------------- | :---------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------- |
| **Reference Context**   | Global Browser Window Viewport.                                         | Nearest ancestor with `container-type`.                                                                                       |
| **Architectural Scope** | Macro page structure (page grid, navbars, sidebars).                    | Micro component modularity (cards, dialogs, widgets).                                                                         |
| **Modularity**          | ❌ Low (sidebar cards look identical to hero cards on desktop screens). | ⭐ High (the exact same card component automatically adapts whether placed in a 300px sidebar, 400px column, or 1200px hero). |

```css
/* Media Query: Page-level grid */
@media (min-width: 1024px) {
  .dashboard-layout {
    display: grid;
    grid-template-columns: 280px 1fr;
  }
}

/* Container Query: Component-level adaptation */
.card-wrapper {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 450px) {
  .card {
    display: flex;
    flex-direction: row;
  }
}
```

---

## 2. Media Types & Stylesheet Loading

Media types specify the hardware category intended for the styles.

```css
@media all {
  /* All devices (Default) */
}
@media screen {
  /* Digital screens (Desktops, tablets, phones) */
}
@media print {
  /* Print preview and physical paper output */
}
@media speech {
  /* Screen readers and speech synthesizers */
}
```

> **Deprecated Legacy Media Types:** `handheld`, `tv`, `projection`, `embossed`, `braille`, `tty`, `aural`.

### Loading Stylesheets Conditionally:

```html
<!-- HTML link tags (Optimizes browser resource priority) -->
<link rel="stylesheet" href="screen.css" media="screen" />
<link rel="stylesheet" href="print.css" media="print" />
<link rel="stylesheet" href="tablet-up.css" media="screen and (min-width: 768px)" />
```

```css
/* In CSS @import statements */
@import url('global-screen.css') screen;
@import url('print-format.css') print;
@import url('multi.css') screen, print;
```

---

## 3. Media Features

### Active Features & User Preferences

| Media Feature Category               | Modern Properties                                                                     | Example Usage                                                                      |
| :----------------------------------- | :------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------- |
| **Viewport Dimensions**              | `width`, `height`, `aspect-ratio`, `orientation`                                      | `@media (orientation: landscape)`                                                  |
| **User Accessibility & Preferences** | `prefers-color-scheme`, `prefers-reduced-motion`, `prefers-contrast`, `forced-colors` | `@media (prefers-color-scheme: dark)`<br>`@media (prefers-reduced-motion: reduce)` |
| **Display Hardware & Resolution**    | `resolution`, `color`, `color-index`, `monochrome`, `scan`, `grid`                    | `@media (resolution >= 2dppx)`                                                     |

```css
/* Dark Mode Preference */
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0f172a;
    --text: #f8fafc;
  }
}
```

---

### 3.1 Deep Dive: `prefers-reduced-motion` (When to Use & When NOT to Use)

The `prefers-reduced-motion` media query detects if the user has enabled an operating system accessibility setting to minimize non-essential motion (macOS/iOS _Reduce Motion_, Windows _Animation Effects: Off_, Android _Remove Animations_).

#### Why It Matters:

Users with **vestibular disorders, vertigo, motion sickness, or ADHD/cognitive sensitivity** can experience physical nausea, dizziness, or loss of focus when exposed to large animated movements.

---

#### Values Matrix:

- **`no-preference`**: Default. The user has not requested motion reduction.
- **`reduce`**: The user explicitly requested minimal or no non-essential animations.

---

#### ✅ WHEN TO USE `prefers-reduced-motion` (What MUST be reduced):

1. **Large Spatial Movement Across the Screen**:
   - Flying elements, drawer slide-ins covering large distances, hero parallax scrolling.
2. **3D Transformations & Rotations**:
   - Card flips, 3D cube rotations, spinning splash logos.
3. **Smooth Viewport Auto-Scrolling**:
   - `scroll-behavior: smooth` (disorienting for vestibular conditions; must revert to `auto`).
4. **Rapid Scaling, Pulsing & Flashing**:
   - Pulsing notification badges, bouncing action buttons, flashing banners.
5. **Continuous Unprompted Motion**:
   - Auto-rotating carousels, animated background particles, continuous marquee tickers.

---

#### ❌ WHEN NOT TO USE / Anti-Patterns (What NOT to do):

1. **❌ Anti-Pattern: Setting `animation: none !important; transition: none !important;` Everywhere**:
   - **Why this breaks apps**: If JavaScript listens for `animationend` or `transitionend` to remove a modal or unmount a component, setting `none` completely breaks application logic because the events never fire!
   - **Fix**: Use `0.01ms !important` duration instead:
     ```css
     @media (prefers-reduced-motion: reduce) {
       *,
       *::before,
       *::after {
         animation-duration: 0.01ms !important;
         animation-iteration-count: 1 !important;
         transition-duration: 0.01ms !important;
         scroll-behavior: auto !important;
       }
     }
     ```
2. **❌ Anti-Pattern: Removing Essential Functional Animations**:
   - Progress bar filling from $0\%$ to $100\%$ during a file upload or download.
   - Video playback or educational animated diagrams.
   - Micro-interaction state confirmation (e.g. checkbox checkmark drawing).
3. **❌ Anti-Pattern: Making UI Changes Jarring Without Visual Hierarchy**:
   - Don't just remove motion—**substitute spatial motion with non-disorienting opacity cross-fades**:

```css
/* ✅ BEST PRACTICE: Substitute Spatial Slide with Opacity Fade */
.dialog {
  /* Default: Smooth Slide + Fade */
  transform: translateY(0);
  opacity: 1;
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

@starting-style {
  .dialog {
    transform: translateY(30px);
    opacity: 0;
  }
}

/* Graceful Degradation for Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .dialog {
    /* No spatial Y-axis movement; only fade opacity */
    transform: none !important;
    transition: opacity 0.15s ease !important;
  }

  @starting-style {
    .dialog {
      transform: none !important;
      opacity: 0;
    }
  }
}
```

---

#### Implementation Strategies:

| Strategy                    | Pattern                                                                          | Architectural Recommendation                                      |
| :-------------------------- | :------------------------------------------------------------------------------- | :---------------------------------------------------------------- |
| **Global Safety Net**       | Force `0.01ms` duration across all elements in a reset layer.                    | **Required baseline** for every production codebase.              |
| **Progressive Enhancement** | Wrap complex animations inside `@media (prefers-reduced-motion: no-preference)`. | **Best for rich marketing sites** (opt-in animation).             |
| **Substitute Motion**       | Replace sliding/zooming with simple opacity fading.                              | **Best for Design System components** (modals, tooltips, toasts). |

---

### ⚠️ Deprecated `device-*` Media Features

- ❌ **Deprecated:** `device-width`, `device-height`, `device-aspect-ratio`, `min-device-width`, `max-device-width`.
- **Why they were deprecated:** `device-*` measured the physical resolution of the screen hardware itself, ignoring the actual browser window size (breaking split-screen multi-tasking on iPad/macOS/Windows and orientation changes).
- **Rule:** Always use standard `width`, `height`, and `aspect-ratio` with `min-*` / `max-*` or range operators.

---

## 4. Modern Range Comparison Syntax

Modern CSS eliminates repetitive `min-width` and `max-width` strings with standard mathematical comparison operators (`<`, `<=`, `>`, `>=`):

```css
/* Legacy Verbose Syntax */
@media (min-width: 768px) and (max-width: 1023px) {
  .sidebar {
    display: block;
  }
}

/* Modern Clean Range Syntax */
@media (768px <= width < 1024px) {
  .sidebar {
    display: block;
  }
}

@media (width >= 1280px) {
  .container {
    max-width: 1200px;
  }
}
```

---

## 5. Standard 5-Device Breakpoint Matrix

Industry-standard responsive layouts map to **5 primary device boundaries**:

| Device Class                   | Viewport Range    | Breakpoint Token | Recommended Media Query                     |
| :----------------------------- | :---------------- | :--------------- | :------------------------------------------ |
| **Mobile Portrait**            | `< 640px`         | _Base (Default)_ | _No media query (Mobile-First base styles)_ |
| **Mobile Landscape / Phablet** | `640px – 767px`   | `sm`             | `@media (min-width: 640px)`                 |
| **Tablet Portrait**            | `768px – 1023px`  | `md`             | `@media (min-width: 768px)`                 |
| **Tablet Landscape / Laptop**  | `1024px – 1279px` | `lg`             | `@media (min-width: 1024px)`                |
| **Desktop**                    | `1280px – 1535px` | `xl`             | `@media (min-width: 1280px)`                |
| **Large Desktop / Ultrawide**  | `≥ 1536px`        | `2xl`            | `@media (min-width: 1536px)`                |

---

## 6. Mobile-First (`min-width`) Architecture

### Why Mobile-First is the Industry Standard:

1. **Natural Progressive Enhancement**: The base stylesheet handles single-column layouts for small mobile devices. As screens expand, media queries with `min-width` layer on multi-column grid rules and larger paddings.
2. **Eliminates Negative Overrides**: Desktop-first (`max-width`) forces developers to declare complex multi-column styles first, only to repeatedly reset them (`float: none; width: 100%; margin: 0; display: block;`) on mobile screens.

```css
/* Base Styles: Mobile Portrait (<640px) */
.page-container {
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

/* sm: Phablets / Landscape (>=640px) */
@media (min-width: 640px) {
  .page-container {
    padding: 1.5rem;
  }
}

/* md: Tablet Portrait (>=768px) */
@media (min-width: 768px) {
  .page-container {
    display: grid;
    grid-template-columns: 240px 1fr;
    gap: 1.5rem;
  }
}

/* lg: Laptop / Desktop (>=1024px) */
@media (min-width: 1024px) {
  .page-container {
    grid-template-columns: 280px 1fr 260px;
    padding: 2rem;
  }
}
```

---

## 7. Fluid Typography with `clamp()` (Bypassing Breakpoints)

Instead of stepping typography with abrupt font-size jumps across breakpoints, use mathematical `clamp()` for smooth, continuous fluid scaling:

$$\text{font-size: clamp(}\langle\text{min-size}\rangle\text{, }\langle\text{preferred fluid value}\rangle\text{, }\langle\text{max-size}\rangle\text{);}$$

```css
/* Fluid Main Heading: Min 1.5rem (24px), Preferred 3.5vw + 0.5rem, Max 3.5rem (56px) */
h1 {
  font-size: clamp(1.5rem, 3.5vw + 0.5rem, 3.5rem);
  line-height: 1.15;
}

/* Fluid Body Text: Scales seamlessly between 16px and 20px */
body {
  font-size: clamp(1rem, 0.5vw + 0.875rem, 1.25rem);
}
```
