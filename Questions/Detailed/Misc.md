# Miscellaneous React & JavaScript Interview Questions

This guide covers specific scenarios and "gotcha" questions that often arise in interviews, ensuring you can speak to the "how" and "why" of React's internal behavior.

---

## 1. Extracting Utility Functions

**Question:** When should we extract a function as a utility function rather than keeping it inside a React component?

**Answer:**
You should move a function outside a component (or into a separate utility file) when:

1.  **It doesn't depend on React state or props:** Pure functions that only operate on arguments are easier to test and don't get re-declared on every render.
2.  **Logic Reuse:** The logic is needed across multiple components.
3.  **Complexity:** To keep the component's body focused on UI logic and rendering.

**Deep Dive:** Moving functions outside the component provides a **stable reference**. This prevents unnecessary dependency changes in hooks like `useEffect` or `useCallback` without needing to wrap the function itself in `useCallback`.

---

## 2. Asynchronous State Updates & Promises

**Question:** How do you handle asynchronous code execution (async/await, Promises) and state updates in React?

**Answer:**
React state updates are **asynchronous** and **batched**. When dealing with async operations:

1.  **Race Conditions:** If an async call finishes after a component unmounts, or if a new call starts before the old one finishes, it can cause bugs.
    - _Solution:_ Use a "cleanup" flag or `AbortController` in `useEffect`.
2.  **Functional Updates:** Always use the functional form of `setState` (e.g., `setCount(prev => prev + 1)`) when the new state depends on the previous state, as the value of the variable in the closure might be stale by the time the async code runs.
3.  **Error Handling:** Use `try/catch` blocks inside `async` functions to handle API failures and update error states accordingly.

**Explain Me:** React batches multiple `setState` calls into a single re-render for performance. However, in versions before React 18, state updates inside `setTimeout` or `Promises` were NOT batched. With **Automatic Batching** in React 18+, almost all updates are batched, regardless of where they originate.

---

## 🔥 Senior/Staff Level "Grill" Questions

### Q1: What is the "Closure Trap" in React Hooks and how do you avoid it?

> **Answer:** This occurs when a function (like a `useEffect` callback or an event handler) "captures" a variable from a previous render cycle.
>
> - **The Symptom:** Your `setCount(count + 1)` always sets the count to `1` because `count` was `0` when the function was created.
> - **The Fix:**
>   1. Use the **Functional Updater** form: `setCount(prev => prev + 1)`.
>   2. Correctly add the variable to the **Dependency Array**.
>   3. Use **`useRef`** for values that need to stay current without triggering re-renders.

### Q2: Why is "Prop Drilling" sometimes _better_ than using the Context API?

> **Answer:** Context API is an **Implicit Dependency**. It makes components harder to test in isolation and harder to reuse.
>
> - **Performance:** Every update to a Context value forces **all** consumers to re-render. Prop drilling is explicit and easier to trace.
> - **Staff Tip:** Before reaching for Context, try **Component Composition** (passing the child component as a prop).

### Q3: Explain the difference between `npm install` and `npm ci`.

> **Answer:**
>
> - `npm install`: Can update your `package-lock.json` and install slightly newer versions of packages based on SemVer ranges in `package.json`.
> - `npm ci` (Clean Install): **Strictly** follows the `package-lock.json`. It deletes `node_modules` first and is much faster and more reliable for CI/CD pipelines.

### Q4: How do you handle "The Event Loop" being blocked by a synchronous task?

> **Answer:** JS is single-threaded. A 500ms synchronous loop blocks all UI interactions (clicks, scrolls).
>
> - **Solutions:**
>   1. **Web Workers:** Run the task in a background thread.
>   2. **Chunking:** Break the task into 10ms chunks using `setTimeout` or `requestIdleCallback`.
>   3. **Scheduler:** React 18's `useTransition` yields to the main thread automatically.

---

## 3. Communication between Sibling Components

**Question:** How do you pass data between sibling components without using Redux?

**Answer:**

1.  **Lifting State Up:** Move the state to the nearest common ancestor. Pass the state down as props and a "setter" function to update it.
2.  **Context API:** Ideal for "Global UI" state (theme, user auth) where many components at different levels need the data.
3.  **Component Composition:** Pass one sibling as a `child` to the other, or pass it as a prop (render prop pattern).

---

## 4. Window Events & Listeners

**Question:** How would you re-render a component when the window is resized?

**Answer:**
Use `useEffect` to attach an event listener and update a state variable.

- **Performance:** Use **Debouncing** or **Throttling** for events like `resize` or `scroll` to avoid triggering hundreds of re-renders per second.
- **Cleanup:** Always remove the event listener in the cleanup function of `useEffect` to prevent memory leaks and unexpected behavior.

---

## 5. Shallow vs Deep Comparison

**Question:** Explain the difference between shallow and deep comparison in React.

**Answer:**

- **Shallow:** Compares references for objects/arrays. For primitives, it compares values. React uses this for `memo` and `shouldComponentUpdate`.
- **Deep:** Recursively checks all nested values.
- **Why Shallow?** Deep comparison is $O(n)$ and can be slower than the render itself. Shallow is $O(1)$ per prop, making it a highly efficient heuristic when combined with **Immutability**.

---

## 6. Limitations of React

**Question:** What are the limitations of React for large-scale applications?

**Answer:**

1.  **Non-Opinionated:** Unlike Angular, React doesn't prescribe a way to handle routing or state, leading to fragmentation in large teams.
2.  **Complexity of Performance:** As trees grow, manual optimization (`memo`, `useCallback`) becomes a maintenance burden.
3.  **Bundle Size:** Large React apps require aggressive code-splitting to maintain fast initial loads.
4.  **Prop Drilling:** Without a strategy (Context/Zustand), passing data through many layers becomes unmanageable.

---

## 7. React Router & Dynamic Routing

**Question:** How does React Router work with dynamic routing?

**Answer:**
It uses the `History API` to listen for URL changes and renders the matching component tree.

- **Dynamic Segments:** Paths like `/user/:id` are accessed via the `useParams()` hook.
- **Nested Routes:** Allows parts of the UI (like a sidebar) to remain static while the main content area changes.

---

## 8. The Module Pattern

**Question:** What is the Module Pattern and how does it help with encapsulation?

**Answer:**
The Module Pattern uses closures to create private scopes. In React, ES Modules (`import`/`export`) fulfill this role by default.

- It prevents global namespace pollution.
- It allows for "Tree Shaking" (bundlers can remove unused exports to reduce bundle size).
