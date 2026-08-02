# React API Cheat Sheet

A comprehensive reference for core React APIs, hooks, component state patterns, rendering lifecycle, and best practices.

---

## 1. Remember and Share Data

### `useState`

Remember state owned by a component. A state update schedules a render.

```tsx
const [count, setCount] = useState(0);
setCount((c) => c + 1); // prefer functional update when based on previous state
```

**Rule of thumb:** Do not mirror props or derived values into state unless you need an independently editable snapshot.

### `useReducer`

Centralize related transitions when state has multiple fields/actions or complex business rules.

```tsx
type State = { count: number };
type Action = { type: 'inc' } | { type: 'reset' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'inc':
      return { count: state.count + 1 };
    case 'reset':
      return { count: 0 };
  }
}

const [state, dispatch] = useReducer(reducer, { count: 0 });
```

### `useLinkedState` (Custom Hook Pattern)

Keeps an editable local state in sync with a changing prop or external value. Useful when you need to initialize state from a prop but also update it when the prop changes.

```tsx
import { useState, useEffect } from 'react';

export function useLinkedState<T>(externalValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(externalValue);

  useEffect(() => {
    setState(externalValue);
  }, [externalValue]);

  return [state, setState];
}
```

_Note: Alternatively, consider using key-based resetting `<Component key={externalId} />` to completely reset local state when a primary value changes._

### `createContext`

Creates a context channel through which a provider can expose data to descendants without prop drilling.

```tsx
export const ThemeContext = createContext<Theme | null>(null);
```

**Avoid:** putting frequently changing, unrelated application state into one giant context. Every subscribed consumer will re-render when the provider's value identity changes.

### `useContext`

Reads the nearest matching Context provider.

```tsx
const theme = useContext(ThemeContext);
```

### `use`

Modern React API that reads supported resources such as Promises and Context dynamically during rendering. Unlike normal hooks, `use` can be called conditionally and inside loops.

```tsx
const data = use(dataPromise); // Integrates with Suspense
const theme = use(ThemeContext); // Alternative to useContext
```

### `useSyncExternalStore`

The correct React primitive for subscribing to mutable stores managed outside React. Handles concurrent rendering and SSR snapshots safely.

```tsx
const value = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
```

Use this when implementing custom store integrations rather than relying on `useEffect` subscriptions.

### Controlled vs Uncontrolled State

```tsx
// Controlled State: React component state owns the current value
const [name, setName] = useState('');
<input value={name} onChange={(e) => setName(e.target.value)} />;

// Uncontrolled State: The DOM native input element owns the current value
const inputRef = useRef<HTMLInputElement>(null);
<input defaultValue="Deval" ref={inputRef} />;
```

- **Controlled**: React dictates the value; best for real-time validation and clean inline resets.
- **Uncontrolled**: The DOM handles the storage; best for performance in large forms and simple one-shot retrievals.

---

## 2. Component State Patterns (The 4 States of a Component)

When fetching or processing data in a frontend component, avoid using independent booleans like `isLoading`, `isError`, and `data` together. This leads to **impossible states** (e.g. `isLoading === true` and `isError === true` at the same time).

Instead, model the lifecycle using a **Discriminated Union** representing 4 mutually exclusive states: **Loading, Success, Error, and Empty**.

### State Type Definition

```tsx
export type ComponentState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error | string }
  | { status: 'empty' };
```

### Type-Safe Render Implementation

```tsx
import React from 'react';

interface Item {
  id: string;
  name: string;
}

interface ItemListProps {
  state: ComponentState<Item[]>;
  onRetry?: () => void;
}

export function ItemList({ state, onRetry }: ItemListProps) {
  switch (state.status) {
    case 'loading':
      return (
        <div className="flex items-center justify-center p-8 text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-3" />
          <span>Loading data...</span>
        </div>
      );

    case 'error':
      return (
        <div className="p-6 text-center bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 font-semibold">An error occurred</p>
          <p className="text-sm text-red-500 mt-1">
            {typeof state.error === 'string' ? state.error : state.error.message}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Retry Request
            </button>
          )}
        </div>
      );

    case 'empty':
      return (
        <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg text-gray-500">
          <h3 className="text-lg font-medium text-gray-900">No items available</h3>
          <p className="mt-1 text-sm">There is no content to show in this view.</p>
        </div>
      );

    case 'success':
      return (
        <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
          {state.data.map((item) => (
            <li key={item.id} className="p-4 hover:bg-gray-50 transition">
              <span className="text-gray-900 font-medium">{item.name}</span>
            </li>
          ))}
        </ul>
      );

    default:
      // Compile-time verification that all states are matched
      const _exhaustiveCheck: never = state;
      return _exhaustiveCheck;
  }
}
```

---

## 3. Connect to the Browser / DOM

### `useRef`

Stores a mutable value across renders without causing a re-render when `.current` changes. Also used to hold DOM nodes.

```tsx
const inputRef = useRef<HTMLInputElement>(null);
inputRef.current?.focus();
```

**Do not use refs as hidden UI state**; use them for DOM manipulation, timers, or storing stable mutable values.

### `useEffect`

Synchronizes React with an **external system after paint**: network subscriptions, browser APIs, timers, or third-party widgets.

```tsx
useEffect(() => {
  const controller = new AbortController();
  loadData(controller.signal);
  return () => controller.abort(); // Clean up subscriptions/fetches
}, [id]);
```

**Key rule:** If you can calculate a value during render, you probably do not need `useEffect`.

### `useLayoutEffect`

Runs synchronously after DOM mutations but before the browser paints. Use for layout measurements where visible flicker would otherwise occur.

```tsx
useLayoutEffect(() => {
  const rect = ref.current?.getBoundingClientRect();
}, []);
```

_Prefer `useEffect` unless pre-paint timing is required, as layout effects block browser painting._

### `useInsertionEffect`

Runs before layout effects. Primarily intended for CSS-in-JS library authors to insert styles.

### `useEffectEvent`

Defines non-reactive effect logic that always sees the latest props/state without forcing the surrounding effect to re-run merely because that logic changed.

```tsx
const onConnected = useEffectEvent(() => showToast(theme));
useEffect(() => connect(roomId, onConnected), [roomId]);
```

### `useId`

Creates a stable ID suitable for accessibility relationships and hydration consistency.

```tsx
const id = useId();
return (
  <>
    <label htmlFor={id}>Email</label>
    <input id={id} />
  </>
);
```

**Do not use for:** list keys, database IDs, or random identifiers.

### `useImperativeHandle`

Customizes the imperative API exposed through a ref to parent components.

```tsx
type InputHandle = { focus(): void };

function SearchInput({ ref }: { ref: React.Ref<InputHandle> }) {
  const input = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => ({
    focus: () => input.current?.focus(),
  }));
  return <input ref={input} />;
}
```

---

## 4. Load, Suspend, and Reveal UI

### Hydration / `hydrateRoot`

Hydration attaches React behavior to HTML already rendered by the server.

```tsx
hydrateRoot(document.getElementById('root')!, <App />);
```

_Avoid browser-only, random, or time-dependent values in SSR render paths to prevent hydration mismatches._

### `Suspense`

Defines a loading fallback boundary for descendants that suspend (e.g. lazy-loaded or streaming components).

```tsx
<Suspense fallback={<Skeleton />}>
  <Profile />
</Suspense>
```

### Error Boundary

Catches rendering and lifecycle errors in a descendant tree and replaces that subtree with fallback UI.

```tsx
<ErrorBoundary fallback={<ErrorState />}>
  <Page />
</ErrorBoundary>
```

### `lazy`

Code-splits a component and loads its source bundle on demand.

```tsx
const Settings = lazy(() => import('./Settings'));
```

### `startTransition` / `useTransition`

Marks state updates as non-urgent, keeping the UI responsive.

```tsx
const [isPending, startTransition] = useTransition();
startTransition(() => setTab(nextTab));
```

### `useDeferredValue`

Allows expensive downstream UI components to temporarily lag behind an urgent state value.

```tsx
const deferredQuery = useDeferredValue(query);
const results = <SlowResults query={deferredQuery} />;
```

### `Activity`

Modern React primitive for keeping a subtree alive while controlling visibility and suppressing its effects when hidden.

---

## 5. Handle Actions and Forms

### `useActionState`

Tracks the result and pending lifecycle status of form actions.

```tsx
const [state, submitAction, isPending] = useActionState(saveUser, initialState);
```

### `useFormStatus`

Reads submission status from the nearest parent form. Useful for building generic submit buttons.

```tsx
const { pending, data, method, action } = useFormStatus();
```

### `useOptimistic`

Shows an expected result immediately while the authoritative asynchronous operation completes.

```tsx
const [optimisticTodos, addOptimisticTodo] = useOptimistic(todos, (state, todo) => [...state, todo]);
```

### `requestFormReset`

Requests reset of an uncontrolled form from an action or transition flow.

---

## 6. Compose and Optimize

### `Fragment`

Groups sibling elements without adding an extra DOM node.

```tsx
<>
  <Header />
  <Main />
</>
```

### `memo`

Skips component re-renders when its props compare equal.

```tsx
const Row = memo(function Row({ item }: Props) { ... });
```

### `useMemo`

Caches a calculated value between renders.

```tsx
const filtered = useMemo(() => expensiveFilter(items, query), [items, query]);
```

### `useCallback`

Caches a function identity between renders.

```tsx
const onSave = useCallback(() => save(id), [id]);
```

### `createPortal`

Renders React children into another DOM container while maintaining context and event bubbling.

```tsx
createPortal(<Modal />, document.body);
```

### View Transitions

`ViewTransition`, transition types, and pseudo-elements coordinate React updates with the browser's View Transition API.

---

## 7. Roots, Resources, and Library APIs

### `createRoot`

Initializes a client-rendered React app.

```tsx
createRoot(document.getElementById('root')!).render(<App />);
```

### Resource Hints

Tells the browser about important resources early to optimize network performance.

```tsx
preconnect('https://api.example.com');
prefetchDNS('https://cdn.example.com');
preload('/font.woff2', { as: 'font' });
preinit('/app.css', { as: 'style' });
```

### Library APIs

- `createElement` — Underlies JSX syntax.
- `cloneElement` — Clones a React element with overridden props.
- `Children` / `isValidElement` — Utilities for component composition.
- `flushSync` — Forces React to flush updates to the DOM synchronously.
- `act` — Testing utility ensuring updates are flushed before assertions.
- `useDebugValue` — Adds development labels inside custom hooks.
- `setSsrSuspenseTimeout` / `getSsrSuspenseTimeout` — Server suspense deadline controllers.
- `version` — Read the installed React package version.

---

## 8. React Rendering Mental Model

```text
Trigger
  -> Render phase (calculate next tree)
  -> Reconciliation
  -> Commit DOM mutations
  -> useLayoutEffect
  -> Browser layout/paint
  -> useEffect
```

### Important Distinctions

- **Render != DOM update.** React can render and discover nothing needs committing.
- State is a snapshot for a particular render.
- Updating state queues another render; it does not mutate the current render's variables.
- React batches compatible updates.
- Component identity is determined by type + position + key.
- Changing a `key` intentionally resets component state.
- **Derived State:** Calculate values directly during render. Avoid synching state in `useEffect` when it can be calculated on the fly.
