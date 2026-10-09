import React, { useState } from "react";
import { Globe, ExternalLink, Copy, Check, Sparkles, ShieldCheck } from "lucide-react";

interface WebSource {
  title: string;
  uri: string;
}

interface DolaResponseCardProps {
  text: string;
  isWebGrounded?: boolean;
  webSources?: WebSource[];
  suggestedActions?: string[];
  searchQuery?: string;
  onSelectAction?: (actionText: string) => void;
  highlightText?: (content: string, query?: string) => React.ReactNode;
  isBillingError?: boolean;
  activeGuide?: "mindsafe" | "nanny";
}

// Clean unified text: strips legacy multi-box markers, choices tags, suggestions, and option blocks
export function cleanUnifiedText(rawText: string): string {
  if (!rawText) return "";
  return rawText
    .replace(/\[CHOICES:\s*[\s\S]*?\]/gi, "")
    .replace(/###\s*(?:💡\s*)?Coaching Insights\s*\n*/gi, "")
    .replace(/###\s*(?:🌐\s*)?Web-Grounded Facts\s*\n*/gi, "\n\n")
    .replace(/###\s*(?:⚡\s*)?Proactive Next Steps\s*\n*/gi, "\n\n")
    .replace(/\n{2,}(?:Which of these (?:3 )?(?:actionable |peaceful )?(?:paths|options|choices) would you like to take forward\??\s*\n*)?(?:•|\*|-)\s*\*\*Option 1\*\*[\s\S]*$/gi, "")
    .replace(/(?:^|\n)\s*(?:•|\*|-)\s*\*\*Option\s*[1-3]\*\*:[^\n]*/gi, "")
    .replace(/(?:^|\n)\s*💡\s*(?:Suggested Next Steps|Ways I Can Help|Next Steps|Suggested Solutions)[\s\S]*?(?=(?:With strength and love|— Nanny Frog|$))/gi, "")
    .replace(/(?:^|\n)\s*[💛💙💚]\s*[^\n]*/gi, "")
    .replace(/(?:^|\n)\s*(?:Would you like|Shall we|Which of these options|What would you like to explore next|What would you like to focus on|How does that feel|What feels most aligned|Where shall we begin|How are you feeling right now)[\s\S]*?(?=(?:With strength and love|— Nanny Frog|$))/gi, "")
    .trim();
}

export const DolaResponseCard: React.FC<DolaResponseCardProps> = ({
  text,
  isWebGrounded = false,
  webSources = [],
  searchQuery = "",
  highlightText,
  onSelectAction,
  isBillingError = false,
  activeGuide,
}) => {
  const [copied, setCopied] = useState(false);
  const unifiedText = cleanUnifiedText(text);

  // Check if this is a Nanny Frog spiritual guidance response
  const isNannyResponse =
    activeGuide === "nanny" ||
    text.includes("🐸") ||
    text.includes("Nanny Frog") ||
    text.includes("— Nanny Frog") ||
    text.includes("Rest as long as you need") ||
    text.includes("Rest now, little one") ||
    text.includes("the lily still grows") ||
    text.includes("quiet waters") ||
    text.includes("The storm passes") ||
    text.includes("gentle sanctuary");

  const handleCopy = () => {
    if (!unifiedText) return;
    navigator.clipboard?.writeText(unifiedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderContent = (content: string) => {
    if (!content) return null;
    if (highlightText && searchQuery) {
      return (
        <div className="whitespace-pre-wrap leading-relaxed text-slate-800 font-sans text-xs sm:text-[13.5px]">
          {highlightText(content, searchQuery)}
        </div>
      );
    }

    const paragraphs = content.split(/\n{2,}/);

    return (
      <div className="text-slate-800 font-sans text-xs sm:text-[13.5px] space-y-3 leading-relaxed">
        {paragraphs.map((paragraph, pIdx) => {
          const lines = paragraph.split("\n");
          const isListGroup = lines.some((l) => /^\s*(?:[-*•]|\d+[\.\)])\s*/.test(l));

          if (isListGroup) {
            return (
              <div key={pIdx} className="space-y-2 my-2 pl-0.5">
                {lines.map((line, lIdx) => {
                  // Check if numbered list (e.g., 1. Step or 1) Step)
                  const numberedMatch = line.match(/^\s*(\d+)[\.\)]\s*(.*)$/);
                  // Check if bullet point (e.g., • Point or - Point or * Point)
                  const bulletMatch = line.match(/^\s*[-*•]\s*(.*)$/);

                  if (numberedMatch) {
                    const stepNum = numberedMatch[1];
                    const contentStr = numberedMatch[2];
                    const parts = contentStr.split(/(\*\*.*?\*\*)/g);
                    return (
                      <div key={lIdx} className="flex items-start gap-2.5 leading-relaxed">
                        <span
                          className={`flex h-5 w-5 rounded-full items-center justify-center text-[10.5px] font-bold shrink-0 mt-0.5 shadow-2xs ${
                            isNannyResponse
                              ? "bg-teal-100 text-teal-800 font-mono"
                              : "bg-amber-100 text-amber-900 font-mono"
                          }`}
                        >
                          {stepNum}
                        </span>
                        <div className="text-slate-800 flex-1">
                          {parts.map((part, partIdx) => {
                            if (part.startsWith("**") && part.endsWith("**")) {
                              return (
                                <strong key={partIdx} className="font-semibold text-slate-950">
                                  {part.slice(2, -2)}
                                </strong>
                              );
                            }
                            return <span key={partIdx}>{part}</span>;
                          })}
                        </div>
                      </div>
                    );
                  }

                  if (bulletMatch) {
                    const contentStr = bulletMatch[1];
                    const parts = contentStr.split(/(\*\*.*?\*\*)/g);
                    return (
                      <div key={lIdx} className="flex items-start gap-2.5 leading-relaxed">
                        <span
                          className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${
                            isNannyResponse ? "bg-teal-500" : "bg-amber-500"
                          }`}
                        />
                        <div className="text-slate-800 flex-1">
                          {parts.map((part, partIdx) => {
                            if (part.startsWith("**") && part.endsWith("**")) {
                              return (
                                <strong key={partIdx} className="font-semibold text-slate-950">
                                  {part.slice(2, -2)}
                                </strong>
                              );
                            }
                            return <span key={partIdx}>{part}</span>;
                          })}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={lIdx} className="text-slate-800 leading-relaxed">
                      {line}
                    </div>
                  );
                })}
              </div>
            );
          }

          // Check if paragraph is a poignant quote
          const isQuote = paragraph.startsWith('"') && paragraph.endsWith('"') && paragraph.length < 160;
          if (isQuote) {
            return (
              <blockquote
                key={pIdx}
                className={`pl-3.5 py-1.5 my-2 border-l-2 italic font-serif text-[13px] sm:text-[14px] leading-relaxed rounded-r-lg ${
                  isNannyResponse
                    ? "border-teal-400 bg-teal-50/60 text-teal-950"
                    : "border-amber-400 bg-amber-50/40 text-amber-950"
                }`}
              >
                {paragraph}
              </blockquote>
            );
          }

          // Regular paragraph with bold syntax parsing
          const parts = paragraph.split(/(\*\*.*?\*\*)/g);
          return (
            <p key={pIdx} className="leading-relaxed">
              {parts.map((part, partIdx) => {
                if (part.startsWith("**") && part.endsWith("**")) {
                  return (
                    <strong key={partIdx} className="font-semibold text-slate-950">
                      {part.slice(2, -2)}
                    </strong>
                  );
                }
                return <span key={partIdx}>{part}</span>;
              })}
            </p>
          );
        })}
      </div>
    );
  };

  // MODE B: NANNY FROG — GENTLE SPIRITUAL GUIDE
  if (isNannyResponse) {
    return (
      <div className="rounded-2xl bg-gradient-to-b from-teal-50/90 to-emerald-50/40 border border-teal-200/80 p-4 sm:p-5 shadow-xs text-left w-full space-y-3.5 transition-all">
        {/* Header Bar */}
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-teal-200/60 select-none">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 rounded-full bg-teal-100 items-center justify-center text-base shadow-2xs">
              🐸
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-teal-950 leading-tight font-sans">
                  Nanny Frog Spiritual Guide
                </span>
                <span className="text-[9px] font-bold text-teal-900 bg-teal-100/90 px-1.5 py-0.5 rounded-md font-mono">
                  v5.4
                </span>
              </div>
              <span className="text-[10px] text-teal-700 font-mono">
                Spiritual Guidance Mode • Ancient Anchor 🐸
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {isBillingError && (
              <span className="inline-flex items-center gap-1 text-[9px] font-sans font-medium px-2 py-0.5 rounded-full bg-teal-100/90 text-teal-800 border border-teal-200 shadow-2xs" title="Running on MindSafe offline resilience engine">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                <span>Offline Resilience Core</span>
              </span>
            )}
            <span className="text-[10px] font-medium text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full border border-emerald-300/50 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Gentle Sanctuary</span>
            </span>
          </div>
        </div>

        {/* ONE UNIFIED RESPONSE BODY (Dola/Copilot/Gemini MindSafe Style) */}
        <div>{renderContent(unifiedText)}</div>

        {/* Action Toolbar */}
        <div className="pt-2.5 border-t border-teal-200/50 flex items-center justify-between text-teal-700 text-xs select-none">
          <div className="flex items-center gap-1 text-[11px] font-mono text-teal-800/80">
            <Sparkles className="w-3 h-3 text-teal-600" />
            <span>Safe Minds • Better Lives</span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-100/70 hover:bg-teal-200/70 text-teal-900 text-[11px] font-medium transition-colors cursor-pointer"
            title="Copy message"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3 text-teal-700" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>
    );
  }

  // MODE A: MINDSAFE AI COMPANION (HIGHER SELF & STRATEGIC PROBLEM SOLVER)
  return (
    <div className="rounded-2xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-xs text-left w-full space-y-3.5 transition-all">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 select-none">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 rounded-xl bg-gradient-to-br from-amber-500 via-amber-400 to-amber-600 items-center justify-center text-slate-950 font-bold text-xs shadow-2xs">
            🦁
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900 leading-tight font-sans">
                MINDSAFE Companion
              </span>
              <span className="text-[9px] font-bold text-amber-900 bg-amber-100/90 px-1.5 py-0.5 rounded-md font-mono">
                v5.4
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              Higher-Self Life Coach • Mind 🧠 • Lion 🦁 • Shield 🛡️
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {isBillingError && (
            <span className="inline-flex items-center gap-1 text-[9px] font-sans font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 shadow-2xs" title="Running on MindSafe offline resilience engine">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Offline Resilience Core</span>
            </span>
          )}
          {isWebGrounded && (
            <span className="inline-flex items-center gap-1 text-[9.5px] font-sans font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Web-Verified</span>
            </span>
          )}
        </div>
      </div>

      {/* ONE UNIFIED RESPONSE BODY (Dola/Copilot/Gemini MindSafe Style) */}
      <div>{renderContent(unifiedText)}</div>

      {/* Verified Web Sources (if available) */}
      {webSources && webSources.length > 0 && (
        <div className="pt-2 border-t border-slate-100 select-none">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1 mb-1.5">
            <Globe className="w-3 h-3 text-emerald-600" />
            Verified References
          </span>
          <div className="flex flex-wrap gap-1.5">
            {webSources.map((source, sIdx) => (
              <a
                key={sIdx}
                href={source.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-[11px] font-medium transition-all border border-slate-200 hover:border-slate-300 shadow-2xs max-w-full group"
                title={source.title}
              >
                <ExternalLink className="w-2.5 h-2.5 text-emerald-600 group-hover:scale-110 transition-transform shrink-0" />
                <span className="truncate max-w-[200px]">{source.title || "Reference"}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Action Toolbar (Like Copilot, Gemini & Dola) */}
      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-slate-600 text-xs select-none">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
          <span>Safe Minds • Better Lives</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-[11px] font-medium border border-slate-200 transition-colors cursor-pointer"
          title="Copy message"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
    </div>
  );
};
