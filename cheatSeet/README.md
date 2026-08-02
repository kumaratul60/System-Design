# Frontend / React / TypeScript Master Reference

> A single-place reference for React, React Router, state management, Redux Toolkit, Redux-Saga, TypeScript, browser integration, performance, architecture, and interview-level trade-offs.

## Mental Model: Choose the Smallest Correct Tool

```text
Local UI state        -> useState
Complex local state   -> useReducer
Shared subtree state  -> Context
External client store -> useSyncExternalStore / Redux / Zustand-like store
Server state          -> Router loaders / RTK Query / query library
URL state             -> React Router
DOM/mutable state     -> useRef
Derived value         -> calculate during render; useMemo only if needed
Side effect           -> useEffect only for external synchronization
```

---

# 1. React — Remember and Share Data

## `useState`

Remember state owned by a component. A state update schedules a render.

```tsx
const [count, setCount] = useState(0);
setCount((c) => c + 1); // prefer functional update when based on previous state
```

**Staff-level note:** Do not mirror props or derived values into state unless you need an independently editable snapshot.

## `useReducer`

Centralize related transitions when state has multiple fields/actions or business rules.

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

## `createContext`

Creates a channel through which a provider can expose data to descendants without prop drilling.

**Use for:** dependency/configuration, auth/session shell, theme, feature-level state.

**Avoid:** putting frequently changing unrelated application state into one giant context; every subscribed consumer may re-render when the provider value identity changes.

## `useContext`

Reads the nearest matching Context provider.

```tsx
const auth = useContext(AuthContext);
```

## `use`

Modern React API that can read supported resources such as Promises and Context during rendering. Promise reads integrate with Suspense.

```tsx
const data = use(dataPromise);
```

Unlike normal hooks, `use` has special conditional/loop usage semantics, but it still must execute while React is rendering.

## `useSyncExternalStore`

The correct React primitive for subscribing to mutable stores managed outside React. Handles concurrent rendering and SSR snapshots safely.

```tsx
const value = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
```

Use it when implementing store/library integrations rather than reinventing subscription logic with `useEffect`.

## Controlled vs Uncontrolled State

```tsx
// Controlled
<input value={name} onChange={e => setName(e.target.value)} />

// Uncontrolled
<input defaultValue="Deval" ref={inputRef} />
```

Controlled = React owns current value. Uncontrolled = DOM owns it.

---

# 2. React — Browser / DOM Integration

## `useRef`

Stores a mutable value across renders without causing a render when `.current` changes. Also holds DOM nodes.

```tsx
const inputRef = useRef<HTMLInputElement>(null);
inputRef.current?.focus();
```

Use for DOM nodes, timers, previous imperative values, external instances. Do not use refs as hidden UI state.

## `useEffect`

Synchronizes React with an **external system after commit/paint**: network subscriptions, browser APIs, timers, analytics, third-party widgets.

```tsx
useEffect(() => {
  const controller = new AbortController();
  loadData(controller.signal);
  return () => controller.abort();
}, [id]);
```

**Key rule:** If you can calculate something during render, you probably do not need an effect.

## `useLayoutEffect`

Runs synchronously after DOM mutation but before browser paint. Use for layout measurement/correction where visible flicker would otherwise occur.

```tsx
useLayoutEffect(() => {
  const rect = ref.current?.getBoundingClientRect();
}, []);
```

Prefer `useEffect` unless pre-paint timing is required because layout effects block painting.

## `useInsertionEffect`

Runs before layout effects and is primarily intended for CSS-in-JS/library authors inserting styles. Not a normal application effect primitive.

## `useEffectEvent`

Defines non-reactive effect logic that always sees the latest props/state without forcing the surrounding effect to re-run merely because that logic changed.

Conceptually:

```tsx
const onConnected = useEffectEvent(() => showToast(theme));
useEffect(() => connect(roomId, onConnected), [roomId]);
```

## `useId`

Creates a stable ID suitable for accessibility relationships and SSR/hydration consistency.

```tsx
const id = useId();
return (
  <>
    <label htmlFor={id}>Email</label>
    <input id={id} />
  </>
);
```

**Do not use it for:** list keys, database IDs, random business identifiers.

## `useImperativeHandle`

Customizes the imperative API exposed through a ref.

```tsx
type InputHandle = { focus(): void };

function SearchInput({ ref }: { ref: React.Ref<InputHandle> }) {
  const input = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => ({ focus: () => input.current?.focus() }));
  return <input ref={input} />;
}
```

Use sparingly; declarative props are normally preferable.

---

# 3. React — Load, Suspend and Reveal UI

## Hydration / `hydrateRoot`

Hydration attaches React behavior to HTML already rendered by the server.

```tsx
hydrateRoot(document.getElementById('root')!, <App />);
```

A hydration mismatch means server and first client render disagree. Avoid browser-only values, random values, or time-dependent output in SSR render paths.

## `Suspense`

Defines a loading boundary for descendants that suspend.

```tsx
<Suspense fallback={<Skeleton />}>
  <Profile />
</Suspense>
```

Think in **boundary placement**, not one global spinner. Boundaries should reflect UX loading units.

## Error Boundary

Catches rendering/lifecycle errors in a descendant tree and replaces that subtree with fallback UI. It does not generally catch event-handler or arbitrary async callback errors.

```tsx
<ErrorBoundary fallback={<ErrorState />}>
  <Page />
</ErrorBoundary>
```

## `lazy`

Code-splits a component and loads it on demand.

```tsx
const Settings = lazy(() => import('./Settings'));
```

Usually pair with Suspense and route-level splitting.

## `startTransition`

Marks state updates as non-urgent.

```tsx
startTransition(() => setTab(nextTab));
```

## `useTransition`

Starts transitions and exposes pending state.

```tsx
const [isPending, startTransition] = useTransition();
```

Use transitions to preserve responsiveness, not to delay every state update.

## `useDeferredValue`

Allows expensive downstream UI to temporarily lag behind an urgent value.

```tsx
const deferredQuery = useDeferredValue(query);
const results = <SlowResults query={deferredQuery} />;
```

Useful when typing must remain responsive but rendering/filtering is expensive.

## `Activity`

Modern React primitive for keeping a subtree around while controlling visibility/background behavior and effects. Useful for preserving UI state across hidden/visible modes where supported by your React version.

---

# 4. React — Actions and Forms

## `useActionState`

Tracks the result and pending lifecycle of an action.

```tsx
const [state, submitAction, isPending] = useActionState(saveUser, initialState);
```

## `useFormStatus`

Reads submission status from the nearest parent form action. Useful for reusable submit controls.

```tsx
const { pending } = useFormStatus();
```

## `useOptimistic`

Shows an expected result immediately while the authoritative operation completes.

```tsx
const [optimisticTodos, addOptimisticTodo] = useOptimistic(todos, (state, todo) => [...state, todo]);
```

Always design rollback/error reconciliation; optimistic UI is a consistency decision, not merely animation.

## `requestFormReset`

Requests reset of an uncontrolled form from an action/transition flow where supported.

---

# 5. React — Composition and Optimization

## `Fragment`

Groups siblings without adding a DOM node.

```tsx
<>
  <Header />
  <Main />
</>
```

## `memo`

Skips re-render when props compare equal. It is a performance optimization, not a correctness tool.

```tsx
const Row = memo(function Row({ item }: Props) { ... });
```

## `useMemo`

Caches a calculated value between renders.

```tsx
const filtered = useMemo(() => expensiveFilter(items, query), [items, query]);
```

Use when calculation is meaningfully expensive or stable identity is required by a consumer. Do not memoize trivial expressions by default.

## `useCallback`

Caches a function identity.

```tsx
const onSave = useCallback(() => save(id), [id]);
```

Decision rule:

```text
Passed to memoized child?             -> consider useCallback
Dependency where stable identity helps? -> consider useCallback
Otherwise                              -> usually unnecessary
```

## `createPortal`

Renders children into another DOM container while keeping them in the same React tree.

```tsx
createPortal(<Modal />, document.body);
```

Events/context still follow the React tree. Useful for modals, popovers, tooltips.

## View Transitions

`ViewTransition`, transition types, and pseudo-element integrations coordinate React updates with the browser View Transition API where supported. Treat these as progressive enhancement and keep accessibility/reduced-motion behavior in mind.

---

# 6. React — Roots, Resources and Library APIs

## `createRoot` / `hydrateRoot`

```tsx
createRoot(root).render(<App />); // client-rendered app
hydrateRoot(root, <App />); // server HTML already exists
```

## Resource Hints

```tsx
preconnect('https://api.example.com');
prefetchDNS('https://cdn.example.com');
preload('/font.woff2', { as: 'font' });
preinit('/app.css', { as: 'style' });
```

- `preconnect` — establish connection early.
- `prefetchDNS` — resolve DNS early.
- `preload` — fetch a resource needed soon.
- `preinit` — fetch and initialize executable/style resources early.

Use carefully; over-preloading competes with critical resources.

## `createElement`

JS API underlying JSX.

```tsx
createElement(Button, { disabled: true }, 'Save');
```

## `cloneElement`

Creates a new element based on an existing element with overridden props/children. Mainly useful in library/component composition; often better replaced by explicit APIs/context.

## `Children` / `isValidElement`

Utilities for opaque React children structures and element validation. Mostly library-level APIs.

## `flushSync`

Forces React to synchronously flush updates to the DOM.

```tsx
flushSync(() => setOpen(true));
```

Escape hatch for browser/third-party integrations. Overuse defeats batching/concurrent scheduling.

## `act`

Testing utility ensuring updates/effects are flushed before assertions. Most testing libraries wrap common interactions automatically.

## `useDebugValue`

Labels custom-hook state for development tooling where supported. Library/custom-hook debugging concern, not application behavior.

---

# 7. React Rendering Mental Model

```text
Trigger
  -> Render phase (calculate next tree)
  -> Reconciliation
  -> Commit DOM mutations
  -> useLayoutEffect
  -> Browser layout/paint
  -> useEffect
```

Important distinctions:

- **Render != DOM update.** React can render and discover nothing needs committing.
- State is a snapshot for a particular render.
- Updating state queues another render; it does not mutate the current render's variables.
- React batches compatible updates.
- Component identity is determined by type + position + key.
- Changing a `key` intentionally resets component state.

## Keys

```tsx
items.map((item) => <Row key={item.id} item={item} />);
```

Use stable semantic identity. Avoid array indexes when ordering/insertion/removal can change.

## Derived State

Bad:

```tsx
const [fullName, setFullName] = useState('');
useEffect(() => setFullName(first + ' ' + last), [first, last]);
```

Better:

```tsx
const fullName = `${first} ${last}`;
```

---

# 8. React Router (`react-router-dom`)

## Router Responsibilities

```text
URL
 -> route matching
 -> params/search params
 -> data loading/actions
 -> route boundary
 -> component
```

Treat URL state as first-class application state when users should be able to bookmark, refresh, share, or navigate with browser history.

## Core Router Setup

```tsx
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Home /> },
      {
        path: 'users/:userId',
        loader: userLoader,
        element: <User />,
      },
    ],
  },
]);

<RouterProvider router={router} />;
```

## Important Components

| API              | Purpose                               |
| ---------------- | ------------------------------------- |
| `Link`           | Declarative navigation                |
| `NavLink`        | Link with active/pending awareness    |
| `Outlet`         | Render matched child route            |
| `Navigate`       | Declarative redirect/navigation       |
| `Form`           | Router-aware form/navigation mutation |
| `RouterProvider` | Provides a data router                |

## Important Hooks

### `useNavigate`

Imperative navigation.

```tsx
const navigate = useNavigate();
navigate('/dashboard');
navigate(-1);
```

Prefer `Link` for normal user navigation; use `navigate` after imperative flows such as successful submission.

### `useParams`

```tsx
const { userId } = useParams<{ userId: string }>();
```

Route params are strings/undefined; validate/parse at boundaries.

### `useSearchParams`

```tsx
const [params, setParams] = useSearchParams();
const page = Number(params.get('page') ?? 1);
setParams({ page: '2', query: 'react' });
```

Great for filters, sorting, pagination, tabs, shareable search state.

### `useLocation`

```tsx
const location = useLocation();
// pathname, search, hash, state, key
```

### `useMatch`

Matches a route pattern against the current location.

```tsx
const match = useMatch('/users/:id');
```

Prefer route-aware matching over fragile `pathname.includes(...)` checks.

### `useLoaderData`

Reads data returned by the current route loader.

```tsx
const user = useLoaderData() as User;
```

### `useRouteLoaderData`

Reads loader data belonging to another matched route by route ID.

### `useActionData`

Reads the latest route action result.

### `useNavigation`

Reads global router navigation state such as idle/loading/submitting.

```tsx
const navigation = useNavigation();
const busy = navigation.state !== 'idle';
```

### `useFetcher`

Performs loader/action interactions without navigating the page. Useful for inline mutations, autocomplete, optimistic interactions.

```tsx
const fetcher = useFetcher();
fetcher.submit(data, { method: 'post', action: '/favorite' });
```

### `useRouteError`

Reads the error handled by a route error boundary.

### `useOutletContext`

Shares scoped data from a layout route to its outlet descendants.

### Other Useful Router APIs

- `redirect` — return/throw redirect from loaders/actions.
- `defer`/streaming APIs where supported by router version.
- `matchPath` — imperative path-pattern matching.
- `generatePath` — build a path from a route pattern.
- `createSearchParams` — construct URL search params.
- `useBlocker` — guard navigation for unsaved work when appropriate.

## Staff-Level Router Guidance

```text
Local visual state       -> component state
Shareable filter state   -> URL search params
Resource identity        -> route params
Page data                -> loader/query layer
Mutation                 -> action/fetcher/query mutation
Auth/permissions         -> route/layout boundary + server enforcement
```

Do not use Redux merely to duplicate URL state.

---

# 9. Redux Mental Model

Redux is a predictable state container built around:

```text
UI
 -> dispatch(action)
 -> middleware
 -> reducer(previousState, action)
 -> next state
 -> subscribed UI updates
```

Core concepts:

- **Store** — holds application state.
- **Action** — describes an event.
- **Reducer** — pure state transition function.
- **Dispatch** — sends an action into the store.
- **Selector** — derives/reads state.
- **Middleware** — intercepts dispatch for async work, logging, analytics, etc.

Modern Redux applications should normally use **Redux Toolkit** rather than handwritten Redux boilerplate.

---

# 10. Redux Toolkit (RTK)

## `configureStore`

Creates the Redux store with good defaults.

```tsx
export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

## Typed Hooks

```tsx
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
```

## `createSlice`

Defines slice state, reducers, and generated action creators together.

```tsx
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type CounterState = { value: number };
const initialState: CounterState = { value: 0 };

const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment(state) {
      state.value += 1;
    },
    add(state, action: PayloadAction<number>) {
      state.value += action.payload;
    },
  },
});

export const { increment, add } = counterSlice.actions;
export default counterSlice.reducer;
```

RTK uses Immer, so reducer code may look mutative while producing immutable updates.

## `PayloadAction<T>`

Types the generated Redux action payload.

```tsx
setUser(state, action: PayloadAction<User | null>) {
  state.user = action.payload;
}
```

## `createAsyncThunk`

Standard async thunk lifecycle when RTK Query is not the better abstraction.

```tsx
export const fetchUser = createAsyncThunk('users/fetchUser', async (id: string, { signal, rejectWithValue }) => {
  try {
    return await api.getUser(id, { signal });
  } catch (error) {
    return rejectWithValue(normalizeError(error));
  }
});
```

Automatically emits `pending`, `fulfilled`, `rejected` actions.

## `extraReducers`

Handles actions not owned by the slice.

```tsx
extraReducers: (builder) => {
  builder
    .addCase(fetchUser.pending, (state) => {
      state.loading = true;
    })
    .addCase(fetchUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
    })
    .addCase(fetchUser.rejected, (state) => {
      state.loading = false;
    });
};
```

## `createSelector`

Memoized derived state.

```tsx
const selectUsers = (state: RootState) => state.users.items;

export const selectActiveUsers = createSelector([selectUsers], (users) => users.filter((user) => user.active));
```

Store minimal canonical state; derive what you can with selectors.

## `createEntityAdapter`

Normalizes collections and provides generated CRUD reducers/selectors.

```text
{ ids: ['u1'], entities: { u1: {...} } }
```

Useful for large relational collections and O(1) entity lookup.

## Listener Middleware

Useful for reactive workflows without bringing in Saga for simpler orchestration.

```tsx
listenerMiddleware.startListening({
  actionCreator: userLoggedIn,
  effect: async (action, api) => {
    await api.delay(100);
    api.dispatch(fetchPreferences(action.payload.id));
  },
});
```

## RTK Query

Purpose-built server-state/data-fetching layer.

```tsx
const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getUser: builder.query<User, string>({
      query: (id) => `/users/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'User', id }],
    }),
    updateUser: builder.mutation<User, User>({
      query: (user) => ({ url: `/users/${user.id}`, method: 'PUT', body: user }),
      invalidatesTags: (_r, _e, user) => [{ type: 'User', id: user.id }],
    }),
  }),
});
```

Use RTK Query for caching, deduplication, invalidation, polling, request lifecycle, and server-state ownership. Avoid manually copying query results into ordinary slices unless there is a real domain requirement.

---

# 11. Redux-Saga

Saga models complex async workflows as generator functions and declarative effects.

```tsx
import {
  actionChannel,
  all,
  call,
  cancel,
  cancelled,
  debounce,
  delay,
  fork,
  join,
  put,
  race,
  select,
  spawn,
  take,
  takeEvery,
  takeLatest,
  throttle,
} from 'redux-saga/effects';
```

## Core Effects

### `call`

Calls a function and waits for its result. Saga can control/test the operation declaratively.

```tsx
const user: User = yield call(api.getUser, userId);
```

Prefer `call(fn, ...)` over directly invoking Promise-returning functions inside saga logic.

### `put`

Dispatches a Redux action.

```tsx
yield put(userLoaded(user));
```

### `select`

Reads current Redux state.

```tsx
const token: string = yield select(selectAuthToken);
```

### `take`

Pauses until a matching action occurs.

```tsx
const action: PayloadAction<string> = yield take(userRequested.type);
```

### `takeEvery`

Starts a worker for every matching action. Concurrent workers are allowed.

```tsx
yield takeEvery(userRequested.type, fetchUserSaga);
```

### `takeLatest`

Starts the latest worker and cancels the previous still-running worker.

```tsx
yield takeLatest(searchChanged.type, searchSaga);
```

Great for search/request flows where stale work should not win.

### `debounce`

Waits for inactivity before running the worker.

```tsx
yield debounce(300, searchChanged.type, searchSaga);
```

### `throttle`

Limits execution frequency while events continue arriving.

```tsx
yield throttle(1000, scrollTracked.type, analyticsSaga);
```

### `delay`

Saga-aware sleep.

```tsx
yield delay(500);
```

### `fork`

Starts a non-blocking **attached** child task. Parent/child lifecycle and failures are linked.

```tsx
const task = yield fork(backgroundSync);
```

### `spawn`

Starts a detached task. Failure/cancellation does not propagate like an attached `fork` child.

```tsx
yield spawn(analyticsWatcher);
```

Use when the task must be isolated; do not use it merely because it sounds more asynchronous.

### `all`

Runs effects concurrently and waits for all.

```tsx
const [user, permissions] = yield all([call(api.getUser, id), call(api.getPermissions, id)]);
```

Also commonly starts root watchers:

```tsx
export function* rootSaga() {
  yield all([fork(watchUsers), fork(watchSearch)]);
}
```

### `race`

First completed effect wins; losers are cancelled.

```tsx
const { response, timeout } = yield race({
  response: call(api.getUser, id),
  timeout: delay(5000),
});
```

### `cancel`

Cancels a task.

```tsx
yield cancel(task);
```

### `cancelled`

Detects cancellation in `finally` cleanup.

```tsx
try {
  yield call(work);
} finally {
  if (yield cancelled()) yield call(cleanup);
}
```

### `join`

Waits for another task to finish.

### `actionChannel`

Buffers actions when the worker must process them sequentially/backpressure matters.

```tsx
const channel = yield actionChannel(uploadRequested.type);
while (true) {
  const action = yield take(channel);
  yield call(uploadOne, action.payload);
}
```

## Saga Worker + Watcher Pattern

```tsx
function* fetchUserWorker(action: PayloadAction<string>) {
  try {
    const user: User = yield call(api.getUser, action.payload);
    yield put(fetchUserSuccess(user));
  } catch (error) {
    yield put(fetchUserFailure(normalizeError(error)));
  }
}

function* watchFetchUser() {
  yield takeLatest(fetchUser.type, fetchUserWorker);
}
```

## Choosing Async Tools

```text
Simple request + cache/invalidation     -> RTK Query
Simple imperative async state           -> createAsyncThunk
React to Redux events / modest workflow -> listener middleware
Complex long-running orchestration      -> Saga
Cancellation/races/background workflows -> Saga
```

Do not introduce Saga merely to perform `GET -> success/failure` requests.

---

# 12. TypeScript — Staff-Level Mental Model

TypeScript is a **compile-time structural type system** layered over JavaScript. Most type information does not exist at runtime.

```text
TypeScript source
   -> type checking
   -> type erasure
   -> JavaScript
   -> runtime
```

This distinction explains many design decisions: types cannot validate untrusted API data at runtime; use runtime schemas/validation at trust boundaries.

---

# 13. `type` vs `interface`

## `interface`

Best suited to object contracts, public/library extension points, and declaration merging.

```ts
interface User {
  id: string;
  name: string;
}

interface Admin extends User {
  permissions: string[];
}
```

Interfaces can declaration-merge:

```ts
interface Window {
  analyticsId: string;
}
interface Window {
  featureFlags: string[];
}
```

## `type`

Can represent objects plus unions, intersections, primitives, tuples, mapped/conditional types.

```ts
type ID = string | number;
type Status = 'idle' | 'loading' | 'success' | 'error';
type Point = [number, number];
type Admin = User & { permissions: string[] };
```

## Rule of Thumb

```text
Object/public extensible contract -> interface
Union / tuple / mapped / conditional / composition -> type
Either works for plain objects -> team consistency matters more
```

Do not treat `interface` vs `type` as a performance decision; both disappear from normal emitted JS.

---

# 14. Extending and Composing Types

## Interface `extends`

```ts
interface Person {
  name: string;
}
interface Employee extends Person {
  employeeId: string;
}
```

## Type Intersection

```ts
type Person = { name: string };
type Employee = Person & { employeeId: string };
```

Be careful with incompatible intersections:

```ts
type A = { id: string };
type B = { id: number };
type C = A & B; // id becomes impossible: never
```

## Interface Extending a Type

An interface can extend an object type with statically known members.

```ts
type Identified = { id: string };
interface User extends Identified {
  name: string;
}
```

---

# 15. `enum` and Alternatives

## Numeric Enum

```ts
enum Direction {
  Up,
  Down,
}
```

## String Enum

```ts
enum Role {
  Admin = 'ADMIN',
  User = 'USER',
}
```

Unlike most TS types, normal enums produce runtime JavaScript.

## Often Prefer Literal Union

```ts
type Role = 'ADMIN' | 'USER';
```

Or runtime object + derived type:

```ts
const Role = {
  Admin: 'ADMIN',
  User: 'USER',
} as const;

type Role = (typeof Role)[keyof typeof Role];
```

This gives runtime values plus a precise union with straightforward JS semantics.

---

# 16. Type Erasure

```ts
interface User {
  name: string;
}
type ID = string;

const user: User = { name: 'Deval' };
```

Typical emitted JS conceptually becomes:

```js
const user = { name: 'Deval' };
```

Therefore this is impossible at runtime:

```ts
// if (value instanceof User) {} // interface does not exist at runtime
```

Use runtime constructs or validators:

```ts
class User {}
value instanceof User;

// or schema validation / type guard
function isUser(value: unknown): value is User {
  return typeof value === 'object' && value !== null && 'name' in value;
}
```

---

# 17. Utility Types

Given:

```ts
interface User {
  id: string;
  name: string;
  email: string;
  age?: number;
}
```

## `Pick<T, K>`

Keep selected keys.

```ts
type UserPreview = Pick<User, 'id' | 'name'>;
```

## `Omit<T, K>`

Remove selected keys.

```ts
type CreateUser = Omit<User, 'id'>;
```

## `Partial<T>`

Makes all properties optional.

```ts
type UserPatch = Partial<User>;
```

## `Required<T>`

Makes all properties required.

## `Readonly<T>`

Makes properties readonly at the type level.

## `Record<K, V>`

Map known key types to values.

```ts
type UsersById = Record<string, User>;
```

## `Exclude<T, U>`

Removes members of union `T` assignable to `U`.

```ts
type T = Exclude<'a' | 'b' | 'c', 'c'>; // 'a' | 'b'
```

## `Extract<T, U>`

Keeps overlapping union members.

## `NonNullable<T>`

Removes `null | undefined`.

```ts
type Name = NonNullable<string | null | undefined>; // string
```

## Function Utilities

```ts
type Args = Parameters<typeof fn>;
type Result = ReturnType<typeof fn>;
type AsyncResult = Awaited<ReturnType<typeof asyncFn>>;
```

---

# 18. `null` vs `undefined`

```text
undefined -> missing/not assigned/not provided
null      -> explicitly empty/no value
```

```ts
let selectedUser: User | null = null;
function find(id?: string) {}
```

With `strictNullChecks`, nullable values must be handled explicitly.

```ts
user?.name;
value ?? fallback;
```

Prefer a consistent domain convention instead of casually mixing both.

---

# 19. `any` vs `unknown` vs `never` vs `void`

## `any`

Disables meaningful type safety and propagates unsafety.

```ts
let value: any;
value.foo.bar(); // accepted
```

Use only at deliberate escape boundaries and contain it quickly.

## `unknown`

Safe top type. Anything may enter, but it must be narrowed before use.

```ts
function parse(value: unknown) {
  if (typeof value === 'string') return value.toUpperCase();
}
```

Prefer `unknown` for external/untrusted values and `catch`-like boundaries.

## `never`

Represents values that cannot exist / code paths that cannot complete normally.

```ts
function fail(message: string): never {
  throw new Error(message);
}
```

Excellent for exhaustive checks:

```ts
function assertNever(value: never): never {
  throw new Error(`Unexpected: ${value}`);
}
```

## `void`

Represents a function whose useful return value is intentionally ignored/absent.

```ts
function log(message: string): void {
  console.log(message);
}
```

---

# 20. Union, Intersection and Discriminated Union

## Union

```ts
type Result = Success | Failure;
```

Means **one of** the member types.

## Intersection

```ts
type Admin = User & Permissions;
```

Means requirements of **all** intersected types.

## Discriminated Union

```ts
type RequestState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: User[] }
  | { status: 'error'; error: Error };

function render(state: RequestState) {
  switch (state.status) {
    case 'success':
      return state.data;
    case 'error':
      return state.error.message;
    case 'idle':
    case 'loading':
      return null;
    default:
      return assertNever(state);
  }
}
```

Prefer this over impossible boolean combinations such as `isLoading + isError + hasData`.

---

# 21. Generics

```ts
function identity<T>(value: T): T {
  return value;
}
```

Constraints:

```ts
function getId<T extends { id: string }>(value: T) {
  return value.id;
}
```

Generics model relationships between types. Do not add a generic if no useful relationship is being preserved.

---

# 22. `keyof`, `typeof`, Indexed Access

```ts
const config = {
  theme: 'dark',
  retries: 3,
} as const;

type Config = typeof config;
type ConfigKey = keyof Config; // 'theme' | 'retries'
type Theme = Config['theme']; // 'dark'
```

`typeof` in a type position derives a type from a runtime value.

---

# 23. `as const` and `satisfies`

## `as const`

Narrows literals and makes object/array members readonly.

```ts
const routes = ['home', 'settings'] as const;
type Route = (typeof routes)[number];
```

## `satisfies`

Checks that a value conforms to a type while preserving its more precise inferred type.

```ts
const routes = {
  home: '/',
  users: '/users',
} satisfies Record<string, string>;
```

Often preferable to a broad type assertion.

---

# 24. Type Assertion vs Type Guard

## Assertion

```ts
const user = value as User;
```

This tells TypeScript to trust you. It performs **zero runtime validation**.

## Type Guard

```ts
function isUser(value: unknown): value is User {
  return typeof value === 'object' && value !== null && 'id' in value;
}
```

A guard proves/narrows a type through runtime logic.

Staff rule: validate at trust boundaries; assertions should not be used to silence genuine uncertainty.

---

# 25. Optional Properties and Optional Chaining

```ts
interface User {
  avatarUrl?: string;
}

user.avatarUrl?.toLowerCase();
const avatar = user.avatarUrl ?? defaultAvatar;
```

`||` and `??` differ:

```ts
0 || 10; // 10
0 ?? 10; // 0
```

Use `??` when only `null`/`undefined` mean missing.

---

# 26. Function Types / Overloads

```ts
type Handler = (event: MouseEvent) => void;
```

Overloads are useful when return type meaningfully depends on input shape:

```ts
function parse(value: string): string;
function parse(value: number): number;
function parse(value: string | number) {
  return value;
}
```

Prefer unions/generics when they express the relationship more simply.

---

# 27. Mapped and Conditional Types

## Mapped

```ts
type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};
```

## Conditional

```ts
type ApiResult<T> = T extends Error ? { ok: false; error: T } : { ok: true; data: T };
```

## `infer`

```ts
type PromiseValue<T> = T extends Promise<infer U> ? U : T;
```

These are powerful library/domain-model tools; avoid type-level cleverness that makes ordinary application code harder to understand.

---

# 28. React + TypeScript Patterns

## Props

```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}
```

## Children

```tsx
type Props = {
  children: React.ReactNode;
};
```

## Event

```tsx
const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  setValue(event.target.value);
};
```

## Ref

```tsx
const ref = useRef<HTMLInputElement>(null);
```

## Component Return Type

Usually let TypeScript infer it. Explicitly use `React.ReactNode`/`React.JSX.Element` only when the contract benefits from it.

## Avoid `React.FC` by Habit

It is valid, but plain function components usually give simpler explicit prop contracts.

```tsx
function Button({ children }: ButtonProps) {
  return <button>{children}</button>;
}
```

---

# 29. State Ownership Matrix

| State                                  | Best home                               |
| -------------------------------------- | --------------------------------------- |
| Input/modal/toggle                     | `useState`                              |
| Complex local workflow                 | `useReducer`                            |
| Scoped dependency/theme                | Context                                 |
| Shareable filters/page/sort            | URL                                     |
| Cached remote/server data              | RTK Query / query layer / router data   |
| Cross-feature client domain state      | Redux Toolkit                           |
| DOM node/timer/external mutable handle | `useRef`                                |
| Derived state                          | Calculate/select; don't store duplicate |

**Staff-level question:** not “Which state library do we use?” but “Who owns this state, what is its lifetime, who consumes it, and what is the source of truth?”

---

# 30. Async / Concurrency Pattern Selection

```text
User types search
  -> urgent: update input immediately
  -> debounce network request
  -> cancel/ignore stale request
  -> transition/defer expensive result rendering if necessary
```

Typical tools:

- `AbortController` — cancel browser requests.
- `takeLatest` — cancel stale saga workers.
- `debounce` — wait until events settle.
- `throttle` — cap continuous event frequency.
- `Promise.all` — independent work concurrently.
- Saga `all` — concurrent saga effects.
- Saga `race` — timeout/cancellation winner.
- `startTransition` — lower React render priority, **not network priority**.

---

# 31. Error Boundaries by Layer

```text
Application shell error boundary
  └─ Route error boundary
      └─ Feature boundary
          └─ Local async error UI
```

Separate:

- transport error (network failed),
- protocol error (4xx/5xx),
- validation/domain error,
- render/programming error,
- authorization error.

Do not funnel every failure into one generic “Something went wrong.”

---

# 32. Performance Decision Framework

Before optimizing:

```text
Measure
 -> identify bottleneck
 -> determine CPU/network/render/layout/memory cause
 -> choose targeted optimization
 -> measure again
```

Common tools/patterns:

- React Profiler.
- Browser Performance panel.
- Web Vitals.
- Route/component code splitting.
- Image/font/resource optimization.
- Virtualization for very large lists.
- Stable selectors and normalized data.
- Memoization only when profiling supports it.
- Avoid unnecessary effect-driven render chains.
- Move state closer to where it is consumed.
- Server cache/CDN when network latency dominates.

`memo`, `useMemo`, and `useCallback` cannot fix poor state ownership or an expensive architecture.

---

# 33. Common Interview / Code Review Traps

```text
❌ useEffect for derived state
❌ index as key for reorderable list
❌ useMemo/useCallback everywhere
❌ Context as a universal global store
❌ Redux for URL/server/local DOM state
❌ copying RTK Query data into slices without reason
❌ Saga for trivial request lifecycle
❌ `any` at API boundaries
❌ `as SomeType` instead of validation
❌ storing values that selectors can derive
❌ pathname.includes('/user') instead of route matching
❌ unstable provider object/function values causing broad renders
❌ treating startTransition as debounce
❌ treating TypeScript as runtime validation
❌ one global loading/error boolean for concurrent requests
```

---

# 34. Architecture Example

```text
Browser / URL
      ↓
React Router
  ├── params/search state
  ├── route loaders/actions
  └── route boundaries
      ↓
Feature UI
  ├── local state: useState/useReducer
  ├── scoped dependencies: Context
  ├── remote state: RTK Query
  └── global client domain state: Redux Toolkit
                  ↓
              Middleware
        ├── listener middleware
        ├── thunk
        └── Saga (complex workflows)
                  ↓
             API / WebSocket
```

Principle: **one authoritative owner per piece of state**. Synchronize boundaries deliberately instead of maintaining multiple competing copies.

---

# 35. Fast Selection Cheat Sheet

```text
Need component state?                       useState
Many related transitions?                   useReducer
Need DOM/mutable handle?                     useRef
Need external synchronization?              useEffect
Need pre-paint DOM measurement?              useLayoutEffect
Need SSR-safe accessible ID?                 useId
Need subtree dependency injection?           Context
Need external store subscription primitive?  useSyncExternalStore
Need expensive derived calculation cache?    useMemo
Need stable callback identity?                useCallback
Need non-urgent rendering?                    transition APIs
Need slow child to lag?                       useDeferredValue
Need async loading boundary?                  Suspense
Need render-failure isolation?                ErrorBoundary
Need code splitting?                         lazy
Need shareable navigation state?              React Router URL
Need cached API/server state?                 RTK Query/query layer
Need global client domain state?              Redux Toolkit
Need complex async orchestration?             Redux-Saga
Need safe unknown input?                      unknown + validation
Need impossible-state exhaustiveness?         never + discriminated union
Need subset of object fields?                 Pick
Need object minus fields?                     Omit
Need optional patch shape?                    Partial
Need runtime constant + type?                 as const + typeof
```

---

# 36. Staff-Level Design Questions

For any frontend primitive/library, be ready to answer:

1. **Ownership** — Who owns the state/data?
2. **Lifetime** — Component, route, session, application, server cache?
3. **Source of truth** — URL, server, store, DOM, component?
4. **Consistency** — How are stale/optimistic/concurrent updates reconciled?
5. **Failure** — What happens on partial failure, retry, cancellation, timeout?
6. **Performance** — What is actually expensive and how was it measured?
7. **SSR/hydration** — Does server output deterministically match the client?
8. **Accessibility** — Keyboard, focus, semantics, IDs, reduced motion?
9. **Observability** — Can we measure errors, latency and user impact?
10. **Testability** — Can business transitions be tested independently of UI?
11. **Maintainability** — Is the abstraction easier than the problem it replaces?
12. **Migration** — Can the system evolve incrementally without a rewrite?

A Staff engineer should explain not only **how an API works**, but **why it exists, when not to use it, its lifecycle/concurrency implications, and what architectural problem should own the responsibility instead**.

---

# 37. Recommended Learning Order

```text
JavaScript runtime + browser
  ↓
TypeScript type system
  ↓
React render/state/effect mental model
  ↓
React Router + URL state
  ↓
State ownership
  ↓
Redux Toolkit + RTK Query
  ↓
Async/concurrency patterns
  ↓
Redux-Saga where complexity justifies it
  ↓
SSR/hydration/Suspense
  ↓
Performance + observability
  ↓
Frontend system design / architecture trade-offs
```

---

## Final Principle

```text
Do not optimize for knowing the largest number of APIs.
Optimize for choosing the correct ownership boundary and the simplest primitive
that preserves correctness, performance, maintainability, and user experience.
```
