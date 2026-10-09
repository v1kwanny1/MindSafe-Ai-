import React, { useState } from "react";
import { 
  Sparkles, 
  Check, 
  Calendar, 
  RefreshCw, 
  TrendingUp, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Zap, 
  Award,
  ArrowRight,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  GoalRecommendation, 
  GoalsHistoryAnalysis,
  addGoalToSmartCalendar,
  stageNextGoal
} from "../utils/goalRecommendationEngine";

interface RecommendedGoalCardProps {
  recommendations: GoalRecommendation[];
  analysis: GoalsHistoryAnalysis;
  currentUser?: any;
  onSetTomorrowGoal?: (goalText: string) => void;
  onOpenCalendar?: () => void;
  onOpenJournal?: () => void;
  onDismiss?: () => void;
  compact?: boolean;
}

export const RecommendedGoalCard: React.FC<RecommendedGoalCardProps> = ({
  recommendations,
  analysis,
  currentUser,
  onSetTomorrowGoal,
  onOpenCalendar,
  onOpenJournal,
  onDismiss,
  compact = false
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [acceptedForTomorrow, setAcceptedForTomorrow] = useState(false);
  const [addedToCalendar, setAddedToCalendar] = useState(false);
  const [showHabitBreakdown, setShowHabitBreakdown] = useState(false);
  const [isCalendarAdding, setIsCalendarAdding] = useState(false);

  if (!recommendations || recommendations.length === 0) return null;

  const currentRec = recommendations[currentIndex % recommendations.length];

  const handleNextSuggestion = () => {
    setCurrentIndex((prev) => (prev + 1) % recommendations.length);
    setAcceptedForTomorrow(false);
    setAddedToCalendar(false);
  };

  const handleAcceptForTomorrow = () => {
    stageNextGoal(currentRec.text);
    setAcceptedForTomorrow(true);
    if (onSetTomorrowGoal) {
      onSetTomorrowGoal(currentRec.text);
    }
  };

  const handleAddToCalendar = async () => {
    if (isCalendarAdding || addedToCalendar) return;
    setIsCalendarAdding(true);
    
    // Tomorrow's date string YYYY-MM-DD
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const targetDateStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;

    try {
      await addGoalToSmartCalendar(currentRec, targetDateStr, currentUser);
      setAddedToCalendar(true);
    } catch (e) {
      console.error("Error adding recommended goal to calendar:", e);
    } finally {
      setIsCalendarAdding(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className={`rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-slate-900/80 to-black/90 p-3.5 shadow-xl text-left overflow-hidden relative ${
        compact ? "mt-2.5" : "mt-3.5"
      }`}
    >
      {/* Decorative ambient glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />

      {/* Top celebratory header */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/10 relative z-10 select-none">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-6 w-6 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 items-center justify-center text-slate-950 shadow-xs shrink-0">
            <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-amber-200 tracking-wide font-sans">
                Recommended Next Goal
              </span>
              <span className="text-[9px] font-bold font-mono px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Habit-Informed
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono truncate">
              Derived from your {analysis.totalCompleted} past successful habits
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleNextSuggestion}
            className="flex items-center gap-1 text-[10px] font-mono text-slate-300 hover:text-amber-300 bg-white/5 hover:bg-white/10 px-2 py-1 rounded-lg border border-white/10 transition-all cursor-pointer"
            title="Cycle next recommendation"
          >
            <RefreshCw className="w-2.5 h-2.5" />
            <span className="hidden sm:inline">Next ({currentIndex + 1}/{recommendations.length})</span>
          </button>
        </div>
      </div>

      {/* Habit archetype insight bar */}
      <div className="mt-2.5 flex items-center justify-between gap-2 p-2 rounded-xl bg-black/40 border border-white/5 relative z-10 text-[11px]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm shrink-0">{analysis.archetype.icon}</span>
          <div className="min-w-0">
            <span className="font-bold text-slate-200 font-sans block truncate text-[11px]">
              {analysis.archetype.title}
            </span>
            <span className="text-[10px] text-amber-300/90 font-mono block truncate">
              {analysis.topHabit ? `${analysis.topHabit.label} (${analysis.topHabit.count} achieved)` : "Consistency building"}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowHabitBreakdown(!showHabitBreakdown)}
          className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-0.5 shrink-0 px-1.5 py-0.5 rounded hover:bg-white/5 transition-colors cursor-pointer"
        >
          <span>Habits</span>
          {showHabitBreakdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Expandable Habit Breakdown drawer */}
      <AnimatePresence>
        {showHabitBreakdown && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 p-2.5 rounded-xl bg-black/60 border border-white/10 space-y-1.5 text-[10px] font-mono text-slate-300 overflow-hidden"
          >
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1 font-sans">
              <TrendingUp className="w-3 h-3 text-amber-400" />
              <span>Your Habit Success Distribution:</span>
            </div>
            {analysis.categories.map((cat) => (
              <div key={cat.category} className="flex items-center justify-between gap-2 py-0.5">
                <span className="flex items-center gap-1.5 truncate">
                  <span>{cat.icon}</span>
                  <span className="text-slate-300 font-sans">{cat.label}</span>
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
                      style={{ width: `${Math.max(cat.percentage, 8)}%` }}
                    />
                  </div>
                  <span className="text-amber-300 font-bold w-7 text-right">{cat.count}x</span>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Recommended Next Goal Highlight */}
      <div className="mt-3 p-3 rounded-xl bg-amber-400/10 border border-amber-400/30 space-y-2 relative z-10">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 text-[9px] font-bold font-mono uppercase px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
            <span>{currentRec.categoryIcon}</span>
            <span>{currentRec.categoryLabel}</span>
          </span>
          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
            <Clock className="w-2.5 h-2.5 text-slate-400" />
            <span>{currentRec.suggestedTime}</span>
          </span>
        </div>

        <h4 className="text-xs sm:text-[13px] font-bold text-white tracking-wide leading-snug font-sans">
          "{currentRec.text}"
        </h4>

        {/* Why this recommendation matters based on past habits */}
        <p className="text-[11px] text-slate-300 leading-relaxed font-sans bg-black/30 p-2 rounded-lg border border-white/5">
          <span className="text-amber-300 font-bold block mb-0.5">💡 Habit-Based Rationale:</span>
          {currentRec.rationale}
        </p>

        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
          <span className="text-emerald-400 flex items-center gap-1">
            <Award className="w-3 h-3 text-emerald-400" />
            <span>{currentRec.difficulty}</span>
          </span>
          <span className="text-slate-400 italic">
            {currentRec.habitStrengthInsight}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 relative z-10">
        {/* Set as tomorrow's goal */}
        <button
          type="button"
          onClick={handleAcceptForTomorrow}
          disabled={acceptedForTomorrow}
          className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md ${
            acceptedForTomorrow
              ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 cursor-default"
              : "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:scale-[1.02] active:scale-[0.98] border border-amber-300/30"
          }`}
        >
          {acceptedForTomorrow ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Set as Next Goal!</span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 text-slate-950" />
              <span>Set as Tomorrow's Goal</span>
            </>
          )}
        </button>

        {/* Add to Smart Calendar */}
        <button
          type="button"
          onClick={handleAddToCalendar}
          disabled={addedToCalendar || isCalendarAdding}
          className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            addedToCalendar
              ? "bg-sky-500/20 border-sky-500/40 text-sky-300 cursor-default"
              : "bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white border-white/10"
          }`}
        >
          {addedToCalendar ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Scheduled in Calendar</span>
            </>
          ) : (
            <>
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              <span>{isCalendarAdding ? "Scheduling..." : "Add to Smart Calendar"}</span>
            </>
          )}
        </button>
      </div>

      {/* Auxiliary links (Journal & Calendar) */}
      <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400 font-mono px-1">
        {onOpenCalendar && (
          <button
            type="button"
            onClick={onOpenCalendar}
            className="hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>View in Smart Calendar</span>
            <ArrowRight className="w-2.5 h-2.5" />
          </button>
        )}

        {onOpenJournal && (
          <button
            type="button"
            onClick={onOpenJournal}
            className="hover:text-purple-300 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <BookOpen className="w-2.5 h-2.5" />
            <span>Reflect in Journal</span>
          </button>
        )}

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="hover:text-slate-300 transition-colors cursor-pointer ml-auto"
          >
            Hide
          </button>
        )}
      </div>
    </motion.div>
  );
};
