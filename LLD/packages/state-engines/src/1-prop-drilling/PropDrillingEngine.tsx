import { useState } from "react";
import type { AppState, AppUser, Theme, Todo } from "../types";
import { fetchDummyTodos } from "../api";
import {
  getInitialTheme,
  getInitialUser,
  setStorageTheme,
  setStorageUser
} from "../storageHelpers";

export const usePropDrillingState = (): AppState => {
  const [theme, setThemeState] = useState<Theme>(() => getInitialTheme());
  const [user, setUser] = useState<AppUser | null>(() => getInitialUser());
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoadingTodos, setIsLoadingTodos] = useState<boolean>(false);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    setStorageTheme(newTheme);
  };

  const login = (username: string, role: "USER" | "ADMIN") => {
    const newUser = { username, role };
    setUser(newUser);
    setStorageUser(newUser);
  };

  const logout = () => {
    setUser(null);
    setStorageUser(null);
  };

  const addTodo = (title: string) => {
    const newTodo: Todo = {
      id: Date.now(),
      title,
      completed: false
    };
    setTodos((prev) => [newTodo, ...prev]);
  };

  const toggleTodo = (id: number) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTodo = (id: number) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchTodos = async () => {
    setIsLoadingTodos(true);
    try {
      const data = await fetchDummyTodos();
      setTodos(data);
    } catch (error) {
      console.error("Prop Drilling Engine: Error fetching todos", error);
    } finally {
      setIsLoadingTodos(false);
    }
  };

  return {
    theme,
    user,
    todos,
    isLoadingTodos,
    setTheme,
    login,
    logout,
    addTodo,
    toggleTodo,
    deleteTodo,
    fetchTodos
  };
};
