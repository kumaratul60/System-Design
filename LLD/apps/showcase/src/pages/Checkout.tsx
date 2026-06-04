import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ShoppingBag, Truck } from "lucide-react";

interface CheckoutState {
  product: {
    id: number;
    title: string;
    price: number;
    thumbnail: string;
  };
  quantity: number;
}

export const Checkout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as CheckoutState | null;

  const [isOrdered, setIsOrdered] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");

  if (!state || !state.product) {
    return (
      <div className="page-container empty-state">
        <p>No items in checkout. Please select a product first.</p>
        <button onClick={() => navigate("/products")} className="btn btn-secondary mt-4">
          <ArrowLeft size={16} />
          <span>Go to Products Catalog</span>
        </button>
      </div>
    );
  }

  const { product, quantity } = state;
  const subtotal = product.price * quantity;
  const shipping = subtotal > 100 ? 0 : 15;
  const tax = Math.round(subtotal * 0.08 * 100) / 100; // 8% tax
  const total = subtotal + shipping + tax;

  const handlePlaceOrder = () => {
    // Generate random order ID
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const randomChars = Array.from({ length: 3 }, () =>
      String.fromCharCode(65 + Math.floor(Math.random() * 26))
    ).join("");
    const generatedId = `ORD-${randomDigits}-${randomChars}`;

    // Generate delivery date (current date + 3 days)
    const date = new Date();
    date.setDate(date.getDate() + 3);
    const options: Intl.DateTimeFormatOptions = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    const dateStr = date.toLocaleDateString("en-US", options);

    setOrderId(generatedId);
    setDeliveryDate(dateStr);
    setIsOrdered(true);
  };

  if (isOrdered) {
    return (
      <div className="page-container order-success-page">
        <div className="success-card">
          <div className="success-icon-wrapper">
            <CheckCircle2 className="success-icon animate-bounce" size={48} />
          </div>
          <h2 className="success-title">Order Placed Successfully!</h2>
          <p className="success-message">
            Thank you for your purchase. Your order has been dispatched and is on its way to you.
          </p>

          <div className="order-details-box">
            <div className="detail-row">
              <span className="detail-label">Order ID:</span>
              <span className="order-id-badge">{orderId}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Carrier Status:</span>
              <span className="dispatched-label">Dispatched (Transit)</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Estimated Delivery:</span>
              <span className="delivery-date-text">{deliveryDate}</span>
            </div>
          </div>

          <div className="success-actions">
            <button onClick={() => navigate("/products")} className="btn btn-primary shop-btn">
              <ShoppingBag size={18} />
              <span>Continue Shopping</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container checkout-page">
      <div className="todos-card-header">
        <button onClick={() => navigate(`/products/${product.id}`)} className="btn btn-secondary back-btn">
          <ArrowLeft size={16} />
          <span className="btn-text">Back to Details</span>
        </button>
        <h3>Secure Checkout</h3>
      </div>

      <div className="checkout-layout">
        <div className="checkout-main">
          <h4 className="section-title">Order Summary</h4>
          <div className="summary-item-card">
            <img src={product.thumbnail} alt={product.title} className="summary-thumbnail" />
            <div className="summary-item-info">
              <h5 className="summary-item-title">{product.title}</h5>
              <div className="summary-item-meta">
                <span>Unit Price: ${product.price}</span>
                <span>Qty: {quantity}</span>
              </div>
            </div>
            <div className="summary-item-price">${subtotal}</div>
          </div>

          <div className="delivery-info-banner">
            <Truck size={18} className="banner-truck-icon" />
            <p>
              Free delivery on orders over $100. Standard shipping rates apply otherwise.
            </p>
          </div>
        </div>

        <div className="checkout-sidebar">
          <h4 className="section-title">Payment Summary</h4>
          <div className="pricing-table">
            <div className="pricing-row">
              <span>Subtotal:</span>
              <span>${subtotal}</span>
            </div>
            <div className="pricing-row">
              <span>Estimated Shipping:</span>
              <span>{shipping === 0 ? "FREE" : `$${shipping}`}</span>
            </div>
            <div className="pricing-row">
              <span>Tax (8%):</span>
              <span>${tax}</span>
            </div>
            <div className="pricing-row divider"></div>
            <div className="pricing-row total">
              <span>Total Amount:</span>
              <span>${total}</span>
            </div>
          </div>

          <button onClick={handlePlaceOrder} className="btn btn-primary place-order-btn">
            Place Order (${total})
          </button>
        </div>
      </div>
    </div>
  );
};
