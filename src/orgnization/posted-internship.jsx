import React, { useState, useEffect } from "react";
import "./org.css";
import InternshipRow from "../components/InternhipRow.jsx";
import Loader from "../components/Loader.jsx";
import { Button } from "../components/button.jsx";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";
import internshipService from "../lib/internshipService.js";
import { toast } from "../components/ui/sonner";
import useVerificationStatus from "../hooks/useVerificationStatus";

const PostedInternship = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check verification status
  const {
    isVerified,
    isPending,
    isRejected,
    loading: verificationLoading,
    restrictionMessage,
  } = useVerificationStatus();

  // Load internships on component mount
  useEffect(() => {
    loadInternships();

    // Set up real-time subscription
    const setupSubscription = async () => {
      const subscription =
        await internshipService.subscribeToOrganizationInternships(
          (payload) => {
            console.log("Real-time update:", payload);
            // Reload internships when there's a change
            loadInternships();
          }
        );

      // Cleanup subscription on unmount
      return () => {
        if (subscription) {
          internshipService.unsubscribe(subscription);
        }
      };
    };

    const cleanup = setupSubscription();
    return () => cleanup.then((fn) => fn && fn());
  }, []);

  const loadInternships = async () => {
    try {
      setLoading(true);
      const { data, error } =
        await internshipService.getOrganizationInternships();

      if (error) {
        setError(error);
      } else {
        setInternships(data || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (internshipId, isActive) => {
    try {
      const { error } = await internshipService.toggleInternshipStatus(
        internshipId,
        isActive
      );

      if (error) {
        throw new Error(error);
      }

      // Update local state optimistically
      setInternships((prev) =>
        prev.map((internship) =>
          internship.id === internshipId
            ? { ...internship, is_active: isActive }
            : internship
        )
      );
      try {
        toast.success(
          isActive ? "Internship activated" : "Internship deactivated"
        );
      } catch (e) {}
    } catch (err) {
      console.error("Error toggling internship status:", err);
      const message = err.message || "Failed to toggle internship status";
      setError(message);
      try {
        toast.error(message);
      } catch (e) {}
    }
  };

  const handleEdit = (internshipId) => {
    // Navigate to edit page (you'll need to create this)
    navigate(`/edit-internship/${internshipId}`);
  };

  const handleDelete = async (internshipId) => {
    try {
      const { error } = await internshipService.deleteInternship(internshipId);

      if (error) {
        throw new Error(error);
      }

      // Remove from local state
      setInternships((prev) =>
        prev.filter((internship) => internship.id !== internshipId)
      );
      try {
        toast.success("Internship deleted");
      } catch (e) {}
    } catch (err) {
      console.error("Error deleting internship:", err);
      const message = err.message || "Failed to delete internship";
      setError(message);
      try {
        toast.error(message);
      } catch (e) {}
    }
  };

  if (loading || verificationLoading) {
    return (
      <DashboardLayout>
        <Loader message="Loading internships..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="post-container">
        <div className="post-main-card">
          <div className="post-header">
            <h1 className="post-title">Posted Internships</h1>
            <div className="post-stats">
              <span className="stat-item">Total: {internships.length}</span>
              <span className="stat-item">
                Active: {internships.filter((i) => i.is_active).length}
              </span>
            </div>
          </div>

          {/* Inline error UI removed in favor of toast notifications */}

          {/* Verification Status Restriction */}
          {restrictionMessage && (
            <div
              className={`verification-restriction ${
                restrictionMessage.type === "error"
                  ? "verification-restriction--error"
                  : "verification-restriction--warning"
              }`}
            >
              <div className="restriction-icon">
                {restrictionMessage.type === "error" ? "⚠️" : "⏳"}
              </div>
              <div className="restriction-content">
                <h3>{restrictionMessage.title}</h3>
                <p>{restrictionMessage.message}</p>
              </div>
            </div>
          )}

          <div className="post-table-header">
            <div className="post-header-position">Position</div>
            <div className="post-header-department">Department</div>
            <div className="post-header-description">Description</div>
            <div className="post-header-status">Status</div>
            <div className="post-header-actions">Actions</div>
          </div>

          <div className="post-internships-list">
            {internships.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3>No internships posted yet</h3>
                <p>Create your first internship posting to get started.</p>
                {isVerified ? (
                  <Link to="/post-internship">
                    <Button
                      className="post-internship-button primary"
                      label="+ Post your first internship"
                    />
                  </Link>
                ) : (
                  <p className="verification-required">
                    Complete verification to start posting internships
                  </p>
                )}
              </div>
            ) : (
              internships.map((internship) => (
                <InternshipRow
                  key={internship.id}
                  id={internship.id}
                  position={internship.position_title}
                  department={internship.department}
                  description={internship.description}
                  isActive={internship.is_active}
                  onToggleStatus={handleToggleStatus}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>

          {internships.length > 0 && isVerified && (
            <div className="post-button-container">
              <Link to="/post-internship">
                <Button
                  className="post-internship-button"
                  label="+ Post new internship"
                  onClick={() => console.log("Post new internship clicked")}
                />
              </Link>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PostedInternship;
