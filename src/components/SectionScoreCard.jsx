import React from 'react';
import { CheckCircle, AlertCircle, TrendingUp, Sparkles } from 'lucide-react';

export default function SectionScoreCard({
    section,
    darkMode,
    onImprove
}) {
    const { name, score, status, issues, strengths } = section;

    // Get color based on score
    const getColor = (score) => {
        if (score >= 80) return '#10b981';
        if (score >= 60) return '#f59e0b';
        return '#ef4444';
    };

    const color = getColor(score);

    const styles = {
        card: {
            backgroundColor: darkMode ? '#1f2937' : '#ffffff',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '16px',
            border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
        },
        title: {
            fontSize: '18px',
            fontWeight: '600',
            color: darkMode ? '#ffffff' : '#1f2937',
        },
        scoreBadge: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            borderRadius: '20px',
            backgroundColor: `${color}20`,
            border: `2px solid ${color}`,
        },
        scoreText: {
            fontSize: '16px',
            fontWeight: 'bold',
            color: color,
        },
        statusText: {
            fontSize: '12px',
            fontWeight: '600',
            color: color,
        },
        progressBar: {
            width: '100%',
            height: '8px',
            backgroundColor: darkMode ? '#374151' : '#e5e7eb',
            borderRadius: '4px',
            overflow: 'hidden',
            marginBottom: '16px',
        },
        progressFill: {
            height: '100%',
            backgroundColor: color,
            width: `${score}%`,
            transition: 'width 0.5s ease',
        },
        section: {
            marginBottom: '12px',
        },
        sectionTitle: {
            fontSize: '14px',
            fontWeight: '600',
            color: darkMode ? '#9ca3af' : '#6b7280',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
        },
        list: {
            listStyle: 'none',
            padding: 0,
            margin: 0,
        },
        listItem: {
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            padding: '6px 0',
            fontSize: '14px',
            color: darkMode ? '#d1d5db' : '#4b5563',
        },
        improveButton: {
            width: '100%',
            padding: '12px',
            backgroundColor: color,
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '16px',
            transition: 'opacity 0.2s ease',
        },
    };

    return (
        <div
            style={styles.card}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 12px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            }}
        >
            {/* Header */}
            <div style={styles.header}>
                <h3 style={styles.title}>{name}</h3>
                <div style={styles.scoreBadge}>
                    <span style={styles.scoreText}>{score}%</span>
                    <span style={styles.statusText}>{status}</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div style={styles.progressBar}>
                <div style={styles.progressFill} />
            </div>

            {/* Strengths */}
            {strengths && strengths.length > 0 && (
                <div style={styles.section}>
                    <div style={styles.sectionTitle}>✓ Strengths</div>
                    <ul style={styles.list}>
                        {strengths.map((strength, index) => (
                            <li key={index} style={styles.listItem}>
                                <CheckCircle size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <span>{strength}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Issues */}
            {issues && issues.length > 0 && (
                <div style={styles.section}>
                    <div style={styles.sectionTitle}>⚠ Areas to Improve</div>
                    <ul style={styles.list}>
                        {issues.map((issue, index) => (
                            <li key={index} style={styles.listItem}>
                                <AlertCircle size={16} color={color} style={{ flexShrink: 0, marginTop: '2px' }} />
                                <span>{issue}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Improve Button */}
            {score < 80 && onImprove && (
                <button
                    style={styles.improveButton}
                    onClick={onImprove}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                    <Sparkles size={18} />
                    Improve with AI
                </button>
            )}
        </div>
    );
}
