import { createMachine, assign } from "xstate";
import { useMachine } from "@xstate/react";
import type { AppState, Theme, Language, Todo } from "../types";
import { fetchDummyTodos } from "../api";
import {
  getInitialTheme,
  getInitialLanguage,
  getInitialUser,
  setStorageTheme,
  setStorageLanguage,
  setStorageUser
} from "../storageHelpers";

export const appMachine = createMachine({
  id: "app",
  initial: "idle",
  context: {
    theme: getInitialTheme(),
    language: getInitialLanguage(),
    user: getInitialUser(),
    todos: [] as Todo[],
    isLoadingTodos: false
  },
  states: {
    idle: {
      on: {
        SET_THEME: {
          actions: assign({
            theme: ({ event }) => (event as unknown as { theme: Theme }).theme
          })
        },
        SET_LANGUAGE: {
          actions: assign({
            language: ({ event }) => (event as unknown as { language: Language }).language
          })
        },
        LOGIN: {
          actions: assign({
            user: ({ event }) => {
              const e = event as unknown as { username: string; role: "USER" | "ADMIN" };
              return { username: e.username, role: e.role };
            }
          })
        },
        LOGOUT: {
          actions: assign({ user: null })
        },
        ADD_TODO: {
          actions: assign({
            todos: ({ context, event }) => [
              { id: Date.now(), title: (event as unknown as { title: string }).title, completed: false },
              ...context.todos
            ]
          })
        },
        TOGGLE_TODO: {
          actions: assign({
            todos: ({ context, event }) =>
              context.todos.map((t: Todo) =>
                t.id === (event as unknown as { id: number }).id ? { ...t, completed: !t.completed } : t
              )
          })
        },
        DELETE_TODO: {
          actions: assign({
            todos: ({ context, event }) =>
              context.todos.filter((t: Todo) => t.id !== (event as unknown as { id: number }).id)
          })
        },
        FETCH_START: {
          target: "fetching",
          actions: assign({ isLoadingTodos: true })
        }
      }
    },
    fetching: {
      on: {
        SET_THEME: {
          actions: assign({
            theme: ({ event }) => (event as unknown as { theme: Theme }).theme
          })
        },
        SET_LANGUAGE: {
          actions: assign({
            language: ({ event }) => (event as unknown as { language: Language }).language
          })
        },
        LOGIN: {
          actions: assign({
            user: ({ event }) => {
              const e = event as unknown as { username: string; role: "USER" | "ADMIN" };
              return { username: e.username, role: e.role };
            }
          })
        },
        LOGOUT: {
          actions: assign({ user: null })
        },
        FETCH_SUCCESS: {
          target: "idle",
          actions: assign({
            todos: ({ event }) => (event as unknown as { todos: Todo[] }).todos,
            isLoadingTodos: false
          })
        },
        FETCH_FAILURE: {
          target: "idle",
          actions: assign({ isLoadingTodos: false })
        }
      }
    }
  }
});

export const useXStateEngine = (): AppState => {
  const [state, send] = useMachine(appMachine);
  const context = state.context;

  const setTheme = (theme: Theme) => {
    send({ type: "SET_THEME", theme });
    setStorageTheme(theme);
  };
  const setLanguage = (language: Language) => {
    send({ type: "SET_LANGUAGE", language });
    setStorageLanguage(language);
  };
  const login = (username: string, role: "USER" | "ADMIN") => {
    send({ type: "LOGIN", username, role });
    setStorageUser({ username, role });
  };
  const logout = () => {
    send({ type: "LOGOUT" });
    setStorageUser(null);
  };
  const addTodo = (title: string) => send({ type: "ADD_TODO", title });
  const toggleTodo = (id: number) => send({ type: "TOGGLE_TODO", id });
  const deleteTodo = (id: number) => send({ type: "DELETE_TODO", id });

  const fetchTodos = async () => {
    send({ type: "FETCH_START" });
    try {
      const data = await fetchDummyTodos();
      send({ type: "FETCH_SUCCESS", todos: data });
    } catch {
      send({ type: "FETCH_FAILURE" });
    }
  };

  return {
    theme: context.theme,
    language: context.language,
    user: context.user,
    todos: context.todos,
    isLoadingTodos: context.isLoadingTodos,
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
