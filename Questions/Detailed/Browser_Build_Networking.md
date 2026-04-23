# Browser, Networking, and Build Optimization

This guide covers the "under the hood" mechanics of how web applications are delivered and parsed.

---

## 1. What happens when you type a URL? (DNS & HTML Parsing)

**Question:** Explain the process from typing a URL to the page being rendered. Focus on DNS and HTML parsing.

**Answer:**
1.  **DNS Lookup:** The browser checks cache (browser, OS, router, ISP). If not found, it queries a Recursive Resolver to find the IP address of the domain.
2.  **TCP/TLS Handshake:** Establishing a secure connection to the server.
3.  **HTTP Request/Response:** The browser requests the HTML file.
4.  **Critical Rendering Path:**
    *   **DOM Tree:** The browser parses HTML and builds the DOM.
    *   **CSSOM Tree:** The browser parses CSS and builds the CSSOM.
    *   **Render Tree:** Combining DOM and CSSOM (ignoring `display: none` elements).
    *   **Layout:** Calculating the geometry (position/size) of each node.
    *   **Paint:** Filling in pixels (colors, images, borders).

**Explain Me (Parsing Nuance):**
Parsing is **incremental**. The browser starts building the DOM as soon as the first chunks of HTML arrive. However, CSS is **render-blocking** (the browser won't paint until CSSOM is ready), and synchronous Scripts are **parser-blocking** (the browser stops building the DOM to download and execute JS).

---

## 2. Dependencies vs devDependencies

**Question:** What is the practical difference between `dependencies` and `devDependencies` in `package.json`?

**Answer:**
*   **`dependencies`:** Packages required for the application to **run** in production (e.g., React, Lodash, Axios).
*   **`devDependencies`:** Packages only needed during **development and build** (e.g., Webpack, Vite, ESLint, Jest, TypeScript).

**Why it matters:**
When you run `npm install --production`, only `dependencies` are installed. This keeps the production container/environment small. However, for most modern frontend frameworks, the "build" happens before deployment, so the distinction is primarily for organizational clarity and to prevent "runtime" libraries from being accidentally excluded.

---

## 3. Webpack, Chunking, and Optimization

**Question:** How does Webpack handle chunking and how can we optimize the final bundle?

**Answer:**
1.  **Code Splitting (Chunking):** Splitting code into multiple bundles that can be loaded on demand.
    *   *Entry Point Splitting:* Manually separating logic.
    *   *Dynamic Imports:* Using `import()` to create chunks automatically.
    *   *SplitChunksPlugin:* Extracting common dependencies (like React) into a `vendor.js` chunk for better caching.
2.  **Tree Shaking:** Removing unused code from the final bundle.
3.  **Minification:** Removing whitespace and shortening variable names (using Terser).

---

## 4. Script & Image Optimization

**Question:** What are the best practices for optimizing scripts and images?

**Answer:**
**Scripts:**
*   **`async` vs `defer`:** Use `defer` for scripts that need the DOM; use `async` for independent scripts (analytics).
*   **Module Preload:** Tell the browser to fetch important JS early.
*   **Resource Hints:** `dns-prefetch`, `preconnect`, and `prefetch`.

**Images:**
*   **Modern Formats:** Use WebP or AVIF instead of PNG/JPG.
*   **Responsive Images:** Use `srcset` and `<picture>` to serve different sizes based on device.
*   **Lazy Loading:** Use the native `loading="lazy"` attribute for below-the-fold images.
*   **Aspect Ratio:** Always set `width` and `height` to prevent layout shifts (CLS).

---

## 5. Styling Approaches in React

**Question:** Discuss different approaches to styling (CSS Modules, Styled Components, Tailwind).

**Answer:**
1.  **CSS Modules:** Localized CSS by default. Great for performance (standard CSS) and prevents class name collisions.
2.  **CSS-in-JS (Styled Components/Emotion):** Styled logic co-located with components. 
    *   *Pro:* Dynamic styling based on props. 
    *   *Con:* Runtime overhead (parsing JS to generate CSS).
3.  **Utility-First (Tailwind):** Pre-defined classes. 
    *   *Pro:* Extremely fast development and tiny final CSS bundle.
    *   *Con:* "Messy" JSX and a learning curve for class names.

**Interviewer Tip:** For performance-critical apps, CSS Modules or Tailwind are preferred over runtime CSS-in-JS because they don't block the main thread for style generation.
