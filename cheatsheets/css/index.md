# CSS Architecture & Modern Standards Master Hub

> A modular, structured engineering reference for Modern CSS, responsive design, layout engines, container queries, animations, modern selectors, and performance optimizations.

---

## 📑 Modular CSS Knowledge Base

Navigate to each focused module below for deep dives, architectural rationale, diagrams, and code patterns:

| Module                                                                                                 | Core Topics                                                                                                                                                                                 | Key Primitives                                                                                                   |
| :----------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------- |
| 📐 **[1. CSS Units & Values](01_css_units_and_values.md)**                                             | Relative, Viewport, Container & Absolute units, Typography scaling, `rem` vs `em` models, Compounding risks.                                                                                | `rem`, `em`, `px`, `%`, `vw`/`vh`, `dvh`/`svh`/`lvh`, `cqi`/`cqw`, `lh`, `ch`, `fr`, `pt`                        |
| 📱 **[2. Responsive Design & Media Queries](02_responsive_design_and_media_queries.md)**               | Media queries vs Container queries, Media types, Range comparison syntax, 5-device Breakpoint Matrix, Mobile-First architecture, Fluid `clamp()`.                                           | `@media`, `@container`, `min-width`, range syntax (`640px <= width < 1024px`), `clamp()`                         |
| 🏗️ **[3. Layout Engines, Grid, Subgrid & Box Model](03_layout_engines_grid_subgrid_and_box_model.md)** | Flex (1D) vs Grid (2D), CSS Positioning Matrix & `offsetParent`, Stacking Contexts & `isolation: isolate`, `box-sizing` overflow paradox, Subgrid, `aspect-ratio`.                          | `flex`, `grid`, `position`, `isolation: isolate`, `subgrid`, `box-sizing`, `aspect-ratio`                        |
| 🎯 **[4. Modern Selectors, Nesting & Cascade](04_modern_selectors_nesting_and_cascade.md)**            | Native CSS Nesting rules & discipline, `:has()` relational selector, `:has(:not())` vs `:not(:has())`, `:is()` vs `:where()`, Cascade Layers, `:user-invalid`, Staggered `sibling-index()`. | `&`, `:has()`, `:has(:not())`, `:not(:has())`, `:is()`, `:where()`, `@layer`, `:user-invalid`, `sibling-index()` |
| ⚡ **[5. Transitions, Animations & Scroll Effects](05_transitions_animations_and_scroll.md)**          | Easing curves, Animatable properties, Rendering pipeline, `@keyframes`, Scroll-Driven Animations (`forwards`), `interpolate-size`, `scrollbar-gutter`.                                      | `transition`, `@keyframes`, `interpolate-size`, `scrollbar-gutter: stable`, `animation-timeline`                 |
| 🎨 **[6. Colors, Math & Advanced Mechanics Q&A](06_colors_math_and_advanced_mechanics_qa.md)**         | Space-separated colors, `oklch()`, `color-mix()`, CSS Math, Feature Adoption Framework (Progressive Enhancement, Fallbacks, `@supports`), Architecture Q&A.                                 | `oklch()`, `color-mix()`, `offset-path`, `sign()`, `calc-size()`, `@supports`                                    |
| 📈 **[7. Evolution of CSS](07_evolution_of_css.md)**                                                   | Chronological history from HTML table layouts to Preprocessors, BEM, CSS-in-JS, Tailwind, Headless UI, and Modern Native specs.                                                             | Tables → Sass → BEM → CSS-in-JS → Tailwind → Modern Native                                                       |
| 🧩 **[8. Layout & Box Model Mechanics Q&A](08_qa_layout_and_box_model_mechanics.md)**                   | Grid RAM overflow clamp, Box model margin paradox, Vertical percentage margin width dependency, Subgrid track alignment, `100vw` desktop scrollbar bug.                                    | `minmax(min())`, `width: auto`, `aspect-ratio`, `subgrid`, `scrollbar-gutter`                                    |
| 📐 **[9. Units, Viewports & Container Queries Q&A](09_qa_units_viewports_and_container_queries.md)**   | Container query fallback (`svi`/`svw`), `cqi` vs `cqw` in writing modes, container pitfalls, `sign()` conditional radius, DPR, `100dvh` vs `100svh`, `rem` vs `em`, compounding bug.      | `cqi`, `cqw`, `sign()`, `clamp()`, `100dvh`, `100svh`, `rem`, `em`                                               |
| 🚀 **[10. Modern Features, Animations & Fallbacks Q&A](10_qa_modern_features_animations_and_fallbacks.md)** | Perimeter Motion Path (`offset-path: border-box`), `sibling-index()`, `:user-invalid`, `oklch()` uniform colors, modern CSS adoption triad, scroll-driven entry persistence (`forwards`).    | `offset-path`, `sibling-index()`, `:user-invalid`, `oklch()`, `interpolate-size`, `animation-fill-mode: forwards` |

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
