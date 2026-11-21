import React, { useCallback, useEffect, useRef, useState } from 'react';
import './index.css';
import { Product, ProductsResponse } from './types';

// ============================================================================
// CONSTANTS CONFIGURATION
// ============================================================================

export const API_CONFIG = {
  BASE_URL: 'https://dummyjson.com/products',
  PARAM_LIMIT: 'limit',
  PARAM_SKIP: 'skip',
} as const;

export const PAGINATION_CONFIG = {
  PAGE_LIMIT: 10,
  INITIAL_SKIP: 0,
} as const;

/**
 * ============================================================================
 * ALTERNATIVE APPROACH: WINDOW SCROLL LISTENER (window.scrollY + window.innerHeight)
 *
 * HOW IT WORKS:
 * 1. Instead of an IntersectionObserver watching a DOM element, we listen directly
 *    to the global window scroll event:
 *    window.addEventListener('scroll', handleScroll, { passive: true });
 *
 * 2. MATHEMATICAL CALCULATION FOR BOTTOM DETECTION:
 *    - `window.innerHeight`: The height of the visible browser window (viewport).
 *    - `window.scrollY`: The vertical distance (in pixels) the user has scrolled from top.
 *    - `document.documentElement.offsetHeight`: The entire scrollable height of the webpage.
 *    - FORMULA:
 *      currentScrollPosition = window.innerHeight + window.scrollY;
 *      isNearBottom = currentScrollPosition >= documentTotalHeight - BOTTOM_OFFSET_PX;
 *
 * 3. WHY A BUFFER (BOTTOM_OFFSET_PX = 200) IS USED:
 *    If we waited until `currentScrollPosition === documentTotalHeight`, the user would
 *    hit an abrupt stop at the very end of the page before the next chunk loads.
 *    By subtracting a buffer (e.g., 200px), we trigger the fetch just before reaching bottom!
 *
 * 4. PERFORMANCE CONSIDERATION (Throttling / requestAnimationFrame):
 *    Scroll events fire dozens of times per second. To prevent UI lag and CPU spikes,
 *    we throttle scroll handling using `requestAnimationFrame` and a boolean lock.
 *
 * 5. COMPARISON:
 *    - IntersectionObserver: Modern, runs off the main thread, zero scroll event overhead.
 *    - Window Scroll Listener: Traditional/legacy, supported on all older browsers, but
 *      requires manual event listening, debouncing/throttling, and cleanup.
 * ============================================================================
 */
export const WINDOW_SCROLL_CONFIG = {
  BOTTOM_OFFSET_PX: 200, // Distance from bottom (in px) to pre-trigger loading
} as const;

export const UI_CONFIG = {
  LOW_STOCK_THRESHOLD: 10,
  DECIMAL_PLACES_PRICE: 2,
  DECIMAL_PLACES_RATING: 2,
  FALLBACK_IMAGE_URL: 'https://via.placeholder.com/300x200?text=No+Image',
} as const;

export const UI_TEXT = {
  TITLE: 'Infinite Scroll Products (Window Scroll Approach)',
  SUBTITLE: 'Implemented using window.scrollY + window.innerHeight event calculations.',
  RETRY_BUTTON_LABEL: 'Retry',
  OUT_OF_STOCK_LABEL: 'Out of stock',
  GENERIC_BRAND_LABEL: 'Generic',
  ALL_PRODUCTS_LOADED_LABEL: (count: number) =>
    `🎉 All ${count} products have been loaded via Window Scroll! No more data available.`,
  FETCH_ERROR_FALLBACK: 'Failed to fetch products',
} as const;

interface ApiState<T> {
  data: T[];
  isLoading: boolean;
  error: string | null;
}

export const AppWindowScroll: React.FC = () => {
  // 1. Decoupled API State
  const [apiState, setApiState] = useState<ApiState<Product>>({
    data: [],
    isLoading: false,
    error: null,
  });

  // 2. Decoupled Pagination State
  const [skipOffset, setSkipOffset] = useState<number>(PAGINATION_CONFIG.INITIAL_SKIP);
  const [hasMoreProducts, setHasMoreProducts] = useState<boolean>(true);
  const [totalProductsCount, setTotalProductsCount] = useState<number | null>(null);

  // 3. Concurrency Lock & Throttling
  const isFetchingRef = useRef<boolean>(false);
  const isScrollThrottledRef = useRef<boolean>(false);

  /**
   * Fetches product chunk by offset
   */
  const fetchProductChunk = useCallback(async (targetSkip: number) => {
    if (isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;
    setApiState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const requestUrl = `${API_CONFIG.BASE_URL}?${API_CONFIG.PARAM_LIMIT}=${PAGINATION_CONFIG.PAGE_LIMIT}&${API_CONFIG.PARAM_SKIP}=${targetSkip}`;
      const response = await fetch(requestUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responsePayload: ProductsResponse = await response.json();
      const incomingProducts = responsePayload.products;

      // Append new data to existing loaded data without removing existing items
      setApiState((prev) => ({
        ...prev,
        data: [...prev.data, ...incomingProducts],
        isLoading: false,
        error: null,
      }));

      setTotalProductsCount(responsePayload.total);

      const nextCalculatedSkip = targetSkip + PAGINATION_CONFIG.PAGE_LIMIT;
      setSkipOffset(nextCalculatedSkip);

      const reachedEnd =
        nextCalculatedSkip >= responsePayload.total || incomingProducts.length === 0;

      if (reachedEnd) {
        setHasMoreProducts(false);
      }
    } catch (err) {
      setApiState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : UI_TEXT.FETCH_ERROR_FALLBACK,
      }));
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  // Initial fetch: call API with limit and skip=0
  useEffect(() => {
    fetchProductChunk(PAGINATION_CONFIG.INITIAL_SKIP);
  }, [fetchProductChunk]);

  /**
   * Window Scroll Event Listener:
   * Calculates window.innerHeight + window.scrollY to check proximity to bottom of document.
   */
  useEffect(() => {
    if (!hasMoreProducts) {
      return;
    }

    const handleWindowScroll = () => {
      // Throttle using requestAnimationFrame to prevent event flooding
      if (isScrollThrottledRef.current) {
        return;
      }

      isScrollThrottledRef.current = true;
      requestAnimationFrame(() => {
        // Calculate current scroll position vs total document height
        const currentViewportBottom = window.innerHeight + window.scrollY;
        const totalDocumentHeight = document.documentElement.offsetHeight;
        const bottomTriggerPoint = totalDocumentHeight - WINDOW_SCROLL_CONFIG.BOTTOM_OFFSET_PX;

        // Check if user has scrolled past the trigger threshold
        const isNearBottom = currentViewportBottom >= bottomTriggerPoint;

        if (isNearBottom && !isFetchingRef.current && hasMoreProducts) {
          fetchProductChunk(skipOffset);
        }

        isScrollThrottledRef.current = false;
      });
    };

    // Attach passive listener for better scroll performance
    window.addEventListener('scroll', handleWindowScroll, { passive: true });

    // Clean up listener on re-render or component unmount
    return () => {
      window.removeEventListener('scroll', handleWindowScroll);
    };
  }, [fetchProductChunk, skipOffset, hasMoreProducts]);

  const handleRetryFailedRequest = () => {
    fetchProductChunk(skipOffset);
  };

  return (
    <div className="container">
      {/* Header with status badges */}
      <header className="app-header">
        <div className="header-title-row">
          <h1 className="app-title">{UI_TEXT.TITLE}</h1>
          <div className="status-badges">
            <span className="badge badge-info">
              Loaded: {apiState.data.length}
              {totalProductsCount !== null ? ` / ${totalProductsCount}` : ''}
            </span>
            <span className="badge badge-neutral">Limit: {PAGINATION_CONFIG.PAGE_LIMIT}</span>
            <span className="badge badge-neutral">Next Skip: {skipOffset}</span>
          </div>
        </div>
        <p className="header-description">{UI_TEXT.SUBTITLE}</p>
      </header>

      {/* Error Banner */}
      {apiState.error && (
        <div className="error-banner">
          <span>Error: {apiState.error}</span>
          <button className="retry-button" onClick={handleRetryFailedRequest}>
            {UI_TEXT.RETRY_BUTTON_LABEL}
          </button>
        </div>
      )}

      {/* Main Product Cards Grid */}
      <main className="product-grid">
        {apiState.data.map((productItem) => (
          <article key={productItem.id} className="product-card">
            <div className="product-image-wrapper">
              {productItem.category && (
                <span className="category-pill">{productItem.category}</span>
              )}
              <img
                src={
                  productItem.thumbnail ||
                  productItem.images?.[0] ||
                  UI_CONFIG.FALLBACK_IMAGE_URL
                }
                alt={productItem.title}
                className="product-image"
                loading="lazy"
              />
            </div>

            <div className="product-content">
              <div className="product-meta-row">
                <span className="product-brand">
                  {productItem.brand || UI_TEXT.GENERIC_BRAND_LABEL}
                </span>
                <span className="product-rating">
                  ★ {productItem.rating.toFixed(UI_CONFIG.DECIMAL_PLACES_RATING)}
                </span>
              </div>

              <h2 className="product-title">{productItem.title}</h2>
              <p className="product-description">{productItem.description}</p>

              <div className="price-stock-row">
                <div className="price-group">
                  <span className="price">
                    ${productItem.price.toFixed(UI_CONFIG.DECIMAL_PLACES_PRICE)}
                  </span>
                  {productItem.discountPercentage > 0 && (
                    <span className="discount">{productItem.discountPercentage}% OFF</span>
                  )}
                </div>
                <span
                  className={`stock-status ${
                    productItem.stock <= UI_CONFIG.LOW_STOCK_THRESHOLD ? 'low' : ''
                  }`}
                >
                  {productItem.stock > 0
                    ? `${productItem.stock} in stock`
                    : UI_TEXT.OUT_OF_STOCK_LABEL}
                </span>
              </div>

              {/* Extra Product Attributes */}
              {(productItem.availabilityStatus || productItem.shippingInformation) && (
                <div className="product-meta-row" style={{ marginTop: '4px', fontSize: '0.78rem', color: '#656d76' }}>
                  {productItem.availabilityStatus && <span>{productItem.availabilityStatus}</span>}
                  {productItem.shippingInformation && <span>• {productItem.shippingInformation}</span>}
                </div>
              )}

              {/* Product Tags */}
              {productItem.tags && productItem.tags.length > 0 && (
                <div className="tags-row">
                  {productItem.tags.map((tagItem, tagIndex) => (
                    <span key={tagIndex} className="tag-badge">
                      #{tagItem}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </article>
        ))}
      </main>

      {/* Loading Indicator Spinner */}
      {apiState.isLoading && (
        <div className="loading-container">
          <div className="spinner" />
          <p className="loading-text">
            Loading chunk (skip: {skipOffset}, limit: {PAGINATION_CONFIG.PAGE_LIMIT})...
          </p>
        </div>
      )}

      {/* End of Catalog Message */}
      {!hasMoreProducts && (
        <div className="end-message">
          {UI_TEXT.ALL_PRODUCTS_LOADED_LABEL(apiState.data.length)}
        </div>
      )}
    </div>
  );
};
