import React, { useState } from "react";
import {
  FileText,
  Download,
  User,
  Briefcase,
  GraduationCap,
  Award,
} from "lucide-react";
import html2pdf from "html2pdf.js";

export default function CVGenerator() {
  const [template, setTemplate] = useState("modern");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    linkedin: "",
    location: "",
    summary: "",
    experiences: [
      {
        company: "",
        position: "",
        duration: "",
        description: "",
      },
    ],
    education: [
      {
        institution: "",
        degree: "",
        year: "",
        details: "",
      },
    ],
    achievements: [""],
  });

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateArrayField = (field, index, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const updateObjectArrayField = (field, index, key, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      ),
    }));
  };

  const addArrayItem = (field, defaultValue) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], defaultValue],
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const downloadCV = () => {
    const element = document.getElementById("cv-preview");
    const opt = {
      margin: 10,
      filename: `${formData.fullName || "CV"}_${template}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
    };
    html2pdf().set(opt).from(element).save();
  };

  const getTemplateStyles = () => {
    if (template === "modern") {
      return `.cv-container { max-width: 800px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 10px 10px 0 0; }
        .section { padding: 30px; border-left: 4px solid #667eea; margin: 20px 0; background: #f8f9fa; }
        .section-title { color: #667eea; font-size: 22px; font-weight: bold; margin-bottom: 15px; }`;
    } else if (template === "classic") {
      return `.cv-container { max-width: 800px; margin: 0 auto; border: 2px solid #333; }
        .header { background: #333; color: white; padding: 30px; text-align: center; }
        .section { padding: 25px; border-bottom: 1px solid #ddd; }
        .section-title { color: #333; font-size: 20px; font-weight: bold; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 15px; }`;
    } else {
      return `.cv-container { max-width: 800px; margin: 0 auto; }
        .header { padding: 20px; border-bottom: 3px solid #000; }
        .section { padding: 20px; }
        .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; text-transform: uppercase; }`;
    }
  };

  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(to bottom right, #f3f4f6, #e5e7eb)",
      padding: "16px",
    },
    maxWidthContainer: {
      maxWidth: "1280px",
      margin: "0 auto",
    },
    header: {
      textAlign: "center",
      marginBottom: "32px",
    },
    mainTitle: {
      fontSize: "36px",
      fontWeight: "bold",
      color: "#111827",
      marginBottom: "8px",
    },
    subtitle: {
      color: "#6b7280",
    },
    gridContainer: {
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: "32px",
    },
    gridContainerLg: {
      gridTemplateColumns: "repeat(2, 1fr)",
    },
    formCard: {
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      padding: "24px",
    },
    sectionContainer: {
      marginBottom: "24px",
    },
    sectionHeader: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginBottom: "16px",
    },
    sectionTitle: {
      fontSize: "20px",
      fontWeight: "bold",
      color: "#1f2937",
    },
    inputContainer: {
      marginBottom: "12px",
    },
    input: {
      width: "100%",
      padding: "12px",
      border: "1px solid #d1d5db",
      borderRadius: "8px",
      outline: "none",
      fontSize: "14px",
      boxSizing: "border-box",
    },
    inputFocus: {
      borderColor: "#9333ea",
      boxShadow: "0 0 0 3px rgba(147, 51, 234, 0.1)",
    },
    textarea: {
      width: "100%",
      padding: "12px",
      border: "1px solid #d1d5db",
      borderRadius: "8px",
      outline: "none",
      fontSize: "14px",
      resize: "none",
      boxSizing: "border-box",
    },
    experienceCard: {
      marginBottom: "16px",
      padding: "16px",
      backgroundColor: "#f9fafb",
      borderRadius: "8px",
    },
    removeButton: {
      color: "#dc2626",
      fontSize: "14px",
      border: "none",
      background: "none",
      cursor: "pointer",
      marginTop: "8px",
    },
    addButton: {
      color: "#9333ea",
      fontSize: "14px",
      fontWeight: "500",
      border: "none",
      background: "none",
      cursor: "pointer",
    },
    previewCard: {
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      padding: "16px",
    },
    previewHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "16px",
    },
    downloadButton: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      backgroundColor: "#9333ea",
      color: "white",
      padding: "8px 16px",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
    },
    templateButtonContainer: {
      display: "flex",
      gap: "8px",
      marginBottom: "16px",
    },
    templateButton: {
      padding: "8px 16px",
      borderRadius: "8px",
      fontWeight: "500",
      border: "none",
      cursor: "pointer",
      fontSize: "14px",
    },
    templateButtonActive: {
      backgroundColor: "#9333ea",
      color: "white",
    },
    templateButtonInactive: {
      backgroundColor: "#e5e7eb",
      color: "#374151",
    },
    previewContainer: {
      backgroundColor: "#f3f4f6",
      borderRadius: "8px",
      padding: "16px",
      overflow: "auto",
      maxHeight: "800px",
    },
    previewInner: {
      transform: "scale(0.9)",
      transformOrigin: "top",
    },
    modernHeader: {
      background: "linear-gradient(to right, #9333ea, #7e22ce)",
      color: "white",
      padding: "32px",
      borderRadius: "8px 8px 0 0",
    },
    modernName: {
      fontSize: "36px",
      fontWeight: "bold",
      marginBottom: "8px",
    },
    modernContact: {
      color: "#e9d5ff",
      marginBottom: "4px",
    },
    modernSection: {
      padding: "24px",
      margin: "24px",
      borderLeft: "4px solid #9333ea",
      backgroundColor: "#f9fafb",
    },
    modernSectionTitle: {
      fontSize: "24px",
      fontWeight: "bold",
      color: "#581c87",
      marginBottom: "12px",
    },
    modernExpTitle: {
      fontSize: "20px",
      fontWeight: "600",
      color: "#111827",
    },
    modernExpCompany: {
      color: "#9333ea",
      fontWeight: "500",
    },
    classicContainer: {
      backgroundColor: "white",
      border: "4px solid #1f2937",
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
    },
    classicHeader: {
      backgroundColor: "#1f2937",
      color: "white",
      padding: "32px",
      textAlign: "center",
    },
    classicName: {
      fontSize: "36px",
      fontWeight: "bold",
      marginBottom: "12px",
    },
    classicContact: {
      color: "#d1d5db",
    },
    classicSection: {
      padding: "32px",
      borderBottom: "2px solid #d1d5db",
    },
    classicSectionTitle: {
      fontSize: "24px",
      fontWeight: "bold",
      color: "#1f2937",
      borderBottom: "2px solid #1f2937",
      paddingBottom: "8px",
      marginBottom: "16px",
    },
    basicContainer: {
      backgroundColor: "white",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    },
    basicHeader: {
      padding: "24px",
      borderBottom: "4px solid black",
    },
    basicName: {
      fontSize: "28px",
      fontWeight: "bold",
      marginBottom: "8px",
    },
    basicContact: {
      fontSize: "14px",
      color: "#374151",
    },
    basicSection: {
      padding: "24px",
    },
    basicSectionTitle: {
      fontSize: "18px",
      fontWeight: "bold",
      textTransform: "uppercase",
      marginBottom: "12px",
    },
  };

  const renderModernTemplate = () => (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
      }}
    >
      <div style={styles.modernHeader}>
        <h1 style={styles.modernName}>{formData.fullName || "Your Name"}</h1>
        <div>
          {formData.email && (
            <p style={styles.modernContact}>📧 {formData.email}</p>
          )}
          {formData.phone && (
            <p style={styles.modernContact}>📱 {formData.phone}</p>
          )}
          {formData.linkedin && (
            <p style={styles.modernContact}>🔗 {formData.linkedin}</p>
          )}
          {formData.location && (
            <p style={styles.modernContact}>📍 {formData.location}</p>
          )}
        </div>
      </div>

      {formData.summary && (
        <div style={styles.modernSection}>
          <h2 style={styles.modernSectionTitle}>Professional Summary</h2>
          <p style={{ color: "#374151", lineHeight: "1.6" }}>
            {formData.summary}
          </p>
        </div>
      )}

      {formData.experiences.some((exp) => exp.company || exp.position) && (
        <div style={styles.modernSection}>
          <h2 style={styles.modernSectionTitle}>Experience</h2>
          {formData.experiences.map(
            (exp, idx) =>
              (exp.company || exp.position) && (
                <div key={idx} style={{ marginBottom: "24px" }}>
                  <h3 style={styles.modernExpTitle}>
                    {exp.position || "Position"}
                  </h3>
                  <p style={styles.modernExpCompany}>
                    {exp.company || "Company"}
                  </p>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#6b7280",
                      marginBottom: "8px",
                    }}
                  >
                    {exp.duration}
                  </p>
                  <p style={{ color: "#374151" }}>{exp.description}</p>
                </div>
              )
          )}
        </div>
      )}

      {formData.education.some((edu) => edu.institution || edu.degree) && (
        <div style={styles.modernSection}>
          <h2 style={styles.modernSectionTitle}>Education</h2>
          {formData.education.map(
            (edu, idx) =>
              (edu.institution || edu.degree) && (
                <div key={idx} style={{ marginBottom: "16px" }}>
                  <h3
                    style={{
                      fontSize: "20px",
                      fontWeight: "600",
                      color: "#111827",
                    }}
                  >
                    {edu.degree || "Degree"}
                  </h3>
                  <p style={styles.modernExpCompany}>
                    {edu.institution || "Institution"}
                  </p>
                  <p style={{ fontSize: "14px", color: "#6b7280" }}>
                    {edu.year}
                  </p>
                  {edu.details && (
                    <p style={{ color: "#374151", marginTop: "4px" }}>
                      {edu.details}
                    </p>
                  )}
                </div>
              )
          )}
        </div>
      )}

      {formData.achievements.some((ach) => ach) && (
        <div style={styles.modernSection}>
          <h2 style={styles.modernSectionTitle}>Achievements</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {formData.achievements.map(
              (ach, idx) =>
                ach && (
                  <li
                    key={idx}
                    style={{
                      color: "#374151",
                      marginBottom: "8px",
                      display: "flex",
                      alignItems: "start",
                    }}
                  >
                    <span style={{ color: "#9333ea", marginRight: "8px" }}>
                      ▸
                    </span>{" "}
                    {ach}
                  </li>
                )
            )}
          </ul>
        </div>
      )}
    </div>
  );

  const renderClassicTemplate = () => (
    <div style={styles.classicContainer}>
      <div style={styles.classicHeader}>
        <h1 style={styles.classicName}>{formData.fullName || "Your Name"}</h1>
        <div style={styles.classicContact}>
          {formData.email && <span>{formData.email}</span>}
          {formData.phone && <span> | {formData.phone}</span>}
          {formData.location && <span> | {formData.location}</span>}
        </div>
        {formData.linkedin && (
          <p style={{ marginTop: "8px", color: "#d1d5db" }}>
            {formData.linkedin}
          </p>
        )}
      </div>

      {formData.summary && (
        <div style={styles.classicSection}>
          <h2 style={styles.classicSectionTitle}>PROFESSIONAL SUMMARY</h2>
          <p style={{ color: "#374151", lineHeight: "1.6" }}>
            {formData.summary}
          </p>
        </div>
      )}

      {formData.experiences.some((exp) => exp.company || exp.position) && (
        <div style={styles.classicSection}>
          <h2 style={styles.classicSectionTitle}>WORK EXPERIENCE</h2>
          {formData.experiences.map(
            (exp, idx) =>
              (exp.company || exp.position) && (
                <div key={idx} style={{ marginBottom: "24px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                      marginBottom: "4px",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "20px",
                        fontWeight: "bold",
                        color: "#111827",
                      }}
                    >
                      {exp.position || "Position"}
                    </h3>
                    <span style={{ color: "#6b7280" }}>{exp.duration}</span>
                  </div>
                  <p
                    style={{
                      color: "#374151",
                      fontWeight: "600",
                      marginBottom: "8px",
                    }}
                  >
                    {exp.company || "Company"}
                  </p>
                  <p style={{ color: "#374151" }}>{exp.description}</p>
                </div>
              )
          )}
        </div>
      )}

      {formData.education.some((edu) => edu.institution || edu.degree) && (
        <div style={styles.classicSection}>
          <h2 style={styles.classicSectionTitle}>EDUCATION</h2>
          {formData.education.map(
            (edu, idx) =>
              (edu.institution || edu.degree) && (
                <div key={idx} style={{ marginBottom: "16px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          fontSize: "20px",
                          fontWeight: "bold",
                          color: "#111827",
                        }}
                      >
                        {edu.degree || "Degree"}
                      </h3>
                      <p style={{ color: "#374151" }}>
                        {edu.institution || "Institution"}
                      </p>
                      {edu.details && (
                        <p
                          style={{
                            color: "#6b7280",
                            fontSize: "14px",
                            marginTop: "4px",
                          }}
                        >
                          {edu.details}
                        </p>
                      )}
                    </div>
                    <span style={{ color: "#6b7280" }}>{edu.year}</span>
                  </div>
                </div>
              )
          )}
        </div>
      )}

      {formData.achievements.some((ach) => ach) && (
        <div style={styles.classicSection}>
          <h2 style={styles.classicSectionTitle}>ACHIEVEMENTS</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {formData.achievements.map(
              (ach, idx) =>
                ach && (
                  <li
                    key={idx}
                    style={{
                      color: "#374151",
                      marginBottom: "8px",
                      display: "flex",
                      alignItems: "start",
                    }}
                  >
                    <span style={{ marginRight: "8px" }}>•</span> {ach}
                  </li>
                )
            )}
          </ul>
        </div>
      )}
    </div>
  );

  const renderBasicTemplate = () => (
    <div style={styles.basicContainer}>
      <div style={styles.basicHeader}>
        <h1 style={styles.basicName}>{formData.fullName || "YOUR NAME"}</h1>
        <div style={styles.basicContact}>
          {formData.email && <span>{formData.email}</span>}
          {formData.phone && <span> • {formData.phone}</span>}
          {formData.location && <span> • {formData.location}</span>}
        </div>
        {formData.linkedin && (
          <p style={{ fontSize: "14px", color: "#374151", marginTop: "4px" }}>
            {formData.linkedin}
          </p>
        )}
      </div>

      {formData.summary && (
        <div style={styles.basicSection}>
          <h2 style={styles.basicSectionTitle}>Summary</h2>
          <p style={{ color: "#374151" }}>{formData.summary}</p>
        </div>
      )}

      {formData.experiences.some((exp) => exp.company || exp.position) && (
        <div style={styles.basicSection}>
          <h2 style={styles.basicSectionTitle}>Experience</h2>
          {formData.experiences.map(
            (exp, idx) =>
              (exp.company || exp.position) && (
                <div key={idx} style={{ marginBottom: "16px" }}>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <h3 style={{ fontWeight: "bold" }}>
                      {exp.position || "Position"}
                    </h3>
                    <span style={{ fontSize: "14px", color: "#6b7280" }}>
                      {exp.duration}
                    </span>
                  </div>
                  <p style={{ color: "#374151", fontWeight: "600" }}>
                    {exp.company || "Company"}
                  </p>
                  <p
                    style={{
                      color: "#6b7280",
                      fontSize: "14px",
                      marginTop: "4px",
                    }}
                  >
                    {exp.description}
                  </p>
                </div>
              )
          )}
        </div>
      )}

      {formData.education.some((edu) => edu.institution || edu.degree) && (
        <div style={styles.basicSection}>
          <h2 style={styles.basicSectionTitle}>Education</h2>
          {formData.education.map(
            (edu, idx) =>
              (edu.institution || edu.degree) && (
                <div key={idx} style={{ marginBottom: "12px" }}>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <h3 style={{ fontWeight: "bold" }}>
                      {edu.degree || "Degree"}
                    </h3>
                    <span style={{ fontSize: "14px", color: "#6b7280" }}>
                      {edu.year}
                    </span>
                  </div>
                  <p style={{ color: "#374151" }}>
                    {edu.institution || "Institution"}
                  </p>
                  {edu.details && (
                    <p style={{ color: "#6b7280", fontSize: "14px" }}>
                      {edu.details}
                    </p>
                  )}
                </div>
              )
          )}
        </div>
      )}

      {formData.achievements.some((ach) => ach) && (
        <div style={styles.basicSection}>
          <h2 style={styles.basicSectionTitle}>Achievements</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {formData.achievements.map(
              (ach, idx) =>
                ach && (
                  <li
                    key={idx}
                    style={{
                      color: "#374151",
                      fontSize: "14px",
                      marginBottom: "4px",
                    }}
                  >
                    • {ach}
                  </li>
                )
            )}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.maxWidthContainer}>
        <div style={styles.header}>
          <h1 style={styles.mainTitle}>CV Generator</h1>
          <p style={styles.subtitle}>Create your professional CV in minutes</p>
        </div>

        <div
          style={{
            ...styles.gridContainer,
            ...(window.innerWidth >= 1024 ? styles.gridContainerLg : {}),
          }}
        >
          <div style={styles.formCard}>
            <div style={styles.sectionContainer}>
              <div style={styles.sectionHeader}>
                <User
                  style={{ width: "20px", height: "20px", color: "#9333ea" }}
                />
                <h2 style={styles.sectionTitle}>Personal Information</h2>
              </div>
              <div>
                <div style={styles.inputContainer}>
                  <input
                    type="text"
                    placeholder="Full Name"
                    style={styles.input}
                    value={formData.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                  />
                </div>
                <div style={styles.inputContainer}>
                  <input
                    type="email"
                    placeholder="Email"
                    style={styles.input}
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                  />
                </div>
                <div style={styles.inputContainer}>
                  <input
                    type="tel"
                    placeholder="Phone"
                    style={styles.input}
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                  />
                </div>
                <div style={styles.inputContainer}>
                  <input
                    type="text"
                    placeholder="LinkedIn Profile"
                    style={styles.input}
                    value={formData.linkedin}
                    onChange={(e) => updateField("linkedin", e.target.value)}
                  />
                </div>
                <div style={styles.inputContainer}>
                  <input
                    type="text"
                    placeholder="Location"
                    style={styles.input}
                    value={formData.location}
                    onChange={(e) => updateField("location", e.target.value)}
                  />
                </div>
                <div style={styles.inputContainer}>
                  <textarea
                    placeholder="Professional Summary"
                    rows="3"
                    style={styles.textarea}
                    value={formData.summary}
                    onChange={(e) => updateField("summary", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div style={styles.sectionContainer}>
              <div style={styles.sectionHeader}>
                <Briefcase
                  style={{ width: "20px", height: "20px", color: "#9333ea" }}
                />
                <h2 style={styles.sectionTitle}>Work Experience</h2>
              </div>
              {formData.experiences.map((exp, idx) => (
                <div key={idx} style={styles.experienceCard}>
                  <div style={styles.inputContainer}>
                    <input
                      type="text"
                      placeholder="Company Name"
                      style={styles.input}
                      value={exp.company}
                      onChange={(e) =>
                        updateObjectArrayField(
                          "experiences",
                          idx,
                          "company",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div style={styles.inputContainer}>
                    <input
                      type="text"
                      placeholder="Position"
                      style={styles.input}
                      value={exp.position}
                      onChange={(e) =>
                        updateObjectArrayField(
                          "experiences",
                          idx,
                          "position",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div style={styles.inputContainer}>
                    <input
                      type="text"
                      placeholder="Duration (e.g., 2020-2023)"
                      style={styles.input}
                      value={exp.duration}
                      onChange={(e) =>
                        updateObjectArrayField(
                          "experiences",
                          idx,
                          "duration",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div style={styles.inputContainer}>
                    <textarea
                      placeholder="Description"
                      rows="2"
                      style={styles.textarea}
                      value={exp.description}
                      onChange={(e) =>
                        updateObjectArrayField(
                          "experiences",
                          idx,
                          "description",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  {idx > 0 && (
                    <button
                      onClick={() => removeArrayItem("experiences", idx)}
                      style={styles.removeButton}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() =>
                  addArrayItem("experiences", {
                    company: "",
                    position: "",
                    duration: "",
                    description: "",
                  })
                }
                style={styles.addButton}
              >
                + Add Experience
              </button>
            </div>

            <div style={styles.sectionContainer}>
              <div style={styles.sectionHeader}>
                <GraduationCap
                  style={{ width: "20px", height: "20px", color: "#9333ea" }}
                />
                <h2 style={styles.sectionTitle}>Education</h2>
              </div>
              {formData.education.map((edu, idx) => (
                <div key={idx} style={styles.experienceCard}>
                  <div style={styles.inputContainer}>
                    <input
                      type="text"
                      placeholder="Institution Name"
                      style={styles.input}
                      value={edu.institution}
                      onChange={(e) =>
                        updateObjectArrayField(
                          "education",
                          idx,
                          "institution",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div style={styles.inputContainer}>
                    <input
                      type="text"
                      placeholder="Degree"
                      style={styles.input}
                      value={edu.degree}
                      onChange={(e) =>
                        updateObjectArrayField(
                          "education",
                          idx,
                          "degree",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div style={styles.inputContainer}>
                    <input
                      type="text"
                      placeholder="Year"
                      style={styles.input}
                      value={edu.year}
                      onChange={(e) =>
                        updateObjectArrayField(
                          "education",
                          idx,
                          "year",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div style={styles.inputContainer}>
                    <input
                      type="text"
                      placeholder="Additional Details"
                      style={styles.input}
                      value={edu.details}
                      onChange={(e) =>
                        updateObjectArrayField(
                          "education",
                          idx,
                          "details",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  {idx > 0 && (
                    <button
                      onClick={() => removeArrayItem("education", idx)}
                      style={styles.removeButton}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() =>
                  addArrayItem("education", {
                    institution: "",
                    degree: "",
                    year: "",
                    details: "",
                  })
                }
                style={styles.addButton}
              >
                + Add Education
              </button>
            </div>

            <div style={styles.sectionContainer}>
              <div style={styles.sectionHeader}>
                <Award
                  style={{ width: "20px", height: "20px", color: "#9333ea" }}
                />
                <h2 style={styles.sectionTitle}>Achievements</h2>
              </div>
              {formData.achievements.map((ach, idx) => (
                <div
                  key={idx}
                  style={{ marginBottom: "12px", display: "flex", gap: "8px" }}
                >
                  <input
                    type="text"
                    placeholder="Achievement"
                    style={{ ...styles.input, flex: 1 }}
                    value={ach}
                    onChange={(e) =>
                      updateArrayField("achievements", idx, e.target.value)
                    }
                  />
                  {idx > 0 && (
                    <button
                      onClick={() => removeArrayItem("achievements", idx)}
                      style={{
                        color: "#dc2626",
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        fontSize: "18px",
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addArrayItem("achievements", "")}
                style={styles.addButton}
              >
                + Add Achievement
              </button>
            </div>
          </div>

          <div>
            <div style={styles.previewCard}>
              <div style={styles.previewHeader}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <FileText
                    style={{ width: "20px", height: "20px", color: "#9333ea" }}
                  />
                  <h2 style={styles.sectionTitle}>Preview</h2>
                </div>
                <button onClick={downloadCV} style={styles.downloadButton}>
                  <Download style={{ width: "16px", height: "16px" }} />
                  Download
                </button>
              </div>

              <div style={styles.templateButtonContainer}>
                <button
                  onClick={() => setTemplate("modern")}
                  style={{
                    ...styles.templateButton,
                    ...(template === "modern"
                      ? styles.templateButtonActive
                      : styles.templateButtonInactive),
                  }}
                >
                  Modern
                </button>
                <button
                  onClick={() => setTemplate("classic")}
                  style={{
                    ...styles.templateButton,
                    ...(template === "classic"
                      ? styles.templateButtonActive
                      : styles.templateButtonInactive),
                  }}
                >
                  Classic
                </button>
                <button
                  onClick={() => setTemplate("basic")}
                  style={{
                    ...styles.templateButton,
                    ...(template === "basic"
                      ? styles.templateButtonActive
                      : styles.templateButtonInactive),
                  }}
                >
                  Basic
                </button>
              </div>
            </div>

            <div style={styles.previewContainer}>
              <div id="cv-preview" style={styles.previewInner}>
                {template === "modern" && renderModernTemplate()}
                {template === "classic" && renderClassicTemplate()}
                {template === "basic" && renderBasicTemplate()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
