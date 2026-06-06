import React, { useState, useRef, useEffect, useCallback } from "react";
import { translate } from "@statelab/theme";
import { Play, Pause, Volume2, VolumeX, Maximize, HelpCircle, Film, Minimize2, Bookmark, Code} from "lucide-react";

const VIDEO_URL = "https://media.w3.org/2010/05/sintel/trailer_hd.mp4";

interface VideoChapter {
  time: number; // in seconds
  title: string;
  color: string;
}

const VIDEO_CHAPTERS: VideoChapter[] = [
  { time: 0, title: "Introduction", color: "#3b82f6" },       // Blue
  { time: 10, title: "Sintel's Quest", color: "#8b5cf6" },     // Violet
  { time: 22, title: "Meeting the Dragon", color: "#ec4899" }, // Pink
  { time: 35, title: "The Battle Begins", color: "#f59e0b" },  // Amber
  { time: 45, title: "Credits & Outro", color: "#10b981" },    // Emerald
];

export const VideoPlayer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"basic" | "mid" | "advance">("basic");

  const videoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Play/Pause state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  // Timeline hover states
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState<number>(0);
  const [hoverChapter, setHoverChapter] = useState<string>("");
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Shared play/pause trigger
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  // Sync video time updates
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
  };

  const toggleMute = useCallback(() => {
    const next = !isMuted;
    setIsMuted(next);
    if (videoRef.current) {
      videoRef.current.muted = next;
      videoRef.current.volume = next ? 0 : volume;
    }
  }, [isMuted, volume]);

  // Format time (e.g. 95 seconds -> 01:35)
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // ==========================================
  // --- MID TAB (Speed & Fullscreen) ---------
  // ==========================================
  const [playbackRate, setPlaybackRate] = useState(1);

  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  // ==========================================
  // --- ADVANCE TAB (PiP & Hotkeys & Chapters)
  // ==========================================
  const [pipActive, setPipActive] = useState(false);

  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setPipActive(false);
      } else {
        await videoRef.current.requestPictureInPicture();
        setPipActive(true);
      }
    } catch (e) {
      console.error("PiP API failed/unsupported", e);
    }
  };

  // Listen to keyboard hotkeys in advance mode
  useEffect(() => {
    if (activeTab !== "advance") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current) return;
      
      // Ignore if user is typing in form inputs (like global search)
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
        return;
      }

      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
          break;
        case "ArrowRight":
          e.preventDefault();
          videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10);
          break;
        case "ArrowUp": {
          e.preventDefault();
          const upVol = Math.min(1, volume + 0.1);
          setVolume(upVol);
          videoRef.current.volume = upVol;
          break;
        }
        case "ArrowDown": {
          e.preventDefault();
          const downVol = Math.max(0, volume - 0.1);
          setVolume(downVol);
          videoRef.current.volume = downVol;
          break;
        }
        case "m":
        case "M":
          toggleMute();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, volume, duration, activeTab, isMuted, togglePlay, toggleMute]);

  // Seek timeline and show previews on mouse movement over the segment tracks
  const handleTimelineMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    const time = pct * duration;
    setHoverTime(time);
    setHoverX(x);

    // Identify active chapter under cursor hover
    let currentChap = VIDEO_CHAPTERS[0];
    for (let i = 1; i < VIDEO_CHAPTERS.length; i++) {
      if (time >= VIDEO_CHAPTERS[i].time) {
        currentChap = VIDEO_CHAPTERS[i];
      }
    }
    setHoverChapter(currentChap.title);

    // Seek the hidden preview video element to update the tooltip preview thumbnail
    if (previewVideoRef.current) {
      previewVideoRef.current.currentTime = time;
    }
  };

  const handleTimelineMouseLeave = () => {
    setHoverTime(null);
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !duration || !videoRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    const time = pct * duration;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="todos-card-header" style={{ marginBottom: "20px" }}>
        <div className="todos-header-title">
          <Film className="todos-title-icon" style={{ color: "var(--text-h)" }} />
          <h3>Interactive Video Player</h3>
                    <a
            href={`https://github.com/kumaratul60/System-Design/blob/main/LLD/apps/showcase/src/pages/interview/VideoPlayer.tsx`}
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
          Basic (Custom Playbar controls)
        </button>
        <button
          className={`btn ${activeTab === "mid" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("mid")}
        >
          Mid (Fullscreen & Speed Scale)
        </button>
        <button
          className={`btn ${activeTab === "advance" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("advance")}
        >
          Advance (PiP & Chapter markers & Hotkeys)
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1.3fr", gap: "24px", alignItems: "start" }}>
        {/* Left Side: Video Player Container */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          <div
            ref={containerRef}
            style={{
              position: "relative",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              overflow: "hidden",
              background: "#000"}}
          >
            {/* HTML5 Video Element */}
            <video
              ref={videoRef}
              src={VIDEO_URL}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onClick={togglePlay}
              style={{
                width: "100%",
                display: "block",
                maxHeight: "360px"}}
            />

            {/* Custom controls overlay bar */}
            <div
              style={{
                position: "absolute",
                bottom: 0, left: 0, right: 0,
                background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                pointerEvents: "auto"}}
            >
              {/* Progress Slider (Linear for Basic, Custom Chunked for Mid/Advance) */}
              <div style={{ position: "relative", width: "100%" }}>
                {activeTab === "basic" ? (
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleProgressChange}
                    style={{
                      width: "100%",
                      cursor: "pointer",
                      height: "4px",
                      borderRadius: "2px"}}
                  />
                ) : (
                  <div
                    ref={progressBarRef}
                    onMouseMove={handleTimelineMouseMove}
                    onMouseLeave={handleTimelineMouseLeave}
                    onClick={handleTimelineClick}
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "12px",
                      cursor: "pointer",
                      display: "flex",
                      gap: "4px",
                      alignItems: "center",
                      borderRadius: "6px"}}
                  >
                    {/* Segments loop */}
                    {VIDEO_CHAPTERS.map((chap, idx) => {
                      const start = chap.time;
                      const end = idx === VIDEO_CHAPTERS.length - 1 ? duration : VIDEO_CHAPTERS[idx + 1].time;
                      
                      const segmentDuration = end - start;
                      const widthPct = duration > 0 ? (segmentDuration / duration) * 100 : (100 / VIDEO_CHAPTERS.length);
                      
                      let fillPct = 0;
                      if (currentTime >= end) {
                        fillPct = 100;
                      } else if (currentTime >= start && currentTime < end) {
                        fillPct = ((currentTime - start) / segmentDuration) * 100;
                      }

                      return (
                        <div
                          key={chap.title}
                          style={{
                            width: `${widthPct}%`,
                            height: "6px",
                            background: "rgba(255, 255, 255, 0.25)",
                            borderRadius: "3px",
                            overflow: "hidden",
                            position: "relative"}}
                        >
                          <div
                            style={{
                              width: `${fillPct}%`,
                              height: "100%",
                              background: chap.color}}
                          />
                        </div>
                      );
                    })}

                    {/* Floating Hover Tooltip with Live Preview Video Thumbnail */}
                    {hoverTime !== null && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: "24px",
                          left: `${hoverX}px`,
                          transform: "translateX(-50%)",
                          background: "#09090b",
                          border: "1px solid #27272a",
                          borderRadius: "8px",
                          padding: "6px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "4px",
                          boxShadow: "0 4px 16px rgba(0,0,0,0.6)",
                          zIndex: 100,
                          pointerEvents: "none"}}
                      >
                        <video
                          ref={previewVideoRef}
                          src={VIDEO_URL}
                          muted
                          style={{
                            width: "110px",
                            height: "62px",
                            borderRadius: "4px",
                            background: "#000",
                            objectFit: "cover",
                            display: "block"}}
                        />
                        <span style={{ fontSize: "0.75rem", color: "#ffffff", fontWeight: "bold", textAlign: "center", whiteSpace: "nowrap" }}>
                          {hoverChapter}
                        </span>
                        <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                          {formatTime(hoverTime)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom buttons panel */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px", color: "#fff" }}>
                  {/* Play / Pause */}
                  <button onClick={togglePlay} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                  </button>

                  {/* Volume Slider & icon */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <button onClick={toggleMute} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
                      {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      style={{ width: "60px", cursor: "pointer" }}
                    />
                  </div>

                  {/* Timer text */}
                  <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)" }}>
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#fff" }}>
                  {/* Speed Selector (Only in Mid/Advance) */}
                  {(activeTab === "mid" || activeTab === "advance") && (
                    <div style={{ display: "flex", gap: "4px" }}>
                      {[0.5, 1, 1.5, 2].map((s) => (
                        <button
                          key={s}
                          onClick={() => handleSpeedChange(s)}
                          style={{
                            background: playbackRate === s ? "var(--primary)" : "rgba(255,255,255,0.15)",
                            border: "none",
                            borderRadius: "4px",
                            padding: "2px 6px",
                            fontSize: "0.65rem",
                            color: "#fff",
                            cursor: "pointer"}}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                  )}

                  {/* PiP (Only in Advance) */}
                  {activeTab === "advance" && (
                    <button onClick={togglePiP} style={{ background: "none", border: "none", color: pipActive ? "var(--primary)" : "#fff", cursor: "pointer" }} title="Picture-in-Picture">
                      <Minimize2 size={16} />
                    </button>
                  )}

                  {/* Fullscreen (Only in Mid/Advance) */}
                  {(activeTab === "mid" || activeTab === "advance") && (
                    <button onClick={toggleFullscreen} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
                      <Maximize size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Right Info Details */}
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h4>Keyboard hotkeys list</h4>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}>
            {activeTab === "advance" ? (
              <>
                <div><kbd style={{ background: "var(--input-bg)", padding: "2px 4px", borderRadius: "3px" }}>Space</kbd> - Play / Pause video</div>
                <div><kbd style={{ background: "var(--input-bg)", padding: "2px 4px", borderRadius: "3px" }}>ArrowLeft</kbd> - Rewind 10 seconds</div>
                <div><kbd style={{ background: "var(--input-bg)", padding: "2px 4px", borderRadius: "3px" }}>ArrowRight</kbd> - Fast forward 10 seconds</div>
                <div><kbd style={{ background: "var(--input-bg)", padding: "2px 4px", borderRadius: "3px" }}>ArrowUp</kbd> - Increase Volume 10%</div>
                <div><kbd style={{ background: "var(--input-bg)", padding: "2px 4px", borderRadius: "3px" }}>ArrowDown</kbd> - Decrease Volume 10%</div>
                <div><kbd style={{ background: "var(--input-bg)", padding: "2px 4px", borderRadius: "3px" }}>M</kbd> - Mute Toggle</div>
                
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: "8px", marginTop: "8px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: "bold", marginBottom: "4px" }}><Bookmark size={14} style={{ color: "#f59e0b" }} /> Chapter Timestamps</span>
                  {VIDEO_CHAPTERS.map((c) => (
                    <div key={c.time} style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
                      <span>• {c.title}</span>
                      <span>{formatTime(c.time)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div>
                <strong style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-h)" }}><HelpCircle size={14} /> Fullscreen API</strong>
                <span style={{ color: "var(--text-muted)", lineHeight: 1.4, display: "block", marginTop: "4px" }}>
                  To toggle elements into native browser fullscreen overlay modes, we call:
                  <br />
                  <code>containerRef.current.requestFullscreen()</code>.
                  This pushes the entire player container, keeping absolute overlay panels visible.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
