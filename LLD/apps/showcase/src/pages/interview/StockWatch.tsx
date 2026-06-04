import React, { useState, useEffect, useCallback, useRef } from "react";
import { TrendingUp, TrendingDown, Activity, RefreshCw, BarChart2 } from "lucide-react";

// --- Types & Interfaces ---
export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  history: number[];
}

// --- Data Layer: Custom Hook ---
export function useStockWatchLogic() {
  const [stocks, setStocks] = useState<Record<string, Stock>>({
    AAPL: { symbol: "AAPL", name: "Apple Inc.", price: 175.5, change: 0.15, history: [173.2, 174.1, 173.8, 174.5, 175.1, 175.5] },
    GOOG: { symbol: "GOOG", name: "Alphabet Inc.", price: 142.2, change: -0.45, history: [144.5, 143.8, 143.1, 142.9, 142.5, 142.2] },
    MSFT: { symbol: "MSFT", name: "Microsoft Corp.", price: 380.1, change: 0.82, history: [375.0, 376.5, 377.9, 378.2, 379.5, 380.1] },
  });
  const [selectedSymbol, setSelectedSymbol] = useState<string>("AAPL");
  const [isLive, setIsLive] = useState<boolean>(true);

  // Live simulation update loop
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setStocks((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((symbol) => {
          const stock = next[symbol];
          
          // Generate a mock change: +/- 0.5%
          const changePercent = (Math.random() * 1.0 - 0.5) / 100;
          const delta = stock.price * changePercent;
          const nextPrice = parseFloat((stock.price + delta).toFixed(2));
          
          // History update window (max 30 elements)
          const nextHistory = [...stock.history, nextPrice];
          if (nextHistory.length > 25) {
            nextHistory.shift();
          }

          // Calculate total change percentage based on initial history
          const firstPrice = nextHistory[0];
          const totalChange = parseFloat((((nextPrice - firstPrice) / firstPrice) * 100).toFixed(2));

          next[symbol] = {
            ...stock,
            price: nextPrice,
            change: totalChange,
            history: nextHistory,
          };
        });
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive]);

  const selectStock = useCallback((symbol: string) => {
    setSelectedSymbol(symbol);
  }, []);

  const toggleLive = useCallback(() => {
    setIsLive((prev) => !prev);
  }, []);

  return {
    stocks,
    selectedSymbol,
    isLive,
    selectStock,
    toggleLive,
  };
}

// --- UI Layer: Presentation Component ---
export const StockWatch: React.FC = () => {
  const { stocks, selectedSymbol, isLive, selectStock, toggleLive } = useStockWatchLogic();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeStock = stocks[selectedSymbol];

  // Draw chart in HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activeStock) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Reset layout for device density scaling
    ctx.clearRect(0, 0, width, height);

    const history = activeStock.history;
    if (history.length < 2) return;

    const minPrice = Math.min(...history);
    const maxPrice = Math.max(...history);
    const priceRange = maxPrice - minPrice || 1;

    // Layout configuration
    const paddingX = 40;
    const paddingY = 30;
    const chartWidth = width - paddingX * 2;
    const chartHeight = height - paddingY * 2;

    // 1. Draw Grid Lines
    ctx.strokeStyle = "var(--border)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    const gridRows = 4;
    for (let i = 0; i <= gridRows; i++) {
      const y = paddingY + (i / gridRows) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(paddingX, y);
      ctx.lineTo(width - paddingX, y);
      ctx.stroke();

      // Price Tag Label
      const priceAtGrid = maxPrice - (i / gridRows) * priceRange;
      ctx.fillStyle = "var(--text-muted)";
      ctx.font = "10px var(--font-mono)";
      ctx.fillText(`$${priceAtGrid.toFixed(2)}`, width - paddingX + 5, y + 4);
    }
    ctx.setLineDash([]); // Reset dashed lines

    // 2. Plot Trend Line
    const points = history.map((price, idx) => {
      const x = paddingX + (idx / (history.length - 1)) * chartWidth;
      const y = paddingY + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
      return { x, y };
    });

    const isPositive = activeStock.change >= 0;
    const trendColor = isPositive ? "#22c55e" : "#ef4444"; // green vs red

    ctx.strokeStyle = trendColor;
    ctx.lineWidth = 3.5;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    ctx.beginPath();
    points.forEach((pt, idx) => {
      if (idx === 0) {
        ctx.moveTo(pt.x, pt.y);
      } else {
        ctx.lineTo(pt.x, pt.y);
      }
    });
    ctx.stroke();

    // 3. Area Gradient Fill
    ctx.lineTo(points[points.length - 1].x, height - paddingY);
    ctx.lineTo(points[0].x, height - paddingY);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, paddingY, 0, height - paddingY);
    if (isPositive) {
      gradient.addColorStop(0, "rgba(34, 197, 94, 0.2)");
      gradient.addColorStop(1, "rgba(34, 197, 94, 0.0)");
    } else {
      gradient.addColorStop(0, "rgba(239, 68, 68, 0.2)");
      gradient.addColorStop(1, "rgba(239, 68, 68, 0.0)");
    }
    ctx.fillStyle = gradient;
    ctx.fill();

    // 4. Highlight Last Point
    const lastPt = points[points.length - 1];
    ctx.beginPath();
    ctx.arc(lastPt.x, lastPt.y, 6, 0, 2 * Math.PI);
    ctx.fillStyle = trendColor;
    ctx.fill();
    ctx.strokeStyle = "var(--card-bg)";
    ctx.lineWidth = 2;
    ctx.stroke();

  }, [activeStock]);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="todos-card-header">
        <div className="todos-header-title">
          <Activity className="todos-title-icon" style={{ color: "var(--text-h)" }} />
          <h3>Real-time Stock Watchlist</h3>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px", alignItems: "stretch" }}>
        {/* Watchlist side */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4 style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <BarChart2 size={16} /> Market Rates
            </h4>
            <button className="btn btn-secondary" onClick={toggleLive} style={{ padding: "6px 12px" }}>
              <RefreshCw size={14} className={isLive ? "spinning" : ""} />
              {isLive ? "Live Sync" : "Paused"}
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {Object.values(stocks).map((stock) => {
              const selected = stock.symbol === selectedSymbol;
              const positive = stock.change >= 0;
              return (
                <div
                  key={stock.symbol}
                  onClick={() => selectStock(stock.symbol)}
                  style={{
                    border: selected ? "2px solid var(--text-h)" : "1px solid var(--border)",
                    borderRadius: "var(--border-radius)",
                    padding: "16px",
                    background: "var(--card-bg)",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!selected) e.currentTarget.style.borderColor = "var(--text-muted)";
                  }}
                  onMouseLeave={(e) => {
                    if (!selected) e.currentTarget.style.borderColor = "var(--border)";
                  }}
                >
                  <div>
                    <span style={{ fontSize: "1.1rem", fontWeight: "bold", color: "var(--text-h)" }}>
                      {stock.symbol}
                    </span>
                    <span style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      {stock.name}
                    </span>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "1.1rem", fontWeight: "bold", display: "block" }}>
                      ${stock.price.toFixed(2)}
                    </span>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "2px",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: positive ? "var(--success)" : "var(--danger)",
                      }}
                    >
                      {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {positive ? "+" : ""}
                      {stock.change.toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Canvas Trend Chart side */}
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: "var(--border-radius)",
            background: "var(--card-bg)",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h4 style={{ margin: 0 }}>{activeStock.name} ({activeStock.symbol})</h4>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Live Sparkline Trend (Window: {activeStock.history.length} ticks)
              </span>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "1.3rem", fontWeight: "bold", color: "var(--text-h)" }}>
                ${activeStock.price.toFixed(2)}
              </span>
            </div>
          </div>

          <div
            style={{
              position: "relative",
              width: "100%",
              height: "260px",
              background: "var(--input-bg)",
              borderRadius: "var(--border-radius)",
              overflow: "hidden",
            }}
          >
            <canvas
              ref={canvasRef}
              width={500}
              height={260}
              style={{
                width: "100%",
                height: "100%",
                display: "block",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockWatch;
