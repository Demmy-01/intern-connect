import React, { useState } from "react";
import "./dashboard-layout.css";
import Sidebar from "../components/sidebar.jsx";
import ProfileCompletionBanner from "../components/ProfileCompletionBanner";

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarCollapse = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  return (
    <div
      className={`dashboard-container ${isSidebarOpen ? "sidebar-open" : ""} ${
        isSidebarCollapsed ? "sidebar-collapsed" : ""
      }`}
    >
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        onCollapsedChange={handleSidebarCollapse}
      />
      <main className="main-content">
        <ProfileCompletionBanner />
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
