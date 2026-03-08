import React from "react";

export default function TableSkeleton({ rows = 5, columns = 5 }) {
  return (
    <div style={styles.container}>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} style={styles.row}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              style={{
                ...styles.skeletonCell,
                width: `${Math.floor(Math.random() * 40) + 40}%`, // Random width between 40-80%
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    padding: "24px",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    gap: "24px",
  },
  skeletonCell: {
    height: "20px",
    backgroundColor: "#e2e8f0",
    borderRadius: "4px",
    animation: "pulse 1.5s infinite ease-in-out",
  },
};

// We technically inject the pulse keyframe here globally for skeletons
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes pulse {
    0% { opacity: 0.6; }
    50% { opacity: 0.3; }
    100% { opacity: 0.6; }
  }
`;
document.head.appendChild(styleSheet);
