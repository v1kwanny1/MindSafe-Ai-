import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle2,
  Circle,
  Droplets,
  Footprints,
  Wind,
  Heart,
  Moon,
  Sparkles,
  Flame,
  Trophy,
  Sprout,
} from "lucide-react";

interface DailyHabitTrackerProps {
  onCompleteAll?: () => void;
  onPrompt?: (text: string) => void;
}

interface HabitItem {
  id: string;
  icon: any;
  label: string;
  subtitle: string;
  points: number;
}

export const DailyHabitTracker: React.FC<DailyHabitTrackerProps> = ({ onCompleteAll }) => {
  const todayKey = `mindsafe_habits_${new Date().toISOString().slice(0, 10)}`;

  const [completed, setCompleted] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(todayKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [showCelebration, setShowCelebration] = useState(false);

  const habits: HabitItem[] = [
    {
      id: "water",
      icon: Droplets,
      label: "Hydration Anchor",
      subtitle: "Drink 2L of water throughout today",
      points: 15,
    },
    {
      id: "movement",
      icon: Footprints,
      label: "10-Min Outdoor Movement",
      subtitle: "Get fresh air & sunlight to reset cortisol",
      points: 20,
    },
    {
      id: "breathing",
      icon: Wind,
      label: "3 Deep Reset Breaths",
      subtitle: "Perform 1 box breathing cycle",
      points: 15,
    },
    {
      id: "gratitude",
      icon: Heart,
      label: "1 True Gratitude Note",
      subtitle: "Acknowledge one safe, positive thing",
      points: 25,
    },
    {
      id: "winddown",
      icon: Moon,
      label: "Digital Wind-Down",
      subtitle: "Screens away 45 mins before sleep",
      points: 25,
    },
    {
      id: "sanctuary",
      icon: Sprout,
      label: "Zen Sanctuary & Companion Care",
      subtitle: "Water your tree & feed your companion for daily peace",
      points: 25,
    },
  ];

  useEffect(() => {
    try {
      localStorage.setItem(todayKey, JSON.stringify(completed));
    } catch {}

    if (completed.length === habits.length && habits.length > 0) {
      setShowCelebration(true);
      if (onCompleteAll) onCompleteAll();
    }
  }, [completed, todayKey]);

  const toggleHabit = (id: string) => {
    setCompleted((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const completionPercent = Math.round((completed.length / habits.length) * 100);
  const totalEarnedPoints = completed.reduce((acc, id) => {
    const habit = habits.find((h) => h.id === id);
    return acc + (habit ? habit.points : 0);
  }, 0);

  return (
    <div
      className="w-full bg-slate-900/60 border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-md space-y-4"
      id="dailyHabitTrackerCard"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
              <span>Daily Resilience Micro-Habits</span>
            </h4>
            <p className="text-[10px] text-slate-400 font-mono">
              Build automatic mental protection through micro-consistency
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-lg">
            +{totalEarnedPoints} XP
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {completed.length}/{habits.length} Done
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/5">
        <div
          className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${completionPercent}%` }}
        />
      </div>

      {/* Habits List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {habits.map((habit) => {
          const isDone = completed.includes(habit.id);
          const HabitIcon = habit.icon;

          return (
            <button
              key={habit.id}
              type="button"
              onClick={() => toggleHabit(habit.id)}
              className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                isDone
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                  : "bg-white/5 border-white/5 hover:border-white/15 hover:bg-white/10 text-slate-300"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isDone
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-white/5 text-slate-400"
                  }`}
                >
                  <HabitIcon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 truncate">
                  <div className="text-xs font-bold truncate">{habit.label}</div>
                  <div className="text-[10px] text-slate-400 truncate">{habit.subtitle}</div>
                </div>
              </div>

              <div className="shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-500" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* 100% Celebration Banner */}
      <AnimatePresence>
        {completionPercent === 100 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-purple-500/20 border border-amber-400/40 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400 animate-bounce" />
              <span className="text-xs font-bold text-white">
                All daily habits completed! +100 Resilience XP
              </span>
            </div>
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
