import React, { useState, useEffect } from "react";
import "../style/internship.css";
import InternHeroSection from "../components/InternHero.jsx";
import ResultsHeader from "../components/ResultsHeader.jsx";
import JobCardApply from "../components/JobCardApply.jsx";
import SearchBar from "../components/SearchBar.jsx";
import { Button } from "../components/button.jsx";
import Navbar from "../components/navbar.jsx";
import Footer from "../components/footer.jsx";
import { useNavigate } from "react-router-dom";
import studentService from "../lib/studentService.js";

const getCompanyLogo = (logoUrl) => {
  return logoUrl || "https://via.placeholder.com/60x60/3498db/ffffff?text=ORG";
};

// Main Search Page Component
const InternshipSearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [duration, setDuration] = useState("");
  const [compensation, setCompensation] = useState("");
  const [internships, setInternships] = useState([]);
  const [allInternships, setAllInternships] = useState([]); // Store all results for pagination
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searching, setSearching] = useState(false);
  const [displayCount, setDisplayCount] = useState(7); // Start with 7 results
  const [hasSearched, setHasSearched] = useState(false);
  
  const navigate = useNavigate();

  // Remove automatic loading on component mount
  useEffect(() => {
    // Component starts with empty state - no automatic loading
    setLoading(false);
  }, []);

  const handleSearch = async () => {
    // Validate that at least searchQuery (role/keyword) is provided
    if (!searchQuery.trim()) {
      setError("Please enter a role or keyword to search for internships");
      return;
    }

    try {
      setSearching(true);
      setError(null);
      setHasSearched(true);
      setDisplayCount(7); // Reset to show first 7 results
      
      // First, get results based on keyword only (flexible search)
      const keywordOnlyParams = {
        query: searchQuery.trim(),
        location: '', // Don't apply location filter initially
        workType: '',
        duration: '',
        compensation: ''
      };

      console.log('Searching with flexible params:', keywordOnlyParams);

      const { data, error } = await studentService.searchInternships(keywordOnlyParams);
      
      if (error) {
        setError(error);
        setAllInternships([]);
        setInternships([]);
      } else {
        let results = data || [];
        
        // Apply flexible filtering and sorting on frontend
        if (results.length > 0) {
          results = applyFlexibleFiltering(results);
        }
        
        setAllInternships(results);
        // Show first 7 results
        setInternships(results.slice(0, 7));
      }
    } catch (err) {
      setError(err.message);
      setAllInternships([]);
      setInternships([]);
    } finally {
      setSearching(false);
    }
  };

  // New function to apply flexible filtering and prioritization
  const applyFlexibleFiltering = (results) => {
    const keyword = searchQuery.toLowerCase().trim();
    const locationFilter = location.toLowerCase().trim();
    const workTypeFilter = jobType;
    const durationFilter = duration;
    const compensationFilter = compensation;

    // Score and sort results based on relevance
    const scoredResults = results.map(internship => {
      let score = 0;
      const title = internship.position_title?.toLowerCase() || '';
      const dept = internship.department?.toLowerCase() || '';
      const desc = internship.description?.toLowerCase() || '';
      const orgName = internship.organizations?.organization_name?.toLowerCase() || '';
      const internLocation = internship.location?.toLowerCase() || '';

      // High priority: Exact or partial keyword matches in title
      if (title.includes(keyword)) {
        score += title === keyword ? 100 : 80; // Exact match gets highest score
      }
      
      // Medium priority: Keyword in department
      if (dept.includes(keyword)) {
        score += 60;
      }

      // Medium priority: Keyword in organization name
      if (orgName.includes(keyword)) {
        score += 50;
      }

      // Lower priority: Keyword in description
      if (desc.includes(keyword)) {
        score += 30;
      }

      // Bonus points for matching additional filters (but don't exclude if they don't match)
      if (locationFilter && internLocation.includes(locationFilter)) {
        score += 20;
      }

      if (workTypeFilter && workTypeFilter !== 'all' && internship.work_type === workTypeFilter) {
        score += 15;
      }

      if (compensationFilter && compensationFilter !== 'all' && internship.compensation === compensationFilter) {
        score += 15;
      }

      // Duration bonus (flexible matching)
      if (durationFilter && durationFilter !== 'all') {
        const durationMatch = durationFilter.match(/(\d+)/);
        const filterDuration = durationMatch ? parseInt(durationMatch[1]) : null;
        if (filterDuration && 
            internship.min_duration <= filterDuration && 
            internship.max_duration >= filterDuration) {
          score += 15;
        }
      }

      return { ...internship, relevanceScore: score };
    });

    // Sort by relevance score (highest first), then by creation date
    return scoredResults
      .sort((a, b) => {
        if (b.relevanceScore !== a.relevanceScore) {
          return b.relevanceScore - a.relevanceScore;
        }
        return new Date(b.created_at) - new Date(a.created_at);
      });
  };

  const handleLoadMore = () => {
    const currentCount = displayCount;
    const newCount = currentCount + 3; // Load 3 more
    setDisplayCount(newCount);
    setInternships(allInternships.slice(0, newCount));
  };

  const clearFilters = () => {
    setSearchQuery("");
    setLocation("");
    setJobType("");
    setDuration("");
    setCompensation("");
    setInternships([]);
    setAllInternships([]);
    setError(null);
    setHasSearched(false);
    setDisplayCount(7);
  };

  const handleViewDetails = (internshipId) => {
    navigate(`/internship-details/${internshipId}`);
  };

  const handleApply = (internshipId) => {
    navigate(`/apply/${internshipId}`);
  };

  const formatInternshipData = (internship) => {
    return {
      id: internship.id,
      logo: getCompanyLogo(internship.organizations?.logo_url),
      jobTitle: internship.position_title,
      company: internship.organizations?.organization_name || 'Unknown Company',
      location: internship.location,
      duration: `${internship.min_duration}-${internship.max_duration} months`,
      timePosted: new Date(internship.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      tags: [
        internship.compensation?.charAt(0).toUpperCase() + internship.compensation?.slice(1) || 'Unpaid',
        internship.work_type?.charAt(0).toUpperCase() + internship.work_type?.slice(1) || 'Onsite'
      ].filter(Boolean)
    };
  };

  // Check if there are more results to load
  const hasMoreResults = allInternships.length > displayCount;

  return (
    <>
      <Navbar />
      <div className="search-page">
        {/* Hero Section with Search */}
        <InternHeroSection>
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            location={location}
            setLocation={setLocation}
            jobType={jobType}
            setJobType={setJobType}
            duration={duration}
            setDuration={setDuration}
            compensation={compensation}
            setCompensation={setCompensation}
            onSearch={handleSearch}
            onClear={clearFilters}
            loading={searching}
          />
        </InternHeroSection>

        {/* Results Section */}
        <div className="results-section">
          <div className="in-container">
            {hasSearched && <ResultsHeader jobCount={allInternships.length} />}

            {error && (
              <div className="error-message">
                <p>Error: {error}</p>
                {error.includes("role or keyword") ? (
                  <p style={{ fontSize: '14px', marginTop: '0.5rem' }}>
                    Try searching for roles like: Frontend, Backend, Design, Marketing, Data Science, etc.
                  </p>
                ) : (
                  <button 
                    className="retry-btn"
                    onClick={() => {
                      setError(null);
                      handleSearch();
                    }}
                  >
                    Retry
                  </button>
                )}
              </div>
            )}

            {/* Job Listings */}
            <div className="in-jobs-container">
              {searching ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Searching internships...</p>
                </div>
              ) : internships.length > 0 ? (
                internships.map((internship) => {
                  const formattedData = formatInternshipData(internship);
                  return (
                    <JobCardApply
                      key={internship.id}
                      logo={formattedData.logo}
                      jobTitle={formattedData.jobTitle}
                      company={formattedData.company}
                      location={formattedData.location}
                      duration={formattedData.duration}
                      timePosted={formattedData.timePosted}
                      tags={formattedData.tags}
                      onApply={() => handleApply(internship.id)}
                      onViewDetails={() => handleViewDetails(internship.id)}
                    />
                  );
                })
              ) : hasSearched && !searching ? (
                <div className="no-results-state">
                  <div className="search-icon">🔍</div>
                  <h3>No Internships Found</h3>
                  <p>We couldn't find any internships matching "<strong>{searchQuery}</strong>"</p>
                  <p><strong>Try:</strong></p>
                  <ul>
                    <li>Checking your spelling</li>
                    <li>Using different keywords (e.g., "developer" instead of "programmer")</li>
                    <li>Trying broader terms (e.g., "tech" instead of specific technologies)</li>
                    <li>Searching for related roles</li>
                  </ul>
                  <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '1rem' }}>
                    <em>Note: We search across job titles, departments, descriptions, and company names to find the best matches for you.</em>
                  </p>
                </div>
              ) : (
                <div className="initial-state">
                  <div className="empty-search-state">
                    <div className="search-icon">🔍</div>
                    <h3>Find Your Perfect Internship</h3>
                    <p>Enter a role or keyword above to discover internship opportunities that match your interests and skills.</p>
                    <p><strong>Popular searches:</strong> Frontend, Backend, Design, Marketing, Data Science, Mobile Development</p>
                    <p style={{ color: '#6b7280', fontSize: '14px' }}>
                      <em>💡 Pro tip: We'll show you relevant results even if other filters don't match exactly!</em>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Load More Button */}
            {hasMoreResults && internships.length > 0 && (
              <div className="load-more-container">
                <Button 
                  label={`Load ${Math.min(3, allInternships.length - displayCount)} More Internships`} 
                  variant="secondary" 
                  onClick={handleLoadMore}
                />
                <p className="load-more-info">
                  Showing {internships.length} of {allInternships.length} internships
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
      
      <style jsx>{`
        .loading-state {
          text-align: center;
          padding: 3rem;
        }
        
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #1070e5;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .error-message {
          background: #fee;
          border: 1px solid #fcc;
          border-radius: 8px;
          padding: 1rem;
          margin: 1rem 0;
          text-align: center;
        }
        
        .error-message p {
          color: #c33;
          margin: 0 0 1rem;
        }
        
        .retry-btn {
          background: #1070e5;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .retry-btn:hover {
          background: #0d5bb8;
        }
        
        .empty-search-state, .no-results-state {
          text-align: center;
          padding: 4rem 2rem;
          max-width: 500px;
          margin: 0 auto;
        }
        
        .search-icon {
          font-size: 4rem;
          margin-bottom: 1.5rem;
        }
        
        .empty-search-state h3, .no-results-state h3 {
          font-size: 1.5rem;
          color: #1e293b;
          margin-bottom: 1rem;
        }
        
        .empty-search-state p, .no-results-state p {
          color: #64748b;
          margin-bottom: 1rem;
          line-height: 1.6;
        }
        
        .no-results-state ul {
          text-align: left;
          color: #64748b;
          margin: 1rem 0;
          padding-left: 1.5rem;
        }
        
        .no-results-state li {
          margin-bottom: 0.5rem;
        }
        
        .initial-state {
          min-height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .load-more-container {
          text-align: center;
          padding: 2rem 0;
          border-top: 1px solid #e2e8f0;
          margin-top: 2rem;
        }
        
        .load-more-info {
          color: #64748b;
          font-size: 0.9rem;
          margin-top: 1rem;
        }
      `}</style>
    </>
  );
};

export default InternshipSearchPage;