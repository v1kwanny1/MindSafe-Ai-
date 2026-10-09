import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import {
  Award,
  Flame,
  Shield,
  Crown,
  Sparkles,
  Lock,
  Target,
  BookOpen,
  CheckCircle2,
  X,
  Trophy,
  Share2,
  Check,
  Snowflake,
  Star,
  Zap,
  PartyPopper
} from "lucide-react";

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  category: "streak" | "checkin" | "goals" | "journal" | "special";
  icon: string;
  tier: "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond";
  color: string;
  bgGradient: string;
  borderColor: string;
  requiredCount: number;
  currentCount: number;
  isUnlocked: boolean;
  unlockedDate?: string;
  quote: string;
}

interface AchievementsProps {
  currentStreak?: number;
  totalCheckIns?: number;
  completedGoalsCount?: number;
  journalEntriesCount?: number;
  vaultCount?: number;
  frozenDatesCount?: number;
}

export default function Achievements({
  currentStreak: propStreak,
  totalCheckIns: propCheckIns,
  completedGoalsCount: propGoals,
  journalEntriesCount: propJournals,
  vaultCount: propVault,
  frozenDatesCount: propFrozen,
}: AchievementsProps) {
  const [selectedBadge, setSelectedBadge] = useState<AchievementBadge | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked" | "streak" | "checkin">("all");
  const [newlyUnlockedBanner, setNewlyUnlockedBanner] = useState<string | null>(null);

  // Trigger rich multi-stage confetti burst
  const triggerConfetti = () => {
    try {
      const count = 200;
      const defaults = {
        origin: { y: 0.65 },
        zIndex: 9999,
      };

      const fire = (particleRatio: number, opts: confetti.Options) => {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      };

      fire(0.25, {
        spread: 30,
        startVelocity: 55,
        colors: ["#FBBF24", "#34D399", "#60A5FA", "#F472B6", "#A855F7"],
      });
      fire(0.2, {
        spread: 60,
        colors: ["#FBBF24", "#F59E0B", "#10B981"],
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        colors: ["#FBBF24", "#E11D48", "#8B5CF6"],
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });
    } catch {
      // safe fallback if canvas unavailable
    }
  };

  // Read stats from localStorage to ensure perfect sync
  const [streak, setStreak] = useState<number>(0);
  const [checkIns, setCheckIns] = useState<number>(0);
  const [goals, setGoals] = useState<number>(0);
  const [journals, setJournals] = useState<number>(0);
  const [vault, setVault] = useState<number>(0);
  const [frozen, setFrozen] = useState<number>(0);

  useEffect(() => {
    // 1. Streak
    const savedStreak = parseInt(localStorage.getItem("mindsafe_checkin_streak") || "0", 10);
    setStreak(Math.max(propStreak ?? 0, savedStreak));

    // 2. Check-ins
    try {
      const rawCheckIns = localStorage.getItem("mindsafe_checkin_history");
      const arr = rawCheckIns ? JSON.parse(rawCheckIns) : [];
      setCheckIns(Math.max(propCheckIns ?? 0, Array.isArray(arr) ? arr.length : 0));
    } catch {
      setCheckIns(propCheckIns ?? 0);
    }

    // 3. Completed Goals
    try {
      const rawGoals = localStorage.getItem("mindsafe_completed_goals_history");
      const arr = rawGoals ? JSON.parse(rawGoals) : [];
      setGoals(Math.max(propGoals ?? 0, Array.isArray(arr) ? arr.length : 0));
    } catch {
      setGoals(propGoals ?? 0);
    }

    // 4. Journals
    try {
      const rawJournals = localStorage.getItem("mindsafe_journal_entries");
      const arr = rawJournals ? JSON.parse(rawJournals) : [];
      setJournals(Math.max(propJournals ?? 0, Array.isArray(arr) ? arr.length : 0));
    } catch {
      setJournals(propJournals ?? 0);
    }

    // 5. Vault
    setVault(propVault ?? 0);

    // 6. Frozen dates
    try {
      const rawFrozen = localStorage.getItem("mindsafe_frozen_goal_dates");
      const arr = rawFrozen ? JSON.parse(rawFrozen) : [];
      setFrozen(Math.max(propFrozen ?? 0, Array.isArray(arr) ? arr.length : 0));
    } catch {
      setFrozen(propFrozen ?? 0);
    }
  }, [propStreak, propCheckIns, propGoals, propJournals, propVault, propFrozen]);

  const achievementsList: AchievementBadge[] = [
    {
      id: "first_spark",
      title: "First Spark",
      description: "Logged your very first daily check-in with MindSafe.",
      category: "checkin",
      icon: "🌱",
      tier: "Bronze",
      color: "text-emerald-400",
      bgGradient: "from-emerald-500/20 to-teal-500/5",
      borderColor: "border-emerald-500/30",
      requiredCount: 1,
      currentCount: Math.min(checkIns, 1),
      isUnlocked: checkIns >= 1,
      unlockedDate: checkIns >= 1 ? "Active" : undefined,
      quote: "Every long journey begins with a single intentional step.",
    },
    {
      id: "streak_3",
      title: "3-Day Rhythm",
      description: "Maintained a 3-day consecutive streak of self-awareness.",
      category: "streak",
      icon: "⚡",
      tier: "Bronze",
      color: "text-amber-400",
      bgGradient: "from-amber-500/20 to-yellow-500/5",
      borderColor: "border-amber-500/30",
      requiredCount: 3,
      currentCount: Math.min(streak, 3),
      isUnlocked: streak >= 3 || checkIns >= 3,
      unlockedDate: streak >= 3 || checkIns >= 3 ? "Active" : undefined,
      quote: "Consistency is not perfection; it's showing up when it counts.",
    },
    {
      id: "streak_7",
      title: "7-Day Streak Warrior",
      description: "Reached a 7-day milestone streak of daily resilience and mental check-ins.",
      category: "streak",
      icon: "🛡️",
      tier: "Silver",
      color: "text-sky-400",
      bgGradient: "from-sky-500/20 to-blue-500/5",
      borderColor: "border-sky-500/30",
      requiredCount: 7,
      currentCount: Math.min(streak, 7),
      isUnlocked: streak >= 7,
      unlockedDate: streak >= 7 ? "Unlocked" : undefined,
      quote: "Seven consecutive days of self-care build an unshakeable inner warrior.",
    },
    {
      id: "monthly_champion",
      title: "Monthly Check-in Champion",
      description: "Completed 30 total daily check-ins on your journey to peace.",
      category: "checkin",
      icon: "👑",
      tier: "Diamond",
      color: "text-amber-300",
      bgGradient: "from-amber-400/25 to-orange-500/10",
      borderColor: "border-amber-400/40",
      requiredCount: 30,
      currentCount: Math.min(checkIns, 30),
      isUnlocked: checkIns >= 30,
      unlockedDate: checkIns >= 30 ? "Unlocked" : undefined,
      quote: "30 days of dedication proves your spirit is invincible.",
    },
    {
      id: "goal_master",
      title: "Daily Goal Master",
      description: "Successfully fulfilled 5 daily resilience goals.",
      category: "goals",
      icon: "🎯",
      tier: "Gold",
      color: "text-rose-400",
      bgGradient: "from-rose-500/20 to-pink-500/5",
      borderColor: "border-rose-500/30",
      requiredCount: 5,
      currentCount: Math.min(goals, 5),
      isUnlocked: goals >= 5,
      unlockedDate: goals >= 5 ? "Unlocked" : undefined,
      quote: "Small micro-victories daily compound into extraordinary triumphs.",
    },
    {
      id: "streak_14",
      title: "14-Day Resilience Fortress",
      description: "Maintained a 14-day streak of active emotional regulation.",
      category: "streak",
      icon: "🏰",
      tier: "Platinum",
      color: "text-purple-300",
      bgGradient: "from-purple-500/25 to-indigo-500/10",
      borderColor: "border-purple-400/40",
      requiredCount: 14,
      currentCount: Math.min(streak, 14),
      isUnlocked: streak >= 14,
      unlockedDate: streak >= 14 ? "Unlocked" : undefined,
      quote: "Two full weeks of courage — you are building genuine mental muscle.",
    },
    {
      id: "freeze_guardian",
      title: "Freeze Guardian",
      description: "Protected your streak from breaking using a Streak Freeze token.",
      category: "special",
      icon: "❄️",
      tier: "Silver",
      color: "text-sky-300",
      bgGradient: "from-sky-400/20 to-cyan-500/10",
      borderColor: "border-sky-400/30",
      requiredCount: 1,
      currentCount: Math.min(frozen, 1),
      isUnlocked: frozen >= 1,
      unlockedDate: frozen >= 1 ? "Unlocked" : undefined,
      quote: "Self-compassion means protecting your momentum without shame.",
    },
    {
      id: "reflective_scribe",
      title: "Reflective Scribe",
      description: "Logged 3 reflections in your Private Resilience Journal.",
      category: "journal",
      icon: "📖",
      tier: "Silver",
      color: "text-indigo-400",
      bgGradient: "from-indigo-500/20 to-purple-500/5",
      borderColor: "border-indigo-500/30",
      requiredCount: 3,
      currentCount: Math.min(journals, 3),
      isUnlocked: journals >= 3,
      unlockedDate: journals >= 3 ? "Unlocked" : undefined,
      quote: "Writing your thoughts strips away their power to haunt you.",
    },
    {
      id: "vault_keeper",
      title: "Breakthrough Keeper",
      description: "Pinned or hearted a key realization in your Resilience Vault.",
      category: "special",
      icon: "💎",
      tier: "Gold",
      color: "text-amber-400",
      bgGradient: "from-amber-500/25 to-yellow-600/10",
      borderColor: "border-amber-400/40",
      requiredCount: 1,
      currentCount: Math.min(vault, 1),
      isUnlocked: vault >= 1,
      unlockedDate: vault >= 1 ? "Unlocked" : undefined,
      quote: "Preserving wisdom ensures light is always reachable in dark moments.",
    },
  ];

  const unlockedCount = achievementsList.filter((b) => b.isUnlocked).length;
  const totalCount = achievementsList.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  // Auto-detect newly unlocked badges and fire celebratory confetti
  useEffect(() => {
    const unlockedIds = achievementsList.filter((b) => b.isUnlocked).map((b) => b.id);
    if (unlockedIds.length === 0) return;

    try {
      const stored = localStorage.getItem("mindsafe_unlocked_badges_cache");
      const previousUnlocked: string[] = stored ? JSON.parse(stored) : [];

      const newlyUnlocked = unlockedIds.filter((id) => !previousUnlocked.includes(id));
      if (newlyUnlocked.length > 0) {
        const badgeObj = achievementsList.find((b) => b.id === newlyUnlocked[0]);
        if (badgeObj) {
          setNewlyUnlockedBanner(`🎉 Milestone Unlocked: "${badgeObj.title}"!`);
          triggerConfetti();
          setTimeout(() => setNewlyUnlockedBanner(null), 6000);
        }
      }

      localStorage.setItem("mindsafe_unlocked_badges_cache", JSON.stringify(unlockedIds));
    } catch {
      // ignore JSON errors
    }
  }, [streak, checkIns, goals, journals, vault, frozen]);

  const filteredBadges = achievementsList.filter((badge) => {
    if (filter === "unlocked") return badge.isUnlocked;
    if (filter === "locked") return !badge.isUnlocked;
    if (filter === "streak") return badge.category === "streak";
    if (filter === "checkin") return badge.category === "checkin";
    return true;
  });

  return (
    <div className="bg-white/5 border border-white/10 rounded-[24px] p-6 backdrop-blur-md text-left relative overflow-hidden" id="achievementsComponent">
      {/* Background glow effect */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

      {/* NEWLY UNLOCKED CELEBRATION BANNER */}
      <AnimatePresence>
        {newlyUnlockedBanner && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-sky-500/20 border border-amber-400/40 flex items-center justify-between text-slate-100 shadow-[0_0_20px_rgba(251,191,36,0.3)] select-none"
          >
            <div className="flex items-center gap-2.5 text-xs font-extrabold font-sans">
              <PartyPopper className="w-5 h-5 text-amber-400 animate-bounce" />
              <span className="text-amber-200">{newlyUnlockedBanner}</span>
            </div>
            <button
              type="button"
              onClick={triggerConfetti}
              className="px-3 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[11px] font-mono shadow transition-all cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>Celebrate Again</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Component Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 select-none">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-500/30 rounded-2xl text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.2)]">
            <Trophy className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-100 font-sans flex items-center gap-2.5">
              <span>Resilience Achievements</span>
              <span className="text-[10px] font-mono bg-amber-500/15 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/25 font-bold">
                {unlockedCount} / {totalCount} Unlocked ({progressPercent}%)
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Unlock digital milestone badges by maintaining streaks, daily check-ins, and goal habits
            </p>
          </div>
        </div>

        {/* Celebrate & Filter Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={triggerConfetti}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs shadow-[0_0_15px_rgba(251,191,36,0.35)] hover:scale-105 active:scale-95 transition-all cursor-pointer font-sans"
          >
            <PartyPopper className="w-4 h-4" />
            <span>Celebrate 🎉</span>
          </button>

          {/* Filter Bar */}
          <div className="flex items-center gap-1 bg-black/30 p-1 rounded-xl border border-white/10 text-[10.5px] font-mono font-bold flex-wrap">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              filter === "all" ? "bg-amber-400 text-slate-950 shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter("unlocked")}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              filter === "unlocked" ? "bg-amber-400 text-slate-950 shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Unlocked ({unlockedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("locked")}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              filter === "locked" ? "bg-amber-400 text-slate-950 shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Locked ({totalCount - unlockedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("streak")}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              filter === "streak" ? "bg-amber-400 text-slate-950 shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Streaks
          </button>
        </div>
      </div>
    </div>

      {/* Overall Progress Bar */}
      <div className="mb-6 p-3.5 rounded-2xl bg-black/20 border border-white/5">
        <div className="flex items-center justify-between text-xs font-mono font-semibold text-slate-300 mb-2">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Mastery Milestone Progress</span>
          </span>
          <span className="text-amber-400 font-bold">{progressPercent}%</span>
        </div>
        <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden p-0.5">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Grid of Achievement Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredBadges.map((badge) => {
          const badgePercent = Math.min(100, Math.round((badge.currentCount / badge.requiredCount) * 100));

          return (
            <motion.div
              key={badge.id}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedBadge(badge);
                if (badge.isUnlocked) {
                  triggerConfetti();
                }
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                badge.isUnlocked
                  ? `bg-gradient-to-br ${badge.bgGradient} ${badge.borderColor} shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:border-amber-400/50`
                  : "bg-black/20 border-white/5 hover:border-white/15 opacity-80 hover:opacity-100"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl border shadow-inner ${
                        badge.isUnlocked
                          ? "bg-black/30 border-white/20"
                          : "bg-slate-900/50 border-white/5 text-slate-600 grayscale"
                      }`}
                    >
                      {badge.icon}
                    </div>
                    <div>
                      <h4
                        className={`text-xs font-extrabold font-sans leading-tight ${
                          badge.isUnlocked ? "text-white" : "text-slate-400"
                        }`}
                      >
                        {badge.title}
                      </h4>
                      <span
                        className={`text-[9px] font-mono font-bold uppercase tracking-wider block mt-0.5 ${badge.color}`}
                      >
                        {badge.tier} Tier
                      </span>
                    </div>
                  </div>

                  {badge.isUnlocked ? (
                    <span className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="p-1 rounded-full bg-slate-800 text-slate-500 border border-white/5">
                      <Lock className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed font-sans line-clamp-2 mt-1">
                  {badge.description}
                </p>
              </div>

              <div className="mt-3.5 pt-2.5 border-t border-white/5">
                {badge.isUnlocked ? (
                  <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400 font-semibold">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>Unlocked</span>
                    </span>
                    <span className="text-slate-400 text-[9px]">Tap for quote →</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between text-[9.5px] font-mono text-slate-400 mb-1">
                      <span>Progress</span>
                      <span>
                        {badge.currentCount} / {badge.requiredCount}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${badgePercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {selectedBadge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`w-full max-w-md rounded-[28px] p-6 border text-left relative overflow-hidden bg-slate-900/95 shadow-2xl ${selectedBadge.borderColor}`}
            >
              {/* Decorative top glow */}
              <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

              <button
                type="button"
                onClick={() => setSelectedBadge(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-black/40 border border-white/20 flex items-center justify-center text-3xl shadow-lg">
                  {selectedBadge.icon}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white font-sans">{selectedBadge.title}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${selectedBadge.color}`}>
                      {selectedBadge.tier} Tier
                    </span>
                    <span className="text-slate-600 text-xs">•</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Category: {selectedBadge.category}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed font-sans mb-4 bg-white/5 p-3.5 rounded-xl border border-white/5">
                {selectedBadge.description}
              </p>

              {/* Inspiration Quote */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-5 relative">
                <span className="text-[9px] font-bold font-mono text-amber-400 uppercase tracking-widest block mb-1">
                  Resilience Reflection
                </span>
                <p className="text-xs text-amber-200 italic font-sans leading-relaxed">
                  "{selectedBadge.quote}"
                </p>
              </div>

              {/* Status and Action */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div className="flex items-center gap-2">
                  {selectedBadge.isUnlocked ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold font-mono border border-emerald-500/30 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Unlocked</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-white/5 text-slate-400 text-xs font-mono border border-white/10 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      <span>
                        {selectedBadge.currentCount} / {selectedBadge.requiredCount} Progress
                      </span>
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const text = `🏆 Just unlocked the '${selectedBadge.title}' badge in MindSafe AI! "${selectedBadge.quote}"`;
                    navigator.clipboard.writeText(text);
                    setCopiedShare(true);
                    setTimeout(() => setCopiedShare(false), 2000);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  {copiedShare ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share Badge</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
