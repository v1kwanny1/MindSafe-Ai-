import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, Flame, Sparkles, ShieldCheck, X, Share2, ArrowRight, Heart, Star, Zap, CheckCircle2 } from "lucide-react";

interface StreakMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToCommunity?: () => void;
  streakCount?: number;
  recommendedGoalText?: string;
  onAcceptRecommendedGoal?: (goalText: string) => void;
}

export default function StreakMilestoneModal({
  isOpen,
  onClose,
  onGoToCommunity,
  streakCount = 7,
  recommendedGoalText,
  onAcceptRecommendedGoal
}: StreakMilestoneModalProps) {
  const [accepted, setAccepted] = useState(false);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(251,191,36,0.2)] text-white overflow-hidden z-10"
        >
          {/* Background Ambient Glows */}
          <div className="absolute -top-24 -left-24 w-60 h-60 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-20 cursor-pointer"
            id="closeStreakModalBtn"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Top Decorative Banner / Icon */}
          <div className="flex flex-col items-center text-center">
            {/* Animated Trophy Container */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
              className="relative my-2"
            >
              {/* Outer Pulsing Halo */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 blur-xl opacity-60 animate-pulse" />

              {/* Main Icon Circle */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-b from-amber-300 via-amber-500 to-amber-600 p-1 shadow-[0_0_30px_rgba(251,191,36,0.6)] flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-amber-400/10 backdrop-blur-sm" />
                  <Trophy className="w-12 h-12 sm:w-14 sm:h-14 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)] animate-bounce" />
                </div>
              </div>

              {/* Floating Sparkles Badges around trophy */}
              <motion.div
                animate={{ y: [-3, 3, -3], rotate: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="absolute -top-1 -right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 p-1.5 rounded-full shadow-lg"
              >
                <Sparkles className="w-4 h-4 fill-slate-950" />
              </motion.div>

              <motion.div
                animate={{ y: [3, -3, 3], rotate: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                className="absolute -bottom-1 -left-2 bg-gradient-to-r from-rose-500 to-amber-500 text-white p-1.5 rounded-full shadow-lg"
              >
                <Flame className="w-4 h-4 fill-white" />
              </motion.div>
            </motion.div>

            {/* Title & Headline */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-3"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-semibold tracking-wide uppercase mb-2">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Consistency Milestone</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-amber-200 to-amber-400 bg-clip-text text-transparent">
                {streakCount}-Day Streak Achieved!
              </h2>
              <p className="mt-2 text-slate-300 text-sm sm:text-base max-w-md">
                You’ve shown up for yourself every single day this week. That is true emotional resilience in action.
              </p>
            </motion.div>

            {/* Achievement Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full my-6"
            >
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col items-center text-center">
                <Flame className="w-5 h-5 text-amber-400 mb-1" />
                <span className="text-lg font-black text-amber-300">{streakCount} Days</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Streak</span>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col items-center text-center">
                <ShieldCheck className="w-5 h-5 text-emerald-400 mb-1" />
                <span className="text-lg font-black text-emerald-300">Protected</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Resilience</span>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col items-center text-center">
                <Star className="w-5 h-5 text-purple-400 mb-1 fill-purple-400/20" />
                <span className="text-lg font-black text-purple-300">+100 XP</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Mastery</span>
              </div>
            </motion.div>

            {/* Nanny Frog & MindSafe Voice Quote */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="w-full bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-amber-950/40 border border-emerald-500/20 rounded-2xl p-4 text-left flex gap-3 items-start relative mb-6"
            >
              <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center flex-shrink-0 text-lg">
                🐸
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-bold text-emerald-300">Nanny Frog & MindSafe AI</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-mono">Guide</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "Look how far you've walked 💛 Every small daily promise kept to yourself builds an unshakable foundation. I'm right here cheering for you!"
                </p>
              </div>
            </motion.div>

            {/* Recommended Next Resilience Goal (Habit-Informed) */}
            {recommendedGoalText && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="w-full bg-gradient-to-r from-amber-500/15 via-slate-900/80 to-amber-600/10 border border-amber-500/30 rounded-2xl p-3.5 text-left mb-5 relative overflow-hidden"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
                    Recommended Next Resilience Goal
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                    Habit Momentum
                  </span>
                </div>
                <p className="text-xs sm:text-[13px] font-bold text-white leading-relaxed font-sans">
                  "{recommendedGoalText}"
                </p>
                <p className="text-[10px] text-slate-400 font-mono mt-1">
                  Derived from your 7-day consistency and successful past habit patterns.
                </p>
                {onAcceptRecommendedGoal && (
                  <div className="mt-2.5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onAcceptRecommendedGoal(recommendedGoalText);
                        setAccepted(true);
                      }}
                      disabled={accepted}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                        accepted
                          ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 cursor-default"
                          : "bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-md hover:scale-[1.02] active:scale-[0.98]"
                      }`}
                    >
                      {accepted ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Locked in for Tomorrow!</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
                          <span>Accept & Set as Tomorrow's Goal</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center gap-3 w-full"
            >
              {onGoToCommunity && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onGoToCommunity();
                  }}
                  className="w-full sm:flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 border border-amber-500/30 hover:border-amber-400 text-amber-300 hover:text-amber-200 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  id="shareStreakModalBtn"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share in Community</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:flex-1 py-3 px-4 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(251,191,36,0.35)] hover:scale-[1.02] active:scale-[0.98]"
                id="continueStreakModalBtn"
              >
                <span>Keep Going</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5px]" />
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
