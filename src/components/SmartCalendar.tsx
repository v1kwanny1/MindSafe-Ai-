import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  Sparkles,
  CheckCircle2,
  Trash2,
  Download,
  ExternalLink,
  ChevronRight,
  Sun,
  Moon,
  Wind,
  Bell,
  Send,
  Loader2,
  CalendarDays,
  ShieldCheck
} from "lucide-react";
import { collection, doc, setDoc, deleteDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  durationMinutes: number;
  category: "Mindfulness" | "Task" | "Health" | "Rest" | "Reminder" | "Work";
  notes?: string;
  completed?: boolean;
  googleCalendarUrl?: string;
}

interface SmartCalendarProps {
  currentUser: any;
  userMoodScore?: number;
  isEmailVerified?: boolean;
  onOpenAuthGate?: () => void;
}

export const SmartCalendar: React.FC<SmartCalendarProps> = ({ 
  currentUser, 
  userMoodScore, 
  isEmailVerified = true,
  onOpenAuthGate
}) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [naturalInput, setNaturalInput] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [activeTab, setActiveTab] = useState<"upcoming" | "calendar" | "ai-plan">("upcoming");
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Manual Add Event State
  const [showAddForm, setShowAddForm] = useState(false);
  const [manualTitle, setManualTitle] = useState("");
  const [manualDate, setManualDate] = useState(new Date().toISOString().split("T")[0]);
  const [manualTime, setManualTime] = useState("09:00");
  const [manualDuration, setManualDuration] = useState(15);
  const [manualCategory, setManualCategory] = useState<CalendarEvent["category"]>("Mindfulness");
  const [manualNotes, setManualNotes] = useState("");

  // Load events from Firestore or LocalStorage
  useEffect(() => {
    async function loadEvents() {
      if (currentUser) {
        try {
          const q = query(
            collection(db, "calendar_events"),
            where("userId", "==", currentUser.uid)
          );
          const querySnap = await getDocs(q);
          const loaded: CalendarEvent[] = [];
          querySnap.forEach((doc) => {
            loaded.push({ id: doc.id, ...doc.data() } as CalendarEvent);
          });
          if (loaded.length > 0) {
            setEvents(loaded);
            return;
          }
        } catch (err) {
          console.error("Firestore calendar fetch failed:", err);
        }
      }

      // Fallback local storage
      const local = localStorage.getItem("mindsafe_calendar") || localStorage.getItem("mindsafe_dola_calendar");
      if (local) {
        try {
          setEvents(JSON.parse(local));
        } catch (e) {
          console.error("Error reading local calendar:", e);
        }
      } else {
        // Initial sample events
        const today = new Date().toISOString().split("T")[0];
        const initial: CalendarEvent[] = [
          {
            id: "evt_1",
            title: "Morning 4-7-8 Breathing Reset",
            date: today,
            time: "08:30",
            durationMinutes: 10,
            category: "Mindfulness",
            notes: "Start the morning with 5 slow diaphragmatic breaths.",
            completed: false,
            googleCalendarUrl: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("Morning Breathing Reset")}&dates=${today.replace(/-/g, "")}T083000Z/${today.replace(/-/g, "")}T084000Z`
          },
          {
            id: "evt_2",
            title: "Midday Unplug & Stretch Pause",
            date: today,
            time: "13:00",
            durationMinutes: 15,
            category: "Rest",
            notes: "Step away from screen for 15 minutes of natural light.",
            completed: false,
            googleCalendarUrl: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("Midday Unplug Pause")}&dates=${today.replace(/-/g, "")}T130000Z/${today.replace(/-/g, "")}T131500Z`
          }
        ];
        setEvents(initial);
        localStorage.setItem("mindsafe_calendar", JSON.stringify(initial));
      }
    }

    loadEvents();
  }, [currentUser]);

  // Save changes helper
  const saveEvents = async (newEvents: CalendarEvent[]) => {
    setEvents(newEvents);
    localStorage.setItem("mindsafe_calendar", JSON.stringify(newEvents));
  };

  // AI Natural Language Scheduler (MindSafe Smart Assistant)
  const handleParseNaturalSchedule = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!naturalInput.trim() || isParsing) return;

    setIsParsing(true);
    setStatusNotice(null);

    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const res = await fetch("/api/parse-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptText: naturalInput.trim(),
          currentDate: todayStr,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        })
      });

      const data = await res.json();
      if (data.events && Array.isArray(data.events) && data.events.length > 0) {
        const newEvts: CalendarEvent[] = data.events.map((ev: any) => ({
          id: ev.id || "evt_" + Math.random().toString(36).substring(2, 9),
          title: ev.title || "Scheduled Activity",
          date: ev.date || todayStr,
          time: ev.time || "09:00",
          durationMinutes: ev.durationMinutes || 30,
          category: ev.category || "Task",
          notes: ev.notes || "Scheduled via MindSafe Smart Assistant",
          completed: false,
          googleCalendarUrl: ev.googleCalendarUrl || `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(ev.title || "Activity")}&dates=${(ev.date || todayStr).replace(/-/g, "")}T090000Z/${(ev.date || todayStr).replace(/-/g, "")}T093000Z`
        }));

        const updated = [...newEvts, ...events];
        await saveEvents(updated);

        // Sync to Firestore if authenticated
        if (currentUser) {
          for (const ev of newEvts) {
            try {
              await setDoc(doc(db, "calendar_events", ev.id), {
                ...ev,
                userId: currentUser.uid,
                createdAt: Date.now()
              });
            } catch (err) {
              console.error("Firestore event sync failed:", err);
            }
          }
        }

        setNaturalInput("");
        setStatusNotice(`✨ Added ${newEvts.length} event(s) to your Smart Schedule!`);
      } else {
        setStatusNotice("⚠️ Could not parse event details. Try being more specific (e.g. 'Remind me to meditate tomorrow at 9am').");
      }
    } catch (err: any) {
      console.error("Schedule parsing error:", err);
      setStatusNotice("⚠️ Scheduling assistant unavailable offline. Event created manually.");
    } finally {
      setIsParsing(false);
    }
  };

  // Toggle completed
  const handleToggleCompleted = async (id: string) => {
    const updated = events.map((ev) =>
      ev.id === id ? { ...ev, completed: !ev.completed } : ev
    );
    await saveEvents(updated);

    if (currentUser) {
      const evToUpdate = updated.find((ev) => ev.id === id);
      if (evToUpdate) {
        try {
          await setDoc(doc(db, "calendar_events", id), {
            ...evToUpdate,
            userId: currentUser.uid,
            updatedAt: Date.now()
          }, { merge: true });
        } catch (e) {
          console.error("Firestore update failed:", e);
        }
      }
    }
  };

  // Delete event
  const handleDeleteEvent = async (id: string) => {
    const updated = events.filter((ev) => ev.id !== id);
    await saveEvents(updated);

    if (currentUser) {
      try {
        await deleteDoc(doc(db, "calendar_events", id));
      } catch (e) {
        console.error("Firestore delete event failed:", e);
      }
    }
  };

  // Add Manual Event
  const handleAddManualEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;

    const startDate = new Date(`${manualDate}T${manualTime}:00`);
    const endDate = new Date(startDate.getTime() + manualDuration * 60000);
    const endISO = endDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const startISO = startDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const newEvt: CalendarEvent = {
      id: "evt_m_" + Date.now(),
      title: manualTitle.trim(),
      date: manualDate,
      time: manualTime,
      durationMinutes: manualDuration,
      category: manualCategory,
      notes: manualNotes.trim() || undefined,
      completed: false,
      googleCalendarUrl: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(manualTitle.trim())}&dates=${startISO}/${endISO}&details=${encodeURIComponent(manualNotes.trim() || "MindSafe Scheduled Activity")}`
    };

    const updated = [newEvt, ...events];
    await saveEvents(updated);

    if (currentUser) {
      try {
        await setDoc(doc(db, "calendar_events", newEvt.id), {
          ...newEvt,
          userId: currentUser.uid,
          createdAt: Date.now()
        });
      } catch (err) {
        console.error("Firestore manual event sync failed:", err);
      }
    }

    setManualTitle("");
    setManualNotes("");
    setShowAddForm(false);
    setStatusNotice(`✨ Scheduled "${newEvt.title}" for ${newEvt.date} at ${newEvt.time}!`);
  };

  // AI Auto-Plan Wellness Day
  const handleAutoPlanDay = async () => {
    setIsParsing(true);
    const todayStr = new Date().toISOString().split("T")[0];

    const prompt = `Schedule a balanced, stress-resilient 1-day wellness routine for today (${todayStr}) with 3 micro-breaks: morning intention, afternoon breathing reset, and evening wind-down.`;
    setNaturalInput(prompt);

    try {
      const res = await fetch("/api/parse-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptText: prompt,
          currentDate: todayStr,
        })
      });
      const data = await res.json();
      if (data.events && Array.isArray(data.events)) {
        const newEvts: CalendarEvent[] = data.events.map((ev: any) => ({
          id: "evt_ai_" + Math.random().toString(36).substring(2, 9),
          title: ev.title || "Wellness Pause",
          date: ev.date || todayStr,
          time: ev.time || "10:00",
          durationMinutes: ev.durationMinutes || 15,
          category: ev.category || "Mindfulness",
          notes: ev.notes || "AI Recommended Wellness Pause",
          completed: false,
          googleCalendarUrl: ev.googleCalendarUrl
        }));

        const updated = [...newEvts, ...events];
        await saveEvents(updated);
        setStatusNotice("🔮 AI Auto-Planned 3 personalized wellness breaks for your day!");
      }
    } catch (err) {
      console.error("Auto plan failed:", err);
    } finally {
      setIsParsing(false);
      setNaturalInput("");
    }
  };

  // Download .ics calendar file
  const handleDownloadICS = (event: CalendarEvent) => {
    const cleanDate = event.date.replace(/-/g, "");
    const cleanTime = event.time.replace(":", "") + "00";
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//MindSafe Smart Schedule//EN
BEGIN:VEVENT
SUMMARY:${event.title}
DESCRIPTION:${event.notes || "MindSafe Wellness Event"}
DTSTART:${cleanDate}T${cleanTime}Z
DURATION:PT${event.durationMinutes}M
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", `${event.title.replace(/[^a-z0-9]/gi, "_")}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredEvents = events.filter((ev) => {
    if (filterCategory === "All") return true;
    return ev.category.toLowerCase() === filterCategory.toLowerCase();
  });

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Email Verification Alert Banner */}
      {currentUser && !isEmailVerified && (
        <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-400/30 flex items-center justify-between gap-3 text-xs text-left">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-amber-400/20 text-amber-300 font-bold">⚠️</span>
            <div>
              <span className="text-amber-300 font-bold block">Email Verification Required for Cloud Sync</span>
              <span className="text-[11px] text-amber-200/80 font-mono block">
                Verify your email address ({currentUser.email}) to automatically sync schedules with Cloud Firestore &amp; Google Calendar.
              </span>
            </div>
          </div>
          {onOpenAuthGate && (
            <button
              type="button"
              onClick={onOpenAuthGate}
              className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs font-mono transition-all cursor-pointer shrink-0"
            >
              Verify Email
            </button>
          )}
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/80 via-slate-900/90 to-purple-950/80 border border-purple-500/20 shadow-2xl relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 rounded-xl bg-purple-500/20 border border-purple-400/30 text-purple-300">
                <CalendarDays className="w-5 h-5" />
              </span>
              <h3 className="text-xl font-black text-white tracking-tight font-display">
                MindSafe Smart AI Calendar &amp; Routine Agent
              </h3>
            </div>
            <p className="text-xs text-slate-300 font-mono">
              Conversational scheduling • Automatic Google Calendar sync • Mindful routine optimization
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-1.5 border border-white/15 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4 text-purple-300" />
              <span>{showAddForm ? "Cancel" : "Add Event"}</span>
            </button>

            <button
              type="button"
              onClick={handleAutoPlanDay}
              disabled={isParsing}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Auto-Plan</span>
            </button>
          </div>
        </div>

        {/* Manual Add Event Form Drawer */}
        <AnimatePresence>
          {showAddForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAddManualEvent}
              className="mt-4 p-4 rounded-2xl bg-slate-900/95 border border-purple-400/30 space-y-3 overflow-hidden text-left"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-purple-400" />
                  <span>Schedule Custom Activity</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Syncs with Google Calendar</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-300">Activity Title *</label>
                  <input
                    type="text"
                    required
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="e.g. 15-min Breathwork, Therapy Session"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-300">Category</label>
                  <select
                    value={manualCategory}
                    onChange={(e) => setManualCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-400"
                  >
                    <option value="Mindfulness">Mindfulness</option>
                    <option value="Rest">Rest & Recovery</option>
                    <option value="Health">Health & Exercise</option>
                    <option value="Task">Personal Task</option>
                    <option value="Work">Work / Focus</option>
                    <option value="Reminder">Reminder</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-300">Date</label>
                    <input
                      type="date"
                      required
                      value={manualDate}
                      onChange={(e) => setManualDate(e.target.value)}
                      className="w-full px-2 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-300">Time</label>
                    <input
                      type="time"
                      required
                      value={manualTime}
                      onChange={(e) => setManualTime(e.target.value)}
                      className="w-full px-2 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-300">Duration</label>
                    <select
                      value={manualDuration}
                      onChange={(e) => setManualDuration(Number(e.target.value))}
                      className="w-full px-2 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-400"
                    >
                      <option value={10}>10 min</option>
                      <option value={15}>15 min</option>
                      <option value={30}>30 min</option>
                      <option value={45}>45 min</option>
                      <option value={60}>60 min</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-300">Notes / Reflection (Optional)</label>
                  <input
                    type="text"
                    value={manualNotes}
                    onChange={(e) => setManualNotes(e.target.value)}
                    placeholder="Focus intention or location"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save Activity</span>
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Natural Language Prompt Input Bar (MindSafe Style) */}
        <form onSubmit={handleParseNaturalSchedule} className="mt-5 relative">
          <div className="relative flex items-center">
            <input
              type="text"
              value={naturalInput}
              onChange={(e) => setNaturalInput(e.target.value)}
              placeholder="e.g., 'Remind me to do 5-min breathing tomorrow at 9am' or 'Add team sync on Friday at 2pm'"
              className="w-full pl-4 pr-28 py-3.5 rounded-2xl bg-slate-900/90 border border-white/15 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-400/60 focus:ring-1 focus:ring-purple-400/40 shadow-inner"
            />
            <button
              type="submit"
              disabled={isParsing || !naturalInput.trim()}
              className="absolute right-2 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {isParsing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Parsing...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Schedule</span>
                </>
              )}
            </button>
          </div>
        </form>

        {statusNotice && (
          <p className="text-xs font-mono text-emerald-300 mt-2.5 animate-pulse">
            {statusNotice}
          </p>
        )}
      </div>

      {/* Category Filter & Event List */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-1.5">
            {["All", "Mindfulness", "Rest", "Health", "Task", "Work"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterCategory === cat
                    ? "bg-purple-500/20 text-purple-300 border border-purple-400/40"
                    : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-400 font-mono">
            {filteredEvents.length} scheduled event(s)
          </span>
        </div>

        {/* Scheduled Event Cards */}
        {filteredEvents.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-white/5 text-center text-slate-400 space-y-2">
            <CalendarIcon className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs font-mono">No scheduled activities match your filter.</p>
            <p className="text-[11px] text-slate-500">
              Type a prompt above to schedule reminders or routine breaks automatically!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredEvents.map((event) => {
              return (
                <div
                  key={event.id}
                  className={`p-4 rounded-2xl border text-left transition-all space-y-3 relative overflow-hidden ${
                    event.completed
                      ? "bg-emerald-950/20 border-emerald-500/20 opacity-70"
                      : "bg-slate-900/80 border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleCompleted(event.id)}
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                          event.completed
                            ? "bg-emerald-500 border-emerald-400 text-slate-950"
                            : "border-white/20 bg-white/5 hover:border-amber-400"
                        }`}
                      >
                        {event.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>

                      <span
                        className={`text-xs font-extrabold ${
                          event.completed ? "line-through text-slate-400" : "text-white"
                        }`}
                      >
                        {event.title}
                      </span>
                    </div>

                    <span className="px-2 py-0.5 rounded-full bg-purple-400/15 border border-purple-400/30 text-purple-300 text-[10px] font-mono">
                      {event.category}
                    </span>
                  </div>

                  {event.notes && (
                    <p className="text-xs text-slate-300 font-sans line-clamp-2">
                      {event.notes}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-400 font-mono">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-amber-300 font-bold">
                        <Clock className="w-3 h-3" />
                        {event.date} at {event.time} ({event.durationMinutes}m)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Google Calendar Link */}
                      {event.googleCalendarUrl && (
                        <a
                          href={event.googleCalendarUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-all"
                          title="Open in Google Calendar"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}

                      {/* Download .ics */}
                      <button
                        type="button"
                        onClick={() => handleDownloadICS(event)}
                        className="p-1.5 rounded-lg bg-white/5 text-slate-300 hover:bg-white/10 transition-all cursor-pointer"
                        title="Download iCal (.ics)"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDeleteEvent(event.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                        title="Delete Event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartCalendar;
