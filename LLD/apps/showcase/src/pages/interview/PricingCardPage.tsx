import React, { useState } from "react";
import { translate } from "@statelab/theme";
import { DollarSign, Check, Code} from "lucide-react";

export const PricingCardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"basic" | "mid" | "advance">("basic");

  // ==========================================
  // --- BASIC TAB (Standard 3 Cards) ---------
  // ==========================================
  const basicPlans = [
    { name: "Starter", price: 0, desc: "For single developers building sandboxes.", features: ["Single workspace", "Basic State Enginer templates", "Community Discord access"] },
    { name: "Pro Lab", price: 29, desc: "For professional teams looking for LLD assets.", features: ["Unlimited workspace designs", "All 6 State Management engines", "API mockup server access", "Email support"] },
    { name: "Enterprise", price: 99, desc: "Custom scale distributed architectures.", features: ["Strict Portal security layers", "High-performance virtualization lists", "24/7 Dedicated zoom developer review", "SLA contract bounds"] },
  ];

  // ==========================================
  // --- MID TAB (Billing Cycle Toggle) -------
  // ==========================================
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  
  const midPlans = [
    { name: "Starter", price: 0, desc: "For single developers.", features: ["Single workspace", "Core engines"] },
    { name: "Pro Lab", price: billingCycle === "monthly" ? 29 : 22, desc: "For teams.", features: ["Unlimited templates", "All state engines", "Priority help"] },
    { name: "Enterprise", price: billingCycle === "monthly" ? 99 : 79, desc: "Enterprise scale.", features: ["Virtualized widgets", "Custom SMTP mocks", "Dedicated help"] },
  ];

  // ==========================================
  // --- ADVANCE TAB (Dynamic Tier Slider) ----
  // ==========================================
  const [userCount, setUserCount] = useState(5);
  const [storageGB, setStorageGB] = useState(10);
  const [currency, setCurrency] = useState<"USD" | "EUR" | "INR">("USD");

  const currencySymbols = { USD: "$", EUR: "€", INR: "₹" };
  const currencyRates = { USD: 1, EUR: 0.92, INR: 83 };

  // Calculate pricing based on users and storage
  const calculatePlanCost = (basePrice: number, costPerUser: number, costPerGB: number) => {
    const rawCost = basePrice + (userCount * costPerUser) + (storageGB * costPerGB);
    const converted = rawCost * currencyRates[currency];
    return Math.round(converted);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="todos-card-header" style={{ marginBottom: "20px" }}>
        <div className="todos-header-title">
          <DollarSign className="todos-title-icon" style={{ color: "var(--text-h)" }} />
          <h3>Product Subscription Pricing</h3>
                    <a
            href={`https://github.com/kumaratul60/System-Design/blob/main/LLD/apps/showcase/src/pages/interview/PricingCardPage.tsx`}
            target="_blank"
            rel="noopener noreferrer"
            title={translate("viewSource")}
            className="challenge-code-link-header"
            style={{ marginLeft: "auto", color: "var(--text-muted)", display: "flex", alignItems: "center", transition: "color 0.2s" }}
          >
            <Code size={20} />
          </a>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
        <button
          className={`btn ${activeTab === "basic" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("basic")}
        >
          Basic (Responsive Plan Grid)
        </button>
        <button
          className={`btn ${activeTab === "mid" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("mid")}
        >
          Mid (Billing Interval Toggle)
        </button>
        <button
          className={`btn ${activeTab === "advance" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("advance")}
        >
          Advance (Custom Quota Calculators)
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* TAB controls inside Mid and Advance */}
        {activeTab === "mid" && (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
            <div style={{ display: "flex", gap: "4px", background: "var(--input-bg)", padding: "4px", borderRadius: "8px", border: "1px solid var(--border)" }}>
              <button className={`btn ${billingCycle === "monthly" ? "btn-primary" : "btn-secondary"}`} onClick={() => setBillingCycle("monthly")} style={{ padding: "6px 14px", fontSize: "0.85rem" }}>Monthly billing</button>
              <button className={`btn ${billingCycle === "yearly" ? "btn-primary" : "btn-secondary"}`} onClick={() => setBillingCycle("yearly")} style={{ padding: "6px 14px", fontSize: "0.85rem" }}>
                Yearly billing <span style={{ fontSize: "0.7rem", background: "var(--success)", color: "var(--bg)", padding: "1px 4px", borderRadius: "10px", marginLeft: "4px" }}>-20%</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === "advance" && (
          <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
            {/* User count slider */}
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>Seats / Users Count: {userCount}</label>
              <input type="range" min="1" max="100" value={userCount} onChange={(e) => setUserCount(Number(e.target.value))} style={{ width: "100%", marginTop: "6px", cursor: "pointer" }} />
            </div>

            {/* Storage slider */}
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>Storage Capacity: {storageGB} GB</label>
              <input type="range" min="5" max="500" value={storageGB} onChange={(e) => setStorageGB(Number(e.target.value))} style={{ width: "100%", marginTop: "6px", cursor: "pointer" }} />
            </div>

            {/* Currency selector */}
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>Currency Unit:</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value as any)} className="select-input" style={{ width: "100%", marginTop: "6px", background: "var(--input-bg)" }}>
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
                <option value="INR">Indian Rupee (₹)</option>
              </select>
            </div>
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
          
          {/* RENDER PLAN CARDS */}
          {(() => {
            const plans = activeTab === "basic" ? basicPlans : midPlans;
            return plans.map((plan) => {
              const isPopular = plan.name === "Pro Lab";
              
              // Calculate pricing details
              let finalPrice = plan.price;
              if (activeTab === "advance") {
                if (plan.name === "Starter") {
                  finalPrice = 0; // Free forever
                } else if (plan.name === "Pro Lab") {
                  finalPrice = calculatePlanCost(15, 3, 0.15); // base 15, 3/user, 0.15/GB
                } else {
                  finalPrice = calculatePlanCost(50, 6, 0.3); // base 50, 6/user, 0.3/GB
                }
              }

              return (
                <div
                  key={plan.name}
                  style={{
                    border: isPopular ? "2px solid var(--primary)" : "1px solid var(--border)",
                    borderRadius: "16px",
                    background: "var(--card-bg)",
                    padding: "28px",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    transform: isPopular ? "scale(1.03)" : "scale(1)",
                    transition: "transform 0.2s ease",
                    boxShadow: isPopular ? "0 10px 20px -5px rgba(0,0,0,0.2)" : "none"}}
                >
                  {isPopular && (
                    <span style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: "var(--primary)", color: "var(--bg)", padding: "2px 12px", borderRadius: "12px", fontSize: "0.72rem", fontWeight: "bold", textTransform: "uppercase" }}>
                      Most Popular
                    </span>
                  )}

                  <h4 style={{ margin: "0 0 6px 0", fontSize: "1.2rem", color: "var(--text-h)" }}>{plan.name}</h4>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0 0 16px 0", minHeight: "36px" }}>{plan.desc}</p>
                  
                  {/* Price */}
                  <div style={{ display: "flex", alignItems: "baseline", marginBottom: "20px", borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
                    <span style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--text-h)" }}>
                      {activeTab === "advance" ? currencySymbols[currency] : "$"}
                      {billingCycle === "yearly" && activeTab === "mid" ? Math.round(plan.price * 12 * 0.8) : finalPrice}
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginLeft: "4px" }}>
                      {billingCycle === "yearly" && activeTab === "mid" ? "/year" : "/month"}
                    </span>
                  </div>

                  {/* Features List */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
                    {plan.features.map((feat) => (
                      <div key={feat} style={{ display: "flex", gap: "8px", alignItems: "flex-start", fontSize: "0.82rem" }}>
                        <Check size={14} style={{ color: "var(--success)", flexShrink: 0, marginTop: "2px" }} />
                        <span style={{ color: "var(--text)" }}>{feat}</span>
                      </div>
                    ))}
                  </div>

                  <button className={`btn ${isPopular ? "btn-primary" : "btn-secondary"}`} style={{ width: "100%" }}>
                    {plan.price === 0 ? "Get Started" : "Choose Plan"}
                  </button>
                </div>
              );
            });
          })()}

        </div>

      </div>
    </div>
  );
};

export default PricingCardPage;
