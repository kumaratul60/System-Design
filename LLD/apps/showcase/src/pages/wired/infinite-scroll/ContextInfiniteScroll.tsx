import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { Sparkles, RefreshCw, ExternalLink, Image as ImageIcon } from "lucide-react";

interface Photo {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
}

interface GalleryContextType {
  photos: Photo[];
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
  page: number;
  fetchPhotos: (pageNumber: number) => Promise<void>;
  incrementPage: () => void;
  resetGallery: () => void;
}

const GalleryContext = createContext<GalleryContextType | undefined>(undefined);

// --- Custom Provider Component ---
const GalleryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPhotos = useCallback(async (pageNumber: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://picsum.photos/v2/list?page=${pageNumber}&limit=12`);
      if (!response.ok) throw new Error("Failed to load photos");
      const data = await response.json();

      setPhotos((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const uniqueNew = data.filter((p: Photo) => !existingIds.has(p.id));
        return [...prev, ...uniqueNew];
      });

      if (data.length < 12) {
        setHasMore(false);
      }
    } catch {
      setError("Unable to connect to the photo API. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const incrementPage = useCallback(() => {
    setPage((p) => p + 1);
  }, []);

  const resetGallery = useCallback(() => {
    setPhotos([]);
    setPage(1);
    setHasMore(true);
  }, []);

  // Fetch photos when page index increments
  useEffect(() => {
    fetchPhotos(page);
  }, [page, fetchPhotos]);

  return (
    <GalleryContext.Provider
      value={{
        photos,
        isLoading,
        hasMore,
        error,
        page,
        fetchPhotos,
        incrementPage,
        resetGallery,
      }}
    >
      {children}
    </GalleryContext.Provider>
  );
};

// --- Data Layer: Custom Hook ---
export function useGalleryContext() {
  const context = useContext(GalleryContext);
  if (!context) {
    throw new Error("useGalleryContext must be used within a GalleryProvider");
  }
  return context;
}

// Inner presentation layout
const ContextInfiniteScrollInner: React.FC = () => {
  const {
    photos,
    isLoading,
    hasMore,
    error,
    page,
    fetchPhotos,
    incrementPage,
    resetGallery,
  } = useGalleryContext();

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
          <h3>Infinite Gallery (Engine 3: Context API Bus)</h3>
        </div>
        <button onClick={resetGallery} className="btn btn-secondary fetch-btn" disabled={isLoading}>
          <RefreshCw className={`fetch-icon ${isLoading && photos.length === 0 ? "spinning" : ""}`} size={16} />
          <span className="btn-text">Reset Gallery</span>
        </button>
      </div>

      <div className="welcome-banner">
        <p className="welcome-text">
          <Sparkles size={16} className="inline-icon" style={{ marginRight: "8px", verticalAlign: "middle" }} />
          This gallery uses React Context to share and manage the photo feed state.
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

// Export wrapped with Provider
export const ContextInfiniteScroll: React.FC = () => {
  return (
    <GalleryProvider>
      <ContextInfiniteScrollInner />
    </GalleryProvider>
  );
};
