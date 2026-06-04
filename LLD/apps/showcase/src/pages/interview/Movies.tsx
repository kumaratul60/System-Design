import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Search, Star, Bookmark, BookmarkCheck, Film, ListFilter, RotateCcw } from "lucide-react";

// --- Types & Interfaces ---
export interface Movie {
  id: string;
  title: string;
  category: string;
  rating: number;
  year: number;
  thumbnail: string;
}

export interface UseMoviesParams {
  initialMovies: Movie[];
}

// --- Data Layer: Custom Hook ---
export function useMoviesLogic({ initialMovies }: UseMoviesParams) {
  const [search, setSearch] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"rating" | "year" | "title">("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showBookmarksOnly, setShowBookmarksOnly] = useState<boolean>(false);
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("movie_favorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync bookmarks with LocalStorage
  useEffect(() => {
    localStorage.setItem("movie_favorites", JSON.stringify(bookmarks));
  }, [bookmarks]);

  const toggleBookmark = useCallback((id: string) => {
    setBookmarks((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const categories = useMemo(() => {
    const list = new Set(initialMovies.map((m) => m.category));
    return ["All", ...Array.from(list)];
  }, [initialMovies]);

  const resetFilters = useCallback(() => {
    setSearch("");
    setCategoryFilter("All");
    setSortBy("title");
    setSortOrder("desc");
    setShowBookmarksOnly(false);
  }, []);

  // Compute processed (searched, filtered, sorted) movies
  const processedMovies = useMemo(() => {
    let result = [...initialMovies];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (categoryFilter !== "All") {
      result = result.filter((m) => m.category === categoryFilter);
    }

    // Bookmark filter
    if (showBookmarksOnly) {
      result = result.filter((m) => bookmarks.includes(m.id));
    }

    // Sort operations
    result.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      } else {
        // Numbers sorting
        return sortOrder === "asc"
          ? (aVal as number) - (bVal as number)
          : (bVal as number) - (aVal as number);
      }
    });

    return result;
  }, [initialMovies, search, categoryFilter, showBookmarksOnly, bookmarks, sortBy, sortOrder]);

  return {
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    bookmarks,
    toggleBookmark,
    categories,
    resetFilters,
    processedMovies,
    showBookmarksOnly,
    setShowBookmarksOnly,
  };
}

// --- Dummy Movies Data ---
const MOVIE_DATABASE: Movie[] = [
  {
    id: "m1",
    title: "Inception",
    category: "Sci-Fi",
    rating: 8.8,
    year: 2010,
    thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "m2",
    title: "The Dark Knight",
    category: "Action",
    rating: 9.0,
    year: 2008,
    thumbnail: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "m3",
    title: "Pulp Fiction",
    category: "Crime",
    rating: 8.9,
    year: 1994,
    thumbnail: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "m4",
    title: "Spirited Away",
    category: "Anime",
    rating: 8.6,
    year: 2001,
    thumbnail: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "m5",
    title: "Interstellar",
    category: "Sci-Fi",
    rating: 8.6,
    year: 2014,
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "m6",
    title: "The Godfather",
    category: "Crime",
    rating: 9.2,
    year: 1972,
    thumbnail: "https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "m7",
    title: "Parasite",
    category: "Drama",
    rating: 8.6,
    year: 2019,
    thumbnail: "https://images.unsplash.com/photo-1535498730771-e735b998cd64?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "m8",
    title: "Whiplash",
    category: "Drama",
    rating: 8.5,
    year: 2014,
    thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80",
  },
];

// --- UI Layer: Presentation Component ---
export const Movies: React.FC = () => {
  const {
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    bookmarks,
    toggleBookmark,
    categories,
    resetFilters,
    processedMovies,
    showBookmarksOnly,
    setShowBookmarksOnly,
  } = useMoviesLogic({
    initialMovies: MOVIE_DATABASE,
  });

  return (
    <div className="page-container">
      {/* Header */}
      <div className="todos-card-header">
        <div className="todos-header-title">
          <Film className="todos-title-icon" style={{ color: "var(--text-h)" }} />
          <h3>Cinematic Catalog Explorer</h3>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          background: "var(--input-bg)",
          padding: "16px",
          borderRadius: "var(--border-radius)",
          border: "1px solid var(--border)",
        }}
      >
        {/* Row 1: Search & Bookmarks Toggle */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            width: "100%",
          }}
        >
          <div
            className="sidebar-search"
            style={{
              flexGrow: 1,
              marginBottom: 0,
              background: "var(--card-bg)",
            }}
          >
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search movie by title or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>

          <button
            className={`btn ${showBookmarksOnly ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setShowBookmarksOnly((prev) => !prev)}
            style={{ display: "flex", gap: "8px", alignItems: "center" }}
          >
            {showBookmarksOnly ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            {showBookmarksOnly ? "Showing Favorites" : "Show Favorites Only"}
            <span
              style={{
                marginLeft: "4px",
                padding: "2px 6px",
                background: "var(--border)",
                color: "var(--text-h)",
                fontSize: "0.75rem",
                borderRadius: "10px",
              }}
            >
              {bookmarks.length}
            </span>
          </button>
        </div>

        {/* Row 2: Category, Sort controls */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Category Pills */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
              <ListFilter size={14} /> Genre:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                style={{
                  padding: "4px 12px",
                  borderRadius: "20px",
                  border: "1px solid var(--border)",
                  background: categoryFilter === cat ? "var(--text-h)" : "var(--card-bg)",
                  color: categoryFilter === cat ? "var(--bg)" : "var(--text)",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  transition: "var(--transition)",
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort selection */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <select
              className="select-input"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "rating" | "year" | "title")}
            >
              <option value="title">Sort: Alphabetical</option>
              <option value="rating">Sort: Rating</option>
              <option value="year">Sort: Release Year</option>
            </select>

            <select
              className="select-input"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>

            <button
              className="btn btn-secondary"
              onClick={resetFilters}
              title="Reset Filters"
              style={{ padding: "6px" }}
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Movies Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "24px",
          marginTop: "12px",
        }}
      >
        {processedMovies.length === 0 ? (
          <div
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              padding: "48px",
              border: "1px dashed var(--border)",
              borderRadius: "var(--border-radius)",
              color: "var(--text-muted)",
            }}
          >
            No movies matched your search filters.
          </div>
        ) : (
          processedMovies.map((movie) => {
            const isBookmarked = bookmarks.includes(movie.id);
            return (
              <div
                key={movie.id}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: "var(--border-radius)",
                  overflow: "hidden",
                  background: "var(--card-bg)",
                  display: "flex",
                  flexDirection: "column",
                  transition: "var(--transition)",
                  position: "relative",
                }}
              >
                {/* Film Poster Thumbnail */}
                <div style={{ position: "relative", height: "180px", overflow: "hidden" }}>
                  <img
                    src={movie.thumbnail}
                    alt={movie.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  {/* Category Pill Overlay */}
                  <span
                    style={{
                      position: "absolute",
                      top: "10px",
                      left: "10px",
                      background: "rgba(0,0,0,0.65)",
                      color: "#fff",
                      padding: "2px 8px",
                      borderRadius: "10px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      backdropFilter: "blur(2px)",
                    }}
                  >
                    {movie.category}
                  </span>

                  {/* Bookmark Button Overlay */}
                  <button
                    onClick={() => toggleBookmark(movie.id)}
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      background: isBookmarked ? "var(--success)" : "rgba(0,0,0,0.65)",
                      border: "none",
                      color: "#fff",
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      backdropFilter: "blur(2px)",
                      transition: "var(--transition)",
                    }}
                    title={isBookmarked ? "Remove from Favorites" : "Add to Favorites"}
                  >
                    {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                  </button>
                </div>

                {/* Movie Info */}
                <div
                  style={{
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    flexGrow: 1,
                  }}
                >
                  <h4 style={{ margin: 0, fontSize: "1.05rem", color: "var(--text-h)" }}>
                    {movie.title}
                  </h4>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "auto",
                      fontSize: "0.85rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    <span>Released: {movie.year}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "orange" }}>
                      <Star size={14} fill="currentColor" />
                      <strong>{movie.rating}</strong>
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Movies;
