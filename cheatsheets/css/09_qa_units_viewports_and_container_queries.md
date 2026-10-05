# CSS Q&A: Units, Viewports & Container Queries

> Part 2 of the Master Architectural CSS Q&A Guide covering container query dimensions, writing mode axes, unit fallback mechanics, viewport nuances (`dvh`/`svh`), mathematical branching, and design system scale (`rem` vs `em`).

---

## Table of Contents

- [1. Container Query Units Fallback Behavior (`cqi` without Container)](#1-container-query-units-fallback-behavior-cqi-without-container)
- [2. `cqi` (Container Query Inline) vs `cqw` & `writing-mode`](#2-cqi-container-query-inline-vs-cqw--writing-mode)
- [3. Major Pitfalls of Container Query Units](#3-major-pitfalls-of-container-query-units)
- [4. Conditional `border-radius` Using `cqi` and `sign()`](#4-conditional-border-radius-using-cqi-and-sign)
- [5. CSS Pixels (`px`) vs Physical Retina Pixels & DPR](#5-css-pixels-px-vs-physical-retina-pixels--dpr)
- [6. Mobile Viewport Quirks: `100vh` vs `100%` vs `100dvh`](#6-mobile-viewport-quirks-100vh-vs-100-vs-100dvh)
- [7. Application Scale (`rem`) vs Component Scale (`em`)](#7-application-scale-rem-vs-component-scale-em)
- [8. `em` Compounding in Nested Component Hierarchies](#8-em-compounding-in-nested-component-hierarchies)

---

## 1. Container Query Units Fallback Behavior (`cqi` without Container)

### The Problem

If no ancestor element declares `container-type`, but an element uses `cqi` units, what does it measure?

---

### 1. WHAT: The Viewport Fallback Rule

According to **W3C CSS Containment Level 3**:

> When an element uses container query units (`cqi`, `cqw`, `cqb`, `cqh`, `cqmin`, `cqmax`) but has no query container ancestor in the DOM tree, the units default to the **Small Viewport (`sv*`) dimensions**.

- `1cqi` falls back to `1svi` (1% of Small Viewport Inline size, i.e., `1svw` in horizontal text).
- `1cqw` falls back to `1svw`.
- `1cqh` falls back to `1svh`.

---

### 2. WHY: The Asymmetry Between `@container` and `cqi` Units

| CSS Feature                                 | Behavior When NO `container-type` Exists                               |
| :------------------------------------------ | :--------------------------------------------------------------------- |
| **`@container (min-width: 400px) { ... }`** | **Fails / Evaluates to `false`**. Styles inside the block are ignored. |
| **`font-size: 5cqi;` or `width: 50cqi;`**   | **Executes anyway!** Falls back to 5% / 50% of the browser's viewport. |

#### Practical Danger:

If a developer forgets `container-type: inline-size` on a wrapper, a component placed in a narrow `250px` sidebar will calculate `cqi` based on a full `1920px` screen viewport, causing text to blow up and overflow the sidebar.

---

### Key Engineering Takeaway

> Container query units do not fail or resolve to zero without a container—they silently fall back to the Small Viewport (`svi`/`svw`). Always ensure `container-type: inline-size` is declared on the component wrapper.

---

## 2. `cqi` (Container Query Inline) vs `cqw` & `writing-mode`

### 1. WHAT: Logical vs Physical Container Dimensions

- **`cqw` (Container Query Width)**: A **physical unit** tied strictly to the horizontal X-axis.
- **`cqi` (Container Query Inline)**: A **logical unit** that adapts dynamically to the document or component `writing-mode`.

| Writing Mode                                          | Layout Direction | Inline Axis (`cqi`)                   | Block Axis (`cqb`)                    |
| :---------------------------------------------------- | :--------------- | :------------------------------------ | :------------------------------------ |
| **`horizontal-tb`** (English, Hindi, Arabic)          | Horizontal lines | **Horizontal Width** (`1cqi == 1cqw`) | **Vertical Height** (`1cqb == 1cqh`)  |
| **`vertical-rl` / `vertical-lr`** (Japanese, Chinese) | Vertical lines   | **Vertical Height** (`1cqi == 1cqh`)  | **Horizontal Width** (`1cqb == 1cqw`) |

---

### 2. WHY: `cqi` is the Modern Best Practice

1. **Internationalization (i18n)**: Automatically adapts when components render in vertical writing systems without manual CSS overrides.
2. **Logical Property Consistency**: Pairs with `padding-inline`, `margin-inline`, and `inline-size`.
3. **Architectural Symmetry**: Perfectly matches `container-type: inline-size`.

---

### Key Engineering Takeaway

> `cqi` is a logical unit representing 1% of the container's inline size. In horizontal text it matches `cqw`, but in vertical writing modes it tracks height. It should be preferred over physical `cqw` for internationalized modular design systems.

---

## 3. Major Pitfalls of Container Query Units

### 1. Silent Viewport Fallback

- **Problem**: Forgetting `container-type: inline-size`.
- **Consequence**: `cqi` measures the entire browser window instead of the component width.

### 2. Infinite Reflow Loops with `container-type: size`

- **Problem**: Setting `container-type: size` on a container whose height depends on child text wrapping.
- **Consequence**: Child text wraps -> container height changes -> query re-evaluates -> infinite layout loop.
- **Fix**: Use `container-type: inline-size`. Only use `size` if the container has a strictly fixed `height`.

### 3. Unclamped Typography

- **Problem**: Writing raw `font-size: 4cqi`.
- **Consequence**: Text becomes microscopic ($6\text{px}$) in narrow widgets and massive ($50\text{px}$) in wide panels.
- **Fix**: Always wrap in `clamp()`:
  ```css
  font-size: clamp(0.9rem, 3.5cqi + 0.5rem, 2rem);
  ```

### 4. `display: inline` Containers

- **Problem**: Adding `container-type` to a `<span>`.
- **Consequence**: Container queries do not function because inline elements do not generate block formatting or containment boxes. Must be `block`, `inline-block`, `grid`, or `flex`.

---

### Key Engineering Takeaway

> Build container query components with `container-type: inline-size`, constrain typography with `clamp()`, and name nested containers with `container-name` to prevent inheritance collisions.

---

## 4. Conditional `border-radius` Using `cqi` and `sign()`

### The Problem

When a card fits into a desktop grid ($> 500\text{px}$), it should have `border-radius: 16px`. When it collapses into a mobile full-bleed layout ($\le 500\text{px}$), the border-radius should dynamically become `0px`.

---

### HOW: Code Implementation

```css
.card-wrapper {
  container-type: inline-size;
}

/* Method A: Using CSS sign() (CSS Values Level 4) */
/* sign(100cqi - 500px):
   - Returns -1 when container < 500px -> max(0, -1) = 0 -> 0px
   - Returns +1 when container > 500px -> max(0, 1)  = 1 -> 16px */
.card {
  border-radius: calc(max(0, sign(100cqi - 500px)) * 16px);
}

/* Method B: Cross-browser fallback using clamp() multiplier */
.card {
  border-radius: clamp(0px, (100cqi - 500px) * 9999, 16px);
}
```

---

### Key Engineering Takeaway

> Combining container inline units (`100cqi`) with `sign()` or `clamp()` creates mathematical switch logic in pure CSS, enabling conditional styling (like full-bleed flattening) without media queries.

---

## 5. CSS Pixels (`px`) vs Physical Retina Pixels & DPR

### 1. WHAT: Abstract CSS Pixels vs Hardware Dots

- **CSS Pixel (`px`)**: A logical, abstract unit of coordinate space.
- **Physical Pixel**: An actual microscopic hardware LED/OLED emitter on the screen.

---

### 2. WHY: Device Pixel Ratio (DPR)

$$\text{Physical Pixels} = \text{CSS Pixels} \times \text{Device Pixel Ratio (DPR)}$$

- **Standard (DPR = 1)**: $1\text{px}$ maps to 1 hardware pixel.
- **Retina (DPR = 2)**: $1\text{px}$ maps to a $2 \times 2$ grid (4 physical pixels).
- **Ultra-High (DPR = 3)**: $1\text{px}$ maps to a $3 \times 3$ grid (9 physical pixels).

---

### Key Engineering Takeaway

> CSS pixels represent angular resolution to ensure physical layout dimensions remain identical across displays, while high-DPI screens use higher DPRs to render vector curves, fonts, and borders with superior sharpness.

---

## 6. Mobile Viewport Quirks: `100vh` vs `100%` vs `100dvh`

### 1. The Mobile Viewport Bug with `100vh`

On mobile browsers (iOS Safari, Chrome Android), dynamic address bars expand and collapse. Standard `100vh` calculates assuming the address bar is hidden, causing `100vh` containers to overflow the visible screen and cut off bottom action buttons.

---

### 2. Modern Viewport Units Solution

- **`100svh` (Small Viewport)**: Safe height assuming toolbars are fully expanded.
- **`100lvh` (Large Viewport)**: Max height assuming toolbars are fully collapsed.
- **`100dvh` (Dynamic Viewport)**: Resizes dynamically as toolbars expand or collapse.

```css
/* ✅ Safe Fullscreen Mobile Hero */
.hero-section {
  height: 100dvh;
}
```

---

### Key Engineering Takeaway

> Use `100dvh` for dynamic fullscreen mobile layouts and `100svh` for guaranteed visible space to prevent mobile browser address bars from obscuring UI buttons.

---

## 7. Application Scale (`rem`) vs Component Scale (`em`)

### 1. Sizing Boundaries

- **`rem` (Application Scale)**: Based on root `html` font size ($16\text{px}$). Scales globally with user accessibility preferences. Use for typography, layout grids, container max-widths, and design system spacing tokens.
- **`em` (Component Scale)**: Based on the immediate element/parent font size. Scales proportionally with local typography. Use for button padding, inline icons, badges, and chips.

```css
.button {
  font-size: 1rem; /* Global application scale */
  padding: 0.75em 1.2em; /* Local component scale (proportional to button text) */
}
```

---

### Key Engineering Takeaway

> Explicit architectural boundaries dictate using `rem` for global typography and layout rhythm, and `em` strictly for component-internal spacing that must scale with font variations.

---

## 8. `em` Compounding in Nested Component Hierarchies

### 1. The Hidden Compounding Bug

When nested elements repeatedly use `em` for typography:
$$\text{Grandchild} = 20\text{px} \times 1.5 \times 1.5 = 45\text{px}$$
$$\text{Great-Grandchild} = 45\text{px} \times 1.5 = 67.5\text{px}$$

Typography compounds exponentially, causing reusable components to break depending on where they are mounted in the DOM.

---

### 2. Best Practice Rule

- **Never use `em` for font sizes** in nested component trees.
- **Use `rem` for all typography**, and restrict `em` exclusively to internal paddings and icons.

---

### Key Engineering Takeaway

> Prevent unintended `em` compounding by enforcing `rem` for typography across design systems, reserving `em` only for component-internal padding and icon alignment.
