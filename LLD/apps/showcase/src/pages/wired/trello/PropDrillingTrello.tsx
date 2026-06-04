import React, { useState, useCallback } from "react";
import { Sparkles, Trash2, Plus, MoveLeft, MoveRight, Kanban } from "lucide-react";

// --- Types & Interfaces ---
export interface TrelloCardData {
  id: string;
  title: string;
  columnId: string;
}

export interface TrelloColumnData {
  id: string;
  title: string;
}

interface ColumnProps {
  column: TrelloColumnData;
  cards: TrelloCardData[];
  onAddCard: (colId: string, title: string) => void;
  onDeleteCard: (id: string) => void;
  onMoveCard: (id: string, dir: "left" | "right") => void;
  onDragStart: (e: React.DragEvent, cardId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetColId: string) => void;
}

interface CardProps {
  card: TrelloCardData;
  onDelete: (id: string) => void;
  onMove: (id: string, dir: "left" | "right") => void;
  onDragStart: (e: React.DragEvent, cardId: string) => void;
}

// --- Data Layer: Custom Hook ---
export function usePropDrillingTrelloLogic() {
  const [cards, setCards] = useState<TrelloCardData[]>([
    { id: "1", title: "Review system architecture design", columnId: "todo" },
    { id: "2", title: "Implement global theme system", columnId: "in-progress" },
    { id: "3", title: "Verify package build references", columnId: "done" },
  ]);

  const columns: TrelloColumnData[] = [
    { id: "todo", title: "To Do" },
    { id: "in-progress", title: "In Progress" },
    { id: "done", title: "Done" },
  ];

  const addCard = useCallback((colId: string, title: string) => {
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    const newCard: TrelloCardData = {
      id: Math.random().toString(36).substring(2, 9),
      title: cleanTitle,
      columnId: colId,
    };
    setCards((prev) => [...prev, newCard]);
  }, []);

  const deleteCard = useCallback((id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const moveCard = useCallback((id: string, dir: "left" | "right") => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        let nextColId = c.columnId;
        if (c.columnId === "todo" && dir === "right") nextColId = "in-progress";
        else if (c.columnId === "in-progress") {
          nextColId = dir === "left" ? "todo" : "done";
        } else if (c.columnId === "done" && dir === "left") nextColId = "in-progress";

        return { ...c, columnId: nextColId };
      })
    );
  }, []);

  const updateCardColumn = useCallback((cardId: string, targetColId: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, columnId: targetColId } : c))
    );
  }, []);

  // Native Drag and Drop events
  const handleDragStart = useCallback((e: React.DragEvent, cardId: string) => {
    e.dataTransfer.setData("text/plain", cardId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); // Required to allow dropping
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
    handleDrop,
  };
}

// --- UI Presentation Components ---

const TrelloCard: React.FC<CardProps> = ({ card, onDelete, onMove, onDragStart }) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, card.id)}
      className="trello-card"
    >
      <p className="trello-card-title">{card.title}</p>
      <div className="trello-card-actions">
        <div className="move-buttons">
          {card.columnId !== "todo" && (
            <button onClick={() => onMove(card.id, "left")} className="card-action-btn" title="Move Left">
              <MoveLeft size={14} />
            </button>
          )}
          {card.columnId !== "done" && (
            <button onClick={() => onMove(card.id, "right")} className="card-action-btn" title="Move Right">
              <MoveRight size={14} />
            </button>
          )}
        </div>
        <button onClick={() => onDelete(card.id)} className="card-delete-btn" title="Delete Card">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

const TrelloColumn: React.FC<ColumnProps> = ({
  column,
  cards,
  onAddCard,
  onDeleteCard,
  onMoveCard,
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  const [newTitle, setNewTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddCard(column.id, newTitle.trim());
    setNewTitle("");
    setIsAdding(false);
  };

  return (
    <div
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, column.id)}
      className="trello-column"
    >
      <div className="column-header">
        <h4 className="column-title">{column.title}</h4>
        <span className="column-count">{cards.length}</span>
      </div>

      <div className="trello-cards-list">
        {cards.map((card) => (
          <TrelloCard
            key={card.id}
            card={card}
            onDelete={onDeleteCard}
            onMove={onMoveCard}
            onDragStart={onDragStart}
          />
        ))}
      </div>

      {isAdding ? (
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
      ) : (
        <button onClick={() => setIsAdding(true)} className="btn btn-outline-dashed add-card-btn select-block">
          <Plus size={16} />
          <span>Add Card</span>
        </button>
      )}
    </div>
  );
};

export const PropDrillingTrello: React.FC = () => {
  const {
    columns,
    cards,
    addCard,
    deleteCard,
    moveCard,
    handleDragStart,
    handleDragOver,
    handleDrop,
  } = usePropDrillingTrelloLogic();

  return (
    <div className="page-container trello-page">
      <div className="todos-card-header">
        <div className="todos-header-title">
          <Kanban className="todos-title-icon" />
          <h3>Kanban Trello Board (Engine 1: Prop Drilling)</h3>
        </div>
      </div>

      <div className="welcome-banner">
        <p className="welcome-text">
          <Sparkles size={16} className="inline-icon" style={{ marginRight: "8px", verticalAlign: "middle" }} />
          This Board uses custom prop-drilled drop event streams to handle card category modifications.
        </p>
      </div>

      <div className="trello-board-layout">
        {columns.map((col) => (
          <TrelloColumn
            key={col.id}
            column={col}
            cards={cards.filter((c) => c.columnId === col.id)}
            onAddCard={addCard}
            onDeleteCard={deleteCard}
            onMoveCard={moveCard}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        ))}
      </div>
    </div>
  );
};
