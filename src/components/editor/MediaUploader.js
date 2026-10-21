"use client";

import { useState, useRef } from "react";
import { Upload, Link as LinkIcon, Check, Loader2, AlertCircle, Image as ImageIcon } from "lucide-react";

export default function MediaUploader({ currentUrl, onMediaSelect, label = "Section Media" }) {
  const [urlInput, setUrlInput] = useState(currentUrl || "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("upload"); // "upload" | "url" | "library"
  const [libraryAssets, setLibraryAssets] = useState([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const fileInputRef = useRef(null);

  const fetchLibraryAssets = async () => {
    try {
      setLoadingLibrary(true);
      const res = await fetch("/api/assets");
      if (res.ok) {
        const data = await res.json();
        setLibraryAssets(data.assets || []);
      }
    } catch (e) {
      console.error("Asset library error:", e);
    } finally {
      setLoadingLibrary(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setUrlInput(data.url);
      onMediaSelect(data.url);
      fetchLibraryAssets();
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    onMediaSelect(urlInput.trim());
  };

  return (
    <div className="space-y-3 p-4 rounded-xl bg-surface border border-border">
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono uppercase tracking-wider text-muted flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-accent" />
          <span>{label}</span>
        </label>
        <div className="flex items-center gap-1 bg-background p-0.5 rounded-lg border border-border">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`px-2 py-0.5 text-[10px] font-mono rounded ${
              mode === "upload" ? "bg-white/10 text-accent font-semibold" : "text-muted hover:text-foreground"
            }`}
          >
            Upload
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("library");
              fetchLibraryAssets();
            }}
            className={`px-2 py-0.5 text-[10px] font-mono rounded ${
              mode === "library" ? "bg-white/10 text-accent font-semibold" : "text-muted hover:text-foreground"
            }`}
          >
            Library
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`px-2 py-0.5 text-[10px] font-mono rounded ${
              mode === "url" ? "bg-white/10 text-accent font-semibold" : "text-muted hover:text-foreground"
            }`}
          >
            URL
          </button>
        </div>
      </div>

      {mode === "upload" && (
        <div className="space-y-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,video/mp4"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full py-6 px-4 rounded-xl border border-dashed border-border hover:border-accent/60 bg-background/50 hover:bg-white/5 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 text-accent animate-spin" />
                <span className="text-xs font-mono text-muted">Uploading media...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 text-accent" />
                <span className="text-xs font-mono text-foreground font-medium">
                  Click to upload media file
                </span>
                <span className="text-[10px] font-mono text-muted">
                  Supports JPEG, PNG, WEBP, SVG, MP4 (Max 5MB)
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {mode === "library" && (
        <div className="space-y-2">
          {loadingLibrary ? (
            <div className="py-6 flex items-center justify-center text-muted font-mono text-xs gap-2">
              <Loader2 className="w-4 h-4 text-accent animate-spin" />
              <span>Loading media library...</span>
            </div>
          ) : libraryAssets.length === 0 ? (
            <div className="py-6 text-center text-muted font-mono text-xs border border-dashed border-border rounded-xl">
              No previously uploaded assets found. Upload an image to start your library.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 border border-border rounded-xl bg-background">
              {libraryAssets.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => {
                    setUrlInput(asset.url);
                    onMediaSelect(asset.url);
                  }}
                  className={`relative aspect-video rounded-lg overflow-hidden border transition-all ${
                    currentUrl === asset.url
                      ? "border-accent ring-2 ring-accent/30"
                      : "border-border hover:border-white/40"
                  }`}
                  title={asset.filename}
                >
                  <img
                    src={asset.url}
                    alt={asset.filename || "Library asset"}
                    className="w-full h-full object-cover"
                  />
                  {currentUrl === asset.url && (
                    <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-accent drop-shadow" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {mode === "url" && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted/60 focus:outline-none focus:border-accent"
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              className="px-3 py-2 rounded-lg bg-accent text-background text-xs font-mono font-semibold hover:bg-accent-hover transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-xs font-mono text-red-400 pt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Current Preview */}
      {currentUrl && (
        <div className="relative aspect-video rounded-lg overflow-hidden border border-border mt-2 bg-background">
          <img
            src={currentUrl}
            alt="Media thumbnail"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md text-[9px] font-mono text-muted">
            Active Media
          </div>
        </div>
      )}
    </div>
  );
}
