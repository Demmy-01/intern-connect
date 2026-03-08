import React from "react";

export default function Badge({ status, label }) {
  let bgColor, textColor;

  const normalizedStatus = status?.toLowerCase() || "pending";

  if (["active", "verified", "accepted", "approved", "success", "sent"].includes(normalizedStatus)) {
    bgColor = "#d1fae5";
    textColor = "#059669";
  } else if (["rejected", "suspended", "failed", "closed"].includes(normalizedStatus)) {
    bgColor = "#fee2e2";
    textColor = "#dc2626";
  } else if (["pending", "unverified", "usage", "in_progress"].includes(normalizedStatus)) {
    bgColor = "#ffedd5";
    textColor = "#ea580c";
  } else if (["shortlisted", "reviewed", "purchase", "super_admin"].includes(normalizedStatus)) {
    bgColor = "#f3e8ff";
    textColor = "#9333ea";
  } else {
    bgColor = "#f1f5f9";
    textColor = "#64748b";
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "4px 8px",
        borderRadius: "9999px",
        fontSize: "12px",
        fontWeight: "600",
        backgroundColor: bgColor,
        color: textColor,
        textTransform: "capitalize",
      }}
    >
      {label || status.replace(/_/g, " ")}
    </span>
  );
}
