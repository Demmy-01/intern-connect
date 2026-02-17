import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 5000 }) {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const icons = {
        success: <CheckCircle size={20} />,
        error: <XCircle size={20} />,
        warning: <AlertCircle size={20} />,
        info: <AlertCircle size={20} />
    };

    const colors = {
        success: {
            bg: '#10b981',
            border: '#059669',
            text: '#ffffff'
        },
        error: {
            bg: '#ef4444',
            border: '#dc2626',
            text: '#ffffff'
        },
        warning: {
            bg: '#f59e0b',
            border: '#d97706',
            text: '#ffffff'
        },
        info: {
            bg: '#3b82f6',
            border: '#2563eb',
            text: '#ffffff'
        }
    };

    const color = colors[type] || colors.info;

    const styles = {
        container: {
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            maxWidth: '400px',
            minWidth: '300px',
            animation: 'slideInFromTop 0.3s ease-out',
        },
        toast: {
            backgroundColor: color.bg,
            color: color.text,
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            border: `2px solid ${color.border}`,
        },
        icon: {
            flexShrink: 0,
            marginTop: '2px',
        },
        content: {
            flex: 1,
            fontSize: '14px',
            lineHeight: '1.5',
            whiteSpace: 'pre-line',
        },
        closeButton: {
            background: 'transparent',
            border: 'none',
            color: color.text,
            cursor: 'pointer',
            padding: '0',
            display: 'flex',
            alignItems: 'center',
            opacity: 0.8,
            transition: 'opacity 0.2s',
        },
    };

    return (
        <div style={styles.container}>
            <style>
                {`
                    @keyframes slideInFromTop {
                        from {
                            transform: translateY(-100px);
                            opacity: 0;
                        }
                        to {
                            transform: translateY(0);
                            opacity: 1;
                        }
                    }
                `}
            </style>
            <div style={styles.toast}>
                <div style={styles.icon}>
                    {icons[type]}
                </div>
                <div style={styles.content}>
                    {message}
                </div>
                <button
                    style={styles.closeButton}
                    onClick={onClose}
                    onMouseOver={(e) => e.target.style.opacity = '1'}
                    onMouseOut={(e) => e.target.style.opacity = '0.8'}
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
}
