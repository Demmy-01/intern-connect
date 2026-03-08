import React, { useState, useEffect } from "react";
import { Search, Briefcase, MapPin, Edit, Eye, EyeOff } from "lucide-react";
import { supabase } from "../../lib/supabase";
import Badge from "../components/ui/Badge";
import TableSkeleton from "../components/ui/TableSkeleton";
import { toast } from "sonner"; 

export default function InternshipsManagement() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("internships")
        .select(`
          id, position_title, department, location, is_active, created_at,
          organizations (organization_name),
          internship_applications (id)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formatted = data.map((int) => ({
        id: int.id,
        title: int.position_title || "Untitled Internship",
        company: int.organizations?.organization_name || "Unknown Company",
        category: int.department || "Uncategorized",
        location: int.location || "Remote",
        isActive: int.is_active,
        applicationsCount: int.internship_applications?.length || 0,
        postedAt: new Date(int.created_at).toLocaleDateString(),
      }));

      setInternships(formatted);
    } catch (error) {
      console.error("Error fetching internships:", error);
      toast.error("Failed to load internships");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from("internships")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      setInternships(internships.map(int => 
        int.id === id ? { ...int, isActive: !currentStatus } : int
      ));
      
      toast.success(`Internship ${!currentStatus ? 'activated' : 'closed'} successfully`);
    } catch (error) {
      console.error("Error updating internship status:", error);
      toast.error("Failed to update status");
    }
  };

  const filteredInternships = internships.filter(
    (i) =>
      i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Internships Management</h1>
          <p style={styles.subtitle}>Review, approve, and manage internship listings.</p>
        </div>
        <div style={styles.searchBox}>
          <Search size={18} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search internships..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      <div style={styles.tableCard}>
        {loading ? (
          <TableSkeleton rows={7} columns={5} />
        ) : filteredInternships.length === 0 ? (
          <div style={styles.emptyState}>No internships found matching your search.</div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Internship Details</th>
                  <th style={styles.th}>Category / Location</th>
                  <th style={styles.th}>Applications</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInternships.map((int) => (
                  <tr key={int.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.nameCell}>
                        <div style={styles.avatar}>
                          <Briefcase size={18} />
                        </div>
                        <div>
                          <p style={styles.primaryText}>{int.title}</p>
                          <p style={styles.secondaryText}>{int.company} • {int.postedAt}</p>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <p style={styles.primaryText}>{int.category}</p>
                      <p style={styles.secondaryText}><MapPin size={12} style={{ display: "inline", marginRight: "4px"}}/>{int.location}</p>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.countBadge}>{int.applicationsCount}</span>
                    </td>
                    <td style={styles.td}>
                      <Badge 
                        status={int.isActive ? "active" : "closed"} 
                      />
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button style={styles.iconButton} title="Edit Listing">
                          <Edit size={16} />
                        </button>
                        <button 
                          style={styles.iconButton} 
                          title={int.isActive ? "Close Internship" : "Re-activate Internship"}
                          onClick={() => handleToggleStatus(int.id, int.isActive)}
                        >
                          {int.isActive ? (
                            <EyeOff size={16} color="#ef4444" />
                          ) : (
                            <Eye size={16} color="#10b981" />
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
    borderRadius: "8px", 
    backgroundColor: "#fdf4ff",
    color: "#c026d3",
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
    backgroundColor: "#f3f4f6", // Neutral gray for application counts
    color: "#475569",
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
