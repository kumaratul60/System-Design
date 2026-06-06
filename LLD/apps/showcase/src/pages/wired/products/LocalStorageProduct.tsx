import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { translate } from "@statelab/theme";
import { Trash2, Lock, ShoppingBag, RefreshCw } from "lucide-react";
import type { AppUser } from "@statelab/state-engines";

// --- Types & Interfaces ---
interface Product {
  id: number;
  title: string;
  category: string;
  price: number;
  thumbnail: string;
}

// --- Data Layer: Custom Hook ---
export function useLocalStorageProductLogic(user: AppUser | null) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync deleted items via localStorage keys
  const [deletedIds, setDeletedIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem("lld_deleted_products");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Watch for storage changes across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "lld_deleted_products") {
        try {
          setDeletedIds(e.newValue ? JSON.parse(e.newValue) : []);
        } catch (err) {
          console.warn("Failed to parse synced deleted products:", err);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("https://dummyjson.com/products?limit=5");
      if (!response.ok) throw new Error("Failed to load products");
      const data = await response.json();
      setProducts(data.products || []);
    } catch {
      setError(translate("fetchProductsError"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDeleteSimulate = useCallback((id: number) => {
    setDeletedIds((prev) => {
      const next = [...prev, id];
      localStorage.setItem("lld_deleted_products", JSON.stringify(next));
      return next;
    });
  }, []);

  const resetCatalog = useCallback(() => {
    localStorage.removeItem("lld_deleted_products");
    setDeletedIds([]);
    fetchProducts();
  }, [fetchProducts]);

  const visibleProducts = products.filter((p) => !deletedIds.includes(p.id));
  const isAdmin = user?.role === "ADMIN";

  return {
    products: visibleProducts,
    isLoading,
    error,
    isAdmin,
    handleDeleteSimulate,
    resetCatalog,
  };
}

// --- UI Presentation Component ---
export const LocalStorageProduct: React.FC<{ user: AppUser | null }> = ({
  user,
}) => {
  const navigate = useNavigate();
  const {
    products,
    isLoading,
    error,
    isAdmin,
    handleDeleteSimulate,
    resetCatalog,
  } = useLocalStorageProductLogic(user);

  return (
    <div className="page-container products-page">
      <div className="todos-card-header">
        <div className="todos-header-title">
          <ShoppingBag className="todos-title-icon" />
          <h3>Products Catalog (Engine 2: LocalStorage Sync)</h3>
        </div>
        <button onClick={resetCatalog} className="btn btn-secondary fetch-btn" disabled={isLoading}>
          <RefreshCw className={`fetch-icon ${isLoading ? "spinning" : ""}`} size={16} />
          <span className="btn-text">Reset Feed & Storage</span>
        </button>
      </div>

      {isLoading ? (
        <div className="loading-state">
          <RefreshCw className="loading-spinner spinning" size={32} />
          <p>{translate("loading")}</p>
        </div>
      ) : error ? (
        <div className="empty-state">
          <p className="danger-text">{error}</p>
          <button onClick={resetCatalog} className="btn btn-secondary mt-2">
            Retry Load
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <p>No products found in catalog feed.</p>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((prod) => (
            <div key={prod.id} className="product-card">
              <div onClick={() => navigate(`/products/${prod.id}`)} className="product-card-clickable-area">
                <img src={prod.thumbnail} alt={prod.title} className="product-image" />
                <div className="product-info-top">
                  <span className="product-category">{prod.category}</span>
                  <h4 className="product-title" title={prod.title}>
                    {prod.title}
                  </h4>
                </div>
              </div>

              <div className="product-card-footer-area">
                <div className="product-footer">
                  <span className="product-price">${prod.price}</span>

                  {isAdmin ? (
                    <button
                      onClick={() => handleDeleteSimulate(prod.id)}
                      className="todo-delete-btn"
                      title={translate("deleteButton")}
                      aria-label="Delete product"
                    >
                      <Trash2 size={18} />
                    </button>
                  ) : (
                    <button
                      className="todo-delete-btn disabled"
                      disabled
                      title={translate("deleteRestricted")}
                      aria-label="Delete product blocked"
                    >
                      <Lock size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
