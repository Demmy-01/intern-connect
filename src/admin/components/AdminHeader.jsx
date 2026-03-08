import React, { useState } from "react";
import { Search, Bell, User } from "lucide-react";

export default function AdminHeader({ adminName = "Admin", onLogout }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header style={styles.header}>
      {/* Left side: Search */}
      <div style={styles.searchContainer}>
        <Search style={styles.searchIcon} size={20} />
        <input
          type="text"
          placeholder="Global search..."
          style={styles.searchInput}
        />
      </div>

      {/* Right side: Actions */}
      <div style={styles.actions}>
        <button style={styles.iconButton}>
          <Bell size={20} />
          {/* Notification Badge Example */}
          <span style={styles.notificationBadge}>3</span>
        </button>

        <div style={styles.profileContainer}>
          <button
            style={styles.profileButton}
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div style={styles.avatar}>
              <User size={18} color="#fff" />
            </div>
            <span style={styles.profileName}>{adminName}</span>
          </button>

          {showProfileMenu && (
            <div style={styles.dropdown}>
              <button
                style={styles.dropdownItem}
                onClick={() => {
                  setShowProfileMenu(false);
                  onLogout();
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 32px",
    height: "72px",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e2e8f0",
  },
  searchContainer: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: "12px",
    padding: "8px 16px",
    width: "400px",
    position: "relative",
  },
  searchIcon: {
    color: "#64748b",
    marginRight: "8px",
  },
  searchInput: {
    border: "none",
    background: "none",
    outline: "none",
    width: "100%",
    fontSize: "14px",
    color: "#0f172a",
    fontFamily: "'Inter', sans-serif",
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
  },
  iconButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#64748b",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadge: {
    position: "absolute",
    top: "-5px",
    right: "-5px",
    backgroundColor: "#ef4444",
    color: "white",
    fontSize: "10px",
    fontWeight: "600",
    padding: "2px 6px",
    borderRadius: "99px",
  },
  profileContainer: {
    position: "relative",
  },
  profileButton: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "none",
    border: "none",
    cursor: "pointer",
  },
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "#1e3a5f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  profileName: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#0f172a",
    fontFamily: "'Inter', sans-serif",
  },
  dropdown: {
    position: "absolute",
    top: "120%",
    right: 0,
    backgroundColor: "#ffffff",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    borderRadius: "8px",
    padding: "8px",
    minWidth: "150px",
    zIndex: 10,
    border: "1px solid #e2e8f0",
  },
  dropdownItem: {
    display: "block",
    width: "100%",
    textAlign: "left",
    padding: "8px 16px",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#ef4444",
    fontSize: "14px",
    fontWeight: "500",
    borderRadius: "6px",
  },
};
