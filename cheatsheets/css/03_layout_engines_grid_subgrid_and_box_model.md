# 03. Layout Engines, Grid, Subgrid & Box Model

> An architectural guide to the CSS layout engine: Box model hierarchy, percentage margin quirks, CSS Grid RAM layout, Subgrid cross-card alignment, `aspect-ratio`, and CSS Logical Properties.

---

## 📑 Table of Contents

- [03. Layout Engines, Grid, Subgrid \& Box Model](#03-layout-engines-grid-subgrid--box-model)
  - [📑 Table of Contents](#-table-of-contents)
  - [1. Box Model Hierarchy \& The `box-sizing` Overflow Paradox](#1-box-model-hierarchy--the-box-sizing-overflow-paradox)
    - [The Problem](#the-problem)
    - [The Mathematical Cause](#the-mathematical-cause)
    - [The Architectural Solution: Use `width: auto;`](#the-architectural-solution-use-width-auto)
  - [2. Why Vertical Percentage Margins \& Paddings Resolve Relative to Width](#2-why-vertical-percentage-margins--paddings-resolve-relative-to-width)
    - [Why: Preventing Infinite Recursive Layout Loops](#why-preventing-infinite-recursive-layout-loops)
  - [3. Flexbox (1D) vs. CSS Grid (2D) Layout Paradigm](#3-flexbox-1d-vs-css-grid-2d-layout-paradigm)
  - [4. CSS Grid \& The RAM Pattern (Repeat, Auto, Minmax)](#4-css-grid--the-ram-pattern-repeat-auto-minmax)
    - [`auto-fit` vs. `auto-fill`:](#auto-fit-vs-auto-fill)
  - [5. CSS Subgrid (Cross-Component Track Alignment)](#5-css-subgrid-cross-component-track-alignment)
  - [The Problem](#the-problem-1)
    - [The Subgrid Solution](#the-subgrid-solution)
  - [6. CSS Positioning \& Offset Parent Resolution](#6-css-positioning--offset-parent-resolution)
    - [CSS Positioning Master Matrix](#css-positioning-master-matrix)
    - [Critical Gotchas with `position: sticky`:](#critical-gotchas-with-position-sticky)
  - [7. Creating a Stacking Context \& `isolation: isolate`](#7-creating-a-stacking-context--isolation-isolate)
    - [What is a Stacking Context?](#what-is-a-stacking-context)
    - [The Complete List of Stacking Context Triggers](#the-complete-list-of-stacking-context-triggers)
    - [Explicit Stacking Context with `isolation: isolate`](#explicit-stacking-context-with-isolation-isolate)
      - [The Problem with Legacy Hacks](#the-problem-with-legacy-hacks)
      - [The Modern Standard: `isolation: isolate`](#the-modern-standard-isolation-isolate)
  - [8. CSS `aspect-ratio` (Preventing Cumulative Layout Shift)](#8-css-aspect-ratio-preventing-cumulative-layout-shift)
  - [9. CSS Logical Properties \& Internationalization (i18n)](#9-css-logical-properties--internationalization-i18n)

---

## 1. Box Model Hierarchy & The `box-sizing` Overflow Paradox

### The Problem

A child element has `width: 100%`, `padding: 1rem`, and `margin: 1rem`. It overflows its parent horizontally even when `box-sizing: border-box` is set. Why?

```
┌───────────────────────────────────────────────┐
│ MARGIN BOX (Outside border-box)              │
│  ┌─────────────────────────────────────────┐  │
│  │ BORDER BOX                              │  │
│  │  ┌───────────────────────────────────┐  │  │
│  │  │ PADDING BOX                       │  │  │
│  │  │  ┌─────────────────────────────┐  │  │  │
│  │  │  │ CONTENT BOX                 │  │  │  │
│  │  │  │                             │  │  │  │
│  │  │  └─────────────────────────────┘  │  │  │
│  │  └───────────────────────────────────┘  │  │
│  └─────────────────────────────────────────┘  │
└───────────────────────────────────────────────┘
```

### The Mathematical Cause

`box-sizing: border-box` includes `padding` and `border` inside the declared `width`, but **`margin` is always placed outside the border box**.

When `width: 100%` is declared, the element's border box occupies 100% of the parent width. Adding margins produces:

$$\text{Total Rendered Footprint} = 1\text{rem (left margin)} + 100\% + 1\text{rem (right margin)} = 100\% + 2\text{rem}$$

Because $100\% + 2\text{rem} > 100\%$, the element overflows the parent container by exactly `2rem`.

### The Architectural Solution: Use `width: auto;`

In standard block flow, elements default to `width: auto`. Under `width: auto`, the browser automatically computes:

$$\text{Content Width} = \text{Parent Width} - (\text{margins} + \text{borders} + \text{paddings})$$

```css
.card-child {
  /* Do NOT write width: 100% */
  width: auto;
  margin: 1rem;
  padding: 1rem;
  box-sizing: border-box; /* Fits parent perfectly without overflow */
}
```

---

## 2. Why Vertical Percentage Margins & Paddings Resolve Relative to Width

If you write `padding-top: 50%` or `margin-top: 20%`, the browser resolves the pixel value against the parent's **width (inline size)**, NOT its height.

### Why: Preventing Infinite Recursive Layout Loops

If vertical margins/paddings resolved against parent **height**:

```
1. Child declares padding-top: 50% of parent height.
2. Adding top padding increases the child's computed height.
3. Child height increases parent's auto height.
4. Taller parent causes padding-top to increase again.
5. RECURSIVE INFINITE LOOP → Browser hangs / crashes!
```

To guarantee that layout calculation is a fast, single-pass algorithm, CSS Box Model Level 3 dictates that **all four sides of margin and padding resolve against the containing block's width**.

---

## 3. Flexbox (1D) vs. CSS Grid (2D) Layout Paradigm

CSS provides two complementary modern layout systems with fundamentally different dimensional responsibilities:

```
      Flexbox (1-Dimensional)                      CSS Grid (2-Dimensional)
┌─────────────────────────────────┐        ┌─────────────────────────────────┐
│ [ Item 1 ] [ Item 2 ] [ Item 3 ]│        │ [ Column 1 ]  │  [ Column 2 ]   │
│ ─── Main Axis (Row OR Col) ───► │        │ ──────────────┼──────────────── │
└─────────────────────────────────┘        │ [ Row 1 ]     │  [ Row 1 ]      │
                                           │ [ Row 2 ]     │  [ Row 2 ]      │
                                           └─────────────────────────────────┘
```

| Dimension                | Flexbox (1D)                                                                                  | CSS Grid (2D)                                                                               |
| :----------------------- | :-------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------ |
| **Axis Model**           | **1-Dimensional**: Works along a single primary axis at a time (either `row` OR `column`).    | **2-Dimensional**: Controls rows AND columns simultaneously.                                |
| **Design Philosophy**    | **Content-First**: Items dictate their size and space distribution along the flow.            | **Layout-First**: The container declares strict track grids into which children land.       |
| **Cross-Axis Alignment** | Individual rows/columns wrap independently without vertical column alignment across rows.     | Aligns items precisely along horizontal AND vertical track baselines simultaneously.        |
| **Best For**             | Navbars, toolbars, buttons with icons, input groups, vertical card stacks, perfect centering. | Multi-column dashboards, photo galleries, magazine editorial grids, complex tile templates. |

```css
/* Flexbox 1D Example (Navbar) */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

/* Grid 2D Example (Dashboard Page Grid) */
.dashboard-grid {
  display: grid;
  grid-template-columns: 260px 1fr 320px;
  grid-template-rows: 70px 1fr 60px;
  gap: 1.5rem;
}
```

---

## 4. CSS Grid & The RAM Pattern (Repeat, Auto, Minmax)

The **RAM pattern** (Repeat, Auto-fit/Auto-fill, Minmax) creates robust, responsive multi-column layouts without writing a single media query:

```css
.card-grid {
  display: grid;
  /* Columns adapt dynamically: minimum 280px, maximum 1fr */
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}
```

### `auto-fit` vs. `auto-fill`:

- **`auto-fit`**: Expands existing cards to fill leftover empty space in the row.
- **`auto-fill`**: Reserves empty column slots for future items without expanding existing cards.

---

## 5. CSS Subgrid (Cross-Component Track Alignment)

## The Problem

In standard CSS Grid cards with variable-length text descriptions, footer action buttons do not align vertically across columns because each card establishes an isolated, independent formatting context.

### The Subgrid Solution

`grid-template-rows: subgrid;` allows nested card items to participate in parent grid rows:

```css
/* 1. Parent Grid */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  grid-auto-rows: auto;
  gap: 1.5rem;
}

/* 2. Child Card spans 3 parent rows and adopts subgrid */
.product-card {
  display: grid;
  grid-row: span 3;
  grid-template-rows: subgrid; /* Shares row heights across all cards */
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.card-title {
  /* Row 1 */
}

.card-description {
  /* Row 2: All descriptions in the same row expand to match the tallest text */
}

.card-button {
  /* Row 3: Buttons align on the exact same baseline across all cards */
  align-self: end;
}
```

---

## 6. CSS Positioning & Offset Parent Resolution

The `position` property determines how an element is placed within the document flow and how its offset coordinates (`top`, `right`, `bottom`, `left`, `inset`) are calculated:

### CSS Positioning Master Matrix

| Position Value           | In Document Flow?                     | Offset Parent (`offsetParent`) / Coordinate Reference                                                                        | Primary Use Case                                         |
| :----------------------- | :------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------- |
| **`static`** _(Default)_ | **Yes**                               | **Not applicable** (Offsets `top`/`left` are ignored).                                                                       | Standard document flow.                                  |
| **`relative`**           | **Yes**                               | **Nearest positioned ancestor** (Offsets visually move element relative to its own natural slot without affecting siblings). | Anchor container for `absolute` children; micro-offsets. |
| **`absolute`**           | **No** _(Removed from flow)_          | **Nearest positioned ancestor** (`relative`, `absolute`, `fixed`, `sticky`).                                                 | Floating badges, tooltip popups, dropdown menus.         |
| **`fixed`**              | **No** _(Removed from flow)_          | **Browser Viewport** _(Unless ancestor has `transform`, `filter`, or `perspective`)_.                                        | Sticky global headers, floating action buttons, modals.  |
| **`sticky`**             | **Yes\*** _(In-flow until threshold)_ | **Nearest Scrolling Container (Scrollport)**.                                                                                | Sticky table header rows, alphabetized contacts sidebar. |

### Critical Gotchas with `position: sticky`:

1. **Requires an Offset**: `position: sticky;` does nothing unless you declare at least one coordinate threshold (e.g. `top: 0;`).
2. **Container Bound**: A sticky element only remains sticky **inside its immediate parent container**. When the parent scrolls out of the viewport, the sticky element scrolls away with it.
3. **The Overflow Trap**: Setting `overflow: hidden`, `overflow: auto`, or `overflow: clip` on **ANY ancestor element** between the sticky item and the viewport will break `position: sticky`.

---

## 7. Creating a Stacking Context & `isolation: isolate`

### What is a Stacking Context?

A **Stacking Context** is an isolated 3D layering boundary along the Z-axis. Child elements with `z-index` inside a stacking context are rendered relative to that context and **can never escape or poke through higher stacking contexts in the outer document**.

```
Document Root Stacking Context
 ├── Modal [z-index: 1000]
 └── Card A [Stacking Context created, z-index: 1]
      └── Tooltip [z-index: 999999] ◄── CANNOT appear above Modal! (Locked inside Card A)
```

---

### The Complete List of Stacking Context Triggers

A new stacking context is formed by any of the following properties:

1. **Root element** (`<html>`).
2. **`position: fixed`** or **`position: sticky`** (on all modern browsers).
3. **`z-index` other than `auto`** on:
   - A positioned element (`position: relative` or `position: absolute`).
   - A child of a Flex container (`display: flex`).
   - A child of a Grid container (`display: grid`).
4. **`opacity` less than `1`** (e.g. `opacity: 0.99`).
5. **`mix-blend-mode` other than `normal`**.
6. **`transform`, `filter`, `backdrop-filter`, `perspective`, `clip-path`, `mask`, `mask-image`, `mask-box-image`** other than `none`.
7. **`container-type` set to `size` or `inline-size`** (all query container elements).
8. **`isolation: isolate`** _(Explicit creation)_.
9. **`will-change`** specifying any property that creates a stacking context (e.g. `will-change: transform`).
10. **`contain`** set to `layout`, `paint`, `strict`, or `content`.

---

### Explicit Stacking Context with `isolation: isolate`

#### The Problem with Legacy Hacks

Historically, developers created stacking contexts using arbitrary hacks:

```css
/* ❌ Legacy Hack */
.card {
  position: relative;
  z-index: 0; /* Unintended side effects if positioning wasn't needed */
}
```

#### The Modern Standard: `isolation: isolate`

`isolation: isolate` is the **cleanest, most explicit CSS declaration** to scope child `z-index` values without altering positioning or layout:

```css
/* ✅ Modern Architectural Best Practice */
.card {
  isolation: isolate; /* Explicitly creates a new stacking context */
}

.card .decorative-blob {
  position: absolute;
  z-index: -1; /* Sits behind card text, but NEVER behind the card container's background! */
}
```

---

## 8. CSS `aspect-ratio` (Preventing Cumulative Layout Shift)

Replaces legacy padding-bottom hacks (`padding-bottom: 56.25%` for 16:9) to allocate space before media assets download:

```css
/* Modern Clean Standard */
.video-container {
  width: 100%;
  aspect-ratio: 16 / 9;
}

.avatar {
  width: 48px;
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  object-fit: cover;
}
```

---

## 9. CSS Logical Properties & Internationalization (i18n)

Logical properties replace physical directional coordinates (`left`, `right`, `top`, `bottom`) with writing-mode-aware flow dimensions (`inline`, `block`).

```
           Physical (LTR)                       Logical
┌─────────────────────────────────┐   ┌─────────────────────────────────┐
│           margin-top            │   │        margin-block-start       │
│ margin-left        margin-right │   │ margin-inline-start   -inline-end│
│          margin-bottom          │   │         margin-block-end        │
└─────────────────────────────────┘   └─────────────────────────────────┘
```

| Physical Property              | Modern Logical Equivalent                      | Function                                      |
| :----------------------------- | :--------------------------------------------- | :-------------------------------------------- |
| `width` / `height`             | `inline-size` / `block-size`                   | Reading axis width vs block height.           |
| `margin-left` / `margin-right` | `margin-inline-start` / `margin-inline-end`    | Adapts automatically to RTL (Arabic/Hebrew).  |
| `margin-top` / `margin-bottom` | `margin-block-start` / `margin-block-end`      | Adapts to vertical writing modes (Japanese).  |
| `padding: 12px 24px;`          | `padding-block: 12px; padding-inline: 24px;`   | Shorthand for block and inline axis paddings. |
| `top: 0; left: 0;`             | `inset-block-start: 0; inset-inline-start: 0;` | Absolute positioning coordinates.             |
| `border-left: 2px solid;`      | `border-inline-start: 2px solid;`              | Border on leading edge.                       |
