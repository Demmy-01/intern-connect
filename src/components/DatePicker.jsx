import React, { useState, useRef, useEffect } from 'react';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, X } from 'lucide-react';

export default function DatePicker({ value, onChange, placeholder, darkMode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(value ? parseDate(value) : undefined);
    const containerRef = useRef(null);

    // Parse "MMM yyyy" format to Date object
    function parseDate(dateString) {
        if (!dateString) return undefined;
        try {
            const [month, year] = dateString.split(' ');
            const monthIndex = new Date(Date.parse(month + " 1, 2000")).getMonth();
            return new Date(parseInt(year), monthIndex, 1);
        } catch {
            return undefined;
        }
    }

    // Format Date object to "MMM yyyy"
    function formatDate(date) {
        if (!date) return '';
        try {
            return format(date, 'MMM yyyy');
        } catch {
            return '';
        }
    }

    // Handle date selection
    const handleSelect = (date) => {
        setSelectedDate(date);
        const formatted = formatDate(date);
        onChange(formatted);
        setIsOpen(false);
    };

    // Handle clear
    const handleClear = (e) => {
        e.stopPropagation();
        setSelectedDate(undefined);
        onChange('');
    };

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const styles = {
        container: {
            position: 'relative',
            width: '100%',
        },
        input: {
            width: '100%',
            padding: '10px 36px 10px 12px',
            border: darkMode ? '1px solid #374151' : '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: darkMode ? '#111827' : '#f9fafb',
            color: darkMode ? '#ffffff' : '#1f2937',
            cursor: 'pointer',
            boxSizing: 'border-box',
        },
        iconContainer: {
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            pointerEvents: 'none',
        },
        icon: {
            width: '16px',
            height: '16px',
            color: darkMode ? '#9ca3af' : '#6b7280',
        },
        clearButton: {
            pointerEvents: 'auto',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'transparent',
            border: 'none',
        },
        popover: {
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            zIndex: 50,
            backgroundColor: darkMode ? '#1f2937' : 'white',
            border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '16px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
    };

    return (
        <div style={styles.container} ref={containerRef}>
            <input
                type="text"
                value={value || ''}
                placeholder={placeholder || 'Select date'}
                onClick={() => setIsOpen(!isOpen)}
                readOnly
                style={styles.input}
            />
            <div style={styles.iconContainer}>
                {value && (
                    <button
                        style={styles.clearButton}
                        onClick={handleClear}
                        title="Clear date"
                    >
                        <X style={{ ...styles.icon, width: '14px', height: '14px' }} />
                    </button>
                )}
                <CalendarIcon style={styles.icon} />
            </div>

            {isOpen && (
                <div style={styles.popover}>
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleSelect}
                        captionLayout="dropdown"
                        fromYear={1960}
                        toYear={2030}
                    />
                </div>
            )}
        </div>
    );
}
