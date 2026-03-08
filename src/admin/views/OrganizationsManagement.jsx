import React, { useState, useEffect } from "react";
import { Search, Building2, CheckCircle, XCircle, MoreVertical } from "lucide-react";
import { supabase } from "../../lib/supabase";
import Badge from "../components/ui/Badge";
import TableSkeleton from "../components/ui/TableSkeleton";
import { toast } from "sonner"; // Assuming sonner is set up globally

export default function OrganizationsManagement() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("organizations")
        .select(`
          id, organization_name, created_at,
          profiles (display_name),
          internships (id)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formatted = data.map((org) => ({
        id: org.id,
        name: org.organization_name || "Unnamed Org",
        email: "No Email Provided", // Removed due to missing db column
        industry: "Technology", // Mocking industry as it might not be explicitly in this schema grab
        isVerified: false,
        internshipsPosted: org.internships?.length || 0,
        joinedAt: new Date(org.created_at).toLocaleDateString(),
      }));

      setOrganizations(formatted);
    } catch (error) {
      console.error("Error fetching organizations:", error);
      toast.error("Failed to load organizations");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVerification = async (orgId, currentStatus) => {
    toast.info("Verification toggle depends on a missing DB column. Feature mock-only until schema is updated.");
  };

  const filteredOrgs = organizations.filter(
    (o) =>
      o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Organizations Management</h1>
          <p style={styles.subtitle}>Review, verify, and monitor companies on the platform.</p>
        </div>
        <div style={styles.searchBox}>
          <Search size={18} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search organizations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      <div style={styles.tableCard}>
        {loading ? (
          <TableSkeleton rows={5} columns={5} />
        ) : filteredOrgs.length === 0 ? (
          <div style={styles.emptyState}>No organizations found matching your search.</div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Company Name</th>
                  <th style={styles.th}>Contact Info</th>
                  <th style={styles.th}>Internships Posted</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrgs.map((org) => (
                  <tr key={org.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.nameCell}>
                        <div style={styles.avatar}>
                          <Building2 size={18} />
                        </div>
                        <div>
                          <p style={styles.primaryText}>{org.name}</p>
                          <p style={styles.secondaryText}>Joined {org.joinedAt}</p>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <p style={styles.primaryText}>{org.email}</p>
                      <p style={styles.secondaryText}>{org.industry}</p>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.countBadge}>{org.internshipsPosted}</span>
                    </td>
                    <td style={styles.td}>
                      <Badge 
                        status={org.isVerified ? "verified" : "unverified"} 
                      />
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button 
                          style={styles.iconButton} 
                          title={org.isVerified ? "Revoke Verification" : "Verify Organization"}
                          onClick={() => handleToggleVerification(org.id, org.isVerified)}
                        >
                          {org.isVerified ? (
                            <XCircle size={18} color="#ef4444" />
                          ) : (
                            <CheckCircle size={18} color="#10b981" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0 0 8px 0",
    fontFamily: "'Inter', sans-serif",
  },
  subtitle: {
    fontSize: "15px",
    color: "#64748b",
    margin: 0,
    fontFamily: "'Inter', sans-serif",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "8px 16px",
    width: "300px",
  },
  searchIcon: {
    color: "#94a3b8",
    marginRight: "8px",
  },
  searchInput: {
    border: "none",
    outline: "none",
    width: "100%",
    fontSize: "14px",
    color: "#0f172a",
  },
  tableCard: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  th: {
    padding: "16px 24px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    borderBottom: "1px solid #e2e8f0",
    backgroundColor: "#f8fafc",
  },
  tr: {
    borderBottom: "1px solid #f1f5f9",
    transition: "background-color 0.2s",
  },
  td: {
    padding: "16px 24px",
    verticalAlign: "middle",
  },
  nameCell: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "8px", // Square with rounded corners for orgs
    backgroundColor: "#f3f4f6",
    color: "#6b7280",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: {
    margin: "0 0 4px 0",
    fontSize: "14px",
    fontWeight: "600",
    color: "#0f172a",
  },
  secondaryText: {
    margin: 0,
    fontSize: "13px",
    color: "#64748b",
  },
  countBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4px 12px",
    borderRadius: "99px",
    backgroundColor: "#eff6ff",
    color: "#3b82f6",
    fontSize: "13px",
    fontWeight: "600",
  },
  actionButtons: {
    display: "flex",
    gap: "8px",
  },
  iconButton: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "6px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
  },
  emptyState: {
    padding: "48px",
    textAlign: "center",
    color: "#64748b",
    fontSize: "15px",
  },
};
