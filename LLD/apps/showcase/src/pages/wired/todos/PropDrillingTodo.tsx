import React, { useState, useEffect } from "react";
import { usePropDrillingState } from "@statelab/state-engines";
import { translate } from "@statelab/theme";
import { CheckCircle2, Circle, ClipboardList, Plus, RefreshCw, Trash2, Lock, Code} from "lucide-react";
import type { Todo, AppUser } from "@statelab/state-engines";

// --- Types & Interfaces for Prop Drilling ---
interface TodoItemProps {
  todo: Todo;
  user: AppUser | null;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

interface TodoListProps {
  todos: Todo[];
  user: AppUser | null;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

interface TodoFormProps {
  onAdd: (title: string) => void;
}

// --- Data Layer: Custom Hook ---
export function usePropDrillingTodo() {
  const state = usePropDrillingState();
  const [newTodoTitle, setNewTodoTitle] = useState("");

  // Fetch initial todos if empty
  useEffect(() => {
    if (state.todos.length === 0) {
      state.fetchTodos();
    }
  }, [state]);

  const handleAddTodo = (title: string) => {
    state.addTodo(title);
  };

  const welcomeMessage = state.user
    ? translate("welcomeUser", {
        username: state.user.username,
        role: state.user.role === "ADMIN" ? translate("roleAdmin") : translate("roleUser")})
    : "";

  return {
    state,
    newTodoTitle,
    setNewTodoTitle,
    handleAddTodo,
    welcomeMessage};
}

// --- UI Presentation Components ---

// Leaf Node: TodoItem
const TodoItem: React.FC<TodoItemProps> = ({ todo, user, onToggle, onDelete }) => {
  const isAdmin = user?.role === "ADMIN";

  return (
    <li className={`todo-item ${todo.completed ? "completed" : ""}`}>
      <button
        onClick={() => onToggle(todo.id)}
        className="todo-toggle-btn"
        aria-label="Toggle task completion status"
      >
        {todo.completed ? (
          <CheckCircle2 className="todo-toggle-icon completed-icon" size={22} />
        ) : (
          <Circle className="todo-toggle-icon pending-icon" size={22} />
        )}
      </button>
      <span className="todo-title-text">{todo.title}</span>
      {isAdmin ? (
        <button
          onClick={() => onDelete(todo.id)}
          className="todo-delete-btn"
          title={translate("deleteButton")}
          aria-label="Delete task"
        >
          <Trash2 size={18} />
        </button>
      ) : (
        <button
          className="todo-delete-btn disabled"
          disabled
          title={translate("deleteRestricted")}
          aria-label="Delete task restricted"
        >
          <Lock size={16} />
        </button>
      )}
    </li>
  );
};

// Intermediate Component: TodoList
const TodoList: React.FC<TodoListProps> = ({ todos, user, onToggle, onDelete }) => {
  if (todos.length === 0) {
    return (
      <div className="empty-state">
        <p>No tasks inside the active state engine registry. Create some above!</p>
      </div>
    );
  }

  return (
    <ul className="todos-list">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          user={user}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
};

// Component: TodoForm
const TodoForm: React.FC<TodoFormProps> = ({ onAdd }) => {
  const [title, setTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title.trim());
    setTitle("");
  };

  return (
    <form onSubmit={handleSubmit} className="add-todo-form">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={translate("addTodoPlaceholder")}
        className="text-input todo-input"
        required
      />
      <button type="submit" className="btn btn-primary add-btn">
        <Plus size={18} />
        <span>{translate("addButton")}</span>
      </button>
    </form>
  );
};

// Main Feature Wrapper
export const PropDrillingTodo: React.FC = () => {
  const { state, handleAddTodo, welcomeMessage } = usePropDrillingTodo();

  return (
    <div className="page-container todos-page">
      <div className="welcome-banner">
        <h2 className="welcome-text">{welcomeMessage}</h2>
      </div>

      <div className="todos-card-wrapper">
        <div className="todos-card-header">
          <div className="todos-header-title">
          <ClipboardList className="todos-title-icon" />
            <h3>Engine 1: Prop Drilling</h3>
                    <a
            href={`https://github.com/kumaratul60/System-Design/blob/main/LLD/apps/showcase/src/pages/wired/todos/PropDrillingTodo.tsx`}
            target="_blank"
            rel="noopener noreferrer"
            title={translate("viewSource")}
            className="challenge-code-link-header"
            style={{ marginLeft: "auto", color: "var(--text-muted)", display: "flex", alignItems: "center", transition: "color 0.2s" }}
          >
            <Code size={20} />
          </a>
        </div>
          <button
            onClick={() => state.fetchTodos()}
            className="btn btn-secondary fetch-btn"
            disabled={state.isLoadingTodos}
            title={translate("refreshApiData")}
          >
            <RefreshCw className={`fetch-icon ${state.isLoadingTodos ? "spinning" : ""}`} size={16} />
            <span className="btn-text">{translate("refreshApiData")}</span>
          </button>
        </div>

        <TodoForm onAdd={handleAddTodo} />

        {state.isLoadingTodos ? (
          <div className="loading-state">
            <RefreshCw className="loading-spinner spinning" size={32} />
            <p>{translate("loading")}</p>
          </div>
        ) : (
          <div className="todos-list-container">
            <TodoList
              todos={state.todos}
              user={state.user}
              onToggle={state.toggleTodo}
              onDelete={state.deleteTodo}
            />
          </div>
        )}
      </div>
    </div>
  );
};
