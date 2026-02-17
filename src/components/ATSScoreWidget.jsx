import React, { useEffect, useState } from 'react';
import { Target, TrendingUp, AlertCircle } from 'lucide-react';

export default function ATSScoreWidget({ score, darkMode, onClick }) {
    const [displayScore, setDisplayScore] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);

    // Animate score counting
    useEffect(() => {
        if (score === displayScore) return;

        const increment = score > displayScore ? 1 : -1;
        const timer = setInterval(() => {
            setDisplayScore(prev => {
                if ((increment > 0 && prev >= score) || (increment < 0 && prev <= score)) {
                    clearInterval(timer);
                    return score;
                }
                return prev + increment;
            });
        }, 20);

        return () => clearInterval(timer);
    }, [score]);

    // Get color based on score
    const getColor = (score) => {
        if (score >= 80) return '#10b981'; // Green
        if (score >= 60) return '#f59e0b'; // Orange
        return '#ef4444'; // Red
    };

    // Get status text
    const getStatus = (score) => {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Fair';
        return 'Needs Work';
    };

    const color = getColor(displayScore);
    const status = getStatus(displayScore);
    const circumference = 2 * Math.PI * 36; // radius = 36
    const strokeDashoffset = circumference - (displayScore / 100) * circumference;

    const styles = {
        container: {
            position: 'fixed',
            right: '20px',
            top: '120px',
            zIndex: 100,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
        },
        widget: {
            width: isExpanded ? '200px' : '90px',
            height: isExpanded ? 'auto' : '90px',
            backgroundColor: darkMode ? '#1f2937' : '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            padding: '16px',
            transition: 'all 0.3s ease',
            border: `2px solid ${color}`,
        },
        scoreCircle: {
            position: 'relative',
            width: '80px',
            height: '80px',
            margin: '0 auto',
        },
        svg: {
            transform: 'rotate(-90deg)',
            width: '100%',
            height: '100%',
        },
        circleBackground: {
            fill: 'none',
            stroke: darkMode ? '#374151' : '#e5e7eb',
            strokeWidth: '8',
        },
        circleProgress: {
            fill: 'none',
            stroke: color,
            strokeWidth: '8',
            strokeLinecap: 'round',
            transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease',
            strokeDasharray: circumference,
            strokeDashoffset: strokeDashoffset,
        },
        scoreText: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
        },
        scoreNumber: {
            fontSize: '24px',
            fontWeight: 'bold',
            color: color,
            lineHeight: '1',
        },
        scoreLabel: {
            fontSize: '10px',
            color: darkMode ? '#9ca3af' : '#6b7280',
            marginTop: '2px',
        },
        expandedContent: {
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
        },
        statusRow: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px',
        },
        statusText: {
            fontSize: '14px',
            fontWeight: '600',
            color: darkMode ? '#ffffff' : '#1f2937',
        },
        statusBadge: {
            fontSize: '11px',
            padding: '2px 8px',
            borderRadius: '12px',
            backgroundColor: `${color}20`,
            color: color,
            fontWeight: '600',
        },
        tip: {
            fontSize: '11px',
            color: darkMode ? '#9ca3af' : '#6b7280',
            marginTop: '8px',
            lineHeight: '1.4',
        },
        pulseAnimation: {
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        },
    };

    return (
        <>
            <style>
                {`
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.7; }
                    }
                    @media (max-width: 768px) {
                        .ats-widget-container {
                            right: 10px !important;
                            top: 80px !important;
                        }
                    }
                `}
            </style>
            <div
                className="ats-widget-container"
                style={styles.container}
                onClick={() => {
                    setIsExpanded(!isExpanded);
                    if (onClick) onClick();
                }}
                onMouseEnter={() => setIsExpanded(true)}
                onMouseLeave={() => setIsExpanded(false)}
            >
                <div style={styles.widget}>
                    {/* Score Circle */}
                    <div style={styles.scoreCircle}>
                        <svg style={styles.svg}>
                            <circle
                                cx="40"
                                cy="40"
                                r="36"
                                style={styles.circleBackground}
                            />
                            <circle
                                cx="40"
                                cy="40"
                                r="36"
                                style={styles.circleProgress}
                            />
                        </svg>
                        <div style={styles.scoreText}>
                            <div style={styles.scoreNumber}>{displayScore}</div>
                            <div style={styles.scoreLabel}>ATS</div>
                        </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                        <div style={styles.expandedContent}>
                            <div style={styles.statusRow}>
                                <Target size={16} color={color} />
                                <span style={styles.statusText}>ATS Score</span>
                            </div>
                            <div style={styles.statusBadge}>{status}</div>

                            {displayScore < 80 && (
                                <div style={styles.tip}>
                                    <AlertCircle size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                    {displayScore < 60
                                        ? 'Add more details to improve your score'
                                        : 'Almost there! Keep improving'}
                                </div>
                            )}

                            {displayScore >= 80 && (
                                <div style={{ ...styles.tip, color: color }}>
                                    <TrendingUp size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                    Great job! Your CV is ATS-friendly
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
