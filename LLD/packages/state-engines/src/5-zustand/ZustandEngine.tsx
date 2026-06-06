import { create } from "zustand";
import type { AppState, Theme } from "../types";
import { fetchDummyTodos } from "../api";
import {
  getInitialTheme,
  getInitialUser,
  setStorageTheme,
  setStorageUser
} from "../storageHelpers";

export const useZustandStore = create<AppState>((set) => ({
  theme: getInitialTheme(),
  user: getInitialUser(),
  todos: [],
  isLoadingTodos: false,

  setTheme: (theme: Theme) => {
    set({ theme });
    setStorageTheme(theme);
  },

  login: (username: string, role: "USER" | "ADMIN") => {
    const newUser = { username, role };
    set({ user: newUser });
    setStorageUser(newUser);
  },
  logout: () => {
    set({ user: null });
    setStorageUser(null);
  },

  addTodo: (title: string) =>
    set((state) => ({
      todos: [
        { id: Date.now(), title, completed: false },
        ...state.todos
      ]
    })),

  toggleTodo: (id: number) =>
    set((state) => ({
      todos: state.todos.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    })),

  deleteTodo: (id: number) =>
    set((state) => ({
      todos: state.todos.filter((t) => t.id !== id)
    })),

  fetchTodos: async () => {
    set({ isLoadingTodos: true });
    try {
      const data = await fetchDummyTodos();
      set({ todos: data });
    } catch (e) {
      console.error("Zustand Engine: Error fetching todos", e);
    } finally {
      set({ isLoadingTodos: false });
    }
  }
}));

export const useZustandEngine = (): AppState => {
  return useZustandStore();
};
