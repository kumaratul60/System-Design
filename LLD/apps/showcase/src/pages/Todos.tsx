import React from "react";
import { useEngine } from "@statelab/state-engines";
import { PropDrillingTodo } from "./wired/todos/PropDrillingTodo";
import { LocalStorageTodo } from "./wired/todos/LocalStorageTodo";
import { ContextTodo } from "./wired/todos/ContextTodo";
import { XStateTodo } from "./wired/todos/XStateTodo";
import { ZustandTodo } from "./wired/todos/ZustandTodo";
import { ReduxTodo } from "./wired/todos/ReduxTodo";

export const Todos: React.FC = () => {
  const { activeEngine } = useEngine();

  switch (activeEngine) {
    case "prop-drilling":
      return <PropDrillingTodo />;
    case "local-storage":
      return <LocalStorageTodo />;
    case "context":
      return <ContextTodo />;
    case "xstate":
      return <XStateTodo />;
    case "zustand":
      return <ZustandTodo />;
    case "redux":
      return <ReduxTodo />;
    default:
      return <PropDrillingTodo />;
  }
};
