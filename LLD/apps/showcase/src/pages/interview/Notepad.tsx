import React, { useState, useEffect, useCallback } from "react";
import { translate } from "@statelab/theme";
import { FileText, Plus, Trash2, Search, Eye, Code, Tag, Save } from "lucide-react";

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  updatedAt: string;
}

// --- Custom Safe Markdown Parser (No libraries) ---
const renderSimpleMarkdown = (text: string): React.ReactNode[] => {
  const lines = text.split("\n");
  return lines.map((line, idx) => {
    // 1. Headings
    if (line.startsWith("### ")) {
      return <h5 key={idx} style={{ color: "var(--text-h)", marginTop: "12px", marginBottom: "6px" }}>{line.slice(4)}</h5>;
    }
    if (line.startsWith("## ")) {
      return <h4 key={idx} style={{ color: "var(--text-h)", marginTop: "16px", marginBottom: "8px" }}>{line.slice(3)}</h4>;
    }
    if (line.startsWith("# ")) {
      return <h3 key={idx} style={{ color: "var(--text-h)", marginTop: "20px", marginBottom: "10px" }}>{line.slice(2)}</h3>;
    }

    // 2. Unordered lists
    if (line.startsWith("- ") || line.startsWith("* ")) {
      return (
        <li key={idx} style={{ marginLeft: "18px", marginBottom: "4px", listStyleType: "disc" }}>
          {parseInlineFormatting(line.slice(2))}
        </li>
      );
    }

    // 3. Regular Paragraphs
    return (
      <p key={idx} style={{ margin: "0 0 10px 0", lineHeight: "1.6" }}>
        {parseInlineFormatting(line)}
      </p>
    );
  });
};

const parseInlineFormatting = (text: string): React.ReactNode[] => {
  // Support bold (**text**) and code (`code`)
  const parts: React.ReactNode[] = [];
  let currentText = text;

  // Simple token-based parser
  while (currentText.length > 0) {
    const boldIdx = currentText.indexOf("**");
    const codeIdx = currentText.indexOf("`");

    // No format tags left
    if (boldIdx === -1 && codeIdx === -1) {
      parts.push(<span key={parts.length}>{currentText}</span>);
      break;
    }

    // Bold tag is closer
    if (boldIdx !== -1 && (codeIdx === -1 || boldIdx < codeIdx)) {
      if (boldIdx > 0) {
        parts.push(<span key={parts.length}>{currentText.slice(0, boldIdx)}</span>);
      }
      const nextBoldIdx = currentText.indexOf("**", boldIdx + 2);
      if (nextBoldIdx !== -1) {
        parts.push(
          <strong key={parts.length} style={{ color: "var(--text-h)" }}>
            {currentText.slice(boldIdx + 2, nextBoldIdx)}
          </strong>
        );
        currentText = currentText.slice(nextBoldIdx + 2);
      } else {
        parts.push(<span key={parts.length}>**</span>);
        currentText = currentText.slice(boldIdx + 2);
      }
    }
    // Code tag is closer
    else {
      if (codeIdx > 0) {
        parts.push(<span key={parts.length}>{currentText.slice(0, codeIdx)}</span>);
      }
      const nextCodeIdx = currentText.indexOf("`", codeIdx + 1);
      if (nextCodeIdx !== -1) {
        parts.push(
          <code
            key={parts.length}
            style={{
              background: "var(--border)",
              padding: "2px 6px",
              borderRadius: "4px",
              fontSize: "0.85em",
              fontFamily: "var(--font-mono)"}}
          >
            {currentText.slice(codeIdx + 1, nextCodeIdx)}
          </code>
        );
        currentText = currentText.slice(nextCodeIdx + 1);
      } else {
        parts.push(<span key={parts.length}>`</span>);
        currentText = currentText.slice(codeIdx + 1);
      }
    }
  }

  return parts;
};

// --- Data Layer: Custom Hook ---
export function useNotepad() {
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem("lld_notepad_notes");
      if (saved) return JSON.parse(saved);
    } catch (err) {
      console.warn("Failed to load notes:", err);
    }
    return [
      {
        id: "1",
        title: "Welcome Note",
        content: "# Quick Notepad Guide\n\nCreate sticky notes and format them with simple Markdown tags:\n- Use `#` for headings\n- Use `**` for **bold text**\n- Use backticks for `code snippets`\n- Tag notes to organize them!",
        tags: ["guide", "markdown"],
        updatedAt: new Date().toLocaleString()},
    ];
  });

  const [activeNoteId, setActiveNoteId] = useState<string>("1");
  const [searchQuery, setSearchQuery] = useState("");

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0] || null;

  // Sync to Storage
  useEffect(() => {
    localStorage.setItem("lld_notepad_notes", JSON.stringify(notes));
  }, [notes]);

  const addNote = useCallback(() => {
    const newNote: Note = {
      id: Math.random().toString(36).substring(2, 9),
      title: "Untitled Note",
      content: "",
      tags: [],
      updatedAt: new Date().toLocaleString()};
    setNotes((prev) => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
  }, []);

  const updateActiveNote = useCallback(
    (updates: Partial<Omit<Note, "id" | "updatedAt">>) => {
      if (!activeNoteId) return;
      setNotes((prev) =>
        prev.map((n) =>
          n.id === activeNoteId
            ? { ...n, ...updates, updatedAt: new Date().toLocaleString() }
            : n
        )
      );
    },
    [activeNoteId]
  );

  const deleteNote = useCallback(
    (id: string) => {
      setNotes((prev) => {
        const next = prev.filter((n) => n.id !== id);
        // Reset active selection if current note deleted
        if (activeNoteId === id && next.length > 0) {
          setActiveNoteId(next[0].id);
        }
        return next;
      });
    },
    [activeNoteId]
  );

  const filteredNotes = notes.filter((note) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query) ||
      note.tags.some((t) => t.toLowerCase().includes(query))
    );
  });

  return {
    notes: filteredNotes,
    activeNote,
    activeNoteId,
    setActiveNoteId,
    searchQuery,
    setSearchQuery,
    addNote,
    updateActiveNote,
    deleteNote};
}

// --- UI Presentation Component ---
export const Notepad: React.FC = () => {
  const {
    notes,
    activeNote,
    activeNoteId,
    setActiveNoteId,
    searchQuery,
    setSearchQuery,
    addNote,
    updateActiveNote,
    deleteNote} = useNotepad();

  const [editMode, setEditMode] = useState<"edit" | "preview">("edit");
  const [tagInput, setTagInput] = useState("");

  // Sync tags input on active note change
  useEffect(() => {
    if (activeNote) {
      setTagInput(activeNote.tags.join(", "));
    } else {
      setTagInput("");
    }
  }, [activeNoteId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTagsChange = (val: string) => {
    setTagInput(val);
    const parsedTags = val
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    updateActiveNote({ tags: parsedTags });
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="todos-card-header">
        <div className="todos-header-title">
          <FileText className="todos-title-icon" style={{ color: "var(--text-h)" }} />
          <h3>Reactive Offline Notepad</h3>
                    <a
            href={`https://github.com/kumaratul60/System-Design/blob/main/LLD/apps/showcase/src/pages/interview/Notepad.tsx`}
            target="_blank"
            rel="noopener noreferrer"
            title={translate("viewSource")}
            className="challenge-code-link-header"
            style={{ marginLeft: "auto", color: "var(--text-muted)", display: "flex", alignItems: "center", transition: "color 0.2s" }}
          >
            <Code size={20} />
          </a>
        </div>
        <button onClick={addNote} className="btn btn-primary" style={{ display: "flex", gap: "6px" }}>
          <Plus size={16} /> New Note
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          gap: "24px",
          border: "1px solid var(--border)",
          borderRadius: "var(--border-radius)",
          background: "var(--card-bg)",
          overflow: "hidden",
          minHeight: "500px"}}
      >
        {/* Sidebar Notes Feed */}
        <div
          style={{
            borderRight: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            background: "var(--input-bg)"}}
        >
          {/* Search bar */}
          <div style={{ padding: "14px", borderBottom: "1px solid var(--border)", position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: "24px", top: "24px", color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search notes/tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-input"
              style={{ paddingLeft: "36px", width: "100%" }}
            />
          </div>

          {/* List */}
          <div style={{ overflowY: "auto", flexGrow: 1, maxHeight: "420px" }}>
            {notes.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                No notes found.
              </div>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => setActiveNoteId(note.id)}
                  style={{
                    padding: "14px 18px",
                    cursor: "pointer",
                    borderBottom: "1px solid var(--border)",
                    background: note.id === activeNoteId ? "var(--card-bg)" : "transparent",
                    transition: "background 0.2s",
                    position: "relative"}}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                    <strong
                      style={{
                        color: note.id === activeNoteId ? "var(--primary)" : "var(--text-h)",
                        fontSize: "0.95rem",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "180px"}}
                    >
                      {note.title.trim() || "Untitled Note"}
                    </strong>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(note.id);
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--text-muted)"}}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--danger)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                      title="Delete note"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {note.updatedAt}
                  </div>
                  {note.tags.length > 0 && (
                    <div style={{ display: "flex", gap: "4px", marginTop: "6px", flexWrap: "wrap" }}>
                      {note.tags.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          style={{
                            fontSize: "0.65rem",
                            background: "var(--border)",
                            color: "var(--text)",
                            padding: "1px 6px",
                            borderRadius: "4px"}}
                        >
                          {t}
                        </span>
                      ))}
                      {note.tags.length > 2 && <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>+{note.tags.length - 2}</span>}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Content Pane */}
        {activeNote ? (
          <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Toolbar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
              <input
                type="text"
                value={activeNote.title}
                onChange={(e) => updateActiveNote({ title: e.target.value })}
                placeholder="Note Title..."
                style={{
                  fontSize: "1.3rem",
                  fontWeight: "bold",
                  color: "var(--text-h)",
                  border: "none",
                  background: "transparent",
                  outline: "none",
                  flexGrow: 1}}
              />
              <div
                style={{
                  display: "flex",
                  background: "var(--input-bg)",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  padding: "2px"}}
              >
                <button
                  onClick={() => setEditMode("edit")}
                  style={{
                    border: "none",
                    background: editMode === "edit" ? "var(--card-bg)" : "transparent",
                    color: editMode === "edit" ? "var(--primary)" : "var(--text-muted)",
                    padding: "6px 12px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "0.85rem",
                    fontWeight: 600}}
                >
                  <Code size={14} /> Edit
                </button>
                <button
                  onClick={() => setEditMode("preview")}
                  style={{
                    border: "none",
                    background: editMode === "preview" ? "var(--card-bg)" : "transparent",
                    color: editMode === "preview" ? "var(--primary)" : "var(--text-muted)",
                    padding: "6px 12px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "0.85rem",
                    fontWeight: 600}}
                >
                  <Eye size={14} /> Preview
                </button>
              </div>
            </div>

            {/* Note Tags Input */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Tag size={16} style={{ color: "var(--text-muted)" }} />
              <input
                type="text"
                placeholder="Comma separated tags (e.g. ideas, work, code)"
                value={tagInput}
                onChange={(e) => handleTagsChange(e.target.value)}
                className="text-input"
                style={{ fontSize: "0.85rem", padding: "6px 12px", flexGrow: 1 }}
              />
            </div>

            {/* Main Area */}
            {editMode === "edit" ? (
              <textarea
                value={activeNote.content}
                onChange={(e) => updateActiveNote({ content: e.target.value })}
                placeholder="Start writing notes with markdown support (# Heading, **bold**, - list)..."
                style={{
                  flexGrow: 1,
                  minHeight: "260px",
                  background: "var(--input-bg)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--border-radius)",
                  padding: "16px",
                  fontSize: "0.95rem",
                  fontFamily: "inherit",
                  color: "var(--text)",
                  resize: "vertical",
                  outline: "none"}}
              />
            ) : (
              <div
                style={{
                  flexGrow: 1,
                  minHeight: "260px",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--border-radius)",
                  padding: "16px",
                  background: "var(--input-bg)",
                  overflowY: "auto"}}
              >
                {activeNote.content.trim() ? (
                  renderSimpleMarkdown(activeNote.content)
                ) : (
                  <span style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontStyle: "italic" }}>
                    Nothing to preview. Go to edit tab and write notes!
                  </span>
                )}
              </div>
            )}

            {/* Auto save message */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", color: "var(--text-muted)" }}>
              <span>Auto-saved to LocalStorage</span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Save size={12} /> Last saved: {activeNote.updatedAt}
              </span>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexGrow: 1, color: "var(--text-muted)" }}>
            <FileText size={48} style={{ strokeWidth: 1, marginBottom: "12px" }} />
            <p>Select a note from the list, or create a new one to begin editing!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notepad;
