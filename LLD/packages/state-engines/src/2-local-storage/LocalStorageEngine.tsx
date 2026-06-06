import { useState, useEffect } from "react";
import type { AppState, AppUser, Theme, Todo } from "../types";
import { fetchDummyTodos } from "../api";
import {
  getInitialTheme,
  getInitialUser
} from "../storageHelpers";

export const useLocalStorageState = (): AppState => {
  // Helper to load from localStorage
  const getStorageValue = <T,>(key: string, defaultValue: T): T => {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultValue;
      }
    }
    return defaultValue;
  };

  const [theme, setThemeState] = useState<Theme>(() => getInitialTheme());
  const [user, setUserState] = useState<AppUser | null>(() => getInitialUser());
  const [todos, setTodosState] = useState<Todo[]>(() => getStorageValue<Todo[]>("lld_todos", []));
  const [isLoadingTodos, setIsLoadingTodos] = useState<boolean>(false);

  // Sync helpers that write to localStorage and state
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("lld_theme", JSON.stringify(newTheme));
  };

  const login = (username: string, role: "USER" | "ADMIN") => {
    const newUser: AppUser = { username, role };
    setUserState(newUser);
    localStorage.setItem("lld_user", JSON.stringify(newUser));
  };

  const logout = () => {
    setUserState(null);
    localStorage.setItem("lld_user", "null");
  };

  const addTodo = (title: string) => {
    const newTodo: Todo = {
      id: Date.now(),
      title,
      completed: false
    };
    const updated = [newTodo, ...todos];
    setTodosState(updated);
    localStorage.setItem("lld_todos", JSON.stringify(updated));
  };

  const toggleTodo = (id: number) => {
    const updated = todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    setTodosState(updated);
    localStorage.setItem("lld_todos", JSON.stringify(updated));
  };

  const deleteTodo = (id: number) => {
    const updated = todos.filter((t) => t.id !== id);
    setTodosState(updated);
    localStorage.setItem("lld_todos", JSON.stringify(updated));
  };

  const fetchTodos = async () => {
    setIsLoadingTodos(true);
    try {
      const data = await fetchDummyTodos();
      setTodosState(data);
      localStorage.setItem("lld_todos", JSON.stringify(data));
    } catch (error) {
      console.error("LocalStorage Engine: Error fetching todos", error);
    } finally {
      setIsLoadingTodos(false);
    }
  };

  // Sync state across tabs/windows using storage events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "lld_theme" && e.newValue) {
        setThemeState(JSON.parse(e.newValue));
      } else if (e.key === "lld_user") {
        setUserState(e.newValue ? JSON.parse(e.newValue) : null);
      } else if (e.key === "lld_todos" && e.newValue) {
        setTodosState(JSON.parse(e.newValue));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

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
