import React, { useState, useEffect, useRef, useCallback } from "react";
import { translate } from "@statelab/theme";
import { Sparkles, RefreshCw, ExternalLink, Image as ImageIcon, Code} from "lucide-react";

interface Photo {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
}

// --- Data Layer: Custom Hook ---
export function useLocalStorageScrollLogic() {
  const [photos, setPhotos] = useState<Photo[]>(() => {
    try {
      const saved = localStorage.getItem("lld_gallery_photos");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [page, setPage] = useState<number>(() => {
    const saved = localStorage.getItem("lld_gallery_page");
    return saved ? parseInt(saved, 10) : 1;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Sync photos to storage
  useEffect(() => {
    localStorage.setItem("lld_gallery_photos", JSON.stringify(photos));
    localStorage.setItem("lld_gallery_page", page.toString());
  }, [photos, page]);

  // Handle storage sync across tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "lld_gallery_photos" && e.newValue) {
        try {
          setPhotos(JSON.parse(e.newValue));
        } catch (err) {
          console.warn("Failed to parse synced photos:", err);
        }
      }
      if (e.key === "lld_gallery_page" && e.newValue) {
        setPage(parseInt(e.newValue, 10));
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

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

  // Fetch only if photos are currently empty or loading next page
  useEffect(() => {
    if (photos.length === 0) {
      fetchPhotos(1);
    }
  }, [fetchPhotos, photos.length]);

  const handleReload = () => {
    localStorage.removeItem("lld_gallery_photos");
    localStorage.removeItem("lld_gallery_page");
    setPhotos([]);
    setPage(1);
    setHasMore(true);
    fetchPhotos(1);
  };

  const observerRef = useRef<IntersectionObserver | null>(null);

  const lastPhotoElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => {
            const nextPage = prevPage + 1;
            fetchPhotos(nextPage);
            return nextPage;
          });
        }
      });

      if (node) {
        observerRef.current.observe(node);
      }
    },
    [isLoading, hasMore, fetchPhotos]
  );

  return {
    photos,
    isLoading,
    hasMore,
    error,
    lastPhotoElementRef,
    handleReload,
    fetchPhotos,
    page};
}

// --- UI Presentation Component ---
export const LocalStorageInfiniteScroll: React.FC = () => {
  const {
    photos,
    isLoading,
    hasMore,
    error,
    lastPhotoElementRef,
    handleReload,
    fetchPhotos,
    page} = useLocalStorageScrollLogic();

  return (
    <div className="page-container infinite-scroll-page">
      <div className="todos-card-header">
        <div className="todos-header-title">
          <ImageIcon className="todos-title-icon" />
          <h3>Infinite Gallery (Engine 2: LocalStorage Sync)</h3>
                    <a
            href={`https://github.com/kumaratul60/System-Design/blob/main/LLD/apps/showcase/src/pages/wired/infinite-scroll/LocalStorageInfiniteScroll.tsx`}
            target="_blank"
            rel="noopener noreferrer"
            title={translate("viewSource")}
            className="challenge-code-link-header"
            style={{ marginLeft: "auto", color: "var(--text-muted)", display: "flex", alignItems: "center", transition: "color 0.2s" }}
          >
            <Code size={20} />
          </a>
        </div>
        <button onClick={handleReload} className="btn btn-secondary fetch-btn" disabled={isLoading}>
          <RefreshCw className={`fetch-icon ${isLoading && photos.length === 0 ? "spinning" : ""}`} size={16} />
          <span className="btn-text">Reset Gallery</span>
        </button>
      </div>

      <div className="welcome-banner">
        <p className="welcome-text">
          <Sparkles size={16} className="inline-icon" style={{ marginRight: "8px", verticalAlign: "middle" }} />
          This gallery synchronizes its list of photos and page offset dynamically in real time across browser tabs.
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
