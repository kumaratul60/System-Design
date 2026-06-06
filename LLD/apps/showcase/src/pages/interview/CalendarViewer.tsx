import React, { useState, useMemo } from "react";
import { translate } from "@statelab/theme";
import { Calendar, ChevronLeft, ChevronRight, Plus, AlertCircle, Layers, Code} from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  dateStr: string; // YYYY-MM-DD
  startHour: number; // 24h format
  duration: number; // in hours
}

export const CalendarViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"basic" | "mid" | "advance">("basic");

  // Date management
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 6)); // Default June 6, 2026

  const handlePrevMonth = () => {
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Helper to compile days in grid
  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // day of week of 1st
    const totalDays = new Date(year, month + 1, 0).getDate(); // days in month

    const days = [];

    // Empty spaces for padding
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }

    // Days in current month
    for (let d = 1; d <= totalDays; d++) {
      days.push(new Date(year, month, d));
    }

    return days;
  }, [currentDate]);

  // ==========================================
  // --- BASIC TAB (Simple Month Grid) --------
  // ==========================================
  const formatDayString = (d: Date | null) => {
    if (!d) return "";
    return d.getDate();
  };

  const isToday = (d: Date | null) => {
    if (!d) return false;
    const today = new Date(2026, 5, 6); // simulated today
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  };

  // ==========================================
  // --- MID TAB (Selected Day & Event Form) --
  // ==========================================
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date(2026, 5, 6));
  const [events, setEvents] = useState<CalendarEvent[]>([
    { id: "e1", title: "LLD Class design review", dateStr: "2026-06-06", startHour: 10, duration: 2 },
    { id: "e2", title: "System Design session", dateStr: "2026-06-06", startHour: 14, duration: 1 },
  ]);

  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventHour, setNewEventHour] = useState(9);
  const [newEventDuration, setNewEventDuration] = useState(1);
  const [showFormModal, setShowFormModal] = useState(false);

  const getEventsForDate = (date: Date | null) => {
    if (!date) return [];
    const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
    return events.filter((e) => e.dateStr === dateStr);
  };

  const addCalendarEvent = () => {
    if (!selectedDate || !newEventTitle.trim()) return;
    const dateStr = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, "0")}-${selectedDate.getDate().toString().padStart(2, "0")}`;
    
    const newEvent: CalendarEvent = {
      id: Math.random().toString(36).substring(2, 9),
      title: newEventTitle,
      dateStr,
      startHour: newEventHour,
      duration: newEventDuration};

    setEvents((prev) => [...prev, newEvent]);
    setNewEventTitle("");
    setShowFormModal(false);
  };

  // ==========================================
  // --- ADVANCE TAB (Overlap Checker) --------
  // ==========================================
  // Checks if events on the selected date collide in timing hour bounds
  const getCollisions = (dateEvents: CalendarEvent[]) => {
    const collisions: string[] = [];
    
    for (let i = 0; i < dateEvents.length; i++) {
      for (let j = i + 1; j < dateEvents.length; j++) {
        const e1 = dateEvents[i];
        const e2 = dateEvents[j];

        const start1 = e1.startHour;
        const end1 = e1.startHour + e1.duration;
        const start2 = e2.startHour;
        const end2 = e2.startHour + e2.duration;

        // Overlap condition: start of one is before end of another and vice versa
        if (start1 < end2 && start2 < end1) {
          collisions.push(`"${e1.title}" overlaps with "${e2.title}"`);
        }
      }
    }
    return collisions;
  };

  const activeDateEvents = getEventsForDate(selectedDate);
  const activeCollisions = getCollisions(activeDateEvents);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="todos-card-header" style={{ marginBottom: "20px" }}>
        <div className="todos-header-title">
          <Calendar className="todos-title-icon" style={{ color: "var(--text-h)" }} />
          <h3>Interactive Calendar Viewer</h3>
                    <a
            href={`https://github.com/kumaratul60/System-Design/blob/main/LLD/apps/showcase/src/pages/interview/CalendarViewer.tsx`}
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
          Basic (Month Grid View)
        </button>
        <button
          className={`btn ${activeTab === "mid" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("mid")}
        >
          Mid (Day events scheduler)
        </button>
        <button
          className={`btn ${activeTab === "advance" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("advance")}
        >
          Advance (Schedule Collision Auditor)
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1.3fr", gap: "24px", alignItems: "start" }}>
        {/* Left Side: Calendar Grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px" }}>
            
            {/* Calendar Controls */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <strong style={{ color: "var(--text-h)", fontSize: "1.1rem" }}>
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </strong>
              <div style={{ display: "flex", gap: "4px" }}>
                <button className="btn btn-secondary" onClick={handlePrevMonth} style={{ padding: "4px 8px" }}><ChevronLeft size={16} /></button>
                <button className="btn btn-secondary" onClick={handleNextMonth} style={{ padding: "4px 8px" }}><ChevronRight size={16} /></button>
              </div>
            </div>

            {/* Days Header */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center", fontWeight: "bold", fontSize: "0.75rem", marginBottom: "8px", color: "var(--text-muted)" }}>
              <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
            </div>

            {/* Calendar grid wrapper */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "6px" }}>
              {daysInMonth.map((day, idx) => {
                const isDayToday = isToday(day);
                const isDaySelected = selectedDate && day && selectedDate.getDate() === day.getDate() && selectedDate.getMonth() === day.getMonth();
                const dayEvents = getEventsForDate(day);

                return (
                  <div
                    key={idx}
                    onClick={() => day && setSelectedDate(day)}
                    style={{
                      height: "60px",
                      borderRadius: "6px",
                      background: !day ? "transparent" : isDaySelected ? "rgba(59, 130, 246, 0.15)" : "var(--input-bg)",
                      border: isDayToday ? "2px solid var(--primary)" : isDaySelected ? "1px solid var(--primary)" : "1px solid var(--border)",
                      padding: "4px",
                      cursor: day ? "pointer" : "default",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      transition: "all 0.15s ease"}}
                  >
                    {day ? (
                      <>
                        <span style={{ fontSize: "0.85rem", fontWeight: isDayToday || isDaySelected ? "bold" : "normal", color: isDayToday ? "var(--primary)" : "var(--text-h)" }}>
                          {formatDayString(day)}
                        </span>
                        {dayEvents.length > 0 && (
                          <div style={{ fontSize: "0.62rem", background: "var(--primary)", color: "var(--bg)", padding: "1px 4px", borderRadius: "3px", textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {dayEvents.length} Event{dayEvents.length > 1 ? "s" : ""}
                          </div>
                        )}
                      </>
                    ) : null}
                  </div>
                );
              })}
            </div>

          </div>

        </div>

        {/* Right Info Board / Scheduler details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {selectedDate && (
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h4 style={{ margin: 0 }}>Events on {selectedDate.toLocaleDateString()}</h4>
                {(activeTab === "mid" || activeTab === "advance") && (
                  <button className="btn btn-primary" onClick={() => setShowFormModal(true)} style={{ padding: "4px 8px", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Plus size={12} /> Add Event
                  </button>
                )}
              </div>

              {/* Event lists */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                {activeDateEvents.length === 0 ? (
                  <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>No schedule items mapped for today.</span>
                ) : (
                  activeDateEvents.map((e) => (
                    <div key={e.id} style={{ padding: "8px 12px", background: "var(--input-bg)", borderRadius: "6px", borderLeft: "4px solid var(--primary)", fontSize: "0.8rem" }}>
                      <strong style={{ display: "block", color: "var(--text-h)" }}>{e.title}</strong>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>
                        Time: {e.startHour}:00 ({e.duration} hours)
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Collision alert inside Advance Tab */}
              {activeTab === "advance" && activeCollisions.length > 0 && (
                <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid red", padding: "10px", borderRadius: "6px", display: "flex", flexDirection: "column", gap: "6px", color: "red", fontSize: "0.75rem" }}>
                  <strong style={{ display: "flex", alignItems: "center", gap: "4px" }}><AlertCircle size={12} /> Collision Warning:</strong>
                  {activeCollisions.map((collision, i) => (
                    <div key={i}>• {collision}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Add Event simulated Modal dialog */}
          {showFormModal && (
            <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", width: "350px", padding: "20px", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <h4 style={{ margin: 0 }}>Add Calendar Event</h4>
                <div>
                  <label style={{ fontSize: "0.75rem", display: "block", marginBottom: "4px" }}>Event Title:</label>
                  <input type="text" value={newEventTitle} onChange={(e) => setNewEventTitle(e.target.value)} className="select-input" style={{ width: "100%", background: "var(--input-bg)" }} placeholder="Event label..." />
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <div>
                    <label style={{ fontSize: "0.75rem", display: "block", marginBottom: "4px" }}>Hour (0-23):</label>
                    <input type="number" min="0" max="23" value={newEventHour} onChange={(e) => setNewEventHour(Number(e.target.value))} className="select-input" style={{ width: "100%", background: "var(--input-bg)" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.75rem", display: "block", marginBottom: "4px" }}>Duration (h):</label>
                    <input type="number" min="1" value={newEventDuration} onChange={(e) => setNewEventDuration(Number(e.target.value))} className="select-input" style={{ width: "100%", background: "var(--input-bg)" }} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" }}>
                  <button className="btn btn-secondary" onClick={() => setShowFormModal(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={addCalendarEvent}>Confirm Event</button>
                </div>
              </div>
            </div>
          )}

          <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <h4>Conflict Resolution Math</h4>
            <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", color: "var(--text-muted)", fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}>
              <Layers size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                Conflict audits evaluate timeline bounds:
                <br />
                <code>start1 &lt; end2 && start2 &lt; end1</code>
                If true, schedules intersect.
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CalendarViewer;
