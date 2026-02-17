import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

export default function AISuggestionButton({
    onClick,
    loading = false,
    disabled = false,
    tokenCost = 20,
    darkMode = false
}) {
    const styles = {
        button: {
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: disabled ? '#9ca3af' : '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 12px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            opacity: disabled ? 0.6 : 1,
            marginTop: '8px',
        },
        icon: {
            width: '16px',
            height: '16px',
        },
        tooltip: {
            fontSize: '11px',
            color: darkMode ? '#d1d5db' : '#6b7280',
            marginTop: '4px',
            fontStyle: 'italic',
        }
    };

    return (
        <div>
            <button
                style={styles.button}
                onClick={onClick}
                disabled={disabled || loading}
                onMouseOver={(e) => {
                    if (!disabled && !loading) {
                        e.target.style.backgroundColor = '#7c3aed';
                        e.target.style.transform = 'translateY(-1px)';
                    }
                }}
                onMouseOut={(e) => {
                    if (!disabled && !loading) {
                        e.target.style.backgroundColor = '#8b5cf6';
                        e.target.style.transform = 'translateY(0)';
                    }
                }}
                title={`Uses ${tokenCost} tokens`}
            >
                {loading ? (
                    <>
                        <Loader2 style={{ ...styles.icon, animation: 'spin 1s linear infinite' }} />
                        Generating...
                    </>
                ) : (
                    <>
                        <Sparkles style={styles.icon} />
                        AI Improve
                    </>
                )}
            </button>
            <div style={styles.tooltip}>
                {disabled ? 'Insufficient tokens' : `Uses ${tokenCost} tokens`}
            </div>
        </div>
    );
}
