# React Router API Cheat Sheet

A comprehensive reference for routing paradigms, configuration, hooks, and navigation control in React applications.

---

## 1. Router Setup & Core Concepts

### Router Responsibilities

```text
URL
 -> route matching
 -> params / search params extraction
 -> data loading / mutation actions
 -> route boundary rendering (error/loading/layout)
 -> page component render
```

### Core Router Setup

```tsx
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteError />, // Error boundary at layout level
    children: [
      { index: true, element: <Home /> },
      {
        path: 'users/:userId',
        loader: userLoader, // Fetches data before rendering
        element: <User />,
      },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}

// Layout example with Outlet
function RootLayout() {
  return (
    <div>
      <header>My Application</header>
      <main>
        <Outlet /> {/* Renders the matched child route component */}
      </main>
    </div>
  );
}
```

### 💡 Core Routing APIs in 2-3 Words

- **`createBrowserRouter`**: Defines route maps.
- **`RouterProvider`**: Enables routing context.
- **`Outlet`**: Renders child views.

### 🔄 Why `<Switch>` was replaced (v5 to v6+)

1. **Parallel Data Loading (Loaders)**: With `<Switch>` in v5, routing happened completely inside the React render tree. This meant components had to mount first, causing "waterfalls" where data fetching started only _after_ rendering. The new data router matches routes statically, starting data `loader` fetches **before** any component renders.
2. **Declarative Nested Layouts**: Rather than flat matching where only one component gets mounted via `<Switch>`, v6 maps nested paths directly. Parent routes render a persistent layout shell, and matched child routes are injected cleanly through `<Outlet>` without re-mounting the layout context.

---

## 2. Core Components

| Component        | Purpose                                                          |
| :--------------- | :--------------------------------------------------------------- |
| `Link`           | Declarative client-side navigation. Prevents page reload.        |
| `NavLink`        | Link variant aware of its active and pending states for styling. |
| `Outlet`         | Render boundary placeholder for matched nested child routes.     |
| `Navigate`       | Declarative element-based redirect / navigation triggers.        |
| `Form`           | Router-aware HTML form wrapper triggering action handlers.       |
| `RouterProvider` | Context wrapper providing router instance and data APIs.         |

---

## 3. Important Hooks

### `useNavigate`

Imperative navigation controller.

```tsx
const navigate = useNavigate();

// Navigate to absolute or relative path
navigate('/dashboard');

// Navigate with history manipulation (replace instead of push)
navigate('/login', { replace: true });

// Navigate backward or forward in history
navigate(-1);
```

_Prefer `<Link>` for user-triggered navigation. Use `navigate` for redirects after side-effects (e.g. form submission success)._

> [!WARNING]
> **Anti-Pattern: Calling `navigate()` inside `useEffect`**
>
> Running `navigate()` in `useEffect` to manage route guards or redirects is a major production hazard.
>
> #### 1. The UX/Security Leak (Flash of Protected Content)
>
> `useEffect` runs asynchronously _after_ layout and paint. If you route an unauthenticated user to a protected page and redirect them inside `useEffect`, the browser is forced to paint the protected page (or its private layout, skeleton, or header) for 1–3 frames (16ms to 50ms) before navigating away. This creates a jarring screen flash and leaks internal layout designs to unauthorized users.
>
> #### 2. The Browser Loop Lock (Crash Risk)
>
> Because effects rely on dependency arrays, tracking routing variables like `navigate`, `user`, or `location` can trigger recursive render cycles. If the destination route changes state in a way that triggers a parent state update, it can lock the user's browser in an **infinite redirect loop**, freezing the tab and draining device battery.
>
> #### 3. Wastage of CPU/GPU Cycles
>
> React goes through the heavy computational work of executing the component render function, building the Virtual DOM, committing changes to the real DOM, and rendering/painting the screen—only to immediately discard all that work and repeat the entire lifecycle for the new redirected path. On low-powered mobile devices, this leads to battery drain and animation lag.
>
> #### 4. Why this became a major focus in React Router v6
>
> To solve these exact issues, React Router v6 introduced **Data Routers** (like `createBrowserRouter`). By decoupling route definition from the React render tree, v6 enables route **`loaders`** to intercept requests and return `redirect()` statements **before** any React component mounts, renders, or paints, securing a 100% flicker-free layout transition.
>
> **🏆 Best Practice Alternatives:**
>
> 1.  **Redirection in Route Loaders (Highly Recommended):** In modern React Router, use the `redirect` helper inside a route `loader` or `action`. Loaders execute **before** any component mounts or paints, completely eliminating flicker.
>     ```tsx
>     // Setup in Router Config
>     {
>       path: '/dashboard',
>       loader: async () => {
>         const user = await checkAuth();
>         if (!user) return redirect('/login');
>         return user;
>       },
>       element: <Dashboard />
>     }
>     ```
> 2.  **Declarative `<Navigate />` during Render:** If you must trigger a redirect dynamically during component execution, return the `<Navigate />` component directly inside the render path. This halts rendering and starts navigation _before_ any incorrect painting occurs.
>     ```tsx
>     if (!user) {
>       return <Navigate to="/login" replace />;
>     }
>     return <DashboardView />;
>     ```
> 3.  **Event-Driven Navigation:** Keep imperative `navigate` calls inside user action callbacks (like form submissions or button clicks) rather than synchronization loops.

### `useParams`

Reads path parameters from the current matched route.

```tsx
const { userId } = useParams<{ userId: string }>();
```

_Note: Route parameters are strings or undefined. Always validate before using in operations._

### `useSearchParams`

Reads and updates URL search (query) parameters.

```tsx
const [searchParams, setSearchParams] = useSearchParams();

const page = Number(searchParams.get('page') ?? '1');
const query = searchParams.get('q') ?? '';

// Update query params in URL
setSearchParams({ q: 'react', page: '2' });
```

_Excellent for filters, search query inputs, pagination, tabs, and shareable/bookmarkable UI state._

### `useLocation`

Exposes the current URL location object.

```tsx
const location = useLocation();
// Properties: location.pathname, location.search, location.hash, location.state, location.key
```

### `useMatch`

Matches a route pattern relative to the current location. Returns a `PathMatch` object if matched, or `null` if not.

```tsx
import { useMatch } from 'react-router-dom';

const match = useMatch('/users/:id');

// CRITICAL: Always verify match is not null before accessing parameters
if (match) {
  const userId = match.params.id; // type-safe string
  const matchedPath = match.pathname; // matched pathname segment
  const pattern = match.pattern; // pattern used for matching
} else {
  // Current URL path does not match '/users/:id'
}
```

_Prefer route-aware `useMatch` matching over fragile `window.location.pathname.includes(...)` checks._

#### 💡 Hook Comparison Matrix (`useMatch` vs. Others)

Does using `useMatch` make other hooks redundant? **No.** They serve distinct purposes:

| Hook                  | Purpose            | Read/Write | Scope                                       | Example Use Case                                     |
| :-------------------- | :----------------- | :--------- | :------------------------------------------ | :--------------------------------------------------- |
| **`useMatch`**        | Pattern Matching   | Read-only  | Matches path pattern segments               | Highlight navigation items if URL matches `/admin/*` |
| **`useNavigate`**     | Navigation Trigger | Write-only | Modifies browser URL history                | Redirect to dashboard on successful login            |
| **`useLocation`**     | Location Info      | Read-only  | Exposes whole location state, hash, and key | Read custom navigation payload (`location.state`)    |
| **`useSearchParams`** | Query String       | Read/Write | Parses/mutates query variables (`?page=2`)  | Sync sorting, filters, or search inputs with URL     |

> [!NOTE]
> **Use Case Check:** If your only goal is to inspect the current path hierarchy or extract path variables (e.g. matching `/users/:id` and getting `params.id`), **`useMatch` is fully self-sufficient** and you do not need `useLocation`.
> However, because `useMatch` only extracts `params`, `pathname`, and `pattern`, it **cannot** read query parameters (`?page=2`) or history navigation payloads (`location.state`). For those, you still must use `useSearchParams` or `useLocation`.

### `useLoaderData`

Reads the value returned by the current route's `loader` function.

```tsx
const user = useLoaderData() as User;
```

### `useRouteLoaderData`

Reads loader data belonging to another matched route by its defined route ID.

```tsx
const parentData = useRouteLoaderData('root') as RootData;
```

### `useActionData`

Reads the latest value returned by the current route's form `action` function.

```tsx
const actionResult = useActionData() as ActionOutput;
```

### `useNavigation`

Exposes the global router transition status (idle, loading, submitting).

```tsx
const navigation = useNavigation();
const isFetchingData = navigation.state === 'loading';
const isSubmittingForm = navigation.state === 'submitting';
```

### `useFetcher`

Enables triggering loaders and actions without causing page-level navigation. Useful for background updates, toggle switches, or async validations.

```tsx
const fetcher = useFetcher();

// Submit a data mutation in the background
fetcher.submit(data, { method: 'post', action: '/favorites/toggle' });

// Load data in the background
useEffect(() => {
  if (fetcher.state === 'idle' && !fetcher.data) {
    fetcher.load('/api/notifications');
  }
}, [fetcher]);
```

### `useRouteError`

Exposes the thrown error inside a route-level `errorElement` boundary.

```tsx
const error = useRouteError();
```

### `useOutletContext`

Shares a typed context from a layout route component down to its matched child outlet components.

```tsx
// Inside Parent Layout
<Outlet context={{ theme, user }} />;

// Inside Child Route Component
const { theme, user } = useOutletContext<{ theme: string; user: User }>();
```

---

## 4. Other Router APIs

- `redirect` — Helper to return/throw redirects from loader or action functions.
- `defer` — Utility enabling deferred loading for streaming data paths.
- `matchPath` — Imperative matching of a path string against a pattern outside component rendering.
- `generatePath` — Generates a valid path string from a pattern and parameters (e.g. `generatePath('/users/:id', { id: '42' })` returns `/users/42`).
- `createSearchParams` — Helper to construct search params strings or objects.
- `useBlocker` — Hook to block navigation when there is unsaved work.

---

## 5. Staff-Level Design Guidance

```text
Local UI visual state     -> Component state (useState/useReducer)
Shareable filters/sorts   -> URL Search Params
Entity Identity / ID      -> Route parameters (:id)
Page / Route data         -> Loader/Query layer
Mutation operations       -> Action/Fetcher/Query mutation
Auth & route permissions  -> Layout/Route boundary wrappers + Server validation
```

**Architectural Principle:** Do not copy URL state into client stores (like Redux or Zustand). The URL is the single source of truth for the router.
