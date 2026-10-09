import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText,
  Download,
  Copy,
  Check,
  X,
  Share2,
  Calendar,
  Award,
  Activity,
  Heart,
  Printer,
  Shield,
} from "lucide-react";

interface ResilienceExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakCount: number;
  totalCheckIns: number;
  userName?: string;
  pinnedBreakthroughs?: string[];
  recentMoods?: { mood: string; score: number; timestamp: number }[];
  frozenDatesCount?: number;
  vaultCount?: number;
  resilienceScore?: number;
  recentMilestones?: string[];
}

export const ResilienceExportModal: React.FC<ResilienceExportModalProps> = ({
  isOpen,
  onClose,
  streakCount,
  totalCheckIns,
  userName = "MindSafe Member",
  pinnedBreakthroughs = [],
  recentMoods = [],
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const generateReportText = () => {
    return `=====================================================
MINDSAFE AI RESILIENCE PROGRESS REPORT
Date Generated: ${currentDate}
Member Name: ${userName}
Platform: MindSafe AI Companion (v2.0 Launch Edition)
Mission: Safer Lives • Stronger Minds • Resilient Communities
=====================================================

1. EXECUTIVE SUMMARY & STREAK ANALYTICS
• Active Resilience Streak: ${streakCount} consecutive days
• Total Structured Check-ins Logged: ${totalCheckIns} sessions
• Resilience Shield Status: ACTIVE & GROUNDED
• Dual-Persona Mentorship: MindSafe AI Companion & Nanny Frog

2. RECENT MOOD & EMOTIONAL RECOVERY TREND
${
  recentMoods.length > 0
    ? recentMoods
        .slice(-7)
        .map(
          (m, i) =>
            `• Check-in ${i + 1} (${new Date(m.timestamp).toLocaleDateString("en-GB")}): Mood: ${m.mood.toUpperCase()} (Resilience Score: ${m.score}/10)`
        )
        .join("\n")
    : "• Consistent baseline mood recorded across active sessions."
}

3. PINNED BREAKTHROUGHS & STRATEGIC INSIGHTS
${
  pinnedBreakthroughs.length > 0
    ? pinnedBreakthroughs.map((b, i) => `[Breakthrough #${i + 1}]\n${b}\n`).join("\n")
    : "• Ongoing cognitive reframing and daily habit consistency maintained."
}

4. EVIDENCE-BASED PROTOCOLS UTILISED
• 4-4-4-4 Box Breathing & Vagus Nerve Regulation
• 5-4-3-2-1 Sensory Grounding Technique
• Cognitive Reframing & 3-Step Action Coaching
• UK Safeguarding & Mental Wellbeing Safety Guardrails

=====================================================
Generated securely via MindSafe AI. Confidential & Private.
`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateReportText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadText = () => {
    const element = document.createElement("a");
    const file = new Blob([generateReportText()], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `MindSafe-Resilience-Report-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>MindSafe AI - Resilience Progress Report</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
            h1 { font-size: 22px; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
            h2 { font-size: 16px; color: #334155; margin-top: 24px; }
            .badge { display: inline-block; background: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 12px; font-weight: bold; font-size: 12px; }
            .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 12px 0; font-family: monospace; font-size: 12px; white-space: pre-wrap; }
            .footer { margin-top: 40px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; }
          </style>
        </head>
        <body>
          <h1>🧠 MindSafe AI — Resilience Progress Report</h1>
          <p><strong>Member:</strong> ${userName} &nbsp;|&nbsp; <strong>Date:</strong> ${currentDate} &nbsp;|&nbsp; <span class="badge">Streak: ${streakCount} Days</span></p>
          <div class="box">${generateReportText()}</div>
          <div class="footer">Confidential summary for personal records or consultation with healthcare professionals.</div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-slate-900 border border-amber-400/30 rounded-2xl shadow-[0_0_50px_rgba(251,191,36,0.15)] overflow-hidden my-8"
          id="resilienceExportModal"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-slate-950 px-6 py-4 border-b border-amber-400/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Export Resilience Progress Report</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Download or print your progress summary for therapy or personal review.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Close Export"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Preview */}
          <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-center">
                <div className="text-[10px] text-slate-400 font-mono uppercase">Resilience Streak</div>
                <div className="text-xl font-extrabold text-amber-400 font-mono flex items-center justify-center gap-1">
                  <span>🔥 {streakCount}</span>
                  <span className="text-xs text-slate-400 font-normal">days</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-center">
                <div className="text-[10px] text-slate-400 font-mono uppercase">Check-Ins Logged</div>
                <div className="text-xl font-extrabold text-emerald-400 font-mono">
                  {totalCheckIns}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-center col-span-2 sm:col-span-1">
                <div className="text-[10px] text-slate-400 font-mono uppercase">Status</div>
                <div className="text-xs font-bold text-purple-300 font-mono mt-1">
                  🛡️ Active Warrior
                </div>
              </div>
            </div>

            {/* Document Preview Box */}
            <div className="relative rounded-xl bg-slate-950 border border-white/10 p-4 font-mono text-xs text-slate-300 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap select-all">
              {generateReportText()}
            </div>
          </div>

          {/* Actions Footer */}
          <div className="p-4 bg-slate-950 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
            <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Client-Side Private Document</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied to Clipboard</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Print or Save as PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / PDF</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadText}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(251,191,36,0.3)] cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Report</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
