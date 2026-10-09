import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Clock, 
  Target, 
  Bell, 
  BellOff, 
  Sparkles, 
  Zap, 
  Check, 
  AlertCircle, 
  Play, 
  Info, 
  RotateCcw,
  ShieldCheck,
  Send
} from "lucide-react";

interface DailyFocusHourProps {
  onTriggerPrompt?: (promptText: string) => void;
  speak?: (text: string) => void;
}

interface NotificationLog {
  id: string;
  timestamp: string;
  timeString: string;
  message: string;
  type: "inactivity_trigger" | "test_trigger";
}

const PRESET_WINDOWS = [
  { label: "Morning Grounding", start: "09:00", end: "10:00" },
  { label: "Midday Power Hour", start: "13:00", end: "14:00" },
  { label: "Afternoon Focus", start: "15:00", end: "16:00" },
  { label: "Evening Wind Down", start: "20:00", end: "21:00" },
];

export default function DailyFocusHour({ onTriggerPrompt, speak }: DailyFocusHourProps) {
  // Config States
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("mindsafe_focus_hour_enabled");
    return saved !== null ? saved === "true" : true;
  });

  const [startTime, setStartTime] = useState<string>(() => {
    return localStorage.getItem("mindsafe_focus_hour_start") || "14:00";
  });

  const [endTime, setEndTime] = useState<string>(() => {
    return localStorage.getItem("mindsafe_focus_hour_end") || "15:00";
  });

  const [inactivityMins, setInactivityMins] = useState<number>(() => {
    const saved = localStorage.getItem("mindsafe_focus_inactivity_mins");
    return saved ? parseInt(saved, 10) : 15;
  });

  const [customMessage, setCustomMessage] = useState<string>(() => {
    return localStorage.getItem("mindsafe_focus_custom_msg") || 
      "🎯 Focus Hour Nudge: You've been inactive during your dedicated window. Take a 2-minute resilience pause!";
  });

  // Runtime States
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [isCurrentlyInWindow, setIsCurrentlyInWindow] = useState<boolean>(false);
  const [activeNudge, setActiveNudge] = useState<string | null>(null);
  const [logs, setLogs] = useState<NotificationLog[]>(() => {
    try {
      const saved = localStorage.getItem("mindsafe_focus_notification_logs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const lastTriggeredDateRef = useRef<string | null>(null);

  // Check notification permission
  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Save config to localStorage
  useEffect(() => {
    localStorage.setItem("mindsafe_focus_hour_enabled", String(isEnabled));
    localStorage.setItem("mindsafe_focus_hour_start", startTime);
    localStorage.setItem("mindsafe_focus_hour_end", endTime);
    localStorage.setItem("mindsafe_focus_inactivity_mins", String(inactivityMins));
    localStorage.setItem("mindsafe_focus_custom_msg", customMessage);
  }, [isEnabled, startTime, endTime, inactivityMins, customMessage]);

  // Track user activity across window
  useEffect(() => {
    const updateActivity = () => {
      setLastActivity(Date.now());
    };

    window.addEventListener("mousemove", updateActivity);
    window.addEventListener("keydown", updateActivity);
    window.addEventListener("click", updateActivity);
    window.addEventListener("touchstart", updateActivity);
    window.addEventListener("scroll", updateActivity);

    return () => {
      window.removeEventListener("mousemove", updateActivity);
      window.removeEventListener("keydown", updateActivity);
      window.removeEventListener("click", updateActivity);
      window.removeEventListener("touchstart", updateActivity);
      window.removeEventListener("scroll", updateActivity);
    };
  }, []);

  // Request Notification Permission
  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const res = await Notification.requestPermission();
      setPermission(res);
    }
  };

  // Helper to parse HH:mm into minutes from midnight
  const parseMins = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  // Trigger Notification Function
  const triggerNotification = (msgText: string, type: "inactivity_trigger" | "test_trigger") => {
    setActiveNudge(msgText);
    
    if (speak) {
      speak("Focus Hour Notification: Time for a resilience check-in.");
    }

    // Web Browser Native Notification
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification("MindSafe AI — Daily Focus Nudge", {
          body: msgText,
          icon: "/favicon.ico",
        });
      } catch (err) {
        console.error("Browser notification failed:", err);
      }
    }

    // Add to history log
    const newLog: NotificationLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleDateString(),
      timeString: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      message: msgText,
      type
    };

    setLogs((prev) => {
      const updated = [newLog, ...prev].slice(0, 10);
      localStorage.setItem("mindsafe_focus_notification_logs", JSON.stringify(updated));
      return updated;
    });
  };

  // Main monitoring interval (checks every 10 seconds)
  useEffect(() => {
    if (!isEnabled) {
      setIsCurrentlyInWindow(false);
      return;
    }

    const checkFocusWindowAndInactivity = () => {
      const now = new Date();
      const currentMins = now.getHours() * 60 + now.getMinutes();
      const startMins = parseMins(startTime);
      const endMins = parseMins(endTime);

      const inWindow = currentMins >= startMins && currentMins < endMins;
      setIsCurrentlyInWindow(inWindow);

      if (inWindow) {
        const todayStr = now.toISOString().slice(0, 10);
        // Calculate inactivity duration in minutes
        const inactiveMs = Date.now() - lastActivity;
        const inactiveMins = inactiveMs / (1000 * 60);

        // Check if user has exceeded inactivity threshold during the focus window
        if (inactiveMins >= inactivityMins && lastTriggeredDateRef.current !== todayStr) {
          lastTriggeredDateRef.current = todayStr;
          triggerNotification(customMessage, "inactivity_trigger");
        }
      }
    };

    checkFocusWindowAndInactivity();
    const interval = setInterval(checkFocusWindowAndInactivity, 10000);
    return () => clearInterval(interval);
  }, [isEnabled, startTime, endTime, inactivityMins, lastActivity, customMessage]);

  const handleTestTrigger = () => {
    triggerNotification(customMessage, "test_trigger");
  };

  const handleApplyPreset = (start: string, end: string) => {
    setStartTime(start);
    setEndTime(end);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const clearLogs = () => {
    setLogs([]);
    localStorage.removeItem("mindsafe_focus_notification_logs");
  };

  return (
    <div className="bg-gradient-to-br from-slate-900/90 to-sky-950/40 border border-sky-500/20 rounded-[24px] p-6 backdrop-blur-md relative overflow-hidden text-left shadow-xl" id="dailyFocusHourSection">
      {/* Background glow element */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-100 font-sans tracking-wide">
                Daily Focus Hour & Smart Notifications
              </h3>
              <span className="text-[10px] font-mono uppercase bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full border border-sky-400/30">
                Active Nudge
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-sans">
              Set a dedicated daily window. MindSafe AI triggers smart notifications if you become inactive.
            </p>
          </div>
        </div>

        {/* Master Toggle Switch */}
        <button
          type="button"
          onClick={() => setIsEnabled(!isEnabled)}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all border ${
            isEnabled 
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30" 
              : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
          }`}
        >
          {isEnabled ? <Bell className="w-3.5 h-3.5 text-emerald-400" /> : <BellOff className="w-3.5 h-3.5" />}
          <span>{isEnabled ? "Focus Notifications Active" : "Notifications Disabled"}</span>
        </button>
      </div>

      {/* Real-time Status Banner */}
      <div className="mb-5">
        {isEnabled ? (
          <div className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
            isCurrentlyInWindow
              ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
              : "bg-sky-500/10 border-sky-500/20 text-sky-200"
          }`}>
            <div className="flex items-center gap-2.5 text-xs font-sans">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isCurrentlyInWindow ? "bg-amber-400" : "bg-sky-400"
                }`} />
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isCurrentlyInWindow ? "bg-amber-500" : "bg-sky-500"
                }`} />
              </span>
              <span>
                {isCurrentlyInWindow 
                  ? `Focus Window Active (${startTime} - ${endTime}). Monitoring inactivity threshold (${inactivityMins}m).` 
                  : `Focus Hour scheduled today from ${startTime} to ${endTime}.`}
              </span>
            </div>

            <button
              type="button"
              onClick={handleTestTrigger}
              className="px-2.5 py-1 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-[11px] font-semibold rounded-xl border border-sky-400/30 transition-all shrink-0 cursor-pointer flex items-center gap-1"
              title="Test triggering smart notification right now"
            >
              <Zap className="w-3 h-3 text-sky-400" />
              <span>Test Nudge</span>
            </button>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-slate-400 text-xs flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Smart focus hour notifications are currently turned off. Turn on the switch above to activate your daily window.</span>
          </div>
        )}
      </div>

      {/* Browser Notification Permission Banner (if default) */}
      {permission !== "granted" && (
        <div className="mb-5 p-3.5 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Enable system desktop notifications to receive Focus Hour alerts even when browsing other tabs.</span>
          </div>
          <button
            type="button"
            onClick={requestNotificationPermission}
            className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition-all shrink-0 cursor-pointer shadow-sm"
          >
            Allow Notifications
          </button>
        </div>
      )}

      {/* Active Nudge Toast Banner (In-App Nudge Triggered) */}
      <AnimatePresence>
        {activeNudge && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-sky-500/20 via-indigo-500/20 to-purple-500/20 border border-sky-400/40 text-slate-100 shadow-xl relative overflow-hidden"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-sky-500/30 rounded-xl text-sky-300 mt-0.5">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider font-mono">
                    MindSafe Focus Hour Alert
                  </h4>
                  <p className="text-sm font-sans text-slate-200 mt-1 leading-relaxed">
                    "{activeNudge}"
                  </p>
                  
                  {onTriggerPrompt && (
                    <button
                      type="button"
                      onClick={() => {
                        onTriggerPrompt("I disengaged during my Focus Hour window. Help me ground myself and regain focus.");
                        setActiveNudge(null);
                      }}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md"
                    >
                      <Send className="w-3 h-3" />
                      <span>Start Grounding Session</span>
                    </button>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveNudge(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Time & Inactivity Configuration Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        {/* Start Time */}
        <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-white/10 flex flex-col gap-1.5">
          <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>Window Start</span>
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="bg-slate-800/90 text-slate-100 text-sm font-mono px-3 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-sky-400/50 cursor-pointer w-full"
          />
        </div>

        {/* End Time */}
        <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-white/10 flex flex-col gap-1.5">
          <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>Window End</span>
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="bg-slate-800/90 text-slate-100 text-sm font-mono px-3 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-sky-400/50 cursor-pointer w-full"
          />
        </div>

        {/* Inactivity Threshold */}
        <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-white/10 flex flex-col gap-1.5">
          <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-amber-400" />
            <span>Inactivity Threshold</span>
          </label>
          <select
            value={inactivityMins}
            onChange={(e) => setInactivityMins(Number(e.target.value))}
            className="bg-slate-800/90 text-slate-100 text-sm font-sans px-3 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-amber-400/50 cursor-pointer w-full"
          >
            <option value={5}>5 minutes inactive</option>
            <option value={10}>10 minutes inactive</option>
            <option value={15}>15 minutes inactive (Recommended)</option>
            <option value={30}>30 minutes inactive</option>
            <option value={45}>45 minutes inactive</option>
          </select>
        </div>
      </div>

      {/* Quick Window Presets */}
      <div className="mb-5">
        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-2 block">
          Quick Preset Focus Windows
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESET_WINDOWS.map((p) => {
            const isSelected = startTime === p.start && endTime === p.end;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => handleApplyPreset(p.start, p.end)}
                className={`text-xs px-3 py-1.5 rounded-xl border font-sans transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-sky-500/20 text-sky-300 border-sky-400/50 font-semibold shadow-xs"
                    : "bg-slate-800/50 text-slate-300 border-white/5 hover:border-white/20 hover:bg-slate-800"
                }`}
              >
                <span>{p.label}</span>
                <span className="text-[10px] font-mono opacity-75">({p.start}-{p.end})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Nudge Prompt Message Input */}
      <div className="mb-5 bg-slate-900/40 p-4 rounded-2xl border border-white/5">
        <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 block">
          Custom Smart Notification Message
        </label>
        <input
          type="text"
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          placeholder="e.g. Focus Hour Alert: Take a breather and check in..."
          className="w-full bg-slate-800/90 text-slate-100 text-xs px-3.5 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-sky-400/50 font-sans"
        />
        {savedSuccess && (
          <span className="text-[11px] text-emerald-400 font-sans mt-1.5 block">
            ✓ Settings saved successfully!
          </span>
        )}
      </div>

      {/* Trigger History Log */}
      <div className="border-t border-white/10 pt-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Focus Nudge Log ({logs.length})</span>
          </span>
          {logs.length > 0 && (
            <button
              type="button"
              onClick={clearLogs}
              className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            >
              Clear Log
            </button>
          )}
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-4 text-xs text-slate-500 italic bg-black/10 rounded-xl border border-dashed border-white/5">
            No focus hour notifications triggered yet. Click "Test Nudge" or let your focus window run automatically.
          </div>
        ) : (
          <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-2.5 rounded-xl bg-slate-800/40 border border-white/5 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className={`p-1 rounded-md text-[10px] font-mono ${
                    log.type === "test_trigger"
                      ? "bg-purple-500/20 text-purple-300"
                      : "bg-amber-500/20 text-amber-300"
                  }`}>
                    {log.type === "test_trigger" ? "TEST" : "AUTO"}
                  </span>
                  <span className="text-slate-300 truncate font-sans text-xs">
                    "{log.message}"
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 shrink-0">
                  {log.timestamp} {log.timeString}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
