import { useState } from "react";
import type { AppState, AppUser, Theme, Language, Todo } from "../types";
import { fetchDummyTodos } from "../api";

export const usePropDrillingState = (): AppState => {
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
      console.error("Prop Drilling Engine: Error fetching todos", error);
    } finally {
      setIsLoadingTodos(false);
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
