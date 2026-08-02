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
