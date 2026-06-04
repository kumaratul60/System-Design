import React, { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createMachine, assign } from "xstate";
import { useMachine } from "@xstate/react";
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

// --- Machine Config ---
const productMachine = createMachine({
  id: "products",
  initial: "idle",
  context: {
    products: [] as Product[],
    error: null as string | null,
  },
  states: {
    idle: {
      on: {
        FETCH: { target: "fetching" },
        DELETE: {
          actions: assign({
            products: ({ context, event }) => {
              const e = event as unknown as { id: number };
              return context.products.filter((p) => p.id !== e.id);
            },
          }),
        },
      },
    },
    fetching: {
      on: {
        FETCH_SUCCESS: {
          target: "idle",
          actions: assign({
            products: ({ event }) => (event as unknown as { products: Product[] }).products,
            error: null,
          }),
        },
        FETCH_FAILURE: {
          target: "idle",
          actions: assign({
            error: ({ event }) => (event as unknown as { error: string }).error,
          }),
        },
      },
    },
  },
});

// --- Data Layer: Custom Hook ---
export function useXStateProductLogic(language: string) {
  const [state, send] = useMachine(productMachine);
  const { products, error } = state.context;
  const isLoading = state.matches("fetching");

  const loadProducts = useCallback(async () => {
    send({ type: "FETCH" });
    try {
      const response = await fetch("https://dummyjson.com/products?limit=5");
      if (!response.ok) throw new Error("Failed to load products");
      const data = await response.json();
      send({ type: "FETCH_SUCCESS", products: data.products || [] });
    } catch {
      send({ type: "FETCH_FAILURE", error: translate(language as any, "fetchProductsError") });
    }
  }, [send, language]);

  useEffect(() => {
    if (products.length === 0) {
      loadProducts();
    }
  }, [loadProducts, products.length]);

  const deleteProduct = (id: number) => {
    send({ type: "DELETE", id });
  };

  return {
    products,
    isLoading,
    error,
    loadProducts,
    deleteProduct,
  };
}

// --- UI Presentation Component ---
export const XStateProduct: React.FC<{ user: AppUser | null; language: string }> = ({
  user,
  language,
}) => {
  const navigate = useNavigate();
  const { products, isLoading, error, loadProducts, deleteProduct } = useXStateProductLogic(language);
  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="page-container products-page">
      <div className="todos-card-header">
        <div className="todos-header-title">
          <ShoppingBag className="todos-title-icon" />
          <h3>Products Catalog (Engine 4: XState Machine)</h3>
        </div>
        <button onClick={loadProducts} className="btn btn-secondary fetch-btn" disabled={isLoading}>
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
          <button onClick={loadProducts} className="btn btn-secondary mt-2">
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
          ))}
        </div>
      )}
    </div>
  );
};
