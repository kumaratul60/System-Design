# State Management API Cheat Sheet

A comprehensive reference for Redux, Redux Toolkit (RTK), RTK Query, and Redux-Saga APIs and patterns.

---

## 1. Redux Mental Model

Redux is a predictable state container built around a unidirectional data flow:

```text
UI Trigger
  -> dispatch(action)
  -> middleware (interceptor)
  -> reducer(previousState, action)
  -> next state computed
  -> UI re-renders based on subscribed updates
```

### Core Definitions

- **Store**: The single source of truth containing application state.
- **Action**: A plain object describing _what_ happened (contains `type` and optional `payload`).
- **Reducer**: A pure function returning the next state based on the previous state and action.
- **Dispatch**: The function used to send actions to the store.
- **Selector**: A function to extract or compute derived values from the state.

---

## 2. Redux Toolkit (RTK)

Modern Redux applications should use Redux Toolkit (RTK) to eliminate boilerplate code.

### `configureStore`

Creates the store with middleware integration (Thunk, devtools, serializability checks).

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

Create customized, pre-typed versions of dispatch and selector hooks to ensure type safety.

```tsx
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
```

### `createSlice`

Combines reducer definitions, initial state, and action creators in one place. Uses Immer under the hood for immutable updates.

```tsx
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type CounterState = { value: number };
const initialState: CounterState = { value: 0 };

const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment(state) {
      state.value += 1; // Immer updates safely without mutation
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

Simplifies async request lifecycles. Automatically generates action creators for pending, fulfilled, and rejected statuses.

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

Responds to action types defined outside the slice (e.g. from async thunks or other slices).

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

Memoizes derived state queries to avoid unnecessary calculations and child renders.

```tsx
import { createSelector } from '@reduxjs/toolkit';

const selectUsers = (state: RootState) => state.users.items;

export const selectActiveUsers = createSelector([selectUsers], (users) => users.filter((user) => user.active));
```

### `createEntityAdapter`

Normalizes collection structures and provides pre-built CRUD reducers and selectors.

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
  },
});
```

### Listener Middleware

Lightweight, reactive callback controller. Ideal for handling state side-effects without bringing in complex setups like Redux-Saga.

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

## 3. Redux-Saga

Orchestrates complex, asynchronous side-effects using ES6 generator functions.

```tsx
import { call, put, takeLatest, delay, all, fork } from 'redux-saga/effects';
```

### Core Effects

- **`call(fn, ...args)`**: Non-blocking declaration to call a function. Allows easy testing.
  ```tsx
  const user = yield call(api.getUser, userId);
  ```
- **`put(action)`**: Saga's mechanism to dispatch a Redux action.
  ```tsx
  yield put(fetchUserSuccess(user));
  ```
- **`select(selector)`**: Reads data from the current Redux state store.
  ```tsx
  const token = yield select(selectAuthToken);
  ```
- **`take(actionPattern)`**: Pauses execution until a matching action type occurs.
  ```tsx
  const action = yield take('LOGOUT_REQUESTED');
  ```
- **`takeEvery(pattern, workerSaga)`**: Spawns a worker saga concurrently for every matching action.
- **`takeLatest(pattern, workerSaga)`**: Automatically cancels any running worker saga when a new matching action triggers. Ideal for search/fetch inputs.
  ```tsx
  yield takeLatest('SEARCH_REQUESTED', searchWorker);
  ```
- **`debounce(ms, pattern, workerSaga)`**: Debounces action handling by delaying worker execution until events settle.
  ```tsx
  yield debounce(300, 'INPUT_CHANGED', searchWorker);
  ```
- **`throttle(ms, pattern, workerSaga)`**: Throttles worker execution frequency.
- **`delay(ms)`**: Thread-safe delay timer.
- **`fork(fn, ...args)`**: Spawns an attached, non-blocking child task. Parent tasks wait for all forks.
- **`spawn(fn, ...args)`**: Spawns a detached background task. Failures do not propagate to the parent.
- **`all([...effects])`**: Runs effects concurrently. Waits for all to complete.
  ```tsx
  yield all([fork(watchUsers), fork(watchOrders)]);
  ```
- **`race({ first, second })`**: Triggers a race. The first effect to finish cancels the remaining ones.
  ```tsx
  const { response, timeout } = yield race({
    response: call(fetchData),
    timeout: delay(5000),
  });
  ```
- **`cancel(task)`**: Cancels a fork/spawn task.
- **`cancelled()`**: Detects cancellation during saga `finally` block cleanup.
- **`join(task)`**: Waits for a spawned task to finish.
- **`actionChannel(pattern)`**: Buffers incoming actions to process them sequentially.

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

## 4. Async Pattern Decision Helper

```text
Simple fetch + caching + caching rules     -> RTK Query
Simple async dispatch logic               -> createAsyncThunk
Simple reactivity / reactive side-effects -> Listener Middleware
Complex, long-running state orchestrations -> Redux-Saga
Advanced cancellations / timeouts / races -> Redux-Saga
```

**Avoid:** introducing Redux-Saga for simple `GET` requests that map directly to component rendering. Use RTK Query instead.
