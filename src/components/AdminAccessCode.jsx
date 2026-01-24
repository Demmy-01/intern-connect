import { useState } from 'react';
import { Lock } from 'lucide-react';

/**
 * AdminAccessCode Component
 * Provides an additional security layer by requiring an access code
 * before allowing admin dashboard access
 */
const AdminAccessCode = ({ onSuccess }) => {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Access code stored in environment variable
  const ADMIN_ACCESS_CODE = import.meta.env.VITE_ADMIN_ACCESS_CODE || 'ADMIN2024';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate a small delay for security
    await new Promise(resolve => setTimeout(resolve, 500));

    if (accessCode === ADMIN_ACCESS_CODE) {
      // Store in sessionStorage to persist during session
      sessionStorage.setItem('admin_access_verified', 'true');
      sessionStorage.setItem('admin_access_time', new Date().toISOString());
      onSuccess();
    } else {
      setError('Invalid access code. Please try again.');
      setAccessCode('');
    }

    setLoading(false);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div style={styles.iconContainer}>
            <Lock size={32} color="#2a5298" />
          </div>
          <h2 style={styles.title}>Admin Access Code Required</h2>
          <p style={styles.subtitle}>
            Enter the admin access code to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="password"
            value={accessCode}
            onChange={(e) => {
              setAccessCode(e.target.value);
              setError('');
            }}
            placeholder="Enter access code"
            style={styles.input}
            autoFocus
            disabled={loading}
            maxLength={20}
          />

          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          <button
            type="submit"
            style={styles.button}
            disabled={loading || !accessCode}
          >
            {loading ? 'Verifying...' : 'Verify Access'}
          </button>

          <p style={styles.helpText}>
            This is an additional security measure to protect admin access.
            Contact your administrator if you don't have the access code.
          </p>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    backdropFilter: 'blur(4px)',
  },
  modal: {
    background: 'white',
    borderRadius: '16px',
    padding: '2.5rem',
    maxWidth: '450px',
    width: '90%',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  iconContainer: {
    display: 'inline-flex',
    padding: '1rem',
    background: 'rgba(42, 82, 152, 0.1)',
    borderRadius: '50%',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0 0 0.5rem 0',
  },
  subtitle: {
    fontSize: '0.95rem',
    color: '#6b7280',
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  input: {
    width: '100%',
    padding: '0.875rem 1rem',
    fontSize: '1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
    fontFamily: 'monospace',
    letterSpacing: '2px',
    textAlign: 'center',
  },
  error: {
    background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
    color: '#dc2626',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    fontSize: '0.875rem',
    borderLeft: '4px solid #dc2626',
    fontWeight: '500',
  },
  button: {
    width: '100%',
    padding: '0.875rem 1.5rem',
    background: 'linear-gradient(135deg, #1e3c72, #2a5298)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
    marginTop: '0.5rem',
  },
  helpText: {
    fontSize: '0.8rem',
    color: '#9ca3af',
    textAlign: 'center',
    margin: '0.5rem 0 0 0',
    lineHeight: '1.5',
  },
};

// Add hover effect via CSS-in-JS
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    input:focus {
      border-color: #2a5298 !important;
      box-shadow: 0 0 0 3px rgba(42, 82, 152, 0.1) !important;
    }
    button:not(:disabled):hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(30, 60, 114, 0.3);
    }
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `;
  document.head.appendChild(styleSheet);
}

export default AdminAccessCode;
