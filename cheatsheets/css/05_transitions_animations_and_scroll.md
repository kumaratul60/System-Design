## 05. Transitions, Animations & Scroll Effects

> A complete reference for CSS transitions, keyframe animations, browser rendering performance (Compositor vs. Reflow), JavaScript animation lifecycle events, Scroll-Driven Animations, and `@starting-style`.

---

## 📑 Table of Contents

- [05. Transitions, Animations \& Scroll Effects](#05-transitions-animations--scroll-effects)
- [📑 Table of Contents](#-table-of-contents)
- [1. CSS Transitions \& Timing Functions](#1-css-transitions--timing-functions)
  - [Built-in Easing Curves:](#built-in-easing-curves)
- [2. Animatable Properties Reference](#2-animatable-properties-reference)
- [3. Browser Rendering Performance: Compositor vs. Reflow](#3-browser-rendering-performance-compositor-vs-reflow)
- [4. CSS Animations \& `@keyframes`](#4-css-animations--keyframes)
  - [Fill Modes:](#fill-modes)
- [5. JavaScript Events for CSS Animations](#5-javascript-events-for-css-animations)
- [6. CSS Transitions vs. CSS Animations](#6-css-transitions-vs-css-animations)
- [7. Scroll-Driven vs. Scroll-Triggered Animations](#7-scroll-driven-vs-scroll-triggered-animations)
  - [7.1 Core Conceptual Difference: Scroll-Driven vs. Scroll-Triggered](#71-core-conceptual-difference-scroll-driven-vs-scroll-triggered)
  - [7.2 Scroll-Driven Animations (Progress Scrubbing)](#72-scroll-driven-animations-progress-scrubbing)
    - [1. Document Reading Progress Bar (`scroll()`)](#1-document-reading-progress-bar-scroll)
    - [2. Viewport Scroll-Linked Parallax / Scale (`view()`)](#2-viewport-scroll-linked-parallax--scale-view)
  - [7.3 Scroll-Triggered Animations (Time-Based Playback)](#73-scroll-triggered-animations-time-based-playback)
    - [Required Properties \& Syntax:](#required-properties--syntax)
    - [⚠️ Scope \& Shorthand Gotchas:](#️-scope--shorthand-gotchas)
- [8. `@starting-style` \& Discrete Transitions (`display: none` → `block`)](#8-starting-style--discrete-transitions-display-none--block)
- [9. CSS Scroll Properties \& Overflow Architecture](#9-css-scroll-properties--overflow-architecture)
  - [`overflow` Values: When \& Which to Use](#overflow-values-when--which-to-use)
  - [`overflow: hidden` vs. `overflow: clip`](#overflow-hidden-vs-overflow-clip)
  - [Fixed Header Anchors: `scroll-padding` \& `scroll-margin`](#fixed-header-anchors-scroll-padding--scroll-margin)
  - [The Problem](#the-problem)
    - [The Solution: `scroll-padding-top` on Root](#the-solution-scroll-padding-top-on-root)
  - [Scroll Snapping (Carousels \& Slides)](#scroll-snapping-carousels--slides)
  - [Scroll Chaining, Pull-to-Refresh \& Elastic Bounce: `overscroll-behavior`](#scroll-chaining-pull-to-refresh--elastic-bounce-overscroll-behavior)
    - [⚠️ Common Mistake: `overflow-y: none` is INVALID CSS](#️-common-mistake-overflow-y-none-is-invalid-css)
    - [How to Stop Screen Elastic Bounce at Top and Bottom:](#how-to-stop-screen-elastic-bounce-at-top-and-bottom)
    - [`overscroll-behavior` Value Differences:](#overscroll-behavior-value-differences)
- [10. The Mac vs. Windows Scrollbar Discrepancy \& `scrollbar-gutter`](#10-the-mac-vs-windows-scrollbar-discrepancy--scrollbar-gutter)
  - [The Problem: The 17px Layout Shift / Content Jitter](#the-problem-the-17px-layout-shift--content-jitter)
    - [The Bug in Action:](#the-bug-in-action)
  - [The CSS Fix: `scrollbar-gutter: stable`](#the-css-fix-scrollbar-gutter-stable)
  - [Modern Standard Scrollbar Styling](#modern-standard-scrollbar-styling)

---

## 1. CSS Transitions & Timing Functions

Transitions interpolate property values smoothly between two states (e.g. default vs `:hover`).

$$\text{transition: } \langle\text{property}\rangle\ \langle\text{duration}\rangle\ \langle\text{timing-function}\rangle\ \langle\text{delay}\rangle\text{;}$$

### Built-in Easing Curves:

| Value                  | Acceleration Curve Description                                    | Equivalent `cubic-bezier()`        | Best Use Case                                   |
| :--------------------- | :---------------------------------------------------------------- | :--------------------------------- | :---------------------------------------------- |
| **`ease`** _(Default)_ | Moderate start, fast middle, gentle deceleration to stop.         | `cubic-bezier(0.25, 0.1, 0.25, 1)` | General UI hover effects, buttons.              |
| **`linear`**           | Constant, uniform speed throughout.                               | `cubic-bezier(0, 0, 1, 1)`         | Progress bars, spinners, color shifts.          |
| **`ease-in`**          | Starts slow and accelerates until the end.                        | `cubic-bezier(0.42, 0, 1, 1)`      | Screen exit transitions (closing drawers).      |
| **`ease-out`**         | Starts fast and decelerates to a gentle stop.                     | `cubic-bezier(0, 0, 0.58, 1)`      | Screen entrance transitions (modals, tooltips). |
| **`ease-in-out`**      | Starts slow, speeds up in the middle, and decelerates at the end. | `cubic-bezier(0.42, 0, 0.58, 1)`   | Looping animations, accordions, carousels.      |

```css
/* Interactive Timing Comparison */
.box-linear {
  transition: transform 0.4s linear;
}
.box-ease {
  transition: transform 0.4s ease;
}
.box-ease-in {
  transition: transform 0.4s ease-in;
}
.box-ease-out {
  transition: transform 0.4s ease-out;
}
.box-ease-in-out {
  transition: transform 0.4s ease-in-out;
}
.box-spring {
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
```

---

## 2. Animatable Properties Reference

To be animatable, a property must have mathematically interpolatable values (numbers, lengths, colors, percentages):

- **Backgrounds & Colors**: `background`, `background-color`, `background-position`, `background-size`, `color`, `caret-color`.
- **Borders & Outlines**: `border`, `border-color`, `border-width`, `border-radius`, `border-top-*`, `border-bottom-*`, `border-left-*`, `border-right-*`, `outline`, `outline-color`, `outline-offset`, `outline-width`.
- **Dimensions & Box Model**: `width`, `height`, `min-width`, `max-width`, `min-height`, `max-height`, `margin`, `margin-*`, `padding`, `padding-*`, `box-shadow`.
- **Positioning & Visibility**: `top`, `bottom`, `left`, `right`, `z-index`, `opacity`, `visibility`, `clip`.
- **Flex & Grid**: `flex`, `flex-basis`, `flex-grow`, `flex-shrink`, `order`, `gap`, `row-gap`, `column-gap`, `grid-template-columns`, `grid-template-rows`.
- **Transforms & Effects**: `transform`, `filter`, `perspective`, `perspective-origin`.
- **Typography**: `font-size`, `font-weight`, `font-stretch`, `letter-spacing`, `word-spacing`, `line-height`, `text-shadow`, `text-indent`.

---

## 3. Browser Rendering Performance: Compositor vs. Reflow

```
┌───────────────────────────────────────────────────────────┐
│              Browser Rendering Pipeline                   │
│                                                           │
│  JavaScript / CSS →  [ Layout ]  →  [ Paint ]  → [ Composite ]  │
│                       (Reflow)      (Repaint)      (GPU)  │
└───────────────────────────────────────────────────────────┘
```

1. **⚡ Compositor-Only (60/120 FPS Hardware Accelerated)**:
   - **Properties:** `transform`, `opacity`, `filter`.
   - **Rule:** Bypasses Layout and Paint. Always animate `transform: translateY(-4px)` instead of `top: -4px` or `margin-top: -4px`.
2. **⚠️ Paint-Only (Medium Cost)**:
   - **Properties:** `color`, `background-color`, `border-color`, `box-shadow`.
   - **Rule:** Triggers Repaint. Safe for hover states; avoid continuous large-surface loops.
3. **❌ Layout / Reflow Triggering (High Cost / Janky)**:
   - **Properties:** `width`, `height`, `margin`, `padding`, `top`, `left`, `font-size`, `grid-*`.
   - **Rule:** Forces full DOM recalculation. Avoid animating during continuous loops.

---

## 4. CSS Animations & `@keyframes`

CSS animations allow multi-stage, self-running, and infinitely looping timelines:

$$\text{animation: } \langle\text{name}\rangle\ \langle\text{duration}\rangle\ \langle\text{timing-function}\rangle\ \langle\text{delay}\rangle\ \langle\text{iteration-count}\rangle\ \langle\text{direction}\rangle\ \langle\text{fill-mode}\rangle\ \langle\text{play-state}\rangle\text{;}$$

```css
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  will-change: transform;
}
```

### Fill Modes:

- **`forwards`**: Retains the styles of the final keyframe upon animation completion.
- **`backwards`**: Applies the styles of the first keyframe during any declared `animation-delay`.
- **`both`**: Applies both `forwards` and `backwards`.

---

## 5. JavaScript Events for CSS Animations

| Event Name               | Dispatched When                                      |
| :----------------------- | :--------------------------------------------------- |
| **`animationstart`**     | The animation begins playing (after delay).          |
| **`animationiteration`** | One cycle finishes and the next cycle starts.        |
| **`animationend`**       | The animation sequence finishes its final iteration. |
| **`animationcancel`**    | The animation is aborted prematurely.                |

```javascript
const el = document.querySelector('.card');

el.addEventListener('animationstart', (e) => {
  console.log(`Started "${e.animationName}"`);
});

el.addEventListener('animationend', (e) => {
  console.log(`Ended "${e.animationName}". Removing from DOM...`);
  el.remove();
});
```

> **⚠️ Initial Page-Load Gotcha**: If an animation runs immediately on page render, JavaScript might finish parsing after `animationstart` has already fired.
> **Fix**: Trigger animations dynamically by adding a CSS class via JavaScript after event listeners are bound.

---

## 6. CSS Transitions vs. CSS Animations

| Feature        | CSS Transitions                                           | CSS Animations                                                    |
| :------------- | :-------------------------------------------------------- | :---------------------------------------------------------------- |
| **Triggers**   | Explicit state change (`:hover`, `:focus`, class toggle). | Self-triggering on mount or looping continuously.                 |
| **Milestones** | Exactly 2 states (_Start → End_).                         | Unlimited intermediate milestones ($0\% \dots 50\% \dots 100\%$). |
| **Looping**    | Cannot loop natively without JavaScript re-triggers.      | Loops natively with `animation-iteration-count: infinite`.        |
| **Best For**   | Interactive micro-interactions (buttons, menus, inputs).  | Loaders, spinners, complex entrance choreography.                 |

---

## 7. Scroll-Driven vs. Scroll-Triggered Animations

Modern CSS distinguishes between two distinct types of scroll-associated animations:

### 7.1 Core Conceptual Difference: Scroll-Driven vs. Scroll-Triggered

```
           Scroll-Driven (Scrubbed)                      Scroll-Triggered (Time-Based)
┌─────────────────────────────────────────┐   ┌─────────────────────────────────────────┐
│ Scroll position DIRECTLY controls frame │   │ Scroll threshold ACTS AS A TRIGGER      │
│ progress (0% -> 50% -> 100%).           │   │ (Like IntersectionObserver).            │
│ Moves forward and backward with finger. │   │ Once reached, plays full time duration. │
└─────────────────────────────────────────┘   └─────────────────────────────────────────┘
```

| Dimension               | Scroll-Driven Animations                                                      | Scroll-Triggered Animations                                                            |
| :---------------------- | :---------------------------------------------------------------------------- | :------------------------------------------------------------------------------------- |
| **Progress Driver**     | **Scroll position / delta** (Scrubbed forward & backward).                    | **Time duration** (e.g. `0.6s ease-out` once activated).                               |
| **Playback Lifespan**   | Tied to scrollbar position for as long as you scroll.                         | Plays from start to finish once trigger threshold is met.                              |
| **Intermediate Frames** | **Must look good at every sub-frame** (User can stop scrolling mid-way).      | **No awkward mid-scroll pauses** (Always runs smoothly to the final frame).            |
| **Best Use Cases**      | Scroll reading progress bars, parallax depth shifts, header shrink-on-scroll. | Card reveal entrance animations, staggered list items, play-once interactive diagrams. |

---

### 7.2 Scroll-Driven Animations (Progress Scrubbing)

Uses `animation-timeline: scroll()` or `view()` to bind timeline percentage directly to scrollbar offset:

#### 1. Document Reading Progress Bar (`scroll()`)

```css
@keyframes fillProgress {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

.scroll-progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: #6366f1;
  transform-origin: left;
  animation: fillProgress auto linear;
  animation-timeline: scroll(); /* Scrubs with window scroll */
}
```

#### 2. Viewport Scroll-Linked Parallax / Scale (`view()`)

```css
@keyframes scaleOnScroll {
  from {
    transform: scale(0.85);
    opacity: 0.5;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.parallax-card {
  animation: scaleOnScroll linear both;
  animation-timeline: view();
  animation-range: entry 0% cover 40%;
}
```

---

### 7.3 Scroll-Triggered Animations (Time-Based Playback)

In CSS Animations Level 2 (Scroll-Triggered Animations), the scroll position merely serves as a **threshold trigger**. Once crossed, the animation plays its declared time duration (`0.6s`) to completion.

#### Required Properties & Syntax:

- **`timeline-trigger-name`**: A custom dashed ident (e.g. `--reveal-trigger`).
- **`timeline-trigger-source`**: The trigger source (`view()`, `scroll()`, or a named timeline).
- **`timeline-trigger-activation-range`**: Threshold range where the trigger fires (e.g. `entry 20%`).
- **`timeline-trigger-active-range`**: Active monitoring range (defaults to activation range).
- **`animation-trigger`**: References `--trigger-name` and declares playback actions. Prevents immediate autoplay on mount and activates time-based playback.

```css
/* 1. Define the Trigger (Can be placed on any element or trigger container) */
.section-wrapper {
  timeline-trigger-name: --card-trigger;
  timeline-trigger-source: view();
  timeline-trigger-activation-range: entry 25%;
}

/* 2. Animate Target Element with time-based duration */
@keyframes slideUpFadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.reveal-card {
  /* Declare time-based animation */
  animation: slideUpFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;

  /* ⚠️ CRITICAL GOTCHA: Declare animation-trigger AFTER the animation shorthand */
  animation-trigger: --card-trigger;
}
```

#### ⚠️ Scope & Shorthand Gotchas:

1. **`animation-trigger` is NOT in the `animation` Shorthand**: Always write `animation-trigger` **after** `animation:` so the shorthand does not reset it.
2. **`timeline-scope` vs. `trigger-scope`**:
   - `timeline-scope`: Used to expose a `view-timeline` across sibling/parent scopes.
   - `trigger-scope`: Used to scope a `timeline-trigger` to specific component boundaries (though triggers are global by default).

---

## 8. `@starting-style` & Discrete Transitions (`display: none` → `block`)

Allows smooth entry and exit transitions for elements toggling `display: none` (such as native `<dialog>` and popovers):

```css
dialog {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
  transition:
    opacity 0.3s ease,
    transform 0.3s ease,
    display 0.3s allow-discrete,
    overlay 0.3s allow-discrete;
}

dialog[open] {
  opacity: 1;
  transform: scale(1) translateY(0);
}

@starting-style {
  dialog[open] {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
}
```

---

## 9. CSS Scroll Properties & Overflow Architecture

### `overflow` Values: When & Which to Use

The `overflow` property controls what happens when content exceeds an element's box dimensions.

| Value                     | Behavior                                                                               | Creates Scroll Container? | Best Use Case                                             |
| :------------------------ | :------------------------------------------------------------------------------------- | :------------------------ | :-------------------------------------------------------- |
| **`visible`** _(Default)_ | Content overflows boundaries without clipping.                                         | ❌ No                     | Tooltips, dropdown menus escaping card boundaries.        |
| **`hidden`**              | Content is clipped. Can be scrolled programmatically via JavaScript (`el.scrollTo()`). | ✅ Yes                    | Hiding visual overflow while retaining JS scroll control. |
| **`clip`**                | Content is hard clipped. **Cannot be scrolled even via JavaScript**.                   | ❌ No                     | Pure visual clipping; highest performance.                |
| **`scroll`**              | **Always shows scrollbars**, even if content does not overflow.                        | ✅ Yes                    | Fixed UI panels requiring permanent scrollbar tracks.     |
| **`auto`**                | **Shows scrollbars only when content exceeds boundaries**.                             | ✅ Yes                    | Scrollable code blocks, sidebars, long tables, feeds.     |

```css
/* Axis-Specific Overflow */
.code-block {
  overflow-x: auto; /* Horizontal scroll for wide code lines */
  overflow-y: hidden; /* No vertical scroll */
}

/* Modern Logical Overflow */
.chat-window {
  overflow-block: auto; /* Vertical scroll in horizontal-tb */
  overflow-inline: hidden;
}
```

---

### `overflow: hidden` vs. `overflow: clip`

| Feature                    | `overflow: hidden`                                | `overflow: clip`                                       |
| :------------------------- | :------------------------------------------------ | :----------------------------------------------------- |
| **Scroll Container?**      | **Yes** (Establishes a scroll container context). | **No** (Zero scroll container overhead).               |
| **Programmatic Scroll?**   | Allowed (`el.scrollLeft = 100`, `el.scrollTo()`). | **Forbidden** (Never scrolls).                         |
| **`overflow-clip-margin`** | ❌ Not supported.                                 | ✅ **Supported** (e.g. `overflow-clip-margin: 20px;`). |
| **Performance**            | Incurs scroll-boundary memory overhead.           | ⚡ **Cheaper & faster** (Pure raster clip).            |
| **Recommendation**         | Use when JS scrolling is needed.                  | Use for pure visual containment & performance.         |

---

### Fixed Header Anchors: `scroll-padding` & `scroll-margin`

### The Problem

When clicking an anchor link (`#section-2`), the browser scrolls the element to the very top of the viewport, hiding the section title underneath a **fixed/sticky navigation bar**.

#### The Solution: `scroll-padding-top` on Root

`scroll-padding` offsets the scroll target area on the scroll container:

```css
/* Apply on the scroll container (html) */
html {
  scroll-behavior: smooth;
  /* 80px fixed header height + 16px breathing room */
  scroll-padding-top: 6rem;
}

/* Or target a specific individual section with scroll-margin */
.hero-section {
  scroll-margin-top: 6rem;
}
```

---

### Scroll Snapping (Carousels & Slides)

CSS Scroll Snap creates touch/wheel snapping points without JavaScript carousel libraries:

```css
/* 1. Parent Scroll Container */
.carousel {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory; /* x-axis snap: mandatory or proximity */
  scroll-behavior: smooth;
  gap: 1rem;
}

/* 2. Child Slides */
.carousel-slide {
  flex: 0 0 85%;
  scroll-snap-align: center; /* Snaps slide to center of viewport */
  scroll-snap-stop: always; /* Prevents scrolling past multiple slides on fast swipe */
}
```

---

### Scroll Chaining, Pull-to-Refresh & Elastic Bounce: `overscroll-behavior`

Controls what happens when a user scrolls to the boundary of a scrollable element or the entire page.

#### ⚠️ Common Mistake: `overflow-y: none` is INVALID CSS

> **Important**: `none` is **NOT a valid value** for `overflow` or `overflow-y` (valid values are `visible`, `hidden`, `clip`, `scroll`, `auto`). Declaring `overflow-y: none` will be silently ignored by the browser.
>
> The **correct property** to stop boundary bouncing and scroll chaining is **`overscroll-behavior`** (or `overscroll-behavior-y`).

---

#### How to Stop Screen Elastic Bounce at Top and Bottom:

On macOS Safari/Chrome and iOS Safari, scrolling past the top or bottom edge of a page triggers an **elastic rubber-band bounce effect** (or mobile pull-to-refresh). To completely disable this bounce, set:

```css
/* ✅ Stop entire page rubber-band bounce on macOS & iOS */
html,
body {
  overscroll-behavior-y: none; /* Disables top & bottom elastic bounce */
  /* Or overscroll-behavior: none; for both X and Y axes */
}
```

---

#### `overscroll-behavior` Value Differences:

| Value                  | Behavior at Scroll Boundaries                                                                                                           | Prevents Parent Scroll Chaining? | Disables Screen Rubber-Band Bounce? |
| :--------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------: | :---------------------------------: |
| **`auto`** _(Default)_ | Default browser scroll chaining. Once the element reaches the end, the outer parent/page scrolls.                                       |              ❌ No               |                ❌ No                |
| **`contain`**          | **Traps scroll inside the container**. When the inner element reaches top/bottom, the outer page will NOT scroll. (Keeps local bounce). |              ✅ Yes              |    ❌ No (Local bounce remains)     |
| **`none`**             | **Traps scroll AND completely removes all elastic rubber-band bouncing** and pull-to-refresh.                                           |              ✅ Yes              |      ✅ **Yes (Zero bounce)**       |

```css
/* Modal chat window: Traps scroll inside dialog without scrolling the main page */
.chat-messages-modal {
  overflow-y: auto;
  overscroll-behavior-y: contain; /* Prevents background page scrolling */
}

/* Standalone Web App / Game Canvas: Eliminates all iOS/macOS rubber-banding */
.app-container {
  overscroll-behavior: none;
}
```

---

## 10. The Mac vs. Windows Scrollbar Discrepancy & `scrollbar-gutter`

### The Problem: The 17px Layout Shift / Content Jitter

Different operating systems handle scrollbars differently:

- **macOS / iOS**: Uses **Overlay Scrollbars** by default. They are transparent, float over content, and take **`0px` layout width**.
- **Windows / Linux**: Uses **Classic / Persistent Scrollbars**. They occupy physical layout space (**~15px to 17px wide**).

#### The Bug in Action:

1. On Windows, a page with dynamic content is initially short (no scrollbar).
2. The user clicks "Load More", making the page taller. The browser adds a 17px vertical scrollbar.
3. **The entire page width shrinks by 17px**, causing titles, centered cards, and buttons to visibly **jump/jitter to the left**.
4. When a modal opens and applies `body { overflow: hidden; }`, the scrollbar disappears and the page jumps to the right!

---

### The CSS Fix: `scrollbar-gutter: stable`

The **`scrollbar-gutter: stable`** property permanently reserves space for the scrollbar in the layout, **preventing all content jitter** regardless of whether the scrollbar is currently active or not.

```css
/* Apply to root HTML element */
html {
  /* Permanently reserves space for scrollbar on Windows/Linux */
  /* On macOS with overlay scrollbars, it gracefully takes 0px until a mouse is plugged in */
  scrollbar-gutter: stable;
}

/* Symmetrical margins (reserves space on both left and right for perfect center alignment) */
.centered-container {
  scrollbar-gutter: stable both-edges;
}
```

---

### Modern Standard Scrollbar Styling

Standardized cross-browser scrollbar styling (replaces legacy `::-webkit-scrollbar` hacks):

```css
/* Standardized CSS Scrollbars (Supported in Chrome, Firefox, Safari, Edge) */
.custom-scrollbar {
  scrollbar-width: thin; /* auto | thin | none */
  scrollbar-color: #6366f1 #f1f5f9; /* <thumb-color> <track-color> */
}

/* Hide scrollbar completely while maintaining scrollability */
.no-scrollbar {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}
.no-scrollbar::-webkit-scrollbar {
  display: none; /* Safari & older Chrome */
}
```
