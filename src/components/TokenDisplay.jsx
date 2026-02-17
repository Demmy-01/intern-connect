import React from 'react';
import { Coins, ShoppingCart } from 'lucide-react';

export default function TokenDisplay({ balance, onPurchaseClick, darkMode }) {
    const getTokenColor = () => {
        if (balance >= 100) return '#10b981'; // green
        if (balance >= 50) return '#f59e0b'; // amber
        if (balance >= 20) return '#f97316'; // orange
        return '#ef4444'; // red
    };

    const styles = {
        container: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: darkMode ? '#374151' : '#f3f4f6',
            padding: '8px 16px',
            borderRadius: '8px',
            border: `2px solid ${getTokenColor()}`,
        },
        tokenInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
        },
        icon: {
            color: getTokenColor(),
            width: '20px',
            height: '20px',
        },
        balance: {
            fontSize: '16px',
            fontWeight: 'bold',
            color: darkMode ? '#ffffff' : '#1f2937',
        },
        label: {
            fontSize: '12px',
            color: darkMode ? '#9ca3af' : '#6b7280',
        },
        purchaseButton: {
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
        },
    };

    return (
        <div style={styles.container}>
            <div style={styles.tokenInfo}>
                <Coins style={styles.icon} />
                <div>
                    <div style={styles.balance}>{balance}</div>
                    <div style={styles.label}>tokens</div>
                </div>
            </div>
            <button
                style={styles.purchaseButton}
                onClick={onPurchaseClick}
                onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
            >
                <ShoppingCart size={14} />
                Buy More
            </button>
        </div>
    );
}
