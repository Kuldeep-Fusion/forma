"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit3,
  Copy,
  Trash2,
  ExternalLink,
  Users,
  Clock,
  Layers,
  ArrowRight,
  Check,
  AlertCircle,
  Loader2,
  Share2,
  FileSpreadsheet,
  X,
  Palette,
  ShieldCheck,
  Layout,
  Upload,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "draft" | "published"
  const [sortOrder, setSortOrder] = useState("recent");

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeMenuProjectId, setActiveMenuProjectId] = useState(null);
  const [submissionsTarget, setSubmissionsTarget] = useState(null);
  const [submissionsList, setSubmissionsList] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [copiedProjectId, setCopiedProjectId] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  // Guided Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [briefForm, setBriefForm] = useState({
    businessName: "",
    prompt: "",
    industry: "ai_startup",
    objective: "leads",
    keyFeatures: "",
    primaryCta: "",
    referenceImage: null,
  });
  const [generateError, setGenerateError] = useState("");

  // Fetch projects on load
  const loadProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/projects", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error("Failed to load dashboard projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // Filter & Sort
  const filteredProjects = projects
    .filter((p) => {
      const matchesSearch =
        (p.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.metadata?.category || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.metadata?.creativeDirection || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ? true : p.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortOrder === "recent") {
        return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
      }
      return (a.title || "").localeCompare(b.title || "");
    });

  // Handle Create / Generate
  const handleGenerateProject = async (e) => {
    e.preventDefault();
    if (!briefForm.prompt.trim()) {
      setGenerateError("Please describe your business or landing page vision.");
      return;
    }

    setIsGenerating(true);
    setGenerateError("");

    try {
      const fullPrompt = [
        briefForm.businessName ? `Brand/Business Name: ${briefForm.businessName}.` : "",
        briefForm.prompt.trim(),
        briefForm.keyFeatures ? `Key Features: ${briefForm.keyFeatures}.` : "",
        briefForm.primaryCta ? `Main CTA: ${briefForm.primaryCta}.` : "",
        `Objective: ${briefForm.objective}. Industry: ${briefForm.industry}.`,
      ]
        .filter(Boolean)
        .join(" ");

      const payload = {
        prompt: fullPrompt,
        direction: "auto",
        themePreference: "auto",
        motionStyle: "auto",
      };

      if (briefForm.referenceImage) {
        payload.referenceImages = [briefForm.referenceImage];
      }

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate landing page");
      }

      const newId = data.project?._id || data.project?.id;
      if (data.editToken && typeof window !== "undefined") {
        localStorage.setItem(`forma_edit_token_${newId}`, data.editToken);
      }

      setIsCreateModalOpen(false);
      router.push(`/editor/${newId}`);
    } catch (err) {
      console.error("Generation error:", err);
      setGenerateError(err.message || "Failed to create landing page. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const getStoredEditToken = (id) => {
    if (!id || typeof window === "undefined") return null;
    return (
      localStorage.getItem(`forma_edit_token_${id}`) ||
      localStorage.getItem(`forma_token_${id}`) ||
      null
    );
  };

  const copyToClipboardSafely = async (text) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (err) {
      console.warn("navigator.clipboard failed, using fallback textarea", err);
    }
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      console.error("Fallback clipboard copy failed:", err);
      return false;
    }
  };

  // Duplicate Project
  const handleDuplicate = async (projectId) => {
    try {
      const editToken = getStoredEditToken(projectId);
      const res = await fetch(`/api/projects/${projectId}/duplicate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(editToken ? { "x-edit-token": editToken } : {}),
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.editToken && typeof window !== "undefined") {
          localStorage.setItem(`forma_edit_token_${data.project.id}`, data.editToken);
          localStorage.setItem(`forma_token_${data.project.id}`, data.editToken);
        }
        setActiveMenuProjectId(null);
        await loadProjects();
      }
    } catch (e) {
      console.error("Duplicate error:", e);
    }
  };

  // Rename Project
  const handleRenameSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!renameTarget || !renameValue.trim()) return;
    try {
      const editToken = getStoredEditToken(renameTarget.id);
      const res = await fetch(`/api/projects/${renameTarget.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(editToken ? { "x-edit-token": editToken } : {}),
        },
        body: JSON.stringify({ title: renameValue.trim() }),
      });

      if (res.ok) {
        setRenameTarget(null);
        setActiveMenuProjectId(null);
        await loadProjects();
      }
    } catch (e) {
      console.error("Rename error:", e);
    }
  };

  // Delete Project
  const handleDeleteSubmit = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      const editToken = getStoredEditToken(deleteTarget.id);
      const res = await fetch(`/api/projects/${deleteTarget.id}`, {
        method: "DELETE",
        headers: {
          ...(editToken ? { "x-edit-token": editToken } : {}),
        },
      });

      if (res.ok) {
        setDeleteTarget(null);
        setActiveMenuProjectId(null);
        await loadProjects();
      }
    } catch (e) {
      console.error("Delete error:", e);
    } finally {
      setIsDeleting(false);
    }
  };

  // View Submissions Leads
  const openSubmissionsModal = async (project) => {
    setSubmissionsTarget(project);
    setLoadingSubmissions(true);
    setSubmissionsList([]);
    setActiveMenuProjectId(null);

    try {
      const editToken = getStoredEditToken(project.id);
      const res = await fetch(`/api/forms/submissions?projectId=${project.id}`, {
        headers: {
          ...(editToken ? { "x-edit-token": editToken } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setSubmissionsList(data.submissions || []);
      }
    } catch (e) {
      console.error("Submissions load error:", e);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  // Export Submissions to CSV
  const exportSubmissionsCSV = () => {
    if (!submissionsList.length) return;
    const allKeys = Array.from(
      new Set(submissionsList.flatMap((s) => Object.keys(s.data || {})))
    );
    const headers = ["Submitted At", "Form ID", ...allKeys];
    const rows = submissionsList.map((s) => [
      new Date(s.createdAt).toLocaleString(),
      s.formId || "default",
      ...allKeys.map((k) => `"${(s.data?.[k] || "").toString().replace(/"/g, '""')}"`),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `forma_leads_${submissionsTarget?.title || "project"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy 24h Share Link
  const handleCopyShareLink = async (project) => {
    const targetId = project.id || project._id;
    if (!targetId) return;

    try {
      const editToken = getStoredEditToken(targetId);
      const res = await fetch("/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(editToken ? { "x-edit-token": editToken } : {}),
        },
        body: JSON.stringify({ projectId: targetId, editToken: editToken || undefined }),
      });

      let shareUrl = "";
      if (res.ok) {
        const data = await res.json();
        shareUrl = data.shareUrl
          ? `${window.location.origin}${data.shareUrl}`
          : `${window.location.origin}/preview/${data.shareToken || targetId}`;
      } else {
        // Fallback to direct preview URL
        shareUrl = `${window.location.origin}/preview/${targetId}`;
      }

      await copyToClipboardSafely(shareUrl);
      setCopiedProjectId(targetId);
      setToastMessage("Shareable preview link copied to clipboard!");
      setTimeout(() => setCopiedProjectId(null), 2500);
      setTimeout(() => setToastMessage(""), 3500);
    } catch (e) {
      console.error("Share copy error:", e);
      const fallbackUrl = `${window.location.origin}/preview/${targetId}`;
      await copyToClipboardSafely(fallbackUrl);
      setCopiedProjectId(targetId);
      setToastMessage("Shareable preview link copied to clipboard!");
      setTimeout(() => setCopiedProjectId(null), 2500);
      setTimeout(() => setToastMessage(""), 3500);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#171717] flex flex-col font-sans forma-light-grid">
      {/* 1. Forma Light Brand Dashboard Navigation */}
      <header className="sticky top-0 z-40 bg-[#FAF7F0]/90 backdrop-blur-md border-b border-[#E9E3DA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div
              onClick={() => router.push("/")}
              className="flex items-center gap-2.5 cursor-pointer select-none group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/forma-logo.png"
                alt="Forma — AI Landing Page Studio"
                className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-[1.02]"
              />
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-white text-[#737373] border border-[#E9E3DA] hidden sm:inline-block">
                Studio
              </span>
            </div>

            <nav className="hidden sm:flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#E9E3DA] text-xs font-mono">
              <button
                onClick={() => router.push("/dashboard")}
                className="px-3 py-1.5 rounded-lg bg-[#FF5A1F]/10 text-[#FF5A1F] border border-[#FF5A1F]/20 font-bold"
              >
                Dashboard
              </button>
              <button
                onClick={() => router.push("/")}
                className="px-3 py-1.5 rounded-lg text-[#737373] hover:text-[#171717] transition-colors"
              >
                Studio Home
              </button>
              <button
                onClick={() => router.push("/#recent-builds")}
                className="px-3 py-1.5 rounded-lg text-[#737373] hover:text-[#171717] transition-colors"
              >
                Live Builds
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#E9E3DA] text-[#171717] text-xs font-mono shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#FF5A1F] animate-pulse" />
              <span>Gemini 2.5 Flash / 3.5 Pro</span>
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#FF5A1F] hover:bg-[#E44A12] text-white text-xs sm:text-sm font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Landing Page</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Dashboard Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        {/* Top Metric Overview Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E9E3DA] shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#737373] block">
                Total Projects
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-[#171717] mt-1 block">
                {projects.length}
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#FAF7F0] border border-[#E9E3DA] flex items-center justify-center text-[#FF5A1F]">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E9E3DA] shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#737373] block">
                Active Landing Pages
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-[#171717] mt-1 block">
                {projects.filter((p) => p.status !== "archived").length}
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#FAF7F0] border border-[#E9E3DA] flex items-center justify-center text-[#FF5A1F]">
              <Layout className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E9E3DA] shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#737373] block">
                AI Design Engine
              </span>
              <span className="text-sm font-semibold text-[#171717] mt-1 flex items-center gap-1.5 font-mono">
                <Sparkles className="w-4 h-4 text-[#FF5A1F]" />
                Gemini Autonomous Copilot
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#FAF7F0] border border-[#E9E3DA] flex items-center justify-center text-[#FF5A1F]">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Toolbar: Search, Filters & Sorting */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#E9E3DA] shadow-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by landing page name or category..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-[#FAF7F0] border border-[#E9E3DA] rounded-xl text-[#171717] placeholder:text-[#737373] focus:outline-none focus:border-[#FF5A1F] focus:bg-white transition-all font-sans"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#FAF7F0] p-1 rounded-xl border border-[#E9E3DA] text-xs font-medium text-[#737373]">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  statusFilter === "all" ? "bg-white text-[#171717] shadow-xs font-semibold" : "hover:text-[#171717]"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("draft")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  statusFilter === "draft" ? "bg-white text-[#171717] shadow-xs font-semibold" : "hover:text-[#171717]"
                }`}
              >
                Drafts
              </button>
              <button
                onClick={() => setStatusFilter("published")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  statusFilter === "published" ? "bg-white text-[#171717] shadow-xs font-semibold" : "hover:text-[#171717]"
                }`}
              >
                Published
              </button>
            </div>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-3 py-2 text-xs bg-[#FAF7F0] border border-[#E9E3DA] rounded-xl text-[#171717] focus:outline-none focus:border-[#FF5A1F] cursor-pointer font-mono"
            >
              <option value="recent">Last Edited</option>
              <option value="alpha">Alphabetical</option>
            </select>
          </div>
        </div>

        {/* 3. Projects Grid or Loading/Empty States */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-[#E9E3DA] p-5 space-y-4 animate-pulse">
                <div className="h-44 bg-[#FAF7F0] rounded-xl" />
                <div className="h-5 bg-[#FAF7F0] rounded w-3/4" />
                <div className="h-4 bg-[#FAF7F0] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#E9E3DA] p-10 sm:p-14 text-center max-w-xl mx-auto space-y-4 shadow-xs my-8">
            <div className="w-14 h-14 rounded-2xl bg-[#FF5A1F]/10 text-[#FF5A1F] flex items-center justify-center mx-auto border border-[#FF5A1F]/20">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-[#171717]">
              {searchQuery ? "No matching projects found" : "No landing pages yet"}
            </h3>
            <p className="text-xs text-[#737373] leading-relaxed max-w-md mx-auto">
              {searchQuery
                ? "Try searching for a different keyword or reset filters to see all creations."
                : "Describe your product, startup, or SaaS idea. Forma's autonomous AI architect will construct the copy, layout composition, and interactive elements."}
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FF5A1F] hover:bg-[#E44A12] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Landing Page</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-2xl border border-[#E9E3DA] shadow-xs hover:shadow-md hover:border-[#171717]/20 transition-all flex flex-col overflow-hidden group relative"
              >
                {/* Visual Thumbnail */}
                <div
                  onClick={() => router.push(`/editor/${project.id}`)}
                  className="relative h-44 bg-[#FAF7F0] cursor-pointer overflow-hidden flex items-center justify-center border-b border-[#E9E3DA]"
                >
                  <img
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80"
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                  {/* Direction & Status Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-mono uppercase tracking-wider text-white border border-white/10 font-medium">
                      {project.metadata?.creativeDirection || "Editorial"}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border ${
                      project.status === "published"
                        ? "bg-[#FF5A1F] text-white border-[#FF5A1F]"
                        : "bg-white/90 text-[#171717] border-[#E9E3DA]"
                    }`}>
                      {project.status || "Draft"}
                    </span>
                  </div>

                  {/* Hover Quick Action */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-4 py-2 rounded-xl bg-white text-[#171717] text-xs font-semibold shadow-lg flex items-center gap-1.5 hover:text-[#FF5A1F]">
                      <Edit3 className="w-3.5 h-3.5 text-[#FF5A1F]" />
                      Open in Studio Editor
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h4
                      onClick={() => router.push(`/editor/${project.id}`)}
                      className="font-bold text-sm text-[#171717] group-hover:text-[#FF5A1F] transition-colors cursor-pointer line-clamp-1"
                      title={project.title}
                    >
                      {project.title}
                    </h4>
                    <span className="text-[11px] text-[#737373] font-mono mt-1 block">
                      {project.metadata?.category || "Creative Landing Page"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#E9E3DA] text-[11px] text-[#737373] font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#737373]" />
                      {new Date(project.updatedAt || project.createdAt).toLocaleDateString()}
                    </span>

                    <button
                      onClick={() => openSubmissionsModal(project)}
                      className="hover:text-[#FF5A1F] flex items-center gap-1 transition-colors cursor-pointer"
                      title="View collected lead submissions"
                    >
                      <Users className="w-3.5 h-3.5 text-[#FF5A1F]" />
                      <span>Leads</span>
                    </button>
                  </div>

                  {/* Actions Row */}
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    <button
                      onClick={() => router.push(`/editor/${project.id}`)}
                      className="col-span-2 py-2 px-3 rounded-xl bg-[#171717] hover:bg-[#FF5A1F] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleCopyShareLink(project)}
                      className="py-2 rounded-xl border border-[#E9E3DA] hover:bg-[#FAF7F0] text-[#737373] hover:text-[#171717] flex items-center justify-center transition-colors cursor-pointer"
                      title="Copy 24h Public Preview Link"
                    >
                      {copiedProjectId === project.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <div className="relative">
                      <button
                        onClick={() =>
                          setActiveMenuProjectId(
                            activeMenuProjectId === project.id ? null : project.id
                          )
                        }
                        className="py-2 px-2.5 rounded-xl border border-[#E9E3DA] hover:bg-[#FAF7F0] text-[#737373] hover:text-[#171717] transition-colors w-full flex items-center justify-center cursor-pointer"
                        title="More Actions"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuProjectId === project.id && (
                        <div className="absolute right-0 bottom-full mb-2 w-44 bg-white rounded-xl border border-[#E9E3DA] shadow-xl p-1 z-30 space-y-0.5">
                          <button
                            onClick={() => {
                              setRenameTarget(project);
                              setRenameValue(project.title);
                              setActiveMenuProjectId(null);
                            }}
                            className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-[#171717] hover:bg-[#FAF7F0] flex items-center gap-2 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#737373]" />
                            <span>Rename</span>
                          </button>
                          <button
                            onClick={() => handleDuplicate(project.id)}
                            className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-[#171717] hover:bg-[#FAF7F0] flex items-center gap-2 cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5 text-[#737373]" />
                            <span>Duplicate</span>
                          </button>
                          <button
                            onClick={() => openSubmissionsModal(project)}
                            className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-[#171717] hover:bg-[#FAF7F0] flex items-center gap-2 cursor-pointer"
                          >
                            <Users className="w-3.5 h-3.5 text-[#737373]" />
                            <span>View Leads</span>
                          </button>
                          <div className="border-t border-[#E9E3DA] my-1" />
                          <button
                            onClick={() => {
                              setDeleteTarget(project);
                              setActiveMenuProjectId(null);
                            }}
                            className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 4. Guided Creation Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E9E3DA] max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-[#FAF7F0] text-[#737373] hover:text-[#171717] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5A1F]/10 border border-[#FF5A1F]/20 text-[#FF5A1F] text-xs font-mono mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Autonomous Senior Designer</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#171717] font-display">
                Create New Landing Page
              </h2>
              <p className="text-xs sm:text-sm text-[#737373] mt-1 leading-relaxed">
                Describe what you want to promote, sell, or launch. Forma will decide the art direction, typography, and section flow.
              </p>
            </div>

            <form onSubmit={handleGenerateProject} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#171717] block mb-1">
                  Brand or Product Name (Optional)
                </label>
                <input
                  type="text"
                  value={briefForm.businessName}
                  onChange={(e) => setBriefForm({ ...briefForm, businessName: e.target.value })}
                  placeholder="e.g. Lumina Health, Verve Audio, Atelier V"
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F0] border border-[#E9E3DA] rounded-xl text-[#171717] placeholder:text-[#737373] focus:outline-none focus:border-[#FF5A1F] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#171717] block mb-1">
                  Vision & Description <span className="text-[#FF5A1F]">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={briefForm.prompt}
                  onChange={(e) => setBriefForm({ ...briefForm, prompt: e.target.value })}
                  placeholder="e.g. An AI-powered fitness coaching platform targeting young professionals. Include pricing tiers, testimonials, client progress metrics, and a consultation form..."
                  className="w-full p-3.5 text-xs bg-[#FAF7F0] border border-[#E9E3DA] rounded-xl text-[#171717] placeholder:text-[#737373] focus:outline-none focus:border-[#FF5A1F] focus:bg-white leading-relaxed resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#171717] block mb-1">
                    Industry Sector
                  </label>
                  <select
                    value={briefForm.industry}
                    onChange={(e) => setBriefForm({ ...briefForm, industry: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#FAF7F0] border border-[#E9E3DA] rounded-xl text-[#171717] focus:outline-none focus:border-[#FF5A1F] cursor-pointer font-sans"
                  >
                    <option value="ai_startup">AI & DeepTech Platform</option>
                    <option value="saas">SaaS & B2B Software</option>
                    <option value="luxury">Luxury, Fashion & Real Estate</option>
                    <option value="wellness">Wellness, Health & Organic</option>
                    <option value="education">Academy & EdTech</option>
                    <option value="agency">Design Studio & Agency</option>
                    <option value="ecommerce">Consumer Product & E-commerce</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#171717] block mb-1">
                    Primary Conversion Goal
                  </label>
                  <select
                    value={briefForm.objective}
                    onChange={(e) => setBriefForm({ ...briefForm, objective: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#FAF7F0] border border-[#E9E3DA] rounded-xl text-[#171717] focus:outline-none focus:border-[#FF5A1F] cursor-pointer font-sans"
                  >
                    <option value="leads">Lead Capture / Consultation</option>
                    <option value="sales">Product Sales & Subscriptions</option>
                    <option value="signups">Waitlist & Beta Registrations</option>
                    <option value="awareness">Brand Discovery & Storytelling</option>
                  </select>
                </div>
              </div>

              {generateError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{generateError}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#E9E3DA] text-[#737373] hover:text-[#171717] hover:bg-[#FAF7F0] text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-6 py-2.5 rounded-xl bg-[#FF5A1F] hover:bg-[#E44A12] text-white text-xs font-semibold shadow-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Landing Page</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Submissions Leads Modal */}
      {submissionsTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E9E3DA] max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-[#E9E3DA]">
              <div>
                <span className="text-xs font-mono text-[#FF5A1F] uppercase tracking-wider block font-semibold">
                  Lead Capture Telemetry
                </span>
                <h3 className="text-lg font-bold text-[#171717] mt-0.5">
                  Submissions for &quot;{submissionsTarget.title}&quot;
                </h3>
              </div>
              <button
                onClick={() => setSubmissionsTarget(null)}
                className="p-2 rounded-full hover:bg-[#FAF7F0] text-[#737373] hover:text-[#171717] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {loadingSubmissions ? (
                <div className="py-12 flex flex-col items-center justify-center text-[#737373] gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-[#FF5A1F]" />
                  <span className="text-xs font-mono">Fetching recorded leads...</span>
                </div>
              ) : submissionsList.length === 0 ? (
                <div className="py-12 text-center text-[#737373] font-mono text-xs">
                  No submissions captured yet. Publish your page or submit test data to collect inquiries.
                </div>
              ) : (
                submissionsList.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-4 rounded-xl bg-[#FAF7F0] border border-[#E9E3DA] text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between text-[11px] text-[#737373] font-mono border-b border-[#E9E3DA] pb-2">
                      <span>{new Date(sub.createdAt).toLocaleString()}</span>
                      <span className="px-2 py-0.5 rounded bg-[#FF5A1F]/10 text-[#FF5A1F] font-semibold border border-[#FF5A1F]/20">
                        {sub.formId || "lead-form"}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#171717]">
                      {Object.entries(sub.data || {}).map(([key, value]) => (
                        <div key={key} className="break-words">
                          <strong className="text-[#171717] capitalize font-medium">{key}: </strong>
                          <span>{value?.toString() || "—"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#E9E3DA]">
              <span className="text-xs font-mono text-[#737373]">
                Total: {submissionsList.length} inquiries
              </span>
              <div className="flex items-center gap-2">
                {submissionsList.length > 0 && (
                  <button
                    onClick={exportSubmissionsCSV}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#171717] hover:bg-[#FF5A1F] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                )}
                <button
                  onClick={() => setSubmissionsTarget(null)}
                  className="px-4 py-2 rounded-xl border border-[#E9E3DA] hover:bg-[#FAF7F0] text-[#171717] text-xs font-medium cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Rename Project Modal */}
      {renameTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E9E3DA] max-w-sm w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-[#171717]">Rename Project</h3>
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#FAF7F0] border border-[#E9E3DA] rounded-xl text-[#171717] focus:outline-none focus:border-[#FF5A1F] focus:bg-white"
            />
            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                onClick={() => handleDuplicate(renameTarget.id)}
                className="inline-flex items-center gap-1 text-xs text-[#737373] hover:text-[#171717] cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Duplicate</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRenameTarget(null)}
                  className="px-3 py-1.5 rounded-lg border border-[#E9E3DA] text-xs text-[#737373] hover:text-[#171717] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRenameSubmit}
                  className="px-3.5 py-1.5 rounded-lg bg-[#FF5A1F] hover:bg-[#E44A12] text-white text-xs font-semibold cursor-pointer"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E9E3DA] max-w-sm w-full p-6 space-y-4 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-200">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#171717]">Delete Landing Page?</h3>
              <p className="text-xs text-[#737373] mt-1 leading-relaxed">
                Are you sure you want to delete &quot;{deleteTarget.title}&quot;? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-3 py-1.5 rounded-lg border border-[#E9E3DA] text-xs text-[#737373] hover:text-[#171717] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSubmit}
                disabled={isDeleting}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#171717] text-white shadow-2xl border border-[#E9E3DA]/20 text-xs font-mono animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Check className="w-4 h-4 text-[#FF5A1F]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
