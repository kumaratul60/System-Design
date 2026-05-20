# React Design Patterns & Common Tasks

This guide covers common design patterns and how to implement real-world features correctly.

---

## 1. HOC vs Render Props vs Custom Hooks

**Question:** What are Higher-Order Components (HOC) and Render Props? How do they compare to Custom Hooks?

**Answer:**
All three are patterns for **logic reuse.**

- **HOC (Higher-Order Component):** A function that takes a component and returns a new component (e.g., `withAuth(MyComponent)`).
  - _Cons:_ "Wrapper Hell," naming collisions.
- **Render Props:** A component whose prop is a function that returns a React element.
  - _Cons:_ Can lead to deeply nested JSX ("Callback Hell" for UI).
- **Custom Hooks:** The modern standard for reusing stateful logic.
  - _Pros:_ Flat structure, easy to compose, no extra components in the tree.

**Explain Me:**
Custom Hooks have largely replaced HOCs and Render Props for **logic reuse.** However, HOCs are still useful for **cross-cutting concerns** (e.g., wrapping all pages in a layout or adding an Error Boundary) where you want to apply logic "outside" the component.

---

## Senior/Staff Level "Grill" Questions

### Q1: What is the "Compound Components" pattern and why is it superior for library authors?

> **Answer:** It's a pattern where a group of components work together to share state implicitly (e.g., `<Select><Option /></Select>`).
>
> - **The Benefit:** It provides an expressive API that avoids "Prop Drilling" and "Prop Bloat" in the parent component.
> - **Implementation:** Use `React.Context` to share the internal state (like the active tab or selected option) across the children without the user having to pass props manually.

### Q2: Explain "Inversion of Control" (IoC) in the context of React Hooks.

> **Answer:** IoC is when you give the user of your hook or component the ability to control its internal logic.
>
> - **Example:** `useTable` in React Table doesn't render any UI. It just provides the _logic_ and _state_. The developer "controls" the rendering.
> - **The Benefit:** This makes the library "headless" and extremely flexible, as it doesn't enforce any specific styling or DOM structure.

### Q3: How do you handle "Portals" and the "Z-Index War" in a large application?

> **Answer:** In a deeply nested DOM, a modal can be "cut off" by a parent with `overflow: hidden` or a lower `z-index`.
>
> - **The Solution:** Use **React Portals** (`createPortal`) to render the modal at the end of the `<body>` while still keeping it logically in the component tree for props and context.
> - **Staff Tip:** Always provide a "Portal Root" (`<div id="modal-root"></div>`) in your HTML to keep the DOM organized and avoid "z-index fighting" between multiple portals.

### Q4: Controlled vs. Uncontrolled Components: When is "Uncontrolled" actually better?

> **Answer:** While "Controlled" (using `useState`) is standard for simple forms, **Uncontrolled** (using `useRef`) is significantly better for **Performance** in massive forms (e.g., a spreadsheet or a 100-field data entry page).
>
> - **Why:** Controlled components trigger a re-render of the entire component on _every single keystroke_. Uncontrolled components only "read" the DOM when the form is submitted, resulting in 0 re-renders during typing.

---

## 🛠️ Architect's Pattern Selection

| Pattern                 | Best for...                                    | Scaling Challenge                 |
| :---------------------- | :--------------------------------------------- | :-------------------------------- |
| **Custom Hooks**        | Logic reuse across components.                 | Complex dependency arrays.        |
| **Compound Components** | Highly flexible UI kits (Tabs, Selects).       | Context overhead if too many.     |
| **Render Props**        | Passing UI logic into a specialized component. | "JSX nesting" depth.              |
| **Headless UI**         | Maximum styling flexibility.                   | High setup cost for the consumer. |

---

## 2. Error Boundaries

**Question:** How do you catch and handle UI crashes in React?

**Answer:**
**Error Boundaries** are class components that implement `static getDerivedStateFromError()` and `componentDidCatch()`. They catch JS errors _anywhere_ in their child component tree, log those errors, and display a fallback UI instead of the crashed component tree.

**Limitations:**
They do **not** catch errors for:

1.  Event handlers (use `try/catch` there).
2.  Asynchronous code (e.g., `setTimeout` or `requestAnimationFrame`).
3.  Server-side rendering.
4.  Errors thrown in the boundary itself (rather than its children).

---

## 3. Implementing a Search with Debouncing

**Question:** How would you implement a search feature with debouncing in React?

**Answer:**

1.  Use `useState` for the search term.
2.  Use a Custom Hook `useDebounce` to return a debounced value.
3.  Use `useEffect` to trigger the API call whenever the _debounced_ value changes.

**Example Logic:**

```javascript
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler); // Cleanup is CRITICAL
  }, [value, delay]);
  return debouncedValue;
};
```

**Explain Me:**
Without a cleanup function (`clearTimeout`), every keystroke would still trigger an API call after the delay, just shifted in time. The cleanup ensures that if the user types again within the delay window, the previous timer is cancelled.

---

## 4. Configurable Dropdown (Modular Design)

**Question:** Design a configurable dropdown where you can dynamically add/delete values.

**Answer:**

1.  **Modularity:** Break it down into `Dropdown`, `DropdownMenu`, `DropdownItem`, and `AddValueForm` components.
2.  **State Management:** Use a parent component (or a custom hook) to manage the list of items.
3.  **Efficiency:** Use `key` props correctly to avoid unnecessary re-renders. Memoize individual items if the list is large.
4.  **UX:** Handle "Click Outside" to close the menu and "Keyboard Navigation" (Arrow keys, Enter).

---

## 5. Handling Side Effects & Async Data

**Question:** How do you handle side effects effectively, especially data fetching with `useEffect`?

**Answer:**

1.  **Loading & Error States:** Always track `isLoading` and `error`.
2.  **Race Conditions:** If a user triggers a second request before the first one finishes, you might display stale data.
    - _Fix:_ Use `AbortController` or a "boolean flag" in the cleanup function.
3.  **Strict Mode:** Be aware that `useEffect` runs twice in development.

**Best Practice:**
Use a library like `TanStack Query` (React Query) which handles caching, deduplication, and stale-time automatically.

---

## 6. Forms & Validation

**Question:** How would you implement dynamic form handling and validation?

**Answer:**

1.  **State Structure:** Use a single object state `formValues` instead of multiple `useState` calls.
2.  **Validation Logic:** Keep validation rules separate from the UI components.
3.  **Controlled Inputs:** Use the `name` attribute and a single `handleChange` function:
    ```javascript
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormValues((prev) => ({ ...prev, [name]: value }));
    };
    ```
4.  **Libraries:** For complex forms, use `React Hook Form` (uncontrolled for performance) or `Formik`.
