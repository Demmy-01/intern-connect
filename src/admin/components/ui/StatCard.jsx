import React from "react";

export default function StatCard({ title, value, icon: Icon, trend }) {
  return (
    <div style={styles.card}>
      <div style={styles.content}>
        <div style={styles.textContainer}>
          <p style={styles.title}>{title}</p>
          <h3 style={styles.value}>{typeof value === 'number' ? value.toLocaleString() : value}</h3>
          
          {trend && (
            <div style={styles.trendRow}>
              <span style={{ 
                ...styles.trendValue, 
                color: trend.isPositive ? "#059669" : "#dc2626" 
              }}>
                {trend.isPositive ? "↑ " : "↓ "}{Math.abs(trend.value)}%
              </span>
              <span style={styles.trendLabel}>vs last month</span>
            </div>
          )}
        </div>
        
        <div style={styles.iconWrapper}>
          <Icon size={24} color="#3b82f6" />
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)",
    border: "1px solid #e2e8f0",
  },
  content: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  textContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  title: {
    margin: 0,
    fontSize: "14px",
    color: "#64748b",
    fontWeight: "500",
    fontFamily: "'Inter', sans-serif",
  },
  value: {
    margin: 0,
    fontSize: "32px",
    fontWeight: "700",
    color: "#0f172a",
    fontFamily: "'Inter', sans-serif",
  },
  trendRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginTop: "4px",
  },
  trendValue: {
    fontSize: "13px",
    fontWeight: "600",
  },
  trendLabel: {
    fontSize: "13px",
    color: "#94a3b8",
  },
  iconWrapper: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};
