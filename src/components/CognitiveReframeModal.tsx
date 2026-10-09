import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles, Brain, Check, RefreshCw, BookOpen, Target, Send, ArrowRight, ShieldCheck, HeartHandshake, Compass } from "lucide-react";

export interface CognitiveDistortion {
  id: string;
  name: string;
  description: string;
  example: string;
  evidenceCheck: string;
  victorsInsight: string;
  reframeTemplate: (thought: string) => string;
}

export const COGNITIVE_DISTORTIONS: CognitiveDistortion[] = [
  {
    id: "catastrophizing",
    name: "Catastrophizing",
    description: "Anticipating the absolute worst-case scenario and treating it as an inevitable certainty.",
    example: "If I don't handle this right, my entire career and life are ruined.",
    evidenceCheck: "Feelings of dread are adrenaline spikes, not probability forecasts. What is the most likely, realistic outcome based on facts?",
    victorsInsight: "When I faced my darkest challenges, my mind insisted ruin was guaranteed. In reality, setbacks were uncomfortable, but they never ended the story. We always adapt.",
    reframeTemplate: (thought) =>
      `While this feels intense right now, catastrophic forecasts are rarely accurate. I have handled unexpected difficulties before, and I can take this one step at a time.`
  },
  {
    id: "all_or_nothing",
    name: "All-or-Nothing Thinking",
    description: "Viewing situations in black-and-white categories with no middle ground for human progress.",
    example: "I missed one workout, so my whole week of habits is a total failure.",
    evidenceCheck: "Resilience is built on consistency over time, not 100% perfection. 80% sustained effort beats 100% followed by burnout every single time.",
    victorsInsight: "One missed step doesn't erase ten steps forward. The moment you give yourself permission to be human, the anxiety loses its grip.",
    reframeTemplate: (thought) =>
      `A single imperfection does not cancel my progress. Growth is non-linear, and showing up today still counts.`
  },
  {
    id: "mind_reading",
    name: "Mind Reading",
    description: "Assuming you know what other people are thinking, almost always assuming they are judging or rejecting you.",
    example: "They didn't reply to my message, they must be annoyed with me.",
    evidenceCheck: "You cannot read minds. Most people are completely consumed by their own busy lives, fatigue, or stress.",
    victorsInsight: "I used to waste hours dissecting what someone 'probably thought' of me. 99% of the time, they were simply dealing with their own chaos.",
    reframeTemplate: (thought) =>
      `I don't have proof of what they are thinking. Rather than inventing negative stories, I choose to focus on what I can control.`
  },
  {
    id: "emotional_reasoning",
    name: "Emotional Reasoning",
    description: "Believing that because you feel a certain way (e.g., overwhelmed, worthless), it must be an objective fact.",
    example: "I feel like a fraud, so I must be incompetent.",
    evidenceCheck: "Emotions are real somatic sensations, but they are not infallible data points. Feelings are signals, not sentences.",
    victorsInsight: "Just because fear whispers that you can't do this doesn't mean it's the truth. Courage is moving forward while the feeling is still loud.",
    reframeTemplate: (thought) =>
      `My feelings are valid experiences, but they are not cold facts. I feel uncertain, yet I possess real capability and resilience.`
  },
  {
    id: "should_statements",
    name: "The 'Should' Prison",
    description: "Using 'shoulds', 'musts', and 'oughts' to criticize yourself or demand unrealistic emotional control.",
    example: "I should already be over this. I shouldn't be struggling.",
    evidenceCheck: "'Should' creates artificial guilt and blocks self-compassion. Healing and problem-solving have their own natural rhythm.",
    victorsInsight: "Whenever I beat myself up with 'I should have known better', it drained the energy I needed to fix the problem. Trade judgment for curiosity.",
    reframeTemplate: (thought) =>
      `I replace 'I should' with 'I choose to learn and do what is possible today'. I am allowed to be in process.`
  },
  {
    id: "mental_filtering",
    name: "Mental Filtering",
    description: "Magnifying one negative detail while completely screening out all positive achievements and wins.",
    example: "The whole day was awful because of one awkward conversation.",
    evidenceCheck: "Zoom out to the full landscape. What are three things that went right or stayed steady today that your filter is ignoring?",
    victorsInsight: "The human brain is an ancient survival machine programmed to scan for threats. You have to actively teach it to notice your quiet wins.",
    reframeTemplate: (thought) =>
      `I am zooming out. While one part was difficult, it does not define the entirety of my effort or my day.`
  }
];

export function detectDistortionFromText(text: string): CognitiveDistortion {
  const lower = text.toLowerCase();

  if (
    lower.includes("ruined") ||
    lower.includes("disaster") ||
    lower.includes("end of the world") ||
    lower.includes("worst") ||
    lower.includes("never recover") ||
    lower.includes("die") ||
    lower.includes("terrible")
  ) {
    return COGNITIVE_DISTORTIONS[0]; // Catastrophizing
  }

  if (
    lower.includes("fail") ||
    lower.includes("all or nothing") ||
    lower.includes("always") ||
    lower.includes("never") ||
    lower.includes("total") ||
    lower.includes("pointless") ||
    lower.includes("worthless")
  ) {
    return COGNITIVE_DISTORTIONS[1]; // All or Nothing
  }

  if (
    lower.includes("they think") ||
    lower.includes("hates me") ||
    lower.includes("judging me") ||
    lower.includes("disappointed in me") ||
    lower.includes("annoyed with me")
  ) {
    return COGNITIVE_DISTORTIONS[2]; // Mind Reading
  }

  if (
    lower.includes("feel like a") ||
    lower.includes("fraud") ||
    lower.includes("stupid") ||
    lower.includes("weak") ||
    lower.includes("broken")
  ) {
    return COGNITIVE_DISTORTIONS[3]; // Emotional Reasoning
  }

  if (
    lower.includes("should") ||
    lower.includes("must") ||
    lower.includes("ought to") ||
    lower.includes("supposed to")
  ) {
    return COGNITIVE_DISTORTIONS[4]; // Shoulds
  }

  return COGNITIVE_DISTORTIONS[5]; // Mental Filter
}

interface CognitiveReframeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialThought?: string;
  onAdoptAsGoal?: (reframeText: string) => void;
  onSaveToJournal?: (reframeText: string, originalThought: string, distortionName: string) => void;
  onSendToChat?: (text: string) => void;
}

export const CognitiveReframeModal: React.FC<CognitiveReframeModalProps> = ({
  isOpen,
  onClose,
  initialThought = "",
  onAdoptAsGoal,
  onSaveToJournal,
  onSendToChat,
}) => {
  const [thoughtInput, setThoughtInput] = useState(initialThought || "");
  const [selectedDistortionId, setSelectedDistortionId] = useState<string>("catastrophizing");
  const [hasReframed, setHasReframed] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialThought) {
      setThoughtInput(initialThought);
      const detected = detectDistortionFromText(initialThought);
      setSelectedDistortionId(detected.id);
      setHasReframed(true);
    }
  }, [initialThought]);

  if (!isOpen) return null;

  const currentDistortion =
    COGNITIVE_DISTORTIONS.find((d) => d.id === selectedDistortionId) || COGNITIVE_DISTORTIONS[0];

  const balancedAlternative = thoughtInput.trim()
    ? currentDistortion.reframeTemplate(thoughtInput.trim())
    : "While things feel challenging right now, I have the resilience to move forward one grounded step at a time.";

  const handleAnalyze = () => {
    if (!thoughtInput.trim()) return;
    const detected = detectDistortionFromText(thoughtInput);
    setSelectedDistortionId(detected.id);
    setHasReframed(true);
  };

  const showFeedback = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white font-sans">
                  MindSafe Cognitive Reframe Lens
                </h3>
                <span className="text-[10px] uppercase font-mono font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  2027 Core
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                Evidence-based CBT & lived resilience experience to transform heavy thoughts.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action feedback toast */}
        <AnimatePresence>
          {actionNotice && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-emerald-500/20 border-b border-emerald-500/30 px-4 py-2 text-xs text-emerald-300 flex items-center gap-2 font-medium"
            >
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{actionNotice}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-left">
          {/* Automatic Negative Thought Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Automatic Negative Thought (ANT)</span>
              <span className="text-[10px] text-slate-500 font-mono">What is your mind telling you?</span>
            </label>
            <div className="relative">
              <textarea
                value={thoughtInput}
                onChange={(e) => {
                  setThoughtInput(e.target.value);
                  setHasReframed(false);
                }}
                placeholder="e.g., I missed my goal today, I'm falling behind and ruining everything..."
                rows={2}
                className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 transition-colors font-sans resize-none"
              />
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={!thoughtInput.trim()}
                className="absolute right-2.5 bottom-2.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Reframe Lens</span>
              </button>
            </div>

            {/* Quick thought presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400 font-mono">Quick test:</span>
              {[
                "I'm falling behind everyone else",
                "If I make one mistake, it's ruined",
                "I should already be stronger than this",
                "They didn't reply, they must be annoyed"
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setThoughtInput(preset);
                    const detected = detectDistortionFromText(preset);
                    setSelectedDistortionId(detected.id);
                    setHasReframed(true);
                  }}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors cursor-pointer"
                >
                  "{preset.slice(0, 24)}..."
                </button>
              ))}
            </div>
          </div>

          {/* Distortion Archetypes Selector */}
          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-bold text-slate-300 block">
              Identified Cognitive Distortion:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COGNITIVE_DISTORTIONS.map((distortion) => {
                const isSelected = distortion.id === selectedDistortionId;
                return (
                  <button
                    key={distortion.id}
                    type="button"
                    onClick={() => {
                      setSelectedDistortionId(distortion.id);
                      setHasReframed(true);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                      isSelected
                        ? "bg-indigo-500/15 border-indigo-400/50 shadow-[0_0_12px_rgba(99,102,241,0.2)]"
                        : "bg-white/[0.03] border-white/5 hover:border-white/15 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold font-sans ${isSelected ? "text-indigo-300" : "text-slate-300"}`}>
                        {distortion.name}
                      </span>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                    </div>
                    <span className="text-[10px] text-slate-400 leading-snug line-clamp-2">
                      {distortion.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reframed Deep Dive (Evidence + Victor's Lived Perspective) */}
          <div className="space-y-3 pt-2">
            {/* The Grounding Truth / Evidence Check */}
            <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-200 text-xs leading-relaxed space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-sky-300 uppercase tracking-wider text-[10px] font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                <span>Clinical Grounding (Objective Reality)</span>
              </div>
              <p>{currentDistortion.evidenceCheck}</p>
            </div>

            {/* Victor's Lived Experience */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs leading-relaxed space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-300 uppercase tracking-wider text-[10px] font-mono">
                <HeartHandshake className="w-3.5 h-3.5 text-amber-400" />
                <span>Lived Experience &amp; Higher Wisdom</span>
              </div>
              <p className="italic">"{currentDistortion.victorsInsight}"</p>
            </div>

            {/* The 2027 Balanced Alternative Thought */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-emerald-500/10 border border-emerald-500/30 text-emerald-100 text-xs sm:text-sm space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-emerald-300 uppercase tracking-wider text-[10px] font-mono">
                  <Compass className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Balanced 2027 Replacement Thought</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">Anchor</span>
              </div>
              <p className="font-medium leading-relaxed text-slate-100 font-sans">
                "{balancedAlternative}"
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-white/[0.02] flex flex-wrap items-center justify-between gap-2.5">
          <div className="text-[11px] text-slate-400 font-mono">
            Empowered choice • Turn thoughts into action
          </div>

          <div className="flex items-center gap-2">
            {/* Save to Journal */}
            <button
              type="button"
              onClick={() => {
                if (onSaveToJournal) {
                  onSaveToJournal(balancedAlternative, thoughtInput, currentDistortion.name);
                  showFeedback("Saved to Resilience Journal under #cognitive-reframe!");
                } else {
                  try {
                    const today = new Date().toISOString().split("T")[0];
                    const existing = JSON.parse(localStorage.getItem("mindsafe_journal_entries") || "{}");
                    const prevText = existing[today]?.text || "";
                    existing[today] = {
                      date: today,
                      text: prevText
                        ? `${prevText}\n\n[🧠 Cognitive Reframe - ${currentDistortion.name}]\nOriginal: "${thoughtInput}"\nBalanced Reframe: "${balancedAlternative}"`
                        : `[🧠 Cognitive Reframe - ${currentDistortion.name}]\nOriginal: "${thoughtInput}"\nBalanced Reframe: "${balancedAlternative}"`,
                      updatedAt: new Date().toISOString(),
                    };
                    localStorage.setItem("mindsafe_journal_entries", JSON.stringify(existing));
                    showFeedback("Saved to Resilience Journal under #cognitive-reframe!");
                  } catch (e) {
                    console.error(e);
                  }
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Save to Journal</span>
            </button>

            {/* Adopt as Focus Goal */}
            <button
              type="button"
              onClick={() => {
                const shortGoal = balancedAlternative.length > 55 ? balancedAlternative.slice(0, 52) + "..." : balancedAlternative;
                if (onAdoptAsGoal) {
                  onAdoptAsGoal(shortGoal);
                } else {
                  try {
                    const today = new Date().toISOString().split("T")[0];
                    localStorage.setItem("mindsafe_daily_goal", JSON.stringify({ text: shortGoal, completed: false, date: today }));
                    localStorage.setItem("mindsafe_staged_next_goal", shortGoal);
                  } catch (e) {
                    console.error(e);
                  }
                }
                showFeedback("Adopted as your resilience focus anchor!");
              }}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Target className="w-3.5 h-3.5" />
              <span>Set as Daily Anchor</span>
            </button>

            {/* Send to Chat */}
            {onSendToChat && (
              <button
                type="button"
                onClick={() => {
                  onSendToChat(`I was wrestling with this thought: "${thoughtInput}". The cognitive reframe is: "${balancedAlternative}". Can you help me integrate this mindset into my day?`);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Discuss with Guide</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
