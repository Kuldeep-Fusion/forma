"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import PageRenderer from "../renderer/PageRenderer.js";
import {
  Monitor,
  Tablet,
  Smartphone,
  RotateCw,
  Maximize2,
  Minimize2,
  ExternalLink,
  Eye,
  Sliders,
  Layers,
  Sparkles,
  Check,
  ZoomIn,
  ZoomOut,
  RefreshCw,
} from "lucide-react";

/**
 * Isolated Iframe component that creates a true window context.
 * Media queries (@media min-width / max-width) evaluate against the iframe's
 * dimensions, enabling 100% authentic mobile and tablet responsive layouts.
 */
function IsolatedIframe({ children, title = "Forma Canvas Preview", className = "", style = {} }) {
  const iframeRef = useRef(null);
  const [mountNode, setMountNode] = useState(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let isMounted = true;

    const setupIframe = () => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) return;

        // Write foundational HTML document with viewport meta
        if (!doc.getElementById("forma-iframe-root")) {
          doc.open();
          doc.write(`
            <!DOCTYPE html>
            <html class="scroll-smooth">
              <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>${title}</title>
                <style>
                  *, ::before, ::after { box-sizing: border-box; }
                  html, body {
                    margin: 0;
                    padding: 0;
                    width: 100%;
                    min-height: 100%;
                    overflow-x: hidden;
                    background-color: transparent;
                    -webkit-font-smoothing: antialiased;
                  }
                  /* Sleek scrollbar */
                  ::-webkit-scrollbar { width: 6px; height: 6px; }
                  ::-webkit-scrollbar-thumb { background: rgba(120, 120, 120, 0.25); border-radius: 9999px; }
                  ::-webkit-scrollbar-thumb:hover { background: rgba(120, 120, 120, 0.45); }
                  ::-webkit-scrollbar-track { background: transparent; }
                </style>
              </head>
              <body>
                <div id="forma-iframe-root"></div>
              </body>
            </html>
          `);
          doc.close();
        }

        // Copy all parent stylesheets and link tags into the iframe head
        const copyStyles = () => {
          if (!doc || !doc.head) return;
          const parentHead = document.head;
          const iframeHead = doc.head;

          // Remove previously copied styles to prevent duplicate cascades
          iframeHead.querySelectorAll("[data-forma-injected]").forEach((el) => el.remove());

          parentHead.querySelectorAll('link[rel="stylesheet"], style').forEach((styleEl) => {
            const clone = styleEl.cloneNode(true);
            clone.setAttribute("data-forma-injected", "true");
            iframeHead.appendChild(clone);
          });

          // Sync font classes & custom CSS properties from parent documentElement
          if (document.documentElement && doc.documentElement) {
            doc.documentElement.className = document.documentElement.className;
            doc.documentElement.style.cssText = document.documentElement.style.cssText;
          }
          if (document.body && doc.body) {
            doc.body.className = document.body.className;
          }
        };

        copyStyles();

        // Observe Next.js style injections during development and sync
        const observer = new MutationObserver(() => {
          copyStyles();
        });
        observer.observe(document.head, { childList: true, subtree: true });

        const root = doc.getElementById("forma-iframe-root");
        if (isMounted) setMountNode(root);

        return () => {
          observer.disconnect();
        };
      } catch (err) {
        console.error("IsolatedIframe initialization error:", err);
      }
    };

    const cleanup = setupIframe();
    return () => {
      isMounted = false;
      if (typeof cleanup === "function") cleanup();
    };
  }, [title]);

  return (
    <iframe
      ref={iframeRef}
      title={title}
      className={className}
      style={{ border: "none", width: "100%", height: "100%", ...style }}
    >
      {mountNode && createPortal(children, mountNode)}
    </iframe>
  );
}

export default function ResponsivePreviewCanvas({
  pageConfig,
  activeSectionId,
  onSelectSection,
  viewport,
  setViewport,
  showLayers,
  setShowLayers,
  showInspector,
  setShowInspector,
  onOpenPreviewMode,
}) {
  // Canvas configuration
  const [orientation, setOrientation] = useState("portrait"); // portrait | landscape
  const [zoom, setZoom] = useState("fit"); // "fit" | 1 | 0.75 | 0.5
  const [desktopMode, setDesktopMode] = useState("browser_frame"); // "browser_frame" | "fluid"
  const canvasContainerRef = useRef(null);
  const [calculatedScale, setCalculatedScale] = useState(1);

  // Auto-calculate "fit" scale based on available container space
  useEffect(() => {
    function computeFitScale() {
      if (!canvasContainerRef.current) return;
      const containerWidth = canvasContainerRef.current.clientWidth - 48; // padding
      const containerHeight = canvasContainerRef.current.clientHeight - 80;

      if (viewport === "desktop") {
        if (desktopMode === "fluid") {
          setCalculatedScale(1);
          return;
        }
        // Base desktop frame is 1280px wide
        const scaleW = containerWidth / 1280;
        setCalculatedScale(zoom === "fit" ? Math.min(1, Math.max(0.45, scaleW)) : Number(zoom));
      } else if (viewport === "tablet") {
        const targetW = orientation === "portrait" ? 768 : 1024;
        const targetH = orientation === "portrait" ? 1024 : 768;
        const scaleW = containerWidth / (targetW + 32);
        const scaleH = containerHeight / (targetH + 32);
        const autoFit = Math.min(1, Math.min(scaleW, scaleH));
        setCalculatedScale(zoom === "fit" ? Math.max(0.45, autoFit) : Number(zoom));
      } else if (viewport === "mobile") {
        const targetW = orientation === "portrait" ? 390 : 844;
        const targetH = orientation === "portrait" ? 844 : 390;
        const scaleW = containerWidth / (targetW + 24);
        const scaleH = containerHeight / (targetH + 24);
        const autoFit = Math.min(1, Math.min(scaleW, scaleH));
        setCalculatedScale(zoom === "fit" ? Math.max(0.65, autoFit) : Number(zoom));
      }
    }

    computeFitScale();
    window.addEventListener("resize", computeFitScale);
    return () => window.removeEventListener("resize", computeFitScale);
  }, [viewport, orientation, zoom, desktopMode, showLayers, showInspector]);

  // Is Zen Mode active (both panels hidden)?
  const isZenMode = !showLayers && !showInspector;

  const toggleZenMode = () => {
    if (isZenMode) {
      setShowLayers(true);
      setShowInspector(true);
    } else {
      setShowLayers(false);
      setShowInspector(false);
    }
  };

  const activeSection = pageConfig?.sections?.find((s) => s.id === activeSectionId);

  return (
    <div className="flex-1 min-w-0 h-full flex flex-col bg-[#FAF7F0] relative overflow-hidden select-none">
      {/* =========================================================================
          TOP CANVAS CONTROLS & TOOLBAR
      ========================================================================= */}
      <div className="h-12 border-b border-[#E9E3DA] bg-white px-3 sm:px-6 flex items-center justify-between shrink-0 z-10 shadow-2xs">
        {/* Left: Frame / Orientation / Dimension Mode */}
        <div className="flex items-center gap-2">
          {/* Active Canvas Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#FAF7F0] border border-[#E9E3DA] text-[11px] font-mono text-[#737373]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="font-semibold text-[#171717] uppercase tracking-wider text-[10px]">Canvas</span>
            <span className="text-[#A3A3A3]">/</span>
            <span>
              {viewport === "desktop"
                ? "1280px Desktop"
                : viewport === "tablet"
                ? `${orientation === "portrait" ? "768 × 1024" : "1024 × 768"} Tablet`
                : `${orientation === "portrait" ? "390 × 844" : "844 × 390"} Mobile`}
            </span>
          </div>

          {/* Orientation switch for Mobile & Tablet */}
          {viewport !== "desktop" && (
            <button
              onClick={() => setOrientation(orientation === "portrait" ? "landscape" : "portrait")}
              className="px-2.5 py-1 rounded-xl bg-[#FAF7F0] hover:bg-white text-[#737373] hover:text-[#171717] border border-[#E9E3DA] transition-all cursor-pointer flex items-center gap-1.5 text-xs font-mono shadow-2xs"
              title={`Switch to ${orientation === "portrait" ? "Landscape" : "Portrait"}`}
            >
              <RotateCw className="w-3.5 h-3.5 text-[#FF5A1F]" />
              <span className="capitalize text-[11px]">{orientation}</span>
            </button>
          )}

          {/* Desktop Frame vs Fluid Mode Switcher */}
          {viewport === "desktop" && (
            <div className="flex items-center bg-[#FAF7F0] p-0.5 rounded-lg border border-[#E9E3DA] text-[10px] font-mono">
              <button
                onClick={() => setDesktopMode("browser_frame")}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  desktopMode === "browser_frame"
                    ? "bg-white text-[#FF5A1F] font-bold shadow-xs border border-[#E9E3DA]"
                    : "text-[#737373] hover:text-[#171717]"
                }`}
                title="View inside standard 1280px browser frame"
              >
                1280px Frame
              </button>
              <button
                onClick={() => setDesktopMode("fluid")}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  desktopMode === "fluid"
                    ? "bg-white text-[#FF5A1F] font-bold shadow-xs border border-[#E9E3DA]"
                    : "text-[#737373] hover:text-[#171717]"
                }`}
                title="Full width fluid canvas"
              >
                Fluid (100%)
              </button>
            </div>
          )}
        </div>

        {/* Center: Selected Section Badge */}
        {activeSection && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F0] border border-[#E9E3DA] text-[11px] font-mono text-[#737373]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F] animate-pulse" />
            <span className="text-[#A3A3A3]">Section:</span>
            <span className="font-semibold text-[#171717] capitalize">
              {activeSection.type.replace("_", " ")}
            </span>
          </div>
        )}

        {/* Right: Zoom Scale & Zen Mode Toggles */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Zoom / Scale Selector */}
          <div className="flex items-center bg-[#FAF7F0] p-1 rounded-xl border border-[#E9E3DA] text-[11px] font-mono">
            <button
              onClick={() => setZoom("fit")}
              className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                zoom === "fit"
                  ? "bg-white text-[#FF5A1F] font-bold shadow-xs"
                  : "text-[#737373] hover:text-[#171717]"
              }`}
              title="Automatically fit canvas within view"
            >
              Fit
            </button>
            <button
              onClick={() => setZoom(1)}
              className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                zoom === 1
                  ? "bg-white text-[#FF5A1F] font-bold shadow-xs"
                  : "text-[#737373] hover:text-[#171717]"
              }`}
              title="100% Actual Scale"
            >
              100%
            </button>
            <button
              onClick={() => setZoom(0.75)}
              className={`hidden sm:inline-block px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                zoom === 0.75
                  ? "bg-white text-[#FF5A1F] font-bold shadow-xs"
                  : "text-[#737373] hover:text-[#171717]"
              }`}
              title="75% Scale Overview"
            >
              75%
            </button>
            <button
              onClick={() => setZoom(0.5)}
              className={`hidden md:inline-block px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                zoom === 0.5
                  ? "bg-white text-[#FF5A1F] font-bold shadow-xs"
                  : "text-[#737373] hover:text-[#171717]"
              }`}
              title="50% Bird's Eye View"
            >
              50%
            </button>
          </div>

          {/* Zen Mode / Expand Canvas */}
          <button
            onClick={toggleZenMode}
            className={`hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
              isZenMode
                ? "bg-[#FF5A1F] text-white border-[#FF5A1F] font-bold shadow-sm"
                : "bg-white hover:bg-[#FAF7F0] text-[#737373] hover:text-[#171717] border-[#E9E3DA]"
            }`}
            title={isZenMode ? "Restore Sidebars (Cmd+\\)" : "Maximize Canvas (Hide Sidebars)"}
          >
            {isZenMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden xl:inline">{isZenMode ? "Restore" : "Expand"}</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          MAIN WORKSPACE CANVAS VIEWPORT
      ========================================================================= */}
      <main
        ref={canvasContainerRef}
        className="flex-1 w-full h-full overflow-auto p-4 sm:p-8 flex flex-col items-center bg-[#FAF7F0] bg-[radial-gradient(#E2DDD3_1px,transparent_1px)] [background-size:20px_20px] relative"
      >
        {/* =======================================================================
            CASE 1: MOBILE VIEWPORT (True 390px Iframe with iPhone Frame)
        ======================================================================= */}
        {viewport === "mobile" && (
          <div
            className="transition-transform duration-300 origin-top my-auto shrink-0"
            style={{
              transform: `scale(${calculatedScale})`,
              transformOrigin: "top center",
              marginBottom: calculatedScale < 1 ? `-${Math.round((1 - calculatedScale) * 880)}px` : "2rem",
            }}
          >
            {/* iPhone Realistic Hardware Bezel */}
            <div
              className={`relative bg-[#1C1C1E] p-3 rounded-[52px] shadow-2xl border-4 border-[#2C2C2E] ring-1 ring-black/30 transition-all ${
                orientation === "portrait" ? "w-[414px]" : "w-[868px]"
              }`}
            >
              {/* Dynamic Island Pill */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-40 flex items-center justify-between px-3 pointer-events-none">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1A1A1A] border border-white/10" />
                <span className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse" />
              </div>

              {/* Status Bar */}
              <div className="w-full h-8 bg-transparent flex items-center justify-between px-6 text-white/80 text-[11px] font-mono font-semibold select-none pt-1">
                <span>9:41</span>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span>5G</span>
                  <div className="w-4 h-2.5 rounded-xs border border-white/80 p-0.5 flex items-center">
                    <div className="w-full h-full bg-white rounded-2xs" />
                  </div>
                </div>
              </div>

              {/* True 390px Device Screen Window */}
              <div
                className={`bg-white rounded-[40px] overflow-hidden shadow-inner ${
                  orientation === "portrait" ? "w-[390px] h-[820px]" : "w-[844px] h-[390px]"
                }`}
              >
                <IsolatedIframe title="Mobile Preview (390px)">
                  <PageRenderer
                    pageConfig={pageConfig}
                    activeSectionId={activeSectionId}
                    onSelectSection={onSelectSection}
                  />
                </IsolatedIframe>
              </div>

              {/* Bottom Home Indicator Bar */}
              <div className="w-full h-5 flex items-center justify-center">
                <div className="w-32 h-1 bg-white/40 rounded-full" />
              </div>
            </div>
          </div>
        )}

        {/* =======================================================================
            CASE 2: TABLET VIEWPORT (True 768px Iframe with iPad Frame)
        ======================================================================= */}
        {viewport === "tablet" && (
          <div
            className="transition-transform duration-300 origin-top my-auto shrink-0"
            style={{
              transform: `scale(${calculatedScale})`,
              transformOrigin: "top center",
              marginBottom: calculatedScale < 1 ? `-${Math.round((1 - calculatedScale) * 1050)}px` : "2rem",
            }}
          >
            {/* iPad Realistic Hardware Bezel */}
            <div
              className={`relative bg-[#1C1C1E] p-4 rounded-[40px] shadow-2xl border-4 border-[#2C2C2E] ring-1 ring-black/30 transition-all ${
                orientation === "portrait" ? "w-[800px]" : "w-[1056px]"
              }`}
            >
              {/* Front Camera Dot */}
              <div className="w-full h-4 flex items-center justify-center pb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-black border border-white/20" />
              </div>

              {/* True 768px Tablet Screen Window */}
              <div
                className={`bg-white rounded-[28px] overflow-hidden shadow-inner ${
                  orientation === "portrait" ? "w-[768px] h-[1000px]" : "w-[1024px] h-[740px]"
                }`}
              >
                <IsolatedIframe title="Tablet Preview (768px)">
                  <PageRenderer
                    pageConfig={pageConfig}
                    activeSectionId={activeSectionId}
                    onSelectSection={onSelectSection}
                  />
                </IsolatedIframe>
              </div>

              {/* Bottom Home Bar */}
              <div className="w-full h-4 flex items-center justify-center pt-2">
                <div className="w-36 h-1 bg-white/30 rounded-full" />
              </div>
            </div>
          </div>
        )}

        {/* =======================================================================
            CASE 3: DESKTOP VIEWPORT
            (Supports 1280px Browser Frame with Zoom OR Fluid 100% Canvas)
        ======================================================================= */}
        {viewport === "desktop" && desktopMode === "browser_frame" && (
          <div
            className="transition-transform duration-300 origin-top shrink-0 w-[1280px]"
            style={{
              transform: calculatedScale !== 1 ? `scale(${calculatedScale})` : undefined,
              transformOrigin: "top center",
              marginBottom: calculatedScale < 1 ? `-${Math.round((1 - calculatedScale) * 900)}px` : "2rem",
            }}
          >
            {/* macOS Browser Mockup Frame */}
            <div className="w-full rounded-2xl overflow-hidden border border-[#E9E3DA] shadow-2xl bg-white">
              {/* macOS Window Titlebar */}
              <div className="h-10 bg-[#FAF7F0] border-b border-[#E9E3DA] px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
                  <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
                  <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
                </div>

                {/* Simulated URL Pill */}
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-[#E9E3DA] text-[11px] font-mono text-[#737373] max-w-sm truncate">
                  <span className="text-emerald-600 font-bold">https://</span>
                  <span className="text-[#171717] font-medium truncate">
                    preview.forma.ai/{pageConfig?.metadata?.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "project"}
                  </span>
                </div>

                <div className="text-[10px] font-mono text-[#737373] hidden sm:block">
                  1280 × 800 • Desktop
                </div>
              </div>

              {/* Desktop Render Content with Isolated Iframe for True 1280px Media Queries */}
              <div className="w-[1280px] h-[860px] overflow-hidden bg-white">
                <IsolatedIframe title="Desktop Browser Preview (1280px)">
                  <PageRenderer
                    pageConfig={pageConfig}
                    activeSectionId={activeSectionId}
                    onSelectSection={onSelectSection}
                  />
                </IsolatedIframe>
              </div>
            </div>
          </div>
        )}

        {/* =======================================================================
            CASE 4: FLUID DESKTOP (Full width natural canvas)
        ======================================================================= */}
        {viewport === "desktop" && desktopMode === "fluid" && (
          <div className="w-full max-w-7xl rounded-2xl overflow-hidden border border-[#E9E3DA] shadow-xl bg-white my-2">
            <PageRenderer
              pageConfig={pageConfig}
              activeSectionId={activeSectionId}
              onSelectSection={onSelectSection}
            />
          </div>
        )}
      </main>

      {/* Floating Zen Mode Quick-Exit Pill (Visible only when both sidebars are collapsed) */}
      {isZenMode && (
        <button
          onClick={toggleZenMode}
          className="fixed bottom-6 right-6 z-50 px-4 py-2 rounded-full bg-white/95 backdrop-blur-md border border-[#E9E3DA] text-[#171717] text-xs font-mono font-semibold shadow-xl hover:border-[#FF5A1F] hover:text-[#FF5A1F] transition-all flex items-center gap-2 cursor-pointer"
        >
          <Minimize2 className="w-4 h-4 text-[#FF5A1F]" />
          <span>Exit Zen Mode (Restore Panels)</span>
        </button>
      )}
    </div>
  );
}
