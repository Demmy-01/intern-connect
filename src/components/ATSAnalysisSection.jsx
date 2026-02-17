import React, { useState, useEffect } from "react";
import {
  Target,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  BarChart3,
} from "lucide-react";
import SectionScoreCard from "./SectionScoreCard";
import ATSChart from "./ATSChart";
import { getATSAnalysis } from "../lib/api";

export default function ATSAnalysisSection({
  cvData,
  darkMode,
  onImproveSection,
  tokenBalance,
}) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState("radar");

  useEffect(() => {
    analyzeCV();
  }, [cvData]);

  const analyzeCV = async () => {
    setLoading(true);
    try {
      const data = await getATSAnalysis(cvData);
      if (data.success) {
        setAnalysis(data);
      } else {
        console.error("Analysis failed:", data);
      }
    } catch (error) {
      console.error(
        "Failed to analyze CV:",
        error.response?.data || error.message,
      );
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "#10b981";
    if (score >= 60) return "#f59e0b";
    return "#ef4444";
  };

  const getScoreStatus = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Improvement";
  };

  const styles = {
    container: {
      padding: "40px 20px",
      maxWidth: "1200px",
      margin: "0 auto",
    },
    header: {
      textAlign: "center",
      marginBottom: "40px",
    },
    title: {
      fontSize: "32px",
      fontWeight: "bold",
      color: darkMode ? "#ffffff" : "#1f2937",
      marginBottom: "12px",
    },
    subtitle: {
      fontSize: "16px",
      color: darkMode ? "#9ca3af" : "#6b7280",
    },
    overallScoreCard: {
      backgroundColor: darkMode ? "#1f2937" : "#ffffff",
      borderRadius: "16px",
      padding: "32px",
      marginBottom: "32px",
      textAlign: "center",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
      border: `3px solid ${analysis ? getScoreColor(analysis.overallScore) : "#6b7280"}`,
    },
    scoreCircle: {
      width: "150px",
      height: "150px",
      margin: "0 auto 20px",
      borderRadius: "50%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: analysis
        ? `${getScoreColor(analysis.overallScore)}20`
        : "#f3f4f6",
      border: `8px solid ${analysis ? getScoreColor(analysis.overallScore) : "#6b7280"}`,
    },
    scoreNumber: {
      fontSize: "48px",
      fontWeight: "bold",
      color: analysis ? getScoreColor(analysis.overallScore) : "#6b7280",
    },
    scoreLabel: {
      fontSize: "14px",
      color: darkMode ? "#9ca3af" : "#6b7280",
      marginTop: "4px",
    },
    statusBadge: {
      display: "inline-block",
      padding: "8px 20px",
      borderRadius: "20px",
      fontSize: "16px",
      fontWeight: "600",
      backgroundColor: analysis
        ? `${getScoreColor(analysis.overallScore)}20`
        : "#f3f4f6",
      color: analysis ? getScoreColor(analysis.overallScore) : "#6b7280",
      marginBottom: "16px",
    },
    description: {
      fontSize: "14px",
      color: darkMode ? "#d1d5db" : "#4b5563",
      maxWidth: "600px",
      margin: "0 auto",
    },
    chartsContainer: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))",
      gap: "20px",
      marginBottom: "32px",
    },
    chartToggle: {
      display: "flex",
      justifyContent: "center",
      gap: "12px",
      marginBottom: "20px",
    },
    toggleButton: {
      padding: "10px 20px",
      borderRadius: "8px",
      border: "none",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    sectionsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
      gap: "20px",
    },
    sectionHeader: {
      fontSize: "24px",
      fontWeight: "600",
      color: darkMode ? "#ffffff" : "#1f2937",
      marginBottom: "20px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    weakSectionsAlert: {
      backgroundColor: darkMode ? "#7f1d1d" : "#fee2e2",
      border: "2px solid #ef4444",
      borderRadius: "12px",
      padding: "20px",
      marginBottom: "32px",
      display: "flex",
      alignItems: "flex-start",
      gap: "12px",
    },
    alertText: {
      flex: 1,
    },
    alertTitle: {
      fontSize: "16px",
      fontWeight: "600",
      color: "#ef4444",
      marginBottom: "8px",
    },
    alertDescription: {
      fontSize: "14px",
      color: darkMode ? "#fca5a5" : "#991b1b",
    },
    loading: {
      textAlign: "center",
      padding: "60px 20px",
      color: darkMode ? "#9ca3af" : "#6b7280",
    },
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div>
        <div style={{ fontSize: "18px" }}>Analyzing your CV...</div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div style={styles.loading}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>❌</div>
        <div style={{ fontSize: "18px" }}>
          Failed to analyze CV. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>
          <Target style={{ display: "inline", marginRight: "12px" }} />
          ATS Score Analysis
        </h1>
        <p style={styles.subtitle}>
          See how well your CV performs with Applicant Tracking Systems
        </p>
      </div>

      {/* Overall Score */}
      <div style={styles.overallScoreCard}>
        <div style={styles.scoreCircle}>
          <div style={styles.scoreNumber}>{analysis.overallScore}</div>
          <div style={styles.scoreLabel}>ATS SCORE</div>
        </div>
        <div style={styles.statusBadge}>
          {getScoreStatus(analysis.overallScore)}
        </div>
        <p style={styles.description}>
          {analysis.overallScore >= 80
            ? "Excellent! Your CV is highly optimized for ATS systems."
            : analysis.overallScore >= 60
              ? "Good progress! A few improvements will make your CV even better."
              : "Your CV needs improvement to pass ATS screening effectively."}
        </p>
      </div>

      {/* Weak Sections Alert */}
      {analysis.weakSections && analysis.weakSections.length > 0 && (
        <div style={styles.weakSectionsAlert}>
          <AlertTriangle size={24} color="#ef4444" style={{ flexShrink: 0 }} />
          <div style={styles.alertText}>
            <div style={styles.alertTitle}>
              {analysis.weakSections.length} Section
              {analysis.weakSections.length > 1 ? "s" : ""} Need
              {analysis.weakSections.length === 1 ? "s" : ""} Attention
            </div>
            <div style={styles.alertDescription}>
              Focus on improving:{" "}
              {analysis.weakSections.map((s) => s.name).join(", ")}
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div style={styles.chartToggle}>
        <button
          style={{
            ...styles.toggleButton,
            backgroundColor:
              chartType === "radar"
                ? darkMode
                  ? "#3b82f6"
                  : "#3b82f6"
                : darkMode
                  ? "#374151"
                  : "#e5e7eb",
            color:
              chartType === "radar"
                ? "#ffffff"
                : darkMode
                  ? "#9ca3af"
                  : "#6b7280",
          }}
          onClick={() => setChartType("radar")}
        >
          Radar View
        </button>
        <button
          style={{
            ...styles.toggleButton,
            backgroundColor:
              chartType === "bar"
                ? darkMode
                  ? "#3b82f6"
                  : "#3b82f6"
                : darkMode
                  ? "#374151"
                  : "#e5e7eb",
            color:
              chartType === "bar"
                ? "#ffffff"
                : darkMode
                  ? "#9ca3af"
                  : "#6b7280",
          }}
          onClick={() => setChartType("bar")}
        >
          <BarChart3
            size={16}
            style={{ display: "inline", marginRight: "6px" }}
          />
          Bar Chart
        </button>
      </div>

      <div style={styles.chartsContainer}>
        <ATSChart
          sections={analysis.sections}
          darkMode={darkMode}
          type={chartType}
        />
      </div>

      {/* Section Breakdown */}
      <div style={styles.sectionHeader}>
        <TrendingUp size={28} />
        Section Breakdown
      </div>

      <div style={styles.sectionsGrid}>
        {analysis.sections.map((section, index) => (
          <SectionScoreCard
            key={index}
            section={section}
            darkMode={darkMode}
            onImprove={() => onImproveSection && onImproveSection(section)}
          />
        ))}
      </div>

      {/* Token Balance Info */}
      {tokenBalance !== undefined && (
        <div
          style={{
            textAlign: "center",
            marginTop: "32px",
            padding: "16px",
            backgroundColor: darkMode ? "#1f2937" : "#f3f4f6",
            borderRadius: "8px",
            fontSize: "14px",
            color: darkMode ? "#9ca3af" : "#6b7280",
          }}
        >
          <Sparkles
            size={16}
            style={{ display: "inline", marginRight: "6px" }}
          />
          You have {tokenBalance} AI tokens remaining. Each AI improvement costs
          20 tokens.
        </div>
      )}
    </div>
  );
}
