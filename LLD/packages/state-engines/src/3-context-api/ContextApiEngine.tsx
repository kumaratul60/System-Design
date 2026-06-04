import React, { createContext, useContext, useState } from "react";
import type { AppState, AppUser, Theme, Language, Todo } from "../types";
import { fetchDummyTodos } from "../api";

const AppStateContext = createContext<AppState | undefined>(undefined);

export const ContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>("light");
  const [language, setLanguage] = useState<Language>("en");
  const [user, setUser] = useState<AppUser | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoadingTodos, setIsLoadingTodos] = useState<boolean>(false);

  const login = (username: string, role: "USER" | "ADMIN") => {
    setUser({ username, role });
  };

  const logout = () => {
    setUser(null);
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
