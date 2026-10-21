"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import PageRenderer from "../../../components/renderer/PageRenderer.js";
import ResponsivePreviewCanvas from "../../../components/editor/ResponsivePreviewCanvas.js";
import MediaUploader from "../../../components/editor/MediaUploader.js";
import ShareModal from "../../../components/editor/ShareModal.js";
import FormBuilder from "../../../components/editor/FormBuilder.js";
import { exportWebsiteZip } from "../../../lib/export/exportWebsiteZip.js";
import {
  Monitor,
  Tablet,
  Smartphone,
  Save,
  Share2,
  Download,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Plus,
  ArrowLeft,
  Sparkles,
  Palette,
  Type,
  Play,
  Layers,
  Sliders,
  Check,
  Loader2,
  AlertCircle,
  ExternalLink,
  RotateCcw,
  RotateCw,
  Wand2,
  Users,
  FileSpreadsheet,
  X,
} from "lucide-react";

const PALETTE_PRESETS = [
  { name: "Forma Milk & Hot Orange", bg: "#FAF7F0", text: "#171717", accent: "#FF5A1F", surface: "#FFFFFF", border: "#E9E3DA", muted: "#737373" },
  { name: "Minimalist Swiss White", bg: "#FFFFFF", text: "#0F172A", accent: "#FF5A1F", surface: "#F8FAFC", border: "#E2E8F0", muted: "#64748B" },
  { name: "Warm Cream & Terracotta", bg: "#FBF8F3", text: "#292524", accent: "#EA580C", surface: "#FFFFFF", border: "#E7E5E4", muted: "#78716C" },
  { name: "Obsidian & Hot Orange", bg: "#0B0D0C", text: "#F5F5F0", accent: "#FF5A1F", surface: "#121514", border: "#232825", muted: "#8E928F" },
  { name: "Midnight Indigo", bg: "#080A12", text: "#F1F5F9", accent: "#6366F1", surface: "#0F1424", border: "#1E2742", muted: "#818CF8" },
  { name: "Botanical Sage", bg: "#FAF7F0", text: "#1C241D", accent: "#385E38", surface: "#FFFFFF", border: "#E2DDD3", muted: "#667067" },
  { name: "Carbon Titanium", bg: "#0A0A0A", text: "#FAFAFA", accent: "#FFFFFF", surface: "#141414", border: "#262626", muted: "#999999" },
  { name: "Solar Amber", bg: "#0F0C08", text: "#FFFDF5", accent: "#FFB020", surface: "#17130D", border: "#292116", muted: "#A39785" },
];

const AVAILABLE_SECTION_TYPES = [
  { type: "announcement", label: "Announcement Bar", desc: "Top notification banner" },
  { type: "navbar", label: "Navigation Bar", desc: "Sticky top navigation" },
  { type: "hero", label: "Hero Section", desc: "Headline, CTA, and media" },
  { type: "logo_strip", label: "Logo Strip", desc: "Partner and client logos" },
  { type: "features", label: "Features Grid", desc: "Core architectural capabilities" },
  { type: "stats", label: "Statistics", desc: "Key numerical milestones" },
  { type: "benefits", label: "Benefits", desc: "Strategic advantages" },
  { type: "showcase", label: "Showcase", desc: "Visual portfolio artifacts" },
  { type: "gallery", label: "Image Gallery", desc: "Responsive media grid" },
  { type: "video_showcase", label: "Video Showcase", desc: "Featured video player" },
  { type: "testimonials", label: "Testimonials", desc: "Editorial praise quotes" },
  { type: "pricing", label: "Pricing Tiers", desc: "Subscription investment tiers" },
  { type: "faq", label: "FAQ Accordion", desc: "Questions & answers" },
  { type: "cta", label: "Call to Action", desc: "Conversion closer" },
  { type: "form", label: "Bottom Form Builder", desc: "Custom contact & lead capture form" },
  { type: "footer", label: "Footer", desc: "Legal and navigation links" },
];

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [project, setProject] = useState(null);
  const [pageConfig, setPageConfig] = useState(null);
  const [editToken, setEditToken] = useState("");

  // Editor states
  const [viewport, setViewport] = useState("desktop"); // desktop | tablet | mobile
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [activeTab, setActiveTab] = useState("content"); // content | theme | motion
  const [saveStatus, setSaveStatus] = useState("saved"); // saved | saving | unsaved | error
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Mobile / Tablet responsive view switcher: "canvas" | "layers" | "inspector"
  const [mobilePanel, setMobilePanel] = useState("canvas");

  // Panel visibility toggles (Desktop)
  const [showLayers, setShowLayers] = useState(true);
  const [showInspector, setShowInspector] = useState(true);

  // Undo / Redo History Stacks
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);

  // AI Refine State
  const [isRefineOpen, setIsRefineOpen] = useState(false);
  const [refinePrompt, setRefinePrompt] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [refineError, setRefineError] = useState("");

  // Submissions State
  const [isSubmissionsOpen, setIsSubmissionsOpen] = useState(false);
  const [submissionsList, setSubmissionsList] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Autosave timer ref
  const autosaveTimerRef = useRef(null);

  // Load project on mount
  useEffect(() => {
    async function loadProject() {
      setLoading(true);
      setError("");

      const storedToken =
        typeof window !== "undefined"
          ? localStorage.getItem(`forma_edit_token_${projectId}`) ||
            localStorage.getItem(`forma_token_${projectId}`) ||
            ""
          : "";
      if (storedToken) setEditToken(storedToken);

      try {
        const res = await fetch(`/api/projects/${projectId}`, {
          headers: storedToken ? { "x-edit-token": storedToken } : {},
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to load project");
        }

        setProject(data.project);
        setPageConfig(data.project.pageConfig);
        if (data.project.pageConfig?.sections?.length > 0) {
          setActiveSectionId(data.project.pageConfig.sections[0].id);
        }
      } catch (err) {
        console.error("Editor load error:", err);
        setError(err.message || "Failed to load project");
      } finally {
        setLoading(false);
      }
    }

    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  // Keyboard shortcuts for Undo / Redo
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, future, pageConfig]);

  // Autosave trigger whenever pageConfig changes (after initial load)
  const triggerAutosave = (updatedConfig) => {
    setSaveStatus("unsaved");

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(async () => {
      await saveProjectChanges(updatedConfig);
    }, 1500);
  };

  const saveProjectChanges = async (configToSave = pageConfig) => {
    if (!configToSave) return;
    setSaveStatus("saving");

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-edit-token": editToken || "",
        },
        body: JSON.stringify({ pageConfig: configToSave }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save changes");
      }

      setSaveStatus("saved");
    } catch (err) {
      console.error("Save error:", err);
      setSaveStatus("error");
    }
  };

  // Helper to commit changes to history stack and trigger autosave
  const updateConfigWithHistory = (newConfig) => {
    if (pageConfig) {
      setHistory((prev) => [...prev.slice(-30), pageConfig]);
      setFuture([]);
    }
    setPageConfig(newConfig);
    triggerAutosave(newConfig);
  };

  // Undo / Redo handlers
  const handleUndo = () => {
    if (history.length === 0 || !pageConfig) return;
    const prev = history[history.length - 1];
    setHistory((prevH) => prevH.slice(0, -1));
    setFuture((prevF) => [pageConfig, ...prevF]);
    setPageConfig(prev);
    triggerAutosave(prev);
  };

  const handleRedo = () => {
    if (future.length === 0 || !pageConfig) return;
    const next = future[0];
    setFuture((prevF) => prevF.slice(1));
    setHistory((prevH) => [...prevH, pageConfig]);
    setPageConfig(next);
    triggerAutosave(next);
  };

  // AI Refine Handler
  const handleRefineSubmit = async (customPrompt) => {
    const promptToSend = customPrompt || refinePrompt;
    if (!promptToSend.trim()) return;

    setIsRefining(true);
    setRefineError("");

    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-edit-token": editToken || "",
        },
        body: JSON.stringify({
          projectId,
          pageConfig,
          prompt: promptToSend.trim(),
          sectionId: activeSectionId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to refine page");
      }

      updateConfigWithHistory(data.pageConfig);
      setIsRefineOpen(false);
      setRefinePrompt("");
    } catch (err) {
      console.error("Refine error:", err);
      setRefineError(err.message || "Failed to refine with AI");
    } finally {
      setIsRefining(false);
    }
  };

  // Open Submissions Modal
  const openSubmissionsModal = async () => {
    setIsSubmissionsOpen(true);
    setLoadingSubmissions(true);
    try {
      const res = await fetch(`/api/forms/submissions?projectId=${projectId}`, {
        headers: editToken ? { "x-edit-token": editToken } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setSubmissionsList(data.submissions || []);
      }
    } catch (err) {
      console.error("Submissions load error:", err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

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
    link.setAttribute("download", `forma_leads_${project?.title || "project"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Section Management Actions
  const updateActiveSectionContent = (field, value) => {
    if (!activeSectionId || !pageConfig) return;

    const updatedSections = pageConfig.sections.map((sec) => {
      if (sec.id === activeSectionId) {
        return {
          ...sec,
          content: {
            ...sec.content,
            [field]: value,
          },
        };
      }
      return sec;
    });

    const newConfig = { ...pageConfig, sections: updatedSections };
    updateConfigWithHistory(newConfig);
  };

  const updateActiveSectionAllContent = (newContent) => {
    if (!activeSectionId || !pageConfig) return;

    const updatedSections = pageConfig.sections.map((sec) => {
      if (sec.id === activeSectionId) {
        return {
          ...sec,
          content: newContent,
        };
      }
      return sec;
    });

    const newConfig = { ...pageConfig, sections: updatedSections };
    updateConfigWithHistory(newConfig);
  };

  const handleOpenPreviewInNewTab = async () => {
    try {
      if (saveStatus === "unsaved") {
        await saveProjectChanges();
      }
      const res = await fetch("/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(editToken ? { "x-edit-token": editToken } : {}),
        },
        body: JSON.stringify({ projectId, editToken: editToken || undefined }),
      });
      let previewUrl = "";
      if (res.ok) {
        const data = await res.json();
        previewUrl = data.shareUrl || `/preview/${data.shareToken || projectId}`;
      } else {
        previewUrl = `/preview/${projectId}`;
      }
      window.open(previewUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("Failed to open preview in new tab:", err);
      window.open(`/preview/${projectId}`, "_blank", "noopener,noreferrer");
    }
  };

  const handleExportZip = async () => {
    if (!pageConfig) return;
    setIsExporting(true);
    try {
      await exportWebsiteZip(pageConfig);
    } catch (err) {
      console.error("Export zip error:", err);
      alert("Failed to export website package: " + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const toggleSectionVisibility = (secId, e) => {
    e?.stopPropagation();
    const updated = pageConfig.sections.map((sec) => {
      if (sec.id === secId) {
        return { ...sec, isVisible: !sec.isVisible };
      }
      return sec;
    });
    const newConfig = { ...pageConfig, sections: updated };
    updateConfigWithHistory(newConfig);
  };

  const moveSection = (index, direction, e) => {
    e?.stopPropagation();
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= pageConfig.sections.length) return;

    const sectionsCopy = [...pageConfig.sections];
    const [moved] = sectionsCopy.splice(index, 1);
    sectionsCopy.splice(targetIndex, 0, moved);

    const newConfig = { ...pageConfig, sections: sectionsCopy };
    updateConfigWithHistory(newConfig);
  };

  const duplicateSection = (secId, e) => {
    e?.stopPropagation();
    const index = pageConfig.sections.findIndex((s) => s.id === secId);
    if (index === -1) return;

    const original = pageConfig.sections[index];
    const duplicated = {
      ...JSON.parse(JSON.stringify(original)),
      id: `${original.type}-${Date.now().toString().slice(-4)}`,
    };

    const sectionsCopy = [...pageConfig.sections];
    sectionsCopy.splice(index + 1, 0, duplicated);

    const newConfig = { ...pageConfig, sections: sectionsCopy };
    updateConfigWithHistory(newConfig);
    setActiveSectionId(duplicated.id);
  };

  const deleteSection = (secId, e) => {
    e?.stopPropagation();
    if (pageConfig.sections.length <= 1) {
      alert("A landing page must have at least one section.");
      return;
    }
    const updated = pageConfig.sections.filter((s) => s.id !== secId);
    const newConfig = { ...pageConfig, sections: updated };
    updateConfigWithHistory(newConfig);
    if (activeSectionId === secId) {
      setActiveSectionId(updated[0]?.id || null);
    }
  };

  const addSection = (type) => {
    const newId = `${type}-${Date.now().toString().slice(-4)}`;
    let defaultContent = {};

    switch (type) {
      case "announcement":
        defaultContent = { badge: "New Release", message: "Discover our latest breakthrough.", linkText: "Learn more", linkHref: "#" };
        break;
      case "navbar":
        defaultContent = { brandName: pageConfig.metadata.title, links: [{ label: "Overview", href: "#" }, { label: "Features", href: "#" }], cta: { label: "Get Started", href: "#" } };
        break;
      case "hero":
        defaultContent = { badge: "Studio V0", headline: "Unbounded digital experiences.", subheadline: "A synthesis of motion and architecture.", primaryCta: { label: "Explore", href: "#" }, media: { type: "image", url: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=1200&q=80", alt: "Visual" } };
        break;
      case "logo_strip":
        defaultContent = { title: "Trusted by forward engineering teams", logos: [{ name: "ACME Corp" }, { name: "Vektor Labs" }, { name: "Kinetics" }] };
        break;
      case "features":
        defaultContent = { sectionTitle: "Precision Engineered", subtitle: "Built without compromise", tag: "Capabilities", items: [{ title: "Sub-Millimeter Neural Gaze", description: "Zero latency tracking with 240Hz refresh pipelines.", metric: "0.4ms", tag: "Optics" }] };
        break;
      case "stats":
        defaultContent = { sectionTitle: "Proven Performance", subtitle: "Real world operational impact", stats: [{ metric: "99.99%", label: "Uptime SLA", description: "Global edge delivery" }, { metric: "0.2ms", label: "Render Latency", description: "Sub-frame responses" }] };
        break;
      case "benefits":
        defaultContent = { sectionTitle: "Strategic Advantages", subtitle: "Designed to accelerate your workflow", items: [{ title: "Schema-Driven Guarantee", description: "Zero arbitrary HTML or script injection risks." }] };
        break;
      case "showcase":
        defaultContent = { sectionTitle: "Curated Showcase", subtitle: "Recent works deployed globally", items: [{ title: "Monolith Architecture", category: "Spatial CAD", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80", description: "Industrial volumetric modeling." }] };
        break;
      case "gallery":
        defaultContent = { sectionTitle: "Visual Archives", subtitle: "Photo exploration", images: [{ url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80", caption: "Kyoto Monolith Residence" }] };
        break;
      case "video_showcase":
        defaultContent = { sectionTitle: "Motion In Action", subtitle: "Watch the workflow video", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", posterUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1600&q=80", caption: "High-definition interactive showcase." };
        break;
      case "testimonials":
        defaultContent = { sectionTitle: "Distinguished Feedback", subtitle: "Voices of leaders", items: [{ quote: "Forma elevated our brand to an international design icon.", author: "Elena Rostova", role: "Chief Architect", company: "Vektor Labs", metric: "4.8x Acceleration" }] };
        break;
      case "pricing":
        defaultContent = { sectionTitle: "Transparent Investment", subtitle: "Billed monthly", billingInterval: "Monthly", plans: [{ name: "Studio Tier", price: "$49", period: "/mo", description: "Boutique tier", features: ["10 Deployments", "Schema Export"], isHighlighted: true, ctaText: "Select Plan" }] };
        break;
      case "faq":
        defaultContent = { sectionTitle: "Frequently Asked Questions", subtitle: "Everything you need to know", questions: [{ q: "How does 24-hour preview sharing work?", a: "Share links are cryptographically signed and strictly expire 24 hours after creation." }] };
        break;
      case "cta":
        defaultContent = { headline: "Ready to launch your vision?", subheadline: "Instant deployment with schema validation.", buttonText: "Get Started Now", buttonHref: "#", secondaryText: "No credit card required." };
        break;
      case "form":
        defaultContent = {
          sectionTitle: "Get in Touch",
          subtitle: "We're here to answer questions, explore collaborations, and bring your vision to life.",
          badge: "Contact",
          submitButtonText: "Send Message",
          successTitle: "Message Received",
          successMessage: "Thank you for reaching out. We will get back to you within 24 hours.",
          fields: [
            { id: "f-name", name: "fullName", label: "Full Name", type: "text", placeholder: "e.g. Elena Vance", required: true, width: "half" },
            { id: "f-email", name: "email", label: "Email Address", type: "email", placeholder: "elena@company.com", required: true, width: "half" },
            { id: "f-subject", name: "subject", label: "Subject", type: "text", placeholder: "How can we assist you?", required: false, width: "full" },
            { id: "f-message", name: "message", label: "Message", type: "textarea", placeholder: "Tell us about your project or inquiry...", required: true, width: "full" },
          ],
        };
        break;
      case "footer":
        defaultContent = { brand: pageConfig.metadata.title, tagline: "Crafted on Forma Studio", copyright: `© ${new Date().getFullYear()} All rights reserved.`, links: [{ label: "Overview", href: "#" }] };
        break;
      default:
        defaultContent = {};
    }

    const newSection = {
      id: newId,
      type,
      isVisible: true,
      content: defaultContent,
    };

    const newConfig = { ...pageConfig, sections: [...pageConfig.sections, newSection] };
    updateConfigWithHistory(newConfig);
    setActiveSectionId(newId);
    setIsAddSectionOpen(false);
  };

  // Theme & Color overrides
  const updateThemeColor = (colorKey, hexValue) => {
    const updatedTheme = { ...pageConfig.theme, [colorKey]: hexValue };
    const newConfig = { ...pageConfig, theme: updatedTheme };
    updateConfigWithHistory(newConfig);
  };

  const applyPalettePreset = (preset) => {
    const updatedTheme = { ...pageConfig.theme, ...preset };
    const newConfig = { ...pageConfig, theme: updatedTheme };
    updateConfigWithHistory(newConfig);
  };

  const updateMotionPreset = (preset) => {
    const updatedMotion = { ...pageConfig.motion, preset };
    const newConfig = { ...pageConfig, motion: updatedMotion };
    updateConfigWithHistory(newConfig);
  };

  const getViewportWidth = () => {
    switch (viewport) {
      case "mobile":
        return "max-w-[390px]";
      case "tablet":
        return "max-w-[768px]";
      default:
        return "w-full";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-foreground">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
        <span className="font-mono text-sm text-muted">Loading visual studio canvas...</span>
      </div>
    );
  }

  if (error || !pageConfig) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
        <p className="text-muted font-mono text-sm max-w-md mb-6">{error || "Could not retrieve project configuration."}</p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 rounded-full bg-accent text-background font-mono text-xs font-semibold"
        >
          Return to Studio Home
        </button>
      </div>
    );
  }

  const activeSection = pageConfig.sections.find((s) => s.id === activeSectionId) || pageConfig.sections[0];

  if (isPreviewMode) {
    return (
      <div className="relative min-h-screen w-full bg-background select-auto">
        <button
          onClick={() => setIsPreviewMode(false)}
          className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-full bg-surface/90 backdrop-blur-md border border-border text-foreground text-xs font-mono font-medium shadow-2xl hover:bg-white/10 transition-all flex items-center gap-2 cursor-pointer"
        >
          <EyeOff className="w-4 h-4 text-accent" />
          <span>Exit Preview Mode</span>
        </button>
        <PageRenderer pageConfig={pageConfig} />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#FAF7F0] text-[#171717] select-none">
      {/* Top Studio Control Bar */}
      <header className="h-16 px-3 sm:px-6 bg-white border-b border-[#E9E3DA] flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2 rounded-xl text-[#737373] hover:text-[#171717] hover:bg-[#FAF7F0] border border-transparent hover:border-[#E9E3DA] transition-all cursor-pointer"
            title="Return to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5A1F] animate-pulse shrink-0" />
            <h1
              className="font-bold text-xs sm:text-sm text-[#171717] truncate max-w-[140px] sm:max-w-[200px] lg:max-w-[260px]"
              title={pageConfig.metadata.title}
            >
              {pageConfig.metadata.title}
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FAF7F0] text-[#737373] border border-[#E9E3DA] uppercase hidden xl:inline-block shrink-0">
              {pageConfig.metadata.creativeDirection}
            </span>
          </div>

          {/* Undo / Redo */}
          <div className="hidden sm:flex items-center bg-[#FAF7F0] p-1 rounded-xl border border-[#E9E3DA]">
            <button
              onClick={handleUndo}
              disabled={history.length === 0}
              className="p-1.5 rounded-lg text-[#737373] hover:text-[#171717] disabled:opacity-25 transition-colors cursor-pointer"
              title="Undo (Cmd+Z)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleRedo}
              disabled={future.length === 0}
              className="p-1.5 rounded-lg text-[#737373] hover:text-[#171717] disabled:opacity-25 transition-colors cursor-pointer"
              title="Redo (Cmd+Shift+Z)"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Viewport Switcher (Center) */}
        <div className="hidden md:flex items-center bg-[#FAF7F0] p-1 rounded-xl border border-[#E9E3DA]">
          <button
            onClick={() => setViewport("desktop")}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
              viewport === "desktop"
                ? "bg-white text-[#FF5A1F] font-bold shadow-xs border border-[#E9E3DA]"
                : "text-[#737373] hover:text-[#171717]"
            }`}
            title="Desktop Canvas (1280px)"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="text-[11px]">Desktop</span>
          </button>
          <button
            onClick={() => setViewport("tablet")}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
              viewport === "tablet"
                ? "bg-white text-[#FF5A1F] font-bold shadow-xs border border-[#E9E3DA]"
                : "text-[#737373] hover:text-[#171717]"
            }`}
            title="Tablet Canvas (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="text-[11px]">Tablet</span>
          </button>
          <button
            onClick={() => setViewport("mobile")}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
              viewport === "mobile"
                ? "bg-white text-[#FF5A1F] font-bold shadow-xs border border-[#E9E3DA]"
                : "text-[#737373] hover:text-[#171717]"
            }`}
            title="Mobile Canvas (390px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="text-[11px]">Mobile</span>
          </button>

          {/* Panel Visibility Toggles (Desktop) */}
          <div className="flex items-center gap-1 border-l border-[#E9E3DA] pl-1.5 ml-1">
            <button
              onClick={() => setShowLayers(!showLayers)}
              className={`p-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1 cursor-pointer ${
                showLayers
                  ? "bg-white text-[#171717] border border-[#E9E3DA] shadow-xs"
                  : "text-[#737373] hover:text-[#171717]"
              }`}
              title={showLayers ? "Collapse Layers Panel" : "Show Layers Panel"}
            >
              <Layers className="w-3.5 h-3.5 text-[#FF5A1F]" />
              <span className="text-[10px]">Layers</span>
            </button>
            <button
              onClick={() => setShowInspector(!showInspector)}
              className={`p-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1 cursor-pointer ${
                showInspector
                  ? "bg-white text-[#171717] border border-[#E9E3DA] shadow-xs"
                  : "text-[#737373] hover:text-[#171717]"
              }`}
              title={showInspector ? "Collapse Inspector Panel" : "Show Inspector Panel"}
            >
              <Sliders className="w-3.5 h-3.5 text-[#FF5A1F]" />
              <span className="text-[10px]">Inspector</span>
            </button>
          </div>
        </div>

        {/* Right Actions & Save Status */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* AI Refine Button */}
          <button
            onClick={() => setIsRefineOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 text-[#FF5A1F] font-mono text-xs hover:bg-[#FF5A1F]/20 transition-all shadow-xs cursor-pointer"
            title="Iterate with AI Copilot"
          >
            <Wand2 className="w-3.5 h-3.5 animate-pulse" />
            <span className="hidden sm:inline font-semibold">AI Refine</span>
          </button>

          {/* Leads */}
          <button
            onClick={openSubmissionsModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#FAF7F0] text-[#737373] hover:text-[#171717] font-mono text-xs border border-[#E9E3DA] transition-colors cursor-pointer"
            title="View collected lead submissions"
          >
            <Users className="w-3.5 h-3.5 text-[#FF5A1F]" />
            <span>Leads</span>
          </button>

          {/* Preview in New Page */}
          <button
            onClick={handleOpenPreviewInNewTab}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#FAF7F0] text-[#171717] font-mono text-xs border border-[#E9E3DA] transition-all cursor-pointer shadow-xs group"
            title="Open live preview in new browser tab"
          >
            <Eye className="w-3.5 h-3.5 text-[#737373] group-hover:text-[#FF5A1F] transition-colors" />
            <span className="hidden sm:inline font-medium">Preview</span>
            <ExternalLink className="w-3 h-3 text-[#737373] opacity-60 group-hover:opacity-100 transition-opacity" />
          </button>

          {/* Save Status Badge */}
          <div className="text-xs font-mono hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#FAF7F0] border border-[#E9E3DA]">
            {saveStatus === "saving" && (
              <>
                <Loader2 className="w-3.5 h-3.5 text-[#FF5A1F] animate-spin" />
                <span className="text-[#FF5A1F] font-medium text-[11px]">Saving...</span>
              </>
            )}
            {saveStatus === "saved" && (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-medium text-[11px]">Saved</span>
              </>
            )}
            {saveStatus === "unsaved" && (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-amber-600 font-medium text-[11px]">Unsaved</span>
              </>
            )}
            {saveStatus === "error" && (
              <>
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-red-500 font-medium text-[11px]">Save failed</span>
              </>
            )}
          </div>

          {/* Save button */}
          <button
            onClick={() => saveProjectChanges()}
            disabled={saveStatus === "saving"}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white hover:bg-[#FAF7F0] text-[#171717] font-mono text-xs border border-[#E9E3DA] transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            title="Save changes to server"
          >
            {saveStatus === "saving" ? (
              <Loader2 className="w-3.5 h-3.5 text-[#FF5A1F] animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5 text-[#737373]" />
            )}
            <span className="hidden sm:inline">Save</span>
          </button>

          {/* Export ZIP Code */}
          <button
            onClick={handleExportZip}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white hover:bg-[#FAF7F0] text-[#171717] font-mono text-xs border border-[#E9E3DA] transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
            title="Download complete static website code as standalone ZIP package"
          >
            {isExporting ? (
              <Loader2 className="w-3.5 h-3.5 text-[#FF5A1F] animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5 text-[#FF5A1F]" />
            )}
            <span className="hidden lg:inline">Export Code</span>
          </button>

          {/* Share */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl bg-[#FF5A1F] text-white font-mono text-xs font-semibold hover:bg-[#E44A12] transition-all cursor-pointer shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
      </header>

      {/* Main Studio Workstation Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Panel: Sections & Layers (Desktop: collapsible via showLayers; Mobile/Tablet: shown when mobilePanel === "layers") */}
        <aside
          className={`${
            mobilePanel === "layers" ? "flex" : "hidden"
          } ${showLayers ? "lg:flex" : "lg:hidden"} w-full lg:w-60 xl:w-64 bg-white border-r border-[#E9E3DA] flex-col shrink-0 overflow-y-auto pb-24 lg:pb-0 z-20 transition-all`}
        >
          <div className="p-4 border-b border-[#E9E3DA] flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#737373] flex items-center gap-1.5 font-semibold">
              <Layers className="w-3.5 h-3.5 text-[#FF5A1F]" />
              <span>Section Layers</span>
            </span>
            <button
              onClick={() => setIsAddSectionOpen(!isAddSectionOpen)}
              className="p-1.5 rounded-lg bg-[#FF5A1F]/10 hover:bg-[#FF5A1F]/20 text-[#FF5A1F] transition-colors cursor-pointer"
              title="Add Section"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add Section Dropdown */}
          {isAddSectionOpen && (
            <div className="p-3 bg-[#FAF7F0] border-b border-[#E9E3DA] space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#737373] font-semibold block mb-2">
                Select Section Type to Insert:
              </span>
              <div className="max-h-56 overflow-y-auto space-y-1">
                {AVAILABLE_SECTION_TYPES.map((sec) => (
                  <button
                    key={sec.type}
                    onClick={() => addSection(sec.type)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-white text-xs transition-all flex flex-col border border-transparent hover:border-[#E9E3DA] cursor-pointer"
                  >
                    <span className="font-semibold text-[#171717]">{sec.label}</span>
                    <span className="text-[11px] text-[#737373]">{sec.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section List */}
          <div className="flex-1 p-3 space-y-1.5">
            {pageConfig.sections.map((sec, index) => {
              const isSelected = sec.id === activeSectionId;
              return (
                <div
                  key={sec.id}
                  onClick={() => {
                    setActiveSectionId(sec.id);
                    if (typeof window !== "undefined" && window.innerWidth < 1024) {
                      setMobilePanel("canvas");
                    }
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    isSelected
                      ? "bg-[#FF5A1F]/10 border-[#FF5A1F] text-[#FF5A1F] font-semibold shadow-xs"
                      : "bg-[#FAF7F0]/60 border-[#E9E3DA] text-[#171717] hover:border-[#171717]/20 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-[10px] font-mono text-[#737373]">
                      0{index + 1}
                    </span>
                    <span className="text-xs capitalize truncate font-medium">
                      {sec.type.replace("_", " ")}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {/* Move Up/Down */}
                    <button
                      onClick={(e) => moveSection(index, -1, e)}
                      disabled={index === 0}
                      className="p-1 rounded text-[#737373] hover:text-[#171717] disabled:opacity-20 cursor-pointer"
                      title="Move Up"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => moveSection(index, 1, e)}
                      disabled={index === pageConfig.sections.length - 1}
                      className="p-1 rounded text-[#737373] hover:text-[#171717] disabled:opacity-20 cursor-pointer"
                      title="Move Down"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>

                    {/* Visibility */}
                    <button
                      onClick={(e) => toggleSectionVisibility(sec.id, e)}
                      className="p-1 rounded text-[#737373] hover:text-[#171717] cursor-pointer"
                      title={sec.isVisible !== false ? "Hide Section" : "Show Section"}
                    >
                      {sec.isVisible !== false ? (
                        <Eye className="w-3.5 h-3.5" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-[#737373]/40" />
                      )}
                    </button>

                    {/* Duplicate */}
                    <button
                      onClick={(e) => duplicateSection(sec.id, e)}
                      className="p-1 rounded text-[#737373] hover:text-[#171717] cursor-pointer"
                      title="Duplicate Section"
                    >
                      <Copy className="w-3 h-3" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={(e) => deleteSection(sec.id, e)}
                      className="p-1 rounded text-[#737373] hover:text-red-500 cursor-pointer"
                      title="Delete Section"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Center: Live Landing Page Canvas (Desktop: ALWAYS visible with min-w-0 flex-1; Mobile/Tablet: shown when mobilePanel === "canvas") */}
        <div
          className={`${
            mobilePanel === "canvas" ? "flex" : "hidden"
          } lg:flex flex-1 min-w-0 h-full relative`}
        >
          <ResponsivePreviewCanvas
            pageConfig={pageConfig}
            activeSectionId={activeSectionId}
            onSelectSection={(id) => {
              setActiveSectionId(id);
              setActiveTab("content");
            }}
            viewport={viewport}
            setViewport={setViewport}
            showLayers={showLayers}
            setShowLayers={setShowLayers}
            showInspector={showInspector}
            setShowInspector={setShowInspector}
            onOpenPreviewMode={() => setIsPreviewMode(true)}
          />
        </div>

        {/* Right Panel: Contextual Inspector (Desktop: fixed width w-[350px] xl:w-[380px], collapsible via showInspector; Mobile/Tablet: shown when mobilePanel === "inspector") */}
        <aside
          className={`${
            mobilePanel === "inspector" ? "flex" : "hidden"
          } ${showInspector ? "lg:flex" : "lg:hidden"} w-full lg:w-[350px] xl:w-[380px] bg-white border-l border-[#E9E3DA] flex-col shrink-0 overflow-y-auto pb-24 lg:pb-0 z-20 transition-all`}
        >
          {/* Inspector Tabs */}
          <div className="h-12 border-b border-[#E9E3DA] flex items-center shrink-0 px-2 bg-[#FAF7F0]/80">
            <button
              onClick={() => setActiveTab("content")}
              className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                activeTab === "content"
                  ? "border-[#FF5A1F] text-[#FF5A1F] font-bold"
                  : "border-transparent text-[#737373] hover:text-[#171717]"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Content</span>
            </button>

            <button
              onClick={() => setActiveTab("theme")}
              className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                activeTab === "theme"
                  ? "border-[#FF5A1F] text-[#FF5A1F] font-bold"
                  : "border-transparent text-[#737373] hover:text-[#171717]"
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Theme</span>
            </button>

            <button
              onClick={() => setActiveTab("motion")}
              className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                activeTab === "motion"
                  ? "border-[#FF5A1F] text-[#FF5A1F] font-bold"
                  : "border-transparent text-[#737373] hover:text-[#171717]"
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>Motion</span>
            </button>
          </div>

          {/* Tab 1: Section Content Inspector */}
          {activeTab === "content" && activeSection && (
            <div className="p-5 space-y-6 flex-1">
              <div className="pb-3 border-b border-[#E9E3DA] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#737373] uppercase font-semibold">Selected Layer</span>
                  <h3 className="font-bold text-sm text-[#171717] capitalize">
                    {activeSection.type.replace("_", " ")}
                  </h3>
                </div>
                <span className="text-xs font-mono text-[#FF5A1F] px-2 py-0.5 rounded-full bg-[#FF5A1F]/10 border border-[#FF5A1F]/20 font-semibold">
                  {activeSection.id}
                </span>
              </div>

              {/* Dynamic Content Form Fields or FormBuilder */}
              {activeSection.type === "form" ? (
                <FormBuilder
                  content={activeSection.content}
                  onChange={(newContent) => updateActiveSectionAllContent(newContent)}
                />
              ) : (
                <>
                  {/* Layout Variant Selector */}
                  {(activeSection.content.layoutVariant !== undefined ||
                    ["hero", "features", "showcase", "stats"].includes(activeSection.type)) && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase text-[#737373] font-semibold">Layout Composition</label>
                      <select
                        value={activeSection.content.layoutVariant || (activeSection.type === "hero" ? "asymmetric" : "cards")}
                        onChange={(e) => updateActiveSectionContent("layoutVariant", e.target.value)}
                        className="w-full bg-[#FAF7F0] border border-[#E9E3DA] rounded-xl px-3 py-2 text-xs text-[#171717] focus:outline-none focus:border-[#FF5A1F] focus:bg-white cursor-pointer"
                      >
                        {activeSection.type === "hero" && (
                          <>
                            <option value="saas_mockup">SaaS App Mockup</option>
                            <option value="asymmetric">Asymmetric Grid</option>
                            <option value="immersive">Immersive Vignette</option>
                            <option value="centered">Centered Minimal</option>
                            <option value="split">Split Editorial</option>
                          </>
                        )}
                        {activeSection.type === "features" && (
                          <>
                            <option value="workflow">Workflow Pipeline (01, 02, 03)</option>
                            <option value="integrations">Integrations Network</option>
                            <option value="bento">Bento Grid</option>
                            <option value="cards">Feature Cards</option>
                            <option value="grid">Classic Grid</option>
                          </>
                        )}
                        {activeSection.type === "showcase" && (
                          <>
                            <option value="curriculum">Curriculum Syllabus</option>
                            <option value="metrics">Telemetry & Metrics</option>
                            <option value="product">Product Inspection</option>
                            <option value="gallery">Gallery Archive</option>
                            <option value="cards">Standard Cards</option>
                          </>
                        )}
                        {activeSection.type === "stats" && (
                          <>
                            <option value="cards">Stats Cards</option>
                            <option value="minimal">Minimal Grid</option>
                          </>
                        )}
                      </select>
                    </div>
                  )}

                  {activeSection.content.badge !== undefined && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase text-[#737373] font-semibold">Badge / Tag</label>
                      <input
                        type="text"
                        value={activeSection.content.badge || ""}
                        onChange={(e) => updateActiveSectionContent("badge", e.target.value)}
                        className="w-full bg-[#FAF7F0] border border-[#E9E3DA] rounded-xl px-3 py-2 text-xs text-[#171717] focus:outline-none focus:border-[#FF5A1F] focus:bg-white"
                      />
                    </div>
                  )}

                  {activeSection.content.headline !== undefined && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase text-[#737373] font-semibold">Headline</label>
                      <textarea
                        rows={3}
                        value={activeSection.content.headline || ""}
                        onChange={(e) => updateActiveSectionContent("headline", e.target.value)}
                        className="w-full bg-[#FAF7F0] border border-[#E9E3DA] rounded-xl p-3 text-xs text-[#171717] focus:outline-none focus:border-[#FF5A1F] focus:bg-white resize-none leading-relaxed"
                      />
                    </div>
                  )}

                  {activeSection.content.subheadline !== undefined && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase text-[#737373] font-semibold">Subheadline</label>
                      <textarea
                        rows={4}
                        value={activeSection.content.subheadline || ""}
                        onChange={(e) => updateActiveSectionContent("subheadline", e.target.value)}
                        className="w-full bg-[#FAF7F0] border border-[#E9E3DA] rounded-xl p-3 text-xs text-[#171717] focus:outline-none focus:border-[#FF5A1F] focus:bg-white resize-none leading-relaxed"
                      />
                    </div>
                  )}

                  {activeSection.content.sectionTitle !== undefined && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase text-[#737373] font-semibold">Section Title</label>
                      <input
                        type="text"
                        value={activeSection.content.sectionTitle || ""}
                        onChange={(e) => updateActiveSectionContent("sectionTitle", e.target.value)}
                        className="w-full bg-[#FAF7F0] border border-[#E9E3DA] rounded-xl px-3 py-2 text-xs text-[#171717] focus:outline-none focus:border-[#FF5A1F] focus:bg-white"
                      />
                    </div>
                  )}

                  {activeSection.content.subtitle !== undefined && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase text-[#737373] font-semibold">Subtitle</label>
                      <textarea
                        rows={3}
                        value={activeSection.content.subtitle || ""}
                        onChange={(e) => updateActiveSectionContent("subtitle", e.target.value)}
                        className="w-full bg-[#FAF7F0] border border-[#E9E3DA] rounded-xl p-3 text-xs text-[#171717] focus:outline-none focus:border-[#FF5A1F] focus:bg-white resize-none leading-relaxed"
                      />
                    </div>
                  )}

                  {/* Primary CTA */}
                  {activeSection.content.primaryCta !== undefined && (
                    <div className="space-y-3 p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#E9E3DA]">
                      <span className="text-xs font-mono uppercase text-[#737373] font-semibold block">Primary CTA Button</span>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Button Label"
                          value={activeSection.content.primaryCta?.label || ""}
                          onChange={(e) =>
                            updateActiveSectionContent("primaryCta", {
                              ...activeSection.content.primaryCta,
                              label: e.target.value,
                            })
                          }
                          className="w-full bg-white border border-[#E9E3DA] rounded-xl px-3 py-2 text-xs text-[#171717] focus:outline-none focus:border-[#FF5A1F]"
                        />
                        <input
                          type="text"
                          placeholder="Target Link (e.g. #pricing)"
                          value={activeSection.content.primaryCta?.href || ""}
                          onChange={(e) =>
                            updateActiveSectionContent("primaryCta", {
                              ...activeSection.content.primaryCta,
                              href: e.target.value,
                            })
                          }
                          className="w-full bg-white border border-[#E9E3DA] rounded-xl px-3 py-2 text-xs text-[#171717] focus:outline-none focus:border-[#FF5A1F]"
                        />
                      </div>
                    </div>
                  )}

                  {/* Media Uploader integration if section supports media */}
                  {activeSection.content.media !== undefined && (
                    <MediaUploader
                      currentUrl={activeSection.content.media?.url}
                      onMediaSelect={(newUrl) =>
                        updateActiveSectionContent("media", {
                          ...activeSection.content.media,
                          url: newUrl,
                        })
                      }
                    />
                  )}
                </>
              )}
            </div>
          )}

          {/* Tab 2: Theme & Palette Inspector */}
          {activeTab === "theme" && (
            <div className="p-5 space-y-6 flex-1">
              <div>
                <span className="text-[10px] font-mono text-[#737373] uppercase font-semibold">Design System Tokens</span>
                <h3 className="font-bold text-sm text-[#171717]">Theme Palette</h3>
              </div>

              {/* Palette Presets */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase text-[#737373] font-semibold">Palette Presets</label>
                <div className="grid grid-cols-1 gap-2">
                  {PALETTE_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => applyPalettePreset(p)}
                      className="p-3 rounded-xl border border-[#E9E3DA] hover:border-[#FF5A1F]/50 bg-[#FAF7F0] hover:bg-white flex items-center justify-between text-xs transition-all cursor-pointer shadow-xs"
                    >
                      <span className="font-medium text-[#171717]">{p.name}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs" style={{ backgroundColor: p.bg }} />
                        <span className="w-3.5 h-3.5 rounded-full shadow-xs" style={{ backgroundColor: p.accent }} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Granular Color Hex Pickers */}
              <div className="space-y-4 pt-4 border-t border-[#E9E3DA]">
                <label className="text-xs font-mono uppercase text-[#737373] font-semibold">Token Customization</label>

                {[
                  { key: "bg", label: "Background" },
                  { key: "text", label: "Text / Foreground" },
                  { key: "accent", label: "Accent / Glow" },
                  { key: "surface", label: "Surface Cards" },
                  { key: "border", label: "Borders" },
                  { key: "muted", label: "Muted Text" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between gap-3">
                    <span className="text-xs font-mono text-[#737373]">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={pageConfig.theme[item.key] || "#000000"}
                        onChange={(e) => updateThemeColor(item.key, e.target.value)}
                        className="w-7 h-7 rounded-lg border border-[#E9E3DA] bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={pageConfig.theme[item.key] || ""}
                        onChange={(e) => updateThemeColor(item.key, e.target.value)}
                        className="w-22 bg-[#FAF7F0] border border-[#E9E3DA] rounded-lg px-2 py-1 text-xs font-mono text-[#171717] text-center focus:outline-none focus:border-[#FF5A1F] focus:bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Motion & Choreography Inspector */}
          {activeTab === "motion" && (
            <div className="p-5 space-y-6 flex-1">
              <div>
                <span className="text-[10px] font-mono text-[#737373] uppercase font-semibold">Animation Engine</span>
                <h3 className="font-bold text-sm text-[#171717]">Motion Choreography</h3>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-mono uppercase text-[#737373] font-semibold">Preset Selection</label>
                {[
                  { id: "subtle", name: "Subtle Transitions", desc: "Smooth, restrained opacity reveals (200ms) - Instant text readability" },
                  { id: "cinematic", name: "Cinematic Depth", desc: "Refined staggered entrance with guaranteed reveal fallbacks (300ms)" },
                  { id: "experimental", name: "Experimental Kinetic", desc: "High-velocity snappy spring dynamics and transforms" },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => updateMotionPreset(m.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      pageConfig.motion?.preset === m.id
                        ? "bg-[#FF5A1F]/10 border-[#FF5A1F] text-[#FF5A1F] font-semibold shadow-xs"
                        : "bg-[#FAF7F0] border-[#E9E3DA] text-[#171717] hover:bg-white hover:border-[#171717]/20"
                    }`}
                  >
                    <div className="font-semibold text-xs mb-1">{m.name}</div>
                    <div className="text-[11px] text-[#737373] leading-relaxed">{m.desc}</div>
                  </button>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#E9E3DA] text-xs font-mono text-[#737373] leading-relaxed">
                <strong className="text-[#171717] block mb-1">Accessibility Contract:</strong>
                All motion choreography automatically respects user system motion preferences and ensures text is always 100% visible immediately.
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Mobile / Tablet Bottom Navigation Bar (Hidden on Desktop >= lg) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-[#E9E3DA] z-40 flex items-center justify-around px-2 shadow-lg">
        <button
          onClick={() => setMobilePanel("layers")}
          className={`flex-1 py-2 px-1 flex flex-col items-center justify-center gap-1 text-xs font-mono transition-colors cursor-pointer ${
            mobilePanel === "layers"
              ? "text-[#FF5A1F] font-bold"
              : "text-[#737373] hover:text-[#171717]"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span className="text-[11px]">Layers ({pageConfig.sections.length})</span>
        </button>

        <button
          onClick={() => setMobilePanel("canvas")}
          className={`flex-1 py-2 px-1 flex flex-col items-center justify-center gap-1 text-xs font-mono transition-colors cursor-pointer ${
            mobilePanel === "canvas"
              ? "text-[#FF5A1F] font-bold"
              : "text-[#737373] hover:text-[#171717]"
          }`}
        >
          <Eye className="w-4 h-4" />
          <span className="text-[11px]">Canvas</span>
        </button>

        <button
          onClick={() => setMobilePanel("inspector")}
          className={`flex-1 py-2 px-1 flex flex-col items-center justify-center gap-1 text-xs font-mono transition-colors cursor-pointer ${
            mobilePanel === "inspector"
              ? "text-[#FF5A1F] font-bold"
              : "text-[#737373] hover:text-[#171717]"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span className="text-[11px]">Inspector</span>
        </button>
      </nav>

      {/* Share Modal Dialog */}
      <ShareModal
        projectId={projectId}
        editToken={editToken}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* AI Refine Dialog */}
      {isRefineOpen && (
        <div className="fixed inset-0 z-50 bg-[#171717]/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-[#E9E3DA] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-[#171717]">
            <button
              onClick={() => setIsRefineOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-xl text-[#737373] hover:text-[#171717] hover:bg-[#FAF7F0] border border-transparent hover:border-[#E9E3DA] transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5A1F]/10 border border-[#FF5A1F]/20 text-[#FF5A1F] text-xs font-mono mb-2 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Autonomous Design Copilot</span>
              </div>
              <h3 className="text-xl font-bold text-[#171717]">
                Iterate & Refine with AI
              </h3>
              <p className="text-xs text-[#737373] mt-1 leading-relaxed">
                Describe the design modification you want to make. Forma will update relevant sections and styles while strictly preserving your content.
              </p>
            </div>

            {/* Quick Prompt Chips */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase text-[#737373] font-semibold block">
                Quick Architectural Refinements:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Forma Milk & Hot Orange Palette",
                  "Minimalist Swiss White Theme",
                  "Warm Cream & Terracotta Style",
                  "Make Hero More Punchy & Asymmetric",
                  "Add Product Demo Video Showcase",
                  "Reduce Animation Intensity",
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      setRefinePrompt(chip);
                      handleRefineSubmit(chip);
                    }}
                    disabled={isRefining}
                    className="px-2.5 py-1 rounded-xl bg-[#FAF7F0] hover:bg-white border border-[#E9E3DA] text-[11px] font-mono text-[#737373] hover:text-[#171717] transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Natural language input */}
            <div className="space-y-3">
              <textarea
                rows={3}
                value={refinePrompt}
                onChange={(e) => setRefinePrompt(e.target.value)}
                placeholder="e.g. Change the color palette to warm orange and cream, make the pricing cards more prominent..."
                className="w-full p-3.5 text-xs bg-[#FAF7F0] border border-[#E9E3DA] rounded-2xl text-[#171717] placeholder:text-[#737373]/60 focus:outline-none focus:border-[#FF5A1F] focus:bg-white resize-none leading-relaxed"
              />

              {refineError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2 font-mono">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{refineError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsRefineOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E9E3DA] text-xs font-mono text-[#737373] hover:text-[#171717] hover:bg-[#FAF7F0] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleRefineSubmit()}
                  disabled={isRefining || !refinePrompt.trim()}
                  className="px-5 py-2 rounded-xl bg-[#FF5A1F] text-white text-xs font-mono font-semibold hover:bg-[#E44A12] transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {isRefining ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Refining Design...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      <span>Apply Refinement</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submissions Leads Modal */}
      {isSubmissionsOpen && (
        <div className="fixed inset-0 z-50 bg-[#171717]/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-[#E9E3DA] rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[85vh] flex flex-col text-[#171717]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E9E3DA]">
              <div>
                <span className="text-xs font-mono text-[#FF5A1F] uppercase tracking-wider block font-semibold">
                  Lead Capture Telemetry
                </span>
                <h3 className="text-lg font-bold text-[#171717] mt-0.5">
                  Form Submissions for &quot;{project?.title || "Page"}&quot;
                </h3>
              </div>
              <button
                onClick={() => setIsSubmissionsOpen(false)}
                className="p-2 rounded-xl text-[#737373] hover:text-[#171717] hover:bg-[#FAF7F0] border border-transparent hover:border-[#E9E3DA] transition-all cursor-pointer"
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
                  No submissions captured yet. Publish your page or test the form section to collect inquiries.
                </div>
              ) : (
                submissionsList.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#E9E3DA] text-xs space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between text-[11px] text-[#737373] font-mono border-b border-[#E9E3DA] pb-2">
                      <span>{new Date(sub.createdAt).toLocaleString()}</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#FF5A1F]/10 border border-[#FF5A1F]/20 text-[#FF5A1F] font-semibold">
                        {sub.formId || "lead-form"}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#171717]">
                      {Object.entries(sub.data || {}).map(([key, value]) => (
                        <div key={key} className="break-words">
                          <strong className="text-[#171717] capitalize font-medium">{key}: </strong>
                          <span className="font-mono text-[#737373]">{value?.toString() || "—"}</span>
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
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF5A1F] text-white text-xs font-mono font-semibold hover:bg-[#E44A12] transition-colors shadow-sm cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                )}
                <button
                  onClick={() => setIsSubmissionsOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E9E3DA] hover:bg-[#FAF7F0] text-[#737373] hover:text-[#171717] text-xs font-mono cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
