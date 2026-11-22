# Infinite Scroll with React & TypeScript

A production-ready, interview-grade implementation of Infinite Scroll in React and TypeScript consuming the DummyJSON Products API (`https://dummyjson.com/products`).

This project demonstrates two distinct infinite scrolling paradigms:
1. **Approach 1 (Recommended)**: Browser-native `IntersectionObserver` with a bottom **Sentinel Element** (`src/AppNew.tsx`).
2. **Approach 2 (Alternative / Traditional)**: Global window scroll listener using `window.scrollY + window.innerHeight` calculations (`src/AppWindowScroll.tsx`).

---

## Core Constraints & Requirements

1. **Pagination**: Increments `skip` by `limit` (`skip = currentSkip + LIMIT`) and fetches the next chunk.
2. **Append Data**: Appends newly fetched chunk data to existing items without wiping or resetting loaded data.
3. **Bottom Detection**:
   - In Approach 1: Uses `IntersectionObserver` observing an empty sentinel `div` at the bottom.
   - In Approach 2: Calculates `window.scrollY + window.innerHeight >= document.documentElement.offsetHeight - BUFFER`.
4. **Overfetch Guard**: Stops fetching when `nextSkip >= total` or when empty data is received; cleanly unobserves or removes listeners.
5. **Concurrency & Deduplication Guard**: Prevents parallel or duplicate requests while an in-flight network call is active.
6. **Initial Load**: Automatically fires the initial request with `limit=10, skip=0`.

---

## Architectural Deep Dive

### 1. What is a "Sentinel"? (It is NOT the scroll cursor!)

> [!NOTE]
> In web architecture, a **Sentinel** is **NOT** the scroll cursor, mouse pointer, or scrollbar thumb.
>
> The word *sentinel* originates from the military term for a **guard or watchman posted at an outpost**.
>
> In infinite scroll:
> - We insert a lightweight, empty HTML tag at the very end of our rendered product grid:
>   ```tsx
>   {hasMoreProducts && <div ref={sentinelElementRef} className="sentinel" />}
>   ```
> - This empty `<div>` stands as an invisible watchman at the bottom of the content.
> - The browser's `IntersectionObserver` API watches this specific element.
> - As the user scrolls down, this element eventually enters the visible viewport.
> - The moment the sentinel enters the view, the observer fires a notification: *"The sentinel is visible! Fetch the next chunk!"*

---

### 2. What is `threshold` and why is it used?

The `threshold` property in `IntersectionObserver` configuration specifies **what percentage of the target element (the sentinel) must be visible in the viewport before triggering the callback**:

- **Value Range**: `0.0` (0%) to `1.0` (100%).
- `threshold: 0.0`: Triggers the instant **even 1 single pixel** of the sentinel enters the viewport.
- `threshold: 0.1`: Triggers when at least **10%** of the sentinel is visible.
- `threshold: 1.0`: Triggers only when **100%** of the sentinel is completely visible on screen.

#### Why pair `threshold` with `rootMargin`?
```typescript
export const OBSERVER_CONFIG = {
  ROOT: null,           // Uses the browser viewport
  ROOT_MARGIN: '150px', // Expands detection boundary 150px below the viewport
  THRESHOLD: 0.1,       // Triggers when 10% of sentinel enters the expanded boundary
} as const;
```
- By adding `rootMargin: '150px'`, the browser considers the sentinel "visible" when it is still **150 pixels below the screen bottom**.
- This creates a **pre-fetch zone**: the next 10 items start downloading *before* the user hits the absolute bottom, delivering a seamless scrolling experience with zero lag.

---

### 3. Decoupled State Architecture

Instead of a monolithic state object or scattered independent hooks, the component divides state into two clean concerns:

```typescript
// 1. API Request Lifecycle (atomic data, loading, and error states)
interface ApiState<T> {
  data: T[];
  isLoading: boolean;
  error: string | null;
}

const [apiState, setApiState] = useState<ApiState<Product>>({
  data: [],
  isLoading: false,
  error: null,
});

// 2. Decoupled Pagination Boundaries
const [skipOffset, setSkipOffset] = useState<number>(PAGINATION_CONFIG.INITIAL_SKIP);
const [hasMoreProducts, setHasMoreProducts] = useState<boolean>(true);
const [totalProductsCount, setTotalProductsCount] = useState<number | null>(null);
```

#### Benefits:
- **Separation of Concerns**: API fetching status does not pollute pagination bounds.
- **Atomic Rendering**: When new items arrive, `data`, `isLoading`, and `error` update together in one render cycle.
- **Easy Reset**: To refresh or re-fetch from page 1, only `skipOffset` and `hasMoreProducts` need resetting.

---

### 4. Simplified Refs (No Complex Sets)

Previous iterations used multiple `Set` references (`fetchedSkipsRef`, `seenProductIdsRef`) which added unnecessary complexity. 

`AppNew.tsx` simplifies this to just two clean refs:
1. `sentinelElementRef`: Ref pointing directly to the sentinel DOM node `<div ref={sentinelElementRef} />`.
2. `isFetchingRef`: A synchronous boolean guard (`useRef(false)`) that immediately locks the fetch function while an async request is awaiting response, preventing React 18 StrictMode double-triggers and rapid scroll spam.

---

### 5. Approach Comparison

| Feature | Approach 1: `IntersectionObserver` (`AppNew.tsx`) | Approach 2: Window Scroll (`AppWindowScroll.tsx`) |
| :--- | :--- | :--- |
| **API Mechanism** | Browser native `IntersectionObserver` on sentinel DOM node | `window.addEventListener('scroll', handler)` |
| **Thread & Performance**| Async, runs off the main thread; zero scroll event spam | Runs on main thread; requires `requestAnimationFrame` throttling |
| **Calculation** | Handled natively by browser layout engine | Manual math: `window.innerHeight + window.scrollY >= docHeight - OFFSET` |
| **Pre-fetch Buffer** | `rootMargin: '150px'` | `BOTTOM_OFFSET_PX: 200` |
| **Browser Compatibility**| Modern browsers (IE11 requires polyfill) | All browsers (legacy compatible) |
| **Industry Recommendation**| **Preferred / Standard** for modern web apps | Useful fallback or for custom scroll containers |

---

## Project Structure

```text
├── index.html                   # HTML entry point with root div
├── index.ts                     # Package exports
├── package.json                 # Dependencies and npm scripts
├── src/
│   ├── types.ts                 # Full DummyJSON Product & Response schema
│   ├── index.css                # External CSS stylesheet (no UI libraries)
│   ├── AppNew.tsx               # Primary implementation (IntersectionObserver + Sentinel)
│   ├── AppWindowScroll.tsx      # Alternative implementation (window.scrollY)
│   ├── App.tsx                  # Base implementation
│   └── main.tsx                 # React DOM mount with approach switcher
├── test-logic.mjs               # Node.js automated test verifying pagination logic
├── tsconfig.json                # TypeScript configuration
└── vite.config.ts               # Vite bundler configuration
```

---

## Getting Started

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Run the Development Server
```bash
pnpm dev
```
Open `http://localhost:5173` in your browser. Use the top toolbar to switch between **Approach 1 (IntersectionObserver)** and **Approach 2 (Window Scroll)**.

### 3. Run Quality Verification & Tests
```bash
pnpm test          # Run constraint logic tests
pnpm check:all     # Run typecheck + lint + format:check + test
pnpm build         # Strict TypeScript check & Vite production build
```

---

## 📖 Related Cheatsheets & Theoretical References
- 📄 **[API Pagination Architecture (Offset vs. Keyset vs. Cursor)](../../../../cheatsheets/pagination.md)**: Deep dive on Offset vs. Keyset vs. Cursor, SQL deep paging traps, compound Base64 tokens, and Relay connection specs.
- 👁️ **[IntersectionObserver & Scroll Architecture](../../../../cheatsheets/IntersectionObserver_and_Scroll.md)**: Deep dive into off-main-thread compositor observations, threshold mechanics, and layout thrashing.
- 📐 **[Low-Level Design (LLD) & Design Patterns](../../../LLD.md)**: Component composition, observer patterns, and memory lifecycle management.
