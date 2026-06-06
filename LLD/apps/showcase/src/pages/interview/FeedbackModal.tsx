import React, { useState, useEffect, useRef } from "react";
import { translate } from "@statelab/theme";
import { MessageSquare, Star, X, CheckCircle, HelpCircle, Layers, Code} from "lucide-react";

export const FeedbackModal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"basic" | "mid" | "advance">("basic");

  // ==========================================
  // --- BASIC TAB (Simple Modal Overlay) -----
  // ==========================================
  const [basicOpen, setBasicOpen] = useState(false);

  // ==========================================
  // --- MID TAB (Interactive Star Form) ------
  // ==========================================
  const [midOpen, setMidOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comments, setComments] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const submitMidFeedback = () => {
    if (rating === 0) return;
    setIsSubmitted(true);
    setTimeout(() => {
      setMidOpen(false);
      setIsSubmitted(false);
      setRating(0);
      setComments("");
    }, 2000);
  };

  // ==========================================
  // --- ADVANCE TAB (Trap focus, portal, nested)
  // ==========================================
  const [firstModalOpen, setFirstModalOpen] = useState(false);
  const [secondModalOpen, setSecondModalOpen] = useState(false);

  const firstModalRef = useRef<HTMLDivElement>(null);
  const secondModalRef = useRef<HTMLDivElement>(null);

  // Focus trap hook for accessibility
  const handleFocusTrap = (e: KeyboardEvent, ref: React.RefObject<HTMLDivElement | null>) => {
    if (e.key !== "Tab" || !ref.current) return;

    // Find all focusable elements inside the modal
    const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusables = ref.current.querySelectorAll<HTMLElement>(focusableSelectors);
    
    if (focusables.length === 0) return;

    const firstEl = focusables[0];
    const lastEl = focusables[focusables.length - 1];

    if (e.shiftKey) {
      // Shift + Tab: if focus is on first element, wrap to last element
      if (document.activeElement === firstEl) {
        lastEl.focus();
        e.preventDefault();
      }
    } else {
      // Tab: if focus is on last element, wrap to first element
      if (document.activeElement === lastEl) {
        firstEl.focus();
        e.preventDefault();
      }
    }
  };

  // Add event listener for active modal focus traps & escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (secondModalOpen) {
        if (e.key === "Escape") setSecondModalOpen(false);
        handleFocusTrap(e, secondModalRef);
      } else if (firstModalOpen) {
        if (e.key === "Escape") setFirstModalOpen(false);
        handleFocusTrap(e, firstModalRef);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [firstModalOpen, secondModalOpen]);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="todos-card-header" style={{ marginBottom: "20px" }}>
        <div className="todos-header-title">
          <MessageSquare className="todos-title-icon" style={{ color: "var(--text-h)" }} />
          <h3>Interactive Feedback Modal</h3>
                    <a
            href={`https://github.com/kumaratul60/System-Design/blob/main/LLD/apps/showcase/src/pages/interview/FeedbackModal.tsx`}
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

      {/* Tabs Menu */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
        <button
          className={`btn ${activeTab === "basic" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("basic")}
        >
          Basic (Click Outside Close Overlay)
        </button>
        <button
          className={`btn ${activeTab === "mid" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => { setActiveTab("mid"); setRating(0); setComments(""); }}
        >
          Mid (Feedback Star Rating)
        </button>
        <button
          className={`btn ${activeTab === "advance" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("advance")}
        >
          Advance (Focus Traps & Nested Portals)
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1.3fr", gap: "24px", alignItems: "start" }}>
        {/* Left Side Controller */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* TAB 1: BASIC SIMULATOR */}
          {activeTab === "basic" && (
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "24px" }}>
              <h4>Click Outside Close Overlay</h4>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "16px" }}>
                Renders a modal overlay. Clicking on the dark backdrop boundary resets modal visible state.
              </p>

              <button className="btn btn-primary" onClick={() => setBasicOpen(true)}>Open Modal</button>

              {basicOpen && (
                /* Modal backdrop wrapper */
                <div
                  onClick={() => setBasicOpen(false)}
                  style={{
                    position: "fixed",
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.65)",
                    zIndex: 200,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"}}
                >
                  {/* Modal card */}
                  <div
                    onClick={(e) => e.stopPropagation()} // Stop propagation to prevent closing
                    style={{
                      background: "var(--card-bg)",
                      border: "1px solid var(--border)",
                      width: "400px",
                      padding: "24px",
                      borderRadius: "12px",
                      boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px"}}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h4 style={{ margin: 0 }}>Basic Dialog</h4>
                      <X size={18} onClick={() => setBasicOpen(false)} style={{ cursor: "pointer", color: "var(--text-muted)" }} />
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
                      This is a custom lightweight modal layout using basic React state variables and event propagation handlers.
                    </p>
                    <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "12px" }}>
                      <button className="btn btn-secondary" onClick={() => setBasicOpen(false)}>Close</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MID STAR RATING FORM */}
          {activeTab === "mid" && (
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "24px" }}>
              <h4>Interactive Feedback Score modal</h4>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "16px" }}>
                Enables users to input star scores and submit reviews directly inside the overlay card.
              </p>

              <button className="btn btn-primary" onClick={() => setMidOpen(true)}>Leave Feedback</button>

              {midOpen && (
                <div
                  style={{
                    position: "fixed",
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.65)",
                    zIndex: 200,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"}}
                >
                  <div
                    style={{
                      background: "var(--card-bg)",
                      border: "1px solid var(--border)",
                      width: "440px",
                      padding: "24px",
                      borderRadius: "12px",
                      boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px"}}
                  >
                    {isSubmitted ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "16px 0", textAlign: "center" }}>
                        <CheckCircle size={44} style={{ color: "var(--success)" }} />
                        <h4 style={{ margin: 0 }}>Thank You for Feedback!</h4>
                        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Your score details were recorded.</span>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <h4 style={{ margin: 0 }}>Review Our Laboratory</h4>
                          <X size={18} onClick={() => setMidOpen(false)} style={{ cursor: "pointer", color: "var(--text-muted)" }} />
                        </div>

                        {/* Stars */}
                        <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                          {[1, 2, 3, 4, 5].map((star) => {
                            const isFilled = hoverRating >= star || rating >= star;
                            return (
                              <Star
                                key={star}
                                size={32}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(star)}
                                style={{
                                  cursor: "pointer",
                                  fill: isFilled ? "#f59e0b" : "transparent",
                                  color: isFilled ? "#f59e0b" : "var(--border)",
                                  transition: "transform 0.15s ease"}}
                              />
                            );
                          })}
                        </div>

                        {/* Comments */}
                        <div>
                          <label style={{ fontSize: "0.75rem", display: "block", marginBottom: "4px" }}>Add review commentary:</label>
                          <textarea
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            className="select-input"
                            style={{ width: "100%", height: "80px", resize: "none", background: "var(--input-bg)" }}
                            placeholder="Tell us what you liked about LLD StateLab..."
                          />
                        </div>

                        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                          <button className="btn btn-secondary" onClick={() => setMidOpen(false)}>Cancel</button>
                          <button className="btn btn-primary" onClick={submitMidFeedback} disabled={rating === 0}>Submit Review</button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ADVANCE PORTAL AND FOCUS TRAP */}
          {activeTab === "advance" && (
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "24px" }}>
              <h4>Advance Accessibility Focus Trapping & Stacked Modals</h4>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "16px" }}>
                Enforces strict keyboard trapping loops. Pressing Tab inside active modal loops strictly through focusable fields. Clicking &quot;nested alert&quot; opens another stack modal.
              </p>

              <button className="btn btn-primary" onClick={() => setFirstModalOpen(true)}>Open Primary Modal</button>

              {/* Stacked Modals simulation */}
              {firstModalOpen && (
                <div
                  style={{
                    position: "fixed",
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.65)",
                    zIndex: 200,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"}}
                >
                  <div
                    ref={firstModalRef}
                    style={{
                      background: "var(--card-bg)",
                      border: "1px solid var(--border)",
                      width: "420px",
                      padding: "24px",
                      borderRadius: "12px",
                      boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "14px"}}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h4 style={{ margin: 0 }}>Primary stacked layer</h4>
                      <X size={18} onClick={() => setFirstModalOpen(false)} style={{ cursor: "pointer", color: "var(--text-muted)" }} />
                    </div>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      Focus trap is active here. Press <strong>Tab</strong> repeatedly to see the highlights wrap between input fields and buttons.
                    </span>

                    <input type="text" placeholder="Sample field 1..." className="select-input" style={{ background: "var(--input-bg)" }} />
                    <input type="text" placeholder="Sample field 2..." className="select-input" style={{ background: "var(--input-bg)" }} />

                    <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                      <button className="btn btn-secondary" onClick={() => setSecondModalOpen(true)}>Open Nested Alert</button>
                      <button className="btn btn-primary" onClick={() => setFirstModalOpen(false)}>Finish</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Second Modal (Nested Stack) */}
              {secondModalOpen && (
                <div
                  style={{
                    position: "fixed",
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.75)",
                    zIndex: 300, // higher z-index stack
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"}}
                >
                  <div
                    ref={secondModalRef}
                    style={{
                      background: "var(--card-bg)",
                      border: "2px solid red",
                      width: "360px",
                      padding: "20px",
                      borderRadius: "10px",
                      boxShadow: "0 25px 30px -5px rgba(0,0,0,0.4)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px"}}
                  >
                    <strong style={{ color: "red", fontSize: "1.1rem" }}>Critical confirmation</strong>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      Are you sure you want to trigger this action? The focus loop has shifted to this nested layer. Escape key will dismiss this card first.
                    </span>
                    <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" }}>
                      <button className="btn btn-secondary" onClick={() => setSecondModalOpen(false)}>Discard</button>
                      <button className="btn btn-primary" onClick={() => { setSecondModalOpen(false); setFirstModalOpen(false); }} style={{ background: "red", border: "none" }}>Confirm</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Info Details */}
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h4>Modal Accessibility Rules</h4>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}>
            <div>
              <strong style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-h)" }}><Layers size={14} /> Focus Trap Logic</strong>
              <span style={{ color: "var(--text-muted)", lineHeight: 1.4, display: "block", marginTop: "4px" }}>
                Without a focus trap, users using screen-readers or keyboard Tab navigators will tab *out* of the modal backdrop into the background document links, breaking UI hierarchy.
              </span>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "8px" }}>
              <strong style={{ display: "block", color: "var(--text-h)" }}>Trap querySelector:</strong>
              <code style={{ background: "var(--input-bg)", padding: "4px", borderRadius: "3px", display: "block", marginTop: "4px" }}>
                ref.current.querySelectorAll(&apos;button, [href], input, textarea&apos;)
              </code>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "8px" }}>
              <strong style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-h)" }}><HelpCircle size={14} /> Escape Dismissal</strong>
              <span style={{ color: "var(--text-muted)", lineHeight: 1.4, display: "block", marginTop: "4px" }}>
                Listening to keydowns globally catches the Escape key. Stacking modals requires popping the uppermost modal in the array first.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
