import React, { useState, useRef, useEffect } from "react";
import { X, Check, AlertTriangle, Layers } from "lucide-react";

interface ChipItem {
  id: string;
  label: string;
  isValid: boolean;
}

export const ChipsInput: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"basic" | "mid" | "advance">("basic");

  // Chips List State
  const [chips, setChips] = useState<ChipItem[]>([
    { id: "chip1", label: "react", isValid: true },
    { id: "chip2", label: "typescript", isValid: true },
    { id: "chip3", label: "invalid-email", isValid: false },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [activeChipIndex, setActiveChipIndex] = useState<number | null>(null);

  // Validation Mode (Mid / Advance)
  const [validationType, setValidationType] = useState<"none" | "email" | "length">("none");

  // Input ref to control focus
  const inputRef = useRef<HTMLInputElement>(null);

  // Perform validation on typed tags
  const validateText = (text: string): boolean => {
    if (validationType === "email") {
      // standard email regex
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
    }
    if (validationType === "length") {
      // must be at least 4 characters
      return text.length >= 4;
    }
    return true;
  };

  // Add tag chip helper
  const addChip = (text: string) => {
    const trimmed = text.trim().replace(/,$/, ""); // Strip trailing comma
    if (!trimmed) return;

    // Check duplicate
    if (chips.some((c) => c.label.toLowerCase() === trimmed.toLowerCase())) {
      setInputValue("");
      return;
    }

    const newChip: ChipItem = {
      id: `chip_${Date.now()}`,
      label: trimmed,
      isValid: validateText(trimmed),
    };

    setChips((prev) => [...prev, newChip]);
    setInputValue("");
    setActiveChipIndex(null);
  };

  const removeChip = (id: string) => {
    setChips((prev) => prev.filter((c) => c.id !== id));
    setActiveChipIndex(null);
  };

  // Keyboard navigation on input box
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addChip(inputValue);
    }

    // Backspace handling for deleting preceding chip
    if (e.key === "Backspace" && inputValue === "") {
      if (activeChipIndex !== null) {
        // Delete highlighted chip
        removeChip(chips[activeChipIndex].id);
      } else if (chips.length > 0) {
        // Highlight last chip
        setActiveChipIndex(chips.length - 1);
      }
    }

    // Left/Right arrow keys navigation (Advance)
    if (activeTab === "advance" && inputValue === "") {
      if (e.key === "ArrowLeft") {
        if (activeChipIndex === null) {
          setActiveChipIndex(chips.length - 1);
        } else if (activeChipIndex > 0) {
          setActiveChipIndex(activeChipIndex - 1);
        }
      }
      if (e.key === "ArrowRight") {
        if (activeChipIndex !== null) {
          if (activeChipIndex < chips.length - 1) {
            setActiveChipIndex(activeChipIndex + 1);
          } else {
            setActiveChipIndex(null); // Return focus to input text
          }
        }
      }
    }
  };

  // Reset highlighted index on input typing
  useEffect(() => {
    if (inputValue !== "") {
      setActiveChipIndex(null);
    }
  }, [inputValue]);

  // Reset settings on tab changes
  useEffect(() => {
    setChips([
      { id: "chip1", label: "react", isValid: true },
      { id: "chip2", label: "typescript", isValid: true },
      { id: "chip3", label: "invalid-email", isValid: false },
    ]);
    setInputValue("");
    setActiveChipIndex(null);
    setValidationType(activeTab === "mid" ? "email" : "none");
  }, [activeTab]);

  // Collapsible overflow (Advance)
  const [isFocused, setIsFocused] = useState(false);
  const maxVisibleChips = 4;
  const showOverflowBadge = activeTab === "advance" && !isFocused && chips.length > maxVisibleChips;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="todos-card-header" style={{ marginBottom: "20px" }}>
        <div className="todos-header-title">
          <Layers className="todos-title-icon" style={{ color: "var(--text-h)" }} />
          <h3>Interactive Chips Input</h3>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
        <button
          className={`btn ${activeTab === "basic" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("basic")}
        >
          Basic (Enter/Comma Tags)
        </button>
        <button
          className={`btn ${activeTab === "mid" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("mid")}
        >
          Mid (Validation Rules & Icons)
        </button>
        <button
          className={`btn ${activeTab === "advance" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("advance")}
        >
          Advance (Arrow Key Nav & Overflow Collapse)
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1.3fr", gap: "24px", alignItems: "start" }}>
        {/* Left Side: Interactive Area */}
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "24px" }}>
          
          {/* Validation configs in Mid / Advance */}
          {activeTab !== "basic" && (
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "0.85rem", marginRight: "10px" }}>Select Validation Rule:</label>
              <select
                value={validationType}
                onChange={(e) => setValidationType(e.target.value as any)}
                className="select-input"
                style={{ background: "var(--input-bg)", padding: "4px 8px" }}
              >
                <option value="none">No Validation (Always Valid)</option>
                <option value="email">Email Syntax Pattern</option>
                <option value="length">Length constraint (min 4 chars)</option>
              </select>
            </div>
          )}

          {/* Chips Input box boundary wrapper */}
          <div
            onClick={() => inputRef.current?.focus()}
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              alignItems: "center",
              padding: "8px 12px",
              borderRadius: "8px",
              border: isFocused ? "2px solid var(--primary)" : "1px solid var(--border)",
              background: "var(--input-bg)",
              cursor: "text",
              minHeight: "44px",
            }}
          >
            {/* Visual render list */}
            {(showOverflowBadge ? chips.slice(0, maxVisibleChips) : chips).map((chip, idx) => {
              const isHighlighted = idx === activeChipIndex;
              const showIcons = activeTab !== "basic";

              return (
                <span
                  key={chip.id}
                  style={{
                    background: isHighlighted
                      ? "var(--primary)"
                      : !chip.isValid && showIcons
                      ? "rgba(239, 68, 68, 0.15)"
                      : "var(--card-bg)",
                    border: isHighlighted
                      ? "1px solid var(--primary)"
                      : !chip.isValid && showIcons
                      ? "1px solid red"
                      : "1px solid var(--border)",
                    color: isHighlighted
                      ? "var(--bg)"
                      : !chip.isValid && showIcons
                      ? "red"
                      : "var(--text-h)",
                    fontSize: "0.85rem",
                    padding: "4px 10px",
                    borderRadius: "16px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.15s ease",
                  }}
                >
                  {/* Status Indicator Icons */}
                  {showIcons && (
                    <>
                      {chip.isValid ? (
                        <Check size={12} style={{ color: isHighlighted ? "var(--bg)" : "var(--success)" }} />
                      ) : (
                        <AlertTriangle size={12} style={{ color: isHighlighted ? "var(--bg)" : "red" }} />
                      )}
                    </>
                  )}

                  <span>{chip.label}</span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeChip(chip.id);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: isHighlighted ? "var(--bg)" : "var(--text-muted)",
                      cursor: "pointer",
                      padding: 0,
                      display: "flex",
                    }}
                  >
                    <X size={12} />
                  </button>
                </span>
              );
            })}

            {/* Overflow badge representation */}
            {showOverflowBadge && (
              <span
                style={{
                  background: "var(--border)",
                  color: "var(--text-muted)",
                  fontSize: "0.75rem",
                  padding: "4px 8px",
                  borderRadius: "10px",
                  fontWeight: "bold",
                }}
              >
                +{chips.length - maxVisibleChips} more
              </span>
            )}

            {/* Actual Input field */}
            <input
              ref={inputRef}
              type="text"
              placeholder={chips.length === 0 ? "Type tag name..." : ""}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              style={{
                border: "none",
                background: "transparent",
                color: "var(--text-h)",
                outline: "none",
                fontSize: "0.9rem",
                flex: 1,
                minWidth: "120px",
              }}
            />
          </div>

          <div style={{ marginTop: "12px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
            {activeTab === "advance" ? (
              <span>Use <kbd style={{ background: "var(--border)", padding: "1px 4px", borderRadius: "3px" }}>←</kbd> and <kbd style={{ background: "var(--border)", padding: "1px 4px", borderRadius: "3px" }}>→</kbd> arrow keys to navigate and <kbd style={{ background: "var(--border)", padding: "1px 4px", borderRadius: "3px" }}>Backspace</kbd> to delete highlighted chips.</span>
            ) : (
              <span>Type tag name and press <kbd style={{ background: "var(--border)", padding: "1px 4px", borderRadius: "3px" }}>Enter</kbd> or <kbd style={{ background: "var(--border)", padding: "1px 4px", borderRadius: "3px" }}>,</kbd> comma.</span>
            )}
          </div>
        </div>

        {/* Right Side: Architecture guidelines */}
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h4>Chips Input Design Specs</h4>
          
          <div style={{ fontSize: "0.8rem", fontFamily: "var(--font-mono)", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <strong style={{ color: "var(--text-h)" }}>Event Interception</strong>
              <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>
                Typing comma is intercepted in <code>onKeyDown</code> via <code>e.preventDefault()</code> to parse the input segment into a tag object instead of typing raw characters.
              </p>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "8px" }}>
              <strong style={{ color: "var(--text-h)" }}><Layers size={14} style={{ display: "inline", marginRight: "4px" }} /> Collapsible Badge Overflow</strong>
              <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>
                In Advance mode, blur states slice the rendered chips list:
                <br />
                <code>chips.slice(0, maxVisibleChips)</code>,
                collapsing the remaining ones into a dismissible numerical counter. Focus restores all tags.
              </p>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "8px" }}>
              <strong style={{ color: "var(--text-h)" }}>Keyboard Traverse Index</strong>
              <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>
                ArrowLeft and ArrowRight shift the active highlighted index, redirecting Backspace key delete operations to targets before returning focus to the text cursor.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChipsInput;
