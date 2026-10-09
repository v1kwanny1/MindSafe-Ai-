import React from "react";
import { motion } from "motion/react";
import { Activity, Wind, Brain, Calendar, ShieldAlert, Sparkles, Heart } from "lucide-react";

interface ResiliencePulseRadarProps {
  activeGuide: "mindsafe" | "nanny";
  onSwitchGuide: (guide: "mindsafe" | "nanny") => void;
  emotionalTone?: "EMOTIONAL" | "TACTICAL" | "SPIRITUAL" | "BALANCED";
  turnCount?: number;
  onOpenBreathing: () => void;
  onOpenReframe: () => void;
  onOpenCalendar: () => void;
  onOpenCrisis: () => void;
}

export const ResiliencePulseRadar: React.FC<ResiliencePulseRadarProps> = ({
  activeGuide,
  onSwitchGuide,
  emotionalTone = "BALANCED",
  turnCount = 1,
  onOpenBreathing,
  onOpenReframe,
  onOpenCalendar,
  onOpenCrisis,
}) => {
  const getToneBadge = () => {
    switch (emotionalTone) {
      case "EMOTIONAL":
        return {
          label: "Overwhelmed • Seeking Grounding",
          color: "text-rose-300 bg-rose-500/10 border-rose-500/25",
          dot: "bg-rose-400"
        };
      case "TACTICAL":
        return {
          label: "Strategic • Solution-Driven",
          color: "text-sky-300 bg-sky-500/10 border-sky-500/25",
          dot: "bg-sky-400"
        };
      case "SPIRITUAL":
        return {
          label: "Reflective • Soul Grounding",
          color: "text-teal-300 bg-teal-500/10 border-teal-500/25",
          dot: "bg-teal-400"
        };
      case "BALANCED":
      default:
        return {
          label: "Balanced • In Rhythm",
          color: "text-amber-300 bg-amber-500/10 border-amber-500/25",
          dot: "bg-amber-400"
        };
    }
  };

  const badge = getToneBadge();

  return (
    <div className="w-full bg-gradient-to-r from-slate-900/90 via-slate-950/90 to-slate-900/90 border border-white/10 rounded-2xl p-2.5 sm:p-3 shadow-md backdrop-blur-md flex flex-wrap items-center justify-between gap-2.5">
      {/* Left: Guide Persona Quick Switcher */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">
          Active Guide:
        </span>
        <div className="flex items-center p-0.5 rounded-xl bg-black/40 border border-white/10">
          <button
            type="button"
            onClick={() => onSwitchGuide("mindsafe")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer font-sans ${
              activeGuide === "mindsafe"
                ? "bg-gradient-to-r from-amber-400 to-[#D97706] text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
            title="MindSafe AI Companion: Trusted Guide & Strategic Coach"
          >
            <span>🧠</span>
            <span className="hidden sm:inline">Companion</span>
          </button>
          <button
            type="button"
            onClick={() => onSwitchGuide("nanny")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer font-sans ${
              activeGuide === "nanny"
                ? "bg-gradient-to-r from-teal-400 to-emerald-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
            title="Nanny Frog: Gentle Spiritual Guide & Heart-Centred Anchor"
          >
            <span>🐸</span>
            <span className="hidden sm:inline">Nanny Frog</span>
          </button>
        </div>

        {/* Live Emotional Resonance Indicator */}
        <div
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold select-none ${badge.color}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full animate-ping ${badge.dot}`} />
          <span>{badge.label}</span>
        </div>
      </div>

      {/* Right: 2027 Rapid Micro-Tools */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={onOpenBreathing}
          className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 transition-all cursor-pointer shadow-xs"
          title="Start 60-Second Guided Calming Breathing"
        >
          <Wind className="w-3 h-3 text-teal-400" />
          <span>60s Grounding</span>
        </button>

        <button
          type="button"
          onClick={onOpenReframe}
          className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-all cursor-pointer shadow-xs"
          title="Open Cognitive Reframe Lens (CBT & Higher Wisdom)"
        >
          <Brain className="w-3 h-3 text-indigo-400" />
          <span>Reframe Thought</span>
        </button>

        <button
          type="button"
          onClick={onOpenCalendar}
          className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 transition-all cursor-pointer shadow-xs"
          title="Open Smart Calendar to block focus time"
        >
          <Calendar className="w-3 h-3 text-sky-400" />
          <span>Calendar</span>
        </button>

        <button
          type="button"
          onClick={onOpenCrisis}
          className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-all cursor-pointer shadow-xs"
          title="Emergency Help & UK Helplines (Samaritans 116 123 / 999)"
        >
          <ShieldAlert className="w-3 h-3 text-rose-400" />
          <span className="font-extrabold">SOS Hub</span>
        </button>
      </div>
    </div>
  );
};
