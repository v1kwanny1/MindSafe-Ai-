import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Bell, 
  BellOff, 
  Flame, 
  Calendar, 
  Sparkles, 
  Check, 
  Play, 
  Info, 
  Trash2, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  FileText 
} from "lucide-react";

interface DailyCheckInProps {
  onTriggerPrompt: (promptText: string) => void;
  isTtsEnabled: boolean;
  speak: (text: string) => void;
}

interface CheckInRecord {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: number;
  mood: string; // emoji
  label: string; // description
  note?: string; // optional reflection text
}

const MOODS = [
  { emoji: "🦁", label: "Courageous", color: "hover:bg-amber-500/20 hover:border-amber-400 text-amber-300" },
  { emoji: "😌", label: "Peaceful", color: "hover:bg-emerald-500/20 hover:border-emerald-400 text-emerald-300" },
  { emoji: "🌪️", label: "Overwhelmed", color: "hover:bg-sky-500/20 hover:border-sky-400 text-sky-300" },
  { emoji: "🔋", label: "Exhausted", color: "hover:bg-rose-500/20 hover:border-rose-400 text-rose-300" },
  { emoji: "🧱", label: "Resilient", color: "hover:bg-purple-500/20 hover:border-purple-400 text-purple-300" },
];

export default function DailyCheckIn({ onTriggerPrompt, isTtsEnabled, speak }: DailyCheckInProps) {
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("mindsafe_checkin_enabled");
    return saved !== null ? saved === "true" : true;
  });

  const [checkInTime, setCheckInTime] = useState<string>(() => {
    return localStorage.getItem("mindsafe_checkin_time") || "09:00";
  });

  const [streak, setStreak] = useState<number>(() => {
    return parseInt(localStorage.getItem("mindsafe_checkin_streak") || "0", 10);
  });

  // Load and migrate check-in history to support IDs, notes, and timestamps
  const [history, setHistory] = useState<CheckInRecord[]>(() => {
    try {
      const saved = localStorage.getItem("mindsafe_checkin_history");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((item: any, idx: number) => {
            if (!item.id) {
              const dateObj = new Date(item.date || Date.now());
              return {
                id: `legacy-${idx}-${dateObj.getTime()}`,
                date: item.date || "2026-07-17",
                timestamp: dateObj.getTime(),
                mood: item.mood || "😌",
                label: item.label || "Peaceful",
                note: item.note || ""
              };
            }
            return item;
          });
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  const [simulatedReminder, setSimulatedReminder] = useState<boolean>(false);
  const [selectedMoodToday, setSelectedMoodToday] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<string>("default");

  // Expanded Mood Log interactive states
  const [pendingMood, setPendingMood] = useState<{ emoji: string; label: string } | null>(null);
  const [reflectionText, setReflectionText] = useState<string>("");
  const [isFeedExpanded, setIsFeedExpanded] = useState<boolean>(false);

  const lastCheckedDateRef = useRef<string | null>(null);

  // Initialize and check permission
  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem("mindsafe_checkin_enabled", String(isEnabled));
  }, [isEnabled]);

  useEffect(() => {
    localStorage.setItem("mindsafe_checkin_time", checkInTime);
  }, [checkInTime]);

  useEffect(() => {
    localStorage.setItem("mindsafe_checkin_streak", String(streak));
  }, [streak]);

  useEffect(() => {
    localStorage.setItem("mindsafe_checkin_history", JSON.stringify(history));
  }, [history]);

  // Check if already checked in today (gets the latest checked-in state today)
  const getTodayString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  useEffect(() => {
    const today = getTodayString();
    const todayRecords = history.filter((h) => h.date === today);
    if (todayRecords.length > 0) {
      // Sort desc by timestamp to fetch the latest
      const latest = [...todayRecords].sort((a, b) => b.timestamp - a.timestamp)[0];
      setSelectedMoodToday(latest.mood);
    } else {
      setSelectedMoodToday(null);
    }
  }, [history]);

  // Background checker for daily time trigger
  useEffect(() => {
    if (!isEnabled) return;

    const interval = setInterval(() => {
      const now = new Date();
      const currentHHMM = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const todayDate = getTodayString();

      // If matches check-in time, and hasn't checked in today yet, and we haven't triggered in the current minute
      if (currentHHMM === checkInTime && !selectedMoodToday && lastCheckedDateRef.current !== todayDate) {
        lastCheckedDateRef.current = todayDate;
        triggerReminder();
      }
    }, 15000); // Check every 15 seconds

    return () => clearInterval(interval);
  }, [isEnabled, checkInTime, selectedMoodToday]);

  // Synthetic soothing audio chime using AudioContext
  const playChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc1.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.4); // G5

      osc2.type = "sine";
      osc2.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      osc2.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.4); // C6

      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.8);
      osc2.stop(ctx.currentTime + 0.8);
    } catch (e) {
      console.error("Audio chime failed", e);
    }
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  const triggerReminder = () => {
    playChime();
    setSimulatedReminder(true);

    const speakText = "Time for your MindSafe check-in. How are you feeling right now?";
    if (isTtsEnabled) {
      speak(speakText);
    }

    // Trigger standard browser push notification if allowed
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification("MindSafe Daily Check-in 🔔", {
          body: "How are you feeling right now? Tap a mood to build consistency.",
          icon: "/favicon.ico",
        });
      } catch (e) {
        console.error("HTML5 Notification error:", e);
      }
    }
  };

  // Commit the mood check-in with notes
  const commitMoodLog = () => {
    if (!pendingMood) return;

    const today = getTodayString();
    
    // Check if yesterday was checked in to maintain streak
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayString = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, "0")}-${String(yesterdayDate.getDate()).padStart(2, "0")}`;
    
    const wasCheckedInYesterday = history.some((h) => h.date === yesterdayString);
    const isAlreadyCheckedInToday = history.some((h) => h.date === today);

    let newStreak = streak;
    if (!isAlreadyCheckedInToday) {
      if (wasCheckedInYesterday || streak === 0) {
        newStreak += 1;
      } else {
        newStreak = 1; // Streak restarted
      }
    }

    setStreak(newStreak);

    // Create a new record with a unique ID and current timestamp
    const newRecord: CheckInRecord = {
      id: `record-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      date: today,
      timestamp: Date.now(),
      mood: pendingMood.emoji,
      label: pendingMood.label,
      note: reflectionText.trim() || undefined
    };

    setHistory((prev) => [newRecord, ...prev]);
    setSelectedMoodToday(pendingMood.emoji);
    setSimulatedReminder(false);
    
    // Reset inputs
    setPendingMood(null);
    setReflectionText("");

    // Send context prompt to the main AI flow
    const notesPart = newRecord.note ? ` Reflection note: "${newRecord.note}"` : "";
    onTriggerPrompt(`[Daily Check-in Logged] I am checking in today feeling ${newRecord.mood} ${newRecord.label}.${notesPart} Let's reflect on this.`);
  };

  const deleteRecord = (id: string) => {
    setHistory((prev) => prev.filter((r) => r.id !== id));
  };

  // Helper to generate the last 7 days calendar view
  const getLast7Days = () => {
    const days = [];
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const weekdayLabel = weekdays[d.getDay()];
      const dayNum = d.getDate();
      
      // Get the latest check-in for this specific day
      const dayRecords = history.filter((h) => h.date === dateStr);
      const record = dayRecords.length > 0 
        ? [...dayRecords].sort((a, b) => b.timestamp - a.timestamp)[0]
        : undefined;

      days.push({
        dateStr,
        weekdayLabel,
        dayNum,
        record,
      });
    }
    return days;
  };

  return (
    <div
      className="w-full rounded-[24px] p-6 flex flex-col text-left overflow-hidden border transition-all"
      style={{
        background: "rgba(255, 255, 255, 0.04)",
        borderColor: "rgba(251, 191, 36, 0.15)",
        marginBottom: "15px",
      }}
      id="dailyCheckInPanel"
    >
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10 mb-4">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-[#FBBF24]/10 text-[#FBBF24]">
            <Bell className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-100 tracking-wide font-sans">
              Daily Resilience Scheduler
            </h3>
            <p className="text-[10.5px] text-slate-400 font-mono uppercase tracking-widest">
              Consistency & Emotional Awareness
            </p>
          </div>
        </div>

        {/* ALARM HOUR SELECTOR & ENABLE SWITCH */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/10">
            <span className="text-[11px] text-slate-400 font-medium">At:</span>
            <input
              type="time"
              value={checkInTime}
              onChange={(e) => setCheckInTime(e.target.value)}
              className="bg-transparent text-xs text-[#FBBF24] font-semibold focus:outline-none cursor-pointer"
              title="Set Check-in Hour"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsEnabled(!isEnabled)}
            className={`p-1.5 px-3 rounded-lg text-xs font-semibold cursor-pointer select-none transition-all flex items-center gap-1 border ${
              isEnabled
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-slate-500/10 border-slate-500/20 text-slate-400"
            }`}
          >
            {isEnabled ? (
              <>
                <Bell className="w-3.5 h-3.5" />
                <span>Active</span>
              </>
            ) : (
              <>
                <BellOff className="w-3.5 h-3.5" />
                <span>Muted</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. LIVE NOTIFICATION ALERT (SIMULATED OR SCHEDULED) */}
      <AnimatePresence>
        {simulatedReminder && !pendingMood && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="bg-[#D97706]/20 border border-[#FBBF24]/40 p-4 rounded-xl mb-4 flex flex-col gap-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-[#FBBF24]">
                <Sparkles className="w-4 h-4 animate-spin-slow" />
                <span className="text-xs font-bold font-sans">🔔 Daily Resilience Check-in Time!</span>
              </div>
              <button
                type="button"
                onClick={() => setSimulatedReminder(false)}
                className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              How are you feeling in this present moment? Take a deep breath and select one of the core resilience states below to record your day.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. CORE INTERACTIVE MOOD LOGGER */}
      <div className="mb-4">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2 select-none">
          {selectedMoodToday ? `Last logged: ${selectedMoodToday} (Log another shift below)` : "Log Current Resilience State"}
        </label>
        <div className="grid grid-cols-5 gap-2">
          {MOODS.map((m) => {
            const isPending = pendingMood?.emoji === m.emoji;
            const isLastLogged = selectedMoodToday === m.emoji && !pendingMood;
            return (
              <button
                key={m.label}
                type="button"
                onClick={() => setPendingMood({ emoji: m.emoji, label: m.label })}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all select-none cursor-pointer ${
                  isPending
                    ? "bg-[#FBBF24]/20 border-[#FBBF24] text-[#FBBF24] ring-1 ring-[#FBBF24]/30 scale-105"
                    : isLastLogged
                      ? "bg-[#FBBF24]/10 border-[#FBBF24]/60 text-[#FBBF24]"
                      : m.color
                }`}
                title={`Feel ${m.label}`}
              >
                <span className="text-xl mb-1">{m.emoji}</span>
                <span className="text-[9.5px] font-semibold tracking-tight truncate w-full text-center">
                  {m.label}
                </span>
                {isLastLogged && (
                  <span className="mt-0.5 text-[8px] font-mono text-amber-400 flex items-center gap-0.5">
                    <Check className="w-2 h-2" /> Current
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3.5 EXPANDED INPUT FORM FOR NOTE CAPTURE */}
      <AnimatePresence>
        {pendingMood && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4 p-4 rounded-xl bg-white/5 border border-amber-400/20 text-left"
          >
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-amber-400">
              <span className="text-sm select-none">{pendingMood.emoji}</span>
              <span>Reflecting on: {pendingMood.label}</span>
            </div>
            
            <textarea
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              placeholder="What is influencing this feeling? Add a reflection note (optional)..."
              className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors resize-none h-16 font-sans"
              maxLength={200}
            />
            
            <div className="flex justify-between items-center mt-2">
              <span className="text-[9px] text-slate-500 font-mono">
                {200 - reflectionText.length} characters left
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPendingMood(null);
                    setReflectionText("");
                  }}
                  className="px-3 py-1.5 rounded-lg text-[10px] text-slate-400 hover:text-slate-200 border border-white/10 bg-white/5 font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={commitMoodLog}
                  className="px-3 py-1.5 rounded-lg text-[10px] bg-gradient-to-r from-amber-400 to-[#D97706] text-slate-950 font-bold hover:shadow-[0_0_12px_rgba(251,191,36,0.3)] transition-all cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-slate-950" />
                  <span>Log Reflection</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. WEEKLY PATTERNS & CONSISTENCY GRID */}
      <div className="bg-white/5 border border-white/5 rounded-xl p-3 mb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* WEEKLY HISTORY TIMELINE */}
        <div className="flex-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 flex items-center gap-1 select-none">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            Emotional History (7-Day Patterns)
          </span>
          <div className="flex items-center gap-2.5 justify-between">
            {getLast7Days().map((day) => (
              <div
                key={day.dateStr}
                className="flex flex-col items-center flex-1 bg-black/10 rounded-lg p-1.5 border border-white/5"
                title={`${day.weekdayLabel} ${day.dayNum}: ${day.record ? day.record.label : "No check-in recorded"}`}
              >
                <span className="text-[9px] text-slate-400 font-medium">{day.weekdayLabel}</span>
                <span className="text-[10px] text-slate-300 font-bold mb-1">{day.dayNum}</span>
                {day.record ? (
                  <span className="text-sm select-none" style={{ filter: "drop-shadow(0 0 4px rgba(251,191,36,0.3))" }}>
                    {day.record.mood}
                  </span>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-600 my-1 inline-block" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* FIRE STREAK COUNTER */}
        <div className="flex items-center gap-2.5 bg-black/15 px-3.5 py-2.5 rounded-xl border border-white/10 self-stretch justify-center md:justify-start">
          <div className="p-1.5 bg-[#D97706]/10 text-orange-400 rounded-lg">
            <Flame className={`w-5 h-5 ${streak > 0 ? "animate-pulse" : "opacity-40"}`} />
          </div>
          <div className="text-left">
            <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 block">Streak</span>
            <span className="text-base font-bold text-slate-200 font-sans">
              {streak} {streak === 1 ? "Day" : "Days"} Consistent
            </span>
          </div>
        </div>
      </div>

      {/* 4.5 DETAILED REFLECTION LOG FEED */}
      <div className="mb-3">
        <button
          type="button"
          onClick={() => setIsFeedExpanded(!isFeedExpanded)}
          className="w-full flex items-center justify-between p-2.5 bg-white/5 border border-white/5 hover:border-amber-400/20 rounded-xl transition-all cursor-pointer text-xs font-semibold text-slate-300 hover:text-white"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Mood Reflection Feed ({history.length} logs)</span>
          </div>
          {isFeedExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        <AnimatePresence>
          {isFeedExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mt-2 bg-black/20 border border-white/5 rounded-xl max-h-[220px] overflow-y-auto custom-scrollbar"
            >
              {history.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs">
                  No reflection logs written yet. Check-in above to start.
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {history.map((record) => {
                    const timeStr = new Date(record.timestamp).toLocaleTimeString([], { 
                      hour: "2-digit", 
                      minute: "2-digit" 
                    });
                    const dateStr = new Date(record.timestamp).toLocaleDateString([], { 
                      month: "short", 
                      day: "numeric" 
                    });

                    return (
                      <motion.div
                        key={record.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-3 flex items-start gap-3 hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="text-xl bg-white/5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-white/5">
                          {record.mood}
                        </div>
                        
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-200">
                              {record.label}
                            </span>
                            <span className="text-[9px] text-slate-500 font-mono flex items-center gap-1 select-none">
                              <Clock className="w-2.5 h-2.5" />
                              {dateStr} at {timeStr}
                            </span>
                          </div>
                          
                          {record.note && (
                            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed bg-white/5 p-2 rounded-lg border border-white/5 font-sans whitespace-pre-wrap">
                              {record.note}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => deleteRecord(record.id)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                          title="Delete this reflection"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 5. FOOTER TOOLS (PERMISSIONS & TEST TRIGGER) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1.5 border-t border-white/5 mt-2">
        {/* DESKTOP NOTIFICATION REQUEST */}
        {"Notification" in window && notificationPermission !== "granted" ? (
          <button
            type="button"
            onClick={requestNotificationPermission}
            className="text-[10px] text-[#FBBF24] hover:text-amber-300 transition-colors flex items-center gap-1"
          >
            <Info className="w-3 h-3" />
            <span>Enable system push notifications for your daily alarm</span>
          </button>
        ) : (
          <span className="text-[10.5px] text-slate-500 font-mono tracking-wide flex items-center gap-1 select-none">
            <Check className="w-3 h-3 text-emerald-400" /> Reminders configured successfully
          </span>
        )}

        {/* SIMULATION TRIGGER BUTTON */}
        <button
          type="button"
          onClick={triggerReminder}
          className="text-[11px] font-bold text-[#FBBF24]/90 hover:text-white transition-colors bg-white/5 hover:bg-[#FBBF24]/10 p-1.5 px-3 rounded-lg border border-white/10 hover:border-[#FBBF24]/30 flex items-center gap-1 cursor-pointer select-none"
          title="Test how the alarm behaves immediately"
        >
          <Play className="w-3 h-3 text-[#FBBF24]" />
          <span>Simulate Check-in Time Now</span>
        </button>
      </div>
    </div>
  );
}
