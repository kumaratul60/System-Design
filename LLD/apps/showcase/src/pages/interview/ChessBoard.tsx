import React, { useState, useEffect, useRef } from "react";
import { translate } from "@statelab/theme";
import { HelpCircle, RefreshCw, Clock, Download, Play, Pause, Code} from "lucide-react";

// Chess Piece Types
type PieceType = "p" | "r" | "n" | "b" | "q" | "k"; // Pawn, Rook, Knight, Bishop, Queen, King
type Color = "w" | "b"; // White, Black

interface ChessPiece {
  type: PieceType;
  color: Color;
}

// Visual piece map symbols
const PIECE_SYMBOLS: Record<Color, Record<PieceType, string>> = {
  w: { p: "♙", r: "♖", n: "♘", b: "♗", q: "♕", k: "♔" },
  b: { p: "♟", r: "♜", n: "♞", b: "♝", q: "♛", k: "♚" }};

// Initial Chess Board Grid Layout setup (8x8)
const createInitialBoard = (): (ChessPiece | null)[][] => {
  const board = Array(8).fill(null).map(() => Array(8).fill(null));

  // Back row pieces
  const backRow: PieceType[] = ["r", "n", "b", "q", "k", "b", "n", "r"];

  // Black pieces (Rows 0 & 1)
  for (let col = 0; col < 8; col++) {
    board[0][col] = { type: backRow[col], color: "b" };
    board[1][col] = { type: "p", color: "b" };
  }

  // White pieces (Rows 6 & 7)
  for (let col = 0; col < 8; col++) {
    board[6][col] = { type: "p", color: "w" };
    board[7][col] = { type: backRow[col], color: "w" };
  }

  return board;
};

export const ChessBoard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"basic" | "mid" | "advance">("basic");

  // Chess Game State
  const [board, setBoard] = useState<(ChessPiece | null)[][]>(createInitialBoard);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<[number, number][]>([]);
  const [turn, setTurn] = useState<Color>("w");

  // Advance features (Timers, capture ledgers, PGN history)
  const [whiteTime, setWhiteTime] = useState(300); // 5 minutes in seconds
  const [blackTime, setBlackTime] = useState(300);
  const [isClockActive, setIsClockActive] = useState(false);
  const [capturedPieces, setCapturedPieces] = useState<{ w: ChessPiece[]; b: ChessPiece[] }>({ w: [], b: [] });
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const clockIntervalRef = useRef<any>(null);

  // Restart Board
  const resetGame = () => {
    setBoard(createInitialBoard());
    setSelectedCell(null);
    setPossibleMoves([]);
    setTurn("w");
    setWhiteTime(300);
    setBlackTime(300);
    setIsClockActive(false);
    setCapturedPieces({ w: [], b: [] });
    setMoveHistory([]);
  };

  // Turn Clocks Timer loop
  useEffect(() => {
    if (activeTab !== "advance" || !isClockActive) {
      if (clockIntervalRef.current) clearInterval(clockIntervalRef.current);
      return;
    }

    clockIntervalRef.current = setInterval(() => {
      if (turn === "w") {
        setWhiteTime((t) => {
          if (t <= 1) {
            setIsClockActive(false);
            alert("Black wins on time!");
            return 0;
          }
          return t - 1;
        });
      } else {
        setBlackTime((t) => {
          if (t <= 1) {
            setIsClockActive(false);
            alert("White wins on time!");
            return 0;
          }
          return t - 1;
        });
      }
    }, 1000);

    return () => {
      if (clockIntervalRef.current) clearInterval(clockIntervalRef.current);
    };
  }, [turn, activeTab, isClockActive]);

  // Format seconds to time string (MM:SS)
  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  // ----------------------------------------------------
  // --- RULE-BASED MOVE CALCULATION (Mid / Advance) ----
  // ----------------------------------------------------
  const calculateValidMoves = (r: number, c: number, piece: ChessPiece): [number, number][] => {
    const moves: [number, number][] = [];

    // Direction helper: Rooks
    const addRookMoves = () => {
      const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      dirs.forEach(([dr, dc]) => {
        let nr = r + dr;
        let nc = c + dc;
        while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
          const target = board[nr][nc];
          if (!target) {
            moves.push([nr, nc]);
          } else {
            if (target.color !== piece.color) {
              moves.push([nr, nc]); // Capture possible
            }
            break; // Blocked
          }
          nr += dr;
          nc += dc;
        }
      });
    };

    // Pawns
    const addPawnMoves = () => {
      const dir = piece.color === "w" ? -1 : 1;
      const startRow = piece.color === "w" ? 6 : 1;

      // Forward 1 step
      if (r + dir >= 0 && r + dir < 8 && !board[r + dir][c]) {
        moves.push([r + dir, c]);
        // Forward 2 steps from starting position
        if (r === startRow && !board[r + 2 * dir][c]) {
          moves.push([r + 2 * dir, c]);
        }
      }

      // Diagonal captures
      const diagCols = [c - 1, c + 1];
      diagCols.forEach((dc) => {
        if (dc >= 0 && dc < 8 && r + dir >= 0 && r + dir < 8) {
          const target = board[r + dir][dc];
          if (target && target.color !== piece.color) {
            moves.push([r + dir, dc]);
          }
        }
      });
    };

    // Knights
    const addKnightMoves = () => {
      const offsets = [
        [2, 1], [2, -1], [-2, 1], [-2, -1],
        [1, 2], [1, -2], [-1, 2], [-1, -2]
      ];
      offsets.forEach(([dr, dc]) => {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
          const target = board[nr][nc];
          if (!target || target.color !== piece.color) {
            moves.push([nr, nc]);
          }
        }
      });
    };

    switch (piece.type) {
      case "p":
        addPawnMoves();
        break;
      case "r":
        addRookMoves();
        break;
      case "n":
        addKnightMoves();
        break;
      default: {
        // Basic highlights for Bishop, Queen, King (Free movements)
        const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]];
        const maxSteps = piece.type === "k" ? 1 : 8;
        directions.forEach(([dr, dc]) => {
          let nr = r + dr;
          let nc = c + dc;
          let step = 0;
          while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && step < maxSteps) {
            const target = board[nr][nc];
            if (!target) {
              moves.push([nr, nc]);
            } else {
              if (target.color !== piece.color) moves.push([nr, nc]);
              break;
            }
            nr += dr;
            nc += dc;
            step++;
          }
        });
      }
    }

    return moves;
  };

  // ----------------------------------------------------
  // --- CELL INTERACTIVE CLICKS ------------------------
  // ----------------------------------------------------
  const handleCellClick = (r: number, c: number) => {
    const piece = board[r][c];

    // Case 1: Select friendly piece
    if (piece && piece.color === turn) {
      setSelectedCell([r, c]);
      if (activeTab !== "basic") {
        setPossibleMoves(calculateValidMoves(r, c, piece));
      }
      return;
    }

    // Case 2: Move execution to target cell
    if (selectedCell) {
      const [sr, sc] = selectedCell;
      const isPossible = activeTab === "basic" || possibleMoves.some(([pr, pc]) => pr === r && pc === c);

      if (isPossible) {
        const activePiece = board[sr][sc]!;
        const targetPiece = board[r][c];
        const nextBoard = board.map((row) => [...row]);

        // Clear original cell, set target cell
        nextBoard[sr][sc] = null;
        nextBoard[r][c] = activePiece;

        setBoard(nextBoard);

        // Keep capture statistics
        if (targetPiece) {
          const captureColor = targetPiece.color;
          setCapturedPieces((prev) => ({
            ...prev,
            [captureColor]: [...prev[captureColor], targetPiece]}));
        }

        // Keep PGN notations
        const colLetters = ["a", "b", "c", "d", "e", "f", "g", "h"];
        const pgnCode = `${activePiece.type.toUpperCase()}${colLetters[sc]}${8 - sr} to ${colLetters[c]}${8 - r}`;
        setMoveHistory((prev) => [...prev, pgnCode]);

        // Toggle turn
        setTurn((prev) => (prev === "w" ? "b" : "w"));
        setSelectedCell(null);
        setPossibleMoves([]);
        setIsClockActive(true); // Auto starts clocks in Advance
      } else {
        // Clear selection if illegal move cell clicked
        setSelectedCell(null);
        setPossibleMoves([]);
      }
    }
  };

  const getPgnString = () => {
    let pgn = "";
    for (let i = 0; i < moveHistory.length; i += 2) {
      const turnNum = Math.floor(i / 2) + 1;
      const whiteMove = moveHistory[i];
      const blackMove = moveHistory[i + 1] || "...";
      pgn += `${turnNum}. ${whiteMove} ${blackMove} \n`;
    }
    return pgn;
  };

  const downloadPGNFile = () => {
    const content = getPgnString();
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "chess_playbook.pgn";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="todos-card-header" style={{ marginBottom: "20px" }}>
        <div className="todos-header-title">
          <HelpCircle className="todos-title-icon" style={{ color: "var(--text-h)" }} />
          <h3>Chess Board Arena</h3>
                    <a
            href={`https://github.com/kumaratul60/System-Design/blob/main/LLD/apps/showcase/src/pages/interview/ChessBoard.tsx`}
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
          Basic (Starting Positions Grid)
        </button>
        <button
          className={`btn ${activeTab === "mid" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("mid")}
        >
          Mid (Piece Move Highlights)
        </button>
        <button
          className={`btn ${activeTab === "advance" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => { setActiveTab("advance"); setIsClockActive(false); }}
        >
          Advance (Clocks & PGN Exports)
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1.3fr", gap: "24px", alignItems: "start" }}>
        {/* Left Side: Chess Board grid */}
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "24px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          
          {/* Turn tracker */}
          <h4 style={{ marginBottom: "16px", color: "var(--text-h)" }}>
            Turn: <span style={{ color: "var(--primary)" }}>{turn === "w" ? "White" : "Black"}</span>
          </h4>

          {/* Board grid */}
          <div
            style={{
              border: "4px solid var(--border)",
              borderRadius: "8px",
              overflow: "hidden",
              display: "grid",
              gridTemplateRows: "repeat(8, 1fr)",
              gridTemplateColumns: "repeat(8, 1fr)",
              width: "360px",
              height: "360px"}}
          >
            {board.map((row, r) =>
              row.map((piece, c) => {
                const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c;
                const isPossible = possibleMoves.some(([pr, pc]) => pr === r && pc === c);
                const isDarkCell = (r + c) % 2 === 1;

                // Color mappings
                const cellBg = isSelected
                  ? "rgba(59, 130, 246, 0.4)"
                  : isPossible
                  ? "rgba(22, 163, 74, 0.3)"
                  : isDarkCell
                  ? "#b58863"
                  : "#f0d9b5";

                return (
                  <div
                    key={`${r}_${c}`}
                    onClick={() => handleCellClick(r, c)}
                    style={{
                      width: "45px",
                      height: "45px",
                      background: cellBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.8rem",
                      cursor: "pointer",
                      userSelect: "none",
                      color: piece?.color === "w" ? "#fff" : "#000",
                      textShadow: piece?.color === "w" ? "0 0 3px #000" : "none",
                      transition: "background-color 0.1s"}}
                  >
                    {piece ? PIECE_SYMBOLS[piece.color][piece.type] : ""}
                  </div>
                );
              })
            )}
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button className="btn btn-secondary" onClick={resetGame} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <RefreshCw size={14} /> Restart Board
            </button>
          </div>
        </div>

        {/* Right Side Panels: Clocks, Captures & PGN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Turn Clocks (Advance) */}
          {activeTab === "advance" && (
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px" }}>
              <h4 style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}><Clock size={16} /> Tournament Clocks</h4>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", textAlign: "center", marginBottom: "12px" }}>
                <div style={{ background: turn === "w" ? "rgba(59, 130, 246, 0.15)" : "var(--input-bg)", border: turn === "w" ? "2px solid var(--primary)" : "1px solid var(--border)", padding: "8px", borderRadius: "6px" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>White Timer</span>
                  <strong style={{ fontSize: "1.2rem", color: "var(--text-h)" }}>{formatTime(whiteTime)}</strong>
                </div>
                <div style={{ background: turn === "b" ? "rgba(59, 130, 246, 0.15)" : "var(--input-bg)", border: turn === "b" ? "2px solid var(--primary)" : "1px solid var(--border)", padding: "8px", borderRadius: "6px" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Black Timer</span>
                  <strong style={{ fontSize: "1.2rem", color: "var(--text-h)" }}>{formatTime(blackTime)}</strong>
                </div>
              </div>

              <button className="btn btn-secondary" onClick={() => setIsClockActive(!isClockActive)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                {isClockActive ? <Pause size={14} /> : <Play size={14} />}
                {isClockActive ? "Pause Clocks" : "Resume Clocks"}
              </button>
            </div>
          )}

          {/* Captured Pieces Ledger (Advance) */}
          {activeTab === "advance" && (
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px" }}>
              <h4 style={{ marginBottom: "10px" }}>Captured Ledger</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ fontSize: "0.85rem" }}>
                  <span style={{ color: "var(--text-muted)" }}>Captured White pieces: </span>
                  <span style={{ fontSize: "1.1rem" }}>{capturedPieces.w.map((p) => PIECE_SYMBOLS.w[p.type]).join(" ")}</span>
                </div>
                <div style={{ fontSize: "0.85rem" }}>
                  <span style={{ color: "var(--text-muted)" }}>Captured Black pieces: </span>
                  <span style={{ fontSize: "1.1rem" }}>{capturedPieces.b.map((p) => PIECE_SYMBOLS.b[p.type]).join(" ")}</span>
                </div>
              </div>
            </div>
          )}

          {/* PGN History Logs (Advance) */}
          {activeTab === "advance" && (
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px" }}>
              <h4 style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}><Download size={16} /> PGN Playbook Notation</h4>
              <pre
                style={{
                  background: "var(--input-bg)",
                  color: "var(--text-h)",
                  padding: "10px",
                  borderRadius: "6px",
                  maxHeight: "120px",
                  overflowY: "auto",
                  fontSize: "0.75rem",
                  fontFamily: "var(--font-mono)",
                  whiteSpace: "pre-wrap",
                  marginBottom: "12px"}}
              >
                {getPgnString() || "No moves registered."}
              </pre>

              <button className="btn btn-primary" onClick={downloadPGNFile} disabled={moveHistory.length === 0} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                <Download size={14} /> Download PGN File
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChessBoard;
