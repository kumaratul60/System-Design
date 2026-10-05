# Master Interview Question Bank

This is a comprehensive collection of interview questions, ranging from core fundamentals to advanced architectural challenges. Use this as a checklist for your preparation.

---

## 🟢 Level 1: Junior / SDE-1 (Fundamentals)

### React

- **Q:** What is `useRef` and its role in persisting values?
- **Q:** Describe the key differences between functional and class components.
- **Q:** Explain the use case of `useEffect()` for fetching data from an API.
- **Q:** What are controlled vs. uncontrolled components?
- **Q:** How do you handle styling in React (CSS Modules, Tailwind, CSS-in-JS)?

### Web & JS

- **Q:** What is the difference between shallow and deep comparison?
- **Q:** How do you handle asynchronous operations using `async/await` or Promises?
- **Q:** What is the difference between `npm install` and `npm ci`?
- **Q:** How would you re-render a component when the window is resized?

### CSS & Layout Engines

- **Q:** An element is set to `width: 100vw` and it’s causing a horizontal scrollbar on desktop. Why?
  - **Answer**: `100vw` includes the width of the vertical scrollbar track (~15-17px on Windows/Linux), whereas the document layout (`100%`) excludes it. Because `100vw > 100%`, it overflows horizontally. Fix with `width: 100%` or `scrollbar-gutter: stable`.
- **Q:** Why does `width: 100%` with `margin: 1rem` overflow even when `box-sizing: border-box` is set?
  - **Answer**: `box-sizing: border-box` only contains padding and border within the declared width; margins remain outside the border box ($100\% + 2\text{rem}$). Fix with `width: auto`.
- **Q:** You're fading cards in with a scroll-driven animation, but they fade back out every time you scroll past. You want each card to animate in once and stay. Which property makes it possible?
  - **Answer**: `animation-fill-mode: forwards` (or `both`). By default, scroll-driven animations (`animation-timeline: view()`) scrub with scroll progress. Once you scroll past the entry range (`animation-range: entry`), without `forwards`, the animation resets and reverts to its default styles or fades out. `animation-fill-mode: forwards` locks the final keyframe (`opacity: 1`) in place.
- **Q:** What is the 3-question evaluation framework for adopting new CSS features safely in production?
  - **Answer**:
    1. _Is it a progressive enhancement?_ E.g., `interpolate-size: allow-keywords` allows animating to `height: auto`. If unsupported, the element still opens/closes instantly without breaking usability.
    2. _Can I provide a simple cascading fallback?_ E.g., declaring `hsl()` or `hex` first before `oklch()` (or via PostCSS Preset Env) lets older browsers safely use the earlier valid rule.
    3. _Am I okay with an alternative approach via Feature Queries?_ E.g., CSS Masonry / `grid-lanes` wrapped in `@supports (grid-template-rows: masonry)` with a standard Grid/Flexbox fallback for other browsers.

---

## 🟡 Level 2: Senior / SDE-2 (Implementation & Trade-offs)

### Performance

- **Q:** Should we memoize all UI components? What is the memory vs. computation trade-off?
- **Q:** What is **Layout Thrashing** and how do you prevent it?
- **Q:** How do you use the React Profiler to identify bottlenecks?
- **Q:** Explain the impact of code splitting on "Time to Interactive" (TTI).

### Design Patterns

- **Q:** When should you extract a function as a utility function rather than keeping it inside a component?
- **Q:** Can React Hooks fully replace Redux/Zustand for state management?
- **Q:** How would you implement a search feature with **Debouncing** in React?
- **Q:** What are **Error Boundaries** and where should they be strategically placed?

### Scalability

- **Q:** How do you pass data between sibling components without using a global store?
- **Q:** What are the limitations of React for large-scale applications?
- **Q:** How does React's reconciliation process update the DOM efficiently?

---

## 🔴 Level 3: Staff / Principal / Architect (Strategy & Systems)

### System Architecture

- **Q:** In frontend, infrastructure scaling is minimal beyond CDN. How do you scale frontend applications organizationally and technically?
- **Q:** Compare **Trunk-Based Development** vs. **GitFlow** for a team of 100+ developers.
- **Q:** How do you handle **"Zombie Connections"** when scaling a WebSocket server to 1M users?
- **Q:** Explain the **PACELC Theorem** and its relevance to modern API design.

### Advanced Security

- **Q:** What is the **"Confused Deputy"** problem in SSRF?
- **Q:** Explain **Mutation XSS (mXSS)** and why standard regex filters fail.
- **Q:** How do you handle **"Right to be Forgotten" (GDPR)** in immutable database backups?
- **Q:** Design a defense-in-depth strategy for a large-scale **Micro-Frontends (MFE)** application.

### Infrastructure & Distributed Data

- **Q:** Why does a **Service Mesh** (Istio/Envoy) introduce latency, and how do you justify it?
- **Q:** How do you perform a **Zero-Downtime DB Migration** during a Blue/Green deployment?
- **Q:** Explain the **Outbox Pattern** and how it solves the "Dual Write" problem.
- **Q:** When is **WebRTC** better than WebSockets for real-time data, and what are the scaling trade-offs (Mesh vs. SFU)?

### Deep React Internals

- **Q:** How does the **React Fiber** architecture enable "Time Slicing"?
- **Q:** What is the **"Double Data Problem"** in SSR and how do Server Components solve it?
- **Q:** Explain the **"Tearing"** problem in Concurrent Rendering and the role of `useSyncExternalStore`.

---

## 🛠️ Situational "Grill" Scenarios

### Performance Recovery

**Scenario:** A user reports that the dashboard is "laggy" after 10 minutes of use.

- **Staff Take:** I would investigate **Memory Leaks** (uncleared intervals or event listeners) and **State Density** (a single update triggering too many re-renders). I'd use the Chrome Memory Profiler to look for detached DOM nodes.

### Deployment Disaster

**Scenario:** A new MFE deployment broke the host application, but all unit tests passed.

- **Staff Take:** This indicates an **Integration Gap**. I would implement **Consumer-Driven Contract Testing** (e.g., Pact) and ensure that MFEs are versioned properly using a stable manifest.

### Security Breach

**Scenario:** You find a critical SQL injection in a core service. The fix requires 4 hours of downtime, but the business wants to wait until the weekend.

- **Staff Take:** I would propose an immediate **WAF (Web Application Firewall)** rule to block the attack pattern at the Edge. This buys time for a proper fix without leaving the system vulnerable for days.
