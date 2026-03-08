import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";
import DashboardOverview from "./views/DashboardOverview";
import StudentsManagement from "./views/StudentsManagement";
import OrganizationsManagement from "./views/OrganizationsManagement";
import InternshipsManagement from "./views/InternshipsManagement";
import ApplicationsMonitoring from "./views/ApplicationsMonitoring";
import ExternalListings from "./views/ExternalListings";
import AIToolsUsage from "./views/AIToolsUsage";

// Temporary placeholder for missing views
const PlaceholderView = ({ title }) => (
  <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
    <h2>{title} Module</h2>
    <p>This section is currently being redesigned.</p>
  </div>
);

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [adminProfile, setAdminProfile] = useState({ name: "Admin", role: "Super Admin" });

  useEffect(() => {
    // In a real app, you would fetch the actual profile from AuthContext or Supabase
    // We do a mock fetch here just to populate the header
    const fetchAdminContext = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('display_name, user_type').eq('id', user.id).single();
        if (data) {
          setAdminProfile({ 
            name: data.display_name || user.email.split('@')[0], 
            role: data.user_type === 'admin' ? 'Super Admin' : 'Admin' 
          });
        }
      }
    };
    fetchAdminContext();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview />;
      case "students":
        return <StudentsManagement />;
      case "organizations":
        return <OrganizationsManagement />;
      case "internships":
        return <InternshipsManagement />;
      case "applications":
        return <ApplicationsMonitoring />;
      case "external-listings":
        return <ExternalListings />;
      case "ai-tools":
        return <AIToolsUsage />;
      case "emails":
        return <PlaceholderView title="System Emails" />;
      case "messages":
        return <PlaceholderView title="Messages" />;
      case "settings":
        return <PlaceholderView title="Settings" />;
      default:
        return <PlaceholderView title="Unknown" />;
    }
  };

  return (
    <div style={styles.appContainer}>
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout}
        adminName={adminProfile.name}
        adminRole={adminProfile.role}
      />
      
      <div style={styles.mainWrapper}>
        <AdminHeader 
          adminName={adminProfile.name} 
          onLogout={handleLogout} 
        />
        
        <main style={styles.contentArea}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

const styles = {
  appContainer: {
    display: "flex",
    height: "100vh",
    backgroundColor: "#f8fafc", // Soft gray background for the SaaS feel
    overflow: "hidden",
  },
  mainWrapper: {
    flex: 1,
    marginLeft: "280px", // Match sidebar width
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    overflow: "hidden",
  },
  contentArea: {
    flex: 1,
    overflowY: "auto",
    padding: "32px",
  }
};
