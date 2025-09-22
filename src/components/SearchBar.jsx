import { Button }from "../components/button.jsx";

// SearchBar Component
const SearchBar = ({ 
  searchQuery, 
  setSearchQuery, 
  location, 
  setLocation, 
  jobType, 
  setJobType, 
  duration, 
  setDuration, 
  onSearch, 
  onClear 
}) => {
  return (
    <>
      <style>
        {`
          .search-container {
            background: white;
            border-radius: 0.5rem;
            padding: 1.5rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          }

          .search-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
            margin-bottom: 1rem;
          }

          .input-group {
            position: relative;
          }

          .input-icon {
            position: absolute;
            left: 0.75rem;
            top: 50%;
            transform: translateY(-50%);
            width: 1.25rem;
            height: 1.25rem;
            color: #9ca3af;
          }

          .search-input, .search-select {
            width: 100%;
            padding: 0.75rem 0.75rem 0.75rem 2.5rem;
            border: 1px solid #d1d5db;
            border-radius: 0.5rem;
            font-size: 1rem;
            color: #111827;
            background: white;
          }

          .search-input:focus, .search-select:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }

          .search-select {
            appearance: none;
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
            background-position: right 0.5rem center;
            background-repeat: no-repeat;
            background-size: 1.5em 1.5em;
          }

          .search-buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
          }

          @media (max-width: 768px) {
            .search-grid {
              grid-template-columns: 1fr;
            }

            .search-buttons {
              flex-direction: column;
            }
          }
        `}
      </style>
      <div className="search-container">
        <div className="search-grid">
          {/* Role or Keyword */}
          <div className="input-group">
            <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Role or Keyword"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Location */}
          <div className="input-group">
            <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Type */}
          <div className="input-group">
            <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="search-select"
            >
              <option value="" selected disabled>Type</option>
              <option value="remote">Remote</option>
              <option value="onsite">Onsite</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          {/* Duration */}
          <div className="input-group">
            <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="search-select"
            >
              <option value="" selected disabled>Duration</option>
              <option value="2 months">2 Months</option>
              <option value="3 months">3 Months</option>
              <option value="4 months">4 Months</option>
              <option value="5 months">5 Months</option>
              <option value="6 months">6 Months</option>
            </select>
          </div>
        </div>

        {/* Search and Clear Buttons */}
        <div className="search-buttons">
          <Button 
            label="Search Internships" 
            onClick={onSearch}
          />
          <Button 
            label="Clear Filters" 
            onClick={onClear}
            variant="secondary"
          />
        </div>
      </div>
    </>
  );
};

export default SearchBar;