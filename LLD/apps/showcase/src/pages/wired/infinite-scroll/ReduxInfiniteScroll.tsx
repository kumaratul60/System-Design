import React, { useEffect, useRef, useCallback } from "react";
import { configureStore, createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Provider, useDispatch, useSelector } from "react-redux";
import { Sparkles, RefreshCw, ExternalLink, Image as ImageIcon } from "lucide-react";

interface Photo {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
}

interface GallerySliceState {
  photos: Photo[];
  page: number;
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
}

const initialState: GallerySliceState = {
  photos: [],
  page: 1,
  isLoading: false,
  hasMore: true,
  error: null,
};

// Async Thunk
export const fetchGalleryPhotos = createAsyncThunk(
  "gallery/fetchPhotos",
  async (pageNumber: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`https://picsum.photos/v2/list?page=${pageNumber}&limit=12`);
      if (!response.ok) throw new Error("Failed to load photos");
      return await response.json() as Photo[];
    } catch {
      return rejectWithValue("Unable to connect to the photo API. Please try again.");
    }
  }
);

// Slice
const gallerySlice = createSlice({
  name: "gallery",
  initialState,
  reducers: {
    incrementPage: (state) => {
      state.page += 1;
    },
    resetGallery: (state) => {
      state.photos = [];
      state.page = 1;
      state.hasMore = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGalleryPhotos.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGalleryPhotos.fulfilled, (state, action) => {
        const incoming = action.payload;
        const existingIds = new Set(state.photos.map((p) => p.id));
        const unique = incoming.filter((p) => !existingIds.has(p.id));
        state.photos = [...state.photos, ...unique];
        state.hasMore = incoming.length === 12;
        state.isLoading = false;
      })
      .addCase(fetchGalleryPhotos.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      });
  },
});

// Configure Store
const localGalleryStore = configureStore({
  reducer: {
    galleryStore: gallerySlice.reducer,
  },
});

type LocalGalleryRootState = ReturnType<typeof localGalleryStore.getState>;

// --- Data Layer: Custom Hook ---
export function useReduxGalleryLogic() {
  const dispatch = useDispatch();
  const photos = useSelector((state: LocalGalleryRootState) => state.galleryStore.photos);
  const page = useSelector((state: LocalGalleryRootState) => state.galleryStore.page);
  const isLoading = useSelector((state: LocalGalleryRootState) => state.galleryStore.isLoading);
  const hasMore = useSelector((state: LocalGalleryRootState) => state.galleryStore.hasMore);
  const error = useSelector((state: LocalGalleryRootState) => state.galleryStore.error);

  useEffect(() => {
    if (photos.length === 0) {
      dispatch(fetchGalleryPhotos(1) as any);
    }
  }, [dispatch, photos.length]);

  const handleNextPage = () => {
    dispatch(gallerySlice.actions.incrementPage());
    dispatch(fetchGalleryPhotos(page + 1) as any);
  };

  const handleReset = () => {
    dispatch(gallerySlice.actions.resetGallery());
    dispatch(fetchGalleryPhotos(1) as any);
  };

  return {
    photos,
    page,
    isLoading,
    hasMore,
    error,
    handleNextPage,
    handleReset,
  };
}

// --- UI Presentation Component ---
const ReduxInfiniteScrollInner: React.FC = () => {
  const dispatch = useDispatch();
  const {
    photos,
    page,
    isLoading,
    hasMore,
    error,
    handleNextPage,
    handleReset,
  } = useReduxGalleryLogic();

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
          <h3>Infinite Gallery (Engine 6: Redux Toolkit)</h3>
        </div>
        <button onClick={handleReset} className="btn btn-secondary fetch-btn" disabled={isLoading}>
          <RefreshCw className={`fetch-icon ${isLoading && photos.length === 0 ? "spinning" : ""}`} size={16} />
          <span className="btn-text">Reset Gallery</span>
        </button>
      </div>

      <div className="welcome-banner">
        <p className="welcome-text">
          <Sparkles size={16} className="inline-icon" style={{ marginRight: "8px", verticalAlign: "middle" }} />
          This gallery dispatches actions and updates the store using a local Redux slice configuration.
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
          <button onClick={() => dispatch(fetchGalleryPhotos(page) as any)} className="btn btn-secondary mt-2">
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

export const ReduxInfiniteScroll: React.FC = () => {
  return (
    <Provider store={localGalleryStore}>
      <ReduxInfiniteScrollInner />
    </Provider>
  );
};
