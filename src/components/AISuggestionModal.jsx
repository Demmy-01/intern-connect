import React, { useState } from 'react';
import { X, Check, Sparkles, RefreshCw } from 'lucide-react';

export default function AISuggestionModal({
    isOpen,
    onClose,
    suggestions,
    onSelect,
    darkMode,
    loading = false,
    originalContent
}) {
    const [selectedIndex, setSelectedIndex] = useState(null);

    if (!isOpen) return null;

    const handleSelect = (index) => {
        setSelectedIndex(index);
        onSelect(suggestions[index]);
        setTimeout(() => {
            onClose();
            setSelectedIndex(null);
        }, 300);
    };

    const styles = {
        overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            animation: 'fadeIn 0.2s ease-out',
        },
        modal: {
            backgroundColor: darkMode ? '#1f2937' : 'white',
            borderRadius: '16px',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
            animation: 'slideUp 0.3s ease-out',
        },
        header: {
            padding: '24px',
            borderBottom: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            backgroundColor: darkMode ? '#1f2937' : 'white',
            zIndex: 1,
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
        },
        title: {
            fontSize: '20px',
            fontWeight: 'bold',
            color: darkMode ? '#ffffff' : '#1f2937',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
        },
        closeButton: {
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: darkMode ? '#9ca3af' : '#6b7280',
            padding: '4px',
            borderRadius: '6px',
            transition: 'background-color 0.2s',
        },
        content: {
            padding: '24px',
        },
        originalSection: {
            marginBottom: '24px',
            padding: '16px',
            backgroundColor: darkMode ? '#111827' : '#f9fafb',
            borderRadius: '8px',
            border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
        },
        originalLabel: {
            fontSize: '12px',
            fontWeight: '600',
            color: darkMode ? '#9ca3af' : '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '8px',
        },
        originalText: {
            fontSize: '14px',
            color: darkMode ? '#d1d5db' : '#374151',
            lineHeight: '1.6',
        },
        suggestionsGrid: {
            display: 'grid',
            gap: '16px',
        },
        suggestionCard: {
            padding: '20px',
            borderRadius: '12px',
            border: '2px solid',
            cursor: 'pointer',
            transition: 'all 0.2s',
            position: 'relative',
        },
        suggestionHeader: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
        },
        suggestionLabel: {
            fontSize: '13px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
        },
        suggestionText: {
            fontSize: '14px',
            lineHeight: '1.6',
            marginBottom: '16px',
        },
        selectButton: {
            width: '100%',
            padding: '10px 16px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'background-color 0.2s',
        },
        loadingContainer: {
            textAlign: 'center',
            padding: '40px 20px',
        },
        loadingText: {
            fontSize: '16px',
            color: darkMode ? '#9ca3af' : '#6b7280',
            marginTop: '16px',
        },
    };

    const suggestionColors = [
        {
            border: '#3b82f6',
            bg: darkMode ? '#1e3a8a20' : '#dbeafe',
            label: '#3b82f6',
            hover: darkMode ? '#1e3a8a40' : '#bfdbfe'
        },
        {
            border: '#10b981',
            bg: darkMode ? '#05472a20' : '#d1fae5',
            label: '#10b981',
            hover: darkMode ? '#05472a40' : '#a7f3d0'
        },
        {
            border: '#f59e0b',
            bg: darkMode ? '#78350f20' : '#fef3c7',
            label: '#f59e0b',
            hover: darkMode ? '#78350f40' : '#fde68a'
        },
    ];

    return (
        <>
            <style>
                {`
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    @keyframes slideUp {
                        from {
                            transform: translateY(20px);
                            opacity: 0;
                        }
                        to {
                            transform: translateY(0);
                            opacity: 1;
                        }
                    }
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `}
            </style>
            <div style={styles.overlay} onClick={onClose}>
                <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                    <div style={styles.header}>
                        <h2 style={styles.title}>
                            <Sparkles size={24} color="#2563eb" />
                            AI Suggestions
                        </h2>
                        <button
                            style={styles.closeButton}
                            onClick={onClose}
                            onMouseOver={(e) => e.target.style.backgroundColor = darkMode ? '#374151' : '#f3f4f6'}
                            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div style={styles.content}>
                        {/* Original Content */}
                        {originalContent && (
                            <div style={styles.originalSection}>
                                <div style={styles.originalLabel}>Original</div>
                                <div style={styles.originalText}>{originalContent}</div>
                            </div>
                        )}

                        {/* Loading State */}
                        {loading && (
                            <div style={styles.loadingContainer}>
                                <RefreshCw
                                    size={40}
                                    color="#2563eb"
                                    style={{ animation: 'spin 1s linear infinite' }}
                                />
                                <div style={styles.loadingText}>
                                    Generating AI suggestions...
                                </div>
                            </div>
                        )}

                        {/* Suggestions */}
                        {!loading && suggestions && suggestions.length > 0 && (
                            <div style={styles.suggestionsGrid}>
                                {suggestions.map((suggestion, index) => {
                                    const colors = suggestionColors[index % suggestionColors.length];
                                    const isSelected = selectedIndex === index;

                                    return (
                                        <div
                                            key={index}
                                            style={{
                                                ...styles.suggestionCard,
                                                borderColor: colors.border,
                                                backgroundColor: colors.bg,
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.backgroundColor = colors.hover;
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.1)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.backgroundColor = colors.bg;
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            <div style={styles.suggestionHeader}>
                                                <div style={{
                                                    ...styles.suggestionLabel,
                                                    color: colors.label,
                                                }}>
                                                    Option {index + 1}
                                                </div>
                                            </div>

                                            <div style={{
                                                ...styles.suggestionText,
                                                color: darkMode ? '#e5e7eb' : '#1f2937',
                                            }}>
                                                {suggestion}
                                            </div>

                                            <button
                                                style={styles.selectButton}
                                                onClick={() => handleSelect(index)}
                                                onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                                                onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
                                                disabled={isSelected}
                                            >
                                                {isSelected ? (
                                                    <>
                                                        <Check size={16} />
                                                        Selected
                                                    </>
                                                ) : (
                                                    <>
                                                        <Check size={16} />
                                                        Use This
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
