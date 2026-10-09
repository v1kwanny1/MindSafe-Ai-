import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Copy, Check, Heart, RefreshCw, MessageSquare } from "lucide-react";

interface DailyAffirmationProps {
  onTriggerPrompt: (promptText: string) => void;
}

interface Affirmation {
  id: number;
  text: string;
  focus: string;
}

const AFFIRMATIONS: Affirmation[] = [
  {
    id: 1,
    text: "My scars are a testament to my survival, not my limitations. I am stronger than what tried to break me.",
    focus: "Survival & Resilience"
  },
  {
    id: 2,
    text: "I don't have to carry the entire weight of my past today. I am safe, I am here, and I am breathing.",
    focus: "Safety & Presence"
  },
  {
    id: 3,
    text: "Strength is not the absence of fear or pain; it is the courage to take the next small step forward anyway.",
    focus: "Courageous Action"
  },
  {
    id: 4,
    text: "I am the author of my healing story. Each breath is a new line, each day is a new page of victory.",
    focus: "Self-Determination"
  },
  {
    id: 5,
    text: "My past was loud, but my future is mine to write. I choose peace, power, and patience with myself today.",
    focus: "Inner Peace"
  },
  {
    id: 6,
    text: "I have survived 100% of my hardest days. Today's challenges are just a stepping stone to my ultimate growth.",
    focus: "Proved Strength"
  },
  {
    id: 7,
    text: "I release the need to control everything. I focus my energy on what I can control: my breath, my mind, my now.",
    focus: "Control & Focus"
  },
  {
    id: 8,
    text: "I am allowed to heal in my own time. There is no timeline for resilience; there is only progress.",
    focus: "Self-Compassion"
  },
  {
    id: 9,
    text: "Every storm runs out of rain. Even in the deepest night, I carry the spark of my own sunrise.",
    focus: "Hope & Light"
  },
  {
    id: 10,
    text: "I trust my capacity to handle whatever today brings. I am grounded, resourceful, and capable.",
    focus: "Self-Trust"
  },
  {
    id: 11,
    text: "My worth is inherent, not defined by my achievements or my struggles. I am whole, just as I am.",
    focus: "Self-Worth"
  },
  {
    id: 12,
    text: "Quiet growth is still growth. I celebrate the tiny victories that nobody else can see.",
    focus: "Celebration"
  }
];

export default function DailyAffirmation({ onTriggerPrompt }: DailyAffirmationProps) {
  // Get index based on day of the year so it rotates automatically each day
  const getDailyIndex = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);
    return day % AFFIRMATIONS.length;
  };

  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    const saved = localStorage.getItem("mindsafe_affirmation_index");
    if (saved !== null) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed < AFFIRMATIONS.length) {
        return parsed;
      }
    }
    return getDailyIndex();
  });

  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem("mindsafe_affirmation_favorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [copied, setCopied] = useState(false);
  const [direction, setDirection] = useState(1); // 1 for next, -1 for prev for transitions

  useEffect(() => {
    localStorage.setItem("mindsafe_affirmation_index", String(currentIndex));
  }, [currentIndex]);

  useEffect(() => {
    localStorage.setItem("mindsafe_affirmation_favorites", JSON.stringify(favorites));
  }, [favorites]);

  const activeAffirmation = AFFIRMATIONS[currentIndex];
  const isFavorited = favorites.includes(activeAffirmation.id);

  const handleCopy = () => {
    navigator.clipboard.writeText(`"${activeAffirmation.text}" — Focus: ${activeAffirmation.focus}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleFavorite = () => {
    if (isFavorited) {
      setFavorites((prev) => prev.filter((id) => id !== activeAffirmation.id));
    } else {
      setFavorites((prev) => [...prev, activeAffirmation.id]);
    }
  };

  const handleShuffle = () => {
    setDirection(1);
    let nextIndex = currentIndex;
    // Ensure we don't repeat the same quote immediately
    while (nextIndex === currentIndex && AFFIRMATIONS.length > 1) {
      nextIndex = Math.floor(Math.random() * AFFIRMATIONS.length);
    }
    setCurrentIndex(nextIndex);
  };

  const handleResetToDaily = () => {
    const dailyIdx = getDailyIndex();
    if (dailyIdx !== currentIndex) {
      setDirection(-1);
      setCurrentIndex(dailyIdx);
    }
  };

  const handleReflectInChat = () => {
    const promptText = `I want to reflect on today's affirmation: "${activeAffirmation.text}" (${activeAffirmation.focus}). Can you guide me through a self-reflection about how this applies to my journey?`;
    onTriggerPrompt(promptText);
  };

  return (
    <div
      className="bg-white/5 border border-white/10 rounded-[24px] p-6 backdrop-blur-md relative overflow-hidden text-left flex flex-col"
      id="dailyAffirmationWidget"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between mb-4 select-none">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </span>
          <div>
            <h4 className="text-sm font-bold text-slate-100 tracking-wide font-sans">
              Daily Affirmation Shield
            </h4>
            <p className="text-[9px] text-slate-400 font-mono uppercase tracking-widest">
              Empowerment for trauma recovery
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {currentIndex !== getDailyIndex() && (
            <button
              type="button"
              onClick={handleResetToDaily}
              className="text-[9px] font-mono text-rose-400 hover:text-rose-300 font-bold bg-rose-500/10 hover:bg-rose-500/20 px-2 py-0.5 rounded cursor-pointer transition-all"
              title="Return to today's scheduled affirmation"
              id="btnResetToDailyAffirmation"
            >
              TODAY'S
            </button>
          )}
          <span className="text-[10px] bg-slate-900/50 text-rose-300/90 px-2 py-0.5 rounded-full border border-rose-500/10 font-mono tracking-wider">
            {activeAffirmation.focus}
          </span>
        </div>
      </div>

      <div className="relative min-h-[70px] flex items-center mb-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeAffirmation.id}
            initial={{ opacity: 0, x: direction * 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * 15 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="w-full relative pl-4 border-l-2 border-rose-400/50 py-1"
            id={`affirmationText-${activeAffirmation.id}`}
          >
            <p className="text-sm text-slate-200 italic leading-relaxed font-sans">
              "{activeAffirmation.text}"
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-2 pt-3 border-t border-white/5 flex items-center justify-between">
        <div className="flex gap-1.5">
          {/* Heart Button */}
          <button
            type="button"
            onClick={handleToggleFavorite}
            className={`p-2 rounded-xl transition-all border cursor-pointer select-none ${
              isFavorited
                ? "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
                : "bg-white/5 border-white/10 text-slate-400 hover:text-rose-400 hover:border-rose-500/20"
            }`}
            title={isFavorited ? "Remove from favorite affirmations" : "Mark as favorite affirmation"}
            id="btnFavoriteAffirmation"
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorited ? "fill-rose-400" : ""}`} />
          </button>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all cursor-pointer select-none"
            title="Copy affirmation to clipboard"
            id="btnCopyAffirmation"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Reflect in Chat Button */}
          <button
            type="button"
            onClick={handleReflectInChat}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/15 text-[11px] font-bold text-rose-300 hover:bg-rose-500/20 hover:text-rose-200 transition-all cursor-pointer select-none"
            title="Send affirmation to AI companion to guide reflection"
            id="btnReflectAffirmationInChat"
          >
            <MessageSquare className="w-3 h-3" />
            <span>Reflect in Chat</span>
          </button>
        </div>

        {/* Shuffle Button */}
        <button
          type="button"
          onClick={handleShuffle}
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-rose-400 hover:border-rose-500/20 transition-all cursor-pointer select-none flex items-center justify-center gap-1.5"
          title="Shuffle to another empowerment affirmation"
          id="btnShuffleAffirmation"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="text-[10px] font-mono font-bold tracking-wider uppercase hidden xs:inline">Next</span>
        </button>
      </div>
    </div>
  );
}
