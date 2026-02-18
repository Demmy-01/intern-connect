import React, { useState, useEffect } from "react";
import { X, Check, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";
import { getTokenPricing } from "../lib/api";

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

export default function TokenPurchaseModal({
  isOpen,
  onClose,
  onSuccess,
  darkMode,
}) {
  const [pricing, setPricing] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadPricing();
      loadAuthenticatedUserEmail();
    }
  }, [isOpen]);

  const loadAuthenticatedUserEmail = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) setEmail(user.email);
    } catch (error) {
      console.error("Failed to get authenticated user email:", error);
    }
  };

  const loadPricing = async () => {
    try {
      const data = await getTokenPricing();
      setPricing(data);
    } catch (error) {
      console.error("❌ Failed to load pricing:", error);
      toast.error("Failed to load pricing. Please try again.");
    }
  };

  // Credit tokens directly to Supabase after successful Paystack payment
  const creditTokens = async (userId, tokensToAdd, packageName, reference) => {
    const { data: existing } = await supabase
      .from("user_tokens")
      .select("balance, total_purchased")
      .eq("user_id", userId)
      .single();

    const currentBalance = existing?.balance ?? 0;
    const currentPurchased = existing?.total_purchased ?? 0;
    const newBalance = currentBalance + tokensToAdd;

    const { error } = await supabase
      .from("user_tokens")
      .upsert(
        {
          user_id: userId,
          balance: newBalance,
          total_purchased: currentPurchased + tokensToAdd,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (error) throw error;

    await supabase.from("token_transactions").insert([
      {
        user_id: userId,
        transaction_type: "purchase",
        amount: tokensToAdd,
        description: `Paystack payment: ${packageName}`,
        reference,
        balance_after: newBalance,
      },
    ]);

    return newBalance;
  };

  const loadPaystackScript = () =>
    new Promise((resolve, reject) => {
      if (window.PaystackPop) return resolve();
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.onload = () => {
        console.log("✅ Paystack script loaded");
        resolve();
      };
      script.onerror = () => reject(new Error("Could not load Paystack script. Check your internet connection."));
      document.head.appendChild(script);
    });

  const handlePurchase = async (pkg, index) => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    setSelectedPackage(index);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || null;
      const totalTokens = pkg.tokens + (pkg.bonus || 0);

      if (!PAYSTACK_PUBLIC_KEY) {
        toast.error("Payment not configured. Please contact support.");
        return;
      }

      await loadPaystackScript();

      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email,
        amount: pkg.price * 100, // kobo
        currency: "NGN",
        ref: `ic_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        metadata: {
          packageIndex: index,
          packageName: pkg.name,
          tokens: totalTokens,
          userId,
          custom_fields: [
            { display_name: "Package", variable_name: "package", value: pkg.name },
            { display_name: "Tokens",  variable_name: "tokens",  value: String(totalTokens) },
          ],
        },
        callback: function(response) {
          console.log("✅ Paystack callback:", response);
          // Paystack requires a non-async callback — run async work inside an IIFE
          (async () => {
            try {
              if (!userId) {
                toast.error("Session expired. Please log in again.");
                return;
              }
              const newBalance = await creditTokens(userId, totalTokens, pkg.name, response.reference);
              toast.success(`🎉 Payment successful! ${totalTokens} tokens added. New balance: ${newBalance}`);
              if (onSuccess) onSuccess(newBalance);
              onClose();
            } catch (err) {
              console.error("Token credit error:", err);
              toast.error(`Payment received but token credit failed. Ref: ${response.reference}. Contact support.`);
            }
          })();
        },
        onClose: function() {
          toast("Payment cancelled.", { icon: "ℹ️" });
          setLoading(false);
          setSelectedPackage(null);
        },
      });

      handler.openIframe();
    } catch (error) {
      console.error("❌ Payment error:", error);
      toast.error(error.message || "Failed to open payment. Please try again.");
      setLoading(false);
      setSelectedPackage(null);
    }
  };

  if (!isOpen || !pricing) return null;

  const styles = {
    overlay: {
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
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
    content: { padding: "24px" },
    emailLabel: {
      fontSize: "13px",
      fontWeight: "600",
      color: darkMode ? "#d1d5db" : "#374151",
      marginBottom: "6px",
      display: "block",
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
      boxSizing: "border-box",
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
    packageName: { fontSize: "18px", fontWeight: "bold", marginBottom: "8px" },
    packageTokens: { fontSize: "32px", fontWeight: "bold", color: "#2563eb", marginBottom: "4px" },
    packagePrice: { fontSize: "20px", fontWeight: "600", marginBottom: "12px" },
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
          <label style={styles.emailLabel}>Email for payment receipt</label>
          <input
            type="email"
            placeholder="Enter your email"
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
                  borderColor: index === 1 ? "#2563eb" : darkMode ? "#374151" : "#e5e7eb",
                  backgroundColor: darkMode ? "#111827" : "white",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.2)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {index === 1 && (
                  <div
                    style={{
                      position: "absolute", top: "12px", right: "12px",
                      backgroundColor: "#2563eb", color: "white",
                      padding: "4px 8px", borderRadius: "4px",
                      fontSize: "11px", fontWeight: "700",
                    }}
                  >
                    POPULAR
                  </div>
                )}

                <div style={{ ...styles.packageName, color: darkMode ? "#ffffff" : "#1f2937" }}>
                  {pkg.name}
                </div>

                <div style={styles.packageTokens}>
                  {pkg.tokens}
                  {pkg.bonus && (
                    <span style={{ fontSize: "16px", color: "#10b981" }}> +{pkg.bonus}</span>
                  )}
                </div>
                <div style={{ fontSize: "12px", color: darkMode ? "#9ca3af" : "#6b7280", marginBottom: "8px" }}>
                  tokens
                </div>

                <div style={{ ...styles.packagePrice, color: darkMode ? "#ffffff" : "#1f2937" }}>
                  ₦{pkg.price.toLocaleString()}
                </div>

                {pkg.bonus && (
                  <div style={styles.packageBonus}>+{pkg.bonus} Bonus Tokens!</div>
                )}

                <button
                  style={styles.buyButton}
                  onClick={() => handlePurchase(pkg, index)}
                  disabled={loading}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#1d4ed8")}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#2563eb")}
                >
                  {loading && selectedPackage === index ? (
                    <>
                      <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                      Opening...
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      Pay ₦{pkg.price.toLocaleString()}
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
