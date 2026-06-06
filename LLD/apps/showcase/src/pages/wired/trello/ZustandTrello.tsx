import React, { useState, useCallback } from "react";
import { translate } from "@statelab/theme";
import { create } from "zustand";
import { Sparkles, Trash2, Plus, MoveLeft, MoveRight, Kanban, Code} from "lucide-react";
import type { TrelloCardData, TrelloColumnData } from "./PropDrillingTrello";

interface TrelloStoreState {
  cards: TrelloCardData[];
  columns: TrelloColumnData[];
  addCard: (colId: string, title: string) => void;
  deleteCard: (id: string) => void;
  moveCard: (id: string, dir: "left" | "right") => void;
  updateCardColumn: (cardId: string, targetColId: string) => void;
}

// --- Local Zustand Store ---
const useLocalTrelloStore = create<TrelloStoreState>((set) => ({
  cards: [
    { id: "1", title: "Review system architecture design", columnId: "todo" },
    { id: "2", title: "Implement global theme system", columnId: "in-progress" },
    { id: "3", title: "Verify package build references", columnId: "done" },
  ],
  columns: [
    { id: "todo", title: "To Do" },
    { id: "in-progress", title: "In Progress" },
    { id: "done", title: "Done" },
  ],
  addCard: (colId, title) => {
    const clean = title.trim();
    if (!clean) return;
    const newCard: TrelloCardData = {
      id: Math.random().toString(36).substring(2, 9),
      title: clean,
      columnId: colId};
    set((state) => ({ cards: [...state.cards, newCard] }));
  },
  deleteCard: (id) =>
    set((state) => ({ cards: state.cards.filter((c) => c.id !== id) })),
  moveCard: (id, dir) =>
    set((state) => ({
      cards: state.cards.map((c) => {
        if (c.id !== id) return c;
        let nextColId = c.columnId;
        if (c.columnId === "todo" && dir === "right") nextColId = "in-progress";
        else if (c.columnId === "in-progress") {
          nextColId = dir === "left" ? "todo" : "done";
        } else if (c.columnId === "done" && dir === "left") nextColId = "in-progress";

        return { ...c, columnId: nextColId };
      })})),
  updateCardColumn: (cardId, targetColId) =>
    set((state) => ({
      cards: state.cards.map((c) => (c.id === cardId ? { ...c, columnId: targetColId } : c))}))}));

// --- Data Layer: Custom Hook ---
export function useZustandTrelloLogic() {
  const cards = useLocalTrelloStore((state) => state.cards);
  const columns = useLocalTrelloStore((state) => state.columns);
  const addCard = useLocalTrelloStore((state) => state.addCard);
  const deleteCard = useLocalTrelloStore((state) => state.deleteCard);
  const moveCard = useLocalTrelloStore((state) => state.moveCard);
  const updateCardColumn = useLocalTrelloStore((state) => state.updateCardColumn);

  const handleDragStart = useCallback((e: React.DragEvent, cardId: string) => {
    e.dataTransfer.setData("text/plain", cardId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetColId: string) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData("text/plain");
    if (cardId) {
      updateCardColumn(cardId, targetColId);
    }
  }, [updateCardColumn]);

  return {
    columns,
    cards,
    addCard,
    deleteCard,
    moveCard,
    handleDragStart,
    handleDragOver,
    handleDrop};
}

// --- UI Presentation Component ---
export const ZustandTrello: React.FC = () => {
  const {
    columns,
    cards,
    addCard,
    deleteCard,
    moveCard,
    handleDragStart,
    handleDragOver,
    handleDrop} = useZustandTrelloLogic();

  return (
    <div className="page-container trello-page">
      <div className="todos-card-header">
        <div className="todos-header-title">
          <Kanban className="todos-title-icon" />
          <h3>Kanban Trello Board (Engine 5: Zustand Atomic Store)</h3>
                    <a
            href={`https://github.com/kumaratul60/System-Design/blob/main/LLD/apps/showcase/src/pages/wired/trello/ZustandTrello.tsx`}
            target="_blank"
            rel="noopener noreferrer"
            title={translate("viewSource")}
            className="challenge-code-link-header"
            style={{ marginLeft: "auto", color: "var(--text-muted)", display: "flex", alignItems: "center", transition: "color 0.2s" }}
          >
            <Code size={20} />
          </a>
        </div>
      </div>

      <div className="welcome-banner">
        <p className="welcome-text">
          <Sparkles size={16} className="inline-icon" style={{ marginRight: "8px", verticalAlign: "middle" }} />
          This board reads its cards and action listeners atomically via hook selector observers.
        </p>
      </div>

      <div className="trello-board-layout">
        {columns.map((col) => {
          const colCards = cards.filter((c) => c.columnId === col.id);
          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className="trello-column"
            >
              <div className="column-header">
                <h4 className="column-title">{col.title}</h4>
                <span className="column-count">{colCards.length}</span>
              </div>

              <div className="trello-cards-list">
                {colCards.map((card) => (
                  <div
                    key={card.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, card.id)}
                    className="trello-card"
                  >
                    <p className="trello-card-title">{card.title}</p>
                    <div className="trello-card-actions">
                      <div className="move-buttons">
                        {card.columnId !== "todo" && (
                          <button onClick={() => moveCard(card.id, "left")} className="card-action-btn" title="Move Left">
                            <MoveLeft size={14} />
                          </button>
                        )}
                        {card.columnId !== "done" && (
                          <button onClick={() => moveCard(card.id, "right")} className="card-action-btn" title="Move Right">
                            <MoveRight size={14} />
                          </button>
                        )}
                      </div>
                      <button onClick={() => deleteCard(card.id)} className="card-delete-btn" title="Delete Card">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <AddCardTrigger onAdd={(title) => addCard(col.id, title)} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AddCardTrigger: React.FC<{ onAdd: (title: string) => void }> = ({ onAdd }) => {
  const [newTitle, setNewTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAdd(newTitle.trim());
    setNewTitle("");
    setIsAdding(false);
  };

  if (isAdding) {
    return (
      <form onSubmit={handleAdd} className="add-card-form">
        <input
          type="text"
          placeholder="Enter card title..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="text-input trello-input"
          autoFocus
          required
        />
        <div className="form-actions">
          <button type="submit" className="btn btn-primary btn-sm">Add</button>
          <button type="button" onClick={() => setIsAdding(false)} className="btn btn-secondary btn-sm">Cancel</button>
        </div>
      </form>
    );
  }

  return (
    <button onClick={() => setIsAdding(true)} className="btn btn-outline-dashed add-card-btn select-block">
      <Plus size={16} />
      <span>Add Card</span>
    </button>
  );
};
