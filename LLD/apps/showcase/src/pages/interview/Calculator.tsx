import React, { useState, useEffect, useCallback } from "react";
import { Calculator as CalcIcon, Trash2, History, CornerDownLeft } from "lucide-react";

// --- Dijkstra's Shunting-Yard Lexer & Infix Evaluator ---
// Custom parsing engine showing compilation theory and LLD design patterns.
const tokenize = (str: string): string[] => {
  const tokens: string[] = [];
  let i = 0;
  while (i < str.length) {
    const char = str[i];
    if (/\s/.test(char)) {
      i++;
      continue;
    }
    // Match numbers (including decimals and negative values where appropriate)
    if (/[0-9.]/.test(char)) {
      let num = "";
      while (i < str.length && /[0-9.]/.test(str[i])) {
        num += str[i];
        i++;
      }
      tokens.push(num);
      continue;
    }
    if ("+-*/()".includes(char)) {
      tokens.push(char);
      i++;
      continue;
    }
    i++;
  }
  return tokens;
};

const evaluateExpression = (expression: string): number => {
  const tokens = tokenize(expression);
  const outputQueue: string[] = [];
  const operatorStack: string[] = [];
  const precedence: Record<string, number> = {
    "+": 1,
    "-": 1,
    "*": 2,
    "/": 2,
  };

  for (const token of tokens) {
    if (!isNaN(Number(token))) {
      outputQueue.push(token);
    } else if ("+-*/".includes(token)) {
      while (
        operatorStack.length > 0 &&
        "+-*/".includes(operatorStack[operatorStack.length - 1]) &&
        precedence[operatorStack[operatorStack.length - 1]] >= precedence[token]
      ) {
        outputQueue.push(operatorStack.pop()!);
      }
      operatorStack.push(token);
    } else if (token === "(") {
      operatorStack.push(token);
    } else if (token === ")") {
      while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== "(") {
        outputQueue.push(operatorStack.pop()!);
      }
      if (operatorStack.length === 0) {
        throw new Error("Mismatched parentheses");
      }
      operatorStack.pop(); // Pop "("
    }
  }

  while (operatorStack.length > 0) {
    const op = operatorStack.pop()!;
    if (op === "(" || op === ")") {
      throw new Error("Mismatched parentheses");
    }
    outputQueue.push(op);
  }

  const evalStack: number[] = [];
  for (const token of outputQueue) {
    if (!isNaN(Number(token))) {
      evalStack.push(Number(token));
    } else {
      const b = evalStack.pop();
      const a = evalStack.pop();
      if (a === undefined || b === undefined) {
        throw new Error("Syntax error");
      }
      switch (token) {
        case "+":
          evalStack.push(a + b);
          break;
        case "-":
          evalStack.push(a - b);
          break;
        case "*":
          evalStack.push(a * b);
          break;
        case "/":
          if (b === 0) throw new Error("Divide by 0");
          evalStack.push(a / b);
          break;
      }
    }
  }

  if (evalStack.length !== 1) {
    throw new Error("Invalid format");
  }
  return evalStack[0];
};

interface HistoryItem {
  id: string;
  expression: string;
  result: string;
}

// --- Data Layer: Custom Hook ---
export function useCalculator() {
  const [equation, setEquation] = useState("");
  const [result, setResult] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem("lld_calc_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("lld_calc_history", JSON.stringify(history));
  }, [history]);

  const handleKeyPress = useCallback((val: string) => {
    setEquation((prev) => {
      // Clear
      if (val === "C") return "";
      // Backspace
      if (val === "⌫") return prev.slice(0, -1);
      // Append operators/operands with spacing check
      const operators = "+-*/";
      const lastChar = prev.slice(-1);
      if (operators.includes(val) && operators.includes(lastChar)) {
        // Swap last operator instead of appending multiple operators
        return prev.slice(0, -1) + val;
      }
      return prev + val;
    });
  }, []);

  const calculate = useCallback(() => {
    if (!equation.trim()) return;
    try {
      // Balance parenthetical inputs automatically if user forgot
      let expr = equation;
      const leftCount = (expr.match(/\(/g) || []).length;
      const rightCount = (expr.match(/\)/g) || []).length;
      if (leftCount > rightCount) {
        expr += ")".repeat(leftCount - rightCount);
      }

      const evalVal = evaluateExpression(expr);
      const formattedResult = Number.isInteger(evalVal)
        ? String(evalVal)
        : String(parseFloat(evalVal.toFixed(6)));

      setResult(formattedResult);
      setHistory((prev) => [
        { id: Math.random().toString(36).substring(2, 9), expression: expr, result: formattedResult },
        ...prev.slice(0, 19), // Cap history at 20 entries
      ]);
    } catch (err: any) {
      setResult(err.message || "Error");
    }
  }, [equation]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const restoreHistory = useCallback((item: HistoryItem) => {
    setEquation(item.expression);
    setResult(item.result);
  }, []);

  return {
    equation,
    result,
    history,
    handleKeyPress,
    calculate,
    clearHistory,
    restoreHistory,
    setEquation,
  };
}

// --- UI Layer: Presentation Component ---
export const Calculator: React.FC = () => {
  const {
    equation,
    result,
    history,
    handleKeyPress,
    calculate,
    clearHistory,
    restoreHistory,
  } = useCalculator();

  const [showHistory, setShowHistory] = useState(false);

  // Map keyboard controls to calculator buttons
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      if (key >= "0" && key <= "9") handleKeyPress(key);
      else if (["+", "-", "*", "/"].includes(key)) handleKeyPress(key);
      else if (key === ".") handleKeyPress(".");
      else if (key === "(" || key === ")") handleKeyPress(key);
      else if (key === "Enter" || key === "=") {
        e.preventDefault();
        calculate();
      } else if (key === "Backspace") handleKeyPress("⌫");
      else if (key === "Escape") handleKeyPress("C");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyPress, calculate]);

  const buttons = [
    ["(", ")", "⌫", "C"],
    ["7", "8", "9", "/"],
    ["4", "5", "6", "*"],
    ["1", "2", "3", "-"],
    ["0", ".", "=", "+"],
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="todos-card-header">
        <div className="todos-header-title">
          <CalcIcon className="todos-title-icon" style={{ color: "var(--text-h)" }} />
          <h3>Interactive Mathematical Evaluator</h3>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`btn btn-secondary ${showHistory ? "active" : ""}`}
          style={{ display: "flex", gap: "6px", alignItems: "center" }}
        >
          <History size={16} />
          <span>{showHistory ? "Hide History" : "Show History"}</span>
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: showHistory ? "1.2fr 0.8fr" : "1fr",
          gap: "24px",
          transition: "grid-template-columns 0.3s ease",
          alignItems: "start",
          maxWidth: "760px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* Main Calculator Screen */}
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: "var(--border-radius)",
            background: "var(--card-bg)",
            padding: "24px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
          }}
        >
          {/* Display screen */}
          <div
            style={{
              background: "var(--input-bg)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              padding: "16px",
              marginBottom: "20px",
              minHeight: "100px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "flex-end",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                fontSize: "1.1rem",
                color: "var(--text-muted)",
                wordBreak: "break-all",
                fontFamily: "var(--font-mono)",
                minHeight: "24px",
              }}
            >
              {equation || "0"}
            </div>
            <div
              style={{
                fontSize: "2.2rem",
                fontWeight: "bold",
                color: "var(--text-h)",
                wordBreak: "break-all",
                fontFamily: "var(--font-mono)",
                marginTop: "12px",
              }}
            >
              {result || "0"}
            </div>
          </div>

          {/* Button Grid */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {buttons.map((row, rIdx) => (
              <div key={rIdx} style={{ display: "flex", gap: "10px" }}>
                {row.map((btn) => {
                  const isOperator = "+-*/".includes(btn);
                  const isAction = ["C", "⌫", "(", ")"].includes(btn);
                  const isEqual = btn === "=";

                  let btnBg = "var(--input-bg)";
                  let btnColor = "var(--text-h)";

                  if (isOperator) {
                    btnBg = "rgba(59, 130, 246, 0.1)";
                    btnColor = "var(--primary)";
                  } else if (isAction) {
                    btnBg = "var(--border)";
                    btnColor = "var(--text-muted)";
                  } else if (isEqual) {
                    btnBg = "var(--primary)";
                    btnColor = "#ffffff";
                  }

                  return (
                    <button
                      key={btn}
                      onClick={() => (isEqual ? calculate() : handleKeyPress(btn))}
                      style={{
                        flex: 1,
                        height: "56px",
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                        background: btnBg,
                        color: btnColor,
                        fontSize: "1.2rem",
                        fontWeight: "bold",
                        cursor: "pointer",
                        outline: "none",
                        transition: "transform 0.1s, opacity 0.1s",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
                      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    >
                      {btn === "=" ? <CornerDownLeft size={18} /> : btn}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* History drawer */}
        {showHistory && (
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: "var(--border-radius)",
              background: "var(--card-bg)",
              padding: "20px",
              minHeight: "380px",
              maxHeight: "432px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h4 style={{ margin: 0 }}>Calculation History</h4>
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--danger)",
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                  }}
                  title="Clear history"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <div style={{ overflowY: "auto", flexGrow: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
              {history.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "48px 12px",
                    color: "var(--text-muted)",
                    fontSize: "0.9rem",
                    border: "1px dashed var(--border)",
                    borderRadius: "6px",
                  }}
                >
                  No calculations recorded yet.
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => restoreHistory(item)}
                    style={{
                      background: "var(--input-bg)",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      padding: "10px",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: "4px",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--border)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "var(--input-bg)")}
                  >
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", wordBreak: "break-all", fontFamily: "var(--font-mono)" }}>
                      {item.expression}
                    </span>
                    <strong style={{ fontSize: "1.1rem", color: "var(--primary)", fontFamily: "var(--font-mono)" }}>
                      = {item.result}
                    </strong>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calculator;
