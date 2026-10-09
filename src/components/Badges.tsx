import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Award,
  Flame,
  Shield,
  Crown,
  Sparkles,
  Lock,
  Target,
  BookOpen,
  Zap,
  CheckCircle2,
  X,
  Trophy,
  Share2,
  Check
} from "lucide-react";

export interface Badge {
  id: string;
  title: string;
  description: string;
  category: "streak" | "checkin" | "activity";
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

interface BadgesProps {
  currentStreak?: number;
  checkInHistoryCount?: number;
  completedGoalsCount?: number;
  journalEntriesCount?: number;
  vaultCount?: number;
}

export default function Badges({
  currentStreak: propStreak,
  checkInHistoryCount: propCheckIns,
  completedGoalsCount: propGoals,
  journalEntriesCount: propJournals,
  vaultCount: propVault,
}: BadgesProps) {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all");

  // Read stats from localStorage if props not provided or to ensure sync
  const [streak, setStreak] = useState<number>(0);
  const [totalCheckIns, setTotalCheckIns] = useState<number>(0);
  const [completedGoals, setCompletedGoals] = useState<number>(0);
  const [journalCount, setJournalCount] = useState<number>(0);
  const [vaultItemsCount, setVaultItemsCount] = useState<number>(0);

  useEffect(() => {
    // Streak
    const savedStreak = parseInt(localStorage.getItem("mindsafe_checkin_streak") || "0", 10);
    const effectiveStreak = Math.max(propStreak ?? 0, savedStreak);
    setStreak(effectiveStreak);

    // Total Check-ins
    try {
      const historyRaw = localStorage.getItem("mindsafe_checkin_history");
      const historyArr = historyRaw ? JSON.parse(historyRaw) : [];
      const effectiveCheckIns = Math.max(propCheckIns ?? 0, Array.isArray(historyArr) ? historyArr.length : 0);
      setTotalCheckIns(effectiveCheckIns);
    } catch {
      setTotalCheckIns(propCheckIns ?? 0);
    }

    // Completed Goals
    try {
      const goalsRaw = localStorage.getItem("mindsafe_completed_goals_history");
      const goalsArr = goalsRaw ? JSON.parse(goalsRaw) : [];
      const effectiveGoals = Math.max(propGoals ?? 0, Array.isArray(goalsArr) ? goalsArr.length : 0);
      setCompletedGoals(effectiveGoals);
    } catch {
      setCompletedGoals(propGoals ?? 0);
    }

    // Journal Count
    try {
      const journalsRaw = localStorage.getItem("mindsafe_journal_entries");
      const journalsArr = journalsRaw ? JSON.parse(journalsRaw) : [];
      const effectiveJournals = Math.max(propJournals ?? 0, Array.isArray(journalsArr) ? journalsArr.length : 0);
      setJournalCount(effectiveJournals);
    } catch {
      setJournalCount(propJournals ?? 0);
    }

    // Vault Count
    setVaultItemsCount(propVault ?? 0);
  }, [propStreak, propCheckIns, propGoals, propJournals, propVault]);

  // Construct Badges list dynamically
  const badges: Badge[] = [
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
      currentCount: Math.min(totalCheckIns, 1),
      isUnlocked: totalCheckIns >= 1,
      unlockedDate: totalCheckIns >= 1 ? "Achieved" : undefined,
      quote: "Every long journey begins with a single intentional step.",
    },
    {
      id: "streak_3",
      title: "3-Day Rhythm",
      description: "Maintained a 3-day consecutive check-in streak.",
      category: "streak",
      icon: "⚡",
      tier: "Bronze",
      color: "text-amber-400",
      bgGradient: "from-amber-500/20 to-yellow-500/5",
      borderColor: "border-amber-500/30",
      requiredCount: 3,
      currentCount: Math.min(streak, 3),
      isUnlocked: streak >= 3 || totalCheckIns >= 3,
      unlockedDate: streak >= 3 || totalCheckIns >= 3 ? "Achieved" : undefined,
      quote: "Consistency is not perfection; it's showing up when it counts.",
    },
    {
      id: "streak_7",
      title: "7-Day Warrior",
      description: "Reached a 7-day milestone streak of self-awareness.",
      category: "streak",
      icon: "🛡️",
      tier: "Silver",
      color: "text-sky-400",
      bgGradient: "from-sky-500/20 to-blue-500/5",
      borderColor: "border-sky-500/30",
      requiredCount: 7,
      currentCount: Math.min(streak, 7),
      isUnlocked: streak >= 7,
      unlockedDate: streak >= 7 ? "Achieved" : undefined,
      quote: "Seven days of grounding build an unshakeable foundation.",
    },
    {
      id: "streak_14",
      title: "14-Day Fortress",
      description: "Maintained a 14-day streak of daily resilience tracking.",
      category: "streak",
      icon: "🏰",
      tier: "Gold",
      color: "text-amber-300",
      bgGradient: "from-amber-400/25 to-orange-500/10",
      borderColor: "border-amber-400/40",
      requiredCount: 14,
      currentCount: Math.min(streak, 14),
      isUnlocked: streak >= 14,
      unlockedDate: streak >= 14 ? "Achieved" : undefined,
      quote: "Two full weeks of courage — you are building genuine mental muscle.",
    },
    {
      id: "streak_30",
      title: "30-Day Legend",
      description: "Achieved a legendary 30-day streak of mindful growth.",
      category: "streak",
      icon: "👑",
      tier: "Platinum",
      color: "text-purple-300",
      bgGradient: "from-purple-500/25 to-indigo-500/10",
      borderColor: "border-purple-400/40",
      requiredCount: 30,
      currentCount: Math.min(streak, 30),
      isUnlocked: streak >= 30,
      unlockedDate: streak >= 30 ? "Achieved" : undefined,
      quote: "30 days of commitment proves that your spirit is truly sovereign.",
    },
    {
      id: "goal_achiever",
      title: "Goal Striker",
      description: "Completed your daily resilience goal target.",
      category: "activity",
      icon: "🎯",
      tier: "Bronze",
      color: "text-rose-400",
      bgGradient: "from-rose-500/20 to-pink-500/5",
      borderColor: "border-rose-500/30",
      requiredCount: 1,
      currentCount: Math.min(completedGoals, 1),
      isUnlocked: completedGoals >= 1,
      unlockedDate: completedGoals >= 1 ? "Achieved" : undefined,
      quote: "Small micro-victories daily compound into extraordinary triumphs.",
    },
    {
      id: "reflective_scribe",
      title: "Reflective Scribe",
      description: "Penned a reflection in your personal MindSafe Journal.",
      category: "activity",
      icon: "📖",
      tier: "Silver",
      color: "text-indigo-400",
      bgGradient: "from-indigo-500/20 to-purple-500/5",
      borderColor: "border-indigo-500/30",
      requiredCount: 1,
      currentCount: Math.min(journalCount, 1),
      isUnlocked: journalCount >= 1,
      unlockedDate: journalCount >= 1 ? "Achieved" : undefined,
      quote: "Writing your thoughts strips away their power to haunt you.",
    },
    {
      id: "vault_keeper",
      title: "Breakthrough Keeper",
      description: "Pinned a key insight into your Resilience Vault.",
      category: "activity",
      icon: "💎",
      tier: "Gold",
      color: "text-[#FBBF24]",
      bgGradient: "from-amber-500/25 to-yellow-600/10",
      borderColor: "border-[#FBBF24]/40",
      requiredCount: 1,
      currentCount: Math.min(vaultItemsCount, 1),
      isUnlocked: vaultItemsCount >= 1,
      unlockedDate: vaultItemsCount >= 1 ? "Achieved" : undefined,
      quote: "Preserving wisdom ensures light is always reachable in dark moments.",
    },
  ];

  const unlockedCount = badges.filter((b) => b.isUnlocked).length;
  const totalBadges = badges.length;
  const progressPercent = Math.round((unlockedCount / totalBadges) * 100);

  const filteredBadges = badges.filter((b) => {
    if (filter === "unlocked") return b.isUnlocked;
    if (filter === "locked") return !b.isUnlocked;
    return true;
  });

  return (
    <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 text-left relative overflow-hidden" id="badgesSection">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 select-none">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-400/10 border border-amber-500/20 rounded-xl text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100 font-sans flex items-center gap-2">
              <span>Milestone Badges &amp; Streaks</span>
              <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
                {unlockedCount}/{totalBadges} Earned
              </span>
            </h4>
            <p className="text-[10px] text-slate-400 font-mono">
              Reward system for check-in consistency &amp; milestone progress
            </p>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 bg-black/20 p-1 rounded-xl border border-white/5 text-[10px] font-mono font-bold">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              filter === "all" ? "bg-amber-400 text-slate-950 shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter("unlocked")}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              filter === "unlocked" ? "bg-amber-400 text-slate-950 shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Unlocked ({unlockedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("locked")}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              filter === "locked" ? "bg-amber-400 text-slate-950 shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Locked ({totalBadges - unlockedCount})
          </button>
        </div>
      </div>

      {/* Progress Bar Header */}
      <div className="bg-black/20 border border-white/5 rounded-2xl p-3.5 mb-5 select-none">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-300 font-medium flex items-center gap-1.5 font-sans">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Overall Badge Progression
          </span>
          <span className="font-mono font-bold text-amber-400">{progressPercent}%</span>
        </div>
        <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.5)]"
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400 font-mono">
          <span className="flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-400" />
            Current Streak: <strong className="text-amber-300">{streak} Days</strong>
          </span>
          <span>Total Check-ins: <strong className="text-emerald-400">{totalCheckIns}</strong></span>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {filteredBadges.map((badge) => {
          const progress = Math.min(100, Math.round((badge.currentCount / badge.requiredCount) * 100));

          return (
            <motion.div
              key={badge.id}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedBadge(badge)}
              className={`p-3.5 rounded-2xl border flex flex-col items-center text-center cursor-pointer transition-all relative overflow-hidden select-none ${
                badge.isUnlocked
                  ? `bg-gradient-to-b ${badge.bgGradient} ${badge.borderColor} shadow-lg shadow-black/30 hover:border-amber-400/60`
                  : "bg-white/[0.02] border-white/5 opacity-60 hover:opacity-80 hover:border-white/20"
              }`}
            >
              {/* Badge Icon Header */}
              <div className="relative mb-2 mt-1">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border ${
                    badge.isUnlocked
                      ? "bg-slate-900/80 border-amber-400/40 shadow-[0_0_15px_rgba(251,191,36,0.2)]"
                      : "bg-slate-900/40 border-white/10 grayscale"
                  }`}
                >
                  {badge.icon}
                </div>
                {badge.isUnlocked ? (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-md">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                ) : (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-slate-800 text-slate-400 border border-white/10 flex items-center justify-center">
                    <Lock className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>

              {/* Title & Tier */}
              <h5 className={`text-xs font-bold leading-tight mb-1 font-sans ${badge.isUnlocked ? "text-slate-100" : "text-slate-400"}`}>
                {badge.title}
              </h5>
              <span className={`text-[9px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded border ${
                badge.isUnlocked
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
                  : "bg-white/5 border-white/5 text-slate-500"
              }`}>
                {badge.tier}
              </span>

              {/* Progress Bar for Locked */}
              {!badge.isUnlocked && (
                <div className="w-full mt-2.5">
                  <div className="flex justify-between text-[9px] font-mono text-slate-400 mb-1">
                    <span>Progress</span>
                    <span>{badge.currentCount}/{badge.requiredCount}</span>
                  </div>
                  <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                    <div
                      className="h-full bg-amber-400/70 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Badge Inspection Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setSelectedBadge(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-6 shadow-2xl relative text-left overflow-hidden select-none"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedBadge(null)}
                className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Badge Icon Header */}
              <div className="flex flex-col items-center text-center mb-5">
                <div
                  className={`w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-3 border ${
                    selectedBadge.isUnlocked
                      ? "bg-slate-900 border-amber-400/50 shadow-[0_0_25px_rgba(251,191,36,0.3)] animate-pulse"
                      : "bg-slate-900/50 border-white/10 grayscale"
                  }`}
                >
                  {selectedBadge.icon}
                </div>

                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-black text-white font-sans">{selectedBadge.title}</h3>
                  <span className={`text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded border ${
                    selectedBadge.isUnlocked
                      ? "bg-amber-500/20 border-amber-400/40 text-amber-300"
                      : "bg-white/5 border-white/10 text-slate-400"
                  }`}>
                    {selectedBadge.tier} Tier
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed max-w-xs">
                  {selectedBadge.description}
                </p>
              </div>

              {/* Status Box */}
              <div className="bg-black/30 border border-white/10 rounded-2xl p-4 mb-4">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-400 font-mono uppercase tracking-wider">Status:</span>
                  <span className={`font-bold font-mono flex items-center gap-1 ${
                    selectedBadge.isUnlocked ? "text-emerald-400" : "text-amber-400"
                  }`}>
                    {selectedBadge.isUnlocked ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        UNLOCKED
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        IN PROGRESS
                      </>
                    )}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-300 font-mono">
                    <span>Requirement</span>
                    <span>
                      {selectedBadge.currentCount} / {selectedBadge.requiredCount} {selectedBadge.category === "streak" ? "Days" : "Times"}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (selectedBadge.currentCount / selectedBadge.requiredCount) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Quote / Wisdom */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-5 text-xs text-amber-200/90 italic font-sans leading-relaxed">
                "{selectedBadge.quote}"
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const text = `I unlocked the "${selectedBadge.title}" badge on MindSafe AI! 🧠👊🏼 #SafeMindsBetterLives`;
                    navigator.clipboard.writeText(text);
                    setCopiedShare(true);
                    setTimeout(() => setCopiedShare(false), 2000);
                  }}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-bold font-mono flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  {copiedShare ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied Share text!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Share Badge</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedBadge(null)}
                  className="px-5 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-black font-sans cursor-pointer hover:bg-amber-300 transition-all shadow-md"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
