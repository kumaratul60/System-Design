# 04. Modern Selectors, Nesting & Cascade

> A master guide to modern CSS selector architecture: Native Nesting, the `:has()` relational selector, `:is()` vs. `:where()`, Cascade Layers (`@layer`), `:user-invalid`, and `sibling-index()`.

---

## 📑 Table of Contents

- [04. Modern Selectors, Nesting \& Cascade](#04-modern-selectors-nesting--cascade)
  - [📑 Table of Contents](#-table-of-contents)
  - [1. CSS Native Nesting \& Nesting Discipline](#1-css-native-nesting--nesting-discipline)
    - [⚠️ Architectural Warning: Do NOT Nest Everything](#️-architectural-warning-do-not-nest-everything)
      - [Why Limit Nesting Depth:](#why-limit-nesting-depth)
  - [2. The `:has()` Relational Selector](#2-the-has-relational-selector)
    - [2.1 Deep Dive: `:has(:not(...))` vs. `:not(:has(...))`](#21-deep-dive-hasnot-vs-nothas)
      - [Scenario \& Concrete Comparison:](#scenario--concrete-comparison)
      - [Real-World Use Cases:](#real-world-use-cases)
  - [3. `:is()` vs. `:where()` (Specificity Control)](#3-is-vs-where-specificity-control)
    - [Specificity Comparison:](#specificity-comparison)
  - [4. Cascade Layers (`@layer`)](#4-cascade-layers-layer)
    - [Golden Cascade Rules:](#golden-cascade-rules)
  - [5. `:user-invalid` vs. `:invalid` (Accessible Form UX)](#5-user-invalid-vs-invalid-accessible-form-ux)
  - [6. Staggered Animations with `sibling-index()` \& `sibling-count()`](#6-staggered-animations-with-sibling-index--sibling-count)

---

## 1. CSS Native Nesting & Nesting Discipline

Native CSS supports nesting selectors directly inside parent rules. The ampersand (`&`) references the parent selector.

```css
.card {
  background-color: #ffffff;
  padding: 1.5rem;
  border-radius: 0.75rem;

  /* Direct child nesting */
  .card-title {
    font-size: 1.25rem;
    font-weight: 700;
  }

  /* Pseudos & modifiers require & */
  &:hover {
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }

  &.is-featured {
    border: 2px solid #6366f1;
  }

  /* Parent theme context (trailing &) */
  .dark-theme & {
    background-color: #1e293b;
    color: #f8fafc;
  }
}
```

### ⚠️ Architectural Warning: Do NOT Nest Everything

```css
/* ❌ ANTI-PATTERN: Preprocessor-style Deep Nesting Hell */
.nav {
  .nav-list {
    .nav-item {
      .nav-link {
        span {
          svg {
            fill: red;
          } /* High specificity trap & fragile coupling */
        }
      }
    }
  }
}

/* ✅ BEST PRACTICE: Flat, Semantic Composition (Max 2 Levels) */
.nav-link {
  display: flex;
  align-items: center;

  &:hover {
    color: var(--primary);
  }

  & .icon {
    fill: currentColor;
  }
}
```

#### Why Limit Nesting Depth:

1. **Specificity Trapping**: Native nesting desugars to `:is(...)`, taking the maximum specificity of the selector list.
2. **Refactoring Fragility**: Styles tightly bind to specific HTML DOM nesting paths.
3. **Golden Rule**: **Limit nesting depth to at most 2 levels** (Component → Direct Child / State).

---

## 2. The `:has()` Relational Selector

Known as the **"Parent Selector"**, `:has()` selects an element if any selector inside its argument matches relative to it.

```css
/* 1. Layout switching based on child contents */
.card:has(img) {
  grid-template-columns: 200px 1fr;
}

/* 2. Accessible form validation UI without JavaScript */
form:has(input:invalid) button[type='submit'] {
  opacity: 0.5;
  pointer-events: none;
}

/* 3. Sibling hover dimming */
.gallery:has(.item:hover) .item:not(:hover) {
  opacity: 0.4;
  filter: grayscale(80%);
}

/* 4. Scroll lock when drawer is active */
body:has(#drawer[aria-expanded='true']) {
  overflow: hidden;
}
```

---

### 2.1 Deep Dive: `:has(:not(...))` vs. `:not(:has(...))`

A critical point of confusion in CSS relational selectors is the order of nesting between `:has()` and `:not()`. They have **radically different logical meanings**:

```
┌─────────────────────────┬────────────────────────────────────────────────────────┐
│ Selector Expression     │ Logical Meaning & Evaluation Rule                      │
├─────────────────────────┼────────────────────────────────────────────────────────┤
│ **`:has(:not(.active))`** │ **Existential Check**: Parent has **AT LEAST ONE**     │
│                         │ descendant that is NOT `.active`.                      │
├─────────────────────────┼────────────────────────────────────────────────────────┤
│ **`:not(:has(.active))`** │ **Universal Negation**: Parent has **NO** descendants  │
│                         │ that are `.active` (Zero occurrences).                 │
└─────────────────────────┴────────────────────────────────────────────────────────┘
```

#### Scenario & Concrete Comparison:

Imagine a navigation list with 3 items:

```html
<ul class="nav">
  <li class="nav-item active">Home</li>
  <li class="nav-item">About</li>
  <li class="nav-item">Contact</li>
</ul>
```

1. **`ul.nav:has(:not(.active))`** evaluates to **TRUE**:
   - Why? Because `.nav` contains `<li>About</li>`, which does NOT have `.active`. It finds at least one non-active descendant.
2. **`ul.nav:not(:has(.active))`** evaluates to **FALSE**:
   - Why? Because `.nav` contains `<li>Home</li>` which HAS `.active`. It asks: "Does this container have NO active items at all?" Since one active item exists, the condition fails.

#### Real-World Use Cases:

```css
/* Use Case A: Empty/Inactive State Warning */
/* Highlight the container ONLY IF NONE of the items are selected */
.dropdown:not(:has(.selected)) {
  border-color: #f59e0b; /* "Please select an option" */
}

/* Use Case B: Incomplete Checklist */
/* Style the list IF THERE IS AT LEAST ONE unchecked task */
.task-list:has(input[type='checkbox']:not(:checked)) {
  background-color: #fefce8;
}

/* Style the list IF ALL tasks are completed (Zero unchecked tasks) */
.task-list:not(:has(input[type='checkbox']:not(:checked))) {
  background-color: #f0fdf4;
  border-color: #22c55e;
}
```

---

## 3. `:is()` vs. `:where()` (Specificity Control)

Both pseudo-classes accept a forgiving selector list and match elements matching any item:

```css
:is(header, footer) :is(h1, h2, h3) {
  color: #1e293b;
}
```

### Specificity Comparison:

| Feature                     | `:is()`                                                  | `:where()`                                                                                                          |
| :-------------------------- | :------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------ |
| **Specificity Calculation** | Takes the specificity of its **most specific argument**. | **Always Zero Specificity (0-0-0)**.                                                                                |
| **Primary Use Case**        | Grouping complex selectors concisely.                    | **CSS Resets and Design System component defaults** that consumers can easily override without specificity battles. |

```css
/* :where() default has 0 specificity */
:where(button, input, select) {
  border: 1px solid #ccc; /* Can be overridden by any single class .my-btn */
}
```

---

## 4. Cascade Layers (`@layer`)

Cascade Layers grant explicit control over the **cascade order of precedence**, independent of selector specificity.

```css
/* Declare layer priority upfront (lowest to highest precedence) */
@layer reset, base, components, utilities;

@layer reset {
  * {
    box-sizing: border-box;
    margin: 0;
  }
}

@layer base {
  body {
    font-family: system-ui;
  }
  h1 {
    font-size: 2rem;
  }
}

@layer components {
  /* High specificity inside lower layer */
  .card.featured#hero-card {
    background: white;
    padding: 2rem;
  }
}

@layer utilities {
  /* Low specificity inside higher layer WINS over components! */
  .p-0 {
    padding: 0 !important;
  }
}
```

### Golden Cascade Rules:

- Rules in later layers (`utilities`) **always override** rules in earlier layers (`components`), regardless of selector specificity.
- **Unlayered Styles**: Styles outside any `@layer` have higher precedence than all layered styles.

---

## 5. `:user-invalid` vs. `:invalid` (Accessible Form UX)

- **`:invalid`**: Evaluates immediately on initial DOM render, flashing jarring red error states on empty, untouched forms.
- **`:user-invalid`**: Only evaluates **after** the user has interacted with the input (typed and blurred, or attempted submission).

```css
/* ✅ Modern Form UX Best Practice */
input:user-invalid {
  border-color: #ef4444;
  background-color: #fef2f2;
}

input:user-valid {
  border-color: #22c55e;
}
```

---

## 6. Staggered Animations with `sibling-index()` & `sibling-count()`

CSS Values and Units Level 5 introduces native sibling counting without JavaScript loops:

```css
/* Staggered entrance animation in 100% pure CSS */
.list-item {
  opacity: 0;
  animation: slideUp 0.4s ease forwards;
  /* Stagger delay by 80ms per item */
  animation-delay: calc(sibling-index() * 80ms);
}

/* Radial menu distribution */
.menu-item {
  position: absolute;
  transform: rotate(calc((360deg / sibling-count()) * sibling-index())) translate(120px);
}
```
