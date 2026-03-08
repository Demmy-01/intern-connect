import React from "react";
import { 
  Briefcase, 
  Users, 
  Building2, 
  FileText, 
  MessageSquare, 
  LayoutDashboard,
  BrainCircuit,
  Settings,
  Globe,
  LogOut,
  Mail
} from "lucide-react";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "students", label: "Students", icon: Users },
  { id: "organizations", label: "Organizations", icon: Building2 },
  { id: "internships", label: "Internships", icon: Briefcase },
  { id: "applications", label: "Applications", icon: FileText },
  { id: "external-listings", label: "External Listings", icon: Globe },
  { id: "ai-tools", label: "AI Tools Usage", icon: BrainCircuit },
  { id: "emails", label: "System Emails", icon: Mail },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar({ activeTab, setActiveTab, onLogout, adminName = "Admin", adminRole = "Super Admin" }) {
  return (
    <div style={styles.sidebar}>
      {/* Brand Logo / Title */}
      <div style={styles.brandContainer}>
        <div style={styles.logoBox}>IC</div>
        <span style={styles.brandTitle}>Intern Connect</span>
      </div>

      {/* Navigation Links */}
      <nav style={styles.navContainer}>
        <p style={styles.navHeading}>MANAGEMENT</p>
        <div style={styles.navLinks}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                style={{
                  ...styles.navButton,
                  ...(isActive ? styles.navButtonActive : {}),
                }}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon 
                  size={20} 
                  style={{
                    color: isActive ? "#ffffff" : "#94a3b8",
                    marginRight: "12px"
                  }} 
                />
                <span style={{
                  color: isActive ? "#ffffff" : "#cbd5e1",
                  fontWeight: isActive ? "600" : "500",
                }}>
                  {item.label}
                </span>
                
                {/* Visual active indicator bar on the left */}
                {isActive && <div style={styles.activeIndicator} />}
              </button>
            );
          })}
        </div>
      </nav>

      {/* User Footer */}
      <div style={styles.userFooter}>
        <div style={styles.userInfo}>
          <div style={styles.avatarInitials}>
            {adminName.substring(0, 2).toUpperCase()}
          </div>
          <div style={styles.userDetails}>
            <p style={styles.userName}>{adminName}</p>
            <p style={styles.userRole}>{adminRole}</p>
          </div>
        </div>
        <button onClick={onLogout} style={styles.logoutButton} title="Logout">
          <LogOut size={18} color="#94a3b8" />
        </button>
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "280px",
    height: "100vh",
    backgroundColor: "#1e3a5f", // Brand Navy Blue
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    left: 0,
    top: 0,
    overflowY: "auto",
    fontFamily: "'Inter', sans-serif",
  },
  brandContainer: {
    padding: "32px 24px 24px 24px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  logoBox: {
    width: "36px",
    height: "36px",
    backgroundColor: "#3b82f6", // Pop of primary blue
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: "16px",
    letterSpacing: "1px",
  },
  brandTitle: {
    color: "#ffffff",
    fontSize: "18px",
    fontWeight: "700",
  },
  navContainer: {
    flex: 1,
    padding: "0 16px",
    marginTop: "16px",
  },
  navHeading: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#64748b",
    letterSpacing: "0.5px",
    marginBottom: "16px",
    marginLeft: "12px",
  },
  navLinks: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  navButton: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: "12px",
    background: "transparent",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    textAlign: "left",
    position: "relative",
    transition: "background-color 0.2s ease",
  },
  navButtonActive: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  activeIndicator: {
    position: "absolute",
    left: "-16px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "4px",
    height: "20px",
    backgroundColor: "#3b82f6",
    borderRadius: "0 4px 4px 0",
  },
  userFooter: {
    padding: "20px",
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(0, 0, 0, 0.15)",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  avatarInitials: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    color: "#3b82f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "600",
    fontSize: "14px",
  },
  userDetails: {
    display: "flex",
    flexDirection: "column",
  },
  userName: {
    margin: 0,
    fontSize: "14px",
    fontWeight: "600",
    color: "#ffffff",
  },
  userRole: {
    margin: 0,
    fontSize: "12px",
    color: "#94a3b8",
  },
  logoutButton: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "6px",
  },
};
