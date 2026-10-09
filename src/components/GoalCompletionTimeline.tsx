import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Award,
  Snowflake,
  Sparkles,
  Flame,
  CheckCircle2,
  Target,
  TrendingUp,
  Info,
  CalendarDays,
} from "lucide-react";

interface GoalCompletionTimelineProps {
  completedDatesHistory: string[];
  frozenDates: string[];
  todayGoalCompleted: boolean;
  todayDateStr: string;
  checkInDates?: string[];
  onToggleGoalForDate?: (dateStr: string) => void;
}

export const GoalCompletionTimeline: React.FC<GoalCompletionTimelineProps> = ({
  completedDatesHistory,
  frozenDates,
  todayGoalCompleted,
  todayDateStr,
  checkInDates = [],
  onToggleGoalForDate,
}) => {
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth());
  const [hoveredDay, setHoveredDay] = useState<{
    dateStr: string;
    dayNum: number;
    isCompleted: boolean;
    isFrozen: boolean;
    hasCheckIn: boolean;
    isToday: boolean;
    isFuture: boolean;
  } | null>(null);

  // Combine completed dates with today's live state
  const allCompletedDates = useMemo(() => {
    const set = new Set(completedDatesHistory);
    if (todayGoalCompleted && todayDateStr) {
      set.add(todayDateStr);
    } else if (!todayGoalCompleted && todayDateStr) {
      set.delete(todayDateStr);
    }
    return Array.from(set);
  }, [completedDatesHistory, todayGoalCompleted, todayDateStr]);

  const monthName = useMemo(() => {
    return new Date(selectedYear, selectedMonth, 1).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }, [selectedYear, selectedMonth]);

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
    setHoveredDay(null);
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
    setHoveredDay(null);
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    setSelectedYear(now.getFullYear());
    setSelectedMonth(now.getMonth());
    setHoveredDay(null);
  };

  // Calendar Day Generation
  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const firstDayIndex = new Date(selectedYear, selectedMonth, 1).getDay(); // 0 = Sunday
    // Convert to Monday-start (0 = Mon, 6 = Sun)
    const adjustedFirstDay = (firstDayIndex + 6) % 7;

    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Padding for previous month
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push({ isPadding: true, key: `pad-${i}` });
    }

    // Days in current month
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const dayDate = new Date(selectedYear, selectedMonth, dayNum);
      const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      const isCompleted = allCompletedDates.includes(dateStr);
      const isFrozen = frozenDates.includes(dateStr);
      const hasCheckIn = checkInDates.includes(dateStr);
      const isToday = dateStr === todayDateStr;
      const isFuture = dayDate > today;

      days.push({
        isPadding: false,
        key: dateStr,
        dayNum,
        dateStr,
        isCompleted,
        isFrozen,
        hasCheckIn,
        isToday,
        isFuture,
      });
    }

    return days;
  }, [selectedYear, selectedMonth, allCompletedDates, frozenDates, checkInDates, todayDateStr]);

  // Statistics for selected month
  const monthStats = useMemo(() => {
    const monthPrefix = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`;
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    
    // Count achieved days in this month
    const completedCount = allCompletedDates.filter((d) => d.startsWith(monthPrefix)).length;
    const frozenCount = frozenDates.filter((d) => d.startsWith(monthPrefix)).length;
    const totalAchieved = completedCount + frozenCount;

    // Up to today if current month, else entire month
    const now = new Date();
    const isCurrentMonthView = now.getFullYear() === selectedYear && now.getMonth() === selectedMonth;
    const elapsedDays = isCurrentMonthView ? Math.min(now.getDate(), daysInMonth) : daysInMonth;
    
    const rate = elapsedDays > 0 ? Math.round((totalAchieved / elapsedDays) * 100) : 0;

    // Calculate max consecutive streak in this month
    let maxStreak = 0;
    let currentRun = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      if (allCompletedDates.includes(dateStr) || frozenDates.includes(dateStr)) {
        currentRun++;
        if (currentRun > maxStreak) maxStreak = currentRun;
      } else {
        currentRun = 0;
      }
    }

    return {
      completedCount,
      frozenCount,
      totalAchieved,
      elapsedDays,
      rate,
      maxStreak,
      daysInMonth,
    };
  }, [selectedYear, selectedMonth, allCompletedDates, frozenDates]);

  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div
      className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-md space-y-4"
      id="goalCompletionTimelineHeatmap"
    >
      {/* Month Navigator Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
              <span>Goal Completion Timeline</span>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-400/30">
                Monthly Heatmap
              </span>
            </h4>
            <p className="text-[10px] text-slate-400 font-mono">
              Visual ledger of all daily resilience breakthroughs and protected streaks
            </p>
          </div>
        </div>

        {/* Month Navigation Controls */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 border border-white/10 p-1 rounded-xl">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-bold text-amber-300 font-mono px-2 min-w-[110px] text-center select-none">
            {monthName}
          </span>

          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleCurrentMonth}
            className="px-2 py-0.5 text-[9px] font-mono font-bold rounded-md bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 transition-all cursor-pointer ml-1"
            title="Jump to Current Month"
          >
            Today
          </button>
        </div>
      </div>

      {/* Month Analytics Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-left">
          <span className="text-[9px] font-mono uppercase text-slate-400 block">Goals Achieved</span>
          <div className="text-base font-extrabold text-amber-400 font-mono flex items-baseline gap-1 mt-0.5">
            <span>{monthStats.completedCount}</span>
            <span className="text-[10px] text-slate-500 font-normal">/ {monthStats.daysInMonth} d</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-left">
          <span className="text-[9px] font-mono uppercase text-slate-400 block">Consistency Rate</span>
          <div className="text-base font-extrabold text-emerald-400 font-mono flex items-baseline gap-1 mt-0.5">
            <span>{monthStats.rate}%</span>
            <span className="text-[10px] text-slate-500 font-normal">active</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-left">
          <span className="text-[9px] font-mono uppercase text-slate-400 block">Longest Run</span>
          <div className="text-base font-extrabold text-sky-400 font-mono flex items-baseline gap-1 mt-0.5">
            <span>🔥 {monthStats.maxStreak}</span>
            <span className="text-[10px] text-slate-500 font-normal">days in row</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-left">
          <span className="text-[9px] font-mono uppercase text-slate-400 block">Protected Streaks</span>
          <div className="text-base font-extrabold text-purple-400 font-mono flex items-baseline gap-1 mt-0.5">
            <span>❄️ {monthStats.frozenCount}</span>
            <span className="text-[10px] text-slate-500 font-normal">frozen</span>
          </div>
        </div>
      </div>

      {/* Calendar Heatmap Grid */}
      <div className="space-y-1.5">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {weekdays.map((w, idx) => (
            <span
              key={idx}
              className="text-[10px] font-mono font-bold text-slate-400 uppercase py-1 select-none"
            >
              {w}
            </span>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {calendarDays.map((d) => {
            if (d.isPadding) {
              return <div key={d.key} className="h-10 sm:h-11 rounded-xl bg-transparent opacity-0 pointer-events-none" />;
            }

            const isAchieved = d.isCompleted;
            const isProtected = d.isFrozen;

            return (
              <motion.button
                key={d.key}
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={() => setHoveredDay(d as any)}
                onMouseLeave={() => setHoveredDay(null)}
                onClick={() => onToggleGoalForDate && d.dateStr && onToggleGoalForDate(d.dateStr)}
                className={`relative h-10 sm:h-11 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer select-none group ${
                  isAchieved
                    ? "bg-gradient-to-br from-amber-400/25 via-amber-500/20 to-amber-600/10 border-amber-400/60 shadow-[0_0_12px_rgba(251,191,36,0.25)] text-amber-300"
                    : isProtected
                    ? "bg-sky-500/20 border-sky-400/60 shadow-[0_0_10px_rgba(56,189,248,0.2)] text-sky-300"
                    : d.hasCheckIn
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : d.isFuture
                    ? "bg-black/10 border-white/5 text-slate-600 opacity-40 cursor-default"
                    : "bg-black/25 border-white/5 hover:border-white/20 text-slate-400"
                } ${d.isToday ? "ring-2 ring-amber-400 ring-offset-1 ring-offset-slate-950" : ""}`}
              >
                {/* Day Number */}
                <span className="text-[11px] font-bold font-mono">
                  {d.dayNum}
                </span>

                {/* Status Indicator Icon / Dot */}
                <div className="flex items-center gap-0.5 mt-0.5">
                  {isAchieved && (
                    <Award className="w-3 h-3 text-amber-400 fill-amber-400/30 animate-bounce" style={{ animationDuration: "2.5s" }} />
                  )}
                  {isProtected && (
                    <Snowflake className="w-3 h-3 text-sky-300 animate-pulse" />
                  )}
                  {!isAchieved && !isProtected && d.hasCheckIn && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  )}
                </div>

                {/* Today Marker Tiny Pill */}
                {d.isToday && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Hover Details & Legend */}
      <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono text-slate-400">
        {/* Hover Information / Active Date details */}
        <div className="min-h-[22px] flex items-center gap-2">
          {hoveredDay ? (
            <motion.div
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-slate-200"
            >
              <CalendarDays className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="font-bold text-white">{hoveredDay.dateStr}:</span>
              {hoveredDay.isCompleted && (
                <span className="text-amber-300 font-semibold flex items-center gap-1">
                  <span>🎯 Goal Completed</span>
                </span>
              )}
              {hoveredDay.isFrozen && (
                <span className="text-sky-300 font-semibold flex items-center gap-1">
                  <span>❄️ Streak Protected</span>
                </span>
              )}
              {!hoveredDay.isCompleted && !hoveredDay.isFrozen && hoveredDay.hasCheckIn && (
                <span className="text-emerald-300 font-semibold flex items-center gap-1">
                  <span>📝 Check-In Recorded</span>
                </span>
              )}
              {!hoveredDay.isCompleted && !hoveredDay.isFrozen && !hoveredDay.hasCheckIn && !hoveredDay.isFuture && (
                <span className="text-slate-400">No goal achieved</span>
              )}
              {hoveredDay.isFuture && <span className="text-slate-500">Upcoming day</span>}
            </motion.div>
          ) : (
            <span className="text-slate-500 italic">
              Hover or tap any date to inspect breakthrough records
            </span>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 select-none">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-400/30 border border-amber-400/70" />
            <span className="text-amber-300">Goal Achieved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-sky-500/20 border border-sky-400/60" />
            <span className="text-sky-300">Streak Frozen</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500/20 border border-emerald-500/40" />
            <span className="text-emerald-300">Check-in</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded ring-1 ring-amber-400 bg-slate-900" />
            <span>Today</span>
          </div>
        </div>
      </div>
    </div>
  );
};
