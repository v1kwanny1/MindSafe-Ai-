import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertTriangle,
  Phone,
  Heart,
  Shield,
  X,
  Copy,
  Check,
  Eye,
  Hand,
  Volume2,
  Smile,
  Sparkles,
  Wind,
} from "lucide-react";

interface CrisisEmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBreathing?: () => void;
  onTriggerExercise?: (text: string) => void;
}

export const CrisisEmergencyModal: React.FC<CrisisEmergencyModalProps> = ({
  isOpen,
  onClose,
  onSelectBreathing,
}) => {
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"helplines" | "grounding" | "breathing">("helplines");
  const [groundingStep, setGroundingStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Reset steps on open
  useEffect(() => {
    if (isOpen) {
      setGroundingStep(0);
      setCompletedSteps([]);
    }
  }, [isOpen]);

  const copyToClipboard = (num: string, label: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(label);
    setTimeout(() => setCopiedNumber(null), 2500);
  };

  const groundingSteps = [
    {
      num: 5,
      icon: Eye,
      title: "5 Things You Can See",
      desc: "Look around your space right now. Notice 5 distinct objects, colors, shadows, or patterns (e.g. a clock, the texture of a wall, light through a window).",
      prompt: "I see 5 things around me...",
    },
    {
      num: 4,
      icon: Hand,
      title: "4 Things You Can Physically Feel",
      desc: "Bring awareness to physical contact. Notice the ground beneath your feet, fabric against your skin, temperature of your hands, or texture of your chair.",
      prompt: "I feel 4 physical sensations...",
    },
    {
      num: 3,
      icon: Volume2,
      title: "3 Things You Can Hear",
      desc: "Close your eyes or look down. Listen for 3 subtle sounds (e.g. distant traffic, clock ticking, the hum of a computer, your own breath).",
      prompt: "I hear 3 distinct sounds...",
    },
    {
      num: 2,
      icon: Sparkles,
      title: "2 Things You Can Smell",
      desc: "Inhale gently through your nose. Notice any scent in the air, your clothes, fresh air from a window, or imagine the calming scent of fresh lavender or pine.",
      prompt: "I smell or recall 2 scents...",
    },
    {
      num: 1,
      icon: Smile,
      title: "1 Good Thing About Yourself or Today",
      desc: "Acknowledge one fact: you are here, you are breathing, you have survived 100% of your hardest days. You deserve safety, kindness, and time.",
      prompt: "One true thing: I am worthy of safety and healing.",
    },
  ];

  const helplines = [
    {
      name: "Samaritans (UK & ROI)",
      number: "116 123",
      tel: "116123",
      desc: "Free 24/7 confidential listening support for anyone in distress or needing to talk.",
      badge: "Free 24/7",
      color: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    },
    {
      name: "Shout Crisis Text Line (UK)",
      number: "Text SHOUT to 85258",
      tel: "sms:85258?body=SHOUT",
      desc: "Free, confidential 24/7 text support if you prefer messaging over speaking.",
      badge: "Free 24/7 Text",
      color: "border-blue-500/40 bg-blue-500/10 text-blue-300",
    },
    {
      name: "Mind Infoline & Urgent Help",
      number: "0300 123 3393",
      tel: "03001233393",
      desc: "Expert mental health support, advice on treatments, rights, and local support services.",
      badge: "Mon-Fri 9am-6pm",
      color: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
    },
    {
      name: "988 Suicide & Crisis Lifeline (US/Int)",
      number: "988",
      tel: "988",
      desc: "Free 24/7 call and text support across the United States & International partner networks.",
      badge: "Free 24/7",
      color: "border-purple-500/40 bg-purple-500/10 text-purple-300",
    },
    {
      name: "Emergency Services (Immediate Danger)",
      number: "999 (UK) / 911 (US) / 112 (EU)",
      tel: "999",
      desc: "If you or someone else is in immediate physical danger, contact emergency services without delay.",
      badge: "Emergency",
      color: "border-rose-500/40 bg-rose-500/10 text-rose-300",
    },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-slate-900 border border-rose-500/30 rounded-2xl shadow-[0_0_50px_rgba(244,63,94,0.2)] overflow-hidden my-8"
          id="crisisEmergencyModal"
        >
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-amber-950 px-6 py-4 border-b border-rose-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>🚨 Crisis SOS &amp; Rapid Safety Hub</span>
                </h3>
                <p className="text-xs text-rose-300/80 font-mono">
                  You are safe here. Free, confidential human support is available 24/7.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Close Crisis Hub"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex border-b border-white/10 bg-slate-950/50 p-2 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("helplines")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "helplines"
                  ? "bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>24/7 Helplines</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("grounding")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "grounding"
                  ? "bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>5-4-3-2-1 Grounding</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (onSelectBreathing) {
                  onClose();
                  onSelectBreathing();
                } else {
                  setActiveTab("breathing");
                }
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "breathing"
                  ? "bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Wind className="w-3.5 h-3.5" />
              <span>Box Breathing</span>
            </button>
          </div>

          <div className="p-6 max-h-[68vh] overflow-y-auto space-y-4">
            {/* TAB 1: 24/7 HELPLINES */}
            {activeTab === "helplines" && (
              <div className="space-y-3">
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3.5 text-xs text-rose-200 flex items-start gap-2.5">
                  <Shield className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Confidential &amp; Free:</span> None of these helplines show up on standard itemized phone bills, and trained professionals are ready to listen without judgment.
                  </div>
                </div>

                <div className="space-y-2.5">
                  {helplines.map((line, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{line.name}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono ${line.color}`}>
                            {line.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{line.desc}</p>
                        <div className="text-sm font-mono font-bold text-amber-400">{line.number}</div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(line.number, line.name)}
                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
                          title="Copy phone number"
                        >
                          {copiedNumber === line.name ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        <a
                          href={`tel:${line.tel}`}
                          className="px-3.5 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(244,63,94,0.3)] cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: INTERACTIVE 5-4-3-2-1 GROUNDING */}
            {activeTab === "grounding" && (
              <div className="space-y-4">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-200">
                  <span className="font-bold">5-4-3-2-1 Sensory Protocol:</span> When anxiety or panic spikes, this proven neuro-grounding tool pulls your brain out of fight-or-flight back into the physical present.
                </div>

                <div className="space-y-3">
                  {groundingSteps.map((step, idx) => {
                    const StepIcon = step.icon;
                    const isCompleted = completedSteps.includes(idx);
                    const isCurrent = groundingStep === idx;

                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border transition-all ${
                          isCompleted
                            ? "bg-emerald-500/10 border-emerald-500/30"
                            : isCurrent
                            ? "bg-amber-500/10 border-amber-400/50 shadow-[0_0_15px_rgba(251,191,36,0.15)]"
                            : "bg-white/5 border-white/5 opacity-60"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm font-mono shrink-0 ${
                                isCompleted
                                  ? "bg-emerald-500 text-slate-950"
                                  : isCurrent
                                  ? "bg-amber-400 text-slate-950"
                                  : "bg-white/10 text-slate-300"
                              }`}
                            >
                              {step.num}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <StepIcon className="w-4 h-4 text-amber-400" />
                                <span className="font-bold text-sm text-white">{step.title}</span>
                              </div>
                              <p className="text-xs text-slate-300">{step.desc}</p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (isCompleted) {
                                setCompletedSteps((prev) => prev.filter((i) => i !== idx));
                              } else {
                                setCompletedSteps((prev) => [...prev, idx]);
                                if (groundingStep < groundingSteps.length - 1) {
                                  setGroundingStep(idx + 1);
                                }
                              }
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              isCompleted
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                : "bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.3)]"
                            }`}
                          >
                            {isCompleted ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Completed</span>
                              </>
                            ) : (
                              <span>Check Off</span>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {completedSteps.length === 5 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-xl bg-gradient-to-r from-emerald-950 to-slate-900 border border-emerald-400/40 text-center space-y-2"
                  >
                    <div className="text-lg">🌿 💚 🧘</div>
                    <h4 className="font-bold text-emerald-300 text-sm">You did it. You are grounded and safe.</h4>
                    <p className="text-xs text-slate-300">
                      Your mind is anchored in the present moment. Drink a glass of cold water and take another slow breath.
                    </p>
                  </motion.div>
                )}
              </div>
            )}

            {/* TAB 3: BOX BREATHING QUICK PULSE */}
            {activeTab === "breathing" && (
              <div className="p-6 text-center space-y-4">
                <div className="w-28 h-28 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center animate-pulse">
                  <Wind className="w-10 h-10 text-emerald-300" />
                </div>
                <h4 className="font-bold text-white text-base">Box Breathing (4-4-4-4)</h4>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Inhale for 4 seconds • Hold for 4 seconds • Exhale for 4 seconds • Hold empty for 4 seconds.
                </p>
                {onSelectBreathing && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSelectBreathing();
                    }}
                    className="px-6 py-2.5 rounded-xl bg-emerald-400 text-slate-950 font-bold text-xs hover:bg-emerald-300 transition-all shadow-[0_0_20px_rgba(52,211,153,0.3)] cursor-pointer"
                  >
                    Launch Full Audio Breathing Engine →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer Note */}
          <div className="p-4 bg-slate-950 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <div className="flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              <span>MindSafe Mission: Safer Lives • Stronger Minds</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white underline cursor-pointer"
            >
              Return to Session
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
