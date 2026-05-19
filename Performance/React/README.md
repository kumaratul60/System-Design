# React Performance Optimization

Strategies for building high-performance React applications, focusing on rendering efficiency and state management.

## 🗺️ React Performance Mindmap

```mermaid
mindmap
  root((React Performance))
    Rendering
      Memoization (useMemo, useCallback)
      React.memo (HOC)
      Virtualization (Windowing)
    State Management
      Context vs. Zustand/Redux
      Batching Updates
      Localizing State
    Splitting
      Code Splitting (React.lazy)
      Component-Level Splitting
    Hydration
      Streaming SSR
      Partial Hydration
      Server Components
```

## 📂 Key Topics

- **Preventing Re-renders:** Deep dive into how props and state changes trigger renders.
- **List Optimization:** Using `react-window` or `react-virtualized` for long lists.
- **Concurrent Features:** Leveraging `useTransition` and `useDeferredValue`.
