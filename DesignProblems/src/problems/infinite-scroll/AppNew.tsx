import React, { useCallback, useEffect, useRef, useState } from 'react';
import './index.css';
import { Product, ProductsResponse } from './types';

export const API_CONFIG = {
  BASE_URL: 'https://dummyjson.com/products',
  PARAM_LIMIT: 'limit',
  PARAM_SKIP: 'skip',
} as const;

export const PAGINATION_CONFIG = {
  PAGE_LIMIT: 10,
  INITIAL_SKIP: 0,
} as const;

export const OBSERVER_CONFIG = {
  ROOT: null, // null defaults to the browser viewport
  ROOT_MARGIN: '150px', // Pre-fetch lookahead buffer (triggers 150px before bottom)
  THRESHOLD: 0.1, // Trigger when 10% of the sentinel enters the observer zone
} as const;

export const UI_CONFIG = {
  LOW_STOCK_THRESHOLD: 10,
  DECIMAL_PLACES_PRICE: 2,
  DECIMAL_PLACES_RATING: 2,
  FALLBACK_IMAGE_URL: 'https://via.placeholder.com/300x200?text=No+Image',
} as const;

export const UI_TEXT = {
  TITLE: 'Infinite Scroll Products Catalog',
  SUBTITLE: 'Powered by native IntersectionObserver with decoupled state architecture.',
  RETRY_BUTTON_LABEL: 'Retry',
  OUT_OF_STOCK_LABEL: 'Out of stock',
  GENERIC_BRAND_LABEL: 'Generic',
  ALL_PRODUCTS_LOADED_LABEL: (count: number) =>
    `🎉 All ${count} products have been loaded. No more data available!`,
  FETCH_ERROR_FALLBACK: 'Failed to fetch products',
} as const;

// ============================================================================
// STATE INTERFACES
// ============================================================================

/**
 * API Request State (Atomic Lifecycle for data, loading, and error)
 */
interface ApiState<T> {
  data: T[];
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// COMPONENT IMPLEMENTATION
// ============================================================================

export const AppNew: React.FC = () => {
  // 1. API Fetching State: keeps data, loading, and error grouped together
  const [apiState, setApiState] = useState<ApiState<Product>>({
    data: [],
    isLoading: false,
    error: null,
  });

  // 2. Decoupled Pagination State: keeps pagination boundaries independent and clean
  const [skipOffset, setSkipOffset] = useState<number>(PAGINATION_CONFIG.INITIAL_SKIP);
  const [hasMoreProducts, setHasMoreProducts] = useState<boolean>(true);
  const [totalProductsCount, setTotalProductsCount] = useState<number | null>(null);

  // 3. Simplified Refs:
  //    - sentinelElementRef: attached to the bottom sentinel <div> for IntersectionObserver
  //    - isFetchingRef: a single synchronous boolean lock to prevent duplicate parallel requests
  const sentinelElementRef = useRef<HTMLDivElement | null>(null);
  const isFetchingRef = useRef<boolean>(false);

  /**
   * Fetches the next chunk of products from the API.
   * Concurrency-guarded to prevent duplicate in-flight requests.
   */
  const fetchProductChunk = useCallback(async (targetSkip: number) => {
    // Guard against duplicate triggers while a request is already in progress
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

      // Update total count
      setTotalProductsCount(responsePayload.total);

      // Increment skip for the next page
      const nextCalculatedSkip = targetSkip + PAGINATION_CONFIG.PAGE_LIMIT;
      setSkipOffset(nextCalculatedSkip);

      // Stop fetching when no more data is available to avoid overfetching
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

  // Initial fetch: call API with limit and skip=0 on initial load
  useEffect(() => {
    fetchProductChunk(PAGINATION_CONFIG.INITIAL_SKIP);
  }, [fetchProductChunk]);

  /**
   * Setup IntersectionObserver:
   * Observes the sentinel element at the bottom of the list.
   * Fires fetchProductChunk when user scrolls close to the bottom.
   */
  useEffect(() => {
    const sentinelTarget = sentinelElementRef.current;
    if (!sentinelTarget || !hasMoreProducts) {
      return;
    }

    const intersectionObserver = new IntersectionObserver(
      (observerEntries) => {
        const firstEntry = observerEntries[0];
        // Check if the sentinel element is intersecting and not currently fetching
        if (firstEntry && firstEntry.isIntersecting && !isFetchingRef.current && hasMoreProducts) {
          fetchProductChunk(skipOffset);
        }
      },
      {
        root: OBSERVER_CONFIG.ROOT,
        rootMargin: OBSERVER_CONFIG.ROOT_MARGIN,
        threshold: OBSERVER_CONFIG.THRESHOLD,
      }
    );

    intersectionObserver.observe(sentinelTarget);

    // Clean up observer on re-render or component unmount
    return () => {
      intersectionObserver.unobserve(sentinelTarget);
      intersectionObserver.disconnect();
    };
  }, [fetchProductChunk, skipOffset, hasMoreProducts]);

  const handleRetryFailedRequest = () => {
    fetchProductChunk(skipOffset);
  };

  return (
    <div className="container">
      {/* Catalog Header with Status Information */}
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

      {/* Error Banner with Retry Action */}
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
            {/* Product Thumbnail & Category */}
            <div className="product-image-wrapper">
              {productItem.category && (
                <span className="category-pill">{productItem.category}</span>
              )}
              <img
                src={
                  productItem.thumbnail || productItem.images?.[0] || UI_CONFIG.FALLBACK_IMAGE_URL
                }
                alt={productItem.title}
                className="product-image"
                loading="lazy"
              />
            </div>

            {/* Product Content Details */}
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

              {/* Price, Discount & Stock Details */}
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

              {/* Extra Product Attributes from Response (Shipping, Warranty, Availability) */}
              {(productItem.availabilityStatus || productItem.shippingInformation) && (
                <div
                  className="product-meta-row"
                  style={{ marginTop: '4px', fontSize: '0.78rem', color: '#656d76' }}
                >
                  {productItem.availabilityStatus && <span>{productItem.availabilityStatus}</span>}
                  {productItem.shippingInformation && (
                    <span>• {productItem.shippingInformation}</span>
                  )}
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

      {/*
        SENTINEL ELEMENT:
        An empty HTML element placed at the bottom of the list.
        IntersectionObserver watches this element to know when the user has scrolled near bottom.
      */}
      {hasMoreProducts && <div ref={sentinelElementRef} className="sentinel" />}

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
        <div className="end-message">{UI_TEXT.ALL_PRODUCTS_LOADED_LABEL(apiState.data.length)}</div>
      )}
    </div>
  );
};
