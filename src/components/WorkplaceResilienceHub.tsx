import React, { useState, useEffect } from "react";
import { safeLocalStorage } from "../utils/safeStorage";
import {
  Building2,
  Users,
  ShieldCheck,
  Flame,
  Activity,
  HeartHandshake,
  FileCheck2,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Download,
  Printer,
  CheckCircle2,
  Timer,
  Play,
  Pause,
  RotateCcw,
  MessageSquare,
  BarChart3,
  HelpCircle,
  Clock,
  Briefcase,
  Layers,
  Send,
  Zap,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface WorkplaceResilienceHubProps {
  onTriggerCompanionMessage: (prompt: string) => void;
  onSwitchToChat: () => void;
}

interface DepartmentPulse {
  id: string;
  name: string;
  headcount: number;
  burnoutRisk: number; // 0 - 100
  psychologicalSafety: number; // 0 - 100
  workloadLoad: "Sustainable" | "Elevated" | "Critical";
  primaryStressSource: string;
  trend: "improving" | "stable" | "declining";
}

const INITIAL_DEPARTMENTS: DepartmentPulse[] = [
  {
    id: "eng",
    name: "Engineering & Technical",
    headcount: 48,
    burnoutRisk: 62,
    psychologicalSafety: 78,
    workloadLoad: "Elevated",
    primaryStressSource: "Sprint Deadlines & Context Switching",
    trend: "stable",
  },
  {
    id: "ops",
    name: "Operations & Logistics",
    headcount: 65,
    burnoutRisk: 74,
    psychologicalSafety: 65,
    workloadLoad: "Critical",
    primaryStressSource: "Shift Hours & Staff Shortages",
    trend: "declining",
  },
  {
    id: "cs",
    name: "Customer Experience & Support",
    headcount: 32,
    burnoutRisk: 68,
    psychologicalSafety: 71,
    workloadLoad: "Elevated",
    primaryStressSource: "Emotional Labor & Escalations",
    trend: "stable",
  },
  {
    id: "clinical",
    name: "Frontline & Healthcare",
    headcount: 24,
    burnoutRisk: 81,
    psychologicalSafety: 62,
    workloadLoad: "Critical",
    primaryStressSource: "Vicarious Trauma & High Volume",
    trend: "declining",
  },
  {
    id: "sales",
    name: "Sales & Growth",
    headcount: 28,
    burnoutRisk: 54,
    psychologicalSafety: 82,
    workloadLoad: "Sustainable",
    primaryStressSource: "Quarterly Target Pressure",
    trend: "improving",
  },
  {
    id: "people",
    name: "People, HR & Leadership",
    headcount: 14,
    burnoutRisk: 48,
    psychologicalSafety: 89,
    workloadLoad: "Sustainable",
    primaryStressSource: "Organizational Change Management",
    trend: "improving",
  },
];

const HSE_STANDARDS = [
  {
    id: "demands",
    title: "1. Demands",
    description: "Workload, work patterns, and work environment issues.",
    question: "How manageable is your team's current volume, pace, and working hours?",
  },
  {
    id: "control",
    title: "2. Control",
    description: "How much say the person has in the way they do their work.",
    question: "Do employees have adequate autonomy over how and when their tasks are done?",
  },
  {
    id: "support",
    title: "3. Support",
    description: "Encouragement, sponsorship, and resources provided by the enterprise.",
    question: "Do staff feel genuinely backed up by line managers and accessible resources?",
  },
  {
    id: "relationships",
    title: "4. Relationships",
    description: "Promoting positive working to avoid conflict and unacceptable behavior.",
    question: "Is the working climate free from toxic friction, bullying, and psychological fear?",
  },
  {
    id: "role",
    title: "5. Role",
    description: "Whether people understand their role within the organization.",
    question: "Are individual roles, boundaries, and accountability clear without ambiguity?",
  },
  {
    id: "change",
    title: "6. Change",
    description: "How organizational change is managed and communicated.",
    question: "Are structural changes, transitions, and new systems communicated with empathy?",
  },
];

const SCENARIOS = [
  {
    id: "burnout-discussion",
    title: "Addressing Chronic Burnout Without Blame",
    level: "Line Manager",
    context: "A high-performing team member is missing deadlines and appears physically exhausted.",
    prompt:
      "I need guidance as a manager: One of my top team members is showing signs of extreme burnout and withdrawal. How should I initiate a 1-on-1 supportive conversation using non-punitive, psychologically safe UK workplace best practices?",
  },
  {
    id: "conflict-deescalation",
    title: "De-escalating High-Tension Team Friction",
    level: "Team Lead",
    context: "Two peers clashed during a high-stakes project review. Morale across the pod has dropped.",
    prompt:
      "As a team lead, I need a step-by-step facilitation framework to mediate a tense conflict between two team members while preserving trust and psychological safety.",
  },
  {
    id: "return-to-work",
    title: "Empathetic Return-to-Work After Mental Health Leave",
    level: "HR & People Partner",
    context: "An employee is returning after a 6-week stress/grief leave. You want to structure a phased return.",
    prompt:
      "Please give me an empathetic Return-to-Work checklist and conversation script aligned with UK ACAS and HSE standards for an employee returning from mental health leave.",
  },
  {
    id: "workload-boundary",
    title: "Employee Setting Firm Boundaries with Executive Stakeholders",
    level: "Individual Contributor",
    context: "You are being given unreasonable weekend deadlines that are causing acute panic and insomnia.",
    prompt:
      "I am an employee experiencing severe overwhelm. How can I professionally and assertively push back on unrealistic deadlines with senior leadership while offering constructive, phased solutions?",
  },
];

const HUDDLES = [
  {
    id: "pre-shift",
    title: "Pre-Shift Mental Armor",
    duration: 180, // 3 mins
    tag: "Morning / Start of Shift",
    steps: [
      "1. Grounding: 3 shared deep collective breaths (4 seconds in, 6 seconds out).",
      "2. State of Play: Quick 1-word mood check around the circle.",
      "3. Micro-Commitment: What is our ONE non-negotiable priority today?",
      "4. Safety Anchor: 'If anyone feels overwhelmed, tap your partner or raise a flag early.'",
    ],
  },
  {
    id: "post-shift",
    title: "Post-Incident Shift Decompression",
    duration: 300, // 5 mins
    tag: "End of Shift / High Stress",
    steps: [
      "1. Psychological Closure: Stand up, stretch shoulders, step away from screens.",
      "2. De-Role Protocol: Acknowledge that the shift's emotional weight stops here.",
      "3. Gratitude & Win: Call out one moment of peer support or problem solved.",
      "4. Safe Transit: Remind all members to engage their transition anchor before home.",
    ],
  },
  {
    id: "friday-huddle",
    title: "Weekly Psychological Safety Huddle",
    duration: 420, // 7 mins
    tag: "Friday / Sprint Close",
    steps: [
      "1. Celebrate the Invisible: Thank someone for a behind-the-scenes effort.",
      "2. Unvarnished Reality: What is one process that drained cognitive energy this week?",
      "3. Weekend Boundary Lock: Turn off non-essential work notifications.",
    ],
  },
];

export const WorkplaceResilienceHub: React.FC<WorkplaceResilienceHubProps> = ({
  onTriggerCompanionMessage,
  onSwitchToChat,
}) => {
  const [subTab, setSubTab] = useState<"pulse" | "sandbox" | "hse" | "huddles">("pulse");
  const [departments, setDepartments] = useState<DepartmentPulse[]>(() => {
    try {
      const saved = safeLocalStorage.getItem("mindsafe_workplace_depts");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return INITIAL_DEPARTMENTS;
  });

  // Pulse Survey Simulator state
  const [surveyDept, setSurveyDept] = useState("eng");
  const [workloadRating, setWorkloadRating] = useState(3);
  const [safetyRating, setSafetyRating] = useState(4);
  const [exhaustionRating, setExhaustionRating] = useState(2);
  const [surveySubmitted, setSurveySubmitted] = useState(false);

  // HSE Assessment ratings (1 - 5 for each of the 6 standards)
  const [hseScores, setHseScores] = useState<Record<string, number>>(() => {
    try {
      const saved = safeLocalStorage.getItem("mindsafe_hse_scores");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return {
      demands: 3,
      control: 4,
      support: 4,
      relationships: 4,
      role: 4,
      change: 3,
    };
  });

  // Save changes to safeLocalStorage
  useEffect(() => {
    safeLocalStorage.setItem("mindsafe_workplace_depts", JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    safeLocalStorage.setItem("mindsafe_hse_scores", JSON.stringify(hseScores));
  }, [hseScores]);

  // Active Huddle Timer
  const [activeHuddleId, setActiveHuddleId] = useState<string>("pre-shift");
  const [timerSeconds, setTimerSeconds] = useState(180);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const handleSelectHuddle = (huddle: (typeof HUDDLES)[0]) => {
    setActiveHuddleId(huddle.id);
    setTimerSeconds(huddle.duration);
    setIsTimerRunning(false);
  };

  const handlePulseSurveySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDepartments((prev) =>
      prev.map((d) => {
        if (d.id === surveyDept) {
          const deltaBurnout = (exhaustionRating - 3) * 3 + (workloadRating - 3) * 2;
          const deltaSafety = (safetyRating - 3) * 4;
          const newBurnout = Math.min(95, Math.max(20, d.burnoutRisk + deltaBurnout));
          const newSafety = Math.min(98, Math.max(30, d.psychologicalSafety + deltaSafety));
          return {
            ...d,
            burnoutRisk: newBurnout,
            psychologicalSafety: newSafety,
            workloadLoad: newBurnout > 75 ? "Critical" : newBurnout > 60 ? "Elevated" : "Sustainable",
          };
        }
        return d;
      })
    );
    setSurveySubmitted(true);
    setTimeout(() => {
      setSurveySubmitted(false);
    }, 3500);
  };

  // HSE Overall Score Calculation (out of 100)
  const sumScores = Object.values(hseScores).reduce<number>((acc, curr) => acc + (typeof curr === "number" ? curr : 0), 0);
  const totalHseScore = Math.round((sumScores / (HSE_STANDARDS.length * 5)) * 100);

  const getHseRiskTier = (score: number) => {
    if (score >= 80) return { label: "High Psychological Safety & Low Stress", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" };
    if (score >= 60) return { label: "Moderate Risk — Targeted Action Advised", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30" };
    return { label: "High Stress & Compliance Risk — Immediate Intervention Required", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/30" };
  };

  const currentRisk = getHseRiskTier(totalHseScore);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? "0" : ""}${remainder}`;
  };

  const handlePrintHseReport = () => {
    window.print();
  };

  return (
    <div className="w-full flex flex-col gap-6 text-left" id="workplaceResilienceHub">
      {/* ENTERPRISE HERO HEADER */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/40 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-[1.5px] shadow-lg flex-shrink-0">
              <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center">
                <Building2 className="w-7 h-7 text-amber-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-mono">
                  Enterprise Wellbeing v3.0
                </span>
                <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>UK HSE &amp; ACAS Aligned</span>
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-100 mt-1 tracking-tight font-sans">
                Workplace Resilience &amp; Psychological Safety Hub
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
                Empower your teams and leaders with live burnout early-warning heatmaps, manager coaching sandboxes,
                and UK HSE-compliant stress assessments.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                onTriggerCompanionMessage(
                  "As a workplace wellbeing leader, can you provide a comprehensive 30-day psychological safety roadmap for my organization?"
                );
                onSwitchToChat();
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-extrabold text-xs shadow-lg hover:shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
              id="aiWorkplaceConsultBtn"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Consult AI Advisor</span>
            </button>
          </div>
        </div>

        {/* METRICS SUMMARY STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 border border-white/5 rounded-2xl p-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono flex items-center gap-1">
              <Users className="w-3 h-3 text-amber-400" />
              <span>Active Headcount</span>
            </span>
            <div className="text-lg font-black text-slate-100 mt-0.5">207 Team Members</div>
            <span className="text-[10px] text-slate-400">Across 6 key departments</span>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-2xl p-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono flex items-center gap-1">
              <Flame className="w-3 h-3 text-rose-400" />
              <span>Avg Burnout Risk</span>
            </span>
            <div className="text-lg font-black text-amber-300 mt-0.5">64.5%</div>
            <span className="text-[10px] text-amber-400/80 font-medium">Elevated • Monitor frontline</span>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-2xl p-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-teal-400" />
              <span>Psych Safety Score</span>
            </span>
            <div className="text-lg font-black text-teal-300 mt-0.5">74.5 / 100</div>
            <span className="text-[10px] text-teal-400 font-medium">+3.2% vs last month</span>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-2xl p-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono flex items-center gap-1">
              <FileCheck2 className="w-3 h-3 text-emerald-400" />
              <span>HSE Health Index</span>
            </span>
            <div className="text-lg font-black text-emerald-300 mt-0.5">{totalHseScore}%</div>
            <span className="text-[10px] text-emerald-400 font-medium">HSE Compliant Assessment</span>
          </div>
        </div>
      </div>

      {/* SUB-NAVIGATION CONTROLS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3" id="workplaceNavTabs">
        <button
          type="button"
          onClick={() => setSubTab("pulse")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            subTab === "pulse"
              ? "bg-amber-400 text-slate-950 shadow-md scale-105"
              : "text-slate-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Team Pulse &amp; Burnout Heatmap</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("sandbox")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            subTab === "sandbox"
              ? "bg-amber-400 text-slate-950 shadow-md scale-105"
              : "text-slate-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Manager Safety Sandbox</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("hse")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            subTab === "hse"
              ? "bg-amber-400 text-slate-950 shadow-md scale-105"
              : "text-slate-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>UK HSE Stress Assessment</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("huddles")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            subTab === "huddles"
              ? "bg-amber-400 text-slate-950 shadow-md scale-105"
              : "text-slate-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <Timer className="w-4 h-4" />
          <span>Shift Decompression Huddles</span>
        </button>
      </div>

      {/* MODULE 1: TEAM PULSE & BURNOUT HEATMAP */}
      {subTab === "pulse" && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                <span>Department Resilience &amp; Burnout Early-Warning Heatmap</span>
              </h3>
              <p className="text-xs text-slate-400">
                Anonymized pulse aggregation tracking psychological strain, cognitive load, and safety.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Critical (&gt;70%)
              </span>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Elevated
              </span>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Sustainable
              </span>
            </div>
          </div>

          {/* DEPARTMENT HEATMAP CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept) => {
              const isCritical = dept.burnoutRisk >= 70;
              const isElevated = dept.burnoutRisk >= 55 && dept.burnoutRisk < 70;

              return (
                <div
                  key={dept.id}
                  className={`rounded-2xl border p-4 transition-all flex flex-col justify-between relative overflow-hidden backdrop-blur-md ${
                    isCritical
                      ? "bg-rose-950/20 border-rose-500/30 hover:border-rose-500/50"
                      : isElevated
                      ? "bg-amber-950/20 border-amber-500/30 hover:border-amber-500/50"
                      : "bg-slate-900/60 border-white/10 hover:border-white/20"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-200 truncate pr-2">{dept.name}</span>
                      <span
                        className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                          isCritical
                            ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
                            : isElevated
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                            : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        }`}
                      >
                        {dept.workloadLoad}
                      </span>
                    </div>

                    <div className="space-y-3 mt-3">
                      <div>
                        <div className="flex justify-between text-[11px] mb-1 font-medium">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Flame className="w-3 h-3 text-rose-400" /> Burnout Risk
                          </span>
                          <span
                            className={`font-bold font-mono ${
                              isCritical ? "text-rose-400" : isElevated ? "text-amber-400" : "text-emerald-400"
                            }`}
                          >
                            {dept.burnoutRisk}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isCritical ? "bg-rose-500" : isElevated ? "bg-amber-400" : "bg-emerald-400"
                            }`}
                            style={{ width: `${dept.burnoutRisk}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-1 font-medium">
                          <span className="text-slate-400 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-teal-400" /> Psych Safety
                          </span>
                          <span className="font-bold font-mono text-teal-300">{dept.psychologicalSafety} / 100</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-teal-400 rounded-full transition-all duration-500"
                            style={{ width: `${dept.psychologicalSafety}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-300">Top Strain:</span> {dept.primaryStressSource}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-[10px] text-slate-500 font-mono">{dept.headcount} members</span>
                    <button
                      type="button"
                      onClick={() => {
                        onTriggerCompanionMessage(
                          `Let's analyze the ${dept.name} department. Burnout risk is at ${dept.burnoutRisk}%, Psychological Safety is at ${dept.psychologicalSafety}/100, and top strain is "${dept.primaryStressSource}". What are 3 immediate interventions to reduce their cognitive load?`
                        );
                        onSwitchToChat();
                      }}
                      className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <span>Action Plan</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ANONYMOUS PULSE SUBMISSION SIMULATOR */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-bold text-slate-100">
                Anonymous Employee Pulse Check-In (Test Live Simulation)
              </h4>
            </div>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Experience the 30-second anonymous pulse survey that feeds the organizational heatmap. No identities or
              IP addresses are logged.
            </p>

            <form onSubmit={handlePulseSurveySubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1.5">Department</label>
                <select
                  value={surveyDept}
                  onChange={(e) => setSurveyDept(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1.5">
                  Workload Manageability (1 = Impossible, 5 = Smooth)
                </label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setWorkloadRating(val)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        workloadRating === val
                          ? "bg-amber-400 text-slate-950 shadow-xs"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1.5">
                  Psychological Safety (1 = Fearful, 5 = Safe)
                </label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSafetyRating(val)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        safetyRating === val
                          ? "bg-teal-400 text-slate-950 shadow-xs"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1.5">
                  Mental Exhaustion (1 = Energized, 5 = Drained)
                </label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setExhaustionRating(val)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        exhaustionRating === val
                          ? "bg-rose-500 text-white shadow-xs"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2 lg:col-span-4 flex items-center justify-between pt-2">
                <span className="text-[11px] text-emerald-400 flex items-center gap-1.5 font-medium">
                  {surveySubmitted && (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Pulse recorded! Department heatmap updated in real time.</span>
                    </>
                  )}
                </span>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Anonymous Pulse</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODULE 2: MANAGER SAFETY SANDBOX */}
      {subTab === "sandbox" && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span>Manager Psychological Safety &amp; High-Stakes Sandbox</span>
              </h3>
              <p className="text-xs text-slate-400">
                Practice high-empathy leadership conversations in a zero-risk environment before engaging in real life.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SCENARIOS.map((scenario) => (
              <div
                key={scenario.id}
                className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-md flex flex-col justify-between hover:border-amber-400/40 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold font-mono text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20">
                      {scenario.level}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Interactive AI Roleplay</span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-100 mt-1">{scenario.title}</h4>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5">
                    <strong>Context:</strong> {scenario.context}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 italic">SBI + Empathy Coaching</span>
                  <button
                    type="button"
                    onClick={() => {
                      onTriggerCompanionMessage(scenario.prompt);
                      onSwitchToChat();
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300 group-hover:bg-amber-400 group-hover:text-slate-950 font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Start Practice Session</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* CUSTOM SCENARIO BUILDER */}
          <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-950 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Need a Custom Workplace Conversation Script?</span>
              </h4>
              <p className="text-xs text-slate-300 mt-1">
                Tell MindSafe AI about your specific scenario (e.g. redundancy talks, boundary pushback, grief support)
                and get an empathetic script instantly.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                onTriggerCompanionMessage(
                  "I am preparing for a difficult workplace conversation. Please guide me through an empathetic, UK ACAS-compliant conversational framework to handle it with care and clarity."
                );
                onSwitchToChat();
              }}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shrink-0 cursor-pointer shadow-md transition-all flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Launch Custom Coach</span>
            </button>
          </div>
        </div>
      )}

      {/* MODULE 3: UK HSE STRESS ASSESSMENT & AUDIT */}
      {subTab === "hse" && (
        <div className="flex flex-col gap-6" id="hseAssessmentSection">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                <span>UK HSE 6 Management Standards Stress Risk Audit</span>
              </h3>
              <p className="text-xs text-slate-400">
                Official UK Health and Safety Executive aligned assessment for workplace stress prevention.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrintHseReport}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer border border-white/10"
                title="Print or Save as PDF Report"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>Print Audit Report</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onTriggerCompanionMessage(
                    `Here are our UK HSE 6 Standards Audit Scores: Demands: ${hseScores.demands}/5, Control: ${hseScores.control}/5, Support: ${hseScores.support}/5, Relationships: ${hseScores.relationships}/5, Role: ${hseScores.role}/5, Change: ${hseScores.change}/5. Overall HSE Health Index: ${totalHseScore}%. Please produce an official HSE-compliant Executive Action Plan for leadership.`
                  );
                  onSwitchToChat();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md hover:bg-amber-300"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Action Plan</span>
              </button>
            </div>
          </div>

          {/* HSE STATUS SUMMARY BANNER */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between flex-wrap gap-3 ${currentRisk.bg}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-950/80 flex items-center justify-center font-mono font-black text-base text-amber-400 border border-white/10">
                {totalHseScore}%
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold">
                  HSE Stress Management Index
                </span>
                <h4 className={`text-sm font-bold ${currentRisk.color}`}>{currentRisk.label}</h4>
              </div>
            </div>

            <span className="text-xs text-slate-300 font-medium">
              Based on Health &amp; Safety at Work etc. Act 1974 &amp; ACAS Guidelines
            </span>
          </div>

          {/* 6 STANDARDS INTERACTIVE RATING GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {HSE_STANDARDS.map((std) => {
              const currentScore = hseScores[std.id] || 3;
              return (
                <div key={std.id} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-md">
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="text-xs font-bold text-slate-100 font-sans">{std.title}</h4>
                    <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {currentScore} / 5
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mb-2">{std.description}</p>
                  <p className="text-xs text-slate-200 font-medium bg-black/20 p-2.5 rounded-xl border border-white/5 mb-3">
                    {std.question}
                  </p>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-500 font-mono mr-1">Risk:</span>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setHseScores((prev) => ({ ...prev, [std.id]: num }))}
                        className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          currentScore === num
                            ? num <= 2
                              ? "bg-rose-500 text-white shadow-xs"
                              : num === 3
                              ? "bg-amber-400 text-slate-950 shadow-xs"
                              : "bg-emerald-400 text-slate-950 shadow-xs"
                            : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODULE 4: SHIFT DECOMPRESSION HUDDLES */}
      {subTab === "huddles" && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Timer className="w-4 h-4 text-amber-400" />
                <span>5-Minute Shift Decompression &amp; Team Resilience Huddles</span>
              </h3>
              <p className="text-xs text-slate-400">
                Structured mental armor drills designed for shift handovers, sprint starts, and high-stress closures.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* HUDDLE SELECTION LIST */}
            <div className="lg:col-span-1 flex flex-col gap-3">
              {HUDDLES.map((huddle) => {
                const isSelected = activeHuddleId === huddle.id;
                return (
                  <button
                    key={huddle.id}
                    type="button"
                    onClick={() => handleSelectHuddle(huddle)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-amber-500/15 border-amber-400 text-amber-100 shadow-lg ring-1 ring-amber-400/40"
                        : "bg-slate-900/60 border-white/10 text-slate-300 hover:bg-slate-900 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] uppercase font-mono font-bold text-amber-400 tracking-wider">
                        {huddle.tag}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {Math.floor(huddle.duration / 60)} mins
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-100">{huddle.title}</h4>
                  </button>
                );
              })}
            </div>

            {/* ACTIVE HUDDLE CARD & TIMER */}
            <div className="lg:col-span-2 rounded-2xl border border-amber-500/30 bg-slate-900/80 p-6 backdrop-blur-md flex flex-col justify-between">
              {(() => {
                const active = HUDDLES.find((h) => h.id === activeHuddleId) || HUDDLES[0];
                return (
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10 mb-4">
                      <div>
                        <span className="text-[10px] uppercase font-mono font-bold text-amber-400">{active.tag}</span>
                        <h4 className="text-lg font-black text-slate-100 mt-0.5">{active.title}</h4>
                      </div>

                      {/* TIMER CLOCK CONTROLS */}
                      <div className="flex items-center gap-3 bg-black/40 border border-white/10 px-4 py-2 rounded-2xl">
                        <span className="font-mono text-xl font-black text-amber-300 tracking-wider">
                          {formatTime(timerSeconds)}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setIsTimerRunning(!isTimerRunning)}
                            className="p-2 rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300 transition-all cursor-pointer"
                            title={isTimerRunning ? "Pause" : "Start"}
                          >
                            {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsTimerRunning(false);
                              setTimerSeconds(active.duration);
                            }}
                            className="p-2 rounded-xl bg-white/10 text-slate-300 hover:bg-white/20 transition-all cursor-pointer"
                            title="Reset"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                        Facilitation Protocol
                      </span>
                      {active.steps.map((step, idx) => (
                        <div
                          key={idx}
                          className="text-xs sm:text-sm text-slate-200 bg-black/30 p-3.5 rounded-xl border border-white/5 leading-relaxed"
                        >
                          {step}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                <span>Run this huddle standing up to reinforce cognitive transition.</span>
                <button
                  type="button"
                  onClick={() => {
                    const active = HUDDLES.find((h) => h.id === activeHuddleId) || HUDDLES[0];
                    navigator.clipboard.writeText(
                      `📋 ${active.title} (${active.tag}):\n\n` + active.steps.join("\n\n")
                    );
                    alert("Huddle facilitation script copied to clipboard!");
                  }}
                  className="text-amber-400 hover:text-amber-300 font-bold cursor-pointer"
                >
                  Copy Script
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
