"use client";

import { useState, useEffect } from "react";
import {
  Share2,
  Copy,
  Check,
  X,
  Clock,
  ShieldCheck,
  Loader2,
  ExternalLink,
  User,
  Mail,
  Phone,
  Briefcase,
  Sparkles,
} from "lucide-react";

export default function ShareModal({ projectId, editToken, isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [shareData, setShareData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    purpose: "",
  });

  // Try to load cached user profile from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("forma_user_profile");
        if (saved) {
          const parsed = JSON.parse(saved);
          setFormData((prev) => ({
            ...prev,
            name: parsed.name || "",
            email: parsed.email || "",
            phone: parsed.phone || "",
            purpose: parsed.purpose || "",
          }));
        }
      } catch (e) {
        // ignore
      }
    }
  }, [isOpen]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const handleGenerateShare = async (e) => {
    if (e) e.preventDefault();

    if (!formData.name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Save to localStorage for convenience
      try {
        localStorage.setItem(
          "forma_user_profile",
          JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            purpose: formData.purpose.trim(),
          })
        );
      } catch (e) {
        // ignore
      }

      const res = await fetch("/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-edit-token": editToken || "",
        },
        body: JSON.stringify({
          projectId,
          editToken,
          userData: {
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            purpose: formData.purpose.trim(),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate share link");
      }

      setShareData(data);
    } catch (err) {
      console.error("Share error:", err);
      setError(err.message || "Failed to create share link");
    } finally {
      setLoading(false);
    }
  };

  const getFullShareUrl = () => {
    if (!shareData?.shareUrl) return "";
    if (typeof window !== "undefined") {
      return `${window.location.origin}${shareData.shareUrl}`;
    }
    return shareData.shareUrl;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getFullShareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Clipboard copy failed:", e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#171717]/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-white border border-[#E9E3DA] p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-[#171717] my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-[#737373] hover:text-[#171717] hover:bg-[#FAF7F0] border border-transparent hover:border-[#E9E3DA] transition-colors cursor-pointer"
          aria-label="Close share dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-2xl bg-[#FF5A1F]/10 border border-[#FF5A1F]/20 text-[#FF5A1F]">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#171717] font-display">
              {shareData ? "Preview Link Ready" : "Generate Share Link"}
            </h3>
            <p className="text-xs font-mono text-[#737373]">
              Ephemeral 24-hour read-only public preview
            </p>
          </div>
        </div>

        {!shareData ? (
          <form onSubmit={handleGenerateShare} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#E9E3DA] flex items-start gap-2.5 text-xs text-[#737373]">
              <Sparkles className="w-4 h-4 text-[#FF5A1F] shrink-0 mt-0.5" />
              <p>
                Fill in your details below to generate a secure, read-only 24-hour preview link for sharing with clients, colleagues, or social media.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-mono text-red-600">
                {error}
              </div>
            )}

            {/* Name Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#171717] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#FF5A1F]" />
                <span>Your Name <span className="text-red-500">*</span></span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-[#E9E3DA] rounded-xl text-sm text-[#171717] placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#FF5A1F] focus:bg-white transition-all"
              />
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#171717] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#FF5A1F]" />
                <span>Work / Personal Email <span className="text-red-500">*</span></span>
              </label>
              <input
                type="email"
                required
                placeholder="e.g. rahul@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-[#E9E3DA] rounded-xl text-sm text-[#171717] placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#FF5A1F] focus:bg-white transition-all"
              />
            </div>

            {/* Phone / WhatsApp */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#171717] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#737373]" />
                <span>Phone / WhatsApp <span className="text-[#A3A3A3] font-normal text-[11px]">(Optional)</span></span>
              </label>
              <input
                type="tel"
                placeholder="e.g. +91 98765 43210"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-[#E9E3DA] rounded-xl text-sm text-[#171717] placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#FF5A1F] focus:bg-white transition-all"
              />
            </div>

            {/* Purpose / Project Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#171717] flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#737373]" />
                <span>Purpose / Organization <span className="text-[#A3A3A3] font-normal text-[11px]">(Optional)</span></span>
              </label>
              <input
                type="text"
                placeholder="e.g. Client Demo, Portfolio, Startup Launch"
                value={formData.purpose}
                onChange={(e) => handleInputChange("purpose", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-[#E9E3DA] rounded-xl text-sm text-[#171717] placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#FF5A1F] focus:bg-white transition-all"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#FF5A1F] text-white font-mono text-sm font-semibold hover:bg-[#E44A12] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Details & Generating Link...</span>
                  </>
                ) : (
                  <>
                    <span>Submit & Generate Share Link</span>
                    <Share2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs font-mono text-emerald-700">
              <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-600" />
              <span>Public link generated successfully! Server expiration: 24h</span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-[#737373] font-semibold">
                Shareable Preview URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={getFullShareUrl()}
                  className="flex-1 bg-[#FAF7F0] border border-[#E9E3DA] rounded-xl px-4 py-3 text-xs font-mono text-[#171717] focus:outline-none select-all"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-3 rounded-xl bg-[#FF5A1F] text-white font-mono text-xs font-semibold hover:bg-[#E44A12] transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF7F0] border border-[#E9E3DA] space-y-1.5 text-xs text-[#737373] font-mono">
              <div className="flex items-center justify-between">
                <span>Shared by:</span>
                <span className="text-[#171717] font-medium">{formData.name} ({formData.email})</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Expires at:</span>
                <span className="text-[#FF5A1F] font-medium">
                  {new Date(shareData.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} tomorrow
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#E9E3DA]">
              <button
                onClick={() => setShareData(null)}
                className="text-xs font-mono text-[#737373] hover:text-[#171717] underline underline-offset-2 cursor-pointer"
              >
                Generate with different details
              </button>

              <a
                href={shareData.shareUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#171717] text-white text-xs font-mono hover:bg-[#FF5A1F] transition-colors font-semibold"
              >
                <span>Open Preview</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
