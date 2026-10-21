"use client";

import { useEffect } from "react";

export default function PresenceHeartbeat() {
  useEffect(() => {
    let timer = null;

    const ping = async () => {
      // Don't ping if tab is in the background to prevent false live active counts
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return;
      }

      try {
        await fetch("/api/presence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
      } catch (e) {
        // ignore network error
      }
    };

    // Immediate ping on page load
    ping();

    // Ping every 25 seconds while tab is active
    timer = setInterval(ping, 25000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        ping();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (timer) clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
}
