"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  Users,
  Eye,
  EyeOff,
  Flame,
  Globe,
  Clock,
  Sparkles,
  Search,
  Download,
  Trash2,
  ExternalLink,
  RefreshCw,
  LogOut,
  Mail,
  Phone,
  Briefcase,
  Layers,
  Check,
  Copy,
  AlertCircle,
  Loader2,
  Share2,
  Calendar,
  Activity,
  ArrowUpRight,
} from "lucide-react";

export default function SuperAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Dashboard data state
  const [stats, setStats] = useState(null);
  const [activeSessions, setActiveSessions] = useState([]);
  const [leads, setLeads] = useState([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [loadingData, setLoadingData] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("leads"); // "leads" | "sessions"
  const [adminEmail, setAdminEmail] = useState("");
  const [copiedLink, setCopiedLink] = useState(null);
  const [deletingLeadId, setDeletingLeadId] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  // 1. Check current session on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/admin/me");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setIsAuthenticated(true);
            setAdminEmail(data.email || "kk761734@gmail.com");
          }
        }
      } catch (e) {
        // Not authenticated
      } finally {
        setAuthChecking(false);
      }
    }
    checkSession();
  }, []);

  // 2. Fetch admin data
  const fetchAdminData = useCallback(async (search = "") => {
    setLoadingData(true);
    try {
      const [statsRes, leadsRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch(`/api/admin/leads?search=${encodeURIComponent(search)}`),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
        setActiveSessions(statsData.activeSessions || []);
      }

      if (leadsRes.ok) {
        const leadsData = await leadsRes.json();
        setLeads(leadsData.leads || []);
        setTotalLeads(leadsData.total || 0);
      }

      setLastRefreshed(new Date());
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminData(searchQuery);
      // Auto-refresh metrics every 15 seconds
      const interval = setInterval(() => {
        fetchAdminData(searchQuery);
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchAdminData, searchQuery]);

  // 3. Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      setIsAuthenticated(true);
      setAdminEmail(data.email);
      setLoginPassword("");
    } catch (err) {
      setLoginError(err.message || "Invalid credentials");
    } finally {
      setLoginLoading(false);
    }
  };

  // 4. Logout handler
  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch (e) {
      // ignore
    }
    setIsAuthenticated(false);
    setStats(null);
    setLeads([]);
  };

  // 5. Delete lead handler
  const handleDeleteLead = async (id) => {
    if (!window.confirm("Are you sure you want to delete this submission?")) return;
    setDeletingLeadId(id);
    try {
      const res = await fetch(`/api/admin/leads?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setLeads((prev) => prev.filter((l) => (l.id || l._id) !== id));
        setTotalLeads((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Delete lead error:", err);
    } finally {
      setDeletingLeadId(null);
    }
  };

  // 6. Export leads to CSV
  const exportToCSV = () => {
    if (!leads || leads.length === 0) {
      alert("No leads to export.");
      return;
    }

    const headers = [
      "ID",
      "Date",
      "Full Name",
      "Email Address",
      "Phone",
      "Purpose/Company",
      "Project Title",
      "Project ID",
      "Share Preview Link",
      "IP Address",
    ];

    const rows = leads.map((l) => [
      l.id || l._id || "",
      new Date(l.createdAt).toLocaleString(),
      `"${(l.name || "").replace(/"/g, '""')}"`,
      `"${(l.email || "").replace(/"/g, '""')}"`,
      `"${(l.phone || "").replace(/"/g, '""')}"`,
      `"${(l.purpose || "").replace(/"/g, '""')}"`,
      `"${(l.projectTitle || "").replace(/"/g, '""')}"`,
      l.projectId || "",
      l.shareUrl ? `${window.location.origin}${l.shareUrl}` : "",
      l.ip || "",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `forma_share_leads_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyShareLink = async (url) => {
    try {
      const full = url.startsWith("http") ? url : `${window.location.origin}${url}`;
      await navigator.clipboard.writeText(full);
      setCopiedLink(url);
      setTimeout(() => setCopiedLink(null), 2000);
    } catch (e) {
      // ignore
    }
  };

  // Render Loading Initial Auth
  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#FAF7F0] text-[#171717] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 font-mono text-xs text-[#737373]">
          <Loader2 className="w-6 h-6 animate-spin text-[#FF5A1F]" />
          <span>Verifying administrator credentials...</span>
        </div>
      </div>
    );
  }

  // Render Login Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF7F0] text-[#171717] flex flex-col justify-center items-center p-4 forma-light-grid relative">
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#E9E3DA] p-8 shadow-xl relative overflow-hidden">
          {/* Subtle Warm Glow */}
          <div className="absolute top-0 right-1/2 translate-x-1/2 w-64 h-64 bg-[#FF5A1F]/10 rounded-full blur-[70px] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#FF5A1F]/10 border border-[#FF5A1F]/20 flex items-center justify-center text-[#FF5A1F] mb-4">
              <Lock className="w-7 h-7" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F0] border border-[#E9E3DA] text-[11px] font-mono text-[#737373] mb-2 font-medium">
              <ShieldAlert className="w-3.5 h-3.5 text-[#FF5A1F]" />
              <span>SUPER ADMIN PORTAL</span>
            </div>

            <h1 className="text-2xl font-bold font-display text-[#171717]">
              Forma Control Center
            </h1>
            <p className="text-xs text-[#737373] mt-1 max-w-xs leading-relaxed">
              Authenticate with your administrative credentials to view live telemetry and lead submissions.
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-mono text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 relative z-10">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-[#171717] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#FF5A1F]" />
                <span>Admin Email</span>
              </label>
              <input
                type="email"
                required
                placeholder="admin@gmail.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-[#E9E3DA] rounded-xl text-sm text-[#171717] focus:outline-none focus:border-[#FF5A1F] focus:bg-white transition-all font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-[#171717] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#FF5A1F]" />
                  <span>Admin Password</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-[#737373] hover:text-[#171717] cursor-pointer"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-[#E9E3DA] rounded-xl text-sm text-[#171717] focus:outline-none focus:border-[#FF5A1F] focus:bg-white transition-all font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 px-4 rounded-xl bg-[#171717] hover:bg-[#FF5A1F] text-white text-xs font-mono font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2 shadow-sm"
            >
              {loginLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Access Super-Admin Panel</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#E9E3DA] text-center">
            <a
              href="/"
              className="text-xs font-mono text-[#737373] hover:text-[#171717] transition-colors"
            >
              ← Back to Forma Studio
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Render Super Admin Dashboard
  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#171717] flex flex-col font-sans forma-light-grid">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#FAF7F0]/90 backdrop-blur-md border-b border-[#E9E3DA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/forma-logo.png"
                alt="Forma Studio"
                className="h-7 w-auto object-contain"
              />
            </a>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 text-[#FF5A1F] font-bold tracking-wider uppercase">
                Super Admin
              </span>
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>LIVE SYSTEM</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs font-mono text-[#737373] bg-white border border-[#E9E3DA] px-3 py-1.5 rounded-xl">
              <Mail className="w-3.5 h-3.5 text-[#FF5A1F]" />
              <span className="text-[#171717] font-semibold">{adminEmail}</span>
            </div>

            <button
              onClick={() => fetchAdminData(searchQuery)}
              disabled={loadingData}
              title="Refresh telemetry and leads"
              className="p-2 rounded-xl bg-white border border-[#E9E3DA] hover:border-[#FF5A1F] hover:text-[#FF5A1F] text-[#737373] transition-all cursor-pointer shadow-2xs"
            >
              <RefreshCw
                className={`w-4 h-4 ${loadingData ? "animate-spin text-[#FF5A1F]" : ""}`}
              />
            </button>

            <a
              href="/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E9E3DA] hover:border-[#171717] text-[#171717] text-xs font-mono transition-colors font-medium shadow-2xs"
            >
              <span>User Dashboard</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white text-xs font-mono transition-all font-medium cursor-pointer shadow-2xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner / Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#171717]">
              Platform Intelligence & Submissions
            </h1>
            <p className="text-xs sm:text-sm text-[#737373] mt-1 font-mono">
              Live telemetry, real-time presence, and share form lead submissions.
              {lastRefreshed && (
                <span className="ml-2 text-[#A3A3A3]">
                  • Updated {lastRefreshed.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportToCSV}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#171717] hover:bg-[#FF5A1F] text-white text-xs font-mono font-medium transition-all shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Leads CSV</span>
            </button>
          </div>
        </div>

        {/* 1. Real-Time Telemetry KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* KPI 1: Live People Online */}
          <div className="bg-white rounded-2xl border border-[#E9E3DA] p-5 shadow-2xs relative overflow-hidden">
            <div className="flex items-center justify-between text-xs font-mono text-[#737373] mb-3">
              <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>ONLINE NOW</span>
              </span>
              <Activity className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-bold font-display text-[#171717]">
              {stats ? (stats.onlineNow ?? 0) : <Loader2 className="w-6 h-6 animate-spin text-[#A3A3A3]" />}
            </div>
            <div className="text-[11px] font-mono text-[#737373] mt-2">
              Live active creators on website
            </div>
          </div>

          {/* KPI 2: Total Builds */}
          <div className="bg-white rounded-2xl border border-[#E9E3DA] p-5 shadow-2xs relative overflow-hidden">
            <div className="flex items-center justify-between text-xs font-mono text-[#737373] mb-3">
              <span className="font-semibold text-[#171717]">TOTAL BUILDS</span>
              <Flame className="w-4 h-4 text-[#FF5A1F]" />
            </div>
            <div className="text-3xl font-bold font-display text-[#171717]">
              {stats ? (stats.totalBuilds ?? 0) : <Loader2 className="w-6 h-6 animate-spin text-[#A3A3A3]" />}
            </div>
            <div className="text-[11px] font-mono text-[#737373] mt-2 flex items-center justify-between">
              <span>Landing pages synthesized</span>
              {stats?.createdToday !== undefined && (
                <span className="text-[#FF5A1F] font-semibold">+{stats.createdToday} today</span>
              )}
            </div>
          </div>

          {/* KPI 3: Total Page Visits */}
          <div className="bg-white rounded-2xl border border-[#E9E3DA] p-5 shadow-2xs relative overflow-hidden">
            <div className="flex items-center justify-between text-xs font-mono text-[#737373] mb-3">
              <span className="font-semibold text-[#171717]">TOTAL VISITS</span>
              <Globe className="w-4 h-4 text-[#FF5A1F]" />
            </div>
            <div className="text-3xl font-bold font-display text-[#171717]">
              {stats ? (stats.totalVisits ?? 0).toLocaleString() : <Loader2 className="w-6 h-6 animate-spin text-[#A3A3A3]" />}
            </div>
            <div className="text-[11px] font-mono text-[#737373] mt-2">
              Verified website visitor sessions
            </div>
          </div>

          {/* KPI 4: Total Share Form Submissions / Leads */}
          <div className="bg-white rounded-2xl border border-[#E9E3DA] p-5 shadow-2xs relative overflow-hidden">
            <div className="flex items-center justify-between text-xs font-mono text-[#737373] mb-3">
              <span className="font-semibold text-[#171717]">SHARE LEADS</span>
              <Share2 className="w-4 h-4 text-[#FF5A1F]" />
            </div>
            <div className="text-3xl font-bold font-display text-[#171717]">
              {stats ? (stats.totalLeads ?? 0) : <Loader2 className="w-6 h-6 animate-spin text-[#A3A3A3]" />}
            </div>
            <div className="text-[11px] font-mono text-[#737373] mt-2 flex items-center justify-between">
              <span>Users generated share links</span>
              {stats?.leadsToday !== undefined && (
                <span className="text-emerald-600 font-semibold">+{stats.leadsToday} today</span>
              )}
            </div>
          </div>

          {/* KPI 5: Today's AI Builds */}
          <div className="bg-white rounded-2xl border border-[#E9E3DA] p-5 shadow-2xs relative overflow-hidden">
            <div className="flex items-center justify-between text-xs font-mono text-[#737373] mb-3">
              <span className="font-semibold text-[#171717]">TODAY&apos;S BUILDS</span>
              <Sparkles className="w-4 h-4 text-[#FF5A1F]" />
            </div>
            <div className="text-3xl font-bold font-display text-[#FF5A1F]">
              {stats ? (stats.createdToday ?? 0) : <Loader2 className="w-6 h-6 animate-spin text-[#A3A3A3]" />}
            </div>
            <div className="text-[11px] font-mono text-[#737373] mt-2">
              Generated in the last 24h
            </div>
          </div>
        </div>

        {/* 2. Tabs Selector & Search Filter */}
        <div className="bg-white rounded-3xl border border-[#E9E3DA] shadow-xs overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-[#E9E3DA] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Tabs */}
            <div className="flex items-center gap-2 p-1 bg-[#FAF7F0] border border-[#E9E3DA] rounded-2xl">
              <button
                onClick={() => setActiveTab("leads")}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer flex items-center gap-2 ${activeTab === "leads"
                    ? "bg-white text-[#171717] shadow-2xs font-semibold"
                    : "text-[#737373] hover:text-[#171717]"
                  }`}
              >
                <Share2 className="w-3.5 h-3.5 text-[#FF5A1F]" />
                <span>Share Form Submissions ({totalLeads})</span>
              </button>

              <button
                onClick={() => setActiveTab("sessions")}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer flex items-center gap-2 ${activeTab === "sessions"
                    ? "bg-white text-[#171717] shadow-2xs font-semibold"
                    : "text-[#737373] hover:text-[#171717]"
                  }`}
              >
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span>Active Live Sessions ({activeSessions.length})</span>
              </button>
            </div>

            {/* Search filter for leads */}
            {activeTab === "leads" && (
              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, email, project..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#FAF7F0] border border-[#E9E3DA] rounded-xl text-xs font-mono text-[#171717] placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#FF5A1F] focus:bg-white transition-all"
                />
              </div>
            )}
          </div>

          {/* TAB 1: Share Form Details Table */}
          {activeTab === "leads" && (
            <div className="overflow-x-auto">
              {loadingData && leads.length === 0 ? (
                <div className="py-16 text-center text-xs font-mono text-[#737373] flex flex-col items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-[#FF5A1F]" />
                  <span>Loading submissions...</span>
                </div>
              ) : leads.length === 0 ? (
                <div className="py-16 text-center text-xs font-mono text-[#737373] flex flex-col items-center gap-2">
                  <Share2 className="w-8 h-8 text-[#E9E3DA]" />
                  <p className="text-sm font-semibold text-[#171717]">No share form submissions yet</p>
                  <p>When users fill out the popup form to generate share links, their details will appear here.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#E9E3DA] bg-[#FAF7F0]/60 font-mono text-[11px] uppercase tracking-wider text-[#737373]">
                      <th className="py-3.5 px-4 font-semibold">User Details</th>
                      <th className="py-3.5 px-4 font-semibold">Contact</th>
                      <th className="py-3.5 px-4 font-semibold">Purpose / Project</th>
                      <th className="py-3.5 px-4 font-semibold">Generated Share Link</th>
                      <th className="py-3.5 px-4 font-semibold">Submitted At</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9E3DA]">
                    {leads.map((lead) => {
                      const leadId = lead.id || lead._id;
                      return (
                        <tr
                          key={leadId}
                          className="hover:bg-[#FAF7F0]/50 transition-colors duration-150"
                        >
                          {/* Name & ID */}
                          <td className="py-4 px-4 font-mono">
                            <div className="font-semibold text-sm text-[#171717]">
                              {lead.name}
                            </div>
                            <div className="text-[11px] text-[#A3A3A3] mt-0.5">
                              ID: {leadId.substring(0, 10)}...
                            </div>
                          </td>

                          {/* Email & Phone */}
                          <td className="py-4 px-4 font-mono">
                            <div className="flex items-center gap-1.5 text-[#171717]">
                              <Mail className="w-3.5 h-3.5 text-[#FF5A1F] shrink-0" />
                              <a
                                href={`mailto:${lead.email}`}
                                className="hover:underline hover:text-[#FF5A1F]"
                              >
                                {lead.email}
                              </a>
                            </div>
                            {lead.phone ? (
                              <div className="flex items-center gap-1.5 text-[#737373] mt-1">
                                <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <a
                                  href={`tel:${lead.phone}`}
                                  className="hover:underline"
                                >
                                  {lead.phone}
                                </a>
                              </div>
                            ) : (
                              <div className="text-[11px] text-[#A3A3A3] mt-1">
                                No phone provided
                              </div>
                            )}
                          </td>

                          {/* Purpose & Project */}
                          <td className="py-4 px-4 font-mono">
                            <div className="font-medium text-[#171717]">
                              {lead.projectTitle || "Landing Page Project"}
                            </div>
                            {lead.purpose && (
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded bg-[#FAF7F0] border border-[#E9E3DA] text-[11px] text-[#737373]">
                                <Briefcase className="w-3 h-3 text-[#FF5A1F]" />
                                <span>{lead.purpose}</span>
                              </div>
                            )}
                          </td>

                          {/* Share URL */}
                          <td className="py-4 px-4 font-mono">
                            {lead.shareUrl ? (
                              <div className="flex items-center gap-2">
                                <span className="max-w-[180px] truncate text-[#737373] bg-[#FAF7F0] px-2 py-1 rounded border border-[#E9E3DA] text-[11px]">
                                  {lead.shareUrl}
                                </span>
                                <button
                                  onClick={() => copyShareLink(lead.shareUrl)}
                                  className="p-1 rounded hover:bg-[#E9E3DA] text-[#737373] hover:text-[#171717] transition-colors cursor-pointer"
                                  title="Copy link"
                                >
                                  {copiedLink === lead.shareUrl ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                <a
                                  href={lead.shareUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1 rounded hover:bg-[#E9E3DA] text-[#737373] hover:text-[#FF5A1F] transition-colors"
                                  title="Open in new tab"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            ) : (
                              <span className="text-[#A3A3A3] text-[11px]">—</span>
                            )}
                          </td>

                          {/* Date & Time */}
                          <td className="py-4 px-4 font-mono text-[#737373]">
                            <div>{new Date(lead.createdAt).toLocaleDateString()}</div>
                            <div className="text-[11px] text-[#A3A3A3]">
                              {new Date(lead.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4 text-right">
                            <button
                              onClick={() => handleDeleteLead(leadId)}
                              disabled={deletingLeadId === leadId}
                              className="p-1.5 rounded-lg text-[#737373] hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer disabled:opacity-50"
                              title="Delete Submission"
                            >
                              {deletingLeadId === leadId ? (
                                <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* TAB 2: Live Active Sessions Table */}
          {activeTab === "sessions" && (
            <div className="overflow-x-auto">
              {activeSessions.length === 0 ? (
                <div className="py-16 text-center text-xs font-mono text-[#737373] flex flex-col items-center gap-2">
                  <Users className="w-8 h-8 text-[#E9E3DA]" />
                  <p className="text-sm font-semibold text-[#171717]">No active sessions found</p>
                  <p>When users browse the studio, their live presence heartbeats will stream here.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#E9E3DA] bg-[#FAF7F0]/60 font-mono text-[11px] uppercase tracking-wider text-[#737373]">
                      <th className="py-3.5 px-4 font-semibold">Status</th>
                      <th className="py-3.5 px-4 font-semibold">Session ID</th>
                      <th className="py-3.5 px-4 font-semibold">IP Address Hash</th>
                      <th className="py-3.5 px-4 font-semibold">User Agent / Device</th>
                      <th className="py-3.5 px-4 font-semibold">Last Heartbeat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9E3DA]">
                    {activeSessions.map((session, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-[#FAF7F0]/50 transition-colors duration-150"
                      >
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-mono font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Active</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-medium text-[#171717]">
                          {session.sessionId}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[#737373]">
                          {session.ip}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[#737373] max-w-xs truncate">
                          {session.userAgent || "Desktop Browser"}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[#737373]">
                          {new Date(session.lastSeen).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
