# State Management Architectural Framework & Master Cheat Sheet

A comprehensive, production-grade guide covering **State Taxonomy**, the **5-Question Interrogation Framework**, the **5 State Buckets**, **Server State vs. Client State**, and complete API references for **Redux Toolkit (RTK)**, **RTK Query**, and **Redux-Saga**.

---

## 1. The Core Philosophy: "State" is a Lazy Word

In modern frontend architecture, most bugs, performance bottlenecks, and accidental coupling come from treating all data as generic "State" and tossing it into a single global bucket.

```
                                 INTERROGATE YOUR STATE
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         ▼                                 ▼                                 ▼
   1. OWNERSHIP                      2. LIFETIME                       3. CARDINALITY
 Who is source of truth?          Does it die with a               Needed in 1 place or
(Client, Server, or URL?)       component, page, session?        many unrelated widgets?
         │                                 │                                 │
         └─────────────────────────────────┼─────────────────────────────────┘
                                           ▼
                                   4. PERSISTENCE
                            Must it survive refresh,
                             link share, navigation?
                                           ▼
                                   5. MUTABILITY
                            Does the user change it,
                              or does the world?
```

### The 5 Interrogation Questions

1. **Ownership**: Who is the authoritative source of truth? (Server database, browser URL, or local client memory?)
2. **Lifetime**: When does this data expire or get destroyed? (Component unmount, page route change, tab close, or user logout?)
3. **Cardinality**: How many components need this data? (Single component tree vs. 10 unrelated views across the app?)
4. **Persistence**: Does it need to survive a page refresh, browser back button, or link sharing via URL?
5. **Mutability**: Who mutates it? (User keystrokes/toggles vs. asynchronous external background updates?)

> **Core Rule:** Answer these five questions and the value **sorts itself into the correct bucket**.

---

### 💡 None of this Needed a Library

> **"Libraries change the ergonomics, never the categories."**

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ useState ➔ local   │   TanStack Query ➔ server   │   XState ➔ workflow          │
└──────────────────────────────────────────────────────────────────────────────────┘
```

The 5 state categories exist naturally in the browser runtime. Libraries simply provide ergonomic developer APIs around fundamental primitives:

- `useState` is an ergonomic wrapper over **JavaScript closures**.
- `TanStack Query` is an ergonomic wrapper over a **keyed in-memory async cache**.
- `React Router` is an ergonomic wrapper over **browser `URLSearchParams` and history API**.
- `Zustand / Redux` is an ergonomic wrapper over a **pub-sub event emitter**.
- `XState` is an ergonomic wrapper over a **mathematical finite state machine**.

**Architectural Law:** If you place Server State into a Global store, migrating from Redux to Zustand, Recoil, or Jotai will not fix your bugs. Libraries only improve syntax—they cannot fix a value living in the wrong category.

---

## 2. Five Buckets, Side by Side

> _"Same five lenses, whatever framework you land in."_

```
┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                FIVE BUCKETS, SIDE BY SIDE                                             │
├───────────────────┬─────────────────┬───────────────────┬───────────────────┬───────────────────┬─────────────────────┤
│ Dimension / Lens  │ Local           │ Server            │ URL               │ Global            │ Workflow            │
│                   │ (one widget)    │ (borrowed)        │ (shareable)       │ (app-wide)        │ (a process)         │
├───────────────────┼─────────────────┼───────────────────┼───────────────────┼───────────────────┼─────────────────────┤
│ OWNED BY          │ one component   │ the server        │ the address bar   │ the client app    │ the process         │
│ LIFETIME          │ the instance    │ until invalidated │ until URL changes │ the session       │ until it completes  │
│ SURVIVES REFRESH  │ no              │ refetched         │ natively          │ if persisted      │ if mirrored         │
│ BUILT WITH        │ closure         │ keyed cache       │ URLSearchParams   │ pub-sub store     │ state machine       │
│ TOOLING           │ useState/useRef │ TanStack / RTKQ   │ React/TanStackRouter│ Zustand / RTK   │ XState / useReducer │
└───────────────────┴─────────────────┴───────────────────┴───────────────────┴───────────────────┴─────────────────────┤
```

### Deep Dive: Five Buckets Breakdown

| Bucket          | Ownership & Source  | Lifetime & Survival                                                                | Underlying Primitive                                     | Anti-Pattern Trap                                                                  |
| :-------------- | :------------------ | :--------------------------------------------------------------------------------- | :------------------------------------------------------- | :--------------------------------------------------------------------------------- |
| **1. Local**    | **One component**   | Bound to the component instance; does **not** survive refresh                      | JavaScript closure (`useState`, `useReducer`, `useRef`)  | Putting `isDropdownOpen`, `modalOpen`, or input drafts into Redux/Zustand.         |
| **2. Server**   | **The server** (DB) | Lives until invalidated; **refetched** on refresh                                  | Keyed async cache (`TanStack Query`, `RTK Query`, `SWR`) | Manually fetching inside `useEffect` and dumping raw JSON into a global store.     |
| **3. URL**      | **The address bar** | Lives until URL changes; survives refresh **natively**                             | Browser URL & `URLSearchParams`                          | Storing active filters, search queries, pagination, or tab IDs in component state. |
| **4. Global**   | **The client app**  | Lives for the active session; survives refresh **if persisted** (storage)          | In-memory pub-sub store (`Zustand`, `Redux Toolkit`)     | Hoisting local state "just in case" (creating hidden producer/consumer coupling).  |
| **5. Workflow** | **The process**     | Lives until process completes; survives refresh **if mirrored** to backend/storage | Finite state machine (`XState`, compound reducers)       | Managing multi-step checkout/KYC flows with boolean flags (`isStep1 && isStep2`).  |

---

## 3. Anti-Pattern: Promoting Local State "Just in Case"

```
                         THE ACCIDENTAL COUPLING TRAP
                                ┌──────────────┐
                                │ isModalOpen  │
                                └──────┬───────┘
                                       ▼
                       ┌───────────────────────────────┐
                       │         GLOBAL STORE          │
                       └───────┬───────────────┬───────┘
                               │               │
                     (hidden dependency)   (hidden dependency)
                               │               │
                               ▼               ▼
                        [ Component A ] [ Component B ]

"Every consumer of a store is a hidden dependency of every producer."
Accidental coupling is the biggest maintenance cost in frontend codebases.
```

### Golden Principles of State Locality

- **Keep state as local as it can possibly be.**
- Do **not** hoist state to a global store because a component _might_ need it in the future.
- **Promote only when a second, genuinely unrelated consumer appears** and prop drilling through layout shells becomes unwieldy.

---

## 4. Server State: You Don't Own It, You're Borrowing a Copy

Server data (user profile, product list, shopping cart) is **not your state** — it is a cached local representation of the database state. It can be changed by another user, a background job, or a webhook at any second.

```
       Server                     Fetch                    Your App
┌──────────────────┐  ──────────────────────────►  ┌───────────────────────┐
│ Source of Truth  │                               │  Cached Copy (STALE!) │
└──────────────────┘  ◄──────────────────────────  └───────────────────────┘
                                Mutate
```

### What a Proper Server-State Layer Owes You

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 01. Caching          Don't refetch what is still fresh (staleTime configuration)│
│ 02. Deduplication    3 components mount simultaneously -> exactly 1 HTTP request│
│ 03. Invalidation     After mutation -> automatically mark affected tags stale   │
│ 04. Refetching       Background stale-while-revalidate on window focus / network│
│ 05. Race Safety      Older network responses must never overwrite newer requests│
│ 06. Status as State  Modelled discriminated union: { status, isFetching, error }│
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. The 5-Step Elimination Ladder: Run Every New Value Through This Order

Never ask _"Should this go into Redux/Global store?"_ first. Global state is the **final fallback (Step 5)** after everything else is eliminated.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                             RUN EVERY NEW VALUE THROUGH THIS ORDER                               │
├────┬────────────────────────────────────────────────────────┬───────────┬────────────────────────┤
│ #  │ Interrogation Filter                                   │ Target    │ Recommended Tooling    │
├────┼────────────────────────────────────────────────────────┼───────────┼────────────────────────┤
│ 1  │ Does the server own it?                                │ ➔ Server  │ TanStack Query / RTKQ  │
│ 2  │ Should it survive a refresh or be shareable via link?  │ ➔ URL     │ URL Search/Path Params │
│ 3  │ Does exactly one widget care, and die with it?         │ ➔ Local   │ useState / useReducer  │
│ 4  │ Is it the state of a process, with legal finite steps? │ ➔ Workflow│ XState / useReducer    │
│ 5  │ Still left over, client-owned, and needed widely?      │ ➔ Global  │ Zustand / RTK Store    │
└────┴────────────────────────────────────────────────────────┴───────────┴────────────────────────┘
```

### Architectural Elimination Flowchart

```mermaid
flowchart TD
    Start([New Value / State Need]) --> Step1{1. Does the server own it?<br/>(Fetched from API/DB?)}

    Step1 -- "Yes (Borrowed)" --> Bucket1[1. Server State Bucket]
    Bucket1 --> Tool1["Tool: TanStack Query / RTK Query / SWR
(Auto-cache, dedupe, invalidate, refetch)"]

    Step1 -- "No" --> Step2{2. Should it survive refresh<br/>or be shareable via URL link?}

    Step2 -- "Yes (Shareable)" --> Bucket2[2. URL State Bucket]
    Bucket2 --> Tool2["Tool: useSearchParams / Route Params
(Filters, pagination, active tab, sort)"]

    Step2 -- "No" --> Step3{3. Does exactly one widget care<br/>and does it die with it?}

    Step3 -- "Yes (Isolated UI)" --> Bucket3[3. Local State Bucket]
    Bucket3 --> Tool3["Tool: useState / useReducer / useRef
(Dropdowns, tooltips, form drafts, modals)"]

    Step3 -- "No" --> Step4{4. Is it the state of a process<br/>with legal, finite steps?}

    Step4 -- "Yes (State Machine)" --> Bucket4[4. Workflow State Bucket]
    Bucket4 --> Tool4["Tool: XState / Compound useReducer
(Checkout funnels, KYC verification, wizards)"]

    Step4 -- "No" --> Step5{5. Still left over, client-owned,<br/>and needed across unrelated views?}

    Step5 -- "Yes (True Global)" --> Bucket5[5. Global State Bucket]
    Bucket5 --> Tool5["Tool: Zustand / Redux Toolkit
(Theme, Auth session, Audio player, Toasts)"]

    style Start fill:#f1f5f9,stroke:#64748b,stroke-width:2px
    style Bucket1 fill:#dbeafe,stroke:#2563eb,stroke-width:2px,color:#1e3a8a
    style Bucket2 fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#14532d
    style Bucket3 fill:#f3f4f6,stroke:#374151,stroke-width:2px,color:#111827
    style Bucket4 fill:#ffedd5,stroke:#ea580c,stroke-width:2px,color:#7c2d12
    style Bucket5 fill:#fce7f3,stroke:#db2777,stroke-width:2px,color:#831843
```

---

## 6. Redux Mental Model & Core Definitions

Redux is a predictable state container built around a strict unidirectional data flow:

```text
UI Trigger
  -> dispatch(action)
  -> middleware (interceptor)
  -> reducer(previousState, action)
  -> next state computed
  -> UI re-renders based on subscribed updates
```

### Core Definitions

- **Store**: The single source of truth containing application state tree.
- **Action**: A plain JavaScript object describing _what_ happened (contains a required `type` property and an optional `payload`).
- **Reducer**: A pure function `(state, action) => newState` that calculates the next state without mutating previous state.
- **Dispatch**: The execution function used to send actions into the Redux store pipeline.
- **Selector**: A query function used to extract or compute derived slices of data from the store state.

---

## 7. Redux Toolkit (RTK) Complete Reference

Modern Redux applications should use Redux Toolkit (RTK) to eliminate boilerplate code.

### `configureStore`

Creates the store with automated middleware integration (Thunk, Redux DevTools, and runtime immutability/serializability checks).

```tsx
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import usersReducer from './usersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Typed Hooks

Create customized, pre-typed versions of dispatch and selector hooks to ensure type safety across components.

```tsx
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
```

### `createSlice`

Combines reducer definitions, initial state, and action creators in one place. Uses **Immer** internally so you can write mutable-style code safely.

```tsx
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type CounterState = { value: number };
const initialState: CounterState = { value: 0 };

const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment(state) {
      state.value += 1; // Immer updates safely without mutating original object
    },
    add(state, action: PayloadAction<number>) {
      state.value += action.payload;
    },
  },
});

export const { increment, add } = counterSlice.actions;
export default counterSlice.reducer;
```

### `createAsyncThunk`

Simplifies async request lifecycles. Automatically generates action creators and types for `pending`, `fulfilled`, and `rejected` statuses.

```tsx
import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchUser = createAsyncThunk('users/fetchUser', async (id: string, { signal, rejectWithValue }) => {
  try {
    return await api.getUser(id, { signal });
  } catch (error) {
    return rejectWithValue(normalizeError(error));
  }
});
```

### `extraReducers`

Responds to action types defined outside the slice (e.g. from async thunks or other slices) using the type-safe builder callback.

```tsx
const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});
```

### `createSelector`

Memoizes derived state queries to avoid unnecessary recalculations and child re-renders.

```tsx
import { createSelector } from '@reduxjs/toolkit';

const selectUsers = (state: RootState) => state.users.items;
const selectFilter = (state: RootState) => state.users.filter;

export const selectActiveUsers = createSelector([selectUsers, selectFilter], (users, filter) =>
  users.filter((user) => user.active && user.role === filter),
);
```

### `createEntityAdapter`

Normalizes collection structures into `{ ids: [], entities: {} }` format and provides pre-built CRUD reducers and selectors.

```tsx
import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';

interface User {
  id: string;
  name: string;
}

const usersAdapter = createEntityAdapter<User>();

const usersSlice = createSlice({
  name: 'users',
  initialState: usersAdapter.getInitialState(),
  reducers: {
    userAdded: usersAdapter.addOne,
    userUpdated: usersAdapter.updateOne,
    userRemoved: usersAdapter.removeOne,
  },
});

export const { selectAll: selectAllUsers, selectById: selectUserById } = usersAdapter.getSelectors(
  (state: RootState) => state.users,
);
```

### Listener Middleware

Lightweight, reactive callback controller. Ideal for handling state side-effects and cross-slice synchronizations without bringing in complex setups like Redux-Saga.

```tsx
import { createListenerMiddleware } from '@reduxjs/toolkit';

export const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  actionCreator: userLoggedIn,
  effect: async (action, api) => {
    await api.delay(100);
    api.dispatch(fetchPreferences(action.payload.id));
  },
});
```

### RTK Query

Purpose-built network-state management layer that handles caching, deduping, cache invalidation, and request status tracking automatically.

```tsx
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getUser: builder.query<User, string>({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),
    updateUser: builder.mutation<User, User>({
      query: (user) => ({
        url: `/users/${user.id}`,
        method: 'PUT',
        body: user,
      }),
      invalidatesTags: (result, error, user) => [{ type: 'User', id: user.id }],
    }),
  }),
});

export const { useGetUserQuery, useUpdateUserMutation } = apiSlice;
```

---

## 8. Redux-Saga (Complex Async Orchestration)

Orchestrates complex, asynchronous side-effects using ES6 generator functions.

```tsx
import {
  call,
  put,
  takeLatest,
  delay,
  all,
  fork,
  select,
  take,
  race,
  cancel,
  cancelled,
  spawn,
  debounce,
  throttle,
  actionChannel,
} from 'redux-saga/effects';
```

### Core Effects Reference

- **`call(fn, ...args)`**: Non-blocking effect description to call a function or promise. Enables declarative unit testing.
  ```tsx
  const user = yield call(api.getUser, userId);
  ```
- **`put(action)`**: Saga's mechanism to dispatch a Redux action to the store.
  ```tsx
  yield put(fetchUserSuccess(user));
  ```
- **`select(selector)`**: Reads data synchronously from the current Redux state store.
  ```tsx
  const token = yield select(selectAuthToken);
  ```
- **`take(actionPattern)`**: Pauses saga execution until a matching action type is dispatched.
  ```tsx
  const action = yield take('LOGOUT_REQUESTED');
  ```
- **`takeEvery(pattern, workerSaga)`**: Spawns a worker saga concurrently for every matching action without cancellation.
- **`takeLatest(pattern, workerSaga)`**: Automatically cancels any currently running worker saga when a new matching action triggers. Ideal for search / autocomplete queries.
  ```tsx
  yield takeLatest('SEARCH_REQUESTED', searchWorker);
  ```
- **`debounce(ms, pattern, workerSaga)`**: Debounces action handling by delaying worker execution until events settle for `ms`.
  ```tsx
  yield debounce(300, 'INPUT_CHANGED', searchWorker);
  ```
- **`throttle(ms, pattern, workerSaga)`**: Throttles worker execution frequency.
- **`delay(ms)`**: Non-blocking timer delay.
- **`fork(fn, ...args)`**: Spawns an attached, non-blocking child task. Parent sagas wait for all attached forks to finish.
- **`spawn(fn, ...args)`**: Spawns a detached background task. Failures inside a spawned task do not propagate up to cancel the parent.
- **`all([...effects])`**: Runs multiple effects concurrently. Waits for all to complete.
  ```tsx
  yield all([fork(watchUsers), fork(watchOrders)]);
  ```
- **`race({ first, second })`**: Triggers a race between effects. The first effect to resolve wins and automatically cancels the losing ones.
  ```tsx
  const { response, timeout } = yield race({
    response: call(fetchData),
    timeout: delay(5000),
  });
  ```
- **`cancel(task)`**: Cancels a running fork or spawn task.
- **`cancelled()`**: Returns `true` inside a `finally` block if the saga was cancelled.
- **`join(task)`**: Waits for a previously spawned background task to complete.
- **`actionChannel(pattern)`**: Buffers incoming actions to process them sequentially one by one.

### Worker & Watcher Pattern

```tsx
function* fetchUserWorker(action: PayloadAction<string>) {
  try {
    const user = yield call(api.getUser, action.payload);
    yield put(fetchUserSuccess(user));
  } catch (error) {
    yield put(fetchUserFailure(normalizeError(error)));
  }
}

function* watchFetchUser() {
  yield takeLatest('FETCH_USER_REQUESTED', fetchUserWorker);
}
```

---

## 9. Async Pattern Decision Helper

```text
Simple fetch + caching + automatic invalidation -> RTK Query / TanStack Query
Simple async dispatch logic                    -> createAsyncThunk
Simple reactivity / reactive side-effects      -> Listener Middleware
Complex, long-running state orchestrations     -> Redux-Saga
Advanced cancellations / timeouts / races      -> Redux-Saga
```

> **Avoid:** introducing Redux-Saga for simple `GET` requests that map directly to component rendering. Use RTK Query or TanStack Query instead.

---

## 10. State Tooling Comparison Matrix

| Technology                     | Best Suited For                                                       | Avoid When                                                                  | Key Strength                                                      |
| :----------------------------- | :-------------------------------------------------------------------- | :-------------------------------------------------------------------------- | :---------------------------------------------------------------- |
| **`useState` / `useReducer`**  | Local widget state, form inputs, simple toggles                       | Multiple unrelated distant components need access                           | Zero bundle overhead, native React primitive                      |
| **URL SearchParams**           | Filters, pagination, active tab, sorting                              | Private tokens, sensitive data, high-frequency continuous mutations (60fps) | 100% shareable, survives refresh, built-in browser history        |
| **TanStack Query / RTK Query** | All API / Server data fetching & mutations                            | Pure client-only UI flags (e.g. sidebar toggle)                             | Automatic caching, deduping, background refetch, zero boilerplate |
| **Zustand**                    | Lightweight global client state (Audio player, canvas tools)          | Pure server data caching (use Query instead)                                | Minimal boilerplate, hook-based, outside-React access             |
| **Redux Toolkit**              | Large enterprise apps with complex client rules, devtools time-travel | Small/Medium apps with mostly CRUD API data                                 | Strict unidirectional architecture, powerful middleware ecosystem |
| **XState**                     | Complex multi-step finite workflows (Checkout, Auth onboarding)       | Simple independent boolean flags                                            | Formal mathematical model, eliminates impossible UI states        |
