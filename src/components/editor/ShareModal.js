"use client";

import { useState } from "react";
import { Share2, Copy, Check, X, Clock, ShieldCheck, Loader2, ExternalLink } from "lucide-react";

export default function ShareModal({ projectId, editToken, isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [shareData, setShareData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateShare = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-edit-token": editToken || "",
        },
        body: JSON.stringify({ projectId, editToken }),
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
    <div className="fixed inset-0 z-50 bg-[#171717]/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white border border-[#E9E3DA] p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-[#171717]">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-[#737373] hover:text-[#171717] hover:bg-[#FAF7F0] border border-transparent hover:border-[#E9E3DA] transition-colors cursor-pointer"
          aria-label="Close share dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-[#FF5A1F]/10 border border-[#FF5A1F]/20 text-[#FF5A1F]">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#171717]">
              Share Public Preview
            </h3>
            <p className="text-xs font-mono text-[#737373]">
              Ephemeral 24-hour read-only preview
            </p>
          </div>
        </div>

        {!shareData ? (
          <div className="space-y-6">
            <p className="text-sm text-[#737373] leading-relaxed">
              Generate a cryptographically secured public preview link. Visitors can view the live animated landing page without having access to your editor or modification controls.
            </p>

            <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#E9E3DA] space-y-2 text-xs font-mono text-[#737373]">
              <div className="flex items-center gap-2 text-[#171717] font-semibold">
                <Clock className="w-4 h-4 text-[#FF5A1F]" />
                <span>Strict 24-Hour Expiration</span>
              </div>
              <p>
                The link strictly expires 24 hours after generation on the server. Expired links immediately return an expired status.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-mono text-red-600">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerateShare}
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#FF5A1F] text-white font-mono text-sm font-semibold hover:bg-[#E44A12] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Token...</span>
                </>
              ) : (
                <>
                  <span>Create 24-Hour Share Link</span>
                  <Share2 className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs font-mono text-emerald-700">
              <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-600" />
              <span>Public link active // Server expiration set to 24h</span>
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
                  className="flex-1 bg-[#FAF7F0] border border-[#E9E3DA] rounded-xl px-4 py-3 text-xs font-mono text-[#171717] focus:outline-none"
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

            <div className="flex items-center justify-between text-xs font-mono text-[#737373] pt-2 border-t border-[#E9E3DA]">
              <span>Expires: {new Date(shareData.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} tomorrow</span>
              <a
                href={shareData.shareUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[#FF5A1F] hover:underline font-semibold"
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
