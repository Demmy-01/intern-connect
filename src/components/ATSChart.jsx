import React from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

export default function ATSChart({ sections, darkMode, type = 'radar' }) {
    // Prepare data for charts
    const chartData = sections.map(section => ({
        name: section.name.replace(' ', '\n'),
        score: section.score,
        fullName: section.name
    }));

    // Get color based on score
    const getColor = (score) => {
        if (score >= 80) return '#10b981';
        if (score >= 60) return '#f59e0b';
        return '#ef4444';
    };

    const styles = {
        container: {
            width: '100%',
            height: '400px',
            backgroundColor: darkMode ? '#1f2937' : '#ffffff',
            borderRadius: '12px',
            padding: '20px',
            border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
        },
        title: {
            fontSize: '18px',
            fontWeight: '600',
            color: darkMode ? '#ffffff' : '#1f2937',
            marginBottom: '20px',
            textAlign: 'center',
        },
    };

    // Custom tooltip
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div style={{
                    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                    border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '12px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}>
                    <p style={{
                        margin: 0,
                        fontSize: '14px',
                        fontWeight: '600',
                        color: darkMode ? '#ffffff' : '#1f2937',
                    }}>
                        {data.fullName}
                    </p>
                    <p style={{
                        margin: '4px 0 0 0',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: getColor(data.score),
                    }}>
                        {data.score}%
                    </p>
                </div>
            );
        }
        return null;
    };

    if (type === 'radar') {
        return (
            <div style={styles.container}>
                <h3 style={styles.title}>Section Performance Overview</h3>
                <ResponsiveContainer width="100%" height="90%">
                    <RadarChart data={chartData}>
                        <PolarGrid stroke={darkMode ? '#374151' : '#e5e7eb'} />
                        <PolarAngleAxis
                            dataKey="name"
                            tick={{
                                fill: darkMode ? '#9ca3af' : '#6b7280',
                                fontSize: 12,
                            }}
                        />
                        <PolarRadiusAxis
                            angle={90}
                            domain={[0, 100]}
                            tick={{ fill: darkMode ? '#9ca3af' : '#6b7280' }}
                        />
                        <Radar
                            name="Score"
                            dataKey="score"
                            stroke="#3b82f6"
                            fill="#3b82f6"
                            fillOpacity={0.6}
                        />
                        <Tooltip content={<CustomTooltip />} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        );
    }

    if (type === 'bar') {
        return (
            <div style={styles.container}>
                <h3 style={styles.title}>Section Scores Comparison</h3>
                <ResponsiveContainer width="100%" height="90%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                        <XAxis
                            dataKey="name"
                            tick={{
                                fill: darkMode ? '#9ca3af' : '#6b7280',
                                fontSize: 11,
                            }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                        />
                        <YAxis
                            domain={[0, 100]}
                            tick={{ fill: darkMode ? '#9ca3af' : '#6b7280' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getColor(entry.score)} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        );
    }

    return null;
}
