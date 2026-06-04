import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Minus, Plus, CreditCard, RefreshCw } from "lucide-react";

interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  thumbnail: string;
}

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://dummyjson.com/products/${id}`);
      if (!response.ok) throw new Error("Product not found");
      const data: Product = await response.json();
      setProduct(data);
    } catch {
      setError("Failed to load product details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleIncrement = () => setQuantity((q) => q + 1);
  const handleDecrement = () => setQuantity((q) => Math.max(1, q - 1));

  const handleCheckout = () => {
    if (!product) return;
    navigate("/checkout", { state: { product, quantity } });
  };

  if (isLoading) {
    return (
      <div className="page-container loading-state">
        <RefreshCw className="loading-spinner spinning" size={32} />
        <p>Fetching product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="page-container empty-state">
        <p className="danger-text">{error || "Product not found."}</p>
        <button onClick={() => navigate("/products")} className="btn btn-secondary mt-4">
          <ArrowLeft size={16} />
          <span>Back to Products</span>
        </button>
      </div>
    );
  }

  const subtotal = product.price * quantity;

  return (
    <div className="page-container product-detail-page">
      <div className="todos-card-header">
        <button onClick={() => navigate("/products")} className="btn btn-secondary back-btn">
          <ArrowLeft size={16} />
          <span className="btn-text">Back to Products</span>
        </button>
      </div>

      <div className="product-detail-card">
        <div className="product-detail-layout">
          <div className="product-detail-image-container">
            <img src={product.thumbnail} alt={product.title} className="product-detail-image" />
          </div>
          
          <div className="product-detail-info">
            <span className="product-category">{product.category}</span>
            <h2 className="product-detail-title">{product.title}</h2>
            <p className="product-detail-desc">{product.description}</p>
            
            <div className="product-detail-pricing">
              <span className="pricing-label">Price per unit:</span>
              <span className="product-price">${product.price}</span>
            </div>

            <div className="quantity-selector-section">
              <span className="pricing-label">Quantity:</span>
              <div className="qty-counter">
                <button onClick={handleDecrement} className="qty-btn" aria-label="Decrease quantity">
                  <Minus size={16} />
                </button>
                <span className="qty-val">{quantity}</span>
                <button onClick={handleIncrement} className="qty-btn" aria-label="Increase quantity">
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="product-detail-total">
              <span className="pricing-label">Subtotal:</span>
              <span className="detail-subtotal-price">${subtotal}</span>
            </div>

            <button onClick={handleCheckout} className="btn btn-primary checkout-btn-detail">
              <CreditCard size={18} />
              <span>Proceed to Checkout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
