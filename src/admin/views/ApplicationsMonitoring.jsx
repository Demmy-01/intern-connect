import React, { useState, useEffect } from "react";
import { Search, FileText, Download, Filter } from "lucide-react";
import { supabase } from "../../lib/supabase";
import Badge from "../components/ui/Badge";
import TableSkeleton from "../components/ui/TableSkeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

export default function ApplicationsMonitoring() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [funnelData, setFunnelData] = useState([
    { name: "Applied", value: 0, color: "#3b82f6" },
    { name: "Under Review", value: 0, color: "#f59e0b" },
    { name: "Shortlisted", value: 0, color: "#a855f7" },
    { name: "Accepted", value: 0, color: "#10b981" },
    { name: "Rejected", value: 0, color: "#ef4444" },
  ]);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("internship_applications")
        .select(`
          id, status, applicant_email, applied_at,
          internships (position_title, organizations(organization_name)),
          students (profiles (display_name))
        `)
        .order("applied_at", { ascending: false });

      if (error) throw error;

      // Calculate funnel metrics
      const statusCounts = { pending: 0, reviewing: 0, shortlisted: 0, accepted: 0, rejected: 0 };
      
      const formatted = data.map((app) => {
        const status = app.status || "pending";
        // Map any custom statuses to our funnel buckets
        if (status === "pending" || status === "applied") statusCounts.pending++;
        else if (status === "reviewing" || status === "under_review") statusCounts.reviewing++;
        else if (status === "shortlisted") statusCounts.shortlisted++;
        else if (status === "accepted" || status === "approved") statusCounts.accepted++;
        else if (status === "rejected" || status === "declined") statusCounts.rejected++;

        return {
          id: app.id,
          applicantName: app.students?.profiles?.display_name || app.applicant_email?.split('@')[0] || "Unknown Applicant",
          email: app.applicant_email || "No email",
          internshipTitle: app.internships?.position_title || "Unknown Role",
          company: app.internships?.organizations?.organization_name || "Unknown Company",
          status: status,
          appliedAt: new Date(app.applied_at || new Date()).toLocaleDateString(),
        };
      });

      setFunnelData([
        { name: "Total Applied", value: formatted.length, color: "#3b82f6" },
        { name: "Reviewing", value: statusCounts.reviewing, color: "#f59e0b" },
        { name: "Shortlisted", value: statusCounts.shortlisted, color: "#a855f7" },
        { name: "Accepted", value: statusCounts.accepted, color: "#10b981" },
        { name: "Rejected", value: statusCounts.rejected, color: "#ef4444" },
      ]);

      setApplications(formatted);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredApps = applications.filter(
    (a) =>
      a.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.internshipTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Applications Monitoring</h1>
          <p style={styles.subtitle}>Track application pipelines and conversion metrics.</p>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.secondaryButton}>
            <Download size={16} style={{ marginRight: "8px" }} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Funnel Chart */}
      <div style={styles.chartCard}>
        <h3 style={styles.chartTitle}>Application Conversion Funnel</h3>
        <div style={{ width: "100%", height: "200px" }}>
          <ResponsiveContainer>
            <BarChart
              data={funnelData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 13, fill: "#475569", fontWeight: 500 }}
                width={100}
              />
              <Tooltip 
                cursor={{ fill: "rgba(241, 245, 249, 0.4)" }}
                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                {funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table Section */}
      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <div style={styles.searchBox}>
            <Search size={18} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by name, role, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <button style={styles.iconButtonOutline}>
            <Filter size={16} />
            <span style={{ marginLeft: "8px" }}>Filter Status</span>
          </button>
        </div>

        {loading ? (
          <TableSkeleton rows={5} columns={4} />
        ) : filteredApps.length === 0 ? (
          <div style={styles.emptyState}>No applications found matching your criteria.</div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Applicant</th>
                  <th style={styles.th}>Role & Company</th>
                  <th style={styles.th}>Date Applied</th>
                  <th style={styles.th}>Current Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((app) => (
                  <tr key={app.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.nameCell}>
                        <div style={styles.avatar}>
                          <FileText size={18} />
                        </div>
                        <div>
                          <p style={styles.primaryText}>{app.applicantName}</p>
                          <p style={styles.secondaryText}>{app.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <p style={styles.primaryText}>{app.internshipTitle}</p>
                      <p style={styles.secondaryText}>{app.company}</p>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.dateText}>{app.appliedAt}</span>
                    </td>
                    <td style={styles.td}>
                      <Badge status={app.status} />
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
  headerActions: {
    display: "flex",
    gap: "12px",
  },
  secondaryButton: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    color: "#334155",
    padding: "8px 16px",
    borderRadius: "8px",
    fontWeight: "500",
    cursor: "pointer",
    fontSize: "14px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
  chartCard: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #e2e8f0",
  },
  chartTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#0f172a",
    margin: "0 0 16px 0",
    fontFamily: "'Inter', sans-serif",
  },
  tableCard: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
  },
  tableHeader: {
    padding: "20px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #e2e8f0",
    backgroundColor: "#fafafa",
  },
  iconButtonOutline: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "transparent",
    border: "1px solid #cbd5e1",
    color: "#475569",
    padding: "8px 16px",
    borderRadius: "8px",
    fontWeight: "500",
    cursor: "pointer",
    fontSize: "13px",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "8px 16px",
    width: "360px",
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
    backgroundColor: "#ffffff",
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
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    backgroundColor: "#f0fdf4",
    color: "#16a34a",
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
  dateText: {
    fontSize: "14px",
    color: "#475569",
    fontWeight: "500",
  },
  emptyState: {
    padding: "48px",
    textAlign: "center",
    color: "#64748b",
    fontSize: "15px",
  },
};
