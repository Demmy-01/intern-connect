import React, { useState, useEffect } from "react";
import "../style/internship.css";
import { Button } from "../components/button.jsx";
import Navbar from "../components/navbar.jsx";
import Footer from "../components/footer.jsx";
import { useNavigate } from "react-router-dom";
import studentService from "../lib/studentService.js";
import "../style/it.css";
import { useTheme } from "../context/ThemeContext.jsx";
import { MapPin, Calendar, Clock, Info, X, Check } from "lucide-react";

const getCompanyLogo = (logoUrl) => {
  return logoUrl || "https://via.placeholder.com/60x60/3498db/ffffff?text=ORG";
};

const InternshipSearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [duration, setDuration] = useState("");
  const [compensation, setCompensation] = useState("");
  const [internships, setInternships] = useState([]);
  const [allInternships, setAllInternships] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searching, setSearching] = useState(false);
  const [displayCount, setDisplayCount] = useState(7);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchType, setSearchType] = useState(null);
  const [searchedTerm, setSearchedTerm] = useState("");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const navigate = useNavigate();
  const { darkMode } = useTheme();
  // Fetch available roles on component mount
  useEffect(() => {
    fetchAvailableRoles();
  }, []);

  // Filter roles based on search query
  useEffect(() => {
    if (searchQuery) {
      const filtered = availableRoles.filter((role) =>
        role.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRoles(filtered);
    } else {
      setFilteredRoles(availableRoles);
    }
  }, [searchQuery, availableRoles]);

  const fetchAvailableRoles = async () => {
    try {
      const { data } = await studentService.getAllActiveInternships();
      if (data) {
        // Extract unique roles from internships
        const roles = [...new Set(data.map((i) => i.position_title))];

        const commonRoles = [
  // --- Tech & IT ---
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "UI/UX Designer",
  "Product Designer",
  "Data Analyst",
  "Data Scientist",
  "Marketing",
  "Content Writer",
  "Social Media Manager",
  "Business Analyst",
  "Project Manager",
  "Mobile Developer",
  "DevOps Engineer",
  "QA Engineer",
  "Software Engineer",
  "Web Developer",
  "Graphic Designer",
  "App Developer",
  "Cybersecurity Analyst",
  "Cloud Engineer",
  "Machine Learning Engineer",
  "AI Engineer",
  "IT Support Specialist",
  "Network Administrator",
  "Database Administrator",
  "Systems Analyst",
  "Blockchain Developer",
  "Game Developer",
  "Software Architect",

  // --- Business & Management ---
  "Operations Manager",
  "Human Resource Manager",
  "Sales Manager",
  "Business Development Executive",
  "Customer Service Representative",
  "Entrepreneur",
  "Procurement Officer",
  "Account Manager",
  "Administrative Assistant",
  "Quality Assurance Manager",
  "Supply Chain Manager",
  "Logistics Coordinator",

  // --- Finance & Accounting ---
  "Accountant",
  "Financial Analyst",
  "Auditor",
  "Tax Consultant",
  "Investment Banker",
  "Loan Officer",
  "Economist",
  "Bookkeeper",
  "Risk Manager",
  "Insurance Underwriter",

  // --- Health & Medical ---
  "Nurse",
  "Medical Doctor",
  "Pharmacist",
  "Medical Laboratory Scientist",
  "Physiotherapist",
  "Radiographer",
  "Dentist",
  "Public Health Officer",
  "Nutritionist",
  "Psychologist",
  "Health Records Officer",
  "Optometrist",

  // --- Engineering ---
  "Civil Engineer",
  "Mechanical Engineer",
  "Electrical Engineer",
  "Chemical Engineer",
  "Petroleum Engineer",
  "Aerospace Engineer",
  "Biomedical Engineer",
  "Environmental Engineer",
  "Structural Engineer",
  "Industrial Engineer",
  "Automotive Engineer",

  // --- Sciences & Research ---
  "Biologist",
  "Chemist",
  "Physicist",
  "Research Assistant",
  "Laboratory Technician",
  "Geographer",
  "Geologist",
  "Meteorologist",
  "Ecologist",
  "Agricultural Scientist",

  // --- Arts, Media & Creative ---
  "Photographer",
  "Video Editor",
  "Animator",
  "Music Producer",
  "Actor",
  "Fashion Designer",
  "Interior Designer",
  "Author",
  "Journalist",
  "TV Presenter",
  "Creative Director",

  // --- Law & Politics ---
  "Lawyer",
  "Legal Advisor",
  "Paralegal",
  "Judge",
  "Policy Analyst",
  "Political Scientist",
  "Legislative Aide",

  // --- Education ---
  "Teacher",
  "Lecturer",
  "Researcher",
  "Tutor",
  "Curriculum Developer",
  "Academic Advisor",
  "Librarian",

  // --- Construction & Skilled Trades ---
  "Architect",
  "Builder",
  "Plumber",
  "Electrician",
  "Welder",
  "Surveyor",
  "Construction Manager",

  // --- Hospitality & Tourism ---
  "Chef",
  "Hotel Manager",
  "Waiter",
  "Travel Consultant",
  "Event Planner",
  "Tour Guide",

  // --- Agriculture ---
  "Farmer",
  "Agronomist",
  "Food Technologist",
  "Fisheries Officer",
  "Livestock Manager",

  // --- Other Important Roles ---
  "Customer Success Manager",
  "Community Manager",
  "Technical Writer",
  "Virtual Assistant",
  "Real Estate Agent",
  "Security Officer",
  "Driver",
  "Logistics Driver",
  "Store Keeper"
];


        const allRoles = [...new Set([...roles, ...commonRoles])].sort();
        setAvailableRoles(allRoles);
        setFilteredRoles(allRoles);
      }
    } catch (err) {
      console.error("Error fetching roles:", err);
    }
  };

  const handleRoleToggle = (role) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleRemoveRole = (role) => {
    setSelectedRoles((prev) => prev.filter((r) => r !== role));
  };

  const handleSearch = async () => {
    if (selectedRoles.length === 0 && !searchQuery.trim()) {
      setError("Please select at least one role or enter a keyword to search");
      return;
    }

    try {
      setSearching(true);
      setError(null);
      setHasSearched(true);
      setDisplayCount(7);

      // Build search query from selected roles
      const roleQuery =
        selectedRoles.length > 0 ? selectedRoles.join(" ") : searchQuery.trim();

      const searchParams = {
        query: roleQuery,
        location: location.trim(),
        workType: jobType,
        duration: duration,
        compensation: compensation,
      };

      console.log("Searching with params:", searchParams);

      const {
        data,
        error,
        searchType: resultType,
        searchedTerm: term,
      } = await studentService.searchInternships(searchParams);

      if (error) {
        setError(error);
        setAllInternships([]);
        setInternships([]);
        setSearchType("none");
      } else {
        const results = data || [];
        setAllInternships(results);
        setInternships(results.slice(0, 7));
        setSearchType(resultType);
        setSearchedTerm(term || roleQuery);
      }
    } catch (err) {
      setError(err.message);
      setAllInternships([]);
      setInternships([]);
      setSearchType("none");
    } finally {
      setSearching(false);
      setShowRoleDropdown(false);
    }
  };

  const handleLoadMore = () => {
    const currentCount = displayCount;
    const newCount = currentCount + 3;
    setDisplayCount(newCount);
    setInternships(allInternships.slice(0, newCount));
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedRoles([]);
    setLocation("");
    setJobType("");
    setDuration("");
    setCompensation("");
    setInternships([]);
    setAllInternships([]);
    setError(null);
    setHasSearched(false);
    setDisplayCount(7);
    setSearchType(null);
    setSearchedTerm("");
  };

  const handleViewDetails = (internshipId) => {
    navigate(`/internship-details/${internshipId}`);
  };

  const isDeadlinePassed = (deadlineString) => {
    if (!deadlineString) return false;
    const deadline = new Date(deadlineString);
    const today = new Date();
    deadline.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return deadline < today;
  };

  const handleApply = (internshipId) => {
    navigate(`/apply/${internshipId}`);
  };

  const formatInternshipData = (internship) => {
    return {
      id: internship.id,
      logo: getCompanyLogo(internship.organizations?.logo_url),
      jobTitle: internship.position_title,
      company: internship.organizations?.organization_name || "Unknown Company",
      location: internship.location,
      duration: `${internship.min_duration}-${internship.max_duration} months`,
      timePosted: new Date(internship.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      tags: [
        internship.compensation?.charAt(0).toUpperCase() +
          internship.compensation?.slice(1) || "Unpaid",
        internship.work_type?.charAt(0).toUpperCase() +
          internship.work_type?.slice(1) || "Onsite",
      ].filter(Boolean),
    };
  };

  const hasMoreResults = allInternships.length > displayCount;

  return (
    <>
      <Navbar />
      <div className="search-page-new">
        {/* Header */}
        <div className="page-header-new">
          <div className="container-new">
            <h1 className="page-title-new">
              <center>Find Your Dream Internship</center>
            </h1>
            <p className="page-subtitle-new">
              <center>
                Search and discover amazing opportunities across Nigeria
              </center>
            </p>
          </div>
        </div>

        {/* Search Section */}
        <div className="search-section-new">
          <div className="container-new">
            <div className="search-card-new">
              {/* Role Filter with Dropdown */}
              <div className="filter-group-new role-filter-group-new">
                <label className="filter-label-new">Role</label>
                <div className="role-filter-container-new">
                  <div className="role-input-wrapper-new">
                    <input
                      type="text"
                      placeholder="Search or select roles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setShowRoleDropdown(true)}
                      className="filter-input-new"
                    />
                    <button
                      className="dropdown-toggle-new"
                      onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                    >
                      ▼
                    </button>
                  </div>

                  {/* Selected Roles Pills */}
                  {selectedRoles.length > 0 && (
                    <div className="selected-roles-new">
                      {selectedRoles.map((role) => (
                        <span key={role} className="role-pill-new">
                          {role}
                          <button
                            onClick={() => handleRemoveRole(role)}
                            className="remove-role-new"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Dropdown */}
                  {showRoleDropdown && (
                    <div className="role-dropdown-new">
                      <div className="dropdown-header-new">
                        <span>Select roles</span>
                        <button
                          onClick={() => setShowRoleDropdown(false)}
                          className="close-dropdown-new"
                        >
                          ×
                        </button>
                      </div>
                      <div className="role-list-new">
                        {filteredRoles.map((role) => (
                          <label key={role} className="role-option-new">
                            <input
                              type="checkbox"
                              checked={selectedRoles.includes(role)}
                              onChange={() => handleRoleToggle(role)}
                            />
                            <span>{role}</span>
                          </label>
                        ))}
                        {filteredRoles.length === 0 && (
                          <div className="no-roles-new">No roles found</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Other Filters */}
              <div className="filters-row-new">
                <div className="filter-group-new">
                  <label className="filter-label-new">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Lagos, Abuja"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="filter-input-new"
                  />
                </div>

                <div className="filter-group-new">
                  <label className="filter-label-new">Work Type</label>
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    className="filter-select-new"
                  >
                    <option value="">All Types</option>
                    <option value="remote">Remote</option>
                    <option value="onsite">Onsite</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                <div className="filter-group-new">
                  <label className="filter-label-new">Duration</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="filter-select-new"
                  >
                    <option value="">All Durations</option>
                    <option value="2 months">2 Months</option>
                    <option value="3 months">3 Months</option>
                    <option value="4 months">4 Months</option>
                    <option value="5 months">5 Months</option>
                    <option value="6 months">6+ Months</option>
                  </select>
                </div>

                <div className="filter-group-new">
                  <label className="filter-label-new">Compensation</label>
                  <select
                    value={compensation}
                    onChange={(e) => setCompensation(e.target.value)}
                    className="filter-select-new"
                  >
                    <option value="">All</option>
                    <option value="paid">Paid</option>
                    <option value="unpaid">Unpaid</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="action-buttons-new">
                <Button
                  label={searching ? "Searching..." : "Search Internships"}
                  onClick={handleSearch}
                  disabled={searching}
                />
                <Button
                  label="Clear All Filters"
                  onClick={clearFilters}
                  variant="secondary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="results-section-new">
          <div className="container-new">
            {hasSearched && (
              <div className="results-header-new">
                <h2 className="results-title-new">
                  {allInternships.length} Internship
                  {allInternships.length !== 1 ? "s" : ""} Found
                </h2>
                <p className="results-subtitle-new">
                  Showing relevant opportunities based on your search
                </p>
              </div>
            )}

            {error && (
              <div className="error-message-new">
                <p>Error: {error}</p>
                <button
                  className="retry-btn-new"
                  onClick={() => {
                    setError(null);
                    handleSearch();
                  }}
                >
                  Retry
                </button>
              </div>
            )}

            {/* Fuzzy Search Notice */}
            {searchType === "fuzzy" && internships.length > 0 && (
              <div className="fuzzy-search-notice-new">
                <div className="notice-icon-new">
                  <Info size={24} />
                </div>
                <div className="notice-content-new">
                  <p className="notice-title-new">
                    <X
                      size={18}
                      style={{
                        display: "inline-block",
                        marginRight: "8px",
                        verticalAlign: "middle",
                      }}
                    />
                    No exact matches found for "<strong>{searchedTerm}</strong>"
                  </p>
                  <p className="notice-subtitle-new">
                    <Check
                      size={18}
                      style={{
                        display: "inline-block",
                        marginRight: "8px",
                        verticalAlign: "middle",
                      }}
                    />
                    Here are some related internship opportunities you might be
                    interested in:
                  </p>
                </div>
              </div>
            )}

            {/* Job Listings */}
            <div className="jobs-grid-new">
              {searching ? (
                <div className="loading-state-new">
                  <div className="spinner-new"></div>
                  <p>Searching internships...</p>
                </div>
              ) : internships.length > 0 ? (
                internships.map((internship) => {
                  const formattedData = formatInternshipData(internship);
                  return (
                    <div key={internship.id} className="job-card-new">
                      <div className="job-card-header-new">
                        <img
                          src={formattedData.logo}
                          alt={formattedData.company}
                          className="company-logo-new"
                        />
                        <div className="job-info-new">
                          <h3 className="job-title-new">
                            {formattedData.jobTitle}
                          </h3>
                          <p className="company-name-new">
                            {formattedData.company}
                          </p>
                        </div>
                      </div>

                      <div className="job-details-new">
                        <div className="detail-item-new">
                          <MapPin size={18} />
                          <span>{formattedData.location}</span>
                        </div>
                        <div className="detail-item-new">
                          <Calendar size={18} />
                          <span>{formattedData.duration}</span>
                        </div>
                        <div className="detail-item-new">
                          <Clock size={18} />
                          <span>{formattedData.timePosted}</span>
                        </div>
                      </div>

                      <div className="job-tags-new">
                        {formattedData.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className={`tag-new tag-${tag.toLowerCase()}-new`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="job-actions-new">
                        <Button
                          label={
                            isDeadlinePassed(internship.application_deadline)
                              ? "Application Closed"
                              : "Apply Now"
                          }
                          onClick={() => {
                            if (
                              !isDeadlinePassed(internship.application_deadline)
                            ) {
                              handleApply(internship.id);
                            }
                          }}
                          disabled={isDeadlinePassed(
                            internship.application_deadline
                          )}
                        />
                        <Button
                          label="View Details"
                          onClick={() => handleViewDetails(internship.id)}
                          variant="secondary"
                        />
                      </div>
                    </div>
                  );
                })
              ) : hasSearched && !searching ? (
                <div className="no-results-state-new">
                  <div className="search-icon-new">🔍</div>
                  <h3>No Internships Found</h3>
                  <p>We couldn't find any internships matching your criteria</p>
                  <p>
                    <strong>Try:</strong>
                  </p>
                  <ul>
                    <li>Selecting different roles</li>
                    <li>Removing some filters</li>
                    <li>Using broader search terms</li>
                  </ul>
                </div>
              ) : (
                <div className="initial-state-new">
                  <div className="search-icon-new">🔍</div>
                  <h3>Find Your Perfect Internship</h3>
                  <p>
                    Select roles and apply filters above to discover internship
                    opportunities
                  </p>
                  <p>
                    <strong>Popular roles:</strong> Frontend Developer, Backend
                    Developer, UI/UX Designer, Data Analyst
                  </p>
                </div>
              )}
            </div>

            {/* Load More Button */}
            {hasMoreResults && internships.length > 0 && (
              <div className="load-more-container-new">
                <Button
                  label={`Load ${Math.min(
                    3,
                    allInternships.length - displayCount
                  )} More Internships`}
                  variant="secondary"
                  onClick={handleLoadMore}
                />
                <p className="load-more-info-new">
                  Showing {internships.length} of {allInternships.length}{" "}
                  internships
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default InternshipSearchPage;
