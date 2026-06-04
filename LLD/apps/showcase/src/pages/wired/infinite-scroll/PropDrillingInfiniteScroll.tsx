import React, { useState, useEffect, useRef, useCallback } from "react";
import { Sparkles, RefreshCw, ExternalLink, Image as ImageIcon } from "lucide-react";

// --- Types & Interfaces ---
interface Photo {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
}

interface PhotoCardProps {
  photo: Photo;
  isLast: boolean;
  lastPhotoRef: (node: HTMLDivElement | null) => void;
}

interface PhotoGridProps {
  photos: Photo[];
  lastPhotoRef: (node: HTMLDivElement | null) => void;
}

// --- Data Layer: Custom Hook ---
export function usePropDrillingScrollLogic() {
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

  useEffect(() => {
    fetchPhotos(page);
  }, [page, fetchPhotos]);

  const handleReload = () => {
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
          setPage((prevPage) => prevPage + 1);
        }
      });

      if (node) {
        observerRef.current.observe(node);
      }
    },
    [isLoading, hasMore]
  );

  return {
    photos,
    isLoading,
    hasMore,
    error,
    lastPhotoElementRef,
    handleReload,
    fetchPhotos,
    page,
  };
}

// --- UI Presentation Components ---

const PhotoCard: React.FC<PhotoCardProps> = ({ photo, isLast, lastPhotoRef }) => {
  const displayImage = `https://picsum.photos/id/${photo.id}/400/300`;
  return (
    <div ref={isLast ? lastPhotoRef : null} className="photo-card">
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
};

const PhotoGrid: React.FC<PhotoGridProps> = ({ photos, lastPhotoRef }) => {
  return (
    <div className="photos-grid">
      {photos.map((photo, index) => (
        <PhotoCard
          key={photo.id}
          photo={photo}
          isLast={photos.length === index + 1}
          lastPhotoRef={lastPhotoRef}
        />
      ))}
    </div>
  );
};

export const PropDrillingInfiniteScroll: React.FC = () => {
  const {
    photos,
    isLoading,
    hasMore,
    error,
    lastPhotoElementRef,
    handleReload,
    fetchPhotos,
    page,
  } = usePropDrillingScrollLogic();

  return (
    <div className="page-container infinite-scroll-page">
      <div className="todos-card-header">
        <div className="todos-header-title">
          <ImageIcon className="todos-title-icon" />
          <h3>Infinite Gallery (Engine 1: Prop Drilling)</h3>
        </div>
        <button onClick={handleReload} className="btn btn-secondary fetch-btn" disabled={isLoading}>
          <RefreshCw className={`fetch-icon ${isLoading && photos.length === 0 ? "spinning" : ""}`} size={16} />
          <span className="btn-text">Reset Gallery</span>
        </button>
      </div>

      <div className="welcome-banner">
        <p className="welcome-text">
          <Sparkles size={16} className="inline-icon" style={{ marginRight: "8px", verticalAlign: "middle" }} />
          This gallery uses prop-drilled refs and handlers with native <code>IntersectionObserver</code>.
        </p>
      </div>

      <PhotoGrid photos={photos} lastPhotoRef={lastPhotoElementRef} />

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
