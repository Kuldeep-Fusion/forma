"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageRenderer from "../../../components/renderer/PageRenderer.js";
import { Clock, ShieldAlert, Sparkles, Copy, Check, ArrowRight, Loader2 } from "lucide-react";

export default function PublicPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token;

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("loading"); // loading | active | expired | not_found
  const [project, setProject] = useState(null);
  const [expiredAt, setExpiredAt] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchPreview() {
      if (!token) return;
      setLoading(true);

      try {
        const res = await fetch(`/api/preview/${token}`);
        const data = await res.json();

        if (res.status === 410 || data.status === "expired") {
          setStatus("expired");
          setExpiredAt(data.expiredAt);
        } else if (res.status === 404 || data.status === "not_found") {
          setStatus("not_found");
        } else if (res.ok && data.project) {
          setStatus("active");
          setProject(data.project);
        } else {
          setStatus("not_found");
        }
      } catch (err) {
        console.error("Preview fetch error:", err);
        setStatus("not_found");
      } finally {
        setLoading(false);
      }
    }

    fetchPreview();
  }, [token]);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Copy error:", e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0D0C] flex flex-col items-center justify-center gap-4 text-[#F5F5F0]">
        <Loader2 className="w-8 h-8 text-[#C5FF65] animate-spin" />
        <span className="font-mono text-sm text-neutral-400">
          Decrypting verified ephemeral preview...
        </span>
      </div>
    );
  }

  // Expired Screen
  if (status === "expired") {
    return (
      <div className="min-h-screen bg-[#0B0D0C] text-[#F5F5F0] flex flex-col items-center justify-center p-6 text-center studio-grid">
        <div className="max-w-md p-8 rounded-3xl bg-[#121514] border border-[#232825] shadow-2xl relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-red-950/40 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto mb-6">
            <Clock className="w-7 h-7" />
          </div>

          <span className="inline-block text-xs font-mono uppercase tracking-widest text-red-400 mb-2">
            Link Lifecycle Expired
          </span>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
            Preview Link Has Expired
          </h1>

          <p className="text-sm text-neutral-400 leading-relaxed mb-8">
            Forma public preview links are ephemeral and strictly expire 24 hours after generation to protect prototype confidentiality.
            {expiredAt && (
              <span className="block mt-2 font-mono text-xs text-neutral-500">
                Expired: {new Date(expiredAt).toLocaleString()}
              </span>
            )}
          </p>

          <button
            onClick={() => router.push("/")}
            className="w-full py-3.5 px-6 rounded-full bg-[#C5FF65] text-[#0B0D0C] font-mono text-xs font-semibold hover:bg-[#B3F54F] transition-all flex items-center justify-center gap-2"
          >
            <span>Create A New Landing Page</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Not Found Screen
  if (status === "not_found" || !project) {
    return (
      <div className="min-h-screen bg-[#0B0D0C] text-[#F5F5F0] flex flex-col items-center justify-center p-6 text-center studio-grid">
        <div className="max-w-md p-8 rounded-3xl bg-[#121514] border border-[#232825] shadow-2xl">
          <ShieldAlert className="w-12 h-12 text-neutral-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Preview Not Found</h1>
          <p className="text-sm text-neutral-400 mb-6 font-mono">
            This share token is invalid or has been revoked by the creator.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 rounded-full bg-[#C5FF65] text-[#0B0D0C] font-mono text-xs font-semibold"
          >
            Return to Forma Studio
          </button>
        </div>
      </div>
    );
  }

  // Active Read-Only Preview
  return (
    <div className="relative min-h-screen bg-background">
      {/* Floating Read-Only Banner */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 p-2 pl-4 rounded-full bg-[#121514]/90 backdrop-blur-xl border border-[#232825] shadow-2xl">
        <div className="flex items-center gap-2 pr-2">
          <span className="w-2 h-2 rounded-full bg-[#C5FF65] animate-ping" />
          <span className="text-xs font-mono text-[#F5F5F0] font-medium hidden sm:inline">
            Forma 24h Public Preview
          </span>
        </div>

        <button
          onClick={copyUrl}
          className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-xs font-mono text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors border border-white/5"
          title="Copy Public Preview Link"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#C5FF65]" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Share Link</span>
            </>
          )}
        </button>

        <button
          onClick={() => router.push("/")}
          className="px-3.5 py-1.5 rounded-full bg-[#C5FF65] text-[#0B0D0C] text-xs font-mono font-semibold hover:bg-[#B3F54F] transition-all"
        >
          Build Yours
        </button>
      </div>

      {/* Render the Landing Page */}
      <PageRenderer pageConfig={project.pageConfig} />
    </div>
  );
}
