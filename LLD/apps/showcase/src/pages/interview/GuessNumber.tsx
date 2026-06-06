import React, { useState, useEffect } from "react";
import { HelpCircle, RefreshCw, Trophy, Heart, Activity, CheckCircle, AlertCircle } from "lucide-react";

interface LeaderboardEntry {
  name: string;
  attempts: number;
  difficulty: string;
  timestamp: string;
}

export const GuessNumber: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"basic" | "mid" | "advance">("basic");

  // Game Core Configuration
  const [targetNumber, setTargetNumber] = useState(0);
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [attemptsList, setAttemptsList] = useState<number[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  // Bounds range mapping state
  const [lowerBound, setLowerBound] = useState(1);
  const [upperBound, setUpperBound] = useState(100);

  // Difficulty configurations (Advance)
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [lives, setLives] = useState(10);
  const maxLivesMap = { easy: 10, medium: 7, hard: 5 };
  const rangeMap = { easy: 100, medium: 250, hard: 500 };

  // Mock Highscores list
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => {
    try {
      const saved = localStorage.getItem("lld_guess_leaderboard");
      return saved ? JSON.parse(saved) : [
        { name: "Atul", attempts: 4, difficulty: "easy", timestamp: "Today" },
        { name: "CompilerBot", attempts: 6, difficulty: "medium", timestamp: "Yesterday" }
      ];
    } catch {
      return [];
    }
  });

  const [username, setUsername] = useState("");
  const [showLeaderboardForm, setShowLeaderboardForm] = useState(false);

  // Setup game target number
  const resetGame = () => {
    const range = rangeMap[difficulty];
    const target = Math.floor(Math.random() * range) + 1;
    setTargetNumber(target);
    setGuess("");
    setFeedback("Make your first guess!");
    setAttemptsList([]);
    setIsGameOver(false);
    setHasWon(false);
    setLowerBound(1);
    setUpperBound(range);
    setLives(maxLivesMap[difficulty]);
    setShowLeaderboardForm(false);
  };

  useEffect(() => {
    resetGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGameOver) return;

    const num = parseInt(guess);
    if (isNaN(num) || num < 1 || num > rangeMap[difficulty]) {
      setFeedback(`Please guess a valid number between 1 and ${rangeMap[difficulty]}.`);
      return;
    }

    const nextAttempts = [...attemptsList, num];
    setAttemptsList(nextAttempts);
    setGuess("");

    // Basic high/low logic
    if (num === targetNumber) {
      setFeedback(`🎉 Correct! The number was ${targetNumber}.`);
      setHasWon(true);
      setIsGameOver(true);
      setShowLeaderboardForm(true);
    } else {
      const remainingLives = lives - 1;
      setLives(remainingLives);

      if (num < targetNumber) {
        setFeedback("Too low! Try a higher number.");
        if (num > lowerBound) setLowerBound(num + 1);
      } else {
        setFeedback("Too high! Try a lower number.");
        if (num < upperBound) setUpperBound(num - 1);
      }

      if (remainingLives <= 0 && activeTab === "advance") {
        setFeedback(`💀 Game Over! You ran out of lives. The number was ${targetNumber}.`);
        setIsGameOver(true);
      }
    }
  };

  const saveToLeaderboard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    const entry: LeaderboardEntry = {
      name: username,
      attempts: attemptsList.length,
      difficulty,
      timestamp: new Date().toLocaleDateString(),
    };

    setLeaderboard((prev) => {
      const updated = [...prev, entry].sort((a, b) => a.attempts - b.attempts).slice(0, 5);
      localStorage.setItem("lld_guess_leaderboard", JSON.stringify(updated));
      return updated;
    });

    setShowLeaderboardForm(false);
    setUsername("");
  };

  // Narrowing Percentage meter calculation
  const getNarrowingPercentage = () => {
    const fullRange = rangeMap[difficulty];
    const activeRange = Math.max(1, upperBound - lowerBound);
    return Math.round((1 - activeRange / fullRange) * 100);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="todos-card-header" style={{ marginBottom: "20px" }}>
        <div className="todos-header-title">
          <HelpCircle className="todos-title-icon" style={{ color: "var(--text-h)" }} />
          <h3>Number Guess Sandbox</h3>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
        <button
          className={`btn ${activeTab === "basic" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("basic")}
        >
          Basic (Hot/Cold feedback)
        </button>
        <button
          className={`btn ${activeTab === "mid" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("mid")}
        >
          Mid (Narrowing Range Meter)
        </button>
        <button
          className={`btn ${activeTab === "advance" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("advance")}
        >
          Advance (Lives & Leaderboards)
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1.3fr", gap: "24px", alignItems: "start" }}>
        {/* Left Side Game Board */}
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "24px" }}>
          
          {/* Difficulty select in Advance */}
          {activeTab === "advance" && (
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "20px" }}>
              {(["easy", "medium", "hard"] as const).map((diff) => (
                <button
                  key={diff}
                  className={`btn ${difficulty === diff ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setDifficulty(diff)}
                  style={{ textTransform: "capitalize", padding: "4px 12px", fontSize: "0.8rem" }}
                  disabled={attemptsList.length > 0 && !isGameOver}
                >
                  {diff} (1-{rangeMap[diff]})
                </button>
              ))}
            </div>
          )}

          {/* Core game panels */}
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <h4 style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              Guessing range: <strong style={{ color: "var(--text-h)" }}>{lowerBound} — {upperBound}</strong>
            </h4>

            {/* Simulated progress narrow indicator */}
            {activeTab !== "basic" && (
              <div style={{ width: "80%", margin: "16px auto 0 auto", height: "8px", background: "var(--input-bg)", borderRadius: "4px", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${getNarrowingPercentage()}%`,
                    height: "100%",
                    background: "var(--primary)",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            )}
          </div>

          <form onSubmit={handleGuessSubmit} style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "24px" }}>
            <input
              type="number"
              min="1"
              max={rangeMap[difficulty]}
              placeholder={`Guess (1-${rangeMap[difficulty]})...`}
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              className="select-input"
              style={{ width: "160px", background: "var(--input-bg)", textAlign: "center", fontSize: "1.2rem" }}
              disabled={isGameOver}
              required
            />
            <button type="submit" className="btn btn-primary" disabled={isGameOver}>Guess</button>
          </form>

          {/* Feedback Banner */}
          {feedback && (
            <div
              style={{
                background: hasWon ? "rgba(22,163,74,0.1)" : isGameOver ? "rgba(220,38,38,0.1)" : "var(--input-bg)",
                border: hasWon ? "1px solid var(--success)" : isGameOver ? "1px solid red" : "1px solid var(--border)",
                color: hasWon ? "var(--success)" : isGameOver ? "red" : "var(--text-h)",
                padding: "12px",
                borderRadius: "8px",
                fontSize: "0.95rem",
                textAlign: "center",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {hasWon ? <CheckCircle size={18} /> : isGameOver ? <AlertCircle size={18} /> : <Activity size={18} />}
              {feedback}
            </div>
          )}

          {/* Reset button */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button className="btn btn-secondary" onClick={resetGame} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <RefreshCw size={14} /> Reset Game
            </button>
          </div>

          {/* Highscore form saving */}
          {showLeaderboardForm && activeTab === "advance" && (
            <div style={{ borderTop: "1px solid var(--border)", marginTop: "24px", paddingTop: "20px" }}>
              <h4 style={{ marginBottom: "12px" }}>Save Your Highscore!</h4>
              <form onSubmit={saveToLeaderboard} style={{ display: "flex", gap: "10px" }}>
                <input
                  type="text"
                  placeholder="Enter name..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="select-input"
                  style={{ flex: 1, background: "var(--input-bg)" }}
                  required
                />
                <button type="submit" className="btn btn-primary">Save Score</button>
              </form>
            </div>
          )}
        </div>

        {/* Right Side: Logs / Highscore panels */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Attempts Log list */}
          {attemptsList.length > 0 && (
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px" }}>
              <h4 style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}><Activity size={16} /> Attempts Log ({attemptsList.length})</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {attemptsList.map((att, i) => (
                  <span
                    key={i}
                    style={{
                      background: "var(--input-bg)",
                      border: "1px solid var(--border)",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      fontSize: "0.85rem",
                      color: "var(--text-h)",
                    }}
                  >
                    #{i + 1}: {att}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Remaining lives in Advance */}
          {activeTab === "advance" && (
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Heart size={18} style={{ color: "red", fill: "red" }} />
                <strong style={{ color: "var(--text-h)" }}>Lives Remaining:</strong>
              </div>
              <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{lives} / {maxLivesMap[difficulty]}</span>
            </div>
          )}

          {/* Highscore List */}
          {activeTab === "advance" && (
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px" }}>
              <h4 style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}><Trophy size={16} style={{ color: "gold" }} /> Leaderboard Highscores</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {leaderboard.map((entry, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", borderBottom: "1px solid var(--border)", paddingBottom: "4px" }}>
                    <span style={{ color: "var(--text-h)" }}>{idx + 1}. {entry.name} ({entry.difficulty})</span>
                    <strong style={{ color: "var(--primary)" }}>{entry.attempts} guesses</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuessNumber;
