import React, { useEffect, useRef, useCallback } from "react";
import { translate } from "@statelab/theme";
import { create } from "zustand";
import { Sparkles, RefreshCw, ExternalLink, Image as ImageIcon, Code} from "lucide-react";

interface Photo {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
}

interface GalleryState {
  photos: Photo[];
  page: number;
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
  fetchPhotos: (pageNumber: number) => Promise<void>;
  incrementPage: () => void;
  resetGallery: () => void;
}

// --- Local Zustand Store ---
const useLocalGalleryStore = create<GalleryState>((set, get) => ({
  photos: [],
  page: 1,
  isLoading: false,
  hasMore: true,
  error: null,
  fetchPhotos: async (pageNumber: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`https://picsum.photos/v2/list?page=${pageNumber}&limit=12`);
      if (!response.ok) throw new Error("Failed to load photos");
      const data = await response.json();

      set((state) => {
        const existingIds = new Set(state.photos.map((p) => p.id));
        const uniqueNew = data.filter((p: Photo) => !existingIds.has(p.id));
        return {
          photos: [...state.photos, ...uniqueNew],
          hasMore: data.length === 12};
      });
    } catch {
      set({ error: "Unable to connect to the photo API. Please try again." });
    } finally {
      set({ isLoading: false });
    }
  },
  incrementPage: () => {
    const nextPage = get().page + 1;
    set({ page: nextPage });
    get().fetchPhotos(nextPage);
  },
  resetGallery: () => {
    set({ photos: [], page: 1, hasMore: true });
    get().fetchPhotos(1);
  }}));

// --- Data Layer: Custom Hook ---
export function useZustandGalleryLogic() {
  const photos = useLocalGalleryStore((state) => state.photos);
  const page = useLocalGalleryStore((state) => state.page);
  const isLoading = useLocalGalleryStore((state) => state.isLoading);
  const hasMore = useLocalGalleryStore((state) => state.hasMore);
  const error = useLocalGalleryStore((state) => state.error);

  const fetchPhotos = useLocalGalleryStore((state) => state.fetchPhotos);
  const incrementPage = useLocalGalleryStore((state) => state.incrementPage);
  const resetGallery = useLocalGalleryStore((state) => state.resetGallery);

  useEffect(() => {
    if (photos.length === 0) {
      fetchPhotos(1);
    }
  }, [fetchPhotos, photos.length]);

  return {
    photos,
    page,
    isLoading,
    hasMore,
    error,
    fetchPhotos,
    incrementPage,
    resetGallery};
}

// --- UI Presentation Component ---
export const ZustandInfiniteScroll: React.FC = () => {
  const {
    photos,
    page,
    isLoading,
    hasMore,
    error,
    fetchPhotos,
    incrementPage,
    resetGallery} = useZustandGalleryLogic();

  const observerRef = useRef<IntersectionObserver | null>(null);

  const lastPhotoElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          incrementPage();
        }
      });

      if (node) {
        observerRef.current.observe(node);
      }
    },
    [isLoading, hasMore, incrementPage]
  );

  return (
    <div className="page-container infinite-scroll-page">
      <div className="todos-card-header">
        <div className="todos-header-title">
          <ImageIcon className="todos-title-icon" />
          <h3>Infinite Gallery (Engine 5: Zustand Atomic Store)</h3>
                    <a
            href={`https://github.com/kumaratul60/System-Design/blob/main/LLD/apps/showcase/src/pages/wired/infinite-scroll/ZustandInfiniteScroll.tsx`}
            target="_blank"
            rel="noopener noreferrer"
            title={translate("viewSource")}
            className="challenge-code-link-header"
            style={{ marginLeft: "auto", color: "var(--text-muted)", display: "flex", alignItems: "center", transition: "color 0.2s" }}
          >
            <Code size={20} />
          </a>
        </div>
        <button onClick={resetGallery} className="btn btn-secondary fetch-btn" disabled={isLoading}>
          <RefreshCw className={`fetch-icon ${isLoading && photos.length === 0 ? "spinning" : ""}`} size={16} />
          <span className="btn-text">Reset Gallery</span>
        </button>
      </div>

      <div className="welcome-banner">
        <p className="welcome-text">
          <Sparkles size={16} className="inline-icon" style={{ marginRight: "8px", verticalAlign: "middle" }} />
          This gallery uses an atomic Zustand store with selectors to restrict re-renders to target elements.
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
          <button onClick={() => fetchPhotos(page)} className="btn btn-secondary mt-2">
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
