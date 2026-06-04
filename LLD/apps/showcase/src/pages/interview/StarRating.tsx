import React, { useState, useCallback, useRef } from "react";
import { Star, RotateCcw, HelpCircle, CheckCircle2 } from "lucide-react";

// --- Types & Interfaces ---
export interface UseStarRatingParams {
  totalStars?: number;
  initialRating?: number;
  initialAllowFractional?: boolean;
}

// --- Data Layer: Custom Hook ---
export function useStarRatingLogic({
  totalStars = 5,
  initialRating = 0,
  initialAllowFractional = true,
}: UseStarRatingParams = {}) {
  const [rating, setRating] = useState<number>(initialRating);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [allowFractional, setAllowFractional] = useState<boolean>(initialAllowFractional);

  const handleSelect = useCallback((val: number) => {
    setRating(val);
  }, []);

  const handleHover = useCallback((val: number | null) => {
    setHoverRating(val);
  }, []);

  const reset = useCallback(() => {
    setRating(0);
    setHoverRating(null);
  }, []);

  const toggleFractional = useCallback(() => {
    setAllowFractional((prev) => {
      const next = !prev;
      // If disabling fractional, round the current rating to the nearest integer
      if (!next) {
        setRating((r) => Math.round(r));
      }
      return next;
    });
  }, []);

  return {
    rating,
    hoverRating,
    allowFractional,
    totalStars,
    handleSelect,
    handleHover,
    reset,
    toggleFractional,
  };
}

// --- Star SVG Drawing Component ---
interface StarItemProps {
  index: number;
  ratingValue: number;
  allowFractional: boolean;
  onHover: (val: number | null) => void;
  onSelect: (val: number) => void;
}

const StarItem: React.FC<StarItemProps> = ({
  index,
  ratingValue,
  allowFractional,
  onHover,
  onSelect,
}) => {
  const starRef = useRef<HTMLDivElement>(null);

  const getTargetValue = (e: React.MouseEvent<HTMLDivElement>): number => {
    if (!starRef.current) return index + 1;
    const rect = starRef.current.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const isHalf = relativeX < rect.width / 2;

    if (allowFractional && isHalf) {
      return index + 0.5;
    }
    return index + 1;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const val = getTargetValue(e);
    onHover(val);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    onHover(null);
    e.currentTarget.style.transform = "scale(1)";
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const val = getTargetValue(e);
    onSelect(val);
  };

  // Determine fill fraction
  // index goes from 0 to totalStars-1
  // If ratingValue is 3.5:
  // - index = 0, fill = 1
  // - index = 1, fill = 1
  // - index = 2, fill = 1
  // - index = 3, fill = 0.5
  // - index = 4, fill = 0
  let fillPercentage = 0;
  if (ratingValue >= index + 1) {
    fillPercentage = 100;
  } else if (ratingValue > index) {
    fillPercentage = (ratingValue - index) * 100;
  }

  return (
    <div
      ref={starRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{
        position: "relative",
        cursor: "pointer",
        width: "48px",
        height: "48px",
        display: "inline-block",
        transition: "transform 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.15)";
      }}
    >
      {/* Background Star (Gray) */}
      <Star
        size={48}
        style={{
          color: "var(--border)",
          fill: "var(--border)",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      />
      {/* Foreground Filled Star (Yellow/Gold) using clip-path */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: `${fillPercentage}%`,
          overflow: "hidden",
          height: "100%",
          transition: "width 0.1s ease",
        }}
      >
        <Star
          size={48}
          style={{
            color: "#f59e0b", // Gold
            fill: "#f59e0b",
            position: "absolute",
            top: 0,
            left: 0,
            width: "48px", // Maintain constant width of child svg
          }}
        />
      </div>
    </div>
  );
};

// --- UI Layer: Presentation Component ---
export const StarRating: React.FC = () => {
  const {
    rating,
    hoverRating,
    allowFractional,
    totalStars,
    handleSelect,
    handleHover,
    reset,
    toggleFractional,
  } = useStarRatingLogic({
    totalStars: 5,
    initialRating: 0.5,
    initialAllowFractional: true,
  });

  const displayRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="todos-card-header">
        <div className="todos-header-title">
          <Star className="todos-title-icon" style={{ color: "var(--text-h)" }} />
          <h3>Interactive Rating Engine</h3>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "24px",
          alignItems: "start",
        }}
      >
        {/* Left Card: Star Container & Stats */}
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: "var(--border-radius)",
            background: "var(--card-bg)",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
            textAlign: "center",
          }}
        >
          <h4>Submit Feedback Score</h4>

          {/* Star selector container */}
          <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
            {Array.from({ length: totalStars }).map((_, idx) => (
              <StarItem
                key={idx}
                index={idx}
                ratingValue={displayRating}
                allowFractional={allowFractional}
                onHover={handleHover}
                onSelect={handleSelect}
              />
            ))}
          </div>

          {/* Score display */}
          <div
            style={{
              padding: "12px 24px",
              background: "var(--input-bg)",
              borderRadius: "40px",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "1.1rem", fontWeight: "bold", color: "var(--text-h)" }}>
              {displayRating.toFixed(1)}
            </span>
            <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>/ {totalStars}.0 Stars</span>
            {hoverRating !== null && (
              <span
                style={{
                  fontSize: "0.75rem",
                  background: "var(--text-h)",
                  color: "var(--bg)",
                  padding: "2px 6px",
                  borderRadius: "10px",
                  fontWeight: "bold",
                }}
              >
                Hovering
              </span>
            )}
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn btn-secondary" onClick={reset} disabled={rating === 0}>
              <RotateCcw size={16} /> Reset Rating
            </button>
          </div>
        </div>

        {/* Right Card: Dynamic settings */}
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: "var(--border-radius)",
            background: "var(--card-bg)",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <h4>Configuration & Math Details</h4>

          {/* Fractional Switch */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid var(--border)",
              paddingBottom: "12px",
            }}
          >
            <div>
              <span style={{ fontWeight: 600, display: "block" }}>Allow Fractional Selection</span>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Enables selection of half-star rating values (e.g. 3.5 stars)
              </span>
            </div>
            <button
              className={`btn ${allowFractional ? "btn-primary" : "btn-secondary"}`}
              onClick={toggleFractional}
            >
              {allowFractional ? "Half-Stars Enabled" : "Whole-Stars Only"}
            </button>
          </div>

          {/* Math details info */}
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", color: "var(--text-muted)" }}>
            <HelpCircle size={18} style={{ marginTop: "3px", flexShrink: 0 }} />
            <div style={{ fontSize: "0.85rem", lineHeight: 1.5 }}>
              The component tracks cursor coordinates via a mousemove event, comparing `clientX` to the star bounding rect's width:
              <br />
              <code style={{ fontFamily: "var(--font-mono)", background: "var(--input-bg)", padding: "2px 4px", borderRadius: "3px" }}>
                isHalf = relativeX &lt; rect.width / 2
              </code>
            </div>
          </div>

          {rating > 0 && (
            <div
              style={{
                background: "rgba(22, 163, 74, 0.1)",
                border: "1px solid var(--success)",
                padding: "12px",
                borderRadius: "var(--border-radius)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.9rem",
                color: "var(--success)",
              }}
            >
              <CheckCircle2 size={16} />
              <span>Feedback of {rating} stars submitted successfully.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StarRating;
