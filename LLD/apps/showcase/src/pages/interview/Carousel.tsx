import React, { useState, useEffect, useCallback } from "react";
import { translate } from "@statelab/theme";
import { Play, Pause, ChevronLeft, ChevronRight, Sliders, Image as ImageIcon, Code} from "lucide-react";

// --- Types & Interfaces ---
export interface CarouselImage {
  url: string;
  caption: string;
  photographer: string;
}

export interface UseCarouselParams {
  itemCount: number;
  defaultInterval?: number;
  defaultAutoplay?: boolean;
}

// --- Data Layer: Custom Hook ---
export function useCarouselLogic({
  itemCount,
  defaultInterval = 3000,
  defaultAutoplay = true}: UseCarouselParams) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(defaultAutoplay);
  const [intervalMs, setIntervalMs] = useState<number>(defaultInterval);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const nextSlide = useCallback(() => {
    if (itemCount === 0) return;
    setActiveIndex((prev) => (prev + 1) % itemCount);
  }, [itemCount]);

  const prevSlide = useCallback(() => {
    if (itemCount === 0) return;
    setActiveIndex((prev) => (prev - 1 + itemCount) % itemCount);
  }, [itemCount]);

  const goToSlide = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const changeSpeed = useCallback((speedMs: number) => {
    setIntervalMs(speedMs);
  }, []);

  // Handle Autoplay timer
  useEffect(() => {
    if (!isPlaying || isHovered || itemCount === 0) return;

    const timer = setInterval(() => {
      nextSlide();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, isHovered, intervalMs, itemCount, nextSlide]);

  return {
    activeIndex,
    isPlaying,
    intervalMs,
    isHovered,
    nextSlide,
    prevSlide,
    goToSlide,
    togglePlay,
    changeSpeed,
    setIsHovered};
}

// --- Dummy Slideshow Images ---
const DEFAULT_IMAGES: CarouselImage[] = [
  {
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    caption: "Golden Horizon - Serene Ocean Sunset",
    photographer: "Sean Oulashin"},
  {
    url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80",
    caption: "Mist-covered Valleys of the Alps",
    photographer: "Kal Vis"},
  {
    url: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=800&q=80",
    caption: "Deep Forest Pathway through Redwoods",
    photographer: "Lukasz Szmigiel"},
  {
    url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80",
    caption: "Rugged Mountain Ridges under Clear Skies",
    photographer: "David Marcu"},
];

// --- UI Layer: Presentation Component ---
export const Carousel: React.FC = () => {
  const images = DEFAULT_IMAGES;
  const {
    activeIndex,
    isPlaying,
    intervalMs,
    nextSlide,
    prevSlide,
    goToSlide,
    togglePlay,
    changeSpeed,
    setIsHovered} = useCarouselLogic({
    itemCount: images.length,
    defaultInterval: 3000,
    defaultAutoplay: true});

  // Keyboard navigation listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        prevSlide();
      } else if (e.key === "ArrowRight") {
        nextSlide();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  return (
    <div className="page-container">
      <div className="todos-card-header">
        <div className="todos-header-title">
          <ImageIcon className="todos-title-icon" style={{ color: "var(--text-h)" }} />
          <h3>Precision Slideshow Carousel</h3>
                    <a
            href={`https://github.com/kumaratul60/System-Design/blob/main/LLD/apps/showcase/src/pages/interview/Carousel.tsx`}
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

      {/* Control panel */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          background: "var(--input-bg)",
          padding: "16px",
          borderRadius: "var(--border-radius)",
          alignItems: "center",
          justifyContent: "space-between"}}
      >
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button className="btn btn-primary" onClick={togglePlay}>
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            {isPlaying ? "Pause Autoplay" : "Resume Autoplay"}
          </button>
          {isPlaying && (
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              (Pauses on hover)
            </span>
          )}
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Sliders size={16} style={{ color: "var(--text-muted)" }} />
          <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>Interval:</span>
          <select
            className="select-input"
            value={intervalMs}
            onChange={(e) => changeSpeed(Number(e.target.value))}
          >
            <option value={1000}>1s (Fast)</option>
            <option value={2000}>2s</option>
            <option value={3000}>3s (Default)</option>
            <option value={5000}>5s</option>
            <option value={8000}>8s (Slow)</option>
          </select>
        </div>
      </div>

      {/* Slide Viewport */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "400px",
          borderRadius: "var(--border-radius)",
          overflow: "hidden",
          border: "1px solid var(--border)",
          background: "#000"}}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Images List */}
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            transform: `translateX(-${activeIndex * 100}%)`,
            transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)"}}
        >
          {images.map((img, idx) => (
            <div
              key={idx}
              style={{
                minWidth: "100%",
                height: "100%",
                position: "relative"}}
            >
              <img
                src={img.url}
                alt={img.caption}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: 0.85}}
              />
              {/* Slide Caption Overlay */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
                  color: "#fff",
                  padding: "24px 32px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px"}}
              >
                <span style={{ fontSize: "1.2rem", fontWeight: 700 }}>
                  {img.caption}
                </span>
                <span style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                  Captured by {img.photographer} (via Unsplash)
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Direction Controls */}
        <button
          onClick={prevSlide}
          style={{
            position: "absolute",
            left: "16px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "rgba(255, 255, 255, 0.15)",
            border: "1px solid rgba(255, 255, 255, 0.25)",
            backdropFilter: "blur(4px)",
            color: "#fff",
            padding: "10px",
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            transition: "all 0.2s ease",
            outline: "none"}}
          onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.35)")}
          onMouseOut={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)")}
          aria-label="Previous Slide"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={nextSlide}
          style={{
            position: "absolute",
            right: "16px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "rgba(255, 255, 255, 0.15)",
            border: "1px solid rgba(255, 255, 255, 0.25)",
            backdropFilter: "blur(4px)",
            color: "#fff",
            padding: "10px",
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            transition: "all 0.2s ease",
            outline: "none"}}
          onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.35)")}
          onMouseOut={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)")}
          aria-label="Next Slide"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Indicator Dots */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "8px",
          marginTop: "16px"}}
      >
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            style={{
              width: activeIndex === idx ? "28px" : "8px",
              height: "8px",
              borderRadius: "4px",
              background: activeIndex === idx ? "var(--text-h)" : "var(--border)",
              border: "none",
              cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              outline: "none",
              padding: 0}}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
