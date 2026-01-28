import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";
import internshipService from "../lib/internshipService.js";
import Loader from "../components/Loader.jsx";
import { toast } from "../components/ui/sonner";

const EditInternship = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [internshipData, setInternshipData] = useState(null);
  const [form, setForm] = useState({
    positionTitle: "",
    department: "",
    description: "",
    requirements: "",
    workType: "",
    compensation: "",
    location: "",
    minDuration: "",
    maxDuration: "",
    applicationDeadline: "",
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await internshipService.getInternshipById(id);
        if (error) throw new Error(error);
        if (data) {
          setInternshipData(data);
          setForm({
            positionTitle: data.position_title || "",
            department: data.department || "",
            description: data.description || "",
            requirements: data.requirements || "",
            workType: data.work_type || "",
            compensation: data.compensation || "",
            location: data.location || "",
            minDuration: data.min_duration || "",
            maxDuration: data.max_duration || "",
            applicationDeadline: data.application_deadline || "",
          });
        }
      } catch (err) {
        console.error("Error loading internship:", err);
        toast.error("Failed to load internship");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data, error } = await internshipService.updateInternship(
        id,
        form,
      );
      if (error) throw new Error(error);
      toast.success("Internship updated");
      navigate("/posted-internship");
    } catch (err) {
      console.error("Error updating internship:", err);
      toast.error(err.message || "Failed to update internship");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <DashboardLayout>
        <Loader message="Loading internship..." />
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <div className="edit-internship-wrapper">
        <div className="edit-card">
          <div className="edit-header">
            <div>
              <h2 className="edit-title">Edit Internship</h2>
              <p className="edit-sub">
                Update the details below to edit your internship listing.
              </p>
            </div>
            {internshipData && (
              <div className="edit-meta">
                <div className="meta-position">
                  {internshipData.position_title}
                </div>
                <div className="meta-org">
                  {internshipData.organizations?.organization_name || ""}
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="edit-form">
            <div className="form-row">
              <label className="form-label">Position Title</label>
              <input
                className="form-input"
                name="positionTitle"
                value={form.positionTitle}
                onChange={handleChange}
                placeholder="e.g. Frontend Engineer Intern"
              />
            </div>

            <div className="form-row two-col">
              <div>
                <label className="form-label">Department</label>
                <input
                  className="form-input"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  placeholder="e.g. Engineering"
                />
              </div>
              <div>
                <label className="form-label">Work Type</label>
                <input
                  className="form-input"
                  name="workType"
                  value={form.workType}
                  onChange={handleChange}
                  placeholder="Remote / On-site / Hybrid"
                />
              </div>
            </div>

            <div className="form-row">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={6}
                placeholder="Describe the role, responsibilities, and outcomes expected."
              />
            </div>

            <div className="form-row">
              <label className="form-label">Requirements</label>
              <textarea
                className="form-textarea"
                name="requirements"
                value={form.requirements}
                onChange={handleChange}
                rows={4}
                placeholder="e.g. skills, qualifications, tools used"
              />
            </div>

            <div className="form-row two-col">
              <div>
                <label className="form-label">Compensation</label>
                <input
                  className="form-input"
                  name="compensation"
                  value={form.compensation}
                  onChange={handleChange}
                  placeholder="e.g. Unpaid / $200 per week"
                />
              </div>
              <div>
                <label className="form-label">Location</label>
                <input
                  className="form-input"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="City, Remote, etc."
                />
              </div>
            </div>

            <div className="form-row two-col">
              <div>
                <label className="form-label">Min Duration (weeks)</label>
                <input
                  className="form-input"
                  name="minDuration"
                  value={form.minDuration}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="form-label">Max Duration (weeks)</label>
                <input
                  className="form-input"
                  name="maxDuration"
                  value={form.maxDuration}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <label className="form-label">Application Deadline</label>
              <input
                className="form-input"
                type="date"
                name="applicationDeadline"
                value={form.applicationDeadline || ""}
                onChange={handleChange}
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
              >
                {submitting ? "Saving..." : "Save changes"}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-ghost"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        <style>{`
          .edit-internship-wrapper { padding: 28px; display: flex; justify-content: center; }
          .edit-card { width: 100%; max-width: 980px; background: var(--card-bg); border-radius: 12px; box-shadow: 0 6px 24px rgba(15, 23, 42, 0.08); padding: 24px; }
          .edit-header { display:flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 18px; }
          .edit-title { margin: 0; font-size: 20px; color: var(--text-primary); }
          .edit-sub { margin: 4px 0 0; color: var(--text-secondary); }
          .edit-meta { text-align: right; }
          .meta-position { font-weight: 700; color: #0b5fff; }
          .meta-org { color: var(--text-secondary); font-size: 13px; }
          .edit-form { display: grid; gap: 12px; }
          .form-row { display:block; }
          .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
          .form-label { display:block; font-weight:600; color: var(--text-primary); margin-bottom:6px; }
          .form-input { width:100%; padding:10px 12px; border:1px solid var(--card-border); border-radius:8px; background: var(--card-bg); color: var(--text-primary); }
          .form-textarea { width:100%; padding:12px; border:1px solid var(--card-border); border-radius:8px; background: var(--card-bg); color: var(--text-primary); min-height:80px; }
          .form-actions { display:flex; gap:12px; margin-top:6px; }
          .btn-primary { background:#0b5fff; color:white; padding:10px 16px; border-radius:8px; border:none; cursor:pointer; }
          .btn-primary:disabled { opacity:0.6; cursor:not-allowed }
          .btn-ghost { background: var(--card-bg); border:1px solid var(--card-border); color: var(--text-primary); padding:10px 16px; border-radius:8px; cursor:pointer }
          @media (max-width:720px) { .two-col { grid-template-columns: 1fr; } .edit-meta { text-align:left; } }
        `}</style>
      </div>
    </DashboardLayout>
  );
};

export default EditInternship;
