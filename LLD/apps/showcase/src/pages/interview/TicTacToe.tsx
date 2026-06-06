import React, { useState, useEffect, useRef, useCallback } from "react";
import { translate } from "@statelab/theme";
import { Play, Pause, RotateCcw, Award, ShieldAlert, ArrowLeft, ArrowRight, Code} from "lucide-react";

// Web Audio API Sound Synthesizer Helper
const playSynthSound = (frequency: number, type: OscillatorType = "sine", duration = 0.1) => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio context initialization block fallback
  }
};

export const TicTacToe: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"basic" | "mid" | "advance">("basic");

  // Game Settings Configuration
  const [gridSize, setGridSize] = useState(3); // 3x3, 4x4, 5x5
  const [board, setBoard] = useState<string[]>(Array(9).fill(""));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [winningCells, setWinningCells] = useState<number[]>([]);
  const [isTie, setIsTie] = useState(false);

  // Time Travel states (Mid)
  const [history, setHistory] = useState<string[][]>([Array(9).fill("")]);
  const [historyStep, setHistoryStep] = useState(0);

  // AI & Game Mode Configuration (Advance)
  const [gameMode, setGameMode] = useState<"pvp" | "ai">("pvp");
  const [aiDifficulty, setAiDifficulty] = useState<"easy" | "hard">("hard");
  const [secondsRemaining, setSecondsRemaining] = useState(15);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const timerIntervalRef = useRef<any>(null);

  // Score stats ledger
  const [scores, setScores] = useState({ x: 0, o: 0, ties: 0 });

  // Rebuild game board array on grid size changes
  useEffect(() => {
    const size = activeTab === "basic" ? 3 : gridSize;
    const cells = size * size;
    setBoard(Array(cells).fill(""));
    setHistory([Array(cells).fill("")]);
    setHistoryStep(0);
    setIsXNext(true);
    setWinner(null);
    setWinningCells([]);
    setIsTie(false);
    setSecondsRemaining(15);
  }, [gridSize, activeTab]);

  // Handle Win checks dynamically for arbitrary grid sizes
  const checkWinPatterns = (cells: string[], size: number) => {
    // Row checks
    for (let r = 0; r < size; r++) {
      const rowStart = r * size;
      const val = cells[rowStart];
      if (val) {
        let win = true;
        const indexes = [];
        for (let c = 0; c < size; c++) {
          indexes.push(rowStart + c);
          if (cells[rowStart + c] !== val) win = false;
        }
        if (win) return { winner: val, cells: indexes };
      }
    }

    // Column checks
    for (let c = 0; c < size; c++) {
      const val = cells[c];
      if (val) {
        let win = true;
        const indexes = [];
        for (let r = 0; r < size; r++) {
          indexes.push(r * size + c);
          if (cells[r * size + c] !== val) win = false;
        }
        if (win) return { winner: val, cells: indexes };
      }
    }

    // Diagonal 1 (top-left to bottom-right)
    const d1Val = cells[0];
    if (d1Val) {
      let win = true;
      const indexes = [];
      for (let i = 0; i < size; i++) {
        indexes.push(i * size + i);
        if (cells[i * size + i] !== d1Val) win = false;
      }
      if (win) return { winner: d1Val, cells: indexes };
    }

    // Diagonal 2 (top-right to bottom-left)
    const d2Val = cells[size - 1];
    if (d2Val) {
      let win = true;
      const indexes = [];
      for (let i = 0; i < size; i++) {
        indexes.push(i * size + (size - 1 - i));
        if (cells[i * size + (size - 1 - i)] !== d2Val) win = false;
      }
      if (win) return { winner: d2Val, cells: indexes };
    }

    return null;
  };

  // Move Timer Loop setup (Advance)
  useEffect(() => {
    if (activeTab !== "advance" || winner || isTie || !isTimerActive) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }

    setSecondsRemaining(15);
    timerIntervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Time expired, auto toggle turn
          playSynthSound(220, "sawtooth", 0.3); // Alert sound
          setIsXNext((prevX) => !prevX);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isXNext, winner, isTie, activeTab, isTimerActive]);

  // Reset Timer helper
  const resetTimer = () => {
    setSecondsRemaining(15);
  };

  // AI Minimax evaluation helper
  const minimax = (tempBoard: string[], depth: number, isMax: boolean): number => {
    const winResult = checkWinPatterns(tempBoard, 3);
    if (winResult) {
      return winResult.winner === "O" ? 10 - depth : depth - 10;
    }
    if (!tempBoard.includes("")) return 0;

    const emptyIndices = tempBoard
      .map((val, idx) => (val === "" ? idx : null))
      .filter((val): val is number => val !== null);

    if (isMax) {
      let best = -Infinity;
      emptyIndices.forEach((idx) => {
        const boardCopy = [...tempBoard];
        boardCopy[idx] = "O";
        best = Math.max(best, minimax(boardCopy, depth + 1, false));
      });
      return best;
    } else {
      let best = Infinity;
      emptyIndices.forEach((idx) => {
        const boardCopy = [...tempBoard];
        boardCopy[idx] = "X";
        best = Math.min(best, minimax(boardCopy, depth + 1, true));
      });
      return best;
    }
  };

  const findWinningMoveIndex = (cells: string[], player: string, size: number) => {
    for (let i = 0; i < cells.length; i++) {
      if (cells[i] === "") {
        const copy = [...cells];
        copy[i] = player;
        if (checkWinPatterns(copy, size)?.winner === player) {
          return i;
        }
      }
    }
    return -1;
  };

  // ----------------------------------------------------
  // --- GAME ACTIONS & STATE MANAGEMENT ----------------
  // ----------------------------------------------------
  const executeMove = (idx: number, playerSymbol: string, currentBoard: string[]) => {
    const nextBoard = [...currentBoard];
    nextBoard[idx] = playerSymbol;

    // Trigger Sound effects on turn
    playSynthSound(playerSymbol === "X" ? 523.25 : 659.25, "sine", 0.08); // C5 or E5 note

    setBoard(nextBoard);

    // Save history logs for time travel
    const newHistory = history.slice(0, historyStep + 1);
    setHistory([...newHistory, nextBoard]);
    setHistoryStep(newHistory.length);

    const winResult = checkWinPatterns(nextBoard, gridSize);
    if (winResult) {
      setWinner(winResult.winner);
      setWinningCells(winResult.cells);
      playSynthSound(880, "triangle", 0.35); // Win chime A5

      setScores((prev) => ({
        ...prev,
        [winResult.winner.toLowerCase() as "x" | "o"]: prev[winResult.winner.toLowerCase() as "x" | "o"] + 1}));
    } else if (!nextBoard.includes("")) {
      setIsTie(true);
      setScores((prev) => ({ ...prev, ties: prev.ties + 1 }));
    } else {
      setIsXNext(playerSymbol === "O");
      resetTimer();
    }
  };

  // ----------------------------------------------------
  // --- AI LOGIC (Minimax / Random) --------------------
  // ----------------------------------------------------
  const makeAIMove = useCallback((currentBoard: string[]) => {
    const emptyIndices = currentBoard
      .map((val, idx) => (val === "" ? idx : null))
      .filter((val): val is number => val !== null);

    if (emptyIndices.length === 0) return;

    let targetIdx = emptyIndices[0];

    if (aiDifficulty === "easy") {
      // Pick random
      const randomIdx = Math.floor(Math.random() * emptyIndices.length);
      targetIdx = emptyIndices[randomIdx];
    } else {
      // Hard: Simple minimax optimization if grid size is 3 (computationally fast)
      if (gridSize === 3) {
        let bestScore = -Infinity;
        emptyIndices.forEach((idx) => {
          const tempBoard = [...currentBoard];
          tempBoard[idx] = "O"; // AI is O
          const score = minimax(tempBoard, 0, false);
          if (score > bestScore) {
            bestScore = score;
            targetIdx = idx;
          }
        });
      } else {
        // Fallback for larger grid to block immediate player wins or take corners
        const blockIdx = findWinningMoveIndex(currentBoard, "X", gridSize);
        const winIdx = findWinningMoveIndex(currentBoard, "O", gridSize);
        if (winIdx !== -1) targetIdx = winIdx;
        else if (blockIdx !== -1) targetIdx = blockIdx;
        else {
          const randomIdx = Math.floor(Math.random() * emptyIndices.length);
          targetIdx = emptyIndices[randomIdx];
        }
      }
    }

    executeMove(targetIdx, "O", currentBoard);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiDifficulty, gridSize]);

  const handleCellClick = (idx: number) => {
    if (board[idx] || winner || isTie) return;
    const playerSymbol = isXNext ? "X" : "O";

    executeMove(idx, playerSymbol, board);
  };

  // Auto trigger AI turn when condition matches
  useEffect(() => {
    if (gameMode === "ai" && !isXNext && !winner && !isTie) {
      const timer = setTimeout(() => {
        makeAIMove(board);
      }, 500); // Simulated delay
      return () => clearTimeout(timer);
    }
  }, [isXNext, gameMode, board, winner, isTie, makeAIMove]);

  // Time Travel History restoration
  const jumpToHistory = (step: number) => {
    setBoard(history[step]);
    setHistoryStep(step);
    setIsXNext(step % 2 === 0);
    setWinner(null);
    setWinningCells([]);
    setIsTie(false);
    resetTimer();
  };

  const restartGame = () => {
    const size = activeTab === "basic" ? 3 : gridSize;
    const cells = size * size;
    setBoard(Array(cells).fill(""));
    setHistory([Array(cells).fill("")]);
    setHistoryStep(0);
    setIsXNext(true);
    setWinner(null);
    setWinningCells([]);
    setIsTie(false);
    resetTimer();
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="todos-card-header" style={{ marginBottom: "20px" }}>
        <div className="todos-header-title">
          <Award className="todos-title-icon" style={{ color: "var(--text-h)" }} />
          <h3>Tic-Tac-Toe Arena</h3>
                    <a
            href={`https://github.com/kumaratul60/System-Design/blob/main/LLD/apps/showcase/src/pages/interview/TicTacToe.tsx`}
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
          Basic (3x3 PvP Game)
        </button>
        <button
          className={`btn ${activeTab === "mid" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("mid")}
        >
          Mid (Sizing & Time Travel)
        </button>
        <button
          className={`btn ${activeTab === "advance" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => { setActiveTab("advance"); setIsTimerActive(true); }}
        >
          Advance (Minimax AI & Timers)
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1.3fr", gap: "24px", alignItems: "start" }}>
        {/* Left Side Game Board */}
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "24px" }}>
          
          {/* Game configs in Mid/Advance */}
          {activeTab !== "basic" && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
              {/* Grid size selection */}
              {activeTab === "mid" && (
                <div>
                  <span style={{ fontSize: "0.85rem", marginRight: "8px" }}>Grid Size:</span>
                  {[3, 4, 5].map((s) => (
                    <button
                      key={s}
                      className={`btn ${gridSize === s ? "btn-primary" : "btn-secondary"}`}
                      onClick={() => setGridSize(s)}
                      style={{ padding: "2px 8px", fontSize: "0.75rem", marginRight: "4px" }}
                      disabled={historyStep > 0}
                    >
                      {s}x{s}
                    </button>
                  ))}
                </div>
              )}

              {/* Game mode select in Advance */}
              {activeTab === "advance" && (
                <div style={{ display: "flex", gap: "12px", width: "100%", justifyContent: "space-between" }}>
                  <div>
                    <span style={{ fontSize: "0.85rem", marginRight: "8px" }}>Game Mode:</span>
                    <button className={`btn ${gameMode === "pvp" ? "btn-primary" : "btn-secondary"}`} onClick={() => setGameMode("pvp")} style={{ padding: "2px 8px", fontSize: "0.75rem", marginRight: "4px" }}>PvP</button>
                    <button className={`btn ${gameMode === "ai" ? "btn-primary" : "btn-secondary"}`} onClick={() => setGameMode("ai")} style={{ padding: "2px 8px", fontSize: "0.75rem" }}>Vs AI</button>
                  </div>
                  {gameMode === "ai" && (
                    <div>
                      <span style={{ fontSize: "0.85rem", marginRight: "8px" }}>AI level:</span>
                      <button className={`btn ${aiDifficulty === "easy" ? "btn-primary" : "btn-secondary"}`} onClick={() => setAiDifficulty("easy")} style={{ padding: "2px 8px", fontSize: "0.75rem", marginRight: "4px" }}>Easy</button>
                      <button className={`btn ${aiDifficulty === "hard" ? "btn-primary" : "btn-secondary"}`} onClick={() => setAiDifficulty("hard")} style={{ padding: "2px 8px", fontSize: "0.75rem" }}>Minimax</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Turn Alert Banner */}
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            {winner ? (
              <h4 style={{ color: "var(--success)" }}>Winner: Player {winner}!</h4>
            ) : isTie ? (
              <h4 style={{ color: "var(--text-muted)" }}>Game is a Tie!</h4>
            ) : (
              <h4 style={{ color: "var(--text-h)" }}>
                Next Turn: <span style={{ color: "var(--primary)" }}>{isXNext ? "X" : "O"}</span>
                {activeTab === "advance" && ` (${secondsRemaining}s)`}
              </h4>
            )}
          </div>

          {/* Grid Layout board */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${activeTab === "basic" ? 3 : gridSize}, 1fr)`,
              gap: "8px",
              maxWidth: "320px",
              margin: "0 auto 24px auto"}}
          >
            {board.map((cell, idx) => {
              const isWinningCell = winningCells.includes(idx);
              return (
                <button
                  key={idx}
                  onClick={() => handleCellClick(idx)}
                  style={{
                    height: gridSize === 5 ? "50px" : gridSize === 4 ? "65px" : "80px",
                    background: isWinningCell ? "rgba(22,163,74,0.2)" : "var(--input-bg)",
                    border: isWinningCell ? "2px solid var(--success)" : "1px solid var(--border)",
                    borderRadius: "8px",
                    fontSize: gridSize === 5 ? "1.2rem" : "1.8rem",
                    fontWeight: "bold",
                    color: cell === "X" ? "var(--primary)" : "red",
                    cursor: cell || winner || isTie ? "not-allowed" : "pointer",
                    outline: "none"}}
                  disabled={!!cell || !!winner || isTie}
                >
                  {cell}
                </button>
              );
            })}
          </div>

          {/* Controls */}
          <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
            <button className="btn btn-secondary" onClick={restartGame} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <RotateCcw size={14} /> Restart Arena
            </button>
            {activeTab === "advance" && (
              <button className="btn btn-secondary" onClick={() => setIsTimerActive(!isTimerActive)} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {isTimerActive ? <Pause size={14} /> : <Play size={14} />}
                {isTimerActive ? "Pause Timer" : "Resume Timer"}
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Score card / Time Travel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Score card ledger */}
          <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px" }}>
            <h4 style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}><Award size={16} /> Player Scores</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", textAlign: "center" }}>
              <div style={{ background: "var(--input-bg)", padding: "8px", borderRadius: "6px" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Player X</span>
                <strong style={{ color: "var(--primary)" }}>{scores.x}</strong>
              </div>
              <div style={{ background: "var(--input-bg)", padding: "8px", borderRadius: "6px" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Player O</span>
                <strong style={{ color: "red" }}>{scores.o}</strong>
              </div>
              <div style={{ background: "var(--input-bg)", padding: "8px", borderRadius: "6px" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Ties</span>
                <strong style={{ color: "var(--text-h)" }}>{scores.ties}</strong>
              </div>
            </div>
          </div>

          {/* Time travel logs */}
          {activeTab === "mid" && (
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px" }}>
              <h4 style={{ marginBottom: "12px" }}>Undo/Redo Time Travel</h4>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", marginBottom: "12px" }}>
                <button className="btn btn-secondary" onClick={() => jumpToHistory(Math.max(0, historyStep - 1))} disabled={historyStep === 0} style={{ display: "flex", alignItems: "center", gap: "4px", flex: 1, padding: "6px" }}><ArrowLeft size={14} /> Undo</button>
                <button className="btn btn-secondary" onClick={() => jumpToHistory(Math.min(history.length - 1, historyStep + 1))} disabled={historyStep === history.length - 1} style={{ display: "flex", alignItems: "center", gap: "4px", flex: 1, padding: "6px" }}>Redo <ArrowRight size={14} /></button>
              </div>
              
              <div style={{ maxHeight: "150px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "4px" }}>
                {history.map((_, step) => (
                  <button
                    key={step}
                    className="btn"
                    onClick={() => jumpToHistory(step)}
                    style={{
                      padding: "4px 8px",
                      fontSize: "0.8rem",
                      background: historyStep === step ? "var(--primary)" : "var(--input-bg)",
                      color: historyStep === step ? "var(--bg)" : "var(--text-h)",
                      justifyContent: "flex-start",
                      textAlign: "left"}}
                  >
                    {step === 0 ? "• Move Game Start" : `• Move #${step}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* AI Info dashboard */}
          {activeTab === "advance" && gameMode === "ai" && (
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px" }}>
              <h4 style={{ marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}><ShieldAlert size={16} /> AI Bot Engine</h4>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.4, margin: 0 }}>
                Minimax algorithm searches all tree leaf nodes recursively to secure optimal cells. In 3x3 grids, AI is unbeatable on Hard setting. In larger grids, heuristic blocking guards the cells.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicTacToe;
