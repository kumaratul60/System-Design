# Visual Regression & Snapshot Testing Architecture

> **Scope:** Automated pixel-by-pixel raster diffing, DOM text snapshots, anti-aliasing tolerances, and cross-OS font rendering consistency.

---

## Table of Contents

- [Visual Regression \& Snapshot Testing Architecture](#visual-regression--snapshot-testing-architecture)
  - [Table of Contents](#table-of-contents)
  - [1. DOM Snapshots vs. Pixel-Diff Visual Regression](#1-dom-snapshots-vs-pixel-diff-visual-regression)
  - [2. Automated Visual Testing with Playwright](#2-automated-visual-testing-with-playwright)
  - [3. Eliminating Visual Flakiness: The 4 Rules](#3-eliminating-visual-flakiness-the-4-rules)
  - [4. Enterprise Tools: Percy \& Chromatic](#4-enterprise-tools-percy--chromatic)
  - [5. When to Use vs. When NOT to Use](#5-when-to-use-vs-when-not-to-use)

---

## 1. DOM Snapshots vs. Pixel-Diff Visual Regression

```text
+-----------------------+----------------------------------+----------------------------------+
| Attribute             | DOM Text Snapshot (Jest/Vitest)  | Pixel-Diff Visual Regression     |
+-----------------------+----------------------------------+----------------------------------+
| What it compares      | Rendered HTML string             | Rendered PNG raster pixels       |
| Catches CSS Breakages | ❌ No (CSS is ignored)          | ✅ Yes (Padding, colors, fonts)  |
| False Positive Rate   | High (Trivial markup changes)    | Low (Configurable threshold)     |
| Best For              | Redux actions, API payload diffs | Design systems, Landing pages    |
+-----------------------+----------------------------------+----------------------------------+
```

---

## 2. Automated Visual Testing with Playwright

Playwright compares full page screenshots against gold baseline images stored in source control:

```typescript
// e2e/visual.spec.ts
import { test, expect } from '@playwright/test';

test('landing page matches visual baseline', async ({ page }) => {
  await page.goto('/');

  // Mask dynamic elements and disable CSS animations
  await expect(page).toHaveScreenshot('landing-page.png', {
    mask: [page.getByTestId('live-clock'), page.getByTestId('dynamic-user-avatar')],
    maxDiffPixelRatio: 0.02, // 2% tolerance for subpixel anti-aliasing
    animations: 'disabled',
  });
});
```

---

## 3. Eliminating Visual Flakiness: The 4 Rules

1. **Dockerized CI Execution:** Always generate and verify baseline screenshots inside official Linux Docker containers (`mcr.microsoft.com/playwright`) to avoid macOS vs Linux font rendering variations (Quartz vs FreeType).
2. **Freeze System Clocks & Dates:** Freeze `Date.now()` to ensure dynamic relative times ("2 minutes ago") stay fixed.
3. **Hide Blinking Carets:** Inject CSS hiding input text cursors (`caret-color: transparent !important`).
4. **Disable CSS & JS Animations:** Set `animations: 'disabled'` and force `prefers-reduced-motion`.

---

## 4. Enterprise Tools: Percy & Chromatic

- **Chromatic (Storybook):** Captures DOM snapshots in the browser and renders them across Chrome, Firefox, Safari, and Edge in cloud workers. Ideal for component libraries and design systems.
- **Percy (BrowserStack):** Intercepts DOM states and uploads them to a cloud rendering grid for visual review workflows integrated directly with GitHub pull requests.

---

## 5. When to Use vs. When NOT to Use

| When to Use Visual Regression                               | When NOT to Use Visual Regression                          |
| :---------------------------------------------------------- | :--------------------------------------------------------- |
| ✅ Design systems, UI component libraries.                  | ❌ Real-time live trading charts or streaming video feeds. |
| ✅ Responsive layout breakpoint audits (Mobile vs Desktop). | ❌ Pure backend API endpoints and data models.             |
| ✅ Marketing landing pages and checkout UI.                 | ❌ Rapid prototyping exploratory phases.                   |
