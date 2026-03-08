import React, { useState, useEffect } from "react";
import { Users, Building2, Briefcase, FileText } from "lucide-react";
import { supabase } from "../../lib/supabase";
import StatCard from "../components/ui/StatCard";
import TableSkeleton from "../components/ui/TableSkeleton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function DashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    orgs: 0,
    internships: 0,
    applications: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);

  // Mock chart data for demonstration, normally derived from real timestamps
  const activityData = [
    { name: "Mon", apps: 4 },
    { name: "Tue", apps: 3 },
    { name: "Wed", apps: 7 },
    { name: "Thu", apps: 2 },
    { name: "Fri", apps: 6 },
    { name: "Sat", apps: 1 },
    { name: "Sun", apps: 8 },
  ];

  const growthData = [
    { name: "Week 1", users: 10 },
    { name: "Week 2", users: 25 },
    { name: "Week 3", users: 45 },
    { name: "Week 4", users: 50 },
  ];

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    setLoading(true);
    try {
      // Fetch pure counts for performance
      const [
        { count: usersCount },
        { count: orgsCount },
        { count: intCount },
        { count: appCount },
        { data: activityData },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("organizations").select("*", { count: "exact", head: true }),
        supabase.from("internships").select("*", { count: "exact", head: true }),
        supabase.from("internship_applications").select("*", { count: "exact", head: true }),
        supabase
          .from("admin_activity_logs")
          .select("id, action, target_type, created_at, admins(profiles(display_name))")
          .order("created_at", { ascending: false })
          .limit(6),
      ]);

      setStats({
        users: usersCount || 0,
        orgs: orgsCount || 0,
        internships: intCount || 0,
        applications: appCount || 0,
      });

      const formattedActivity = (activityData || []).map((log) => ({
        id: log.id,
        action: log.action,
        target: log.target_type,
        admin: log.admins?.profiles?.display_name || "Admin",
        time: new Date(log.created_at).toLocaleString([], {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));
      setRecentActivity(formattedActivity);
    } catch (error) {
      console.error("Error fetching overview:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <TableSkeleton rows={4} columns={3} />;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Dashboard Overview</h1>
        <p style={styles.subtitle}>Welcome back! Here's what's happening on Intern Connect today.</p>
      </div>

      {/* Metric Cards */}
      <div style={styles.grid4}>
        <StatCard
          title="Total Students"
          value={stats.users}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Total Organizations"
          value={stats.orgs}
          icon={Building2}
          trend={{ value: 4, isPositive: true }}
        />
        <StatCard
          title="Active Internships"
          value={stats.internships}
          icon={Briefcase}
        />
        <StatCard
          title="Total Applications"
          value={stats.applications}
          icon={FileText}
          trend={{ value: 2, isPositive: false }}
        />
      </div>

      {/* Charts & Activity */}
      <div style={styles.mainGrid}>
        <div style={styles.leftCol}>
          {/* Chart 1 */}
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Application Activity (Last 7 Days)</h3>
            <div style={{ width: "100%", height: "250px" }}>
              <ResponsiveContainer>
                <BarChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                  <Tooltip
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
                  />
                  <Bar dataKey="apps" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2 */}
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>User Growth (This Month)</h3>
            <div style={{ width: "100%", height: "250px" }}>
              <ResponsiveContainer>
                <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                  <Tooltip
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
                  />
                  <Area type="monotone" dataKey="users" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div style={styles.rightCol}>
          {/* Recent Activity Panel */}
          <div style={styles.activityCard}>
            <h3 style={styles.chartTitle}>Recent Admin Activity</h3>
            
            {recentActivity.length === 0 ? (
              <p style={{ color: "#64748b", fontSize: "14px", marginTop: "16px" }}>No activity logs yet.</p>
            ) : (
              <div style={styles.feedContainer}>
                {recentActivity.map((log, index) => (
                  <div key={log.id} style={styles.feedItem}>
                    <div style={styles.feedDot}></div>
                    {index !== recentActivity.length - 1 && <div style={styles.feedLine}></div>}
                    
                    <div style={styles.feedContent}>
                      <p style={styles.feedText}>
                        <span style={styles.feedAdmin}>{log.admin}</span>{" "}
                        {log.action.replace(/_/g, " ")}{" "}
                        <span style={styles.feedTarget}>{log.target}</span>
                      </p>
                      <span style={styles.feedTime}>{log.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "8px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0 0 8px 0",
    fontFamily: "'Inter', sans-serif",
  },
  subtitle: {
    fontSize: "15px",
    color: "#64748b",
    margin: 0,
    fontFamily: "'Inter', sans-serif",
  },
  grid4: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "24px",
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "24px",
  },
  leftCol: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  rightCol: {
    display: "flex",
    flexDirection: "column",
  },
  chartCard: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #e2e8f0",
  },
  activityCard: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #e2e8f0",
    flex: 1,
  },
  chartTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#0f172a",
    margin: "0 0 24px 0",
    fontFamily: "'Inter', sans-serif",
  },
  feedContainer: {
    display: "flex",
    flexDirection: "column",
    paddingTop: "8px",
    position: "relative",
  },
  feedItem: {
    display: "flex",
    gap: "16px",
    position: "relative",
    paddingBottom: "24px",
  },
  feedDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    backgroundColor: "#cbd5e1",
    border: "2px solid #ffffff",
    boxShadow: "0 0 0 2px #f8fafc",
    zIndex: 2,
    marginTop: "4px",
  },
  feedLine: {
    position: "absolute",
    top: "16px",
    bottom: 0,
    left: "5px",
    width: "2px",
    backgroundColor: "#e2e8f0",
    zIndex: 1,
  },
  feedContent: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  feedText: {
    margin: 0,
    fontSize: "14px",
    color: "#334155",
    lineHeight: "1.4",
  },
  feedAdmin: {
    fontWeight: "600",
    color: "#0f172a",
  },
  feedTarget: {
    fontWeight: "500",
    color: "#3b82f6",
  },
  feedTime: {
    fontSize: "12px",
    color: "#94a3b8",
  },
};
