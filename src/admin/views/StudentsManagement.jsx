import React, { useState, useEffect } from "react";
import { Search, MoreVertical, ShieldBan, Trash2, Eye } from "lucide-react";
import { supabase } from "../../lib/supabase";
import Badge from "../components/ui/Badge";
import ProgressBar from "../components/ui/ProgressBar";
import TableSkeleton from "../components/ui/TableSkeleton";

export default function StudentsManagement() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      // 1. Fetch profiles where type is student
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select(`
          id, username, display_name, user_type, created_at,
          students (id, bio)
        `)
        .eq("user_type", "student")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Map to view structure
      const formatted = profilesData.map((p) => {
        // Mocking a profile completion percentage based on data presence
        let completionScore = 30; // Base score
        if (p.students?.[0]?.university) completionScore += 25;
        if (p.students?.[0]?.course) completionScore += 25;
        if (p.students?.[0]?.bio) completionScore += 20;

        const studentData = Array.isArray(p.students) ? p.students[0] : p.students;
        return {
          id: p.id,
          name: p.display_name || p.username || "Unknown User",
          university: "Not Specified in Profile",
          course: "Not Specified in Profile",
          completion: completionScore,
          applicationsCount: 0,
          status: "active", // Defaulted, if you have a suspension boolean, use it here
          joinedAt: new Date(p.created_at).toLocaleDateString(),
        };
      });

      setStudents(formatted);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.university.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Students Management</h1>
          <p style={styles.subtitle}>View and manage student profiles, applications, and account access.</p>
        </div>
        <div style={styles.searchBox}>
          <Search size={18} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      <div style={styles.tableCard}>
        {loading ? (
          <TableSkeleton rows={6} columns={5} />
        ) : filteredStudents.length === 0 ? (
          <div style={styles.emptyState}>No students found matching your search.</div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Student Name</th>
                  <th style={styles.th}>University / Course</th>
                  <th style={styles.th}>Profile Completion</th>
                  <th style={styles.th}>Applications</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.nameCell}>
                        <div style={styles.avatar}>{student.name.substring(0, 2).toUpperCase()}</div>
                        <div>
                          <p style={styles.primaryText}>{student.name}</p>
                          <p style={styles.secondaryText}>Joined {student.joinedAt}</p>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <p style={styles.primaryText}>{student.university}</p>
                      <p style={styles.secondaryText}>{student.course}</p>
                    </td>
                    <td style={styles.td}>
                      <div style={{ width: "120px" }}>
                        <ProgressBar percentage={student.completion} label="Completed" />
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.countBadge}>{student.applicationsCount}</span>
                    </td>
                    <td style={styles.td}>
                      <Badge status={student.status} />
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button style={styles.iconButton} title="View Profile">
                          <Eye size={18} />
                        </button>
                        <button style={styles.iconButton} title="Suspend Account">
                          <ShieldBan size={18} />
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
    borderRadius: "50%",
    backgroundColor: "#e0e7ff",
    color: "#4f46e5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "600",
    fontSize: "14px",
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
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    backgroundColor: "#f1f5f9",
    color: "#334155",
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
    color: "#64748b",
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
