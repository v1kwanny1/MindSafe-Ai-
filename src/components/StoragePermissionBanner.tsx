import React, { useState, useEffect } from "react";
import { ShieldCheck, Cookie, CheckCircle2, X } from "lucide-react";

export default function StoragePermissionBanner() {
  const [needsPermission, setNeedsPermission] = useState<boolean>(false);
  const [granted, setGranted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    async function checkPermissionStatus() {
      if (typeof window === "undefined" || typeof document === "undefined") return;

      // Check if running in an iframe
      const isInIframe = window.self !== window.top;

      if ("hasStorageAccess" in document) {
        try {
          const hasAccess = await document.hasStorageAccess();
          if (!hasAccess && isInIframe) {
            setNeedsPermission(true);
          }
        } catch (e) {
          console.warn("[StoragePermission] Error checking storage access status:", e);
        }
      }
    }

    checkPermissionStatus();
  }, []);

  const handleGrantPermission = async () => {
    setLoading(true);
    try {
      if ("requestStorageAccess" in document) {
        await document.requestStorageAccess();
        setGranted(true);
        setNeedsPermission(false);
        console.log("[StoragePermission] Security cookie & storage access successfully granted.");
      } else {
        // Fallback acknowledge
        setGranted(true);
        setNeedsPermission(false);
      }
    } catch (err) {
      console.warn("[StoragePermission] Request storage access declined or unsupported:", err);
      // Even if user or browser rejects it, set granted so banner doesn't keep pestering
      setGranted(true);
      setNeedsPermission(false);
    } finally {
      setLoading(false);
    }
  };

  if (!needsPermission || dismissed) return null;

  return (
    <div className="w-full bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border-b border-amber-400/30 text-amber-200 text-xs py-2 px-4 flex items-center justify-between gap-3 flex-wrap select-none shadow-lg z-50">
      <div className="flex items-center gap-2 font-medium">
        <Cookie className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
        <span>
          <strong>Security Cookie Permission Notice:</strong> Grant third-party cookie & storage access for seamless chat, auth, and calendar persistence in embedded previews.
        </span>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {granted ? (
          <span className="flex items-center gap-1 text-emerald-400 font-bold text-[11px] font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Granted!</span>
          </span>
        ) : (
          <button
            type="button"
            onClick={handleGrantPermission}
            disabled={loading}
            className="px-3 py-1 rounded-lg bg-amber-400 text-slate-950 font-bold text-[11px] hover:bg-amber-300 transition-all cursor-pointer font-mono shadow border border-amber-400/50 flex items-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{loading ? "Granting..." : "Grant Security Cookie Permission"}</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="p-1 rounded-md text-amber-300/70 hover:text-amber-100 hover:bg-white/10 transition-all cursor-pointer"
          title="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
