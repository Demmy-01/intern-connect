import React, { useState, useEffect } from "react";
import { X, Check, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { getTokenPricing, initializePayment } from "../lib/api";

export default function TokenPurchaseModal({
  isOpen,
  onClose,
  onSuccess,
  darkMode,
  userEmail,
}) {
  const [pricing, setPricing] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(userEmail || "");

  useEffect(() => {
    if (isOpen) {
      loadPricing();
    }
  }, [isOpen]);

  const loadPricing = async () => {
    try {
      const data = await getTokenPricing();
      console.log("✅ Pricing loaded:", data);
      setPricing(data);
    } catch (error) {
      console.error("❌ Failed to load pricing:", error);
      toast.error(
        "Failed to load pricing. Please ensure the backend server is running.",
      );
    }
  };

  const handlePurchase = async (packageIndex) => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    console.log(
      "🔵 Initiating payment for package:",
      packageIndex,
      "Email:",
      email,
    );
    setLoading(true);
    setSelectedPackage(packageIndex);

    try {
      const result = await initializePayment(email, packageIndex);
      console.log("🔵 Payment API response:", result);

      // Handle mock payment mode
      if (result.success && result.mock) {
        console.log("✅ Mock payment successful:", result);
        toast.success(
          `Payment Successful (Mock Mode)!\n\n${result.tokensAdded} tokens added to your account.\nNew balance: ${result.newBalance} tokens`,
        );

        // Refresh token balance
        if (onSuccess) {
          onSuccess();
        }

        // Close modal
        onClose();
        return;
      }

      // Handle real Paystack payment
      if (result.success && result.data && result.data.authorization_url) {
        console.log(
          "✅ Redirecting to Paystack:",
          result.data.authorization_url,
        );
        // Redirect to Paystack payment page
        window.location.href = result.data.authorization_url;
      } else {
        console.error("❌ Payment initialization failed:", result);
        toast.error(
          "Failed to initialize payment: " + (result.error || "Unknown error"),
        );
      }
    } catch (error) {
      console.error("❌ Payment error:", error);
      const errorMsg =
        error.response?.data?.error || error.message || "Unknown error";
      toast.error(
        "Failed to initialize payment. Error: " +
          errorMsg +
          "\n\nPlease check the browser console for details.",
      );
    } finally {
      setLoading(false);
      setSelectedPackage(null);
    }
  };

  if (!isOpen || !pricing) return null;

  const styles = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "20px",
    },
    modal: {
      backgroundColor: darkMode ? "#1f2937" : "white",
      borderRadius: "12px",
      maxWidth: "800px",
      width: "100%",
      maxHeight: "90vh",
      overflowY: "auto",
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
    },
    header: {
      padding: "24px",
      borderBottom: darkMode ? "1px solid #374151" : "1px solid #e5e7eb",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    title: {
      fontSize: "24px",
      fontWeight: "bold",
      color: darkMode ? "#ffffff" : "#1f2937",
    },
    closeButton: {
      backgroundColor: "transparent",
      border: "none",
      cursor: "pointer",
      color: darkMode ? "#9ca3af" : "#6b7280",
      padding: "4px",
    },
    content: {
      padding: "24px",
    },
    emailInput: {
      width: "100%",
      padding: "12px",
      border: darkMode ? "1px solid #374151" : "1px solid #d1d5db",
      borderRadius: "8px",
      fontSize: "14px",
      backgroundColor: darkMode ? "#111827" : "#f9fafb",
      color: darkMode ? "#ffffff" : "#1f2937",
      marginBottom: "24px",
    },
    packagesGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "16px",
    },
    packageCard: {
      border: "2px solid",
      borderRadius: "12px",
      padding: "20px",
      cursor: "pointer",
      transition: "all 0.2s",
      position: "relative",
      overflow: "hidden",
    },
    packageName: {
      fontSize: "18px",
      fontWeight: "bold",
      marginBottom: "8px",
    },
    packageTokens: {
      fontSize: "32px",
      fontWeight: "bold",
      color: "#2563eb",
      marginBottom: "4px",
    },
    packagePrice: {
      fontSize: "20px",
      fontWeight: "600",
      marginBottom: "12px",
    },
    packageBonus: {
      backgroundColor: "#10b981",
      color: "white",
      padding: "4px 8px",
      borderRadius: "4px",
      fontSize: "12px",
      fontWeight: "600",
      display: "inline-block",
      marginBottom: "12px",
    },
    buyButton: {
      width: "100%",
      padding: "10px",
      backgroundColor: "#2563eb",
      color: "white",
      border: "none",
      borderRadius: "6px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
    },
    costInfo: {
      marginTop: "24px",
      padding: "16px",
      backgroundColor: darkMode ? "#374151" : "#f3f4f6",
      borderRadius: "8px",
      fontSize: "13px",
      color: darkMode ? "#d1d5db" : "#6b7280",
    },
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Purchase Tokens</h2>
          <button style={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div style={styles.content}>
          <input
            type="email"
            placeholder="Enter your email for payment"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.emailInput}
          />

          <div style={styles.packagesGrid}>
            {pricing.packages.map((pkg, index) => (
              <div
                key={index}
                style={{
                  ...styles.packageCard,
                  borderColor:
                    index === 1 ? "#2563eb" : darkMode ? "#374151" : "#e5e7eb",
                  backgroundColor: darkMode ? "#111827" : "white",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 20px rgba(0, 0, 0, 0.2)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {index === 1 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "12px",
                      right: "12px",
                      backgroundColor: "#2563eb",
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: "700",
                    }}
                  >
                    POPULAR
                  </div>
                )}

                <div
                  style={{
                    ...styles.packageName,
                    color: darkMode ? "#ffffff" : "#1f2937",
                  }}
                >
                  {pkg.name}
                </div>

                <div style={styles.packageTokens}>
                  {pkg.tokens}
                  {pkg.bonus && (
                    <span style={{ fontSize: "16px", color: "#10b981" }}>
                      {" "}
                      +{pkg.bonus}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: darkMode ? "#9ca3af" : "#6b7280",
                    marginBottom: "8px",
                  }}
                >
                  tokens
                </div>

                <div
                  style={{
                    ...styles.packagePrice,
                    color: darkMode ? "#ffffff" : "#1f2937",
                  }}
                >
                  ₦{pkg.price.toLocaleString()}
                </div>

                {pkg.bonus && (
                  <div style={styles.packageBonus}>
                    +{pkg.bonus} Bonus Tokens!
                  </div>
                )}

                <button
                  style={styles.buyButton}
                  onClick={() => handlePurchase(index)}
                  disabled={loading}
                  onMouseOver={(e) =>
                    (e.target.style.backgroundColor = "#1d4ed8")
                  }
                  onMouseOut={(e) =>
                    (e.target.style.backgroundColor = "#2563eb")
                  }
                >
                  {loading && selectedPackage === index ? (
                    <>
                      <Loader2
                        size={16}
                        style={{ animation: "spin 1s linear infinite" }}
                      />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      Buy Now
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>

          <div style={styles.costInfo}>
            <strong>💡 Token Usage:</strong> Each AI suggestion costs{" "}
            {pricing.costs.AI_SUGGESTION} tokens. New users get{" "}
            {pricing.costs.INITIAL_FREE_TOKENS} free tokens to start!
          </div>
        </div>
      </div>
    </div>
  );
}
