# Frontend Machine Coding & Interview Preparation

This guide is categorized into practical coding challenges (Machine Code) and conceptual interview questions, organized by complexity and domain.

---

## 🟢 Section 1: Common UI Components (Junior - Mid)

_Focus: State management, props, and basic event handling._

1.  **Todo List:** Basic CRUD, filtering (all/active/completed).
2.  **Tabs Component:** Dynamic content switching based on active tab.
3.  **Accordion:** Single and multi-expandable sections.
4.  **Pagination:** Implementation in vanilla JS and React (including truncation like `1, 2, ... 10`).
5.  **Progress Bar:** Configurable percentage and animation.
6.  **Star Rating:** Interactive rating with hover states.
7.  **Color Boxes:** Configurable grid of boxes that change color on click.
8.  **Modal/Dialog:** Portal-based implementation with "click outside to close."

---

## 🟡 Section 2: Advanced Interactivity & Games (Mid - Senior)

_Focus: Complex state, recursion, performance, and logic._

1.  **Autocomplete / Typeahead:**
    - Features: Debouncing, caching API results, keyboard navigation (arrow keys + enter).
2.  **Infinite Scroll:** Using `IntersectionObserver` or scroll listeners (with throttling).
3.  **Nested Comment Section:** Recursive rendering of comments with "Reply," "Edit," and "Delete."
4.  **Tree View with Checkboxes:** Parent-child relationship (checking parent checks all children, indeterminate states).
5.  **Advance Tic-Tac-Toe:** N x N grid support and win-detection algorithm.
6.  **Memory Game / Match Similar Tiles:** Grid-based logic with flip animations and match tracking.
7.  **3x3 Turn-based Grid:** Registering turn values in cells on click.
8.  **Transfer List:** Moving items between two list boxes (like in Jira/Admin panels).
9.  **Nested Folder Structure:** File explorer with create/delete/rename functionality (Recursive).

---

## 🟠 Section 3: Frontend System Design & Config-Driven UI

_Focus: Modularity, scalability, and reusability._

1.  **Configurable Dropdown:** Dynamically add/delete values, multi-select support, search inside dropdown.
2.  **Config-Driven Form:** Render complex forms (inputs, selects, checkboxes) from a JSON schema with validation logic.
3.  **Toast / Notification System:** Global singleton or context-based system with auto-dismiss and stack management.
4.  **Carousel:** Smooth transitions, infinite loop, dot navigation, and touch support.
5.  **E-commerce Filters:** Multi-category filtering (price range, brand, rating) with URL sync.
6.  **Shopping Cart:** State persistence (localStorage), quantity management, and price calculation logic.
7.  **Poll Widget:** Real-time percentage updates and vote tracking.

---

## 🔵 Section 4: Performance & Advanced Concepts

_Focus: Deep React internals and optimization._

1.  **Virtualization:** Rendering 10k+ items efficiently (Windowing).
2.  **Debouncing & Throttling:** Manual implementation and use cases (search vs. resize).
3.  **React Profiler:** Identifying bottlenecks and redundant renders.
4.  **Layout Thrashing:** Understanding Reflow/Repaint and how to avoid forced synchronous layouts.
5.  **Web Vitals Optimization:** Strategies to improve LCP, INP, and CLS.
6.  **Code Splitting:** Route-level vs Component-level splitting with `React.lazy`.

---

## 🏛️ Architect's Nuance: Designing for Scale

When a Senior/Staff engineer is asked to build a "Simple Widget," the interviewer isn't looking for just a working component; they are looking for **System Thinking.**

### 1. The "Config-Driven" Mindset

Instead of hardcoding a form or a menu, can your component be driven by a JSON schema?

- **The Staff Take:** "I build the **Engine**, not just the **UI**. If the product manager wants to add a 10th field tomorrow, they should be able to update a JSON file without me rewriting the React component."

### 2. Accessibility & Internationalization (i18n)

Does your star rating work with a keyboard? Does your infinite scroll support Right-to-Left (RTL) languages like Arabic?

- **The Staff Take:** "A feature isn't 'Done' until it's accessible. I use ARIA roles and ensure all interactive elements are focusable by default."

### 3. State Management & Side Effects

How do you handle "Race Conditions" in your Autocomplete? If the user types 'A', then 'B', and 'A' returns _after_ 'B', how do you prevent the UI from showing the wrong result?

- **The Staff Take:** "I use `AbortController` or boolean flags in my cleanup functions to ensure that only the _latest_ request ever updates the UI state."

### 4. Performance & The DOM Node Count

If you build a list of 10,000 items, do you render 10,000 `<div>`s?

- **The Staff Take:** "I implement **Virtualization (Windowing)**. I only render the 10-20 items currently visible in the viewport, keeping the DOM node count constant regardless of data size."

---

## 🟣 Section 5: Conceptual Questions (Quick Reference)

### **React Internals**

- **Virtual DOM & Reconciliation:** How React updates the DOM efficiently (Diffing $O(n)$).
- **Fiber Architecture:** Incremental rendering and concurrency.
- **useRef:** Persistent values across renders vs. DOM access.
- **Memoization:** When to use `React.memo`, `useMemo`, and `useCallback` (and the memory trade-offs).

### **Architecture & Scaling**

- **SSR vs CSR vs ISR:** In-depth trade-offs and Next.js `"use client"` nuances.
- **State Management:** Context API vs. Redux/Zustand vs. `useSyncExternalStore`.
- **Micro-frontends:** Module Federation and team collaboration at scale.
- **Scaling CSR:** CDN, Edge Computing, and repository structuring (Monorepos).

### **Best Practices**

- **Utility Functions:** When to extract logic outside components to maintain stable references.
- **Error Boundaries:** Catching UI crashes and limitations (async/event handler errors).
- **Accessibility (A11y):** Semantic HTML, ARIA, and keyboard navigation.
- **Testing:** The Testing Trophy (Unit, Integration, E2E).

---

## 🔴 Section 6: Debugging & Problem Solving

- **Debugging Slowness:** Performance tab, React DevTools, and Network analysis.
- **Build Optimization:** Webpack/Vite config, tree shaking, and dependency management (`devDeps` vs `deps`).
- **Scaling Challenges:** Handling large component trees and avoiding prop drilling.
