import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { configureStore, createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Provider, useDispatch, useSelector } from "react-redux";
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

interface ProductSliceState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ProductSliceState = {
  products: [],
  isLoading: false,
  error: null};

// Async Thunk
export const fetchReduxProducts = createAsyncThunk(
  "products/fetchReduxProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("https://dummyjson.com/products?limit=5");
      if (!response.ok) throw new Error("Failed to load products");
      const data = await response.json();
      return data.products || [];
    } catch {
      return rejectWithValue(translate("fetchProductsError"));
    }
  }
);

// Slice
const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    deleteProduct: (state, action) => {
      state.products = state.products.filter((p) => p.id !== action.payload);
    }},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReduxProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReduxProducts.fulfilled, (state, action) => {
        state.products = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchReduxProducts.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      });
  }});

// Configure Store
const localProductStore = configureStore({
  reducer: {
    productsStore: productSlice.reducer}});

type LocalProductRootState = ReturnType<typeof localProductStore.getState>;

// --- Data Layer: Custom Hook ---
export function useReduxProductLogic() {
  const dispatch = useDispatch();
  const products = useSelector((state: LocalProductRootState) => state.productsStore.products);
  const isLoading = useSelector((state: LocalProductRootState) => state.productsStore.isLoading);
  const error = useSelector((state: LocalProductRootState) => state.productsStore.error);

  useEffect(() => {
    if (products.length === 0) {
      dispatch(fetchReduxProducts() as any);
    }
  }, [dispatch, products.length]);

  const handleDelete = (id: number) => {
    dispatch(productSlice.actions.deleteProduct(id));
  };

  const handleReset = () => {
    dispatch(fetchReduxProducts() as any);
  };

  return {
    products,
    isLoading,
    error,
    handleDelete,
    handleReset};
}

// --- UI Presentation Component ---
const ReduxProductInner: React.FC<{ user: AppUser | null }> = ({
  user}) => {
  const navigate = useNavigate();
  const { products, isLoading, error, handleDelete, handleReset } = useReduxProductLogic();
  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="page-container products-page">
      <div className="todos-card-header">
        <div className="todos-header-title">
          <ShoppingBag className="todos-title-icon" />
          <h3>Products Catalog (Engine 6: Redux Toolkit)</h3>
                    <a
            href={`https://github.com/kumaratul60/System-Design/blob/main/LLD/apps/showcase/src/pages/wired/products/ReduxProduct.tsx`}
            target="_blank"
            rel="noopener noreferrer"
            title={translate("viewSource")}
            className="challenge-code-link-header"
            style={{ marginLeft: "auto", color: "var(--text-muted)", display: "flex", alignItems: "center", transition: "color 0.2s" }}
          >
            <Code size={20} />
          </a>
        </div>
        <button onClick={handleReset} className="btn btn-secondary fetch-btn" disabled={isLoading}>
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
          <button onClick={handleReset} className="btn btn-secondary mt-2">
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
                      onClick={() => handleDelete(prod.id)}
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

export const ReduxProduct: React.FC<{ user: AppUser | null }> = ({
  user}) => {
  return (
    <Provider store={localProductStore}>
      <ReduxProductInner user={user} />
    </Provider>
  );
};
