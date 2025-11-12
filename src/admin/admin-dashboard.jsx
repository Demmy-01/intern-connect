import React, { useState, useEffect } from "react";
import { Users, Building2, Briefcase, FileText } from "lucide-react";
import { supabase } from '../lib/supabase';

// Reusable StatCard Component
const StatCard = ({ title, value, icon: Icon }) => (
  <div style={styles.statCard}>
    <div>
      <p style={styles.statTitle}>{title}</p>
      <p style={styles.statValue}>{value.toLocaleString()}</p>
    </div>
    <div style={styles.iconContainer}>
      <Icon size={24} color="#374151" />
    </div>
  </div>
);

// Reusable TabButton Component
const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    style={{
      ...styles.tabButton,
      ...(active ? styles.tabButtonActive : {}),
    }}
  >
    {children}
  </button>
);

// Reusable Toggle Component
const Toggle = ({ enabled, onChange, id, type }) => (
  <button
    onClick={(e) => {
      e.preventDefault();
      onChange(id, type);
    }}
    style={{
      ...styles.toggle,
      backgroundColor: enabled ? "#10b981" : "#d1d5db",
    }}
    aria-pressed={enabled}
  >
    <span
      style={{
        ...styles.toggleThumb,
        left: enabled ? "24px" : "2px",
      }}
    />
  </button>
);

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrganizations: 0,
    activeInternships: 0,
    totalApplications: 0,
  });
  const [visibleCount, setVisibleCount] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all data in parallel
      const [usersResult, orgsResult, internshipsResult, applicationsResult] = await Promise.all([
        fetchUsers(),
        fetchOrganizations(),
        fetchInternships(),
        fetchApplications(),
      ]);

      if (usersResult.error) throw usersResult.error;
      if (orgsResult.error) throw orgsResult.error;
      if (internshipsResult.error) throw internshipsResult.error;
      if (applicationsResult.error) throw applicationsResult.error;

      setUsers(usersResult.data || []);
      setOrganizations(orgsResult.data || []);
      
      setStats({
        totalUsers: usersResult.data?.length || 0,
        totalOrganizations: orgsResult.data?.length || 0,
        activeInternships: internshipsResult.data?.filter(i => i.is_active).length || 0,
        totalApplications: applicationsResult.data?.length || 0,
      });
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        username,
        display_name,
        phone,
        avatar_url,
        user_type,
        created_at,
        students (
          id,
          bio
        )
      `)
      .eq('user_type', 'student')
      .order('created_at', { ascending: false });

    // Get email from auth.users
    if (data) {
      const userIds = data.map(u => u.id);
      const { data: authData } = await supabase.auth.admin.listUsers();
      
      const usersWithEmail = data.map(user => {
        const authUser = authData?.users?.find(au => au.id === user.id);
        return {
          ...user,
          email: authUser?.email || 'N/A',
          is_active: authUser?.email_confirmed_at ? true : false
        };
      });
      
      return { data: usersWithEmail, error };
    }

    return { data, error };
  };

  const fetchOrganizations = async () => {
    const { data, error } = await supabase
      .from('organizations')
      .select(`
        id,
        organization_name,
        company_name,
        industry,
        company_size,
        location,
        website,
        verification_status,
        total_recruited_interns,
        created_at,
        profiles!inner (
          username,
          display_name,
          phone
        )
      `)
      .order('created_at', { ascending: false });

    // Get email from auth.users
    if (data) {
      const orgIds = data.map(o => o.id);
      const { data: authData } = await supabase.auth.admin.listUsers();
      
      const orgsWithEmail = data.map(org => {
        const authUser = authData?.users?.find(au => au.id === org.id);
        return {
          ...org,
          email: authUser?.email || 'N/A',
          username: org.profiles?.username,
          display_name: org.profiles?.display_name,
          phone: org.profiles?.phone
        };
      });
      
      return { data: orgsWithEmail, error };
    }

    return { data, error };
  };

  const fetchInternships = async () => {
    const { data, error } = await supabase
      .from('internships')
      .select('id, is_active');

    return { data, error };
  };

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from('internship_applications')
      .select('id');

    return { data, error };
  };

  const handleToggle = async (id, type) => {
    if (type === "users") {
      const user = users.find(u => u.id === id);
      const newStatus = !user.is_active;
      
      // Update local state immediately for better UX
      setUsers(
        users.map((u) =>
          u.id === id ? { ...u, is_active: newStatus } : u
        )
      );

      // TODO: Implement actual user activation/deactivation in Supabase
      // This would typically involve updating auth status or a custom field
      console.log(`Toggle user ${id} to ${newStatus ? 'active' : 'inactive'}`);
    }
  };

  const handleApprovalToggle = async (id) => {
    const org = organizations.find(o => o.id === id);
    const newStatus = org.verification_status === "verified" ? "pending" : "verified";
    
    // Update local state immediately
    setOrganizations(
      organizations.map((o) =>
        o.id === id ? { ...o, verification_status: newStatus } : o
      )
    );

    // Update in database
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ verification_status: newStatus })
        .eq('id', id);

      if (error) {
        console.error("Error updating verification status:", error);
        // Revert on error
        setOrganizations(
          organizations.map((o) =>
            o.id === id ? { ...o, verification_status: org.verification_status } : o
          )
        );
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const handleSeeMore = () => {
    setVisibleCount((prev) => prev + 5);
  };

  const handleViewProfile = (id, type) => {
    if (type === "organizations") {
      console.log(`Viewing organization details for ID: ${id}`);
      // In real app: navigate(`/admin/organizations/${id}`);
    } else {
      console.log(`Viewing student profile for user ID: ${id}`);
      // In real app: navigate(`/admin/users/${id}`);
    }
  };

  const currentData = activeTab === "users" ? users : organizations;
  const visibleData = currentData.slice(0, visibleCount);
  const hasMore = visibleCount < currentData.length;

  if (loading) {
    return (
      <div style={{ ...styles.container, ...styles.loadingContainer }}>
        <p style={styles.loadingText}>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ ...styles.container, ...styles.loadingContainer }}>
        <div style={styles.errorContainer}>
          <p style={styles.errorText}>Error loading dashboard: {error}</p>
          <button onClick={fetchDashboardData} style={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Admin Dashboard</h1>
        <p style={styles.subtitle}>
          Manage all platform activities from one place.
        </p>
      </div>

      <div style={styles.statsGrid}>
        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} />
        <StatCard
          title="Total Organizations"
          value={stats.totalOrganizations}
          icon={Building2}
        />
        <StatCard
          title="Active Internships"
          value={stats.activeInternships}
          icon={Briefcase}
        />
        <StatCard
          title="Total Applications"
          value={stats.totalApplications}
          icon={FileText}
        />
      </div>

      <div style={styles.tabContainer}>
        <TabButton
          active={activeTab === "users"}
          onClick={() => {
            setActiveTab("users");
            setVisibleCount(10);
          }}
        >
          Users
        </TabButton>
        <TabButton
          active={activeTab === "organizations"}
          onClick={() => {
            setActiveTab("organizations");
            setVisibleCount(10);
          }}
        >
          Organizations
        </TabButton>
      </div>

      <div style={styles.manageSection}>
        <div>
          <h2 style={styles.manageTitle}>
            Manage {activeTab === "users" ? "Users" : "Organizations"}
          </h2>
          <p style={styles.manageSubtitle}>
            View, suspend, or {activeTab === "users" ? "manage user" : "verify organization"} accounts.
          </p>
        </div>

        {currentData.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>
              No {activeTab === "users" ? "users" : "organizations"} found.
            </p>
          </div>
        ) : (
          <>
            <div style={styles.tableContainer}>
              <div style={styles.tableHeader}>
                <div style={styles.tableHeaderCell}>
                  {activeTab === "users" ? "User" : "Organization"}
                </div>
                <div style={styles.tableHeaderCell}>Email</div>
                <div style={styles.tableHeaderCell}>
                  {activeTab === "users" ? "Status" : "Verification"}
                </div>
                <div style={styles.tableHeaderCell}>Actions</div>
              </div>

              {visibleData.map((item) => (
                <div key={item.id} style={styles.tableRow}>
                  <div style={styles.tableCell}>
                    <div style={styles.nameCell}>
                      <span style={styles.displayName}>
                        {item.display_name || item.organization_name || item.username}
                      </span>
                      {activeTab === "organizations" && item.company_size && (
                        <span style={styles.metadata}>{item.company_size} employees</span>
                      )}
                      {activeTab === "organizations" && item.industry && (
                        <span style={styles.metadata}>{item.industry}</span>
                      )}
                    </div>
                  </div>
                  <div style={styles.tableCell}>{item.email}</div>
                  <div style={styles.tableCell}>
                    {activeTab === "users" ? (
                      <span
                        style={{
                          ...styles.statusBadge,
                          ...(item.is_active
                            ? styles.statusActive
                            : styles.statusInactive),
                        }}
                      >
                        {item.is_active ? "Active" : "Inactive"}
                      </span>
                    ) : (
                      <span
                        style={{
                          ...styles.statusBadge,
                          ...(item.verification_status === "verified"
                            ? styles.statusActive
                            : item.verification_status === "rejected"
                            ? styles.statusRejected
                            : styles.statusPending),
                        }}
                      >
                        {item.verification_status}
                      </span>
                    )}
                  </div>
                  <div style={styles.tableCellActions}>
                    {activeTab === "users" ? (
                      <>
                        <button
                          onClick={() => handleViewProfile(item.id, "users")}
                          style={styles.viewButton}
                        >
                          View Profile
                        </button>
                        <div style={styles.toggleWrapper}>
                          <Toggle
                            enabled={item.is_active}
                            onChange={handleToggle}
                            id={item.id}
                            type={activeTab}
                          />
                          <span style={styles.toggleLabel}>
                            {item.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() =>
                            handleViewProfile(item.id, "organizations")
                          }
                          style={styles.viewButton}
                        >
                          View & Approve
                        </button>
                        <div style={styles.toggleWrapper}>
                          <Toggle
                            enabled={item.verification_status === "verified"}
                            onChange={() => handleApprovalToggle(item.id)}
                            id={item.id}
                            type="organizations"
                          />
                          <span style={styles.toggleLabel}>
                            {item.verification_status === "verified"
                              ? "Verified"
                              : "Pending"}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {hasMore && (
              <div style={styles.seeMoreContainer}>
                <button onClick={handleSeeMore} style={styles.seeMoreButton}>
                  See More ({Math.min(5, currentData.length - visibleCount)} more)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f9fafb",
    padding: "40px 20px",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: "18px",
    color: "#6b7280",
  },
  errorContainer: {
    textAlign: "center",
  },
  errorText: {
    fontSize: "16px",
    color: "#dc2626",
    marginBottom: "16px",
  },
  retryButton: {
    padding: "10px 24px",
    fontSize: "14px",
    fontWeight: "500",
    color: "white",
    backgroundColor: "#3b82f6",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  emptyState: {
    padding: "60px 20px",
    textAlign: "center",
  },
  emptyText: {
    fontSize: "16px",
    color: "#6b7280",
  },
  header: {
    marginBottom: "40px",
  },
  title: {
    fontSize: "36px",
    fontWeight: "bold",
    color: "#111827",
    marginBottom: "8px",
  },
  subtitle: {
    fontSize: "16px",
    color: "#6b7280",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "40px",
  },
  statCard: {
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    padding: "24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statTitle: {
    fontSize: "14px",
    color: "#6b7280",
    marginBottom: "4px",
  },
  statValue: {
    fontSize: "30px",
    fontWeight: "bold",
    color: "#111827",
  },
  iconContainer: {
    backgroundColor: "#f3f4f6",
    padding: "12px",
    borderRadius: "8px",
  },
  tabContainer: {
    display: "flex",
    gap: "0",
    borderBottom: "1px solid #e5e7eb",
    marginBottom: "30px",
  },
  tabButton: {
    padding: "12px 24px",
    fontSize: "16px",
    fontWeight: "500",
    color: "#6b7280",
    backgroundColor: "transparent",
    border: "none",
    borderBottom: "2px solid transparent",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  tabButtonActive: {
    color: "#111827",
    borderBottom: "2px solid #111827",
  },
  manageSection: {
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    padding: "30px",
  },
  manageTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#111827",
    marginBottom: "4px",
  },
  manageSubtitle: {
    fontSize: "14px",
    color: "#6b7280",
    marginBottom: "30px",
  },
  tableContainer: {
    width: "100%",
  },
  tableHeader: {
    display: "grid",
    gridTemplateColumns: "1.5fr 2fr 1fr 2fr",
    gap: "16px",
    padding: "12px 0",
    borderBottom: "1px solid #e5e7eb",
    marginBottom: "8px",
  },
  tableHeaderCell: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
  },
  tableRow: {
    display: "grid",
    gridTemplateColumns: "1.5fr 2fr 1fr 2fr",
    gap: "16px",
    padding: "16px 0",
    borderBottom: "1px solid #f3f4f6",
    alignItems: "center",
  },
  tableCell: {
    fontSize: "14px",
    color: "#111827",
  },
  nameCell: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  displayName: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#111827",
  },
  metadata: {
    fontSize: "12px",
    color: "#6b7280",
  },
  statusBadge: {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "500",
    textTransform: "capitalize",
  },
  statusActive: {
    backgroundColor: "#d1fae5",
    color: "#065f46",
  },
  statusInactive: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  },
  statusPending: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
  },
  statusRejected: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  },
  tableCellActions: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  viewButton: {
    padding: "6px 16px",
    fontSize: "14px",
    color: "#3b82f6",
    backgroundColor: "transparent",
    border: "1px solid #3b82f6",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  toggleWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  toggle: {
    position: "relative",
    width: "50px",
    height: "28px",
    borderRadius: "14px",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
    padding: "0",
    outline: "none",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  toggleThumb: {
    position: "absolute",
    top: "2px",
    left: "2px",
    width: "24px",
    height: "24px",
    backgroundColor: "white",
    borderRadius: "50%",
    transition: "left 0.3s ease",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
  },
  toggleLabel: {
    fontSize: "13px",
    color: "#6b7280",
  },
  seeMoreContainer: {
    display: "flex",
    justifyContent: "center",
    marginTop: "24px",
  },
  seeMoreButton: {
    padding: "10px 32px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#3b82f6",
    backgroundColor: "white",
    border: "1px solid #3b82f6",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
};

export default AdminDashboard;