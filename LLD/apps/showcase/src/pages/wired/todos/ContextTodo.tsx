import React, { useState, useEffect } from "react";
import { useContextApiState } from "@statelab/state-engines";
import { translate } from "@statelab/theme";
import { CheckCircle2, Circle, ClipboardList, Plus, RefreshCw, Trash2, Lock } from "lucide-react";

// --- Data Layer: Custom Hook ---
export function useContextTodoLogic() {
  const state = useContextApiState();
  const [newTodoTitle, setNewTodoTitle] = useState("");

  useEffect(() => {
    if (state.todos.length === 0) {
      state.fetchTodos();
    }
  }, [state]);

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;
    state.addTodo(newTodoTitle.trim());
    setNewTodoTitle("");
  };

  const welcomeMessage = state.user
    ? translate(state.language, "welcomeUser", {
        username: state.user.username,
        role: state.user.role === "ADMIN" ? translate(state.language, "roleAdmin") : translate(state.language, "roleUser"),
      })
    : "";

  return {
    state,
    newTodoTitle,
    setNewTodoTitle,
    handleAddTodo,
    welcomeMessage,
  };
}

// --- UI Presentation Component ---
export const ContextTodo: React.FC = () => {
  const { state, newTodoTitle, setNewTodoTitle, handleAddTodo, welcomeMessage } = useContextTodoLogic();
  const isAdmin = state.user?.role === "ADMIN";

  return (
    <div className="page-container todos-page">
      <div className="welcome-banner">
        <h2 className="welcome-text">{welcomeMessage}</h2>
      </div>

      <div className="todos-card-wrapper">
        <div className="todos-card-header">
          <div className="todos-header-title">
            <ClipboardList className="todos-title-icon" />
            <h3>Engine 3: Context API Bus</h3>
          </div>
          <button
            onClick={() => state.fetchTodos()}
            className="btn btn-secondary fetch-btn"
            disabled={state.isLoadingTodos}
            title={translate(state.language, "refreshApiData")}
          >
            <RefreshCw className={`fetch-icon ${state.isLoadingTodos ? "spinning" : ""}`} size={16} />
            <span className="btn-text">{translate(state.language, "refreshApiData")}</span>
          </button>
        </div>

        <form onSubmit={handleAddTodo} className="add-todo-form">
          <input
            type="text"
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
            placeholder={translate(state.language, "addTodoPlaceholder")}
            className="text-input todo-input"
            required
          />
          <button type="submit" className="btn btn-primary add-btn">
            <Plus size={18} />
            <span>{translate(state.language, "addButton")}</span>
          </button>
        </form>

        {state.isLoadingTodos ? (
          <div className="loading-state">
            <RefreshCw className="loading-spinner spinning" size={32} />
            <p>{translate(state.language, "loading")}</p>
          </div>
        ) : (
          <div className="todos-list-container">
            {state.todos.length === 0 ? (
              <div className="empty-state">
                <p>No tasks inside the active state engine registry. Create some above!</p>
              </div>
            ) : (
              <ul className="todos-list">
                {state.todos.map((todo) => (
                  <li key={todo.id} className={`todo-item ${todo.completed ? "completed" : ""}`}>
                    <button
                      onClick={() => state.toggleTodo(todo.id)}
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
                        onClick={() => state.deleteTodo(todo.id)}
                        className="todo-delete-btn"
                        title={translate(state.language, "deleteButton")}
                        aria-label="Delete task"
                      >
                        <Trash2 size={18} />
                      </button>
                    ) : (
                      <button
                        className="todo-delete-btn disabled"
                        disabled
                        title={translate(state.language, "deleteRestricted")}
                        aria-label="Delete task restricted"
                      >
                        <Lock size={16} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
