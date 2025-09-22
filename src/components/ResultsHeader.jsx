// ResultsHeader Component
const ResultsHeader = ({ jobCount }) => {
  return (
    <>
      <style>
        {`
          .results-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            flex-wrap: wrap;
            gap: 1rem;
          }

          .results-title {
            font-size: 1.875rem;
            font-weight: bold;
            color: var(--text-primary);
            margin-bottom: 0.25rem;
          }

          .results-subtitle {
            color: #6b7280;
          }

          .sort-container {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .sort-label {
            font-size: 0.875rem;
            color: #6b7280;
          }

          .sort-select {
            padding: 0.5rem 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            background: white;
          }

          @media (max-width: 768px) {
            .results-header {
              flex-direction: column;
              align-items: flex-start;
            }
          }
        `}
      </style>
      <div className="results-header">
        <div>
          <h2 className="results-title">
            {jobCount} Internship{jobCount !== 1 ? 's' : ''} Found
          </h2>
          <p className="results-subtitle">Showing the best internship opportunities for you</p>
        </div>
        
        {/* Sort Dropdown */}
        <div className="sort-container">
          <span className="sort-label">Sort by:</span>
          <select className="sort-select">
            <option>Most Recent</option>
            <option>Company Name</option>
            <option>Location</option>
            <option>Duration</option>
          </select>
        </div>
      </div>
    </>
  );
};

export default ResultsHeader;