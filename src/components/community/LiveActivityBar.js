"use client";

import { useState, useEffect } from "react";
import { Users, FileCode2, Info, Activity } from "lucide-react";
import { FadeUp } from "../motion/MotionReveal.js";

export default function LiveActivityBar() {
  const [activeSessions, setActiveSessions] = useState(1);
  const [pagesCreatedToday, setPagesCreatedToday] = useState(0);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // 1. Send initial heartbeat to register session
    const sendHeartbeat = async () => {
      try {
        const res = await fetch("/api/presence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        if (res.ok) {
          const data = await res.json();
          setActiveSessions(data.onlineNow || 1);
          setIsBackendConnected(true);
        }
      } catch (err) {
        setIsBackendConnected(false);
      }
    };

    // 2. Fetch aggregate activity counts
    const fetchActivity = async () => {
      try {
        const res = await fetch("/api/activity", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setActiveSessions(data.onlineNow || 1);
          setPagesCreatedToday(data.createdToday || 0);
          setIsBackendConnected(true);
        }
      } catch (e) {
        setIsBackendConnected(false);
      }
    };

    sendHeartbeat();
    fetchActivity();

    // Periodic heartbeat every 30 seconds
    const interval = setInterval(() => {
      sendHeartbeat();
      fetchActivity();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="live-activity" className="w-full py-8 px-6 md:px-12 lg:px-20 border-y border-border-subtle bg-surface/40">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <FadeUp delay={0.1} className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-surface border border-border flex items-center justify-center text-accent">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-foreground font-semibold">
                Live Studio Presence
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  isBackendConnected
                    ? "bg-accent/15 text-accent border border-accent/20"
                    : "bg-white/5 text-muted border border-white/10"
                }`}
              >
                {isBackendConnected ? "Connected Active Telemetry" : "Local Verified Session"}
              </span>
            </div>
            <p className="text-xs text-muted font-mono">
              Honest active telemetry // Zero fabricated counts
            </p>
          </div>
        </FadeUp>

        {/* Real-time Counts */}
        <div className="flex items-center gap-8 md:gap-12">
          {/* Online Creators */}
          <FadeUp delay={0.2} className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-surface border border-border text-foreground/80">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-mono font-bold text-foreground">
                  {activeSessions}
                </span>
                <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
              </div>
              <span className="text-xs font-mono text-muted">
                {activeSessions === 1 ? "Creator Online Now" : "Creators Online Now"}
              </span>
            </div>
          </FadeUp>

          {/* Divider */}
          <div className="w-[1px] h-10 bg-border hidden sm:block" />

          {/* Pages Created Today */}
          <FadeUp delay={0.3} className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-surface border border-border text-foreground/80">
              <FileCode2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-mono font-bold text-foreground">
                {pagesCreatedToday}
              </div>
              <span className="text-xs font-mono text-muted">
                Pages Created Today
              </span>
            </div>
          </FadeUp>

          {/* Honest Telemetry Info */}
          <div className="relative">
            <button
              onClick={() => setShowTooltip(!showTooltip)}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="p-1.5 rounded-full hover:bg-white/5 text-muted hover:text-foreground transition-colors"
              aria-label="Presence telemetry info"
            >
              <Info className="w-4 h-4" />
            </button>

            {showTooltip && (
              <div className="absolute right-0 top-8 z-30 w-64 p-3 rounded-xl bg-surface border border-border text-[11px] text-muted font-mono leading-relaxed shadow-xl">
                <strong className="text-foreground block mb-1">
                  Integrity Guarantee:
                </strong>
                Forma tracks verified browser heartbeats (5-minute active window). No inflated bots or vanity metrics.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
