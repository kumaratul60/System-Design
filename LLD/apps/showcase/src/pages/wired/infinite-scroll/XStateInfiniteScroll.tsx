import React, { useEffect, useRef, useCallback } from "react";
import { translate } from "@statelab/theme";
import { createMachine, assign } from "xstate";
import { useMachine } from "@xstate/react";
import { Sparkles, RefreshCw, ExternalLink, Image as ImageIcon, Code} from "lucide-react";

interface Photo {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
}

// --- Machine Config ---
const galleryMachine = createMachine({
  id: "gallery",
  initial: "idle",
  context: {
    photos: [] as Photo[],
    page: 1,
    hasMore: true,
    error: null as string | null},
  states: {
    idle: {
      on: {
        FETCH: { target: "fetching" },
        INCREMENT_PAGE: {
          actions: assign({
            page: ({ context }) => context.page + 1}),
          target: "fetching"},
        RESET: {
          actions: assign({
            photos: [],
            page: 1,
            hasMore: true,
            error: null}),
          target: "fetching"}}},
    fetching: {
      on: {
        FETCH_SUCCESS: {
          target: "idle",
          actions: assign({
            photos: ({ context, event }) => {
              const incoming = (event as unknown as { photos: Photo[] }).photos;
              const existingIds = new Set(context.photos.map((p) => p.id));
              const unique = incoming.filter((p) => !existingIds.has(p.id));
              return [...context.photos, ...unique];
            },
            hasMore: ({ event }) => (event as unknown as { photos: Photo[] }).photos.length === 12,
            error: null})},
        FETCH_FAILURE: {
          target: "idle",
          actions: assign({
            error: ({ event }) => (event as unknown as { error: string }).error})}}}}});

// --- Data Layer: Custom Hook ---
export function useXStateGalleryLogic() {
  const [state, send] = useMachine(galleryMachine);
  const { photos, page, hasMore, error } = state.context;
  const isLoading = state.matches("fetching");

  const loadPhotos = useCallback(async (pageNumber: number) => {
    try {
      const response = await fetch(`https://picsum.photos/v2/list?page=${pageNumber}&limit=12`);
      if (!response.ok) throw new Error("Failed to load photos");
      const data = await response.json();
      send({ type: "FETCH_SUCCESS", photos: data });
    } catch {
      send({ type: "FETCH_FAILURE", error: "Unable to connect to the photo API. Please try again." });
    }
  }, [send]);

  // React to fetching state changes
  useEffect(() => {
    if (state.matches("fetching")) {
      loadPhotos(page);
    }
  }, [state, page, loadPhotos]);

  useEffect(() => {
    if (photos.length === 0) {
      send({ type: "FETCH" });
    }
  }, [send, photos.length]);

  const handleNextPage = () => {
    if (isLoading || !hasMore) return;
    send({ type: "INCREMENT_PAGE" });
  };

  const handleReset = () => {
    send({ type: "RESET" });
  };

  return {
    photos,
    page,
    isLoading,
    hasMore,
    error,
    handleNextPage,
    handleReset};
}

// --- UI Presentation Component ---
export const XStateInfiniteScroll: React.FC = () => {
  const {
    photos,
    isLoading,
    hasMore,
    error,
    handleNextPage,
    handleReset} = useXStateGalleryLogic();

  const observerRef = useRef<IntersectionObserver | null>(null);

  const lastPhotoElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          handleNextPage();
        }
      });

      if (node) {
        observerRef.current.observe(node);
      }
    },
    [isLoading, hasMore, handleNextPage]
  );

  return (
    <div className="page-container infinite-scroll-page">
      <div className="todos-card-header">
        <div className="todos-header-title">
          <ImageIcon className="todos-title-icon" />
          <h3>Infinite Gallery (Engine 4: XState Machine)</h3>
                    <a
            href={`https://github.com/kumaratul60/System-Design/blob/main/LLD/apps/showcase/src/pages/wired/infinite-scroll/XStateInfiniteScroll.tsx`}
            target="_blank"
            rel="noopener noreferrer"
            title={translate("viewSource")}
            className="challenge-code-link-header"
            style={{ marginLeft: "auto", color: "var(--text-muted)", display: "flex", alignItems: "center", transition: "color 0.2s" }}
          >
            <Code size={20} />
          </a>
        </div>
        <button onClick={handleReset} className="btn btn-secondary fetch-btn" disabled={isLoading}>
          <RefreshCw className={`fetch-icon ${isLoading && photos.length === 0 ? "spinning" : ""}`} size={16} />
          <span className="btn-text">Reset Gallery</span>
        </button>
      </div>

      <div className="welcome-banner">
        <p className="welcome-text">
          <Sparkles size={16} className="inline-icon" style={{ marginRight: "8px", verticalAlign: "middle" }} />
          This gallery uses an XState finite state machine actor context loop to handle pagination boundaries.
        </p>
      </div>

      <div className="photos-grid">
        {photos.map((photo, index) => {
          const isLastElement = photos.length === index + 1;
          const displayImage = `https://picsum.photos/id/${photo.id}/400/300`;

          return (
            <div key={photo.id} ref={isLastElement ? lastPhotoElementRef : null} className="photo-card">
              <div className="photo-image-container">
                <img src={displayImage} alt={`By ${photo.author}`} className="photo-image" loading="lazy" />
              </div>
              <div className="photo-info">
                <span className="photo-author">{photo.author}</span>
                <span className="photo-resolution">
                  {photo.width} × {photo.height} px
                </span>
                <div className="photo-footer">
                  <a href={photo.url} target="_blank" rel="noopener noreferrer" className="photo-link">
                    <span>View Unsplash</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isLoading && (
        <div className="loading-state scroll-loading">
          <RefreshCw className="loading-spinner spinning" size={24} />
          <p>Loading next page of images...</p>
        </div>
      )}

      {error && (
        <div className="empty-state scroll-error">
          <p className="danger-text">{error}</p>
          <button onClick={handleReset} className="btn btn-secondary mt-2">
            Retry Load
          </button>
        </div>
      )}

      {!hasMore && photos.length > 0 && (
        <div className="gallery-end-marker">
          <p>You have reached the end of the gallery collection.</p>
        </div>
      )}
    </div>
  );
};
