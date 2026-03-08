import React from "react";

export default function ProgressBar({ percentage, label }) {
  // Determine color based on progress
  let color = "#ef4444"; // Red (0-30%)
  if (percentage > 30 && percentage <= 70) color = "#f59e0b"; // Amber (31-70%)
  if (percentage > 70) color = "#10b981"; // Green (71-100%)

  // Clamp percentage between 0 and 100
  const width = Math.min(100, Math.max(0, percentage));

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.label}>{label}</span>
        <span style={styles.percentage}>{width}%</span>
      </div>
      <div style={styles.track}>
        <div style={{ ...styles.fill, width: `${width}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    width: "100%",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: "12px",
    color: "#64748b",
    fontWeight: "500",
  },
  percentage: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#0f172a",
  },
  track: {
    width: "100%",
    height: "6px",
    backgroundColor: "#e2e8f0",
    borderRadius: "9999px",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    transition: "width 0.5s ease-in-out, background-color 0.3s ease",
  },
};
