import React, { useState, useEffect } from "react";
import { Users, Building2, Briefcase, FileText, X, CheckCircle, XCircle, Download, ExternalLink } from "lucide-react";
import { supabase, supabaseAdmin } from '../lib/supabase';

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

// Organization Detail Modal Component
const OrganizationDetailModal = ({ organization, onClose, onApprove, onReject }) => {
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [compliance, setCompliance] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (organization) {
      fetchOrganizationDetails();
    }
  }, [organization]);

  const fetchOrganizationDetails = async () => {
    try {
      // Fetch documents
      const { data: docsData } = await supabase
        .from('organization_documents')
        .select('*')
        .eq('organization_id', organization.id);
      setDocuments(docsData || []);

      // Fetch contacts
      const { data: contactsData } = await supabase
        .from('organization_contacts')
        .select('*')
        .eq('organization_id', organization.id);
      setContacts(contactsData || []);

      // Fetch compliance
      const { data: complianceData } = await supabase
        .from('organization_compliance')
        .select('*')
        .eq('organization_id', organization.id)
        .single();
      setCompliance(complianceData);
    } catch (error) {
      console.error('Error fetching organization details:', error);
    }
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      await onApprove(organization.id);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }
    setLoading(true);
    try {
      await onReject(organization.id, rejectionReason);
    } finally {
      setLoading(false);
    }
  };

  if (!organization) return null;

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        <div style={styles.modalBody}>
          {/* Organization Header */}
          <div style={styles.orgHeader}>
            {organization.logo_url ? (
              <img src={organization.logo_url} alt="Logo" style={styles.orgLogo} />
            ) : (
              <div style={styles.orgLogoPlaceholder}>
                <Building2 size={40} color="#6b7280" />
              </div>
            )}
            <div>
              <h2 style={styles.orgName}>{organization.organization_name}</h2>
              <span style={{
                ...styles.statusBadge,
                ...(organization.verification_status === "verified" ? styles.statusActive :
                    organization.verification_status === "rejected" ? styles.statusRejected :
                    styles.statusPending)
              }}>
                {organization.verification_status}
              </span>
            </div>
          </div>

          {/* About Organization */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>About Organization</h3>
            <p style={styles.sectionText}>
              {organization.company_description || "No description provided"}
            </p>
          </div>

          {/* Contact Information */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Contact Information</h3>
            <div style={styles.contactGrid}>
              <div style={styles.contactItem}>
                <span style={styles.contactLabel}>Email</span>
                <span style={styles.contactValue}>{organization.email}</span>
              </div>
              <div style={styles.contactItem}>
                <span style={styles.contactLabel}>Phone</span>
                <span style={styles.contactValue}>{organization.phone || 'N/A'}</span>
              </div>
              <div style={styles.contactItem}>
                <span style={styles.contactLabel}>Website</span>
                {organization.website ? (
                  <a href={organization.website} target="_blank" rel="noopener noreferrer" style={styles.link}>
                    {organization.website} <ExternalLink size={14} />
                  </a>
                ) : (
                  <span style={styles.contactValue}>N/A</span>
                )}
              </div>
              <div style={styles.contactItem}>
                <span style={styles.contactLabel}>Location</span>
                <span style={styles.contactValue}>
                  {organization.location ? 
                    (typeof organization.location === 'string' ? organization.location : JSON.stringify(organization.location)) 
                    : 'N/A'}
                </span>
              </div>
            </div>

            {contacts.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <h4 style={styles.subsectionTitle}>Additional Contacts</h4>
                {contacts.map(contact => (
                  <div key={contact.id} style={styles.contactCard}>
                    <div>
                      <strong>{contact.contact_name}</strong>
                      {contact.contact_role && <span style={styles.metadata}> - {contact.contact_role}</span>}
                    </div>
                    <div style={styles.metadata}>
                      {contact.contact_email} {contact.contact_phone && `• ${contact.contact_phone}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submitted Documents */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Submitted Documents</h3>
            {documents.length > 0 ? (
              <div style={styles.documentsGrid}>
                {documents.map(doc => (
                  <a
                    key={doc.id}
                    href={doc.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.documentLink}
                  >
                    {doc.document_name}
                    <Download size={16} />
                  </a>
                ))}
              </div>
            ) : (
              <p style={styles.emptyText}>No documents submitted</p>
            )}
          </div>

          {/* Compliance Information */}
          {compliance && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Compliance Status</h3>
              <div style={styles.complianceGrid}>
                <div style={styles.complianceItem}>
                  <span>Terms & Conditions</span>
                  <span style={compliance.terms_accepted ? styles.accepted : styles.notAccepted}>
                    {compliance.terms_accepted ? '✓ Accepted' : '✗ Not Accepted'}
                  </span>
                </div>
                <div style={styles.complianceItem}>
                  <span>Guidelines</span>
                  <span style={compliance.guidelines_accepted ? styles.accepted : styles.notAccepted}>
                    {compliance.guidelines_accepted ? '✓ Accepted' : '✗ Not Accepted'}
                  </span>
                </div>
                <div style={styles.complianceItem}>
                  <span>Privacy Policy</span>
                  <span style={compliance.privacy_policy_accepted ? styles.accepted : styles.notAccepted}>
                    {compliance.privacy_policy_accepted ? '✓ Accepted' : '✗ Not Accepted'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {organization.verification_status !== "verified" && (
            <div style={styles.actionButtons}>
              {!showRejectForm ? (
                <>
                  <button 
                    onClick={handleApprove} 
                    style={styles.approveButton}
                    disabled={loading}
                  >
                    <CheckCircle size={20} />
                    {loading ? 'Processing...' : 'Accept'}
                  </button>
                  <button 
                    onClick={() => setShowRejectForm(true)} 
                    style={styles.rejectButton}
                    disabled={loading}
                  >
                    <XCircle size={20} />
                    Reject
                  </button>
                </>
              ) : (
                <div style={styles.rejectForm}>
                  <label style={styles.rejectLabel}>Reason for Rejection</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a detailed reason for rejecting this organization..."
                    style={styles.rejectTextarea}
                    rows={4}
                  />
                  <div style={styles.rejectActions}>
                    <button 
                      onClick={() => setShowRejectForm(false)} 
                      style={styles.cancelButton}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleReject} 
                      style={styles.confirmRejectButton}
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : 'Confirm Rejection'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
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
    try {
      // First get profiles with student data
      const { data: profilesData, error: profilesError } = await supabase
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

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        return { data: [], error: profilesError };
      }

      // Get auth users data using RPC or directly query auth.users via a database function
      // For now, we'll fetch email from a custom RPC function you need to create
      const { data: authUsersData, error: authError } = await supabase
        .rpc('get_user_emails', { user_ids: profilesData.map(p => p.id) });

      // If RPC doesn't exist, try getting current user session and use profiles email field
      // Alternative: Add email to profiles table during signup
      const usersWithEmail = profilesData.map(user => {
        const authUser = authUsersData?.find(au => au.id === user.id);
        return {
          ...user,
          email: authUser?.email || user.email || 'N/A',
          is_active: authUser ? !authUser.banned_until : true,
          banned_until: authUser?.banned_until
        };
      });
      
      return { data: usersWithEmail, error: null };
    } catch (error) {
      console.error("Error in fetchUsers:", error);
      return { data: [], error };
    }
  };

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select(`
          id,
          organization_name,
          company_name,
          company_description,
          industry,
          company_size,
          location,
          website,
          logo_url,
          verification_status,
          verification_notes,
          total_recruited_interns,
          created_at,
          profiles!inner (
            username,
            display_name,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching organizations:", error);
        return { data: [], error };
      }

      // Try to get emails using RPC
      const { data: authUsersData } = await supabase
        .rpc('get_user_emails', { user_ids: data.map(o => o.id) });
      
      const orgsWithEmail = data.map(org => {
        const authUser = authUsersData?.find(au => au.id === org.id);
        return {
          ...org,
          email: authUser?.email || org.email || 'N/A',
          username: org.profiles?.username,
          display_name: org.profiles?.display_name,
          phone: org.profiles?.phone
        };
      });
      
      return { data: orgsWithEmail, error: null };
    } catch (error) {
      console.error("Error in fetchOrganizations:", error);
      return { data: [], error };
    }
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

      try {
        // Call RPC function to ban/unban user (you need to create this)
        const { data, error } = await supabase.rpc('toggle_user_ban', {
          user_id: id,
          should_ban: !newStatus
        });

        if (error) {
          console.error("Error updating user status:", error);
          // Revert on error
          setUsers(
            users.map((u) =>
              u.id === id ? { ...u, is_active: user.is_active } : u
            )
          );
          alert(`Failed to ${newStatus ? 'activate' : 'suspend'} user: ${error.message}`);
        } else {
          alert(`User ${newStatus ? 'activated' : 'suspended'} successfully`);
        }
      } catch (err) {
        console.error("Error:", err);
        // Revert on error
        setUsers(
          users.map((u) =>
            u.id === id ? { ...u, is_active: user.is_active } : u
          )
        );
        alert("An error occurred while updating user status");
      }
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

    try {
      const { error } = await supabase
        .from('organizations')
        .update({ 
          verification_status: newStatus,
          verification_notes: newStatus === "verified" ? "Approved by admin" : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error("Error updating verification status:", error);
        // Revert on error
        setOrganizations(
          organizations.map((o) =>
            o.id === id ? { ...o, verification_status: org.verification_status } : o
          )
        );
        alert("Failed to update verification status");
      } else {
        alert(`Organization ${newStatus === "verified" ? "approved" : "unapproved"} successfully`);
      }
    } catch (err) {
      console.error("Error:", err);
      // Revert on error
      setOrganizations(
        organizations.map((o) =>
          o.id === id ? { ...o, verification_status: org.verification_status } : o
        )
      );
    }
  };

  const handleViewProfile = (id, type) => {
    if (type === "organizations") {
      const org = organizations.find(o => o.id === id);
      setSelectedOrg(org);
    } else {
      console.log(`Viewing student profile for user ID: ${id}`);
    }
  };

  const handleApproveOrganization = async (id) => {
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ 
          verification_status: 'verified',
          verification_notes: 'Approved by admin',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error("Error approving organization:", error);
        throw error;
      }

      // Update local state
      setOrganizations(
        organizations.map((o) =>
          o.id === id ? { 
            ...o, 
            verification_status: 'verified', 
            verification_notes: 'Approved by admin' 
          } : o
        )
      );

      setSelectedOrg(null);
      alert("Organization approved successfully!");
      
      // Refresh data to ensure sync
      await fetchDashboardData();
    } catch (err) {
      console.error("Error approving organization:", err);
      alert(`Failed to approve organization: ${err.message}`);
    }
  };

  const handleRejectOrganization = async (id, reason) => {
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ 
          verification_status: 'rejected',
          verification_notes: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error("Error rejecting organization:", error);
        throw error;
      }

      // Update local state
      setOrganizations(
        organizations.map((o) =>
          o.id === id ? { 
            ...o, 
            verification_status: 'rejected', 
            verification_notes: reason 
          } : o
        )
      );

      setSelectedOrg(null);
      alert("Organization rejected successfully");
      
      // Refresh data to ensure sync
      await fetchDashboardData();
    } catch (err) {
      console.error("Error rejecting organization:", err);
      alert(`Failed to reject organization: ${err.message}`);
    }
  };

  const handleSeeMore = () => {
    setVisibleCount((prev) => prev + 5);
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
                        {item.is_active ? "Active" : "Suspended"}
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
                            {item.is_active ? "Active" : "Suspended"}
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

      {/* Organization Detail Modal */}
      {selectedOrg && (
        <OrganizationDetailModal
          organization={selectedOrg}
          onClose={() => setSelectedOrg(null)}
          onApprove={handleApproveOrganization}
          onReject={handleRejectOrganization}
        />
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f9fafb",
    padding: "40px 20px",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
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
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "20px",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "800px",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
  },
  modalHeader: {
    padding: "20px",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "flex-end",
    position: "sticky",
    top: 0,
    backgroundColor: "white",
    zIndex: 10,
  },
  closeButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#6b7280",
    padding: "4px",
  },
  modalBody: {
    padding: "30px",
  },
  orgHeader: {
    display: "flex",
    gap: "20px",
    alignItems: "center",
    marginBottom: "30px",
    paddingBottom: "20px",
    borderBottom: "1px solid #e5e7eb",
  },
  orgLogo: {
    width: "80px",
    height: "80px",
    borderRadius: "8px",
    objectFit: "cover",
  },
  orgLogoPlaceholder: {
    width: "80px",
    height: "80px",
    borderRadius: "8px",
    backgroundColor: "#f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  orgName: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#111827",
    marginBottom: "8px",
  },
  section: {
    marginBottom: "30px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#111827",
    marginBottom: "16px",
  },
  sectionText: {
    fontSize: "14px",
    color: "#374151",
    lineHeight: "1.6",
  },
  subsectionTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "12px",
  },
  contactGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "16px",
  },
  contactItem: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  contactLabel: {
    fontSize: "12px",
    color: "#6b7280",
    textTransform: "uppercase",
    fontWeight: "600",
  },
  contactValue: {
    fontSize: "14px",
    color: "#111827",
  },
  contactCard: {
    padding: "12px",
    backgroundColor: "#f9fafb",
    borderRadius: "6px",
    marginBottom: "8px",
  },
  link: {
    fontSize: "14px",
    color: "#3b82f6",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  documentsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  documentLink: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    backgroundColor: "#f9fafb",
    borderRadius: "6px",
    color: "#3b82f6",
    textDecoration: "none",
    fontSize: "14px",
    transition: "background-color 0.2s",
  },
  complianceGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  complianceItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    backgroundColor: "#f9fafb",
    borderRadius: "6px",
    fontSize: "14px",
  },
  accepted: {
    color: "#065f46",
    fontWeight: "500",
  },
  notAccepted: {
    color: "#991b1b",
    fontWeight: "500",
  },
  actionButtons: {
    display: "flex",
    gap: "12px",
    marginTop: "30px",
    paddingTop: "20px",
    borderTop: "1px solid #e5e7eb",
  },
  approveButton: {
    flex: 1,
    padding: "12px 24px",
    fontSize: "16px",
    fontWeight: "500",
    color: "white",
    backgroundColor: "#10b981",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "background-color 0.2s",
  },
  rejectButton: {
    flex: 1,
    padding: "12px 24px",
    fontSize: "16px",
    fontWeight: "500",
    color: "white",
    backgroundColor: "#ef4444",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "background-color 0.2s",
  },
  rejectForm: {
    width: "100%",
  },
  rejectLabel: {
    display: "block",
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
    marginBottom: "8px",
  },
  rejectTextarea: {
    width: "100%",
    padding: "12px",
    fontSize: "14px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    resize: "vertical",
    fontFamily: "inherit",
    marginBottom: "12px",
  },
  rejectActions: {
    display: "flex",
    gap: "12px",
  },
  cancelButton: {
    flex: 1,
    padding: "10px 24px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
    backgroundColor: "#f3f4f6",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  confirmRejectButton: {
    flex: 1,
    padding: "10px 24px",
    fontSize: "14px",
    fontWeight: "500",
    color: "white",
    backgroundColor: "#ef4444",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default AdminDashboard;