import { configureStore, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import type { AppState, AppUser, Theme, Language, Todo } from "../types";
import { fetchDummyTodos } from "../api";
import {
  getInitialTheme,
  getInitialLanguage,
  getInitialUser,
  setStorageTheme,
  setStorageLanguage,
  setStorageUser
} from "../storageHelpers";

interface ReduxState {
  theme: Theme;
  language: Language;
  user: AppUser | null;
  todos: Todo[];
  isLoadingTodos: boolean;
}

const initialState: ReduxState = {
  theme: getInitialTheme(),
  language: getInitialLanguage(),
  user: getInitialUser(),
  todos: [],
  isLoadingTodos: false
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
    },
    setLanguage(state, action: PayloadAction<Language>) {
      state.language = action.payload;
    },
    login(state, action: PayloadAction<AppUser>) {
      state.user = action.payload;
    },
    logout(state) {
      state.user = null;
    },
    addTodo(state, action: PayloadAction<string>) {
      const newTodo: Todo = {
        id: Date.now(),
        title: action.payload,
        completed: false
      };
      state.todos = [newTodo, ...state.todos];
    },
    toggleTodo(state, action: PayloadAction<number>) {
      state.todos = state.todos.map((t) =>
        t.id === action.payload ? { ...t, completed: !t.completed } : t
      );
    },
    deleteTodo(state, action: PayloadAction<number>) {
      state.todos = state.todos.filter((t) => t.id !== action.payload);
    },
    fetchTodosStart(state) {
      state.isLoadingTodos = true;
    },
    fetchTodosSuccess(state, action: PayloadAction<Todo[]>) {
      state.todos = action.payload;
      state.isLoadingTodos = false;
    },
    fetchTodosFailure(state) {
      state.isLoadingTodos = false;
    }
  }
});

export const appActions = appSlice.actions;

export const reduxStore = configureStore({
  reducer: {
    app: appSlice.reducer
  }
});

export type RootState = ReturnType<typeof reduxStore.getState>;

export const useReduxEngine = (): AppState => {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.app.theme);
  const language = useSelector((state: RootState) => state.app.language);
  const user = useSelector((state: RootState) => state.app.user);
  const todos = useSelector((state: RootState) => state.app.todos);
  const isLoadingTodos = useSelector((state: RootState) => state.app.isLoadingTodos);

  const setTheme = (t: Theme) => {
    dispatch(appActions.setTheme(t));
    setStorageTheme(t);
  };
  const setLanguage = (l: Language) => {
    dispatch(appActions.setLanguage(l));
    setStorageLanguage(l);
  };
  const login = (username: string, role: "USER" | "ADMIN") => {
    const newUser = { username, role };
    dispatch(appActions.login(newUser));
    setStorageUser(newUser);
  };
  const logout = () => {
    dispatch(appActions.logout());
    setStorageUser(null);
  };
  const addTodo = (title: string) => dispatch(appActions.addTodo(title));
  const toggleTodo = (id: number) => dispatch(appActions.toggleTodo(id));
  const deleteTodo = (id: number) => dispatch(appActions.deleteTodo(id));

  const fetchTodos = async () => {
    dispatch(appActions.fetchTodosStart());
    try {
      const data = await fetchDummyTodos();
      dispatch(appActions.fetchTodosSuccess(data));
    } catch {
      dispatch(appActions.fetchTodosFailure());
    }
  };

  return {
    theme,
    language,
    user,
    todos,
    isLoadingTodos,
    setTheme,
    setLanguage,
    login,
    logout,
    addTodo,
    toggleTodo,
    deleteTodo,
    fetchTodos
  };
};
