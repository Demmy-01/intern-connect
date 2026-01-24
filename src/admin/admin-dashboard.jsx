import React, { useState, useEffect } from "react";
import {
  Users,
  Building2,
  Briefcase,
  FileText,
  X,
  CheckCircle,
  XCircle,
  Download,
  ExternalLink,
  Mail,
  Trash2,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import internshipService from "../lib/internshipService.js";
import adminActivityService from "../lib/adminActivityService.js";

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

// Student Profile Modal Component
const StudentProfileModal = ({ student, onClose, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!deleteReason.trim()) {
      alert("Please provide a reason for deletion");
      return;
    }
    setLoading(true);
    try {
      await onDelete(student.id, deleteReason);
    } finally {
      setLoading(false);
    }
  };

  if (!student) return null;

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        <div style={styles.modalBody}>
          {/* Student Header */}
          <div style={styles.orgHeader}>
            {student.avatar_url ? (
              <img
                src={student.avatar_url}
                alt="Avatar"
                style={styles.orgLogo}
              />
            ) : (
              <div style={styles.orgLogoPlaceholder}>
                <Users size={40} color="#6b7280" />
              </div>
            )}
            <div>
              <h2 style={styles.orgName}>
                {student.display_name || student.username}
              </h2>
              <span
                style={{
                  ...styles.statusBadge,
                  ...(student.is_active
                    ? styles.statusActive
                    : styles.statusInactive),
                }}
              >
                {student.is_active ? "Active" : "Suspended"}
              </span>
            </div>
          </div>

          {/* Personal Information */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Personal Information</h3>
            <div style={styles.contactGrid}>
              <div style={styles.contactItem}>
                <span style={styles.contactLabel}>Username</span>
                <span style={styles.contactValue}>{student.username}</span>
              </div>
              <div style={styles.contactItem}>
                <span style={styles.contactLabel}>Display Name</span>
                <span style={styles.contactValue}>
                  {student.display_name || "N/A"}
                </span>
              </div>
              <div style={styles.contactItem}>
                <span style={styles.contactLabel}>Email</span>
                <span style={styles.contactValue}>{student.email}</span>
              </div>
              <div style={styles.contactItem}>
                <span style={styles.contactLabel}>Phone</span>
                <span style={styles.contactValue}>
                  {student.phone || "N/A"}
                </span>
              </div>
              <div style={styles.contactItem}>
                <span style={styles.contactLabel}>Account Created</span>
                <span style={styles.contactValue}>
                  {new Date(student.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Bio */}
          {student.students?.bio && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Bio</h3>
              <p style={styles.sectionText}>{student.students.bio}</p>
            </div>
          )}

          {/* Delete Button */}
          {!showDeleteConfirm ? (
            <div style={styles.actionButtons}>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                style={styles.deleteButton}
                disabled={loading}
              >
                <XCircle size={20} />
                Delete User
              </button>
            </div>
          ) : (
            <div style={styles.actionButtons}>
              <div style={styles.rejectForm}>
                <label style={styles.rejectLabel}>Reason for Deletion</label>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Please provide a detailed reason for deleting this user account..."
                  style={styles.rejectTextarea}
                  rows={4}
                />
                <div style={styles.rejectActions}>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    style={styles.cancelButton}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    style={styles.confirmRejectButton}
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Confirm Deletion"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Logout Confirmation Modal Component
const LogoutConfirmModal = ({ onClose, onConfirm }) => {
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div
        style={{ ...styles.modalContent, maxWidth: "400px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.modalBody}>
          <h2
            style={{
              ...styles.orgName,
              textAlign: "center",
              marginBottom: "16px",
            }}
          >
            Confirm Logout
          </h2>
          <p
            style={{
              ...styles.sectionText,
              textAlign: "center",
              marginBottom: "24px",
            }}
          >
            Are you sure you want to log out of your admin account?
          </p>
          <div style={styles.rejectActions}>
            <button onClick={onClose} style={styles.cancelButton}>
              Cancel
            </button>
            <button onClick={onConfirm} style={styles.confirmRejectButton}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Organization Detail Modal Component
const OrganizationDetailModal = ({
  organization,
  onClose,
  onApprove,
  onReject,
}) => {
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
      // Fetch documents from database
      const { data: docsData, error: docsError } = await supabase
        .from("organization_documents")
        .select("*")
        .eq("organization_id", organization.id);

      if (docsError) {
        console.error("Error fetching documents:", docsError);
      }

      // For each document, get the signed URL from storage
      if (docsData && docsData.length > 0) {
        const documentsWithUrls = await Promise.all(
          docsData.map(async (doc) => {
            try {
              // Extract the file path from document_url
              // If document_url is already a full URL, extract the path
              let filePath = doc.document_url;

              // If it's a full URL, extract just the path part
              if (filePath.includes("organization-documents/")) {
                const pathMatch = filePath.match(
                  /organization-documents\/(.+)$/
                );
                if (pathMatch) {
                  filePath = pathMatch[0]; // Keep the full path including folder
                }
              }

              // Get signed URL from storage
              const { data: urlData, error: urlError } = await supabase.storage
                .from("organization-documents")
                .createSignedUrl(filePath, 3600); // URL valid for 1 hour

              if (urlError) {
                console.error(
                  `Error getting signed URL for ${doc.document_name}:`,
                  urlError
                );
                return {
                  ...doc,
                  downloadUrl: doc.document_url, // Fallback to original URL
                };
              }

              return {
                ...doc,
                downloadUrl: urlData.signedUrl,
              };
            } catch (err) {
              console.error(
                `Error processing document ${doc.document_name}:`,
                err
              );
              return {
                ...doc,
                downloadUrl: doc.document_url,
              };
            }
          })
        );
        setDocuments(documentsWithUrls);
      } else {
        setDocuments([]);
      }

      // Fetch contacts
      const { data: contactsData } = await supabase
        .from("organization_contacts")
        .select("*")
        .eq("organization_id", organization.id);
      setContacts(contactsData || []);

      // Fetch compliance
      const { data: complianceData } = await supabase
        .from("organization_compliance")
        .select("*")
        .eq("organization_id", organization.id)
        .single();
      setCompliance(complianceData);
    } catch (error) {
      console.error("Error fetching organization details:", error);
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
              <img
                src={organization.logo_url}
                alt="Logo"
                style={styles.orgLogo}
              />
            ) : (
              <div style={styles.orgLogoPlaceholder}>
                <Building2 size={40} color="#6b7280" />
              </div>
            )}
            <div>
              <h2 style={styles.orgName}>{organization.organization_name}</h2>
              <span
                style={{
                  ...styles.statusBadge,
                  ...(organization.verification_status === "verified"
                    ? styles.statusActive
                    : organization.verification_status === "rejected"
                    ? styles.statusRejected
                    : styles.statusPending),
                }}
              >
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
                <span style={styles.contactValue}>
                  {organization.phone || "N/A"}
                </span>
              </div>
              <div style={styles.contactItem}>
                <span style={styles.contactLabel}>Website</span>
                {organization.website ? (
                  <a
                    href={organization.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.link}
                  >
                    {organization.website} <ExternalLink size={14} />
                  </a>
                ) : (
                  <span style={styles.contactValue}>N/A</span>
                )}
              </div>
              <div style={styles.contactItem}>
                <span style={styles.contactLabel}>Location</span>
                <span style={styles.contactValue}>
                  {organization.location
                    ? typeof organization.location === "string"
                      ? organization.location
                      : JSON.stringify(organization.location)
                    : "N/A"}
                </span>
              </div>
            </div>

            {contacts.length > 0 && (
              <div style={{ marginTop: "20px" }}>
                <h4 style={styles.subsectionTitle}>Additional Contacts</h4>
                {contacts.map((contact) => (
                  <div key={contact.id} style={styles.contactCard}>
                    <div>
                      <strong>{contact.contact_name}</strong>
                      {contact.contact_role && (
                        <span style={styles.metadata}>
                          {" "}
                          - {contact.contact_role}
                        </span>
                      )}
                    </div>
                    <div style={styles.metadata}>
                      {contact.contact_email}{" "}
                      {contact.contact_phone && `• ${contact.contact_phone}`}
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
                {documents.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.documentLink}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                      }}
                    >
                      <span style={{ fontWeight: "500" }}>
                        {doc.document_name}
                      </span>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          textTransform: "capitalize",
                        }}
                      >
                        {doc.document_type.replace("_", " ")}
                      </span>
                    </div>
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
                  <span
                    style={
                      compliance.terms_accepted
                        ? styles.accepted
                        : styles.notAccepted
                    }
                  >
                    {compliance.terms_accepted
                      ? "✓ Accepted"
                      : "✗ Not Accepted"}
                  </span>
                </div>
                <div style={styles.complianceItem}>
                  <span>Guidelines</span>
                  <span
                    style={
                      compliance.guidelines_accepted
                        ? styles.accepted
                        : styles.notAccepted
                    }
                  >
                    {compliance.guidelines_accepted
                      ? "✓ Accepted"
                      : "✗ Not Accepted"}
                  </span>
                </div>
                <div style={styles.complianceItem}>
                  <span>Privacy Policy</span>
                  <span
                    style={
                      compliance.privacy_policy_accepted
                        ? styles.accepted
                        : styles.notAccepted
                    }
                  >
                    {compliance.privacy_policy_accepted
                      ? "✓ Accepted"
                      : "✗ Not Accepted"}
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
                    {loading ? "Processing..." : "Accept"}
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
                      {loading ? "Processing..." : "Confirm Rejection"}
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
  const [contactMessages, setContactMessages] = useState([]);
  const [internshipsList, setInternshipsList] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrganizations: 0,
    activeInternships: 0,
    totalApplications: 0,
    totalMessages: 0,
    unreadMessages: 0,
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
      const [
        usersResult,
        orgsResult,
        internshipsResult,
        applicationsResult,
        messagesResult,
      ] = await Promise.all([
        fetchUsers(),
        fetchOrganizations(),
        fetchInternships(),
        fetchApplications(),
        fetchContactMessages(),
      ]);

      if (usersResult.error) throw usersResult.error;
      if (orgsResult.error) throw orgsResult.error;
      if (internshipsResult.error) throw internshipsResult.error;
      if (applicationsResult.error) throw applicationsResult.error;

      setUsers(usersResult.data || []);
      setOrganizations(orgsResult.data || []);
      setInternshipsList(internshipsResult.data || []);
      setContactMessages(messagesResult.data || []);

      const messagesData = messagesResult.data || [];
      const unreadCount = messagesData.filter(
        (m) => m.status === "unread"
      ).length;

      setStats({
        totalUsers: usersResult.data?.length || 0,
        totalOrganizations: orgsResult.data?.length || 0,
        activeInternships:
          internshipsResult.data?.filter((i) => i.is_active).length || 0,
        totalApplications: applicationsResult.data?.length || 0,
        totalMessages: messagesData.length,
        unreadMessages: unreadCount,
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
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select(
          `
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
        `
        )
        .order("created_at", { ascending: false });

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        return { data: [], error: profilesError };
      }

      if (!profilesData || profilesData.length === 0) {
        return { data: [], error: null };
      }

      // SECURITY: In production, admin operations should go to a backend API
      // Client cannot access auth.admin APIs securely
      // For now, we'll use data from profiles table which should have email
      const usersWithEmail = profilesData.map((user) => ({
        ...user,
        email: user.email || "N/A",
        is_active: true,
      }));

      return { data: usersWithEmail, error: null };
    } catch (error) {
      console.error("Error in fetchUsers:", error);
      return { data: [], error };
    }
  };

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from("organizations")
        .select(
          `
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
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching organizations:", error);
        return { data: [], error };
      }

      if (!data || data.length === 0) {
        return { data: [], error: null };
      }

      const { data: authData, error: authError } =
        await supabaseAdmin.auth.admin.listUsers();

      if (authError) {
        console.error("Error fetching auth users:", authError);
      }

      const orgsWithEmail = data.map((org) => {
        const authUser = authData?.users?.find((au) => au.id === org.id);

        return {
          ...org,
          email: authUser?.email || "N/A",
          username: org.profiles?.username,
          display_name: org.profiles?.display_name,
          phone: org.profiles?.phone,
        };
      });

      return { data: orgsWithEmail, error: null };
    } catch (error) {
      console.error("Error in fetchOrganizations:", error);
      return { data: [], error };
    }
  };

  const fetchInternships = async () => {
    try {
      const { data, error } = await supabase
        .from("internships")
        .select(
          `id, position_title, organization_id, is_active, created_at, organizations!inner(organization_name)`
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching internships:", error);
        return { data: [], error };
      }

      return { data: data || [], error: null };
    } catch (err) {
      console.error("Error in fetchInternships:", err);
      return { data: [], error: err };
    }
  };

  const handleDeleteInternship = async (id) => {
    if (!window.confirm("Are you sure you want to delete this internship?"))
      return;
    try {
      const { error } = await internshipService.deleteInternship(id);
      if (error) throw new Error(error);
      setInternshipsList((prev) => prev.filter((i) => i.id !== id));
      setStats((s) => ({
        ...s,
        activeInternships: Math.max(0, s.activeInternships - 1),
      }));
      alert("Internship deleted successfully");
    } catch (err) {
      console.error("Failed to delete internship:", err);
      alert("Failed to delete internship: " + (err.message || err));
    }
  };

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from("internship_applications")
      .select("id");

    return { data, error };
  };

  const fetchContactMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching contact messages:", error);
        return { data: [], error };
      }

      return { data: data || [], error: null };
    } catch (err) {
      console.error("Error in fetchContactMessages:", err);
      return { data: [], error: err };
    }
  };

  const handleToggle = async (id, type) => {
    if (type === "users") {
      const user = users.find((u) => u.id === id);
      const newStatus = !user.is_active;

      setUsers(
        users.map((u) => (u.id === id ? { ...u, is_active: newStatus } : u))
      );

      try {
        if (newStatus) {
          const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
            id,
            {
              ban_duration: "none",
            }
          );

          if (error) {
            console.error("Error activating user:", error);
            setUsers(
              users.map((u) =>
                u.id === id ? { ...u, is_active: user.is_active } : u
              )
            );
            alert(`Failed to activate user: ${error.message}`);
          } else {
            alert("User activated successfully");
            await fetchDashboardData();
          }
        } else {
          const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
            id,
            {
              ban_duration: "876000h",
            }
          );

          if (error) {
            console.error("Error suspending user:", error);
            setUsers(
              users.map((u) =>
                u.id === id ? { ...u, is_active: user.is_active } : u
              )
            );
            alert(`Failed to suspend user: ${error.message}`);
          } else {
            alert("User suspended successfully");
            await fetchDashboardData();
          }
        }
      } catch (err) {
        console.error("Caught error:", err);
        setUsers(
          users.map((u) =>
            u.id === id ? { ...u, is_active: user.is_active } : u
          )
        );
        alert("An error occurred while updating user status: " + err.message);
      }
    }
  };

  const handleApprovalToggle = async (id) => {
    const org = organizations.find((o) => o.id === id);
    const newStatus =
      org.verification_status === "verified" ? "pending" : "verified";

    setOrganizations(
      organizations.map((o) =>
        o.id === id ? { ...o, verification_status: newStatus } : o
      )
    );

    try {
      const { data, error } = await supabase
        .from("organizations")
        .update({
          verification_status: newStatus,
          verification_notes:
            newStatus === "verified" ? "Approved by admin" : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select();

      if (error) {
        console.error("Error updating verification status:", error);
        setOrganizations(
          organizations.map((o) =>
            o.id === id
              ? { ...o, verification_status: org.verification_status }
              : o
          )
        );
        alert("Failed to update verification status: " + error.message);
      } else {
        alert(
          `Organization ${
            newStatus === "verified" ? "approved" : "unapproved"
          } successfully`
        );
      }
    } catch (err) {
      console.error("Error:", err);
      setOrganizations(
        organizations.map((o) =>
          o.id === id
            ? { ...o, verification_status: org.verification_status }
            : o
        )
      );
      alert("An error occurred: " + err.message);
    }
  };

  const handleViewProfile = (id, type) => {
    if (type === "organizations") {
      const org = organizations.find((o) => o.id === id);
      setSelectedOrg(org);
    } else {
      const student = users.find((u) => u.id === id);
      setSelectedStudent(student);
    }
  };

  const handleDeleteUser = async (id, reason) => {
    try {
      console.log("Starting user deletion process for:", id);

      // Use the service role client to delete in correct order
      // Delete all foreign key references first

      // 1. Delete internship applications (references students table)
      const { error: appsError } = await supabase
        .from("internship_applications")
        .delete()
        .eq("student_id", id);

      if (appsError) {
        console.error("Error deleting applications:", appsError);
      }

      // 2. Delete student skills
      const { error: skillsError } = await supabase
        .from("student_skills")
        .delete()
        .eq("student_id", id);

      if (skillsError) {
        console.error("Error deleting skills:", skillsError);
      }

      // 3. Delete student education
      const { error: eduError } = await supabase
        .from("student_education")
        .delete()
        .eq("student_id", id);

      if (eduError) {
        console.error("Error deleting education:", eduError);
      }

      // 4. Delete experiences
      const { error: expError } = await supabase
        .from("experiences")
        .delete()
        .eq("student_id", id);

      if (expError) {
        console.error("Error deleting experiences:", expError);
      }

      // 5. Delete from students table (references profiles)
      const { error: studentError } = await supabase
        .from("students")
        .delete()
        .eq("id", id);

      if (studentError) {
        console.error("Error deleting from students table:", studentError);
        throw new Error(
          `Failed to delete student record: ${studentError.message}`
        );
      }

      // 6. Delete from profiles table (references auth.users)
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", id);

      if (profileError) {
        console.error("Error deleting from profiles table:", profileError);
        throw new Error(`Failed to delete profile: ${profileError.message}`);
      }

      // 7. Finally, delete from auth.users using admin client
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
        id
      );

      if (authError) {
        console.error("Error deleting user from auth:", authError);
        throw new Error(`Failed to delete auth user: ${authError.message}`);
      }

      console.log("User deleted successfully");

      // Log activity
      await adminActivityService.logActivity(
        'delete_user',
        'user',
        id,
        { reason: reason || 'Admin deletion' }
      );

      // Update local state
      setUsers(users.filter((u) => u.id !== id));

      // Update stats
      setStats((prev) => ({
        ...prev,
        totalUsers: prev.totalUsers - 1,
      }));

      setSelectedStudent(null);
      alert("User deleted successfully!");

      // Refresh data
      await fetchDashboardData();
    } catch (err) {
      console.error("Error deleting user:", err);
      alert(`Failed to delete user: ${err.message}`);
      // Refresh to get accurate state
      await fetchDashboardData();
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error logging out:", error);
        alert("Failed to logout: " + error.message);
      } else {
        window.location.href = "/icn-admin-login";
      }
    } catch (err) {
      console.error("Error:", err);
      alert("An error occurred while logging out");
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?"))
      return;
    try {
      const { error } = await supabase
        .from("contact_messages")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Log activity
      await adminActivityService.logActivity(
        'delete_message',
        'contact_message',
        id
      );

      setContactMessages((prev) => prev.filter((m) => m.id !== id));
      setStats((prev) => ({
        ...prev,
        totalMessages: Math.max(0, prev.totalMessages - 1),
        unreadMessages:
          contactMessages.find((m) => m.id === id)?.status === "unread"
            ? Math.max(0, prev.unreadMessages - 1)
            : prev.unreadMessages,
      }));
      alert("Message deleted successfully");
    } catch (err) {
      console.error("Failed to delete message:", err);
      alert("Failed to delete message: " + (err.message || err));
    }
  };

  const handleApproveOrganization = async (id) => {
    try {
      const { data, error } = await supabase
        .from("organizations")
        .update({
          verification_status: "verified",
          verification_notes: "Approved by admin",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select();

      if (error) {
        console.error("Error approving organization:", error);
        throw error;
      }

      console.log("Approval successful:", data);

      // Log activity
      await adminActivityService.logActivity(
        'approve_organization',
        'organization',
        id
      );

      setOrganizations(
        organizations.map((o) =>
          o.id === id
            ? {
                ...o,
                verification_status: "verified",
                verification_notes: "Approved by admin",
              }
            : o
        )
      );

      setSelectedOrg(null);
      alert("Organization approved successfully!");

      await fetchDashboardData();
    } catch (err) {
      console.error("Error approving organization:", err);
      alert(`Failed to approve organization: ${err.message}`);
    }
  };

  const handleRejectOrganization = async (id, reason) => {
    try {
      const { data, error } = await supabase
        .from("organizations")
        .update({
          verification_status: "rejected",
          verification_notes: reason,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select();

      if (error) {
        console.error("Error rejecting organization:", error);
        throw error;
      }

      console.log("Rejection successful:", data);

      // Log activity
      await adminActivityService.logActivity(
        'reject_organization',
        'organization',
        id,
        { reason }
      );

      setOrganizations(
        organizations.map((o) =>
          o.id === id
            ? {
                ...o,
                verification_status: "rejected",
                verification_notes: reason,
              }
            : o
        )
      );

      setSelectedOrg(null);
      alert("Organization rejected successfully");

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
        <div>
          <h1 style={styles.title}>Admin Dashboard</h1>
          <p style={styles.subtitle}>
            Manage all platform activities from one place.
          </p>
        </div>
        <button
          onClick={() => setShowLogoutModal(true)}
          style={styles.logoutButton}
        >
          Logout
        </button>
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
        <TabButton
          active={activeTab === "messages"}
          onClick={() => {
            setActiveTab("messages");
            setVisibleCount(10);
          }}
        >
          Messages ({stats.unreadMessages})
        </TabButton>
        <TabButton
          active={activeTab === "internships"}
          onClick={() => {
            setActiveTab("internships");
            setVisibleCount(10);
          }}
        >
          Internships
        </TabButton>
      </div>

      <div style={styles.manageSection}>
        <div>
          <h2 style={styles.manageTitle}>
            Manage{" "}
            {activeTab === "users"
              ? "Users"
              : activeTab === "organizations"
              ? "Organizations"
              : "Contact Messages"}
          </h2>
          <p style={styles.manageSubtitle}>
            {activeTab === "users"
              ? "View, suspend, or manage user accounts."
              : activeTab === "organizations"
              ? "View, suspend, or verify organization accounts."
              : "View and manage contact messages from users."}
          </p>
        </div>

        {activeTab === "messages" ? (
          // Messages View
          contactMessages.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={styles.emptyText}>No contact messages found.</p>
            </div>
          ) : (
            <>
              <div style={styles.messagesContainer}>
                {contactMessages.slice(0, visibleCount).map((msg) => (
                  <div key={msg.id} style={styles.messageCard}>
                    <div style={styles.messageHeader}>
                      <div>
                        <h3 style={styles.messageName}>{msg.full_name}</h3>
                        <p style={styles.messageEmail}>{msg.email}</p>
                        {msg.phone_number && (
                          <p style={styles.messagePhone}>{msg.phone_number}</p>
                        )}
                      </div>
                      <div style={styles.messageMetadata}>
                        <div style={styles.messageActions}>
                          <span
                            style={{
                              ...styles.statusBadge,
                              ...(msg.status === "unread"
                                ? styles.statusUnread
                                : msg.status === "read"
                                ? styles.statusRead
                                : styles.statusReplied),
                            }}
                          >
                            {msg.status.charAt(0).toUpperCase() +
                              msg.status.slice(1)}
                          </span>
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            style={styles.deleteMessageButton}
                            title="Delete message"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <span style={styles.messageDate}>
                          {new Date(msg.created_at).toLocaleDateString()}{" "}
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <div style={styles.messageBody}>
                      <p>{msg.message}</p>
                    </div>
                  </div>
                ))}
              </div>
              {visibleCount < contactMessages.length && (
                <div style={styles.seeMoreContainer}>
                  <button
                    onClick={() => setVisibleCount(visibleCount + 10)}
                    style={styles.seeMoreButton}
                  >
                    Load More Messages
                  </button>
                </div>
              )}
            </>
          )
        ) : activeTab === "internships" ? (
          // Internships admin view
          internshipsList.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={styles.emptyText}>No internships found.</p>
            </div>
          ) : (
            <>
              <div style={styles.tableContainer}>
                <div style={styles.tableHeader}>
                  <div style={styles.tableHeaderCell}>Position</div>
                  <div style={styles.tableHeaderCell}>Organization</div>
                  <div style={styles.tableHeaderCell}>Status</div>
                  <div style={styles.tableHeaderCell}>Actions</div>
                </div>

                {internshipsList.slice(0, visibleCount).map((item) => (
                  <div key={item.id} style={styles.tableRow}>
                    <div style={styles.tableCell}>{item.position_title}</div>
                    <div style={styles.tableCell}>
                      {item.organizations?.organization_name || "N/A"}
                    </div>
                    <div style={styles.tableCell}>
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
                    </div>
                    <div style={styles.tableCellActions}>
                      <button
                        onClick={() =>
                          window.location.assign(`/edit-internship/${item.id}`)
                        }
                        style={styles.viewButton}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteInternship(item.id)}
                        style={{
                          ...styles.viewButton,
                          backgroundColor: "#ef4444",
                          color: "white",
                          border: "none",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {visibleCount < internshipsList.length && (
                <div style={styles.seeMoreContainer}>
                  <button
                    onClick={() => setVisibleCount(visibleCount + 10)}
                    style={styles.seeMoreButton}
                  >
                    Load More Internships
                  </button>
                </div>
              )}
            </>
          )
        ) : currentData.length === 0 ? (
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
                        {item.display_name ||
                          item.organization_name ||
                          item.username}
                      </span>
                      {activeTab === "organizations" && item.company_size && (
                        <span style={styles.metadata}>
                          {item.company_size} employees
                        </span>
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
                  See More ({Math.min(5, currentData.length - visibleCount)}{" "}
                  more)
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {selectedOrg && (
        <OrganizationDetailModal
          organization={selectedOrg}
          onClose={() => setSelectedOrg(null)}
          onApprove={handleApproveOrganization}
          onReject={handleRejectOrganization}
        />
      )}

      {selectedStudent && (
        <StudentProfileModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onDelete={handleDeleteUser}
        />
      )}

      {showLogoutModal && (
        <LogoutConfirmModal
          onClose={() => setShowLogoutModal(false)}
          onConfirm={handleLogout}
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
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
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
  logoutButton: {
    padding: "10px 24px",
    fontSize: "14px",
    fontWeight: "500",
    color: "white",
    backgroundColor: "#ef4444",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.2s",
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
  deleteButton: {
    flex: 1,
    padding: "12px 24px",
    fontSize: "16px",
    fontWeight: "500",
    color: "white",
    backgroundColor: "#dc2626",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "background-color 0.2s",
  },
  // Messages styles
  messagesContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  messageCard: {
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    padding: "20px",
    borderLeft: "4px solid #3b82f6",
  },
  messageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "12px",
  },
  messageName: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#111827",
    margin: "0 0 4px 0",
  },
  messageEmail: {
    fontSize: "14px",
    color: "#6b7280",
    margin: "0",
  },
  messagePhone: {
    fontSize: "14px",
    color: "#6b7280",
    margin: "4px 0 0 0",
  },
  messageMetadata: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "8px",
  },
  messageActions: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  deleteMessageButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#ef4444",
    padding: "4px 8px",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.2s",
  },
  messageDate: {
    fontSize: "12px",
    color: "#9ca3af",
  },
  messageBody: {
    backgroundColor: "#f9fafb",
    padding: "12px",
    borderRadius: "6px",
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#374151",
  },
  statusUnread: {
    backgroundColor: "#3b82f6",
    color: "white",
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "500",
  },
  statusRead: {
    backgroundColor: "#6b7280",
    color: "white",
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "500",
  },
  statusReplied: {
    backgroundColor: "#10b981",
    color: "white",
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "500",
  },
};

export default AdminDashboard;
