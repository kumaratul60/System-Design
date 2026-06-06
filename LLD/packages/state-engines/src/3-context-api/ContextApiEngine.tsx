import React, { createContext, useContext, useState } from "react";
import type { AppState, AppUser, Theme, Todo } from "../types";
import { fetchDummyTodos } from "../api";
import {
  getInitialTheme,
  getInitialUser,
  setStorageTheme,
  setStorageUser
} from "../storageHelpers";

const AppStateContext = createContext<AppState | undefined>(undefined);

export const ContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
      console.error("Context API Engine: Error fetching todos", error);
    } finally {
      setIsLoadingTodos(false);
    }
  };

  const value: AppState = {
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

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useContextApiState = (): AppState => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useContextApiState must be used within a ContextProvider");
  }
  return context;
};
