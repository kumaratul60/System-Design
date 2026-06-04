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

interface ProductCardProps {
  product: Product;
  user: AppUser | null;
  language: string;
  isAdmin: boolean;
  onNavigateToDetail: (id: number) => void;
  onDeleteSimulate: (id: number) => void;
}

interface ProductGridProps {
  products: Product[];
  user: AppUser | null;
  language: string;
  isAdmin: boolean;
  onNavigateToDetail: (id: number) => void;
  onDeleteSimulate: (id: number) => void;
}

// --- Data Layer: Custom Hook ---
export function usePropDrillingProductLogic(user: AppUser | null, language: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("https://dummyjson.com/products?limit=5");
      if (!response.ok) throw new Error("Failed to load products");
      const data = await response.json();
      setProducts(data.products || []);
    } catch {
      setError(translate(language as any, "fetchProductsError"));
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDeleteSimulate = (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const isAdmin = user?.role === "ADMIN";

  return {
    products,
    isLoading,
    error,
    isAdmin,
    fetchProducts,
    handleDeleteSimulate,
  };
}

// --- UI Presentation Components ---

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  language,
  isAdmin,
  onNavigateToDetail,
  onDeleteSimulate,
}) => {
  return (
    <div className="product-card">
      <div onClick={() => onNavigateToDetail(product.id)} className="product-card-clickable-area">
        <img src={product.thumbnail} alt={product.title} className="product-image" />
        <div className="product-info-top">
          <span className="product-category">{product.category}</span>
          <h4 className="product-title" title={product.title}>
            {product.title}
          </h4>
        </div>
      </div>

      <div className="product-card-footer-area">
        <div className="product-footer">
          <span className="product-price">${product.price}</span>

          {isAdmin ? (
            <button
              onClick={() => onDeleteSimulate(product.id)}
              className="todo-delete-btn"
              title={translate(language as any, "deleteButton")}
              aria-label="Delete product"
            >
              <Trash2 size={18} />
            </button>
          ) : (
            <button
              className="todo-delete-btn disabled"
              disabled
              title={translate(language as any, "deleteRestricted")}
              aria-label="Delete product blocked"
            >
              <Lock size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  user,
  language,
  isAdmin,
  onNavigateToDetail,
  onDeleteSimulate,
}) => {
  return (
    <div className="products-grid">
      {products.map((prod) => (
        <ProductCard
          key={prod.id}
          product={prod}
          user={user}
          language={language}
          isAdmin={isAdmin}
          onNavigateToDetail={onNavigateToDetail}
          onDeleteSimulate={onDeleteSimulate}
        />
      ))}
    </div>
  );
};

// Main Component
export const PropDrillingProduct: React.FC<{ user: AppUser | null; language: string }> = ({
  user,
  language,
}) => {
  const navigate = useNavigate();
  const {
    products,
    isLoading,
    error,
    isAdmin,
    fetchProducts,
    handleDeleteSimulate,
  } = usePropDrillingProductLogic(user, language);

  return (
    <div className="page-container products-page">
      <div className="todos-card-header">
        <div className="todos-header-title">
          <ShoppingBag className="todos-title-icon" />
          <h3>Products Catalog (Engine 1: Prop Drilling)</h3>
        </div>
        <button
          onClick={fetchProducts}
          className="btn btn-secondary fetch-btn"
          disabled={isLoading}
        >
          <RefreshCw className={`fetch-icon ${isLoading ? "spinning" : ""}`} size={16} />
          <span className="btn-text">Reset Feed</span>
        </button>
      </div>

      {isLoading ? (
        <div className="loading-state">
          <RefreshCw className="loading-spinner spinning" size={32} />
          <p>{translate(language as any, "loading")}</p>
        </div>
      ) : error ? (
        <div className="empty-state">
          <p className="danger-text">{error}</p>
          <button onClick={fetchProducts} className="btn btn-secondary mt-2">
            Retry Load
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <p>No products found in catalog feed.</p>
        </div>
      ) : (
        <ProductGrid
          products={products}
          user={user}
          language={language}
          isAdmin={isAdmin}
          onNavigateToDetail={(id) => navigate(`/products/${id}`)}
          onDeleteSimulate={handleDeleteSimulate}
        />
      )}
    </div>
  );
};
