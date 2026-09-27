# CSS Architecture & Modern Standards Master Hub

> A modular, structured engineering reference for Modern CSS, responsive design, layout engines, container queries, animations, modern selectors, and performance optimizations.

---

## 📑 Modular CSS Knowledge Base

Navigate to each focused module below for deep dives, architectural rationale, diagrams, and code patterns:

| Module                                                                                                 | Core Topics                                                                                                                                                                                      | Key Primitives                                                                                                   |
| :----------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------- |
| 📐 **[1. CSS Units & Values](01_css_units_and_values.md)**                                             | Relative, Viewport, Container & Absolute units, Typography scaling, `rem` vs `em` models, Compounding risks.                                                                                     | `rem`, `em`, `px`, `%`, `vw`/`vh`, `dvh`/`svh`/`lvh`, `cqi`/`cqw`, `lh`, `ch`, `fr`, `pt`                        |
| 📱 **[2. Responsive Design & Media Queries](02_responsive_design_and_media_queries.md)**               | Media queries vs Container queries, Media types, Range comparison syntax, 5-device Breakpoint Matrix, Mobile-First architecture, Fluid `clamp()`.                                                | `@media`, `@container`, `min-width`, range syntax (`640px <= width < 1024px`), `clamp()`                         |
| 🏗️ **[3. Layout Engines, Grid, Subgrid & Box Model](03_layout_engines_grid_subgrid_and_box_model.md)** | Flex (1D) vs Grid (2D), CSS Positioning Matrix & `offsetParent`, Stacking Contexts & `isolation: isolate`, `box-sizing` overflow paradox, Subgrid, `aspect-ratio`.                               | `flex`, `grid`, `position`, `isolation: isolate`, `subgrid`, `box-sizing`, `aspect-ratio`                        |
| 🎯 **[4. Modern Selectors, Nesting & Cascade](04_modern_selectors_nesting_and_cascade.md)**            | Native CSS Nesting rules & discipline, `:has()` relational selector, `:has(:not())` vs `:not(:has())`, `:is()` vs `:where()`, Cascade Layers, `:user-invalid`, Staggered `sibling-index()`.      | `&`, `:has()`, `:has(:not())`, `:not(:has())`, `:is()`, `:where()`, `@layer`, `:user-invalid`, `sibling-index()` |
| ⚡ **[5. Transitions, Animations & Scroll Effects](05_transitions_animations_and_scroll.md)**          | Easing curves, Animatable properties, Rendering pipeline (Compositor vs Reflow), `@keyframes`, Scroll-Driven Animations, `overflow` vs `clip`, Mac vs Windows layout shift & `scrollbar-gutter`. | `transition`, `@keyframes`, `overflow: clip`, `scrollbar-gutter: stable`, `scroll-snap`, `animation-timeline`    |
| 🎨 **[6. Colors, Math & Advanced Mechanics Q&A](06_colors_math_and_advanced_mechanics_qa.md)**         | Space-separated colors, `oklch()`, `color-mix()`, CSS Math (`calc`, `sign`), Motion Path (`offset-path: border-box`), First-principles architecture interview Q&A.                               | `oklch()`, `color-mix()`, `offset-path`, `sign()`, `calc-size()`                                                 |
| 📈 **[7. Evolution of CSS](07_evolution_of_css.md)**                                                   | Chronological history from HTML table layouts to Preprocessors, BEM, CSS-in-JS, Tailwind, Headless UI, and Modern Native specs.                                                                  | Tables → Sass → BEM → CSS-in-JS → Tailwind → Modern Native                                                       |

---

## ⚡ Quick Decision Tree: Which Unit/Tool to Pick?

```
Need responsive typography?
        │
        └── rem  (Global scale) / clamp()

Need component scale with its own font?
        │
        └── em   (Button padding, icons, badges)

Need exact pixel precision?
        │
        └── px   (Borders, shadows, hairlines)

Need width relative to parent?
        │
        └── %    (Fluid grid columns, container width)

Need fluid component adaptability across sidebars vs grids?
        │
        └── container-type: inline-size + cqi

Need full-screen mobile height without address bar jumps?
        │
        └── 100dvh / 100svh

Need cross-card track alignment across independent rows?
        │
        └── CSS Subgrid (grid-template-rows: subgrid)

Need scroll progress or scroll-triggered reveal?
        │
        └── animation-timeline: scroll() / view()
```

---

## 🔗 Essential Companion Resources

- 🧪 **[Periodic Table of HTML Elements](https://blog.alena.rocks/en/artifacts/html-elements/)**: Interactive periodic table of all 115 HTML Living Standard elements categorized across 11 specification sections (Root, Metadata, Sections, Grouping, Text-level, Edits, Embedded, Tabular, Forms, Interactive, Scripting) with void elements and MDN documentation links.
