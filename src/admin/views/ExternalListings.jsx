import React, { useState } from "react";
import { Search, Globe, Plus, Link as LinkIcon, ExternalLink } from "lucide-react";
import Badge from "../components/ui/Badge";
import { toast } from "sonner"; 

export default function ExternalListings() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Mock aggregated data for external source listings as per prompt
  const [listings, setListings] = useState([
    {
      id: "ext-1",
      title: "Frontend Developer Intern",
      company: "Google",
      location: "Remote",
      source: "LinkedIn",
      type: "Remote",
      category: "Engineering",
      deadline: "2024-06-15",
      link: "https://linkedin.com",
    },
    {
      id: "ext-2",
      title: "Data Analytics Intern",
      company: "Spotify",
      location: "New York, NY",
      source: "Glassdoor",
      type: "Onsite",
      category: "Data",
      deadline: "2024-07-01",
      link: "https://glassdoor.com",
    },
    {
      id: "ext-3",
      title: "Product Design Intern",
      company: "AirBnB",
      location: "San Francisco, CA",
      source: "Indeed",
      type: "Hybrid",
      category: "Design",
      deadline: "2024-05-30",
      link: "https://indeed.com",
    },
  ]);

  const filteredListings = listings.filter(
    (l) =>
      l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.source.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>External Listings Database</h1>
          <p style={styles.subtitle}>Curate and manage imported internship opportunities from third parties.</p>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.primaryButton} onClick={() => setShowAddModal(true)}>
            <Plus size={16} style={{ marginRight: "8px" }} />
            Add Manual Listing
          </button>
        </div>
      </div>

      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <div style={styles.searchBox}>
            <Search size={18} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by role, company, or source..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </div>

        {filteredListings.length === 0 ? (
          <div style={styles.emptyState}>No external listings found matching your criteria.</div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Job Summary</th>
                  <th style={styles.th}>Source</th>
                  <th style={styles.th}>Details</th>
                  <th style={styles.th}>Deadline</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredListings.map((listing) => (
                  <tr key={listing.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.nameCell}>
                        <div style={styles.avatar}>
                          <Globe size={18} />
                        </div>
                        <div>
                          <p style={styles.primaryText}>{listing.title}</p>
                          <p style={styles.secondaryText}>{listing.company} • {listing.location}</p>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <Badge 
                        label={listing.source}
                        status={listing.source === 'LinkedIn' ? 'active' : listing.source === 'Glassdoor' ? 'verified' : 'pending'}
                      />
                    </td>
                    <td style={styles.td}>
                      <p style={styles.primaryText}>{listing.type}</p>
                      <p style={styles.secondaryText}>{listing.category}</p>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.dateText}>
                        {new Date(listing.deadline).toLocaleDateString()}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <a href={listing.link} target="_blank" rel="noopener noreferrer" style={styles.linkButton}>
                        <ExternalLink size={16} />
                        Visit Link
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Add External Listing</h2>
            <p style={styles.modalSubtitle}>Manually import an internship linking out to another platform.</p>
            
            <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <input type="text" placeholder="Job Title" style={styles.inputField} />
              <input type="text" placeholder="Company Name" style={styles.inputField} />
              <input type="url" placeholder="Direct URL to listing" style={styles.inputField} />
            </div>

            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={() => setShowAddModal(false)}>Cancel</button>
              <button style={styles.saveBtn} onClick={() => {
                toast.success("External listing successfully added to database!");
                setShowAddModal(false);
              }}>Publish Listing</button>
            </div>
          </div>
        </div>
      )}
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
  primaryButton: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#3b82f6",
    border: "none",
    color: "#ffffff",
    padding: "8px 16px",
    borderRadius: "8px",
    fontWeight: "500",
    cursor: "pointer",
    fontSize: "14px",
    transition: "background-color 0.2s",
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
    borderBottom: "1px solid #e2e8f0",
    backgroundColor: "#fafafa",
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
    backgroundColor: "#eff6ff",
    color: "#2563eb",
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
  linkButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    backgroundColor: "#f8fafc",
    color: "#475569",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: "500",
  },
  emptyState: {
    padding: "48px",
    textAlign: "center",
    color: "#64748b",
    fontSize: "15px",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "32px",
    width: "100%",
    maxWidth: "500px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },
  modalTitle: {
    margin: "0 0 8px 0",
    fontSize: "20px",
    fontWeight: "700",
    color: "#0f172a",
  },
  modalSubtitle: {
    margin: 0,
    fontSize: "14px",
    color: "#64748b",
  },
  inputField: {
    width: "100%",
    padding: "10px 16px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    outline: "none",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "32px",
  },
  cancelBtn: {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    backgroundColor: "#ffffff",
    color: "#475569",
    fontWeight: "500",
    cursor: "pointer",
  },
  saveBtn: {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    fontWeight: "500",
    cursor: "pointer",
  },
};
