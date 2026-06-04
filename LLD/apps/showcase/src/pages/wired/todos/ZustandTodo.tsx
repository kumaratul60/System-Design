import React, { useState, useEffect } from "react";
import { useZustandStore } from "@statelab/state-engines";
import { translate } from "@statelab/theme";
import { CheckCircle2, Circle, ClipboardList, Plus, RefreshCw, Trash2, Lock } from "lucide-react";

// --- Data Layer: Custom Hook ---
export function useZustandTodoLogic() {
  const [newTodoTitle, setNewTodoTitle] = useState("");

  // Select atomic fields from store to prevent unnecessary renders
  const todos = useZustandStore((state) => state.todos);
  const isLoadingTodos = useZustandStore((state) => state.isLoadingTodos);
  const user = useZustandStore((state) => state.user);
  const language = useZustandStore((state) => state.language);

  // Actions
  const addTodo = useZustandStore((state) => state.addTodo);
  const toggleTodo = useZustandStore((state) => state.toggleTodo);
  const deleteTodo = useZustandStore((state) => state.deleteTodo);
  const fetchTodos = useZustandStore((state) => state.fetchTodos);

  useEffect(() => {
    if (todos.length === 0) {
      fetchTodos();
    }
  }, [fetchTodos, todos.length]);

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;
    addTodo(newTodoTitle.trim());
    setNewTodoTitle("");
  };

  const welcomeMessage = user
    ? translate(language, "welcomeUser", {
        username: user.username,
        role: user.role === "ADMIN" ? translate(language, "roleAdmin") : translate(language, "roleUser"),
      })
    : "";

  return {
    todos,
    isLoadingTodos,
    language,
    user,
    newTodoTitle,
    setNewTodoTitle,
    handleAddTodo,
    welcomeMessage,
    toggleTodo,
    deleteTodo,
    fetchTodos,
  };
}

// --- UI Presentation Component ---
export const ZustandTodo: React.FC = () => {
  const {
    todos,
    isLoadingTodos,
    language,
    user,
    newTodoTitle,
    setNewTodoTitle,
    handleAddTodo,
    welcomeMessage,
    toggleTodo,
    deleteTodo,
    fetchTodos,
  } = useZustandTodoLogic();

  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="page-container todos-page">
      <div className="welcome-banner">
        <h2 className="welcome-text">{welcomeMessage}</h2>
      </div>

      <div className="todos-card-wrapper">
        <div className="todos-card-header">
          <div className="todos-header-title">
            <ClipboardList className="todos-title-icon" />
            <h3>Engine 5: Zustand Atomic Store</h3>
          </div>
          <button
            onClick={() => fetchTodos()}
            className="btn btn-secondary fetch-btn"
            disabled={isLoadingTodos}
            title={translate(language, "refreshApiData")}
          >
            <RefreshCw className={`fetch-icon ${isLoadingTodos ? "spinning" : ""}`} size={16} />
            <span className="btn-text">{translate(language, "refreshApiData")}</span>
          </button>
        </div>

        <form onSubmit={handleAddTodo} className="add-todo-form">
          <input
            type="text"
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
            placeholder={translate(language, "addTodoPlaceholder")}
            className="text-input todo-input"
            required
          />
          <button type="submit" className="btn btn-primary add-btn">
            <Plus size={18} />
            <span>{translate(language, "addButton")}</span>
          </button>
        </form>

        {isLoadingTodos ? (
          <div className="loading-state">
            <RefreshCw className="loading-spinner spinning" size={32} />
            <p>{translate(language, "loading")}</p>
          </div>
        ) : (
          <div className="todos-list-container">
            {todos.length === 0 ? (
              <div className="empty-state">
                <p>No tasks inside the active state engine registry. Create some above!</p>
              </div>
            ) : (
              <ul className="todos-list">
                {todos.map((todo) => (
                  <li key={todo.id} className={`todo-item ${todo.completed ? "completed" : ""}`}>
                    <button
                      onClick={() => toggleTodo(todo.id)}
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
                        onClick={() => deleteTodo(todo.id)}
                        className="todo-delete-btn"
                        title={translate(language, "deleteButton")}
                        aria-label="Delete task"
                      >
                        <Trash2 size={18} />
                      </button>
                    ) : (
                      <button
                        className="todo-delete-btn disabled"
                        disabled
                        title={translate(language, "deleteRestricted")}
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
