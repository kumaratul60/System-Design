import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { create } from "zustand";
import { translate } from "@statelab/theme";
import { Trash2, Lock, ShoppingBag, RefreshCw, Code} from "lucide-react";
import type { AppUser } from "@statelab/state-engines";

// --- Types & Interfaces ---
interface Product {
  id: number;
  title: string;
  category: string;
  price: number;
  thumbnail: string;
}

interface ProductState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  deleteProduct: (id: number) => void;
}

// --- Local Zustand Store ---
const useLocalProductStore = create<ProductState>((set) => ({
  products: [],
  isLoading: false,
  error: null,
  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("https://dummyjson.com/products?limit=5");
      if (!response.ok) throw new Error("Failed to load products");
      const data = await response.json();
      set({ products: data.products || [] });
    } catch {
      set({ error: translate("fetchProductsError") });
    } finally {
      set({ isLoading: false });
    }
  },
  deleteProduct: (id: number) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== id)}))}));

// --- Data Layer: Custom Hook ---
export function useZustandProductLogic() {
  const products = useLocalProductStore((state) => state.products);
  const isLoading = useLocalProductStore((state) => state.isLoading);
  const error = useLocalProductStore((state) => state.error);
  const fetchProducts = useLocalProductStore((state) => state.fetchProducts);
  const deleteProduct = useLocalProductStore((state) => state.deleteProduct);

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, [fetchProducts, products.length]);

  return {
    products,
    isLoading,
    error,
    fetchProducts,
    deleteProduct};
}

// --- UI Presentation Component ---
export const ZustandProduct: React.FC<{ user: AppUser | null }> = ({
  user}) => {
  const navigate = useNavigate();
  const { products, isLoading, error, fetchProducts, deleteProduct } = useZustandProductLogic();
  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="page-container products-page">
      <div className="todos-card-header">
        <div className="todos-header-title">
          <ShoppingBag className="todos-title-icon" />
          <h3>Products Catalog (Engine 5: Zustand Store)</h3>
                    <a
            href={`https://github.com/kumaratul60/System-Design/blob/main/LLD/apps/showcase/src/pages/wired/products/ZustandProduct.tsx`}
            target="_blank"
            rel="noopener noreferrer"
            title={translate("viewSource")}
            className="challenge-code-link-header"
            style={{ marginLeft: "auto", color: "var(--text-muted)", display: "flex", alignItems: "center", transition: "color 0.2s" }}
          >
            <Code size={20} />
          </a>
        </div>
        <button onClick={() => fetchProducts()} className="btn btn-secondary fetch-btn" disabled={isLoading}>
          <RefreshCw className={`fetch-icon ${isLoading ? "spinning" : ""}`} size={16} />
          <span className="btn-text">Reset Feed</span>
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
          <button onClick={() => fetchProducts()} className="btn btn-secondary mt-2">
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
                      onClick={() => deleteProduct(prod.id)}
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
