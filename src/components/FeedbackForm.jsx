import React, { useState } from "react";
import { Send } from "lucide-react";

const FeedbackForm = () => {
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!feedback.trim()) {
      setSubmitStatus("Please enter your feedback");
      return;
    }

    setIsSubmitting(true);

    try {
      // You can replace this with your actual API endpoint
      console.log("Feedback submitted:", feedback);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setSubmitStatus("success");
      setFeedback("");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSubmitStatus(null);
      }, 3000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setSubmitStatus("error");

      // Clear error message after 3 seconds
      setTimeout(() => {
        setSubmitStatus(null);
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="feedback-form-container">
      <form onSubmit={handleSubmit} className="feedback-form">
        <textarea
          className="feedback-textarea"
          placeholder="Share your feedback or suggestions..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          disabled={isSubmitting}
          rows={4}
        />

        <div className="feedback-form-footer">
          <button
            type="submit"
            className="feedback-submit-btn"
            disabled={isSubmitting}
          >
            <Send size={16} />
            <span>{isSubmitting ? "Sending..." : "Send Feedback"}</span>
          </button>

          {submitStatus && (
            <div className={`feedback-message feedback-${submitStatus}`}>
              {submitStatus === "success"
                ? "✓ Thank you for your feedback!"
                : submitStatus}
            </div>
          )}
        </div>
      </form>

      <style jsx>{`
        .feedback-form-container {
          padding: 1.5rem;
          border: 1px solid var(--card-border);
          border-radius: 8px;
          background: var(--card-bg);
        }

        .feedback-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .feedback-textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--card-border);
          border-radius: 6px;
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-family: inherit;
          font-size: 0.875rem;
          resize: vertical;
          transition: all 0.2s ease;
        }

        .feedback-textarea:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .feedback-textarea:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .feedback-form-footer {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .feedback-submit-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          background: var(--primary);
          color: var(--text-on-primary);
          border: none;
          border-radius: 6px;
          font-weight: 500;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .feedback-submit-btn:hover:not(:disabled) {
          background: var(--primary-dark);
          transform: translateY(-1px);
        }

        .feedback-submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .feedback-message {
          font-size: 0.875rem;
          padding: 0.5rem 0.75rem;
          border-radius: 4px;
          white-space: nowrap;
        }

        .feedback-success {
          background: rgba(34, 197, 94, 0.1);
          color: var(--success);
          border: 1px solid var(--success);
        }

        .feedback-error {
          background: rgba(239, 68, 68, 0.1);
          color: var(--error);
          border: 1px solid var(--error);
        }

        @media (max-width: 768px) {
          .feedback-form-container {
            padding: 1rem;
          }

          .feedback-textarea {
            font-size: 1rem; /* Prevents zoom on iOS */
          }

          .feedback-form-footer {
            flex-direction: column;
            align-items: stretch;
          }

          .feedback-submit-btn {
            width: 100%;
            justify-content: center;
          }

          .feedback-message {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default FeedbackForm;
