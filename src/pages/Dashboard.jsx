import React, { useState, useEffect } from "react";
import Navbar from "../components/navbar.jsx";
import Footer from "../components/footer.jsx";
import PageTransition from "../components/PageTransition";
import Loader from "../components/Loader.jsx";
import "../style/dashboard.css";
import DashboardHeader from "../components/DashboardHeader.jsx";
import StatsCard from "../components/StatsCard.jsx";
import JobCard from "../components/JobCard.jsx";
import EventItem from "../components/EventItem.jsx";
import QuickAction from "../components/QuickAction.jsx";
import SentApplicationModal from "../components/sent-application.jsx";
import AcceptedInternshipsModal from "../components/AcceptedInternship.jsx";
import interview from "../assets/interview.png";
import cv from "../assets/cv.png";
import offer from "../assets/offer.png";
import bulb from "../assets/bulb.png";
import apply from "../assets/apply.png";
import studentDashboardService from "../lib/studentDashboardService.js";

const Dashboard = () => {
  const [isApplicationsModalOpen, setIsApplicationsModalOpen] = useState(false);
  const [isOffersModalOpen, setIsOffersModalOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalApplications: 0,
      pendingApplications: 0,
      acceptedApplications: 0,
      rejectedApplications: 0,
      offers: 0,
    },
    applications: [],
    recommendedJobs: [],
    upcomingEvents: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load all dashboard data in parallel
      const [statsResult, applicationsResult, recommendedResult, eventsResult] =
        await Promise.all([
          studentDashboardService.getDashboardStats(),
          studentDashboardService.getStudentApplications(),
          studentDashboardService.getRecommendedInternships(3), // Limit to exactly 3
          studentDashboardService.getUpcomingEvents(),
        ]);

      console.log("Dashboard data loaded:", {
        stats: statsResult.data,
        applications: applicationsResult.data,
        recommended: recommendedResult.data,
        events: eventsResult.data,
      });

      setDashboardData({
        stats: statsResult.data,
        applications: applicationsResult.data || [],
        recommendedJobs: recommendedResult.data || [],
        upcomingEvents: eventsResult.data || [],
      });

      if (
        statsResult.error ||
        applicationsResult.error ||
        recommendedResult.error ||
        eventsResult.error
      ) {
        setError("Some data could not be loaded");
      }
    } catch (err) {
      console.error("Dashboard loading error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationsClick = () => {
    setIsApplicationsModalOpen(true);
  };

  const handleOffersClick = () => {
    setIsOffersModalOpen(true);
  };

  const handleCloseApplicationsModal = () => {
    setIsApplicationsModalOpen(false);
  };

  const handleCloseOffersModal = () => {
    setIsOffersModalOpen(false);
  };

  const getStatsData = () => [
    {
      title: "Applications Sent",
      value: dashboardData.stats.totalApplications.toString(),
      subtitle: `${dashboardData.stats.pendingApplications} pending review`,
      icon: <img src={apply} alt="apply Icon" />,
      onClick: handleApplicationsClick,
    },
    {
      title: "Offers",
      value: dashboardData.stats.offers.toString(),
      subtitle:
        dashboardData.stats.offers > 0
          ? `Congrats on your ${dashboardData.stats.offers} offer${
              dashboardData.stats.offers > 1 ? "s" : ""
            }!`
          : "Keep applying for more opportunities",
      icon: <img src={offer} alt="Offer Icon" />,
      onClick: dashboardData.stats.offers > 0 ? handleOffersClick : undefined,
    },
    {
      title: "Applications Rejected",
      value: dashboardData.stats.rejectedApplications.toString(),
      subtitle: "Don't give up, keep trying!",
      icon: <img src={interview} alt="Interview Icon" />,
    },
  ];

  const formatRecommendedJobs = () => {
    return dashboardData.recommendedJobs.slice(0, 3).map((job) => ({
      id: job.id,
      title: job.position_title,
      company: job.organizations?.organization_name || "Unknown Company",
      logo:
        job.organizations?.logo_url ||
        "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=50&h=50&fit=crop",
      department: job.department,
      location: job.location,
      workType: job.work_type,
    }));
  };

  const quickActions = [
    {
      icon: <img src={cv} alt="CV Icon" />,
      title: "Update Your CV",
      description: "Keep your CV updated with our CV builder",
    },
    {
      icon: <img src={bulb} alt="Bulb Icon" />,
      title: "Practice for Interviews",
      description: "Ace your next interview with our Interview Prep AI",
    },
  ];

  if (loading) {
    return (
      <PageTransition>
        <Navbar />
        <Loader message="Loading your dashboard..." />
        <Footer />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <Navbar />
      <div className="dashboard-main">
        <DashboardHeader />

        {error && (
          <div
            style={{
              background: "var(--error-bg)",
              color: "var(--error)",
              padding: "1rem",
              borderRadius: "8px",
              margin: "1rem 0",
              border: "1px solid var(--error)",
            }}
          >
            {error}
          </div>
        )}

        <div className="dashboard-stats">
          {getStatsData().map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        <div className="dashboard-content-grid">
          <div className="dashboard-section">
            <h2>Recommended For You</h2>
            <p className="dashboard-section-subtitle">
              Based on your profile and course of study.
            </p>
            <div className="dashboard-job-list">
              {formatRecommendedJobs().length > 0 ? (
                formatRecommendedJobs().map((job, index) => (
                  <JobCard
                    key={index}
                    {...job}
                    onClick={() =>
                      (window.location.href = `/internship-details/${job.id}`)
                    }
                  />
                ))
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "2rem",
                    color: "var(--text-secondary)",
                    background: "var(--bg-secondary)",
                    borderRadius: "8px",
                    border: "1px solid var(--card-border)",
                  }}
                >
                  <p>No new recommendations available.</p>
                  <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
                    You've applied to all relevant internships! Check back later
                    for new opportunities.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="dashboard-right-column">
            <div className="dashboard-section">
              <h2>Upcoming Events</h2>
              <div className="dashboard-events-list">
                {dashboardData.upcomingEvents.length > 0 ? (
                  dashboardData.upcomingEvents.map((event, index) => (
                    <EventItem key={index} {...event} />
                  ))
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "1.5rem",
                      color: "var(--text-secondary)",
                      fontSize: "0.875rem",
                    }}
                  >
                    No upcoming events
                  </div>
                )}
              </div>
            </div>

            <div className="dashboard-section">
              <h2>Quick Actions</h2>
              <div className="dashboard-actions-grid">
                {quickActions.map((action, index) => (
                  <QuickAction key={index} {...action} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Applications Modal */}
      <SentApplicationModal
        isOpen={isApplicationsModalOpen}
        onClose={handleCloseApplicationsModal}
        applications={dashboardData.applications}
      />

      {/* Accepted Internships Modal */}
      <AcceptedInternshipsModal
        isOpen={isOffersModalOpen}
        onClose={handleCloseOffersModal}
        applications={dashboardData.applications}
      />

      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </PageTransition>
  );
};

export default Dashboard;
