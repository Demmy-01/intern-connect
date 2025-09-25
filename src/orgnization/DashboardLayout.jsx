import React, { useState } from "react";
import "./dashboard-layout.css";
import Sidebar from "../components/sidebar.jsx";
import ProfileCompletionBanner from "../components/ProfileCompletionBanner";

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div
      className={`dashboard-container ${isSidebarOpen ? "sidebar-open" : ""}`}
    >
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      <main className="main-content">
        <ProfileCompletionBanner />
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
