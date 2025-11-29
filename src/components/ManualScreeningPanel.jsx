import React, { useState } from "react";
import { toast } from "../components/ui/sonner";
import aiScreeningService from "../lib/aiScreeningService.js";

const ManualScreeningPanel = ({ applications, onScreeningComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [screening, setScreening] = useState(false);
  const [keywords, setKeywords] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("all");
  const [passScore, setPassScore] = useState(40);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const positions = [
    ...new Set(applications.map((app) => app.internships?.position_title)),
  ].filter(Boolean);

  const handleScreenApplications = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!keywords.trim()) {
      try {
        toast.error("Please enter keywords to screen for");
      } catch (e) {}
      return;
    }

    setScreening(true);
    setResults(null);
    setError(null);

    try {
      // Filter applications by position
      const appsToScreen = applications.filter((app) => {
        if (selectedPosition === "all") return true;
        return app.internships?.position_title === selectedPosition;
      });

      if (appsToScreen.length === 0) {
        try {
          toast.info("No applications found for selected position");
        } catch (e) {}
        setScreening(false);
        return;
      }

      console.log(
        `Starting screening for ${appsToScreen.length} applications...`
      );
      const screeningResults = [];

      // Screen each application
      for (const app of appsToScreen) {
        console.log(`Screening application ${app.id}...`);
        console.log("App data:", {
          id: app.id,
          document_url: app.document_url,
          has_document_url: !!app.document_url,
        });

        if (!app.document_url) {
          screeningResults.push({
            id: app.id,
            name: app.students?.profiles?.display_name,
            status: "no_cv",
            message: "No CV uploaded",
          });
          continue;
        }

        try {
          // Use the keywords entered by user as requirements
          const result = await aiScreeningService.screenApplication(
            app.id,
            keywords, // Use custom keywords
            app.document_url
          );

          if (result.success) {
            // Update application with screening results
            const updateResult =
              await aiScreeningService.updateApplicationScreening(
                app.id,
                result
              );

            if (updateResult.error) {
              console.error(
                "Failed to update application:",
                updateResult.error
              );
              screeningResults.push({
                id: app.id,
                name: app.students?.profiles?.display_name,
                status: "error",
                message: `Update failed: ${updateResult.error}`,
              });
              continue;
            }

            const status =
              result.aiScore >= passScore ? "shortlisted" : "rejected";

            screeningResults.push({
              id: app.id,
              name: app.students?.profiles?.display_name,
              score: result.aiScore,
              status,
              matched: result.aiAnalysis.matchedKeywords,
              missing: result.aiAnalysis.missingKeywords,
            });

            // Send rejection email if below pass score
            if (result.aiScore < passScore) {
              await aiScreeningService.sendRejectionEmail(app.id);
            }
          } else {
            screeningResults.push({
              id: app.id,
              name: app.students?.profiles?.display_name,
              status: "error",
              message: result.error || "Screening failed",
            });
          }
        } catch (appError) {
          console.error(`Error screening application ${app.id}:`, appError);
          screeningResults.push({
            id: app.id,
            name: app.students?.profiles?.display_name,
            status: "error",
            message: appError.message,
          });
        }
      }

      setResults(screeningResults);

      // Reload applications to show updated data
      if (onScreeningComplete) {
        await onScreeningComplete();
      }

      console.log("Screening complete:", screeningResults);
    } catch (error) {
      console.error("Error during screening:", error);
      setError(error.message);
      try {
        toast.error("Error during screening: " + error.message);
      } catch (e) {}
    } finally {
      setScreening(false);
    }
  };

  return (
    <div className="manual-screening-panel">
      <button
        className="screening-trigger-btn"
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        type="button"
      >
        🤖 Screen Applications
      </button>

      {isOpen && (
        <div className="screening-modal" onClick={() => setIsOpen(false)}>
          <div
            className="screening-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="screening-header">
              <h2>AI Application Screening</h2>
              <button
                className="close-btn"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                ×
              </button>
            </div>

            <div className="screening-body">
              {error && (
                <div className="error-banner">
                  <strong>Error:</strong> {error}
                </div>
              )}

              <div className="form-group">
                <label>Select Position:</label>
                <select
                  value={selectedPosition}
                  onChange={(e) => setSelectedPosition(e.target.value)}
                  disabled={screening}
                >
                  <option value="all">
                    All Positions ({applications.length})
                  </option>
                  {positions.map((pos, idx) => {
                    const count = applications.filter(
                      (app) => app.internships?.position_title === pos
                    ).length;
                    return (
                      <option key={idx} value={pos}>
                        {pos} ({count})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="form-group">
                <label>Required Keywords/Skills:</label>
                <textarea
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="Enter keywords separated by commas or new lines, e.g.:&#10;JavaScript&#10;React&#10;Node.js&#10;2+ years experience&#10;Bachelor's degree"
                  rows="6"
                  disabled={screening}
                />
                <small>
                  AI will check CV and application details for these keywords
                </small>
              </div>

              <div className="form-group">
                <label>Pass Score Threshold: {passScore}%</label>
                <div className="score-slider">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={passScore}
                    onChange={(e) => setPassScore(parseInt(e.target.value))}
                    disabled={screening}
                  />
                  <span className="score-value">{passScore}%</span>
                </div>
                <small>
                  Applications scoring {passScore}% or above will be shortlisted
                </small>
              </div>

              <div className="screening-actions">
                <button
                  className="cancel-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsOpen(false);
                  }}
                  disabled={screening}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="screen-btn"
                  onClick={handleScreenApplications}
                  disabled={screening || !keywords.trim()}
                  type="button"
                >
                  {screening ? "Screening..." : "Start Screening"}
                </button>
              </div>
            </div>

            {screening && (
              <div className="screening-progress">
                <div className="spinner"></div>
                <p>
                  Analyzing CVs and applications... This may take a few minutes.
                </p>
                <small>Do not close this window</small>
              </div>
            )}

            {results && (
              <div className="screening-results">
                <h3>Screening Results</h3>

                <div className="results-summary">
                  <div className="summary-item shortlisted">
                    <strong>
                      {results.filter((r) => r.status === "shortlisted").length}
                    </strong>
                    <span>Shortlisted</span>
                  </div>
                  <div className="summary-item rejected">
                    <strong>
                      {results.filter((r) => r.status === "rejected").length}
                    </strong>
                    <span>Rejected</span>
                  </div>
                  <div className="summary-item error">
                    <strong>
                      {
                        results.filter(
                          (r) => r.status === "error" || r.status === "no_cv"
                        ).length
                      }
                    </strong>
                    <span>Errors</span>
                  </div>
                </div>

                <div className="results-list">
                  {results.map((result, idx) => (
                    <div key={idx} className={`result-item ${result.status}`}>
                      <div className="result-header">
                        <strong>{result.name}</strong>
                        {result.score !== undefined && (
                          <span className="result-score">{result.score}%</span>
                        )}
                      </div>

                      {result.status === "shortlisted" && (
                        <div className="result-details">
                          <div className="matched-keywords">
                            ✓ Matched: {result.matched?.join(", ") || "N/A"}
                          </div>
                          {result.missing?.length > 0 && (
                            <div className="missing-keywords">
                              ✗ Missing: {result.missing.slice(0, 3).join(", ")}
                            </div>
                          )}
                        </div>
                      )}

                      {result.status === "rejected" && (
                        <div className="result-details">
                          <span className="rejection-msg">
                            Score: {result.score}% (Below {passScore}%
                            threshold). Rejection email sent.
                          </span>
                        </div>
                      )}

                      {(result.status === "error" ||
                        result.status === "no_cv") && (
                        <div className="result-details">
                          <span className="error-msg">{result.message}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  className="close-results-btn"
                  onClick={() => setIsOpen(false)}
                  type="button"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .manual-screening-panel {
          margin-bottom: 1.5rem;
        }

        .screening-trigger-btn {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.875rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          font-size: 1rem;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          transition: all 0.2s;
        }

        .screening-trigger-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
        }

        .screening-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .screening-modal-content {
          background: white;
          border-radius: 16px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .screening-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .screening-header h2 {
          margin: 0;
          font-size: 1.5rem;
          color: #1e293b;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 2rem;
          color: #64748b;
          cursor: pointer;
          line-height: 1;
          padding: 0;
        }

        .error-banner {
          background: #fee2e2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .screening-body {
          padding: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          color: #475569;
          margin-bottom: 0.5rem;
        }

        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.9375rem;
          font-family: inherit;
        }

        .form-group textarea {
          resize: vertical;
        }

        .form-group small {
          display: block;
          margin-top: 0.5rem;
          color: #64748b;
          font-size: 0.875rem;
        }

        .score-slider {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .score-slider input[type="range"] {
          flex: 1;
        }

        .score-value {
          font-weight: 700;
          font-size: 1.125rem;
          color: #667eea;
          min-width: 50px;
        }

        .screening-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .cancel-btn,
        .screen-btn {
          flex: 1;
          padding: 0.875rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }

        .cancel-btn {
          background: #f1f5f9;
          color: #64748b;
        }

        .cancel-btn:hover:not(:disabled) {
          background: #e2e8f0;
        }

        .screen-btn {
          background: #667eea;
          color: white;
        }

        .screen-btn:hover:not(:disabled) {
          background: #5568d3;
        }

        .screen-btn:disabled,
        .cancel-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .screening-progress {
          text-align: center;
          padding: 2rem;
          background: #f8fafc;
          border-radius: 8px;
          margin-top: 1rem;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .screening-results {
          margin-top: 2rem;
          border-top: 2px solid #e5e7eb;
          padding-top: 1.5rem;
        }

        .screening-results h3 {
          margin: 0 0 1rem 0;
          color: #1e293b;
        }

        .results-summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .summary-item {
          text-align: center;
          padding: 1rem;
          border-radius: 8px;
          border: 2px solid;
        }

        .summary-item.shortlisted {
          border-color: #22c55e;
          background: #f0fdf4;
        }

        .summary-item.rejected {
          border-color: #ef4444;
          background: #fef2f2;
        }

        .summary-item.error {
          border-color: #f59e0b;
          background: #fffbeb;
        }

        .summary-item strong {
          display: block;
          font-size: 1.5rem;
          margin-bottom: 0.25rem;
        }

        .summary-item span {
          font-size: 0.875rem;
          color: #64748b;
        }

        .results-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .result-item {
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid;
        }

        .result-item.shortlisted {
          border-color: #22c55e;
          background: #f0fdf4;
        }

        .result-item.rejected {
          border-color: #ef4444;
          background: #fef2f2;
        }

        .result-item.error,
        .result-item.no_cv {
          border-color: #f59e0b;
          background: #fffbeb;
        }

        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .result-score {
          font-weight: 700;
          font-size: 1.125rem;
        }

        .result-details {
          font-size: 0.875rem;
          color: #64748b;
        }

        .matched-keywords {
          color: #16a34a;
          margin-bottom: 0.25rem;
        }

        .missing-keywords {
          color: #dc2626;
        }

        .rejection-msg,
        .error-msg {
          color: #64748b;
          font-style: italic;
        }

        .close-results-btn {
          width: 100%;
          padding: 0.875rem;
          background: #1070e5;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }

        .close-results-btn:hover {
          background: #0856c1;
        }
      `}</style>
    </div>
  );
};

export default ManualScreeningPanel;
