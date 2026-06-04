import React, { useState, useEffect, useCallback } from "react";
import { Sparkles, Trash2, Plus, MoveLeft, MoveRight, Kanban } from "lucide-react";
import type { TrelloCardData, TrelloColumnData } from "./PropDrillingTrello";

const DEFAULT_TRELLO_CARDS: TrelloCardData[] = [
  { id: "1", title: "Review system architecture design", columnId: "todo" },
  { id: "2", title: "Implement global theme system", columnId: "in-progress" },
  { id: "3", title: "Verify package build references", columnId: "done" },
];

// --- Data Layer: Custom Hook ---
export function useLocalStorageTrelloLogic() {
  const [cards, setCards] = useState<TrelloCardData[]>(() => {
    try {
      const saved = localStorage.getItem("lld_trello_cards");
      return saved ? JSON.parse(saved) : DEFAULT_TRELLO_CARDS;
    } catch {
      return DEFAULT_TRELLO_CARDS;
    }
  });

  const columns: TrelloColumnData[] = [
    { id: "todo", title: "To Do" },
    { id: "in-progress", title: "In Progress" },
    { id: "done", title: "Done" },
  ];

  // Save changes
  useEffect(() => {
    localStorage.setItem("lld_trello_cards", JSON.stringify(cards));
  }, [cards]);

  // Sync across tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "lld_trello_cards" && e.newValue) {
        try {
          setCards(JSON.parse(e.newValue));
        } catch (err) {
          console.warn("Failed to parse synced Trello cards:", err);
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const addCard = useCallback((colId: string, title: string) => {
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    const newCard: TrelloCardData = {
      id: Math.random().toString(36).substring(2, 9),
      title: cleanTitle,
      columnId: colId,
    };
    setCards((prev) => {
      const next = [...prev, newCard];
      localStorage.setItem("lld_trello_cards", JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteCard = useCallback((id: string) => {
    setCards((prev) => {
      const next = prev.filter((c) => c.id !== id);
      localStorage.setItem("lld_trello_cards", JSON.stringify(next));
      return next;
    });
  }, []);

  const moveCard = useCallback((id: string, dir: "left" | "right") => {
    setCards((prev) => {
      const next = prev.map((c) => {
        if (c.id !== id) return c;
        let nextColId = c.columnId;
        if (c.columnId === "todo" && dir === "right") nextColId = "in-progress";
        else if (c.columnId === "in-progress") {
          nextColId = dir === "left" ? "todo" : "done";
        } else if (c.columnId === "done" && dir === "left") nextColId = "in-progress";

        return { ...c, columnId: nextColId };
      });
      localStorage.setItem("lld_trello_cards", JSON.stringify(next));
      return next;
    });
  }, []);

  const updateCardColumn = useCallback((cardId: string, targetColId: string) => {
    setCards((prev) => {
      const next = prev.map((c) => (c.id === cardId ? { ...c, columnId: targetColId } : c));
      localStorage.setItem("lld_trello_cards", JSON.stringify(next));
      return next;
    });
  }, []);

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

  const resetBoard = useCallback(() => {
    localStorage.removeItem("lld_trello_cards");
    setCards(DEFAULT_TRELLO_CARDS);
  }, []);

  return {
    columns,
    cards,
    addCard,
    deleteCard,
    moveCard,
    handleDragStart,
    handleDragOver,
    handleDrop,
    resetBoard,
  };
}

// --- UI Presentation Component ---
export const LocalStorageTrello: React.FC = () => {
  const {
    columns,
    cards,
    addCard,
    deleteCard,
    moveCard,
    handleDragStart,
    handleDragOver,
    handleDrop,
    resetBoard,
  } = useLocalStorageTrelloLogic();

  return (
    <div className="page-container trello-page">
      <div className="todos-card-header">
        <div className="todos-header-title">
          <Kanban className="todos-title-icon" />
          <h3>Kanban Trello Board (Engine 2: LocalStorage Sync)</h3>
        </div>
        <button onClick={resetBoard} className="btn btn-secondary fetch-btn">
          <span>Reset Board</span>
        </button>
      </div>

      <div className="welcome-banner">
        <p className="welcome-text">
          <Sparkles size={16} className="inline-icon" style={{ marginRight: "8px", verticalAlign: "middle" }} />
          Open this board in multiple browser windows: cards will hop columns in perfect real-time sync.
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

// Sub-component helper
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
