import React, { useState, useEffect } from "react";
import { Sparkles, RefreshCw, ChevronDown, ChevronUp, Target, ArrowRight, Check } from "lucide-react";
import { getRandomReflectionPrompts, ReflectionPrompt, RESILIENCE_FOCUS_PROMPTS } from "../utils/resiliencePrompts";

interface DailyReflectionPromptsProps {
  userFocus: string;
  onSelectPrompt: (promptText: string) => void;
  onUpdateFocus?: (newFocus: string) => void;
}

export const DailyReflectionPrompts: React.FC<DailyReflectionPromptsProps> = ({
  userFocus,
  onSelectPrompt,
  onUpdateFocus,
}) => {
  const [prompts, setPrompts] = useState<ReflectionPrompt[]>(() => getRandomReflectionPrompts(userFocus, 3));
  const [isRotating, setIsRotating] = useState(false);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Refresh prompts when resilience focus setting changes
  useEffect(() => {
    setPrompts(getRandomReflectionPrompts(userFocus, 3));
  }, [userFocus]);

  const handleShuffle = () => {
    setIsRotating(true);
    setPrompts(getRandomReflectionPrompts(userFocus, 3));
    setTimeout(() => setIsRotating(false), 500);
  };

  const handlePromptClick = (prompt: ReflectionPrompt) => {
    setCopiedPromptId(prompt.id);
    onSelectPrompt(prompt.text);
    setTimeout(() => setCopiedPromptId(null), 2500);
  };

  const focusOptions = Object.keys(RESILIENCE_FOCUS_PROMPTS);

  return (
    <div className="w-full mt-4 select-none animate-fadeIn transition-all">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300 font-sans">
            <span className="flex h-5 w-5 rounded-md bg-amber-500/20 text-amber-300 items-center justify-center text-xs shadow-2xs">
              🎯
            </span>
            <span>Daily Reflection Prompts</span>
          </div>

          {/* Active Resilience Focus Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/40 text-amber-300 transition-all cursor-pointer shadow-2xs group"
              title="Change resilience focus"
            >
              <Target className="w-2.5 h-2.5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>{userFocus}</span>
              <ChevronDown className={`w-2.5 h-2.5 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Quick dropdown for resilience focus */}
            {isDropdownOpen && onUpdateFocus && (
              <div className="absolute left-0 mt-1.5 w-56 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl py-1.5 z-30 backdrop-blur-md">
                <div className="px-3 py-1 text-[9px] uppercase tracking-wider font-mono text-slate-400 border-b border-slate-800">
                  Select Resilience Focus
                </div>
                {focusOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      onUpdateFocus(opt);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-[11px] font-medium flex items-center justify-between transition-colors cursor-pointer ${
                      userFocus === opt
                        ? "bg-amber-500/20 text-amber-200 font-bold"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span>{opt}</span>
                    {userFocus === opt && <Check className="w-3 h-3 text-amber-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Controls: Shuffle & Collapse */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleShuffle}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/40 text-slate-300 hover:text-amber-300 text-[11px] font-medium transition-all cursor-pointer shadow-2xs group"
            title="Shuffle 3 random reflection prompts"
          >
            <RefreshCw
              className={`w-3 h-3 text-slate-400 group-hover:text-amber-400 transition-transform ${
                isRotating ? "rotate-180" : ""
              }`}
            />
            <span className="hidden sm:inline">Shuffle</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="p-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-slate-200 text-xs transition-colors cursor-pointer"
            title={isCollapsed ? "Expand reflection prompts" : "Collapse reflection prompts"}
          >
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 3 Reflection Prompts Cards Grid */}
      {!isCollapsed && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {prompts.map((prompt) => {
            const isSelected = copiedPromptId === prompt.id;
            return (
              <button
                key={prompt.id}
                type="button"
                onClick={() => handlePromptClick(prompt)}
                className={`relative group p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between shadow-2xs overflow-hidden ${
                  isSelected
                    ? "bg-amber-500/20 border-amber-400 ring-1 ring-amber-400/50 shadow-[0_0_12px_rgba(251,191,36,0.2)]"
                    : "bg-white/[0.03] hover:bg-white/[0.07] border-white/10 hover:border-amber-400/50 text-slate-200"
                }`}
              >
                {/* Background glow on hover */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-amber-500/10 transition-colors" />

                <div>
                  {/* Category Pill & Title */}
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm shrink-0">{prompt.emoji}</span>
                      <span className="text-[11px] font-bold text-slate-100 group-hover:text-amber-300 transition-colors line-clamp-1">
                        {prompt.title}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/5 shrink-0">
                      {prompt.tag}
                    </span>
                  </div>

                  {/* Inquiry Prompt Text */}
                  <p className="text-[11.5px] leading-relaxed text-slate-300 group-hover:text-slate-100 transition-colors line-clamp-3">
                    "{prompt.text}"
                  </p>
                </div>

                {/* Bottom CTA / Status */}
                <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-medium">
                  {isSelected ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-bold animate-fadeIn">
                      <Check className="w-3 h-3" />
                      <span>Loaded into chat!</span>
                    </span>
                  ) : (
                    <span className="text-amber-400/80 group-hover:text-amber-300 flex items-center gap-1 transition-colors">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>Click to start session</span>
                    </span>
                  )}
                  <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
