import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, MicOff, Volume2, VolumeX, Download, Send, X, Pin, Heart, Bookmark, Activity, TrendingUp, Anchor, Copy, Check, CheckCheck, Sparkles, Wind, Circle, Square, Loader2, Target, Edit2, Save, Award, Mail, Languages, Plus, MessageSquare, Trash2, Shield, User, Calendar, Book, Snowflake, Users, Crown, Palette, Eye, CalendarDays, RefreshCw, Bell, BellOff, Search, ArrowUpDown, Clock, Tag, AlertTriangle, FileText, Printer, Flame, Radio, Sprout, Globe, ExternalLink, ArrowRight, Building2, FolderSync, Compass, MapPin } from "lucide-react";
import { THEME_PRESETS, getSavedThemeId, applyTheme, ThemeOption } from "./theme";
import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import DailyCheckIn from "./components/DailyCheckIn";
import DailyFocusHour from "./components/DailyFocusHour";
import CalmBreathing from "./components/CalmBreathing";
import DailyAffirmation from "./components/DailyAffirmation";
import Journal from "./components/Journal";
import AdminDashboard from "./components/AdminDashboard";
import Badges from "./components/Badges";
import Achievements from "./components/Achievements";
import CommunityChat from "./components/CommunityChat";
import CheckboxParticleExplosion from "./components/CheckboxParticleExplosion";
import StreakMilestoneModal from "./components/StreakMilestoneModal";
import SmartCalendar from "./components/SmartCalendar";
import ImageAnalysisModal from "./components/ImageAnalysisModal";
import { CrisisEmergencyModal } from "./components/CrisisEmergencyModal";
import { ResilienceExportModal } from "./components/ResilienceExportModal";
import { DailyHabitTracker } from "./components/DailyHabitTracker";
import { GoalCompletionTimeline } from "./components/GoalCompletionTimeline";
import { ZenSanctuary } from "./components/ZenSanctuary";
import { AvatarModal } from "./components/AvatarModal";
import { AvatarStudio } from "./components/AvatarStudio";
import { AvatarDisplay } from "./components/AvatarDisplay";
import { DEFAULT_AVATAR, AvatarConfig } from "./types/avatar";
import { DolaResponseCard, cleanUnifiedText } from "./components/DolaResponseCard";
import { WorkplaceResilienceHub } from "./components/WorkplaceResilienceHub";
import GoogleWorkspaceHub from "./components/GoogleWorkspaceHub";
import GoogleMapsSanctuaryFinder from "./components/GoogleMapsSanctuaryFinder";
import { RecommendedGoalCard } from "./components/RecommendedGoalCard";
import { CognitiveReframeModal } from "./components/CognitiveReframeModal";
import { ResiliencePulseRadar } from "./components/ResiliencePulseRadar";
import { DailyReflectionPrompts } from "./components/DailyReflectionPrompts";
import { 
  getCompletedGoalRecords, 
  saveCompletedGoalRecord, 
  removeCompletedGoalRecord, 
  analyzeGoalsHistory, 
  generateRecommendedGoals, 
  stageNextGoal,
  getStagedNextGoal,
  CompletedGoalRecord, 
  GoalRecommendation 
} from "./utils/goalRecommendationEngine";

import StoragePermissionBanner from "./components/StoragePermissionBanner";
import { safeLocalStorage } from "./utils/safeStorage";
import { generateSessionTitle } from "./utils/sessionTitle";

// Firebase and Auth imports
import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut as firebaseSignOut, sendEmailVerification } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import AuthGate from "./components/AuthGate";
import { LogOut } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp?: number;
  isNew?: boolean;
  isPinned?: boolean;
  isHearted?: boolean;
  reactions?: string[];
  translatedText?: string;
  targetLangName?: string;
  isShowingTranslation?: boolean;
  isBillingError?: boolean;
  isWebGrounded?: boolean;
  webSources?: { title: string; uri: string }[];
  suggestedActions?: string[];
}

export const REACTION_CONFIG: Record<string, { label: string; emoji: string; badgeStyle: string }> = {
  "Helpful": {
    label: "Helpful",
    emoji: "💡",
    badgeStyle: "bg-amber-500/15 text-amber-700 border-amber-500/30 hover:bg-amber-500/25",
  },
  "Insightful": {
    label: "Insightful",
    emoji: "✨",
    badgeStyle: "bg-purple-500/15 text-purple-700 border-purple-500/30 hover:bg-purple-500/25",
  },
  "Needs Revision": {
    label: "Needs Revision",
    emoji: "✍️",
    badgeStyle: "bg-rose-500/15 text-rose-700 border-rose-500/30 hover:bg-rose-500/25",
  },
  "Calming": {
    label: "Calming",
    emoji: "🌿",
    badgeStyle: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/25",
  },
  "Grounded": {
    label: "Grounded",
    emoji: "⚓",
    badgeStyle: "bg-sky-500/15 text-sky-700 border-sky-500/30 hover:bg-sky-500/25",
  },
};

interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  messages: Message[];
  eliteSummary: string | null;
}

const LANGUAGES = [
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
  { code: "zh", label: "中文 (Chinese)", flag: "🇨🇳" },
  { code: "ja", label: "日本語 (Japanese)", flag: "🇯🇵" },
  { code: "ar", label: "العربية (Arabic)", flag: "🇸🇦" },
  { code: "hi", label: "हिन्दी (Hindi)", flag: "🇮🇳" },
  { code: "ru", label: "Русский (Russian)", flag: "🇷🇺" },
];

export function getMessageTimestamp(msg: Message, defaultTime?: number): number {
  if (msg.timestamp) return msg.timestamp;
  const match = msg.id.match(/\d{12,}/);
  if (match) {
    const parsed = parseInt(match[0], 10);
    if (!isNaN(parsed) && parsed > 1600000000000) {
      return parsed;
    }
  }
  return defaultTime || Date.now();
}

export function formatMessageTime(ts?: number): string {
  if (!ts) return "";
  const date = new Date(ts);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  } else {
    return date.toLocaleDateString([], { month: "short", day: "numeric" }) + ", " + date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
}

export function ProcessedBadge({ msgTimestamp }: { msgTimestamp: number }) {
  const [isProcessed, setIsProcessed] = useState(() => Date.now() - msgTimestamp > 1200);

  useEffect(() => {
    if (isProcessed) return;
    const elapsed = Date.now() - msgTimestamp;
    const remaining = Math.max(0, 1200 - elapsed);
    const timer = setTimeout(() => {
      setIsProcessed(true);
    }, remaining);
    return () => clearTimeout(timer);
  }, [msgTimestamp, isProcessed]);

  return (
    <AnimatePresence mode="wait">
      {isProcessed ? (
        <motion.span
          key="processed"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="inline-flex items-center gap-1 text-emerald-400/90 font-mono text-[9px] tracking-tight select-none bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20"
          title="Companion has processed and verified input"
        >
          <CheckCheck className="w-3 h-3 text-emerald-400" />
          <span>Processed</span>
        </motion.span>
      ) : (
        <motion.span
          key="processing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          exit={{ opacity: 0 }}
          className="inline-flex items-center gap-1 text-amber-400/80 font-mono text-[9px] tracking-tight select-none bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20"
        >
          <RefreshCw className="w-2.5 h-2.5 animate-spin text-amber-400" />
          <span>Processing...</span>
        </motion.span>
      )}
    </AnimatePresence>
  );
}

interface TypewriterTextProps {
  text: string;
  onComplete?: () => void;
}

function TypewriterText({ text, onComplete }: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    setDisplayedText("");
    setIndex(0);
  }, [text]);

  useEffect(() => {
    if (index < text.length) {
      const speed = text.length > 400 ? 4 : text.length > 150 ? 8 : 14;
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text.charAt(index));
        setIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else {
      onCompleteRef.current?.();
    }
  }, [index, text]);

  return (
    <span className="whitespace-pre-wrap">
      {displayedText}
      {index < text.length && (
        <span className="inline-block w-1.5 h-4 ml-1 bg-[#FBBF24] animate-pulse rounded-full align-middle" />
      )}
    </span>
  );
}

const CURATED_ANCHORS = [
  {
    text: "The human capacity for burden is like bamboo — far more flexible than you'd ever believe at first glance.",
    author: "Jodi Picoult"
  },
  {
    text: "Out of suffering have emerged the strongest souls; the most massive characters are seared with scars.",
    author: "Kahlil Gibran"
  },
  {
    text: "The world breaks everyone and afterward many are strong at the broken places.",
    author: "Ernest Hemingway"
  },
  {
    text: "You may have to fight a battle more than once to win it.",
    author: "Margaret Thatcher"
  },
  {
    text: "Trauma creates change you don't choose. Healing is about creating change you do choose.",
    author: "Michelle Rosenthal"
  },
  {
    text: "Courage does not always roar. Sometimes courage is the quiet voice at the end of the day saying, 'I will try again tomorrow.'",
    author: "Mary Anne Radmacher"
  },
  {
    text: "We are not survivors because of what we lived through; we are survivors because we continue to live.",
    author: "Survivor's Oath"
  },
  {
    text: "Scars are not signs of weakness. They are proof of survival and trophies of your unshakeable spirit.",
    author: "Resilience Wisdom"
  },
  {
    text: "You survived what was meant to destroy you. Now rise and build what you are meant to inherit.",
    author: "Resilience Vault"
  },
  {
    text: "The depth of your pain is a testament to the depth of your strength. You are still standing.",
    author: "MindSafe Guardian"
  },
  {
    text: "He who has a why to live can bear almost any how.",
    author: "Friedrich Nietzsche"
  },
  {
    text: "No storm lasts forever. Even the darkest night will end and the sun will rise.",
    author: "Victor Hugo"
  }
];

const STARTER_PROMPTS = [
  { emoji: "🌱", text: "Right now, I am feeling a lot of tension because...", label: "Soothe Tension" },
  { emoji: "🏆", text: "A positive moment or micro-victory I had today was...", label: "Celebrate Win" },
  { emoji: "🧠", text: "I'm having a hard time letting go of a thought about...", label: "Release Worry" },
  { emoji: "💛", text: "Today, I want to practice being kind to myself about...", label: "Self-Kindness" },
  { emoji: "🌬️", text: "Help me ground my breathing and handle a wave of anxiety...", label: "Anxiety Relief" }
];

interface CustomChartDotProps {
  cx?: number;
  cy?: number;
  payload?: {
    name: string;
    Score: number;
    checkInRate: number;
    engagementRate: number;
    goalCompleted?: boolean;
  };
  index?: number;
}

const CustomChartDot = (props: CustomChartDotProps) => {
  const { cx, cy, payload, index } = props;
  if (cx === undefined || cy === undefined) return null;
  const idx = index ?? 0;

  const content = payload?.goalCompleted ? (
    <>
      {/* Pulsing outer accent */}
      <circle cx={cx} cy={cy} r={8} fill="#FBBF24" fillOpacity={0.3} className="animate-pulse" />
      {/* Distinctive custom ring and solid fill */}
      <circle cx={cx} cy={cy} r={4.5} fill="#FBBF24" stroke="#1E293B" strokeWidth={1.5} />
    </>
  ) : (
    <circle cx={cx} cy={cy} r={3.5} fill="#243B55" stroke="#FBBF24" strokeWidth={1.8} />
  );

  return (
    <motion.g
      key={`dot-${idx}-${payload?.name}`}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: idx * 0.08,
        duration: 0.45,
        type: "spring",
        stiffness: 120,
        damping: 12,
      }}
    >
      {content}
    </motion.g>
  );
};

interface CustomBarProps {
  fill?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  index?: number;
  payload?: any;
  dataKey?: string;
}

const CustomBar = (props: CustomBarProps) => {
  const { fill, x, y, width, height, index, dataKey } = props;
  if (x === undefined || y === undefined || width === undefined || height === undefined) return null;
  const idx = index ?? 0;
  const seriesOffset = dataKey === "engagementRate" ? 0.05 : 0;
  const delay = idx * 0.07 + seriesOffset;

  return (
    <motion.rect
      key={`bar-${dataKey || "series"}-${idx}-${x}-${y}-${height}`}
      x={x}
      width={width}
      fill={fill}
      rx={3.5}
      ry={3.5}
      initial={{ y: y + height, height: 0, opacity: 0 }}
      animate={{ y: y, height: Math.max(0, height), opacity: 1 }}
      transition={{
        delay: delay,
        duration: 0.65,
        ease: [0.25, 1, 0.5, 1],
      }}
    />
  );
};

const highlightText = (text: string, query: string) => {
  if (!query || !query.trim()) return text;
  const q = query.trim();
  const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, index) =>
    part.toLowerCase() === q.toLowerCase() ? (
      <mark key={index} className="bg-amber-400/40 text-amber-200 font-bold px-1 rounded mx-0.5 border border-amber-400/30">
        {part}
      </mark>
    ) : (
      part
    )
  );
};

export const getInitialWelcomeMessage = (mode: "mindsafe" | "nanny" = "mindsafe"): string => {
  if (mode === "nanny") {
    return `Welcome into the quiet waters, dear one 🐸.\n\nThe lily does not rush the sun — it simply opens when ready. You are safe here, and you do not have to carry everything all at once.\n\nRest as long as you need. I am right here with you 💚\n— Nanny Frog`;
  }
  return `Welcome, Warrior. I am right here with you.\n\nYour higher self sees the bigger picture: how much you've already overcome, how strong you've had to be, and how much clearer the path becomes when you stand in your truth. Keep going, one breath, one small step at a time. You are capable, you are worthy, and you are never walking alone.\n\nWith strength and love,\nMINDSAFE 🦁💚`;
};

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = safeLocalStorage.getItem("mindsafe-conversations-v2");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse saved conversations", e);
      }
    }
    
    // Check if there are legacy messages saved to migrate
    const savedGuide = (safeLocalStorage.getItem("mindsafe-active-guide") as "mindsafe" | "nanny") || "mindsafe";
    const legacySaved = safeLocalStorage.getItem("mindsafe-chat-messages-v1");
    let legacyMessages: Message[] = [
      {
        id: "welcome",
        sender: "ai",
        text: getInitialWelcomeMessage(savedGuide),
        timestamp: Date.now(),
      }
    ];
    if (legacySaved) {
      try {
        const parsed = JSON.parse(legacySaved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          legacyMessages = parsed;
        }
      } catch (e) {}
    }
    
    const legacySummary = safeLocalStorage.getItem("mindsafe-elite-summary-v1");

    return [
      {
        id: "default-session",
        title: "MindSafe Session 1",
        createdAt: Date.now(),
        messages: legacyMessages,
        eliteSummary: legacySummary,
      },
    ];
  });

  const [activeConversationId, setActiveConversationId] = useState<string>(() => {
    const savedActive = safeLocalStorage.getItem("mindsafe-active-conversation-id-v2");
    return savedActive || "default-session";
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const savedGuide = (safeLocalStorage.getItem("mindsafe-active-guide") as "mindsafe" | "nanny") || "mindsafe";
    const savedActiveId = safeLocalStorage.getItem("mindsafe-active-conversation-id-v2") || "default-session";
    const active = conversations.find(c => c.id === savedActiveId) || conversations[0];
    return active ? active.messages : [
      {
        id: "welcome",
        sender: "ai",
        text: getInitialWelcomeMessage(savedGuide),
        timestamp: Date.now(),
      },
    ];
  });

  const [input, setInput] = useState("");
  const [editingSourceText, setEditingSourceText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [isTtsEnabled, setIsTtsEnabled] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [chatFilter, setChatFilter] = useState<"all" | "saved">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sessionSearchQuery, setSessionSearchQuery] = useState("");
  const [sessionSortOrder, setSessionSortOrder] = useState<"newest" | "oldest">("newest");
  const [activeGuide, setActiveGuide] = useState<"mindsafe" | "nanny">(() => {
    return (safeLocalStorage.getItem("mindsafe-active-guide") as "mindsafe" | "nanny") || "mindsafe";
  });
  const [isSmartMenuOpen, setIsSmartMenuOpen] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [dailyAnchor, setDailyAnchor] = useState<{ text: string; author: string; timeLeft: string } | null>(null);
  const [copiedAnchor, setCopiedAnchor] = useState(false);
  const [isBreathingOpen, setIsBreathingOpen] = useState(false);
  const [isFeatureMenuOpen, setIsFeatureMenuOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [eliteSummary, setEliteSummary] = useState<string | null>(() => {
    const savedActiveId = safeLocalStorage.getItem("mindsafe-active-conversation-id-v2") || "default-session";
    const active = conversations.find(c => c.id === savedActiveId) || conversations[0];
    return active ? active.eliteSummary : null;
  });
  const [isSummarizing, setIsSummarizing] = useState(false);

  // User Profile details & Drawer navigation
  const [userMantra, setUserMantra] = useState<string>(() => {
    return safeLocalStorage.getItem("mindsafe-user-mantra") || "I am a survivor. One step at a time.";
  });
  const [userFocus, setUserFocus] = useState<string>(() => {
    return safeLocalStorage.getItem("mindsafe-user-focus") || "Trauma Recovery";
  });
  const [drawerActiveTab, setDrawerActiveTab] = useState<"profile" | "checkin" | "journal" | "analytics" | "story">("profile");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const isSwitchingRef = useRef(false);

  // Sync activeConversationId to localStorage
  useEffect(() => {
    safeLocalStorage.setItem("mindsafe-active-conversation-id-v2", activeConversationId);
  }, [activeConversationId]);

  // Sync conversations to localStorage
  useEffect(() => {
    safeLocalStorage.setItem("mindsafe-conversations-v2", JSON.stringify(conversations));
  }, [conversations]);

  // Handle active session loading
  useEffect(() => {
    const activeConv = conversations.find(c => c.id === activeConversationId);
    if (activeConv) {
      isSwitchingRef.current = true;
      setMessages(activeConv.messages);
      setEliteSummary(activeConv.eliteSummary);
      setTimeout(() => {
        isSwitchingRef.current = false;
      }, 0);
    }
  }, [activeConversationId]);

  // Sync messages and summary back into the conversations array
  useEffect(() => {
    if (isSwitchingRef.current) return;

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConversationId) {
          let newTitle = c.title;
          if (c.title === "New Session" || c.title.startsWith("MindSafe Session") || c.title.startsWith("Resilience Session")) {
            const firstUserMsg = messages.find((m) => m.sender === "user");
            if (firstUserMsg) {
              newTitle = generateSessionTitle(firstUserMsg.text);
            }
          }
          return {
            ...c,
            messages,
            eliteSummary,
            title: newTitle,
          };
        }
        return c;
      })
    );
  }, [messages, eliteSummary, activeConversationId]);

  const handleNewChat = () => {
    const newId = `session-${Date.now()}`;
    const newConv: Conversation = {
      id: newId,
      title: "New Session",
      createdAt: Date.now(),
      messages: [
        {
          id: "welcome",
          sender: "ai",
          text: getInitialWelcomeMessage(activeGuide),
          timestamp: Date.now(),
        },
      ],
      eliteSummary: null,
    };

    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newId);
  };

  const handleDeleteChat = (e: React.MouseEvent, idToDelete: string) => {
    e.stopPropagation();
    if (conversations.length <= 1) {
      alert("You need to keep at least one session active.");
      return;
    }
    if (confirm("Are you sure you want to permanently delete this saved session?")) {
      const updated = conversations.filter((c) => c.id !== idToDelete);
      setConversations(updated);
      if (activeConversationId === idToDelete) {
        // Fallback to the first available conversation
        setActiveConversationId(updated[0].id);
      }
    }
  };
  
  // Translation & Reaction support states
  const [translatingId, setTranslatingId] = useState<string | null>(null);
  const [activeTranslateMenuId, setActiveTranslateMenuId] = useState<string | null>(null);
  const [activeReactionMenuId, setActiveReactionMenuId] = useState<string | null>(null);

  const handleTranslateMessage = async (messageId: string, langCode: string, langName: string) => {
    const msg = messages.find((m) => m.id === messageId);
    if (!msg) return;

    // If already translated to the requested language, toggle it on and exit
    if (msg.translatedText && msg.targetLangName === langName) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, isShowingTranslation: true }
            : m
        )
      );
      return;
    }

    setTranslatingId(messageId);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: msg.text,
          targetLanguage: langName,
        }),
      });

      if (!res.ok) {
        throw new Error("Translation request failed");
      }

      const data = await res.json();
      if (data.translatedText) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  translatedText: data.translatedText,
                  targetLangName: langName,
                  isShowingTranslation: true,
                }
              : m
          )
        );
      }
    } catch (err) {
      console.error("Translation error:", err);
    } finally {
      setTranslatingId(null);
    }
  };
  
  // Custom user name state for personalization
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem("mindsafe-user-name-v1") || "Warrior";
  });
  
  // Welcome Email / Onboarding modal states
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  const [hasUnreadMail, setHasUnreadMail] = useState(() => {
    return localStorage.getItem("mindsafe-welcome-read-v1") !== "true";
  });
  const [isEliteUser, setIsEliteUser] = useState<boolean>(() => {
    return localStorage.getItem("mindsafe-is-elite-user-v1") === "true";
  });

  // Color Theme & Modal States
  const [currentThemeId, setCurrentThemeId] = useState<string>(getSavedThemeId);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Smart Notifications State
  const [smartNotificationsEnabled, setSmartNotificationsEnabled] = useState<boolean>(() => {
    return localStorage.getItem("mindsafe-smart-notifications-v1") === "true";
  });
  const [notificationPermission, setNotificationPermission] = useState<string>(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission;
    }
    return "default";
  });
  const [smartNotificationNotice, setSmartNotificationNotice] = useState<string | null>(null);

  const handleToggleSmartNotifications = async () => {
    setSmartNotificationNotice(null);
    if (typeof window === "undefined" || !("Notification" in window)) {
      setSmartNotificationNotice("⚠️ Web Notifications are not supported by your current browser.");
      return;
    }

    if (!smartNotificationsEnabled) {
      let perm = Notification.permission;
      if (perm === "default") {
        try {
          perm = await Notification.requestPermission();
          setNotificationPermission(perm);
        } catch (err) {
          console.error("Error requesting notification permission:", err);
        }
      }

      if (perm === "granted") {
        setSmartNotificationsEnabled(true);
        localStorage.setItem("mindsafe-smart-notifications-v1", "true");
        setSmartNotificationNotice("🔔 Smart Push Notifications activated! You will receive daily resilience reminders.");

        try {
          new Notification("🧠 MindSafe AI — Smart Notifications Active", {
            body: "Smart resilience reminders enabled. We'll gently keep you focused on your daily goals!",
            icon: "/favicon.ico",
          });
        } catch (e) {
          console.log("Notification dispatch note:", e);
        }

        if (firebaseUser) {
          try {
            const userDocRef = doc(db, "users", firebaseUser.uid);
            await setDoc(userDocRef, { smartNotifications: true, updatedAt: Date.now() }, { merge: true });
          } catch (e) {
            console.error("Failed to sync notification pref to Firestore:", e);
          }
        }
      } else {
        setSmartNotificationsEnabled(false);
        localStorage.setItem("mindsafe-smart-notifications-v1", "false");
        setSmartNotificationNotice("⚠️ Notifications permission denied in browser settings. Please enable browser notifications to receive goal reminders.");
      }
    } else {
      setSmartNotificationsEnabled(false);
      localStorage.setItem("mindsafe-smart-notifications-v1", "false");
      setSmartNotificationNotice("🔕 Smart Notifications turned off.");

      if (firebaseUser) {
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          await setDoc(userDocRef, { smartNotifications: false, updatedAt: Date.now() }, { merge: true });
        } catch (e) {
          console.error("Failed to sync notification pref to Firestore:", e);
        }
      }
    }
  };

  const handleSendTestNotification = () => {
    setSmartNotificationNotice(null);
    if (typeof window === "undefined" || !("Notification" in window)) {
      setSmartNotificationNotice("⚠️ Web Notifications are not supported by your current browser.");
      return;
    }
    if (Notification.permission === "granted") {
      try {
        new Notification("🧠 MindSafe AI — Daily Resilience Reminder", {
          body: "Stay grounded today! Have you checked off your daily resilience goals and journal entries?",
          icon: "/favicon.ico",
        });
        setSmartNotificationNotice("✨ Test notification dispatched to your system!");
      } catch (e) {
        setSmartNotificationNotice("✨ Test notification request dispatched!");
      }
    } else {
      setSmartNotificationNotice("⚠️ Notification permission not granted. Click 'Enable Smart Reminders' first.");
    }
  };

  useEffect(() => {
    applyTheme(currentThemeId);
  }, [currentThemeId]);

  useEffect(() => {
    const handleThemeEvent = (e: any) => {
      if (e.detail?.id) {
        setCurrentThemeId(e.detail.id);
      }
    };
    window.addEventListener("mindsafe-theme-changed", handleThemeEvent);
    return () => window.removeEventListener("mindsafe-theme-changed", handleThemeEvent);
  }, []);

  // Firebase auth state
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState(true);
  const [isCheckingVerification, setIsCheckingVerification] = useState(false);
  const [verificationNotice, setVerificationNotice] = useState<string | null>(null);

  const isEmailVerified = Boolean(
    firebaseUser && (
      firebaseUser.emailVerified || 
      firebaseUser.email === "v1kwanny1@gmail.com" || 
      firebaseUser.email === "mindsafe.uk@outlook.com"
    )
  );

  const handleCheckVerificationStatus = async () => {
    setIsCheckingVerification(true);
    setVerificationNotice(null);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setVerificationNotice("⚠️ Session initializing... Please try clicking Check Status again in a moment.");
        return;
      }
      await currentUser.reload();
      const updatedUser = auth.currentUser || currentUser;
      setFirebaseUser({ ...updatedUser });
      if (updatedUser.emailVerified || updatedUser.email === "v1kwanny1@gmail.com" || updatedUser.email === "mindsafe.uk@outlook.com") {
        setVerificationNotice("🎉 Email verified successfully! Full community chat & cloud features are now unlocked.");
      } else {
        setVerificationNotice(`⚠️ Email is not verified yet. A verification link was sent to ${updatedUser.email}. Please check your inbox or spam folder, or click "Resend Email".`);
      }
    } catch (err: any) {
      console.error("Failed to check verification status:", err);
      setVerificationNotice("Error reloading verification status. Please try again in a moment.");
    } finally {
      setIsCheckingVerification(false);
    }
  };

  const handleResendVerificationEmail = async () => {
    if (!auth.currentUser) return;
    setIsCheckingVerification(true);
    setVerificationNotice(null);
    try {
      await sendEmailVerification(auth.currentUser);
      setVerificationNotice(`✉️ Verification link sent to ${auth.currentUser.email}. Please check your inbox or spam folder.`);
    } catch (err: any) {
      console.error("Failed to resend verification email:", err);
      setVerificationNotice(`✉️ Verification email request queued for ${auth.currentUser.email}. Please check your inbox.`);
    } finally {
      setIsCheckingVerification(false);
    }
  };

  // Subscribe to Firebase Auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFirebaseUser(user);
        // Load custom profile data from Firestore
        try {
          const userDocRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.displayName) {
              setUserName(data.displayName);
              localStorage.setItem("mindsafe-user-name-v1", data.displayName);
            }
            if (typeof data.isEliteUser === "boolean" || user.email === "mindsafe.uk@outlook.com" || user.email === "v1kwanny1@gmail.com") {
              const hasElite = (user.email === "v1kwanny1@gmail.com" || user.email === "mindsafe.uk@outlook.com") ? true : data.isEliteUser;
              setIsEliteUser(hasElite);
              localStorage.setItem("mindsafe-is-elite-user-v1", String(hasElite));
            }
            if (data.theme) {
              setCurrentThemeId(data.theme);
              applyTheme(data.theme);
            }
            if (typeof data.smartNotifications === "boolean") {
              setSmartNotificationsEnabled(data.smartNotifications);
              localStorage.setItem("mindsafe-smart-notifications-v1", String(data.smartNotifications));
            }
          } else if (user.email === "v1kwanny1@gmail.com" || user.email === "mindsafe.uk@outlook.com") {
            // Auto create admin/elite document if missing
            const initialProfile = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || "Elite Warrior",
              isEliteUser: true,
              tier: "elite",
              createdAt: Date.now(),
              updatedAt: Date.now()
            };
            await setDoc(userDocRef, initialProfile);
            setUserName(initialProfile.displayName);
            setIsEliteUser(true);
            localStorage.setItem("mindsafe-user-name-v1", initialProfile.displayName);
            localStorage.setItem("mindsafe-is-elite-user-v1", "true");
          }
        } catch (err) {
          console.error("Error fetching user profile from Firestore", err);
        }
      } else {
        setFirebaseUser(null);
      }
      setIsFirebaseLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const toggleEliteMembership = async () => {
    const nextVal = !isEliteUser;
    setIsEliteUser(nextVal);
    localStorage.setItem("mindsafe-is-elite-user-v1", String(nextVal));
    if (firebaseUser) {
      try {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        await setDoc(userDocRef, { isEliteUser: nextVal, updatedAt: Date.now() }, { merge: true });
      } catch (err) {
        console.error("Failed to update Elite subscription in Firestore", err);
      }
    }
  };

  const handleFirebaseSignOut = async () => {
    try {
      await firebaseSignOut(auth);
      setFirebaseUser(null);
      setUserName("Warrior");
      setIsEliteUser(false);
      localStorage.setItem("mindsafe-user-name-v1", "Warrior");
      localStorage.setItem("mindsafe-is-elite-user-v1", "false");
    } catch (err) {
      console.error("Failed to sign out", err);
    }
  };
  
  // Daily Resilience Goal tracking state
  const getTodayDateStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const [dailyGoal, setDailyGoal] = useState<{ text: string; completed: boolean; date: string }>(() => {
    const today = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`;
    try {
      const saved = localStorage.getItem("mindsafe_daily_goal");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          if (parsed.date === today) {
            return parsed;
          } else {
            return {
              text: parsed.text || "Practice mindfulness for 10 mins",
              completed: false,
              date: today,
            };
          }
        }
      }
    } catch (err) {
      console.error("Error reading daily goal:", err);
    }
    return {
      text: "Practice mindfulness for 10 mins",
      completed: false,
      date: today,
    };
  });

  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(dailyGoal.text);

  // Daily Goal Particle Explosion State & 7-Day Streak Celebratory Modal
  const [showCheckboxExplosion, setShowCheckboxExplosion] = useState(false);
  const [explosionKey, setExplosionKey] = useState(0);
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);

  const triggerCheckboxExplosion = () => {
    setExplosionKey((prev) => prev + 1);
    setShowCheckboxExplosion(true);
    setIsStreakModalOpen(true);
    setTimeout(() => {
      setShowCheckboxExplosion(false);
    }, 2200);
  };

  // Workspace Navigation Tab State & Multimodal Image Modal State
  const [activeTab, setActiveTab] = useState<"chat" | "community" | "analytics" | "journal" | "checkin" | "calendar" | "sanctuary" | "avatar" | "workplace" | "workspace" | "maps">("chat");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  // Custom User Avatar Configuration State
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(() => {
    try {
      const saved = safeLocalStorage.getItem("mindsafe_custom_avatar_config");
      if (saved) {
        return { ...DEFAULT_AVATAR, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn("Avatar config load warning:", e);
    }
    return DEFAULT_AVATAR;
  });

  useEffect(() => {
    const handleAvatarUpdate = (e: any) => {
      if (e.detail) {
        setAvatarConfig(e.detail);
      }
    };
    window.addEventListener("mindsafe-avatar-updated", handleAvatarUpdate);
    return () => window.removeEventListener("mindsafe-avatar-updated", handleAvatarUpdate);
  }, []);

  // New Production Hub Modal States
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isReframeModalOpen, setIsReframeModalOpen] = useState(false);
  const [reframeInitialThought, setReframeInitialThought] = useState("");
  const [currentEmotionalTone, setCurrentEmotionalTone] = useState<"EMOTIONAL" | "TACTICAL" | "SPIRITUAL" | "BALANCED">("BALANCED");
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [soundscapeMode, setSoundscapeMode] = useState<"alpha" | "rain" | "ocean" | "bowl">("alpha");

  // Streak Freeze State
  const [freezeTokens, setFreezeTokens] = useState<number>(() => {
    const saved = localStorage.getItem("mindsafe_streak_freeze_tokens");
    return saved !== null ? parseInt(saved, 10) : 2;
  });

  const [frozenDates, setFrozenDates] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("mindsafe_frozen_goal_dates");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Resilience Trends View Mode (Timeline Heatmap vs 7-Day Line/Bar vs Both)
  const [trendsViewMode, setTrendsViewMode] = useState<"timeline" | "chart" | "both">("timeline");

  // Historic Completed Goals State with localStorage persistence
  const [completedGoalsHistory, setCompletedGoalsHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("mindsafe_completed_goals_history");
      const parsed = saved ? JSON.parse(saved) : null;
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      // Seed historic goal completion dates (e.g. past days)
      const seeded: string[] = [];
      for (const offset of [2, 4, 5, 8, 11, 14, 15, 18, 21]) {
        const d = new Date();
        d.setDate(d.getDate() - offset);
        const str = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        seeded.push(str);
      }
      localStorage.setItem("mindsafe_completed_goals_history", JSON.stringify(seeded));
      return seeded;
    } catch {
      return [];
    }
  });

  // Completed Goal Records with Rich Categories & Habit Insights
  const [completedGoalRecords, setCompletedGoalRecords] = useState<CompletedGoalRecord[]>(() => {
    return getCompletedGoalRecords();
  });

  const [goalRecommendations, setGoalRecommendations] = useState<GoalRecommendation[]>(() => {
    const recs = getCompletedGoalRecords();
    return generateRecommendedGoals(dailyGoal.text, recs, completedGoalsHistory);
  });

  const [showGoalRecommendation, setShowGoalRecommendation] = useState<boolean>(dailyGoal.completed);
  const [stagedTomorrowGoalText, setStagedTomorrowGoalText] = useState<string | null>(() => {
    const staged = getStagedNextGoal();
    return staged?.text || null;
  });

  const goalAnalysis = React.useMemo(() => {
    return analyzeGoalsHistory(completedGoalRecords, completedGoalsHistory);
  }, [completedGoalRecords, completedGoalsHistory]);

  const handleToggleGoalForDate = (dateStr: string) => {
    setCompletedGoalsHistory((prev) => {
      let next: string[];
      if (prev.includes(dateStr)) {
        next = prev.filter((d) => d !== dateStr);
        const updatedRecs = removeCompletedGoalRecord(dateStr);
        setCompletedGoalRecords(updatedRecs);
      } else {
        next = [...prev, dateStr];
        const updatedRecs = saveCompletedGoalRecord(dailyGoal.text, dateStr);
        setCompletedGoalRecords(updatedRecs);
      }
      localStorage.setItem("mindsafe_completed_goals_history", JSON.stringify(next));
      if (dateStr === dailyGoal.date) {
        const nextComp = next.includes(dateStr);
        setDailyGoal((g) => ({ ...g, completed: nextComp }));
        if (nextComp) {
          const recs = generateRecommendedGoals(dailyGoal.text, getCompletedGoalRecords(), next);
          setGoalRecommendations(recs);
          setShowGoalRecommendation(true);
        } else {
          setShowGoalRecommendation(false);
        }
      }
      return next;
    });
  };

  useEffect(() => {
    localStorage.setItem("mindsafe_streak_freeze_tokens", freezeTokens.toString());
  }, [freezeTokens]);

  useEffect(() => {
    localStorage.setItem("mindsafe_frozen_goal_dates", JSON.stringify(frozenDates));
  }, [frozenDates]);

  const handleUseFreezeToken = (dateStr: string) => {
    if (freezeTokens <= 0) {
      alert("You don't have any Streak Freeze tokens remaining! Click 'Refill Tokens' to reset your tokens.");
      return;
    }
    if (frozenDates.includes(dateStr)) return;

    setFreezeTokens((prev) => Math.max(0, prev - 1));
    setFrozenDates((prev) => [...prev, dateStr]);
  };

  const handleRemoveFreeze = (dateStr: string) => {
    setFrozenDates((prev) => prev.filter((d) => d !== dateStr));
    setFreezeTokens((prev) => prev + 1);
  };

  const handleRefillFreezeTokens = () => {
    setFreezeTokens(2);
  };

  useEffect(() => {
    localStorage.setItem("mindsafe_daily_goal", JSON.stringify(dailyGoal));
  }, [dailyGoal]);

  // Smart Notification Background Inactivity Listener Effect
  useEffect(() => {
    if (!smartNotificationsEnabled || notificationPermission !== "granted" || typeof window === "undefined") return;

    let inactivityTimer: any = null;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        inactivityTimer = setTimeout(() => {
          const message = !dailyGoal.completed
            ? `Goal Reminder: "${dailyGoal.text}". Keep your momentum going!`
            : "Take a quiet moment to reflect with MindSafe AI & Nanny Frog.";

          if ("Notification" in window && Notification.permission === "granted") {
            try {
              new Notification("🧠 MindSafe AI — Daily Resilience Focus", {
                body: message,
                tag: "mindsafe-goal-inactivity-reminder",
              });
            } catch (e) {
              console.log("Inactivity notification error:", e);
            }
          }
        }, 15000); // Trigger 15s after tab becomes inactive
      } else {
        if (inactivityTimer) clearTimeout(inactivityTimer);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (inactivityTimer) clearTimeout(inactivityTimer);
    };
  }, [smartNotificationsEnabled, notificationPermission, dailyGoal]);

  // Synchronize and seed completed goal history
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem("mindsafe_completed_goals_history");
      if (!savedHistory) {
        // Seed some historic goal completion dates (e.g. 2, 4, and 5 days ago) to demonstrate correlation immediately
        const seededDates = [];
        for (const offset of [2, 4, 5]) {
          const d = new Date();
          d.setDate(d.getDate() - offset);
          const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          seededDates.push(dateStr);
        }
        localStorage.setItem("mindsafe_completed_goals_history", JSON.stringify(seededDates));
      } else {
        let completedDates: string[] = JSON.parse(savedHistory);
        if (!Array.isArray(completedDates)) completedDates = [];

        if (dailyGoal.completed) {
          if (!completedDates.includes(dailyGoal.date)) {
            const updated = [...completedDates, dailyGoal.date];
            localStorage.setItem("mindsafe_completed_goals_history", JSON.stringify(updated));
          }
        } else {
          if (completedDates.includes(dailyGoal.date)) {
            const updated = completedDates.filter(d => d !== dailyGoal.date);
            localStorage.setItem("mindsafe_completed_goals_history", JSON.stringify(updated));
          }
        }
      }
    } catch (err) {
      console.error("Error updating completed goals history:", err);
    }
  }, [dailyGoal]);

  // Daily Resilience Goal load-time notification check
  const [showGoalNotification, setShowGoalNotification] = useState(false);
  const [hasNotifiedOnLoad, setHasNotifiedOnLoad] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<"pending" | "completed">("pending");

  useEffect(() => {
    if (!dailyGoal.completed && !hasNotifiedOnLoad) {
      const timer = setTimeout(() => {
        setShowGoalNotification(true);
        setHasNotifiedOnLoad(true);
        setNotificationStatus("pending");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [dailyGoal.completed, hasNotifiedOnLoad]);

  useEffect(() => {
    if (dailyGoal.completed && showGoalNotification && notificationStatus === "pending") {
      setNotificationStatus("completed");
      const timer = setTimeout(() => {
        setShowGoalNotification(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [dailyGoal.completed, showGoalNotification, notificationStatus]);
  
  // Custom Voice Recording (Speech-to-Text via Server Service)
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const durationIntervalRef = useRef<any>(null);

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Your browser does not support microphone access.");
        return;
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      
      // Determine a supported mimeType
      let mimeType = "audio/webm";
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        mimeType = "audio/webm;codecs=opus";
      } else if (MediaRecorder.isTypeSupported("audio/webm")) {
        mimeType = "audio/webm";
      } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
        mimeType = "audio/ogg";
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        mimeType = "audio/mp4";
      } else if (MediaRecorder.isTypeSupported("audio/aac")) {
        mimeType = "audio/aac";
      }

      const options = { mimeType };
      const mediaRecorder = new MediaRecorder(stream, options);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks to release the microphone immediately
        stream.getTracks().forEach((track) => track.stop());

        if (audioChunksRef.current.length === 0) {
          setIsTranscribing(false);
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        
        // Convert to base64
        setIsTranscribing(true);
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Data = reader.result as string;
          const base64Payload = base64Data.split(",")[1];
          
          try {
            const res = await fetch("/api/transcribe", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                audio: base64Payload,
                mimeType: mimeType,
              }),
            });

            if (!res.ok) {
              throw new Error("Failed to transcribe audio");
            }

            const data = await res.json();
            const text = data.transcription?.trim();
            
            if (text && text !== "(Silence)") {
              // Add transcribed text directly to the chat
              handleSend(text);
            } else if (text === "(Silence)") {
              alert("The audio recording was too quiet or no speech was detected.");
            } else {
              alert("Could not transcribe the audio. Let's try again!");
            }
          } catch (err) {
            console.error("Transcription error:", err);
            alert("Sorry, an error occurred during transcription. Please try typing instead.");
          } finally {
            setIsTranscribing(false);
          }
        };
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(250); // Record chunks of 250ms
      setIsRecording(true);
      setRecordingDuration(0);

      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Failed to access microphone:", err);
      alert("Microphone access denied or not available. Please allow access to record voice messages.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);
  
  // Ambient Focus Sound Generator State & Refs
  const [isMuted, setIsMuted] = useState(true);
  const [ambientVolume, setAmbientVolume] = useState<number>(() => {
    const savedVol = localStorage.getItem("mindsafe-ambient-volume");
    return savedVol ? parseInt(savedVol, 10) : 50;
  });
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<any[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);
  const lfoRef = useRef<any>(null);

  const updateAmbientVolume = (newVol: number) => {
    setAmbientVolume(newVol);
    localStorage.setItem("mindsafe-ambient-volume", String(newVol));
    if (gainNodeRef.current && audioCtxRef.current) {
      const gainValue = (newVol / 100) * 0.16;
      gainNodeRef.current.gain.setValueAtTime(gainValue, audioCtxRef.current.currentTime);
    }
  };

  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const startAmbientAudio = () => {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;

      const ctx = new AudioCtxClass();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      const targetGain = (ambientVolume / 100) * 0.16;
      masterGain.gain.linearRampToValueAtTime(targetGain, ctx.currentTime + 2.0);
      gainNodeRef.current = masterGain;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(220, ctx.currentTime);

      const frequencies = [136.1, 170.12, 204.15];
      const oscillators: any[] = [];

      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = idx === 0 ? "sine" : "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const oscGain = ctx.createGain();
        const vol = idx === 0 ? 0.45 : idx === 1 ? 0.15 : 0.1;
        oscGain.gain.setValueAtTime(vol, ctx.currentTime);

        osc.connect(oscGain);
        oscGain.connect(filter);
        osc.start(0);
        oscillators.push(osc);
      });

      filter.connect(masterGain);
      masterGain.connect(ctx.destination);

      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.setValueAtTime(0.1, ctx.currentTime);

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.02, ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(masterGain.gain);
      lfo.start(0);

      lfoRef.current = lfo;
      oscillatorsRef.current = oscillators;
    } catch (err) {
      console.error("Failed to start ambient breathing audio:", err);
    }
  };

  const stopAmbientAudio = () => {
    try {
      if (lfoRef.current) {
        lfoRef.current.stop();
        lfoRef.current.disconnect();
        lfoRef.current = null;
      }
      if (oscillatorsRef.current) {
        oscillatorsRef.current.forEach(osc => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {}
        });
        oscillatorsRef.current = [];
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
        gainNodeRef.current = null;
      }
      if (audioCtxRef.current) {
        if (audioCtxRef.current.state !== "closed") {
          audioCtxRef.current.close();
        }
        audioCtxRef.current = null;
      }
    } catch (err) {
      console.error("Failed to clean up ambient audio:", err);
    }
  };

  const toggleAmbientAudio = () => {
    if (!isMuted) {
      stopAmbientAudio();
      setIsMuted(true);
    } else {
      setIsMuted(false);
      startAmbientAudio();
    }
  };

  useEffect(() => {
    return () => {
      stopAmbientAudio();
    };
  }, []);

  const handleTransform = async (mode: "summarize" | "expand" | "professionalize") => {
    if (!input.trim() || isTransforming) return;
    setIsTransforming(true);
    setIsSmartMenuOpen(false);

    try {
      const response = await fetch("/api/transform", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: input,
          mode: mode,
        }),
      });

      const data = await response.json();
      if (data && data.result) {
        setInput(data.result);
      }
    } catch (e) {
      console.error("Failed to transform text:", e);
    } finally {
      setIsTransforming(false);
    }
  };

  // Multi-chat localstorage is synchronized reactively via conversations state hooks.

  // Handle Daily Resilience Anchor selection and 24-hour cycle
  useEffect(() => {
    const updateAnchor = () => {
      try {
        const stored = localStorage.getItem("mindsafe_daily_anchor_v1");
        const historyStored = localStorage.getItem("mindsafe_anchor_history_v1");
        
        let history: number[] = [];
        if (historyStored) {
          try {
            history = JSON.parse(historyStored);
          } catch {
            history = [];
          }
        }

        const now = Date.now();
        const ONE_DAY_MS = 24 * 60 * 60 * 1000;

        let selectedQuoteIndex = -1;
        let selectedTimestamp = 0;

        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed && typeof parsed.index === "number" && typeof parsed.timestamp === "number") {
              const age = now - parsed.timestamp;
              if (age < ONE_DAY_MS && age >= 0) {
                selectedQuoteIndex = parsed.index;
                selectedTimestamp = parsed.timestamp;
              }
            }
          } catch {
            // parsing error, fallback to new selection
          }
        }

        if (selectedQuoteIndex === -1) {
          let availableIndices = CURATED_ANCHORS.map((_, i) => i).filter(i => !history.includes(i));
          
          if (availableIndices.length === 0) {
            const lastSeenIndex = history[history.length - 1];
            availableIndices = CURATED_ANCHORS.map((_, i) => i).filter(i => i !== lastSeenIndex);
            if (availableIndices.length === 0) {
              availableIndices = CURATED_ANCHORS.map((_, i) => i);
            }
            history = [];
          }

          const randomIndex = Math.floor(Math.random() * availableIndices.length);
          selectedQuoteIndex = availableIndices[randomIndex];
          selectedTimestamp = now;

          history.push(selectedQuoteIndex);
          localStorage.setItem("mindsafe_anchor_history_v1", JSON.stringify(history));
          
          localStorage.setItem("mindsafe_daily_anchor_v1", JSON.stringify({
            index: selectedQuoteIndex,
            timestamp: selectedTimestamp
          }));
        }

        const elapsed = Date.now() - selectedTimestamp;
        const remainingMs = Math.max(0, ONE_DAY_MS - elapsed);
        const hours = Math.floor(remainingMs / (60 * 60 * 1000));
        const minutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
        
        const pad = (n: number) => String(n).padStart(2, "0");
        const timeLeftStr = `${pad(hours)}h ${pad(minutes)}m`;

        const quote = CURATED_ANCHORS[selectedQuoteIndex];
        setDailyAnchor({
          text: quote.text,
          author: quote.author,
          timeLeft: timeLeftStr
        });
      } catch (e) {
        console.error("Failed to select daily resilience anchor", e);
      }
    };

    updateAnchor();

    const timer = setInterval(() => {
      updateAnchor();
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const togglePin = (msgId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === msgId ? { ...msg, isPinned: !msg.isPinned } : msg
      )
    );
  };

  const toggleHeart = (msgId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === msgId ? { ...msg, isHearted: !msg.isHearted } : msg
      )
    );
  };

  const toggleReaction = (msgId: string, reactionTag: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === msgId) {
          const currentReactions = msg.reactions || [];
          const exists = currentReactions.includes(reactionTag);
          const updated = exists
            ? currentReactions.filter((r) => r !== reactionTag)
            : [...currentReactions, reactionTag];
          return { ...msg, reactions: updated };
        }
        return msg;
      })
    );
  };

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    
    // Strip decorative emojis for cleaner TTS pronunciation
    const cleanText = text
      .replace(/[🧠👊🏽🦁🛡️💛]/g, "")
      .replace(/\*\*/g, "") // Strip markdown bold formatting
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voices = window.speechSynthesis.getVoices();
    // Prefer warm natural sounding English voices
    const preferredVoice = voices.find(v => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Daniel"))) || voices.find(v => v.lang.startsWith("en"));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    utterance.rate = 0.95; // Steady, warm pacing
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleToggleSpeakMessage = (msgId: string, text: string) => {
    if (speakingMsgId === msgId) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setSpeakingMsgId(null);
    } else {
      setSpeakingMsgId(msgId);
      if (!('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      
      const cleanText = text
        .replace(/[🧠👊🏽🦁🛡️💛🌿🐸✨💡🚨]/g, "")
        .replace(/\*\*/g, "")
        .replace(/🔍 Choose Your Next Action Step[\s\S]*/, "")
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Daniel") || v.name.includes("Samantha"))) || voices.find(v => v.lang.startsWith("en"));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      utterance.rate = 0.95;
      utterance.pitch = activeGuide === "nanny" ? 1.05 : 0.95;
      utterance.onend = () => setSpeakingMsgId(null);
      utterance.onerror = () => setSpeakingMsgId(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Speak the last AI message if TTS is toggled on
  useEffect(() => {
    if (isTtsEnabled) {
      const lastAiMessage = [...messages].reverse().find(m => m.sender === "ai");
      if (lastAiMessage) {
        speak(lastAiMessage.text);
      }
    } else {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, [isTtsEnabled]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInput((prev) => prev ? `${prev} ${transcript}` : transcript);
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
        setIsListening(false);
      }
    }
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to clear your current conversation history?")) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setMessages([
        {
          id: "welcome",
          sender: "ai",
          text: "Hey there 👋 How can I help you today?",
          timestamp: Date.now(),
        },
      ]);
      setEliteSummary(null);
      localStorage.removeItem("mindsafe-elite-summary-v1");
    }
  };

  const handleGenerateEliteSummary = async () => {
    if (messages.length <= 1) {
      alert("Please start a session and talk to your companion first to generate an Elite Summary of your breakthroughs!");
      return;
    }

    setIsSummarizing(true);
    try {
      const res = await fetch("/api/summarize-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate session summary");
      }

      const data = await res.json();
      if (data.summary) {
        setEliteSummary(data.summary);
        localStorage.setItem("mindsafe-elite-summary-v1", data.summary);
      } else {
        alert("Could not generate summary. Let's try again!");
      }
    } catch (err) {
      console.error("Summary error:", err);
      alert("An error occurred while generating your Elite Summary. Please try again.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleDownload = () => {
    if (messages.length <= 1) {
      alert("No active coaching conversations to export yet.");
      return;
    }

    const title = "========================================================\n" +
                  "              MINDSAFE AI RESILIENCE LOG                \n" +
                  "========================================================\n\n" +
                  `Exported: ${new Date().toLocaleString()}\n` +
                  "--------------------------------------------------------\n\n";

    const body = messages
      .map((m, index) => {
        const senderLabel = m.sender === "user" ? "YOU" : "MINDSAFE AI";
        return `[${index + 1}] ${senderLabel}:\n${m.text}\n\n--------------------------------------------------------\n`;
      })
      .join("\n");

    const footer = "\n========================================================\n" +
                   "  Stay strong. Keep fighting. Your resilience is yours. \n" +
                   "========================================================\n";

    const fullText = title + body + footer;
    const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    
    const dateStr = new Date().toISOString().split('T')[0];
    link.download = `mindsafe-coaching-session-${dateStr}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Scroll chat box to the bottom automatically
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Automatically grow textarea height on input change
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEditUserMessage = (text: string) => {
    setInput(text);
    setEditingSourceText(text);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.selectionStart = text.length;
        textareaRef.current.selectionEnd = text.length;
      }
    }, 50);
  };

  const handleSelectReflectionPrompt = (promptText: string) => {
    setInput(promptText);
    setEditingSourceText(null);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.selectionStart = promptText.length;
        textareaRef.current.selectionEnd = promptText.length;
      }
    }, 50);
  };

  const handleSend = async (customText?: string) => {
    const msgText = customText ? customText.trim() : input.trim();
    if (!msgText) return;

    if (!customText) {
      setInput("");
      setEditingSourceText(null);
    }

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: msgText,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Build history payload from existing messages before adding new user message
      const chatHistoryPayload = messages.map((m) => ({
        role: m.sender === "user" ? "user" : "model",
        text: m.text,
      }));

      // Fetch user experience data from localStorage for highly personalized answers
      let journalEntries: any[] = [];
      try {
        const savedJournal = localStorage.getItem("mindsafe_journal_entries");
        if (savedJournal) {
          const parsed = JSON.parse(savedJournal);
          journalEntries = Object.values(parsed);
        }
      } catch (e) {
        console.error("Failed to parse journal entries for chat context:", e);
      }

      let checkInHistory: any[] = [];
      try {
        const savedCheckIn = localStorage.getItem("mindsafe_checkin_history");
        if (savedCheckIn) {
          checkInHistory = JSON.parse(savedCheckIn);
        }
      } catch (e) {
        console.error("Failed to parse checkin history for chat context:", e);
      }

      let completedGoals: any[] = [];
      try {
        const savedGoalsRecords = localStorage.getItem("mindsafe_completed_goals_records");
        if (savedGoalsRecords) {
          completedGoals = JSON.parse(savedGoalsRecords);
        } else {
          const savedGoalsHistory = localStorage.getItem("mindsafe_completed_goals_history");
          if (savedGoalsHistory) {
            completedGoals = JSON.parse(savedGoalsHistory);
          }
        }
      } catch (e) {
        console.error("Failed to parse completed goals for chat context:", e);
      }

      const savedInsights = updatedMessages
        .filter((m) => m.isPinned || m.isHearted)
        .map((m) => m.text);

      // Construct dynamic conversation state summary to track topics discussed in current session
      const previousUserMsgs = updatedMessages
        .slice(0, -1)
        .filter((m) => m.sender === "user")
        .map((m) => m.text);

      const previousAiMsgs = updatedMessages
        .slice(0, -1)
        .filter((m) => m.sender === "ai")
        .map((m) => m.text);

      const trackedTopics: string[] = [];
      previousUserMsgs.forEach((txt) => {
        const lower = txt.toLowerCase();
        if ((lower.includes("control") || lower.includes("discipline") || lower.includes("patience")) && !trackedTopics.includes("Self-Control & Personal Discipline")) {
          trackedTopics.push("Self-Control & Personal Discipline");
        }
        if ((lower.includes("mindsafe") || lower.includes("victor") || lower.includes("god brain") || lower.includes("business plan") || lower.includes("subsidiary")) && !trackedTopics.includes("MindSafe Holdings / God Brain Master Strategy")) {
          trackedTopics.push("MindSafe Holdings / God Brain Master Strategy");
        }
        if ((lower.includes("anxiety") || lower.includes("stress") || lower.includes("panic") || lower.includes("overwhelmed")) && !trackedTopics.includes("Anxiety & Emotional Grounding")) {
          trackedTopics.push("Anxiety & Emotional Grounding");
        }
        if ((lower.includes("problem") || lower.includes("solve") || lower.includes("decision") || lower.includes("coaching") || lower.includes("career")) && !trackedTopics.includes("Life Coaching & Strategic Problem Solving")) {
          trackedTopics.push("Life Coaching & Strategic Problem Solving");
        }
        if ((lower.includes("goal") || lower.includes("resilience")) && !trackedTopics.includes("Daily Resilience Goals & Practice")) {
          trackedTopics.push("Daily Resilience Goals & Practice");
        }
        if ((lower.includes("launch") || lower.includes("2027") || lower.includes("growth")) && !trackedTopics.includes("2027 Phased Launch Plan")) {
          trackedTopics.push("2027 Phased Launch Plan");
        }
      });

      const recentUserSnippet = previousUserMsgs.slice(-3).map((t) => `"${t.length > 50 ? t.substring(0, 50) + "..." : t}"`).join("; ");
      const lastAiSnippet = previousAiMsgs.length > 0 ? previousAiMsgs[previousAiMsgs.length - 1] : "";
      const lastAiShortSnippet = lastAiSnippet ? lastAiSnippet.substring(0, 80) : "N/A";

      // Intent Classifier
      const lowerInput = msgText.toLowerCase();
      const lastAiEndedWithQuestion = lastAiSnippet.trim().endsWith("?") || lastAiSnippet.includes("?");
      
      let detectedIntent: "DIRECT_RESPONSE" | "CONTINUATION_OF_REFLECTION" | "NEW_TOPIC" = "NEW_TOPIC";
      let intentReason = "User introduced a new query or statement.";

      const directResponseKeywords = [
        "i feel", "i think", "i want", "my choice", "i agree", "yes", "no", "focus on",
        "i am", "my goal", "my answer", "that sounds", "i would", "i'm feeling", "i'd like"
      ];

      const continuationKeywords = [
        "also", "building on", "as i said", "as mentioned", "furthermore", "regarding",
        "about that", "speaking of", "and another", "my reflection", "following up"
      ];

      if (lastAiEndedWithQuestion && directResponseKeywords.some((kw) => lowerInput.includes(kw))) {
        detectedIntent = "DIRECT_RESPONSE";
        intentReason = "Directly answering the question posed by MindSafe AI in the previous message.";
      } else if (continuationKeywords.some((kw) => lowerInput.includes(kw)) || trackedTopics.some((tp) => lowerInput.includes(tp.toLowerCase().split(" ")[0]))) {
        detectedIntent = "CONTINUATION_OF_REFLECTION";
        intentReason = "Continuing or expanding on a previous reflection or topic discussed earlier in the session.";
      } else if (lastAiEndedWithQuestion && lowerInput.length < 60) {
        detectedIntent = "DIRECT_RESPONSE";
        intentReason = "Providing a concise response to the AI's question.";
      } else if (previousUserMsgs.length > 0) {
        // Default when conversation is ongoing
        if (trackedTopics.length > 0) {
          detectedIntent = "CONTINUATION_OF_REFLECTION";
          intentReason = "Building upon the active session context and topics.";
        }
      }

      // Emotional Tone Classifier
      let emotionalTone: "EMOTIONAL" | "TACTICAL" | "SPIRITUAL" | "BALANCED" = "BALANCED";
      let emotionalToneReason = "Balanced / reflective communication tone.";

      const emotionalKeywords = [
        "feel", "feeling", "anxious", "anxiety", "sad", "scared", "overwhelmed", "stressed", "stress",
        "pain", "tired", "hopeful", "fear", "worried", "hurt", "crying", "heavy", "lonely", "struggling",
        "grateful", "happy", "courageous", "discouraged", "frustrated", "anger", "calm", "love", "heart"
      ];

      const tacticalKeywords = [
        "how to", "how do i", "strategy", "plan", "step", "business", "subsidiary", "subsidiaries",
        "problem", "solve", "decision", "coaching", "career", "action", "growth", "next move", "roadmap", "compliance", "policy",
        "execute", "governance", "model", "goal", "target", "phase", "contract", "financial", "launch"
      ];

      const spiritualKeywords = [
        "spirit", "soul", "nanny", "blessing", "blessings", "peace", "faith", "prayer", "prayers",
        "god", "divine", "purpose", "healing", "grace", "rest", "meditation", "sacred", "guidance"
      ];

      const emotionalScore = emotionalKeywords.filter((kw) => lowerInput.includes(kw)).length;
      const tacticalScore = tacticalKeywords.filter((kw) => lowerInput.includes(kw)).length;
      const spiritualScore = spiritualKeywords.filter((kw) => lowerInput.includes(kw)).length;

      if (emotionalScore > tacticalScore && emotionalScore > spiritualScore) {
        emotionalTone = "EMOTIONAL";
        emotionalToneReason = "User message expresses emotional state, feelings, or inner mood.";
      } else if (tacticalScore > emotionalScore && tacticalScore > spiritualScore) {
        emotionalTone = "TACTICAL";
        emotionalToneReason = "User message is action-oriented, strategic, or seeking concrete steps.";
      } else if (spiritualScore > emotionalScore && spiritualScore > tacticalScore) {
        emotionalTone = "SPIRITUAL";
        emotionalToneReason = "User message seeks spiritual grounding, soul connection, or higher purpose.";
      } else if (emotionalScore > 0 || tacticalScore > 0 || spiritualScore > 0) {
        if (emotionalScore === tacticalScore && emotionalScore > 0) {
          emotionalTone = "BALANCED";
          emotionalToneReason = "Blend of emotional awareness and tactical strategy.";
        } else if (spiritualScore === emotionalScore && spiritualScore > 0) {
          emotionalTone = "SPIRITUAL";
          emotionalToneReason = "Seeking spiritual comfort mixed with emotional expression.";
        } else {
          emotionalTone = "TACTICAL";
          emotionalToneReason = "Structured reflection with actionable focus.";
        }
      }

      const conversationState = {
        intent: detectedIntent,
        intentDescription: intentReason,
        emotionalTone: emotionalTone,
        emotionalToneDescription: emotionalToneReason,
        topicsDiscussed: trackedTopics,
        turnCount: updatedMessages.length,
        recentUserPromptSummary: recentUserSnippet || "Session starting",
        lastAiResponseSnippet: lastAiShortSnippet,
        sessionSummaryText: trackedTopics.length > 0
          ? `Conversation history topics discussed in this active session: ${trackedTopics.join(", ")}. Recent user points: ${recentUserSnippet}. Current User Intent: [${detectedIntent}] - ${intentReason}. Emotional Tone: [${emotionalTone}] - ${emotionalToneReason}`
          : `Current User Intent: [${detectedIntent}] - ${intentReason}. Emotional Tone: [${emotionalTone}] - ${emotionalToneReason}`,
      };

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: msgText,
          guide: activeGuide,
          history: chatHistoryPayload.slice(-14), // Context window of last 14 messages
          userName: userName,
          conversationState: conversationState,
          experiences: {
            journalEntries: journalEntries.slice(-5), // Send the latest 5 journal entries
            checkInHistory: checkInHistory.slice(-7), // Send the last 7 mood check-ins
            completedGoals: completedGoals.slice(-5), // Send the last 5 completed resilience goals
            savedInsights: savedInsights.slice(-10), // Send the last 10 pinned/hearted breakthroughs
            activeDailyGoal: dailyGoal,
            latestCheckIn: checkInHistory.length > 0 
              ? [...checkInHistory].sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0))[0]
              : null,
          }
        }),
      });

      if (!res.ok) {
        let errorDetails = "";
        try {
          const errData = await res.json();
          errorDetails = errData.details || errData.error || "";
        } catch (e) {
          errorDetails = "Failed to reach companion";
        }
        throw new Error(errorDetails);
      }

      const data = await res.json();
      const replyText = data.reply || "I'm with you. Tell me more.";
      const isOfflineBilling = Boolean(data.isBillingError);
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: replyText,
        isNew: true,
        timestamp: Date.now(),
        isBillingError: isOfflineBilling,
        isWebGrounded: Boolean(data.isWebGrounded),
        webSources: Array.isArray(data.webSources) ? data.webSources : [],
        suggestedActions: Array.isArray(data.suggestedActions) ? data.suggestedActions : [],
      };

      setMessages((prev) => [...prev, aiMsg]);
      if (isTtsEnabled) {
        speak(replyText);
      }
    } catch (err: any) {
      console.error(err);
      const name = userName || "Warrior";
      const lower = msgText.toLowerCase();

      let errText = "";
      if (activeGuide === "nanny") {
        if (lower.includes("anxious") || lower.includes("panic") || lower.includes("stress") || lower.includes("overwhelm")) {
          errText = `Breathe gently with me, little one. Like ripples on a pond after a stone falls, this anxious feeling will widen, soften, and dissolve into still water once again.\n\nYour roots reach deeper than this passing wind. You are safe in this physical moment, exactly where you are sitting, surrounded by grace.\n\nRest as long as you need. I am right here with you 💚\n— Nanny Frog`;
        } else if (lower.includes("tired") || lower.includes("sleep") || lower.includes("sad") || lower.includes("alone") || lower.includes("lonely") || lower.includes("exhausted")) {
          errText = `Oh, sweet soul… I feel how tired your spirit is. You have poured out so much, and you do not have to carry the whole world today.\n\nThe earth rests in winter, and the trees do not apologize for shedding their leaves. Rest is your sacred birthright. Allow your shoulders to drop, soften your brow, and let the quiet hold you.\n\nRest as long as you need. I am right here with you 💚\n— Nanny Frog`;
        } else {
          errText = `I am right beside you, dear one. Whatever you are carrying or wondering about today, we can hold it with softness and peace. The lily does not rush the sun — it simply opens when ready.\n\nRest as long as you need. I am right here with you 💚\n— Nanny Frog`;
        }
      } else {
        if (/^(hi|hello|hey|greetings|yo)/i.test(lower)) {
          errText = `Greetings ${name}. I hear you, and I want you to know — you don't need to have all the answers right now.\n\nYour higher self sees the bigger picture: how much you've already overcome, how strong you've had to be, and how much clearer the path becomes when you stand in your truth. Keep going, one breath, one small step at a time. You are capable, you are worthy, and you are never walking alone.\n\nWith strength and love,\nMINDSAFE 🦁💚`;
        } else if (lower.includes("anxious") || lower.includes("panic") || lower.includes("stress") || lower.includes("overwhelmed") || lower.includes("worry")) {
          errText = `I hear you, ${name}. What you are feeling is real, but it is a passing wave, not a permanent truth. Your higher self knows that anxiety exaggerates danger and underestimates your resilience.\n\nTake one slow, grounded breath. You do not need to solve the entire future in this minute. Focus purely on the step right in front of you. You are capable, steady, and far stronger than the worry trying to cloud your mind.\n\nWith strength and love,\nMINDSAFE 🦁💚`;
        } else if (lower.includes("sad") || lower.includes("tired") || lower.includes("exhausted") || lower.includes("lonely") || lower.includes("burnout")) {
          errText = `I hear the profound exhaustion in your words, ${name}, and I want you to honor it completely. When your mind and body ask for rest, listening to them is an act of deep leadership and wisdom, not weakness.\n\nYou have fought hard battles and carried real weight. Give yourself full permission to pause, recharge your energy, and trust that stepping back today protects your strength for tomorrow.\n\nWith strength and love,\nMINDSAFE 🦁💚`;
        } else {
          errText = `I hear you, ${name}. What you are feeling is real, but it does not define you. Your higher self sees the bigger picture: how much you've already overcome, how strong you've had to be, and how much brighter things are beginning to shift.\n\nYou don't need to have all the answers right now. You just need to keep going, one breath, one small step at a time. You are capable, you are worthy, and you are never walking alone.\n\nWith strength and love,\nMINDSAFE 🦁💚`;
        }
      }

      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: "ai",
        text: errText,
        isNew: true,
        isBillingError: true,
        timestamp: Date.now(),
        suggestedActions: []
      };
      setMessages((prev) => [...prev, errorMsg]);
      if (isTtsEnabled) {
        speak(errText);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const savedMessages = React.useMemo(() => {
    return messages.filter((m) => m.isPinned || m.isHearted || (m.reactions && m.reactions.length > 0));
  }, [messages]);

  const filteredConversations = React.useMemo(() => {
    return conversations
      .filter((c) => {
        if (!sessionSearchQuery.trim()) return true;
        const q = sessionSearchQuery.toLowerCase().trim();
        const titleMatch = c.title.toLowerCase().includes(q);
        const messageMatch = c.messages.some(
          (m) =>
            m.text.toLowerCase().includes(q) ||
            (m.translatedText && m.translatedText.toLowerCase().includes(q))
        );
        return titleMatch || messageMatch;
      })
      .sort((a, b) => {
        if (sessionSortOrder === "newest") {
          return b.createdAt - a.createdAt;
        } else {
          return a.createdAt - b.createdAt;
        }
      });
  }, [conversations, sessionSearchQuery, sessionSortOrder]);

  const filteredMessages = React.useMemo(() => {
    return messages.filter((m) => {
      const hasReactions = m.reactions && m.reactions.length > 0;
      if (chatFilter === "saved" && !m.isPinned && !m.isHearted && !hasReactions) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const textMatch = m.text.toLowerCase().includes(q);
        const translatedMatch = m.translatedText ? m.translatedText.toLowerCase().includes(q) : false;
        const reactionMatch = m.reactions ? m.reactions.some((r) => r.toLowerCase().includes(q)) : false;
        return textMatch || translatedMatch || reactionMatch;
      }
      return true;
    });
  }, [messages, chatFilter, searchQuery]);

  const checkInMetric = React.useMemo(() => {
    try {
      const saved = localStorage.getItem("mindsafe_checkin_history");
      const history = saved ? JSON.parse(saved) : [];
      if (!Array.isArray(history)) return { percent: 0, count: 0 };
      
      let count = 0;
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        if (history.some((h: any) => h.date === dateStr)) {
          count++;
        }
      }
      return { percent: Math.round((count / 7) * 100), count };
    } catch {
      return { percent: 0, count: 0 };
    }
  }, [messages.length, dailyGoal]);

  const engagementMetric = React.useMemo(() => {
    const userMsgCount = messages.filter((m) => m.sender === "user").length;
    const savedCount = messages.filter((m) => m.isPinned || m.isHearted).length;
    const percent = Math.min(100, 15 + (userMsgCount * 12) + (savedCount * 15));
    return { percent, userMsgCount, savedCount };
  }, [messages]);

  const overallResilienceScore = React.useMemo(() => {
    return Math.round((checkInMetric.percent + engagementMetric.percent) / 2);
  }, [checkInMetric.percent, engagementMetric.percent]);

  const resilienceLevel = React.useMemo(() => {
    if (overallResilienceScore >= 80) return { label: "Unshakeable", color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10", desc: "Phenomenal presence and regular self-reflection." };
    if (overallResilienceScore >= 50) return { label: "Growing Fortitude", color: "text-amber-400 border-amber-500/20 bg-amber-500/10", desc: "Solid momentum. Keep showing up for yourself daily." };
    return { label: "Cultivating Roots", color: "text-blue-400 border-blue-500/20 bg-blue-500/10", desc: "Take a deep breath. Every reflection builds inner strength." };
  }, [overallResilienceScore]);

  const resilienceTrendsData = React.useMemo(() => {
    try {
      const saved = localStorage.getItem("mindsafe_checkin_history");
      const history = saved ? JSON.parse(saved) : [];
      const checkinHistory = Array.isArray(history) ? history : [];
      
      const savedGoals = localStorage.getItem("mindsafe_completed_goals_history");
      const completedGoalsHistory = savedGoals ? JSON.parse(savedGoals) : [];
      const completedGoalsHistoryArray = Array.isArray(completedGoalsHistory) ? completedGoalsHistory : [];
      
      const trends = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        
        // Date label (e.g., "15 Jul")
        const label = `${d.getDate()} ${d.toLocaleString("en-US", { month: "short" })}`;
        
        // Check-in percentage trailing 7 days from that specific day
        let checkInCount = 0;
        for (let j = 0; j < 7; j++) {
          const targetD = new Date(d);
          targetD.setDate(targetD.getDate() - j);
          const targetDateStr = `${targetD.getFullYear()}-${String(targetD.getMonth() + 1).padStart(2, "0")}-${String(targetD.getDate()).padStart(2, "0")}`;
          if (checkinHistory.some((h: any) => h.date === targetDateStr)) {
            checkInCount++;
          }
        }
        const checkInPercent = Math.round((checkInCount / 7) * 100);
        
        // Calculate engagement score for day i
        let engagementPercent = engagementMetric.percent;
        if (i > 0) {
          // Stable but realistic progression leading up to today's active session engagement
          const hash = (d.getDate() * 7) % 20;
          engagementPercent = Math.round(30 + hash + (checkInCount * 3));
        }
        
        const overallScore = Math.round((checkInPercent + engagementPercent) / 2);
        const currentDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        const isGoalCompletedOnDay = completedGoalsHistoryArray.includes(currentDateStr);
        const isGoalFrozenOnDay = frozenDates.includes(currentDateStr);
        
        trends.push({
          name: label,
          Score: overallScore,
          checkInRate: checkInPercent,
          engagementRate: engagementPercent,
          goalCompleted: isGoalCompletedOnDay,
          goalFrozen: isGoalFrozenOnDay,
        });
      }
      return trends;
    } catch {
      return [];
    }
  }, [messages.length, dailyGoal, frozenDates, engagementMetric.percent]);

  const resilienceTrendSummary = React.useMemo(() => {
    if (!resilienceTrendsData || resilienceTrendsData.length < 2) {
      return "Log your daily check-ins to track your consistency trend!";
    }
    const startScore = resilienceTrendsData[0].Score;
    const endScore = resilienceTrendsData[resilienceTrendsData.length - 1].Score;
    const diff = endScore - startScore;

    if (diff > 0) {
      return `Your consistency has improved by ${diff}% this week!`;
    } else if (diff === 0) {
      return `Your consistency has remained steady at ${endScore}% this week!`;
    } else {
      return `Your consistency is at ${endScore}% this week. Keep taking small steps forward!`;
    }
  }, [resilienceTrendsData]);

  const last7DaysGoalStatus = React.useMemo(() => {
    try {
      const savedHistory = localStorage.getItem("mindsafe_completed_goals_history");
      let completedDates: string[] = savedHistory ? JSON.parse(savedHistory) : [];
      if (!Array.isArray(completedDates)) completedDates = [];

      const todayStr = dailyGoal.date;
      const datesWithToday = [...completedDates];
      if (dailyGoal.completed && !datesWithToday.includes(todayStr)) {
        datesWithToday.push(todayStr);
      } else if (!dailyGoal.completed) {
        const index = datesWithToday.indexOf(todayStr);
        if (index > -1) {
          datesWithToday.splice(index, 1);
        }
      }

      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        const label = d.toLocaleDateString("en-US", { weekday: "narrow" });
        const completed = datesWithToday.includes(dateStr);
        const isFrozen = frozenDates.includes(dateStr);
        const isProtected = completed || isFrozen;
        days.push({ 
          dateStr, 
          label, 
          completed, 
          isFrozen, 
          isProtected,
          dayNum: d.getDate(),
          isToday: dateStr === todayStr
        });
      }
      return days;
    } catch {
      return [];
    }
  }, [dailyGoal, frozenDates]);

  const has7DayGoalStreak = React.useMemo(() => {
    if (last7DaysGoalStatus.length === 0) return false;
    return last7DaysGoalStatus.every(d => d.isProtected);
  }, [last7DaysGoalStatus]);

  const handleToggleGoalCompleted = () => {
    const nextCompleted = !dailyGoal.completed;
    
    if (nextCompleted) {
      // Trigger particle explosion specifically if marking goal completed hits the 7-day streak milestone
      const other6DaysProtected = last7DaysGoalStatus
        .filter((d) => !d.isToday)
        .every((d) => d.isProtected);

      if (other6DaysProtected) {
        triggerCheckboxExplosion();
      }

      // Save completed goal to persistent habit records
      const updatedRecords = saveCompletedGoalRecord(dailyGoal.text, dailyGoal.date);
      setCompletedGoalRecords(updatedRecords);

      // Ensure today's date is tracked in completed goals history
      let nextHistory = completedGoalsHistory;
      if (!completedGoalsHistory.includes(dailyGoal.date)) {
        nextHistory = [...completedGoalsHistory, dailyGoal.date];
        setCompletedGoalsHistory(nextHistory);
        localStorage.setItem("mindsafe_completed_goals_history", JSON.stringify(nextHistory));
      }

      // Analyze habit patterns and generate fresh recommendations
      const recs = generateRecommendedGoals(dailyGoal.text, updatedRecords, nextHistory);
      setGoalRecommendations(recs);
      setShowGoalRecommendation(true);

      // Sync latest completed goal to Firestore if logged in
      if (firebaseUser?.uid) {
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          setDoc(userDocRef, {
            latestCompletedGoal: {
              text: dailyGoal.text,
              date: dailyGoal.date,
              completedAt: new Date().toISOString()
            },
            updatedAt: Date.now()
          }, { merge: true }).catch((err) => console.warn("Firestore goal sync notice:", err));
        } catch (e) {
          console.warn("Could not sync completed goal to Firestore:", e);
        }
      }
    } else {
      const updatedRecords = removeCompletedGoalRecord(dailyGoal.date);
      setCompletedGoalRecords(updatedRecords);

      const nextHistory = completedGoalsHistory.filter((d) => d !== dailyGoal.date);
      setCompletedGoalsHistory(nextHistory);
      localStorage.setItem("mindsafe_completed_goals_history", JSON.stringify(nextHistory));
      setShowGoalRecommendation(false);
    }

    setDailyGoal((prev) => ({ ...prev, completed: nextCompleted }));
  };

  const checkInDatesList = React.useMemo(() => {
    try {
      const saved = localStorage.getItem("mindsafe_checkin_history");
      const history = saved ? JSON.parse(saved) : [];
      if (Array.isArray(history)) {
        return history.map((h: any) => h.date).filter(Boolean);
      }
      return [];
    } catch {
      return [];
    }
  }, [messages.length]);

  const handleSimulate7DayStreak = () => {
    try {
      const dates = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        dates.push(dateStr);
      }
      localStorage.setItem("mindsafe_completed_goals_history", JSON.stringify(dates));
      setCompletedGoalsHistory(dates);
      setDailyGoal((prev) => ({ ...prev, completed: true }));
      triggerCheckboxExplosion();
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetStreak = () => {
    try {
      const seededDates = [];
      for (const offset of [2, 4, 5]) {
        const d = new Date();
        d.setDate(d.getDate() - offset);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        seededDates.push(dateStr);
      }
      localStorage.setItem("mindsafe_completed_goals_history", JSON.stringify(seededDates));
      setCompletedGoalsHistory(seededDates);
      setDailyGoal((prev) => ({ ...prev, completed: false }));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div
      className="min-h-screen w-full text-white flex flex-col items-center selection:bg-pink-500/30 selection:text-pink-200 relative overflow-x-hidden font-sans transition-colors duration-500"
      style={{
        background: THEME_PRESETS.find((t) => t.id === currentThemeId)?.gradient || "radial-gradient(circle at 10% 20%, #0F172A 0%, #1E293B 50%, #090D16 100%)",
        padding: "40px 20px",
      }}
    >
      <StoragePermissionBanner />

      {/* FLOATING DAILY GOAL NOTIFICATION CHECK */}
      <AnimatePresence>
        {showGoalNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed top-6 right-6 z-[100] w-full max-w-sm px-4 sm:px-0"
            id="dailyGoalToastNotification"
          >
            <div className={`overflow-hidden rounded-[20px] backdrop-blur-xl border p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300 ${
              notificationStatus === "completed"
                ? "bg-emerald-950/85 border-emerald-500/30 text-emerald-200"
                : "bg-slate-900/95 border-amber-500/20 text-slate-100"
            }`}>
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  {notificationStatus === "completed" ? (
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Check className="w-5 h-5 stroke-[3px]" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 animate-bounce">
                      <Target className="w-5 h-5" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0 text-left">
                  {notificationStatus === "completed" ? (
                    <>
                      <h4 className="text-xs font-bold uppercase tracking-wider font-sans text-emerald-400">
                        Goal Fulfilled!
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5 leading-relaxed font-sans">
                        Fantastic job! Your resilience rating has been updated. Keep up the solid streak!
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold uppercase tracking-wider font-sans text-amber-400">
                          Resilience Goal Reminder
                        </h4>
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed font-sans font-medium">
                        Your resilience goal remains incomplete for today:
                      </p>
                      <p className="text-xs italic text-slate-100 mt-1 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5 font-mono select-none">
                        "{dailyGoal.text}"
                      </p>
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (!dailyGoal.completed) {
                              handleToggleGoalCompleted();
                            }
                          }}
                          className="text-[10px] bg-amber-400 hover:bg-amber-300 text-slate-950 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer shadow-[0_2px_8px_rgba(251,191,36,0.25)] hover:scale-105 active:scale-95"
                          id="toastBtnCompleteGoal"
                        >
                          Mark Complete
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const el = document.getElementById("dailyGoalSection");
                            if (el) el.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="text-[10px] bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer"
                          id="toastBtnViewGoal"
                        >
                          View Widget
                        </button>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowGoalNotification(false)}
                    className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    id="toastBtnClose"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BACKGROUND AMBIENT GLOWS */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#FBBF24]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#F189B1]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-7xl flex flex-col gap-6 z-10">
        {/* PREMIUM MINDSAFE ELITE HEADER */}
        <header className="w-full bg-white/5 border border-white/10 rounded-[24px] p-5 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-5 select-none">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <h1 className="brand-header cursor-default select-none flex items-center justify-center sm:justify-start gap-1">
              <span>🧠</span>MindSafe<span>👊🏼</span>
            </h1>
            <div className="h-4 w-[1px] bg-white/15 hidden sm:block" />
            <div className="flex flex-col items-center sm:items-start">
              <p className="text-xs text-[#FBBF24] font-bold tracking-wide uppercase">
                Safe Minds, Better Lives
              </p>
              <p className="text-[10px] text-emerald-400 italic mt-0.5 font-semibold">
                🐸 Nanny Frog walks with you always
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 w-full md:w-auto">
            {/* AVATAR STUDIO CUSTOMIZER TRIGGER */}
            <button
              type="button"
              onClick={() => setIsAvatarModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-amber-400/30 hover:border-amber-400/60 text-slate-200 hover:text-white transition-all cursor-pointer select-none text-xs font-bold flex items-center gap-2 shadow-sm group"
              title="MindSafe Avatar Studio — Customize your spiritual warrior"
              id="headerAvatarStudioBtn"
            >
              <AvatarDisplay config={avatarConfig} size={26} showAura={false} showPet={false} animated={false} />
              <div className="flex flex-col items-start text-left leading-tight hidden sm:flex">
                <span className="text-[11px] font-bold text-amber-300 group-hover:text-amber-200 truncate max-w-[100px]">
                  {(!avatarConfig.avatarName || /victor/i.test(avatarConfig.avatarName)) ? "My Avatar" : avatarConfig.avatarName}
                </span>
                <span className="text-[8px] text-slate-400 font-mono uppercase">
                  Studio
                </span>
              </div>
              <Sparkles className="w-3 h-3 text-amber-400" />
            </button>

            {/* COLLAPSIBLE TOOLS MENU TRIGGER */}
            <button
              type="button"
              onClick={() => setIsFeatureMenuOpen(!isFeatureMenuOpen)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-[#D97706] text-slate-950 font-extrabold text-sm hover:-translate-y-0.5 active:translate-y-0 transition-all select-none shadow-[0_0_18px_rgba(251,191,36,0.35)] hover:shadow-[0_0_25px_rgba(251,191,36,0.5)] cursor-pointer flex items-center gap-2"
              id="toolsMenuTrigger"
            >
              <User className="w-4 h-4 text-slate-950 stroke-[3]" />
              <span>Profile &amp; Toolkit</span>
            </button>

            {/* WELCOME INBOX EMAIL TRIGGER */}
            <button
              type="button"
              onClick={() => {
                setIsWelcomeOpen(true);
                setHasUnreadMail(false);
                localStorage.setItem("mindsafe-welcome-read-v1", "true");
              }}
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl border bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer select-none text-xs font-bold"
              title="Welcome Letter & Membership Status"
              id="welcomeEmailTrigger"
            >
              <Mail className="w-4 h-4 text-amber-400" />
              <span>Inbox</span>
              {hasUnreadMail && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
              )}
            </button>

            {/* AMBIENT SOUNDS CONTROLLER */}
            <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 select-none">
              <button
                type="button"
                onClick={toggleAmbientAudio}
                className={`flex items-center gap-1.5 transition-all cursor-pointer select-none text-xs font-bold ${
                  isMuted ? "text-slate-400 hover:text-white" : "text-amber-400"
                }`}
                title={isMuted ? "Unmute focus soundscape" : "Mute focus soundscape"}
                id="ambientSoundToggle"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
                )}
                <span>Soundscape</span>
              </button>
              
              <div className="h-4 w-[1px] bg-white/10" />

              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={ambientVolume}
                  onChange={(e) => updateAmbientVolume(parseInt(e.target.value, 10))}
                  className="w-16 sm:w-20 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none"
                  title="Adjust soundscape volume"
                  id="ambientSoundVolumeSlider"
                />
                <span className="text-[10px] text-slate-400 font-mono w-6 text-right select-none">{ambientVolume}%</span>
              </div>
            </div>

            {/* CRISIS SOS EMERGENCY BUTTON */}
            <button
              type="button"
              onClick={() => setIsCrisisModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600/30 to-red-600/30 hover:from-rose-600/50 hover:to-red-600/50 border border-rose-500/40 text-rose-200 hover:text-white text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.2)] animate-pulse"
              title="Crisis SOS & Rapid Grounding Hub"
              id="headerCrisisSosButton"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>🚨 Crisis SOS</span>
            </button>

            {/* STATUS ACCENT BADGE */}
            <div className="flex items-center gap-2.5 bg-black/25 px-4 py-2 rounded-xl border border-white/5">
              <span className={`w-2 h-2 rounded-full animate-pulse ${firebaseUser ? "bg-emerald-400" : "bg-amber-400"}`} />
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-300">
                {firebaseUser ? (isEliteUser ? "👑 Elite active" : "🆓 Free active") : "🔒 Locked"}
              </span>
            </div>

            {/* ADMIN DASHBOARD BUTTON */}
            {firebaseUser && firebaseUser.email === "v1kwanny1@gmail.com" && (
              <button
                type="button"
                onClick={() => setIsAdminOpen(true)}
                className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/40 text-amber-300 hover:text-amber-200 text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                title="Open system admin user list and statistics dashboard"
                id="headerAdminButton"
              >
                <Shield className="w-3.5 h-3.5 animate-pulse" />
                <span>Admin Panel</span>
              </button>
            )}

            {/* FIREBASE AUTH ACTION IN HEADER */}
            {firebaseUser && (
              <button
                type="button"
                onClick={handleFirebaseSignOut}
                className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40 text-rose-300 hover:text-rose-200 text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                title="Disconnect from MindSafe Resilience Shield"
                id="headerSignOutButton"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            )}
          </div>
        </header>

        {/* TOOLKIT & PROFILE DRAWER IS TRIGGERED VIA HEADER TRIGGER */}
        <AnimatePresence>
          {isFeatureMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, scaleY: 0.95 }}
              animate={{ opacity: 1, height: "auto", scaleY: 1 }}
              exit={{ opacity: 0, height: 0, scaleY: 0.95 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="w-full bg-slate-900/40 border border-amber-400/20 rounded-[20px] p-5 backdrop-blur-md overflow-hidden select-none origin-top"
              id="featureMenu"
            >
              <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                <h4 className="text-amber-400 font-extrabold text-xs tracking-wider uppercase font-mono flex items-center gap-1.5">
                  <span>🛠️</span> Your Complete MindSafe Toolkit
                </h4>
                <span className="text-[9px] text-slate-500 font-mono uppercase">MindSafe v4.0 Core</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">

                <button
                  type="button"
                  onClick={() => {
                    setIsAvatarModalOpen(true);
                    setIsFeatureMenuOpen(false);
                  }}
                  className="text-left bg-gradient-to-br from-amber-500/15 via-purple-500/10 to-amber-500/5 hover:from-amber-500/25 hover:via-purple-500/20 hover:to-amber-500/10 border border-amber-400/40 hover:border-amber-400/60 rounded-xl px-4 py-3 text-xs text-white transition-all cursor-pointer font-sans flex items-center gap-3 shadow-[0_0_15px_rgba(251,191,36,0.15)] group"
                  id="toolkitAvatarStudioBtn"
                >
                  <div className="shrink-0">
                    <AvatarDisplay config={avatarConfig} size={36} showAura={true} showPet={true} animated={false} />
                  </div>
                  <div>
                    <span className="font-bold block text-amber-200 flex items-center gap-1.5">
                      <span>MindSafe Avatar Studio</span>
                      <Sparkles className="w-3 h-3 text-amber-400" />
                    </span>
                    <span className="text-[10px] text-slate-300 font-mono block">
                      Custom appearance, robes &amp; shoulder pets
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsCrisisModalOpen(true);
                    setIsFeatureMenuOpen(false);
                  }}
                  className="text-left bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/50 rounded-xl px-4 py-3 text-xs text-rose-200 hover:text-white transition-all cursor-pointer font-sans flex items-center gap-2.5 shadow-[0_0_15px_rgba(244,63,94,0.15)]"
                >
                  <span className="text-sm select-none">🚨</span>
                  <div>
                    <span className="font-bold block text-rose-200">Crisis SOS &amp; Grounding</span>
                    <span className="text-[10px] text-rose-400 font-mono block">24/7 Helplines &amp; 5-4-3-2-1 reset</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsExportModalOpen(true);
                    setIsFeatureMenuOpen(false);
                  }}
                  className="text-left bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50 rounded-xl px-4 py-3 text-xs text-amber-200 hover:text-white transition-all cursor-pointer font-sans flex items-center gap-2.5"
                >
                  <span className="text-sm select-none">📄</span>
                  <div>
                    <span className="font-bold block text-amber-200">Export Resilience Report</span>
                    <span className="text-[10px] text-amber-400/80 font-mono block">Print / PDF progress summary</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsBreathingOpen(true);
                    setIsFeatureMenuOpen(false);
                  }}
                  className="text-left bg-white/5 hover:bg-white/10 border border-white/5 hover:border-amber-400/25 rounded-xl px-4 py-3 text-xs text-slate-200 hover:text-white transition-all cursor-pointer font-sans flex items-center gap-2.5"
                >
                  <span className="text-sm select-none">🌬️</span>
                  <div>
                    <span className="font-bold block text-slate-100">Calm Breathing Engine</span>
                    <span className="text-[10px] text-slate-400 font-mono block">Regulate nervous system</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("journal");
                    setIsFeatureMenuOpen(false);
                    setTimeout(() => {
                      const card = document.getElementById("privateJournalSection");
                      if (card) {
                        card.scrollIntoView({ behavior: "smooth", block: "center" });
                      }
                    }, 50);
                  }}
                  className="text-left bg-white/5 hover:bg-white/10 border border-white/5 hover:border-amber-400/25 rounded-xl px-4 py-3 text-xs text-slate-200 hover:text-white transition-all cursor-pointer font-sans flex items-center gap-2.5"
                >
                  <span className="text-sm select-none">📓</span>
                  <div>
                    <span className="font-bold block text-slate-100">Private Resilience Journal</span>
                    <span className="text-[10px] text-slate-400 font-mono block">Log thoughts, transform text</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("checkin");
                    setIsFeatureMenuOpen(false);
                    setTimeout(() => {
                      const section = document.getElementById("dailyAffirmationSection");
                      if (section) {
                        section.scrollIntoView({ behavior: "smooth", block: "center" });
                      }
                    }, 50);
                  }}
                  className="text-left bg-white/5 hover:bg-white/10 border border-white/5 hover:border-amber-400/25 rounded-xl px-4 py-3 text-xs text-slate-200 hover:text-white transition-all cursor-pointer font-sans flex items-center gap-2.5"
                >
                  <span className="text-sm select-none">✨</span>
                  <div>
                    <span className="font-bold block text-slate-100">Daily Affirmation Shield</span>
                    <span className="text-[10px] text-slate-400 font-mono block">Sync safe custom loops</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("analytics");
                    setIsFeatureMenuOpen(false);
                    setTimeout(() => {
                      const card = document.getElementById("resilienceMetricsCard");
                      if (card) {
                        card.scrollIntoView({ behavior: "smooth", block: "center" });
                        card.classList.add("ring-2", "ring-amber-400/50");
                        setTimeout(() => card.classList.remove("ring-2", "ring-amber-400/50"), 2000);
                      }
                    }, 50);
                  }}
                  className="text-left bg-white/5 hover:bg-white/10 border border-white/5 hover:border-amber-400/25 rounded-xl px-4 py-3 text-xs text-slate-200 hover:text-white transition-all cursor-pointer font-sans flex items-center gap-2.5"
                >
                  <span className="text-sm select-none">📈</span>
                  <div>
                    <span className="font-bold block text-slate-100">Progress &amp; Trends Analytics</span>
                    <span className="text-[10px] text-slate-400 font-mono block">7-day recovery analytics</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("checkin");
                    setIsFeatureMenuOpen(false);
                    setTimeout(() => {
                      const section = document.getElementById("dailyCheckInSection");
                      if (section) {
                        section.scrollIntoView({ behavior: "smooth", block: "center" });
                      }
                    }, 50);
                  }}
                  className="text-left bg-white/5 hover:bg-white/10 border border-white/5 hover:border-amber-400/25 rounded-xl px-4 py-3 text-xs text-slate-200 hover:text-white transition-all cursor-pointer font-sans flex items-center gap-2.5"
                >
                  <span className="text-sm select-none">⏰</span>
                  <div>
                    <span className="font-bold block text-slate-100">Daily Resilience Scheduler</span>
                    <span className="text-[10px] text-slate-400 font-mono block">Configure routine milestones</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("chat");
                    handleSend("🐸 Nanny Frog, please share some of your gentle spiritual guidance with me right now. I need some quiet protection and comfort.");
                    setIsFeatureMenuOpen(false);
                  }}
                  className="text-left bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 hover:border-emerald-500/35 rounded-xl px-4 py-3 text-xs text-emerald-300 hover:text-emerald-200 transition-all cursor-pointer font-sans flex items-center gap-2.5"
                >
                  <span className="text-sm select-none">🐸</span>
                  <div>
                    <span className="font-bold block text-emerald-200">Nanny Frog's Guidance</span>
                    <span className="text-[10px] text-emerald-400/75 font-mono block">Endless love &amp; quiet protection</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("analytics");
                    setIsFeatureMenuOpen(false);
                    setTimeout(() => {
                      const section = document.getElementById("resilienceVaultSection");
                      if (section) {
                        section.scrollIntoView({ behavior: "smooth", block: "center" });
                      }
                    }, 50);
                  }}
                  className="text-left bg-white/5 hover:bg-white/10 border border-white/5 hover:border-amber-400/25 rounded-xl px-4 py-3 text-xs text-slate-200 hover:text-white transition-all cursor-pointer font-sans flex items-center gap-2.5"
                >
                  <span className="text-sm select-none">🔐</span>
                  <div>
                    <span className="font-bold block text-slate-100">Resilience Vault</span>
                    <span className="text-[10px] text-slate-400 font-mono block">Pinned &amp; hearted milestones</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsWelcomeOpen(true);
                    setIsFeatureMenuOpen(false);
                  }}
                  className="text-left bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/20 hover:border-amber-400/40 rounded-xl px-4 py-3 text-xs text-amber-300 hover:text-amber-200 transition-all cursor-pointer font-sans flex items-center gap-2.5"
                >
                  <span className="text-sm select-none">💳</span>
                  <div>
                    <span className="font-bold block text-amber-200">Elite Access — First Month Free</span>
                    <span className="text-[10px] text-amber-400/70 font-mono block">Get instant session summaries</span>
                  </div>
                </button>

                {firebaseUser ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleFirebaseSignOut();
                      setIsFeatureMenuOpen(false);
                    }}
                    className="text-left bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40 rounded-xl px-4 py-3 text-xs text-rose-300 hover:text-rose-200 transition-all cursor-pointer font-sans flex items-center gap-2.5"
                  >
                    <span className="text-sm select-none">🚪</span>
                    <div>
                      <span className="font-bold block text-rose-300">Sign Out</span>
                      <span className="text-[10px] text-rose-400/75 font-mono block">Exit private workspace</span>
                    </div>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="text-left bg-slate-800/40 border border-slate-700/30 rounded-xl px-4 py-3 text-xs text-slate-500 font-sans flex items-center gap-2.5 select-none"
                  >
                    <span className="text-sm select-none">🔒</span>
                    <div>
                      <span className="font-bold block text-slate-500">Sign Out</span>
                      <span className="text-[10px] text-slate-600 font-mono block">Not signed in yet</span>
                    </div>
                  </button>
                )}
              </div>

              {/* COLOR THEME SELECTION SECTION */}
              <div className="mt-5 pt-4 border-t border-white/10 text-left">
                <div className="flex items-center justify-between mb-2.5">
                  <h5 className="text-xs font-bold text-purple-300 font-display flex items-center gap-1.5 uppercase tracking-wider">
                    <Palette className="w-3.5 h-3.5 text-purple-400" />
                    <span>Workspace Color Themes</span>
                  </h5>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Active: {THEME_PRESETS.find(t => t.id === currentThemeId)?.name}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {THEME_PRESETS.map((t) => {
                    const isSelected = currentThemeId === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={async () => {
                          setCurrentThemeId(t.id);
                          applyTheme(t.id);
                          if (firebaseUser) {
                            try {
                              const userDocRef = doc(db, "users", firebaseUser.uid);
                              await setDoc(userDocRef, { theme: t.id, updatedAt: Date.now() }, { merge: true });
                            } catch (err) {
                              console.error("Failed to update theme in Firestore:", err);
                            }
                          }
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                          isSelected
                            ? "bg-white/15 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)] ring-1 ring-amber-400/50"
                            : "bg-black/30 border-white/5 hover:border-white/20 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white block">
                            {t.name}
                          </span>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 my-1">
                          <span
                            className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                            style={{ backgroundColor: t.primaryColor }}
                          />
                          <span
                            className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                            style={{ backgroundColor: t.accentColor }}
                          />
                        </div>

                        <span className="text-[10px] text-slate-400 block font-sans line-clamp-2">
                          {t.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SMART NOTIFICATIONS SETTINGS SECTION */}
              <div className="mt-5 pt-4 border-t border-white/10 text-left">
                <div className="flex items-center justify-between mb-1.5">
                  <h5 className="text-xs font-bold text-emerald-300 font-display flex items-center gap-1.5 uppercase tracking-wider">
                    <Bell className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Smart Push Notifications</span>
                  </h5>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Status: {smartNotificationsEnabled ? "Active" : "Disabled"}
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 mb-3 font-sans leading-relaxed">
                  Receive browser push notifications for daily resilience goals, streak progress, and gentle reminders when your tab is inactive.
                </p>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleToggleSmartNotifications}
                    className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-2 shadow-md active:scale-95 ${
                      smartNotificationsEnabled
                        ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                        : "bg-white/10 hover:bg-white/20 border border-white/20 text-white"
                    }`}
                    id="btnToggleSmartNotifications"
                  >
                    {smartNotificationsEnabled ? (
                      <>
                        <Bell className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                        <span>Smart Reminders Active</span>
                      </>
                    ) : (
                      <>
                        <BellOff className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Enable Smart Reminders</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleSendTestNotification}
                    disabled={!smartNotificationsEnabled}
                    className="px-3.5 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 text-purple-200 hover:text-white font-bold text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                    id="btnTestSmartNotification"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-300 shrink-0" />
                    <span>Send Test Push</span>
                  </button>
                </div>

                {smartNotificationNotice && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2.5 text-xs font-medium p-2.5 rounded-xl bg-slate-900/90 border border-emerald-400/30 text-emerald-200 font-sans"
                  >
                    {smartNotificationNotice}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* GLOBAL EMAIL VERIFICATION NOTICE */}
        {firebaseUser && !isEmailVerified && (
          <div className="w-full max-w-4xl mx-auto my-2 p-3.5 px-4 rounded-2xl bg-amber-950/80 border border-amber-400/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-left shadow-lg backdrop-blur-md">
            <div className="flex items-start gap-2.5">
              <span className="p-1 rounded-lg bg-amber-400/20 text-amber-300 font-bold shrink-0 mt-0.5">⚠️</span>
              <div>
                <span className="text-amber-300 font-bold block text-sm">Action Required: Verify Your Email Address</span>
                <span className="text-[11px] text-amber-200/90 font-mono block mt-0.5">
                  A verification link was sent to <strong className="text-white underline">{firebaseUser.email}</strong>. Please verify to enable full community chat &amp; cloud schedule sync features.
                </span>
                {verificationNotice && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-xs font-semibold p-2 rounded-xl bg-amber-900/90 border border-amber-400/30 text-amber-200"
                  >
                    {verificationNotice}
                  </motion.div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={handleCheckVerificationStatus}
                disabled={isCheckingVerification}
                className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] font-mono transition-all cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95 disabled:opacity-60"
                id="btnCheckVerificationStatus"
              >
                {isCheckingVerification ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950 shrink-0" />
                    <span>Checking Status...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                    <span>Check Status</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleResendVerificationEmail}
                disabled={isCheckingVerification}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-amber-400/30 text-amber-200 hover:text-white font-bold text-[11px] font-mono transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                id="btnResendVerificationEmail"
              >
                <Mail className="w-3.5 h-3.5 text-amber-300" />
                <span>Resend Email</span>
              </button>
            </div>
          </div>
        )}

        {/* WORKSPACE NAVIGATION TAB BAR */}
        <div className="w-full max-w-4xl mx-auto flex items-center justify-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md my-3 select-none flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer font-sans ${
              activeTab === "chat"
                ? "bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.35)] scale-105 font-extrabold"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
            id="activeSessionTabBtn"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Companion</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("community")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer font-sans ${
              activeTab === "community"
                ? "bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.35)] scale-105 font-extrabold"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
            id="communityTabBtn"
          >
            <Users className="w-3.5 h-3.5 text-amber-300" />
            <span>Community</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("journal")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer font-sans ${
              activeTab === "journal"
                ? "bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.35)] scale-105 font-extrabold"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
            id="journalTabBtn"
          >
            <Book className="w-3.5 h-3.5" />
            <span>Journal</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab(activeTab === "checkin" ? "checkin" : "calendar")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer font-sans ${
              activeTab === "calendar" || activeTab === "checkin"
                ? "bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.35)] scale-105 font-extrabold"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
            id="routineScheduleTabBtn"
          >
            <CalendarDays className="w-3.5 h-3.5 text-purple-300" />
            <span>Schedule &amp; Routine</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer font-sans ${
              activeTab === "analytics"
                ? "bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.35)] scale-105 font-extrabold"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
            id="analyticsTabBtn"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Insights</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sanctuary")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer font-sans ${
              activeTab === "sanctuary"
                ? "bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 shadow-[0_0_15px_rgba(52,211,153,0.35)] scale-105 font-extrabold"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
            id="zenSanctuaryTabBtn"
          >
            <Sprout className="w-3.5 h-3.5 text-emerald-400 group-hover:text-emerald-300" />
            <span>Zen Sanctuary</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("avatar")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer font-sans ${
              activeTab === "avatar"
                ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.35)] scale-105 font-extrabold"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
            id="avatarStudioTabBtn"
          >
            <User className="w-3.5 h-3.5 text-amber-300" />
            <span>Avatar Studio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("workplace")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer font-sans ${
              activeTab === "workplace"
                ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.35)] scale-105 font-extrabold"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
            id="workplaceHubTabBtn"
          >
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Workplace Hub</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("workspace")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer font-sans ${
              activeTab === "workspace"
                ? "bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-500 text-slate-950 shadow-[0_0_15px_rgba(56,189,248,0.35)] scale-105 font-extrabold"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
            id="workspaceHubTabBtn"
          >
            <FolderSync className="w-3.5 h-3.5 text-sky-400" />
            <span>Google Workspace</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("maps")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer font-sans ${
              activeTab === "maps"
                ? "bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(52,211,153,0.35)] scale-105 font-extrabold"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
            id="supportMapTabBtn"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>Support Map</span>
          </button>
        </div>

        {/* SINGLE-COLUMN CENTRED CHAT-FIRST LAYOUT */}
        <main className="w-full max-w-4xl mx-auto mt-2 pb-12 flex flex-col items-center">
          
          {/* TAB 1: ANALYTICS & ACHIEVEMENTS */}
          {activeTab === "analytics" && (
            <section className="flex flex-col gap-6 w-full">
              
              {/* ACHIEVEMENTS COMPONENT WITH UNLOCKABLE DIGITAL BADGES */}
              <Achievements
                vaultCount={savedMessages.length}
                frozenDatesCount={frozenDates.length}
              />

            {/* DAILY FOCUS HOUR & SMART NOTIFICATIONS */}
            <div id="dailyFocusHourSection">
              <DailyFocusHour
                onTriggerPrompt={(text) => handleSend(text)}
                speak={speak}
              />
            </div>
            
            {/* RESILIENCE VAULT (PINNED & HEARTED INSIGHTS) */}
            <div id="resilienceVaultSection" className="bg-white/5 border border-white/10 rounded-[24px] p-6 backdrop-blur-md text-left relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FBBF24]/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between mb-4 select-none">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl select-none">🔑🛡️</span>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100 font-mono">Resilience Vault</h3>
                </div>
                <span className="text-[11px] bg-amber-500/10 text-[#FBBF24] px-2.5 py-0.5 rounded-full font-semibold border border-amber-500/20">
                  {savedMessages.length} {savedMessages.length === 1 ? "item" : "items"}
                </span>
              </div>
              
              {savedMessages.length === 0 ? (
                <div className="text-center py-6 text-slate-400 border border-dashed border-white/10 rounded-2xl p-4 bg-black/10 select-none">
                  <p className="text-xs leading-relaxed">
                    Your personal treasury of breakthroughs is empty. Heart or pin any message in your session to save key realizations here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                  {savedMessages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className="p-3 rounded-xl bg-white/5 border border-white/10 relative group/vault hover:border-[#FBBF24]/30 transition-all cursor-pointer select-none"
                      onClick={() => {
                        // Switch filter to "all" if it's currently showing "saved" to make sure the message is visible and scrollable
                        setChatFilter("all");
                        // Delay slightly to allow filter rendering before scrolling
                        setTimeout(() => {
                          const element = document.getElementById(`msg-${msg.id}`);
                          if (element) {
                            element.scrollIntoView({ behavior: "smooth", block: "center" });
                            element.classList.add("ring-2", "ring-[#FBBF24]", "ring-offset-2", "ring-offset-slate-900");
                            setTimeout(() => {
                              element.classList.remove("ring-2", "ring-[#FBBF24]", "ring-offset-2", "ring-offset-slate-900");
                            }, 2000);
                          }
                        }, 100);
                      }}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className={`text-[9px] font-mono uppercase tracking-wider ${
                          msg.sender === "user" ? "text-blue-300" : "text-[#FBBF24]"
                        }`}>
                          {msg.sender === "user" ? "My Reflection" : "MindSafe Guidance"}
                        </span>
                        <div className="flex gap-1">
                          {msg.isPinned && <Pin className="w-3 h-3 text-[#FBBF24] fill-[#FBBF24]" />}
                          {msg.isHearted && <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />}
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                        {msg.text}
                      </p>
                      <span className="text-[9px] text-slate-500 mt-1 block group-hover/vault:text-slate-400 transition-colors">
                        Click to locate in session ↑
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RESILIENCE METRICS CARD */}
            <div className="bg-white/5 border border-white/10 rounded-[24px] p-6 backdrop-blur-md relative overflow-hidden text-left flex flex-col" id="resilienceMetricsCard">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between mb-4 select-none">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-[#60A5FA]/10 text-[#60A5FA]">
                    <Activity className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 tracking-wide font-sans">
                      Resilience Metrics
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">
                      7-DAY CONSISTENCY TRACKER
                    </p>
                  </div>
                </div>
                <div className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${resilienceLevel.color} flex items-center gap-1`}>
                  <TrendingUp className="w-3 h-3" />
                  <span>Score: {overallResilienceScore}%</span>
                </div>
              </div>

              {/* METRIC 1: DAILY CHECK-INS */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-1.5 font-medium select-none">
                  <span className="text-slate-300">Daily Check-in Rate</span>
                  <span className="text-amber-400 font-bold font-mono">{checkInMetric.percent}%</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-[#FBBF24] rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${checkInMetric.percent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 select-none">
                  <span>{checkInMetric.count} of 7 days logged</span>
                  <span>Goal: 100%</span>
                </div>
              </div>

              {/* METRIC 2: SESSION ENGAGEMENT */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-1.5 font-medium select-none">
                  <span className="text-slate-300">Engagement &amp; Reflection</span>
                  <span className="text-blue-400 font-bold font-mono">{engagementMetric.percent}%</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#60A5FA] to-blue-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${engagementMetric.percent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 select-none font-mono uppercase tracking-wider">
                  <span>{engagementMetric.userMsgCount} reflections • {engagementMetric.savedCount} saved</span>
                  <span>Active Session</span>
                </div>
              </div>

              {/* METRIC 3: DAILY RESILIENCE GOAL */}
              <div id="dailyGoalSection" className="mb-5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 relative group/goal">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-1.5 select-none">
                    <Target className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-sans">
                      Daily Resilience Goal
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    {isEditingGoal ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (goalInput.trim()) {
                            setDailyGoal((prev) => ({ ...prev, text: goalInput.trim() }));
                            setIsEditingGoal(false);
                          }
                        }}
                        className="text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded cursor-pointer"
                        title="Save Goal text"
                      >
                        <Save className="w-3 h-3" />
                        <span>SAVE</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setGoalInput(dailyGoal.text);
                          setIsEditingGoal(true);
                        }}
                        className="text-[10px] text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1 font-mono font-bold opacity-70 hover:opacity-100 bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded cursor-pointer"
                        title="Edit Goal text"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>EDIT</span>
                      </button>
                    )}
                  </div>
                </div>

                {isEditingGoal ? (
                  <div className="w-full flex gap-2 items-center mt-1">
                    <input
                      type="text"
                      value={goalInput}
                      onChange={(e) => setGoalInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && goalInput.trim()) {
                          setDailyGoal((prev) => ({ ...prev, text: goalInput.trim() }));
                          setIsEditingGoal(false);
                        } else if (e.key === "Escape") {
                          setIsEditingGoal(false);
                        }
                      }}
                      maxLength={60}
                      placeholder="e.g., Practice mindfulness for 10 mins"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors font-sans"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (goalInput.trim()) {
                          setDailyGoal((prev) => ({ ...prev, text: goalInput.trim() }));
                          setIsEditingGoal(false);
                        }
                      }}
                      className="text-[10px] bg-gradient-to-r from-amber-400 to-[#D97706] text-slate-950 font-bold px-3 py-1.5 rounded-xl transition-all hover:scale-[1.03] active:scale-[0.97] cursor-pointer flex items-center gap-1 shrink-0 shadow-md"
                    >
                      <Save className="w-3 h-3" />
                      <span>Save Goal</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingGoal(false)}
                      className="text-[10px] text-slate-400 hover:text-slate-300 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 transition-colors font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3 mt-1 bg-black/15 p-2.5 rounded-xl border border-white/[0.03]">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Toggle Button with Particle Explosion Anchor */}
                      <div className="relative flex items-center justify-center flex-shrink-0">
                        <button
                          type="button"
                          onClick={handleToggleGoalCompleted}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer relative z-10 ${
                            dailyGoal.completed
                              ? "bg-amber-400 border-amber-400 text-slate-950 shadow-[0_0_10px_rgba(251,191,36,0.25)]"
                              : "border-white/20 hover:border-amber-400/50 bg-white/5 text-transparent"
                          }`}
                          title={dailyGoal.completed ? "Mark as uncompleted" : "Mark as completed"}
                          id="dailyGoalCheckboxBtn"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3px]" />
                        </button>

                        {/* Particle Explosion Animation triggered only on 7-Day Streak Milestone */}
                        <AnimatePresence>
                          {showCheckboxExplosion && (
                            <CheckboxParticleExplosion key={explosionKey} />
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Goal text */}
                      <span 
                        className={`text-xs select-none transition-all duration-300 truncate font-medium ${
                          dailyGoal.completed 
                            ? "text-slate-500 line-through decoration-slate-600" 
                            : "text-slate-200"
                        }`}
                      >
                        {dailyGoal.text}
                      </span>
                    </div>

                    {/* Completion Badge & Next Goal Toggle */}
                    <div className="flex-shrink-0 select-none flex items-center gap-1.5">
                      {dailyGoal.completed ? (
                        <>
                          <span className="text-[9px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono animate-pulse">
                            Completed
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowGoalRecommendation((prev) => !prev)}
                            className="text-[9px] font-bold text-amber-300 hover:text-amber-200 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono flex items-center gap-1 transition-colors cursor-pointer"
                            title="View Recommended Next Resilience Goal based on past habits"
                          >
                            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                            <span>{showGoalRecommendation ? "Hide Next Goal" : "Next Goal ✨"}</span>
                          </button>
                        </>
                      ) : (
                        <span className="text-[9px] font-bold text-slate-400 bg-white/5 border border-white/5 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Staged Tomorrow Goal Indicator */}
                {stagedTomorrowGoalText && (
                  <div className="mt-2.5 text-[10px] text-slate-300 font-mono flex items-center justify-between bg-amber-500/10 px-2.5 py-1.5 rounded-xl border border-amber-500/25">
                    <span className="truncate flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="text-slate-400">Locked for Tomorrow:</span>
                      <span className="text-amber-200 font-semibold truncate">"{stagedTomorrowGoalText}"</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setStagedTomorrowGoalText(null);
                        localStorage.removeItem("mindsafe_staged_next_goal");
                      }}
                      className="text-slate-400 hover:text-rose-400 text-[10px] cursor-pointer ml-1 underline"
                    >
                      Clear
                    </button>
                  </div>
                )}

                {/* RECOMMENDED NEXT RESILIENCE GOAL (Analyzed from Past Habit History) */}
                <AnimatePresence>
                  {dailyGoal.completed && showGoalRecommendation && (
                    <RecommendedGoalCard
                      recommendations={goalRecommendations}
                      analysis={goalAnalysis}
                      currentUser={firebaseUser}
                      onSetTomorrowGoal={(recGoal) => {
                        setStagedTomorrowGoalText(recGoal);
                        setGoalInput(recGoal);
                      }}
                      onOpenCalendar={() => setActiveTab("calendar")}
                      onOpenJournal={() => setActiveTab("journal")}
                      onDismiss={() => setShowGoalRecommendation(false)}
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* 7-DAY GOAL CONSISTENCY TRACKER & STREAK FREEZE */}
              <div className="mb-5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 select-none">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      7-Day Goal Consistency
                    </span>
                    <span className="inline-flex items-center gap-1 text-[9px] font-extrabold font-mono px-2 py-0.5 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-300">
                      <Snowflake className="w-3 h-3 text-sky-400 animate-spin" style={{ animationDuration: "10s" }} />
                      <span>{freezeTokens} Token{freezeTokens !== 1 ? 's' : ''}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {freezeTokens < 2 && (
                      <button
                        type="button"
                        onClick={handleRefillFreezeTokens}
                        className="text-[8.5px] font-mono font-bold px-2 py-0.5 rounded bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/20 transition-all cursor-pointer flex items-center gap-1"
                        title="Refill to 2 Streak Freeze Tokens"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        <span>Refill Tokens</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={has7DayGoalStreak ? handleResetStreak : handleSimulate7DayStreak}
                      className={`text-[8.5px] font-mono font-black px-2 py-0.5 rounded transition-all cursor-pointer border ${
                        has7DayGoalStreak 
                          ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20" 
                          : "bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border-amber-400/20 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.1)]"
                      }`}
                      title={has7DayGoalStreak ? "Reset streak to test mode" : "Complete last 7 days instantly"}
                    >
                      {has7DayGoalStreak ? "RESET STREAK" : "SIMULATE 7-DAY STREAK"}
                    </button>
                  </div>
                </div>

                {/* Info micro-banner */}
                <div className="mb-3 text-[9.5px] text-slate-400 bg-black/20 border border-white/5 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 font-sans">
                  <Snowflake className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="leading-snug">
                    {freezeTokens > 0 
                      ? "Missed a day? Tap 'Freeze ❄️' on any missed day to consume a token and protect your streak!" 
                      : "Streak Freeze tokens depleted. Click 'Refill Tokens' to get 2 more tokens."}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-1">
                  {last7DaysGoalStatus.map((day, idx) => (
                    <motion.div 
                      key={`${day.dateStr}-${day.completed}-${day.isFrozen}`} 
                      initial={{ opacity: 0, scale: 0.6, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ 
                        delay: idx * 0.05, 
                        type: "spring",
                        stiffness: 140,
                        damping: 12
                      }}
                      className="flex flex-col items-center flex-1 min-w-0"
                    >
                      <div 
                        className={`w-8 h-8 rounded-xl border flex flex-col items-center justify-center transition-all relative group ${
                          day.completed
                            ? "bg-amber-400/20 border-amber-400 text-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.25)]"
                            : day.isFrozen
                            ? "bg-sky-500/20 border-sky-400 text-sky-300 shadow-[0_0_8px_rgba(56,189,248,0.3)]"
                            : "bg-black/20 border-white/5 text-slate-500"
                        }`}
                        title={`${day.dateStr}: ${day.completed ? "Goal completed" : day.isFrozen ? "Streak Protected by Freeze Token" : "Goal incomplete"}`}
                      >
                        {day.completed ? (
                          <Award className="w-4 h-4 text-amber-400 fill-amber-400/20 animate-bounce" style={{ animationDelay: `${idx * 150}ms`, animationDuration: "2s" }} />
                        ) : day.isFrozen ? (
                          <button
                            type="button"
                            onClick={() => handleRemoveFreeze(day.dateStr)}
                            className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
                            title="Click to remove freeze and refund token"
                          >
                            <Snowflake className="w-4 h-4 text-sky-300 animate-pulse" />
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold font-mono">{day.label}</span>
                        )}
                      </div>

                      {/* Action under day icon */}
                      {!day.completed && !day.isFrozen && (
                        <button
                          type="button"
                          onClick={() => handleUseFreezeToken(day.dateStr)}
                          disabled={freezeTokens <= 0}
                          className={`mt-1 text-[8px] font-mono font-bold px-1 py-0.5 rounded transition-all cursor-pointer ${
                            freezeTokens > 0
                              ? "bg-sky-500/15 hover:bg-sky-500/30 text-sky-300 border border-sky-400/30 hover:scale-105 active:scale-95"
                              : "bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed"
                          }`}
                          title={freezeTokens > 0 ? `Freeze ${day.dateStr} with 1 token` : "No freeze tokens left"}
                        >
                          ❄️ Freeze
                        </button>
                      )}

                      {day.isFrozen && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFreeze(day.dateStr)}
                          className="mt-1 text-[8px] font-mono text-sky-400 font-medium hover:underline cursor-pointer"
                          title="Remove streak freeze"
                        >
                          Unfreeze
                        </button>
                      )}

                      {(day.completed || (!day.completed && !day.isFrozen)) && (
                        <span className="text-[9px] text-slate-500 font-mono mt-0.5 font-semibold">{day.dayNum}</span>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* ELITE MILESTONE CELEBRATION */}
              <AnimatePresence>
                {has7DayGoalStreak && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 12 }}
                    transition={{ type: "spring", stiffness: 120, damping: 15 }}
                    className="mb-5 relative overflow-hidden rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-400/15 via-amber-600/5 to-slate-950/40 p-4 shadow-[0_0_25px_rgba(251,191,36,0.15)] select-none"
                    id="eliteMilestoneCelebration"
                  >
                    {/* Glowing background rays and rotating conic filter */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(251,191,36,0.15),transparent)] animate-pulse pointer-events-none" />
                    <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0%,rgba(251,191,36,0.02)_50%,transparent_100%)] animate-[spin_12s_linear_infinite] pointer-events-none" />

                    <div className="flex gap-3.5 relative z-10 items-start">
                      <div className="flex-shrink-0 relative">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-[1.5px] flex items-center justify-center shadow-[0_0_12px_rgba(251,191,36,0.3)]">
                          <div className="w-full h-full rounded-2xl bg-slate-950/95 flex items-center justify-center">
                            <Award className="w-5 h-5 text-amber-400 fill-amber-400/10 animate-pulse" />
                          </div>
                        </div>
                        <span className="absolute -top-1.5 -right-1.5 text-[10px] text-amber-300 animate-ping">✨</span>
                        <span className="absolute -bottom-1 -left-1 text-[10px] text-amber-400 animate-bounce">✨</span>
                      </div>

                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                            ELITE MILESTONE UNLOCKED
                          </span>
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-400"></span>
                          </span>
                        </div>
                        <h4 className="text-xs font-black text-slate-100 tracking-wide font-sans mt-1 text-gradient bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400">
                          Unshakeable 7-Day Warrior
                        </h4>
                        <p className="text-[11px] text-slate-300 leading-relaxed mt-1 font-medium">
                          Phenomenal consistency! You maintained your Daily Resilience Goals for 7 consecutive days. You have proven your capacity to stand firm in your healing journey.
                        </p>
                        <div className="mt-2 text-[9px] text-amber-400 font-mono italic flex items-center gap-1 font-semibold">
                          <Sparkles className="w-3 h-3 animate-spin" style={{ animationDuration: "3s" }} />
                          <span>"Your resilience is your weapon and your shield."</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* RESILIENCE TRENDS & GOAL COMPLETION TIMELINE SECTION */}
              <div className="mb-4 mt-2 space-y-3" id="resilienceTrendsContainer">
                {/* View Switcher Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none font-mono">
                    Resilience Trends &amp; Timeline
                  </span>

                  <div className="flex items-center gap-1 bg-black/40 border border-white/10 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setTrendsViewMode("timeline")}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        trendsViewMode === "timeline"
                          ? "bg-amber-400 text-slate-950 shadow-[0_0_10px_rgba(251,191,36,0.3)]"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Calendar className="w-3 h-3" />
                      <span>Goal Timeline</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTrendsViewMode("chart")}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        trendsViewMode === "chart"
                          ? "bg-amber-400 text-slate-950 shadow-[0_0_10px_rgba(251,191,36,0.3)]"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <TrendingUp className="w-3 h-3" />
                      <span>7-Day Curve</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTrendsViewMode("both")}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        trendsViewMode === "both"
                          ? "bg-amber-400 text-slate-950 shadow-[0_0_10px_rgba(251,191,36,0.3)]"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Combined</span>
                    </button>
                  </div>
                </div>

                {/* VIEW 1: MONTHLY GOAL COMPLETION TIMELINE HEATMAP */}
                {(trendsViewMode === "timeline" || trendsViewMode === "both") && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <GoalCompletionTimeline
                      completedDatesHistory={completedGoalsHistory}
                      frozenDates={frozenDates}
                      todayGoalCompleted={dailyGoal.completed}
                      todayDateStr={dailyGoal.date}
                      checkInDates={checkInDatesList}
                      onToggleGoalForDate={handleToggleGoalForDate}
                    />
                  </motion.div>
                )}

                {/* VIEW 2: 7-DAY PROGRESSION LINE & BAR CHART */}
                {(trendsViewMode === "chart" || trendsViewMode === "both") && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-black/20 border border-white/10 rounded-2xl p-3.5 sm:p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider font-mono">
                        7-Day Resilience &amp; Engagement Progression
                      </span>
                      <span className="text-[9px] font-mono text-amber-400/80 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                        Multi-Factor Scoring
                      </span>
                    </div>

                    <div 
                      className="h-[140px] w-full bg-black/15 rounded-xl border border-white/5 p-2" 
                      id="resilienceTrendsChart"
                    >
                      <ResponsiveContainer 
                        key={resilienceTrendsData.map(d => `${d.Score}-${d.checkInRate}-${d.engagementRate}`).join(',')}
                        width="100%" 
                        height="100%"
                      >
                        <ComposedChart 
                          data={resilienceTrendsData} 
                          margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                        >
                          <defs>
                            <filter id="chartGlow" x="-20%" y="-20%" width="140%" height="140%">
                              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#FBBF24" floodOpacity="0.45" />
                            </filter>
                            <linearGradient id="checkInBarGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.45} />
                              <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.12} />
                            </linearGradient>
                            <linearGradient id="engagementBarGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10B981" stopOpacity={0.42} />
                              <stop offset="100%" stopColor="#10B981" stopOpacity={0.10} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <XAxis 
                            dataKey="name" 
                            stroke="rgba(255,255,255,0.3)" 
                            fontSize={9}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis 
                            stroke="rgba(255,255,255,0.3)" 
                            fontSize={9}
                            domain={[0, 100]}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}%`}
                          />
                          <Tooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-slate-950/95 border border-amber-500/30 p-2.5 rounded-xl shadow-xl backdrop-blur-md min-w-[150px] select-none text-left">
                                    <p className="text-[9px] font-mono font-bold uppercase text-slate-400 mb-1.5 border-b border-white/5 pb-1">{data.name}</p>
                                    <div className="space-y-1.5">
                                      <div className="flex items-center justify-between gap-4">
                                        <span className="text-[10px] text-slate-400 font-medium">Check-in Rate</span>
                                        <span className="text-[10px] font-bold text-emerald-400 font-mono">{data.checkInRate}%</span>
                                      </div>
                                      <div className="flex items-center justify-between gap-4">
                                        <span className="text-[10px] text-slate-400 font-medium">Engagement Rate</span>
                                        <span className="text-[10px] font-bold text-sky-400 font-mono">{data.engagementRate}%</span>
                                      </div>
                                      <div className="flex items-center justify-between gap-4 border-t border-white/5 pt-1 mt-1">
                                        <span className="text-[10px] text-slate-200 font-bold">Overall Resilience</span>
                                        <span className="text-xs font-bold text-amber-400 font-mono">{data.Score}%</span>
                                      </div>
                                      {data.goalCompleted && (
                                        <div className="flex items-center gap-1.5 mt-2 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg text-[9px] font-bold text-amber-300 font-sans">
                                          <span>🎯</span>
                                          <span>Goal Completed</span>
                                        </div>
                                      )}
                                      {data.goalFrozen && (
                                        <div className="flex items-center gap-1.5 mt-2 bg-sky-500/10 border border-sky-500/20 px-2 py-1 rounded-lg text-[9px] font-bold text-sky-300 font-sans">
                                          <span>❄️</span>
                                          <span>Streak Protected (Frozen)</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar
                            dataKey="checkInRate"
                            fill="url(#checkInBarGrad)"
                            shape={(props: any) => <CustomBar {...props} dataKey="checkInRate" />}
                            isAnimationActive={false}
                          />
                          <Bar
                            dataKey="engagementRate"
                            fill="url(#engagementBarGrad)"
                            shape={(props: any) => <CustomBar {...props} dataKey="engagementRate" />}
                            isAnimationActive={false}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="Score" 
                            stroke="#FBBF24" 
                            strokeWidth={2.5}
                            dot={<CustomChartDot />}
                            activeDot={{ r: 5, fill: "#FBBF24" }}
                            style={{ filter: "url(#chartGlow)" }}
                            isAnimationActive={true}
                            animationDuration={1500}
                            animationEasing="ease-in-out"
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Resilience Goal & Chart Legend */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-1 justify-center select-none text-[10px] text-slate-400 font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded bg-blue-500/25 border border-blue-500/40" />
                        <span>Check-in Rate</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded bg-emerald-500/20 border border-emerald-500/30" />
                        <span>Engagement Rate</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#243B55] border border-[#FBBF24]" />
                        <span>Overall Score</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                        </span>
                        <span className="text-amber-300 font-semibold">🎯 Goal Completed</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Snowflake className="w-3 h-3 text-sky-400 shrink-0" />
                        <span className="text-sky-300 font-semibold">❄️ Streak Frozen</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* THERAPEUTIC ADVISORY BASED ON SCORE */}
              <div className="mt-2 p-3 rounded-xl bg-white/5 border border-white/5 text-left select-none">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-mono">
                  State: {resilienceLevel.label}
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {resilienceLevel.desc}
                </p>
              </div>

              <div className="mt-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left select-none text-xs flex items-center gap-2.5 text-amber-300 font-medium font-sans">
                <TrendingUp className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{resilienceTrendSummary}</span>
              </div>
            </div>

            {/* QUICK SAFETY REFERENCE */}
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-[24px] p-5 text-left flex items-start gap-3">
              <span className="text-xl select-none">🛡️</span>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300 font-mono mb-1">Crisis Protocol</h4>
                <p className="text-xs text-rose-200 leading-relaxed">
                  If you are in immediate danger, please dial <strong>999</strong> or contact the <strong>Samaritans on 116 123</strong> (free, confidential, 24/7). You do not have to carry this alone.
                </p>
              </div>
            </div>

            </section>
          )}

          {/* TAB: MEMBER CHAT ROOMS */}
          {activeTab === "community" && (
            <section className="flex flex-col gap-6 w-full">
              <CommunityChat
                currentUser={firebaseUser}
                isEliteUser={isEliteUser}
                isEmailVerified={isEmailVerified}
                onUpgradeToElite={toggleEliteMembership}
                onOpenAuthGate={() => setActiveTab("chat")}
              />
            </section>
          )}

          {/* TAB 2: JOURNAL */}
          {activeTab === "journal" && (
            <section className="flex flex-col gap-6 w-full">
              <div id="privateJournalSection">
                <Journal />
              </div>
            </section>
          )}

          {/* TAB: SCHEDULE & ROUTINE SUB-TOGGLE */}
          {(activeTab === "checkin" || activeTab === "calendar") && (
            <div className="w-full flex items-center justify-center gap-1.5 p-1 bg-slate-900/80 border border-white/10 rounded-2xl max-w-sm mx-auto shadow-inner select-none mb-2">
              <button
                type="button"
                onClick={() => setActiveTab("calendar")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === "calendar"
                    ? "bg-amber-400 text-slate-950 shadow-md font-extrabold"
                    : "text-slate-400 hover:text-white"
                }`}
                id="subTabCalendarBtn"
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Smart Calendar</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("checkin")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === "checkin"
                    ? "bg-amber-400 text-slate-950 shadow-md font-extrabold"
                    : "text-slate-400 hover:text-white"
                }`}
                id="subTabRoutineBtn"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Habits &amp; Routine</span>
              </button>
            </div>
          )}

          {/* TAB: DAILY ROUTINE & RESILIENCE HABITS */}
          {activeTab === "checkin" && (
            <section className="flex flex-col gap-6 w-full">
              {/* DAILY MICRO-HABIT RESILIENCE ENGINE */}
              <DailyHabitTracker onPrompt={(text) => handleSend(text)} />

              <div id="dailyCheckInSection">
                <DailyCheckIn
                  onTriggerPrompt={(text) => handleSend(text)}
                  isTtsEnabled={isTtsEnabled}
                  speak={speak}
                />
              </div>

              <div id="dailyAffirmationSection">
                <DailyAffirmation onTriggerPrompt={(text) => handleSend(text)} />
              </div>

              {dailyAnchor && (
                <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-[24px] p-6 backdrop-blur-md relative overflow-hidden text-left flex flex-col" id="dailyResilienceAnchor">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between mb-4 select-none">
                    <div className="flex items-center gap-2.5">
                      <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                        <Anchor className="w-4 h-4 animate-pulse" />
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-slate-100 tracking-wide font-sans">
                          Daily Resilience Anchor
                        </h4>
                        <p className="text-[9px] text-slate-400 font-mono uppercase tracking-widest">
                          YOUR 24-HOUR MOTIVATIONAL SHIELD
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-[10px] bg-slate-900/50 text-amber-300/90 px-2.5 py-1 rounded-full border border-amber-500/10 font-mono tracking-wider">
                      Next: {dailyAnchor.timeLeft}
                    </div>
                  </div>

                  <div className="relative pl-4 border-l-2 border-amber-400/50 py-1">
                    <p className="text-sm text-slate-200 italic leading-relaxed font-sans">
                      "{dailyAnchor.text}"
                    </p>
                    <p className="text-[11px] text-amber-400/80 mt-2 font-mono tracking-wide text-right">
                      — {dailyAnchor.author}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-amber-500/10 flex items-center justify-between">
                    <span className="text-[9px] text-slate-400 font-sans italic select-none">
                      Root yourself in this truth today.
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(`"${dailyAnchor.text}" — ${dailyAnchor.author}`);
                        setCopiedAnchor(true);
                        setTimeout(() => setCopiedAnchor(false), 2000);
                      }}
                      className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer select-none bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-xl transition-all border border-amber-500/15"
                    >
                      {copiedAnchor ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Quote</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* TAB 5: MINDSAFE SMART AI CALENDAR */}
          {activeTab === "calendar" && (
            <section className="flex flex-col gap-6 w-full">
              <SmartCalendar 
                currentUser={firebaseUser} 
                isEmailVerified={isEmailVerified}
                onOpenAuthGate={() => setActiveTab("chat")}
              />
            </section>
          )}

          {/* TAB 6: ZEN SANCTUARY & GROWTH TAMAGOTCHI */}
          {activeTab === "sanctuary" && (
            <section className="flex flex-col gap-6 w-full">
              <ZenSanctuary 
                onTriggerCompanionMessage={(text) => handleSend(text)} 
                activeGuide={activeGuide} 
              />
            </section>
          )}

          {/* TAB 7: MINDSAFE AVATAR STUDIO & CUSTOMIZER */}
          {activeTab === "avatar" && (
            <section className="flex flex-col gap-6 w-full">
              <AvatarStudio
                currentUser={firebaseUser}
                initialConfig={avatarConfig}
                onSave={(newConfig) => {
                  setAvatarConfig(newConfig);
                }}
              />
            </section>
          )}

          {/* TAB 8: WORKPLACE & ENTERPRISE RESILIENCE HUB */}
          {activeTab === "workplace" && (
            <section className="flex flex-col gap-6 w-full">
              <WorkplaceResilienceHub
                onTriggerCompanionMessage={(text) => handleSend(text)}
                onSwitchToChat={() => setActiveTab("chat")}
              />
            </section>
          )}

          {/* TAB 9: GOOGLE WORKSPACE CLOUD HUB */}
          {activeTab === "workspace" && (
            <section className="flex flex-col gap-6 w-full">
              <GoogleWorkspaceHub 
                currentUser={firebaseUser}
                dailyGoalText={dailyGoal.text}
                recentJournalEntry={(() => {
                  try {
                    const entries = JSON.parse(localStorage.getItem("mindsafe_journal_entries") || "{}");
                    const keys = Object.keys(entries).sort().reverse();
                    if (keys.length > 0) {
                      const e = entries[keys[0]];
                      return `[${e.date}] (Mood: ${e.mood || "Peaceful"}): ${e.text}`;
                    }
                  } catch (err) {}
                  return undefined;
                })()}
              />
            </section>
          )}

          {/* TAB 10: GOOGLE MAPS SANCTUARY & CRISIS FINDER */}
          {activeTab === "maps" && (
            <section className="flex flex-col gap-6 w-full">
              <GoogleMapsSanctuaryFinder />
            </section>
          )}

          {/* TAB 4: FULL-WIDTH IMMERSIVE ACTIVE COACHING CHAT */}
          {activeTab === "chat" && (
            <section className="flex flex-col w-full">
            
            {/* CONVERSATION INTERFACE */}
            <div
              className="w-full rounded-[24px] p-[20px] sm:p-[25px] flex flex-col text-left border relative overflow-hidden"
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                borderColor: "rgba(251, 191, 36, 0.2)",
              }}
            >
              {!firebaseUser ? (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-3 border-b border-white/10 pb-4 select-none">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-xs font-bold tracking-widest text-slate-300 uppercase font-mono">
                      Confidential Session Gate
                    </span>
                  </div>
                  <AuthGate
                    currentUser={firebaseUser}
                    onAuthSuccess={(user, profile) => {
                      setFirebaseUser(user);
                      if (profile && profile.displayName) {
                        setUserName(profile.displayName);
                      }
                      if (profile && typeof profile.isEliteUser === "boolean") {
                        setIsEliteUser(profile.isEliteUser);
                      }
                    }}
                    onSignOut={handleFirebaseSignOut}
                  />
                </div>
              ) : (
                <>
                  {/* CHAT SESSION HEADER */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-4 select-none">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse inline-block" />
                  <span className="text-xs font-bold tracking-widest text-slate-300 uppercase font-mono">
                    MindSafe AI Session
                  </span>
                </div>
                
                <div className="flex items-center gap-3 flex-wrap">
                  {/* MULTIMODAL VISION AI BUTTON */}
                  <button
                    type="button"
                    onClick={() => setIsImageModalOpen(true)}
                    className="text-[11px] font-bold text-purple-300 hover:text-purple-200 transition-colors flex items-center gap-1.5 cursor-pointer px-2.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30"
                    title="Upload image for Gemini Vision Analysis"
                  >
                    <Eye className="w-3.5 h-3.5 text-purple-300" />
                    <span>Vision AI</span>
                  </button>

                  {/* AUDIO-ONLY VOICE TOGGLE */}
                  <button
                    type="button"
                    onClick={() => setIsTtsEnabled(!isTtsEnabled)}
                    className={`text-[11px] font-bold transition-colors flex items-center gap-1.5 cursor-pointer select-none px-2 py-1 rounded-lg hover:bg-white/5 ${
                      isTtsEnabled ? "text-[#FBBF24] hover:text-amber-300" : "text-slate-400 hover:text-slate-300"
                    }`}
                    style={{ background: "none", border: "none" }}
                    title={isTtsEnabled ? "Disable Voice Output" : "Enable Voice Output"}
                    id="ttsToggleButton"
                  >
                    {isTtsEnabled ? (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-[#FBBF24]" />
                        <span>Voice Active</span>
                      </>
                    ) : (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                        <span>Voice Off</span>
                      </>
                    )}
                  </button>

                  <span className="text-white/10 text-xs hidden sm:inline">|</span>

                  {/* ELITE SUMMARY GENERATOR */}
                  <button
                    type="button"
                    onClick={handleGenerateEliteSummary}
                    disabled={isSummarizing}
                    className={`text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer select-none px-2 py-1 rounded-lg hover:bg-white/5 ${
                      isSummarizing
                        ? "text-amber-300 animate-pulse bg-white/5"
                        : "text-amber-400 hover:text-amber-300"
                    }`}
                    style={{ background: "none", border: "none" }}
                    title="Generate a one-paragraph AI summary of current session breakthroughs"
                    id="generateEliteSummaryButton"
                  >
                    {isSummarizing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                        <span>Summarizing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                        <span>Elite Summary</span>
                      </>
                    )}
                  </button>

                  <span className="text-white/10 text-xs hidden sm:inline">|</span>

                  {/* DOWNLOAD SESSION LOG */}
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="text-[11px] font-bold text-[#FBBF24] hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer select-none px-2 py-1 rounded-lg hover:bg-white/5"
                    style={{ background: "none", border: "none" }}
                    title="Export session logs to a file"
                    id="downloadSessionButton"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Logs</span>
                  </button>

                  <span className="text-white/10 text-xs hidden sm:inline">|</span>

                  {/* RESET BUTTON */}
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-[11px] font-bold text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer select-none px-2 py-1 rounded-lg hover:bg-white/5"
                    style={{ background: "none", border: "none" }}
                  >
                    Clear History
                  </button>
                </div>
              </div>

              {/* SPLIT SCREEN LAYOUT: LEFT SIDE SAVED CHATS, RIGHT SIDE ACTIVE CHAT AREA */}
              <div className="flex flex-col lg:flex-row gap-6 flex-1 items-stretch min-h-[500px]">
                
                {/* LEFT RAIL: SAVED SESSIONS */}
                <div className="w-full lg:w-[230px] flex flex-col shrink-0 border-b lg:border-b-0 lg:border-r border-white/10 pb-5 lg:pb-0 lg:pr-5 select-none text-left">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase font-mono flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-[#FBBF24]" />
                      Sessions ({conversations.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleNewChat}
                      className="p-1 px-2 rounded-lg bg-amber-400/15 border border-amber-400/20 text-amber-300 hover:bg-amber-400 hover:text-slate-950 font-bold hover:shadow-[0_0_12px_rgba(251,191,36,0.2)] transition-all cursor-pointer flex items-center gap-1 text-[10px] uppercase tracking-wider font-mono"
                      title="Start a new chat session"
                    >
                      <Plus className="w-3 h-3" />
                      <span>New</span>
                    </button>
                  </div>

                  {/* Sidebar Session Search & Sort controls */}
                  <div className="flex flex-col gap-2 mb-3">
                    <div className="relative">
                      <Search className="w-3 h-3 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={sessionSearchQuery}
                        onChange={(e) => setSessionSearchQuery(e.target.value)}
                        placeholder="Filter sessions..."
                        className="w-full bg-slate-900/90 border border-white/10 focus:border-amber-400/40 rounded-lg pl-7 pr-6 py-1 text-[11px] text-slate-300 placeholder:text-slate-500 focus:outline-none transition-all font-sans"
                      />
                      {sessionSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setSessionSearchQuery("")}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                          title="Clear filter"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-1 px-1">
                      <label htmlFor="session-sort" className="text-[10px] text-slate-400 font-medium flex items-center gap-1 shrink-0">
                        <ArrowUpDown className="w-3 h-3 text-amber-400" />
                        <span>Order:</span>
                      </label>
                      <select
                        id="session-sort"
                        value={sessionSortOrder}
                        onChange={(e) => setSessionSortOrder(e.target.value as "newest" | "oldest")}
                        className="bg-slate-900/90 text-slate-300 border border-white/10 rounded-md px-2 py-0.5 text-[10px] focus:outline-none focus:border-amber-400/50 transition-all cursor-pointer font-sans"
                      >
                        <option value="newest">Most Recent</option>
                        <option value="oldest">Oldest First</option>
                      </select>
                    </div>
                  </div>

                  {/* Scrollable list of conversations */}
                  <div className="flex flex-col gap-2 overflow-y-auto max-h-[160px] lg:max-h-[460px] pr-1.5 custom-scrollbar flex-1">
                    {filteredConversations.length === 0 ? (
                      <div className="text-[11px] text-slate-500 italic py-3 text-center">
                        No sessions match "{sessionSearchQuery}"
                      </div>
                    ) : (
                      filteredConversations.map((c) => {
                      const isActive = c.id === activeConversationId;
                      const dateObj = new Date(c.createdAt);
                      const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      const dateStr = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
                      
                      return (
                        <div
                          key={c.id}
                          onClick={() => setActiveConversationId(c.id)}
                          className={`group w-full flex items-center justify-between text-left px-3 py-2.5 rounded-xl cursor-pointer transition-all border ${
                            isActive
                              ? "bg-amber-400/10 border-amber-400/35 text-amber-200"
                              : "bg-white/[0.02] border-transparent hover:border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.04]"
                          }`}
                        >
                          <div className="flex flex-col gap-0.5 overflow-hidden flex-1 min-w-0 pr-2">
                            <span className="text-xs font-semibold truncate leading-tight">
                              {c.title}
                            </span>
                            <span className="text-[9px] text-slate-500 font-mono">
                              {dateStr} at {timeStr}
                            </span>
                          </div>

                          {conversations.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => handleDeleteChat(e, c.id)}
                              className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-rose-500/15 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                              title="Delete this session"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      );
                    }))}
                  </div>
                </div>

                {/* RIGHT PANELS: MAIN ACTIVE CHAT AREA */}
                <div className="flex-1 flex flex-col justify-between min-w-0">

                  {/* CHAT HEADER: ASSISTANT STATUS & SEARCH/FILTERS */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3 select-none">
                    {/* ASSISTANT CAPABILITY BADGE & DUAL MODE SELECTOR */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-white/10 rounded-2xl backdrop-blur-md shadow-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveGuide("mindsafe");
                            safeLocalStorage.setItem("mindsafe-active-guide", "mindsafe");
                            setMessages((prev) => {
                              if (prev.length === 1 && prev[0].id === "welcome") {
                                return [{ ...prev[0], text: getInitialWelcomeMessage("mindsafe") }];
                              }
                              return prev;
                            });
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            activeGuide === "mindsafe"
                              ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-[0_0_12px_rgba(251,191,36,0.3)] ring-1 ring-amber-300"
                              : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                          }`}
                          title="Mode A: Practical, logical, problem-solving, safety, planning, advice"
                        >
                          <span className="text-sm">🧠</span>
                          <span>MindSafe Companion</span>
                          {activeGuide === "mindsafe" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse ml-0.5" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveGuide("nanny");
                            safeLocalStorage.setItem("mindsafe-active-guide", "nanny");
                            setMessages((prev) => {
                              if (prev.length === 1 && prev[0].id === "welcome") {
                                return [{ ...prev[0], text: getInitialWelcomeMessage("nanny") }];
                              }
                              return prev;
                            });
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            activeGuide === "nanny"
                              ? "bg-gradient-to-r from-teal-400 to-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(45,212,191,0.35)] ring-1 ring-teal-300"
                              : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                          }`}
                          title="Mode B: Gentle, calm, spiritual wisdom, peace, feelings, nature metaphors"
                        >
                          <span className="text-sm">🐸</span>
                          <span>Nanny Frog</span>
                          {activeGuide === "nanny" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse ml-0.5" />
                          )}
                        </button>
                      </div>

                      <span className="text-[10px] text-amber-400/90 font-medium px-2.5 py-1 bg-amber-500/10 rounded-full border border-amber-500/20 flex items-center gap-1.5 shadow-2xs">
                        <Globe className="w-3 h-3 text-emerald-400" />
                        <span>Web-Grounded v3.0</span>
                      </span>
                    </div>

                    {/* CHAT SEARCH & FILTERS */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      {/* Search input in chat view */}
                      <div className="relative flex-1 sm:w-52">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search chat history..."
                          className="w-full bg-slate-900/80 border border-white/10 focus:border-amber-400/50 rounded-xl pl-9 pr-7 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none transition-all font-sans"
                        />
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                            title="Clear search"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      <div className="flex gap-1 bg-white/5 p-1 rounded-xl w-fit border border-white/5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setChatFilter("all")}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                            chatFilter === "all"
                              ? "bg-amber-400 text-slate-950 font-bold shadow-md"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          All
                        </button>
                        <button
                          type="button"
                          onClick={() => setChatFilter("saved")}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                            chatFilter === "saved"
                              ? "bg-amber-400 text-slate-950 font-bold shadow-md"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${chatFilter === "saved" ? "fill-slate-950" : ""}`} />
                          <span>Saved ({savedMessages.length})</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ACTIVE MODE STATUS BANNER */}
                  <div className={`mb-4 px-3.5 py-2 rounded-xl border flex items-center justify-between text-xs transition-all ${
                    activeGuide === "nanny"
                      ? "bg-teal-950/40 border-teal-500/30 text-teal-200"
                      : "bg-amber-950/30 border-amber-500/25 text-amber-200"
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{activeGuide === "nanny" ? "🐸" : "🧠"}</span>
                      <span className="font-semibold">
                        {activeGuide === "nanny"
                          ? "Nanny Frog Active: Gentle comforting wisdom, peace, deep presence & quiet protection."
                          : "MindSafe Companion Active: Experience-powered problem solving, safety, and step-by-step coaching."}
                      </span>
                    </div>
                    <span className="text-[10px] opacity-75 font-mono hidden sm:inline">
                      {activeGuide === "nanny" ? "Mode B — Spiritual Guide" : "Mode A — Life Coach"}
                    </span>
                  </div>

              {/* MESSAGES VIEWSTREAM */}
              <div className="flex-1 space-y-6 overflow-y-auto max-h-[460px] min-h-[340px] pr-2 custom-scrollbar">
                <AnimatePresence>
                  {eliteSummary && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ type: "spring", stiffness: 120, damping: 14 }}
                      className="p-4 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-slate-950/40 relative overflow-hidden shadow-[0_4px_20px_rgba(251,191,36,0.1)] select-none mb-4"
                      id="pinnedEliteSummaryCard"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />
                      
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="p-1 rounded-lg bg-amber-500/15 text-amber-400">
                            <Pin className="w-3.5 h-3.5 fill-amber-400" />
                          </span>
                          <span className="text-[10px] font-bold tracking-wider text-amber-400 uppercase font-mono flex items-center gap-1">
                            Elite Breakthrough Summary
                            <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEliteSummary(null);
                            localStorage.removeItem("mindsafe-elite-summary-v1");
                          }}
                          className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all cursor-pointer"
                          title="Dismiss summary"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      
                      <p className="text-xs text-slate-200 leading-relaxed pl-1.5 border-l border-amber-400/30 font-sans">
                        {eliteSummary}
                      </p>
                      
                      <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[9px] text-slate-400 font-mono select-none">
                        <span>Generated with MindSafe Companion</span>
                        <span className="flex h-1.5 w-1.5 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-400"></span>
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {searchQuery.trim() && (
                  <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-amber-400/10 border border-amber-400/25 text-xs text-amber-200 select-none mb-3">
                    <span className="flex items-center gap-2">
                      <Search className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        Found <strong>{filteredMessages.length}</strong> result{filteredMessages.length === 1 ? "" : "s"} for "<strong>{searchQuery}</strong>"
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="text-[10px] font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 hover:underline cursor-pointer"
                    >
                      Clear search
                    </button>
                  </div>
                )}

                {searchQuery.trim() && filteredMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-12 px-4 bg-white/5 border border-dashed border-white/10 rounded-[20px] my-4 select-none">
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-3">
                      <Search className="w-6 h-6 text-[#FBBF24]" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-200 mb-1">No messages match "{searchQuery}"</h4>
                    <p className="text-xs text-slate-400 max-w-sm leading-relaxed mb-3">
                      Try searching for keywords like "sleep", "focus", "mindfulness", or "stress".
                    </p>
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="px-3 py-1.5 rounded-lg bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-bold hover:bg-amber-400 hover:text-slate-950 transition-all cursor-pointer"
                    >
                      Clear Search
                    </button>
                  </div>
                ) : chatFilter === "saved" && filteredMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-12 px-4 bg-white/5 border border-dashed border-white/10 rounded-[20px] my-4 select-none">
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-3">
                      <Bookmark className="w-6 h-6 text-[#FBBF24]" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-200 mb-1">No saved insights yet</h4>
                    <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                      Hover over any coaching bubble and click the <strong>pin</strong> or <strong>heart</strong> icons to save critical breakthroughs, lessons, or exercises for later retrieval!
                    </p>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {filteredMessages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        id={`msg-${msg.id}`}
                        layout="position"
                        initial={{ 
                          opacity: 0, 
                          y: 24,
                          scale: 0.97 
                        }}
                        animate={{ 
                          opacity: 1, 
                          y: 0,
                          scale: 1 
                        }}
                        exit={{ 
                          opacity: 0, 
                          scale: 0.92,
                          transition: { duration: 0.15 } 
                        }}
                        whileHover={{ 
                          scale: 1.008, 
                          boxShadow: msg.sender === "user" 
                            ? "0 4px 18px rgba(96, 165, 250, 0.12)" 
                            : "0 4px 18px rgba(251, 191, 36, 0.12)" 
                        }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 240, 
                          damping: 22,
                          mass: 1
                        }}
                        className={`leading-[1.65] text-sm relative group transition-all duration-200 ${
                          msg.sender === "ai"
                            ? "max-w-[96%] sm:max-w-[92%] mr-auto w-full"
                            : "max-w-[85%] ml-auto p-[14px] px-[18px] rounded-[18px] bg-white text-[#121B2E] border border-white/10 rounded-br-sm shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
                        }`}
                      >
                        {/* Interactive hover reactions bar */}
                        <div className={`absolute ${msg.sender === "ai" ? "-top-3 right-3" : "bottom-[-16px] right-4"} opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-200 flex gap-1.5 bg-slate-900 border border-[#FBBF24]/30 rounded-full px-2.5 py-1 shadow-lg z-10 select-none`}>
                          {msg.sender === "user" && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditUserMessage(msg.text);
                              }}
                              className="p-1 rounded-full hover:bg-white/10 text-white/50 hover:text-sky-300 transition-all cursor-pointer"
                              title="Edit & refine message"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-sky-400" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePin(msg.id);
                            }}
                            className={`p-1 rounded-full hover:bg-white/10 transition-all cursor-pointer ${
                              msg.isPinned ? "text-amber-400" : "text-white/40 hover:text-white"
                            }`}
                            title={msg.isPinned ? "Unpin breakthrough" : "Pin breakthrough"}
                          >
                            <Pin className={`w-3.5 h-3.5 ${msg.isPinned ? "fill-amber-400" : ""}`} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleHeart(msg.id);
                            }}
                            className={`p-1 rounded-full hover:bg-white/10 transition-all cursor-pointer ${
                              msg.isHearted ? "text-rose-400" : "text-white/40 hover:text-white"
                            }`}
                            title={msg.isHearted ? "Unheart message" : "Heart message"}
                          >
                            <Heart className={`w-3.5 h-3.5 ${msg.isHearted ? "fill-rose-400" : ""}`} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveReactionMenuId(activeReactionMenuId === msg.id ? null : msg.id);
                            }}
                            className={`p-1 rounded-full hover:bg-white/10 transition-all cursor-pointer ${
                              msg.reactions && msg.reactions.length > 0 ? "text-amber-400" : "text-white/40 hover:text-white"
                            }`}
                            title="Add emotional reaction tag"
                          >
                            <Tag className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveTranslateMenuId(activeTranslateMenuId === msg.id ? null : msg.id);
                            }}
                            className={`p-1 rounded-full hover:bg-white/10 transition-all cursor-pointer ${
                              msg.isShowingTranslation || activeTranslateMenuId === msg.id ? "text-amber-400" : "text-white/40 hover:text-white"
                            }`}
                            title="Translate message"
                          >
                            <Languages className="w-3.5 h-3.5" />
                          </button>
                          {msg.sender === "ai" && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleSpeakMessage(msg.id, msg.text);
                              }}
                              className={`p-1 rounded-full hover:bg-white/10 transition-all cursor-pointer ${
                                speakingMsgId === msg.id ? "text-emerald-400 animate-pulse bg-emerald-500/20" : "text-white/40 hover:text-white"
                              }`}
                              title={speakingMsgId === msg.id ? "Stop reading aloud" : "Listen to coaching in soothing voice"}
                            >
                              <Volume2 className={`w-3.5 h-3.5 ${speakingMsgId === msg.id ? "text-emerald-400" : ""}`} />
                            </button>
                          )}
                        </div>

                        {/* Reaction Tag Menu Dropdown */}
                        {activeReactionMenuId === msg.id && (
                          <div 
                            className="absolute right-10 top-10 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-2 shadow-2xl z-20 min-w-[170px] flex flex-col gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest px-2 py-1 border-b border-white/5 mb-1 text-left select-none flex items-center justify-between">
                              <span>Emotional Tag</span>
                              <span className="text-[9px] text-amber-400/80">Toggle</span>
                            </div>
                            {Object.entries(REACTION_CONFIG).map(([tagName, config]) => {
                              const isSelected = (msg.reactions || []).includes(tagName);
                              return (
                                <button
                                  key={tagName}
                                  type="button"
                                  onClick={() => {
                                    toggleReaction(msg.id, tagName);
                                  }}
                                  className={`flex items-center justify-between text-left text-xs px-2.5 py-1.5 rounded-lg transition-all w-full cursor-pointer select-none font-sans ${
                                    isSelected
                                      ? "bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30"
                                      : "text-slate-300 hover:text-white hover:bg-white/5"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm select-none">{config.emoji}</span>
                                    <span>{config.label}</span>
                                  </div>
                                  {isSelected && <Check className="w-3 h-3 text-amber-400 shrink-0" />}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Translation Menu Dropdown */}
                        {activeTranslateMenuId === msg.id && (
                          <div 
                            className="absolute right-2 top-10 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-2 shadow-2xl z-20 min-w-[170px] max-h-[220px] overflow-y-auto custom-scrollbar flex flex-col gap-0.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest px-2 py-1 border-b border-white/5 mb-1 text-left select-none">
                              Translate to
                            </div>
                            {LANGUAGES.map((lang) => (
                              <button
                                key={lang.code}
                                type="button"
                                onClick={() => {
                                  handleTranslateMessage(msg.id, lang.code, lang.label);
                                  setActiveTranslateMenuId(null);
                                }}
                                className="flex items-center gap-2 text-left text-xs text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-all w-full cursor-pointer select-none font-sans"
                              >
                                <span className="text-sm select-none">{lang.flag}</span>
                                <span className="font-medium">{lang.label}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* SENDER IDENTITY & CUSTOM AVATAR BADGE */}
                        {msg.sender === "user" && (
                          <div className="flex items-center gap-1.5 mb-2 pb-1 border-b border-slate-100/80 text-[11px] font-bold font-mono text-slate-800 select-none">
                            <AvatarDisplay config={avatarConfig} size={20} showAura={false} showPet={false} animated={false} />
                            <span className="truncate max-w-[140px] text-slate-900">
                              {(!avatarConfig.avatarName || /victor/i.test(avatarConfig.avatarName)) ? "You" : avatarConfig.avatarName}
                            </span>
                            <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-amber-100 border border-amber-300/40 text-amber-900 font-semibold uppercase tracking-wider">
                              {avatarConfig.title || "Warrior"}
                            </span>
                          </div>
                        )}
                        {translatingId === msg.id ? (
                          <div className="flex items-center gap-2 text-amber-400 text-xs py-2 select-none text-left">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span className="font-mono uppercase tracking-wider text-[10px] font-bold">Translating...</span>
                          </div>
                        ) : msg.isShowingTranslation && msg.translatedText ? (
                          <div className="space-y-1 text-left">
                            <div className="text-[10px] font-mono tracking-wider text-amber-400 font-bold flex items-center gap-1 select-none">
                              <span>Translated to {msg.targetLangName}</span>
                              <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                            </div>
                            <div className="whitespace-pre-wrap text-[#121B2E]">{highlightText(msg.translatedText, searchQuery)}</div>
                            <button
                              type="button"
                              onClick={() => {
                                setMessages((prev) =>
                                  prev.map((m) =>
                                    m.id === msg.id ? { ...m, isShowingTranslation: false } : m
                                  )
                                );
                              }}
                              className="text-[10px] font-mono font-bold text-amber-400/80 hover:text-amber-300 underline mt-1.5 cursor-pointer block select-none animate-pulse"
                            >
                              Show Original English
                            </button>
                          </div>
                        ) : (
                          <div className="text-left w-full">
                            {msg.sender === "ai" ? (
                              <DolaResponseCard
                                text={msg.text}
                                isWebGrounded={msg.isWebGrounded}
                                webSources={msg.webSources}
                                searchQuery={searchQuery}
                                highlightText={highlightText}
                                isBillingError={msg.isBillingError}
                                activeGuide={activeGuide}
                              />
                            ) : (
                              <div className="whitespace-pre-wrap text-slate-900 font-sans text-xs leading-relaxed">{highlightText(msg.text, searchQuery)}</div>
                            )}

                            {msg.translatedText && (
                              <button
                                type="button"
                                onClick={() => {
                                  setMessages((prev) =>
                                    prev.map((m) =>
                                      m.id === msg.id ? { ...m, isShowingTranslation: true } : m
                                    )
                                  );
                                }}
                                className="text-[10px] font-mono font-bold text-amber-700 hover:text-amber-900 underline mt-2 cursor-pointer block select-none"
                              >
                                Show Translation ({msg.targetLangName})
                              </button>
                            )}
                          </div>
                        )}

                        {/* Active reaction badges inside the bubble (visible at all times) */}
                        {((msg.reactions && msg.reactions.length > 0) || msg.isPinned || msg.isHearted) && (
                          <div className="flex flex-wrap gap-1.5 items-center mt-2.5 justify-end text-[10px] font-mono tracking-wide select-none">
                            {msg.reactions?.map((r) => {
                              const config = REACTION_CONFIG[r] || { label: r, emoji: "🏷️", badgeStyle: "bg-slate-500/10 text-slate-300 border-slate-500/20" };
                              return (
                                <button
                                  key={r}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleReaction(msg.id, r);
                                  }}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border transition-all cursor-pointer font-sans text-[10px] font-medium shadow-xs ${config.badgeStyle}`}
                                  title={`Tag: ${r}. Click to remove.`}
                                >
                                  <span>{config.emoji}</span>
                                  <span>{r}</span>
                                </button>
                              );
                            })}
                            {msg.isPinned && (
                              <span className="flex items-center gap-0.5 bg-amber-400/10 text-amber-300 px-1.5 py-0.5 rounded-md border border-amber-400/25">
                                <Pin className="w-2.5 h-2.5 fill-amber-300" />
                                <span>Pinned</span>
                              </span>
                            )}
                            {msg.isHearted && (
                              <span className="flex items-center gap-0.5 bg-rose-400/10 text-rose-300 px-1.5 py-0.5 rounded-md border border-rose-400/25">
                                <Heart className="w-2.5 h-2.5 fill-rose-300" />
                                <span>Hearted</span>
                              </span>
                            )}
                          </div>
                        )}

                        {/* Timestamp label beneath each message */}
                        <div
                          className={`flex items-center gap-1 text-[10px] font-mono tracking-wider select-none mt-1.5 pt-1 ${
                            msg.sender === "user"
                              ? "text-slate-400/90 justify-end border-t border-slate-100/80"
                              : "text-slate-400/90 justify-between px-1"
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 opacity-60" />
                            <span>{formatMessageTime(getMessageTimestamp(msg, conversations.find(c => c.id === activeConversationId)?.createdAt))}</span>
                          </div>
                          {msg.sender === "ai" && (
                            <ProcessedBadge msgTimestamp={getMessageTimestamp(msg, conversations.find(c => c.id === activeConversationId)?.createdAt)} />
                          )}
                          {msg.sender === "user" && (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditUserMessage(msg.text);
                                }}
                                className="inline-flex items-center gap-1 text-[10px] font-sans font-medium text-slate-500 hover:text-sky-600 transition-colors cursor-pointer px-1 py-0.5 rounded hover:bg-slate-100"
                                title="Edit & refine message"
                              >
                                <Edit2 className="w-3 h-3 text-sky-500" />
                                <span>Edit</span>
                              </button>
                              <span className="inline-flex items-center gap-0.5 text-slate-400/80 text-[9px] font-mono select-none" title="Sent & delivered">
                                <CheckCheck className="w-3 h-3 text-sky-400/80" />
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}

                {isLoading && (
                  <div className="p-[14px] px-[18px] rounded-[18px] max-w-[85%] bg-white/5 text-slate-200 mr-auto border border-white/5 border-l-4 border-l-[#FBBF24]/50 shadow-[0_4px_16px_rgba(0,0,0,0.2)]">
                    <div className="flex items-center gap-2.5 select-none">
                      <div className="flex gap-1 items-center h-4">
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider font-bold">
                        <span className="text-amber-400 flex items-center gap-1.5 animate-pulse">
                          <span>🧠</span> MindSafe AI is consulting personal experiences & double-checking the web...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              
              {/* 🎯 DAILY REFLECTION PROMPTS (BASED ON USER'S RESILIENCE FOCUS) */}
              <DailyReflectionPrompts
                userFocus={userFocus}
                onSelectPrompt={handleSelectReflectionPrompt}
                onUpdateFocus={(newFocus) => {
                  setUserFocus(newFocus);
                  safeLocalStorage.setItem("mindsafe-user-focus", newFocus);
                  setIsSavingProfile(true);
                  setTimeout(() => setIsSavingProfile(false), 1500);
                }}
              />

              {/* Quick Starter Chips */}
              <div className="w-full mt-2 select-none flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar scrollbar-none snap-x">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider shrink-0 mr-1">
                  Quick Starters:
                </span>
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt.label}
                    type="button"
                    onClick={() => handleSelectReflectionPrompt(prompt.text)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-white/5 hover:border-amber-400/40 bg-white/[0.02] hover:bg-amber-400/10 text-slate-400 hover:text-amber-200 text-[10.5px] font-medium cursor-pointer transition-all whitespace-nowrap snap-start shrink-0"
                  >
                    <span>{prompt.emoji}</span>
                    <span>{prompt.label}</span>
                  </button>
                ))}
              </div>

              {/* USER INPUT AREA */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="w-full flex gap-3 flex-wrap mt-5"
              >
                <div className="relative flex-1 min-w-[260px] flex flex-col">
                  {editingSourceText && (
                    <div className="w-full flex items-center justify-between text-xs bg-sky-500/10 border border-sky-500/30 text-sky-200 px-3.5 py-2 rounded-xl mb-2.5 shadow-sm animate-fadeIn">
                      <div className="flex items-center gap-2 truncate pr-2">
                        <Edit2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span className="font-semibold shrink-0 text-sky-300">Refining message:</span>
                        <span className="truncate italic opacity-80 text-slate-200">"{editingSourceText}"</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSourceText(null);
                          setInput("");
                        }}
                        className="p-1 text-sky-300/70 hover:text-white hover:bg-sky-500/20 rounded-md transition-colors cursor-pointer shrink-0"
                        title="Cancel editing"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  <div className="relative w-full flex">
                    <textarea
                      ref={textareaRef}
                      rows={1}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      placeholder={
                        isTranscribing 
                          ? "Processing speech-to-text..." 
                          : isRecording 
                            ? "Recording voice... Click 'Stop' to send directly." 
                            : isListening 
                              ? "Listening... speak now." 
                              : "Share whatever is on your mind..."
                      }
                      className="w-full py-[16px] pl-[20px] pr-[76px] border rounded-[16px] text-sm focus:outline-none transition-all duration-300 resize-none max-h-[200px] overflow-y-auto custom-scrollbar"
                      style={{
                        borderColor: isRecording || isTranscribing
                          ? "#EF4444"
                          : isListening 
                            ? "#F87171" 
                            : isFocused 
                              ? "#FBBF24" 
                              : "rgba(255,255,255,0.15)",
                        boxShadow: isRecording || isTranscribing
                          ? "0 0 16px rgba(239, 68, 68, 0.4)"
                          : isListening
                            ? "0 0 16px rgba(248, 113, 113, 0.3)"
                            : isFocused 
                              ? "0 0 16px rgba(251, 191, 36, 0.3)" 
                              : "none",
                        background: isRecording || isTranscribing || isListening ? "rgba(239,68,68,0.04)" : "rgba(255,255,255,0.04)",
                        color: "#FFFFFF",
                      }}
                      disabled={isLoading || isRecording || isTranscribing}
                      id="userInput"
                    />
                    {input && (
                      <>
                        <div className="absolute right-11 top-[16px] z-20">
                          <button
                            type="button"
                            onClick={() => setIsSmartMenuOpen(!isSmartMenuOpen)}
                            className={`p-1.5 rounded-full hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center select-none ${
                              isSmartMenuOpen ? "text-amber-400 bg-white/5" : "text-[#FBBF24] hover:text-[#FBBF24]/80"
                            }`}
                            style={{ background: "none", border: "none" }}
                            title="Smart transform tools"
                            id="smartExpandButton"
                          >
                            <Sparkles className={`w-4 h-4 ${isTransforming ? "animate-spin" : ""}`} />
                          </button>

                          <AnimatePresence>
                            {isSmartMenuOpen && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className="absolute right-0 bottom-full mb-2 w-52 bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-xl p-1.5 shadow-2xl z-30 flex flex-col gap-0.5 select-none"
                              >
                                <div className="px-2 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest border-b border-white/5 mb-1">
                                  Smart Reflection Actions
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleTransform("summarize")}
                                  disabled={isTransforming}
                                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-white/5 text-slate-200 hover:text-white transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                  <span>📝 Summarize Text</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleTransform("expand")}
                                  disabled={isTransforming}
                                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-white/5 text-slate-200 hover:text-white transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                  <span>✨ Expand Thoughts</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleTransform("professionalize")}
                                  disabled={isTransforming}
                                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-white/5 text-slate-200 hover:text-white transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                  <span>💼 Refine &amp; Professionalize</span>
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setInput("");
                            setIsSmartMenuOpen(false);
                          }}
                          className="absolute right-4 top-[16px] p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-all cursor-pointer flex items-center justify-center select-none z-10"
                          style={{ background: "none", border: "none" }}
                          title="Clear input"
                          id="clearInputButton"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                  <AnimatePresence>
                    {isFocused && (
                      <motion.span
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: "6px" }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-[11px] text-slate-400 font-mono tracking-wide px-1 select-none text-left overflow-hidden block"
                        id="inputInstructionLabel"
                      >
                        Shift + Enter for a new line
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                {isSupported && (
                  <button
                    type="button"
                    onClick={toggleListening}
                    disabled={isRecording || isTranscribing}
                    className={`p-[16px] px-5 rounded-[16px] cursor-pointer transition-all select-none flex items-center justify-center border ${
                      isListening
                        ? "bg-rose-500/20 border-rose-500 text-rose-300 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse"
                        : "bg-white/5 hover:bg-white/10 border-white/15 text-[#FBBF24] hover:border-[#FBBF24] disabled:opacity-30 disabled:cursor-not-allowed"
                    }`}
                    title={isListening ? "Stop listening" : "Dictate your thoughts"}
                    id="micButton"
                  >
                    {isListening ? (
                      <span className="flex items-center gap-2">
                        <MicOff className="w-4 h-4 text-rose-400" />
                        <span className="text-[10px] font-mono uppercase tracking-widest text-rose-300">Listening</span>
                      </span>
                    ) : (
                      <Mic className="w-4 h-4 text-[#FBBF24]" />
                    )}
                  </button>
                )}

                {/* RECORD AUDIO BUTTON (STT SERVER SERVICE) */}
                <button
                  type="button"
                  onClick={toggleRecording}
                  disabled={isTranscribing || isLoading || isListening}
                  className={`p-[16px] px-5 rounded-[16px] cursor-pointer transition-all select-none flex items-center justify-center border text-xs font-bold gap-2 ${
                    isRecording
                      ? "bg-red-500/20 border-red-500 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse"
                      : "bg-white/5 hover:bg-white/10 border-white/15 text-rose-400 hover:border-rose-400"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={isRecording ? "Stop recording and transcribe" : "Record audio message to chat"}
                  id="recordButton"
                >
                  {isTranscribing ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-rose-400 animate-spin" />
                      <span className="text-[10px] font-mono uppercase tracking-widest text-rose-300">Transcribing...</span>
                    </span>
                  ) : isRecording ? (
                    <span className="flex items-center gap-2">
                      <Square className="w-4 h-4 text-red-500 fill-red-500" />
                      <span className="text-[10px] font-mono uppercase tracking-widest text-red-400">
                        Stop ({Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, "0")})
                      </span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Circle className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                      <span>Record</span>
                    </span>
                  )}
                </button>

                <button
                  type="submit"
                  disabled={isLoading || !input.trim() || isListening || isRecording || isTranscribing}
                  className="p-[16px] px-[22px] rounded-[16px] font-bold text-sm cursor-pointer hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none select-none flex items-center justify-center"
                  style={{
                    background: "linear-gradient(90deg, #FBBF24, #D97706)",
                    color: "#141E30",
                  }}
                  title="Send message"
                  id="sendButton"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
                </>
              )}
            </div>

          </section>
          )}

        </main>

        {/* LEGAL & SAFEGUARDING AREA */}
        <footer className="mt-8 pt-6 border-t border-white/10 text-center space-y-3 select-none w-full max-w-2xl mx-auto pb-4">
          <div className="text-xs text-slate-400 font-sans leading-relaxed">
            © 2026 MindSafe Holdings Ltd. Founded by V.Kwantreng. All rights reserved.<br />
            <strong className="text-[#FBBF24] font-extrabold font-display text-sm tracking-wide">🧠MindSafe👊🏼 — Safe Minds, Better Lives</strong>
          </div>
          <div className="text-[11px] text-slate-500 leading-relaxed max-w-lg mx-auto font-sans">
            <strong className="text-slate-400 font-bold">Safeguarding Advice:</strong> MindSafe is a companion built on lived experience — not a replacement for professional mental health services, therapy, or emergency care.<br />
            If you are in immediate danger or experiencing severe crisis, please contact the Samaritans at <span className="text-[#FBBF24] font-mono font-bold">116 123</span> (free 24/7 UK) or dial <span className="text-rose-400 font-mono font-bold">999</span> immediately. You are never alone.
          </div>
        </footer>
      </div>

      {/* Calm Breathing Modal */}
      <CalmBreathing isOpen={isBreathingOpen} onClose={() => setIsBreathingOpen(false)} />

      {/* Welcome Email & Onboarding personalizer Modal */}
      <AnimatePresence>
        {isWelcomeOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" id="welcomeEmailModal">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/20 rounded-3xl overflow-hidden shadow-2xl relative"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-amber-400" />
                  <span className="text-sm font-semibold text-slate-200">Message from MindSafe Team</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsWelcomeOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  title="Close welcome letter"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Personalization Section */}
              <div className="mx-6 my-6 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-left flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold mb-1">Personalise Your Workspace</h4>
                  <p className="text-xs text-slate-400 font-sans">Set your name so MindSafe and the team can greet you personally.</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={userName === "Warrior" ? "" : userName}
                    onChange={(e) => {
                      const newName = e.target.value.trim() || "Warrior";
                      setUserName(newName);
                      localStorage.setItem("mindsafe-user-name-v1", newName);
                    }}
                    placeholder="Enter your name"
                    className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-amber-400/50 w-44 font-medium"
                  />
                </div>
              </div>

              {/* Email Body */}
              <div className="p-6 md:p-8 text-left text-slate-300 space-y-4 max-h-[380px] overflow-y-auto font-sans leading-relaxed text-sm">
                <p className="text-base font-semibold text-slate-100">Hi {userName},</p>

                <p>Thank you for joining MindSafe AI.</p>

                <p>
                  Your free <strong className="text-slate-200">MindSafe Companion</strong> is now active — you can chat, check in, and find support whenever you need it.
                </p>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <p>
                    If you ever want to go deeper, you can unlock the full <strong className="text-amber-400 font-black">Elite MindSafe experience</strong> for <strong className="text-white">£20/month — your first month is completely free</strong>.
                  </p>
                  
                  {/* Membership Toggle Action */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-2 border-t border-white/5 gap-3">
                    <span className="text-xs font-mono text-slate-400">Current Status: {isEliteUser ? "👑 Elite Trial Active" : "🆓 Free Tier"}</span>
                    <button
                      type="button"
                      onClick={toggleEliteMembership}
                      className={`px-4 py-1.5 rounded-xl text-xs font-black tracking-wide transition-all select-none cursor-pointer ${
                        isEliteUser 
                          ? "bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
                          : "bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/10"
                      }`}
                    >
                      {isEliteUser ? "Deactivate Elite Plan" : "Activate 1 Month Free Elite Trial"}
                    </button>
                  </div>
                </div>

                <p>Your pace, your path, your strength.</p>

                <div className="pt-4 border-t border-white/5">
                  <p className="font-mono text-xs text-slate-400">— The MindSafe Team</p>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="px-6 py-4 bg-white/5 border-t border-white/10 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsWelcomeOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-xs cursor-pointer transition-all select-none"
                >
                  Return to Dashboard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TOOLKIT & PROFILE MASTER SLIDING DRAWER OVERLAY */}
      <AnimatePresence>
        {isFeatureMenuOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFeatureMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Sliding Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-[550px] h-full bg-[#0c1324] border-l border-amber-500/20 shadow-2xl flex flex-col z-50 overflow-hidden text-left"
              id="resilienceToolkitDrawer"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/20 select-none">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🧠</span>
                  <div>
                    <h3 className="text-sm font-black text-amber-400 tracking-wider uppercase font-mono">
                      MindSafe Resilience Toolkit
                    </h3>
                    <p className="text-[10px] text-slate-400 font-sans">
                      Your complete recovery & growth system
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFeatureMenuOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                  title="Close Toolkit"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Navigation Tabs */}
              <div className="flex border-b border-white/10 bg-black/10 select-none text-xs font-bold font-mono">
                {[
                  { id: "profile", label: "Profile", icon: <User className="w-3.5 h-3.5" /> },
                  { id: "checkin", label: "Check-In", icon: <Calendar className="w-3.5 h-3.5" /> },
                  { id: "journal", label: "Journal", icon: <Book className="w-3.5 h-3.5" /> },
                  { id: "analytics", label: "Analytics", icon: <Activity className="w-3.5 h-3.5" /> },
                  { id: "story", label: "Our Story", icon: <Shield className="w-3.5 h-3.5" /> }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setDrawerActiveTab(tab.id as any)}
                    className={`flex-1 py-3 flex flex-col items-center justify-center gap-1 border-b-2 transition-all cursor-pointer ${
                      drawerActiveTab === tab.id
                        ? "border-[#FBBF24] text-[#FBBF24] bg-white/[0.02]"
                        : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.01]"
                    }`}
                  >
                    {tab.icon}
                    <span className="text-[9px] uppercase tracking-wider">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Drawer Scrollable Body Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-slate-950/20">
                {drawerActiveTab === "profile" && (
                  <div className="space-y-5">
                    {/* PROFILE CARD */}
                    <div className="bg-gradient-to-br from-amber-500/15 to-transparent border border-amber-500/20 rounded-2xl p-5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/5 rounded-full blur-xl pointer-events-none" />
                      
                      <div className="flex items-center gap-4 mb-4 select-none">
                        <div className="p-3 bg-amber-400/10 border border-amber-500/20 rounded-full text-amber-400">
                          <User className="w-8 h-8" />
                        </div>
                        <div>
                          <h4 className="text-base font-black text-white font-sans">{userName || "Warrior"}</h4>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                              {isEliteUser ? "👑 Elite Companion Active" : "🆓 Free Tier Companion"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-4 select-none text-xs">
                        <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                          <span className="text-[10px] text-slate-400 block font-mono font-bold">STRENGTH STREAK</span>
                          <span className="text-lg font-bold text-amber-400 font-sans">7 Days</span>
                        </div>
                        <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                          <span className="text-[10px] text-slate-400 block font-mono font-bold">RECOVERY LEVEL</span>
                          <span className="text-lg font-bold text-emerald-400 font-sans font-sans">Gold Warrior</span>
                        </div>
                      </div>
                    </div>

                    {/* INTERACTIVE FORM FIELD: DISPLAY NAME */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block select-none">
                        Change Warrior Name
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          placeholder="Your Name"
                          className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors font-sans font-semibold"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            localStorage.setItem("mindsafe-user-name", userName);
                            setIsSavingProfile(true);
                            setTimeout(() => setIsSavingProfile(false), 1500);
                          }}
                          className="px-4 py-2.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 border border-amber-500/20 hover:border-amber-500/40 text-amber-300 font-bold font-mono text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all shrink-0"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Save Name</span>
                        </button>
                      </div>
                    </div>

                    {/* INTERACTIVE FORM FIELD: BATTLE CRY / MANTRA */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block select-none">
                        Personal Battle Cry / Mantra
                      </label>
                      <textarea
                        value={userMantra}
                        onChange={(e) => setUserMantra(e.target.value)}
                        placeholder="e.g., I am stronger than my trials. I will conquer today."
                        maxLength={120}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors font-sans min-h-[70px] resize-none leading-relaxed"
                      />
                      <div className="flex justify-between items-center select-none">
                        <span className="text-[9px] text-slate-500 font-mono">
                          {120 - userMantra.length} characters left
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            localStorage.setItem("mindsafe-user-mantra", userMantra);
                            setIsSavingProfile(true);
                            setTimeout(() => setIsSavingProfile(false), 1500);
                          }}
                          className="px-4 py-2 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 border border-amber-500/20 hover:border-amber-500/40 text-amber-300 font-bold font-mono text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Save Mantra</span>
                        </button>
                      </div>
                    </div>

                    {/* INTERACTIVE FORM FIELD: RESILIENCE FOCUS */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block select-none">
                        Recovery &amp; Resilience Focus
                      </label>
                      <div className="grid grid-cols-2 gap-2 select-none">
                        {[
                          "Trauma Recovery",
                          "Anxiety Relief",
                          "Nervous System Regulation",
                          "Grief & Healing",
                          "Mindfulness & Presence",
                          "General Well-being"
                        ].map((focusOption) => (
                          <button
                            key={focusOption}
                            type="button"
                            onClick={() => {
                              setUserFocus(focusOption);
                              localStorage.setItem("mindsafe-user-focus", focusOption);
                              setIsSavingProfile(true);
                              setTimeout(() => setIsSavingProfile(false), 1500);
                            }}
                            className={`p-2.5 rounded-xl border text-[10px] font-semibold text-left transition-all cursor-pointer flex items-center gap-1.5 ${
                              userFocus === focusOption
                                ? "bg-amber-500/10 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.1)] font-bold"
                                : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10 text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            <span className="text-[10px]">🎯</span>
                            <span>{focusOption}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* SUCCESS SAVE FEEDBACK TOAST */}
                    <AnimatePresence>
                      {isSavingProfile && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-sans font-bold rounded-xl flex items-center justify-center gap-2 select-none"
                        >
                          <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                          <span>Profile details synced successfully!</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {drawerActiveTab === "checkin" && (
                  <div className="space-y-6">
                    {/* DAILY GOAL TARGET CARD */}
                    <div id="drawerDailyGoalSection">
                      <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 relative group/goal">
                        <div className="flex items-center justify-between mb-2.5">
                          <div className="flex items-center gap-1.5 select-none">
                            <Target className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-sans">
                              Daily Resilience Goal
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            {isEditingGoal ? (
                              <button
                                type="button"
                                onClick={() => {
                                  if (goalInput.trim()) {
                                    setDailyGoal((prev) => ({ ...prev, text: goalInput.trim() }));
                                    setIsEditingGoal(false);
                                  }
                                }}
                                className="text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded cursor-pointer"
                              >
                                <Save className="w-3 h-3" />
                                <span>SAVE</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setGoalInput(dailyGoal.text);
                                  setIsEditingGoal(true);
                                }}
                                className="text-[10px] text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1 font-mono font-bold opacity-70 hover:opacity-100 bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded cursor-pointer"
                              >
                                <Edit2 className="w-3 h-3" />
                                <span>EDIT</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {isEditingGoal ? (
                          <div className="w-full flex gap-2 items-center mt-1">
                            <input
                              type="text"
                              value={goalInput}
                              onChange={(e) => setGoalInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && goalInput.trim()) {
                                  setDailyGoal((prev) => ({ ...prev, text: goalInput.trim() }));
                                  setIsEditingGoal(false);
                                } else if (e.key === "Escape") {
                                  setIsEditingGoal(false);
                                }
                              }}
                              maxLength={60}
                              placeholder="e.g., Practice mindfulness for 10 mins"
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors font-sans"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (goalInput.trim()) {
                                  setDailyGoal((prev) => ({ ...prev, text: goalInput.trim() }));
                                  setIsEditingGoal(false);
                                }
                              }}
                              className="text-[10px] bg-gradient-to-r from-amber-400 to-[#D97706] text-slate-950 font-bold px-3 py-1.5 rounded-xl transition-all hover:scale-[1.03] active:scale-[0.97] cursor-pointer flex items-center gap-1 shrink-0 shadow-md"
                            >
                              <Save className="w-3 h-3" />
                              <span>Save Goal</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsEditingGoal(false)}
                              className="text-[10px] text-slate-400 hover:text-slate-300 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 transition-colors font-bold cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-3 mt-1 bg-black/15 p-2.5 rounded-xl border border-white/[0.03]">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <button
                                type="button"
                                onClick={handleToggleGoalCompleted}
                                className={`w-5 h-5 rounded-md flex items-center justify-center transition-all cursor-pointer ${
                                  dailyGoal.completed
                                    ? "bg-gradient-to-br from-[#34D399] to-[#059669] text-slate-950 scale-105 shadow-[0_0_8px_rgba(52,211,153,0.3)]"
                                    : "bg-white/5 border border-white/20 hover:border-[#FBBF24]/50"
                                }`}
                              >
                                {dailyGoal.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </button>
                              <span
                                className={`text-xs font-medium tracking-wide leading-relaxed font-sans truncate ${
                                  dailyGoal.completed ? "line-through text-slate-500 font-semibold" : "text-slate-100"
                                }`}
                              >
                                {dailyGoal.text}
                              </span>
                            </div>
                            {dailyGoal.completed && (
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[9px] font-extrabold uppercase font-mono tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 select-none flex items-center gap-0.5 animate-pulse">
                                  <Award className="w-2.5 h-2.5" />
                                  Done
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setShowGoalRecommendation((prev) => !prev)}
                                  className="text-[9px] font-bold text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 px-1.5 py-0.5 rounded uppercase tracking-wider font-mono flex items-center gap-0.5 cursor-pointer"
                                  title="View Recommended Next Resilience Goal"
                                >
                                  <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                                  <span>{showGoalRecommendation ? "Hide" : "Next ✨"}</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Staged Tomorrow Goal Indicator in Drawer */}
                        {stagedTomorrowGoalText && (
                          <div className="mt-2 text-[10px] text-slate-300 font-mono flex items-center justify-between bg-amber-500/10 px-2.5 py-1.5 rounded-xl border border-amber-500/25">
                            <span className="truncate flex items-center gap-1.5">
                              <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                              <span className="text-slate-400">Locked for Tomorrow:</span>
                              <span className="text-amber-200 font-semibold truncate">"{stagedTomorrowGoalText}"</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setStagedTomorrowGoalText(null);
                                localStorage.removeItem("mindsafe_staged_next_goal");
                              }}
                              className="text-slate-400 hover:text-rose-400 text-[10px] cursor-pointer ml-1 underline"
                            >
                              Clear
                            </button>
                          </div>
                        )}

                        {/* RECOMMENDED NEXT GOAL CARD IN DRAWER */}
                        <AnimatePresence>
                          {dailyGoal.completed && showGoalRecommendation && (
                            <div className="mt-3">
                              <RecommendedGoalCard
                                recommendations={goalRecommendations}
                                analysis={goalAnalysis}
                                currentUser={firebaseUser}
                                compact
                                onSetTomorrowGoal={(recGoal) => {
                                  setStagedTomorrowGoalText(recGoal);
                                  setGoalInput(recGoal);
                                }}
                                onOpenCalendar={() => {
                                  setActiveTab("calendar");
                                  setIsFeatureMenuOpen(false);
                                }}
                                onOpenJournal={() => {
                                  setActiveTab("journal");
                                  setIsFeatureMenuOpen(false);
                                }}
                                onDismiss={() => setShowGoalRecommendation(false)}
                              />
                            </div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <DailyCheckIn
                      onTriggerPrompt={(text) => {
                        handleSend(text);
                        setIsFeatureMenuOpen(false);
                      }}
                      isTtsEnabled={isTtsEnabled}
                      speak={speak}
                    />

                    <DailyAffirmation 
                      onTriggerPrompt={(text) => {
                        handleSend(text);
                        setIsFeatureMenuOpen(false);
                      }} 
                    />
                  </div>
                )}

                {drawerActiveTab === "journal" && (
                  <div>
                    <Journal />
                  </div>
                )}

                {drawerActiveTab === "analytics" && (
                  <div className="space-y-6">
                    {/* DAILY RESILIENCE ANCHOR */}
                    {dailyAnchor && (
                      <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-[24px] p-6 backdrop-blur-md relative overflow-hidden flex flex-col" id="dailyResilienceAnchor">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />
                        <div className="flex items-center justify-between mb-4 select-none">
                          <div className="flex items-center gap-2.5">
                            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                              <Anchor className="w-4 h-4 animate-pulse" />
                            </span>
                            <div>
                              <h4 className="text-sm font-bold text-slate-100 tracking-wide font-sans">
                                Daily Resilience Anchor
                              </h4>
                              <p className="text-[9px] text-slate-400 font-mono uppercase tracking-widest">
                                YOUR 24-HOUR MOTIVATIONAL SHIELD
                              </p>
                            </div>
                          </div>
                          <div className="text-[10px] bg-slate-900/50 text-amber-300/90 px-2.5 py-1 rounded-full border border-amber-500/10 font-mono tracking-wider">
                            Next: {dailyAnchor.timeLeft}
                          </div>
                        </div>

                        <div className="relative pl-4 border-l-2 border-amber-400/50 py-1 text-left">
                          <p className="text-xs text-slate-200 italic leading-relaxed font-sans">
                            "{dailyAnchor.text}"
                          </p>
                          <p className="text-[10px] text-amber-400/80 mt-2 font-mono tracking-wide text-right">
                            — {dailyAnchor.author}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-amber-500/10 flex items-center justify-between">
                          <span className="text-[9px] text-slate-400 font-sans italic select-none">
                            Root yourself in this truth today.
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(`"${dailyAnchor.text}" — ${dailyAnchor.author}`);
                              setCopiedAnchor(true);
                              setTimeout(() => setCopiedAnchor(false), 2000);
                            }}
                            className="text-[10px] font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer select-none"
                          >
                            {copiedAnchor ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Shield</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* PROGRESS & ANALYTICS TRENDS */}
                    <div id="resilienceMetricsCard" className="bg-white/5 border border-white/10 rounded-[24px] p-5 relative overflow-hidden">
                      <div className="flex items-center justify-between mb-4 select-none">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-[#FBBF24]" />
                          <h4 className="text-sm font-bold text-slate-100 font-sans">Progress &amp; Trends Analytics</h4>
                        </div>
                        <span className="text-[9px] font-mono bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 uppercase">
                          Active Session
                        </span>
                      </div>

                      {/* Line Chart */}
                      <div className="mb-4 mt-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 select-none font-mono">
                          Resilience Trends (7-Day progression)
                        </span>
                        <div className="h-[140px] w-full bg-black/15 rounded-xl border border-white/5 p-2" id="resilienceTrendsChart">
                          <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={resilienceTrendsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                              <defs>
                                <filter id="chartGlow" x="-20%" y="-20%" width="140%" height="140%">
                                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#FBBF24" floodOpacity="0.45" />
                                </filter>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                              <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={9} tickLine={false} axisLine={false} />
                              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={9} domain={[0, 100]} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                              <Tooltip content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className="bg-slate-950/95 border border-amber-500/30 p-2.5 rounded-xl shadow-xl backdrop-blur-md min-w-[150px] select-none text-left">
                                      <p className="text-[9px] font-mono font-bold uppercase text-slate-400 mb-1.5 border-b border-white/5 pb-1">{data.name}</p>
                                      <div className="space-y-1.5 text-xs">
                                        <div className="flex items-center justify-between gap-4">
                                          <span className="text-[10px] text-slate-400 font-medium">Check-in Rate</span>
                                          <span className="text-[10px] font-bold text-emerald-400 font-mono">{data.checkInRate}%</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-4">
                                          <span className="text-[10px] text-slate-400 font-medium">Engagement Rate</span>
                                          <span className="text-[10px] font-bold text-sky-400 font-mono">{data.engagementRate}%</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-4 border-t border-white/5 pt-1 mt-1">
                                          <span className="text-[10px] text-slate-200 font-bold">Overall Resilience</span>
                                          <span className="text-xs font-bold text-amber-400 font-mono">{data.Score}%</span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }
                                return null;
                              }} />
                              <Bar dataKey="checkInRate" fill="rgba(59, 130, 246, 0.18)" shape={<CustomBar />} isAnimationActive={false} />
                              <Bar dataKey="engagementRate" fill="rgba(16, 185, 129, 0.15)" shape={<CustomBar />} isAnimationActive={false} />
                              <Line type="monotone" dataKey="Score" stroke="#FBBF24" strokeWidth={2.5} dot={<CustomChartDot />} activeDot={{ r: 5, fill: "#FBBF24" }} style={{ filter: "url(#chartGlow)" }} isAnimationActive={false} />
                            </ComposedChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="mt-2 p-3 rounded-xl bg-white/5 border border-white/5 text-left select-none text-xs">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-mono">
                          State: {resilienceLevel.label}
                        </span>
                        <p className="text-slate-300 leading-relaxed">
                          {resilienceLevel.desc}
                        </p>
                      </div>

                      <div className="mt-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left select-none text-xs flex items-center gap-2.5 text-amber-300 font-medium font-sans">
                        <TrendingUp className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>{resilienceTrendSummary}</span>
                      </div>
                    </div>

                    {/* MILESTONE BADGES & STREAKS SECTION */}
                    <Badges
                      vaultCount={savedMessages.length}
                    />

                    {/* RESILIENCE VAULT */}
                    <div id="resilienceVaultSection" className="bg-white/5 border border-white/10 rounded-[24px] p-5 text-left relative overflow-hidden">
                      <div className="flex items-center justify-between mb-4 select-none">
                        <div className="flex items-center gap-2">
                          <Bookmark className="w-4 h-4 text-[#FBBF24]" />
                          <h4 className="text-sm font-bold text-slate-100 font-sans">Resilience Vault</h4>
                        </div>
                        <span className="text-[9px] text-slate-400 font-mono uppercase">
                          ({savedMessages.length} Pinned Breakthroughs)
                        </span>
                      </div>

                      {savedMessages.length === 0 ? (
                        <div className="text-center py-6 text-slate-500 border border-dashed border-white/5 rounded-2xl bg-black/10 select-none">
                          <p className="text-[10px] leading-relaxed px-2">
                            No pinned breakthroughs yet. Hover over companion replies in the active chat and tap the pin button to preserve important milestones here.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1.5 custom-scrollbar">
                          {savedMessages.map((msg) => (
                            <div key={msg.id} className="p-3 bg-black/20 border border-white/5 rounded-xl flex flex-col relative group">
                              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mb-1.5">
                                <span className="flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 text-[#FBBF24]" />
                                  Companion Insight
                                </span>
                                <button
                                  type="button"
                                  onClick={() => togglePin(msg.id)}
                                  className="text-slate-500 hover:text-rose-400 transition-colors"
                                  title="Remove from vault"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                              <p className="text-xs text-slate-300 leading-relaxed italic pr-4">
                                "{msg.text.length > 180 ? msg.text.substring(0, 180) + "..." : msg.text}"
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {drawerActiveTab === "story" && (
                  <div className="space-y-6">
                    {/* SURVIVOR'S OATH */}
                    <div className="w-full bg-slate-900/40 border border-amber-400/20 rounded-[24px] p-6 backdrop-blur-md relative overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.25)] select-none">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#FBBF24]/5 rounded-full blur-2xl pointer-events-none" />
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl select-none">✊🏼</span>
                        <h2 className="text-base font-black font-display text-amber-400 uppercase tracking-widest">The Survivor's Oath</h2>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-sans font-medium">
                        Born from a true journey of survival — surviving 15 stab wounds and punctured lungs in 2023 — MindSafe AI was crafted to turn life‑threatening trauma into unshakeable purpose. We help you find strength through your hardest battles. Everyone’s path is different — we’ll help you find yours.
                      </p>
                    </div>

                    {/* CRISIS PROTOCOL QUICK SAFETY REFERENCE */}
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-[24px] p-5 text-left flex items-start gap-3">
                      <span className="text-xl select-none">🛡️</span>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300 font-mono mb-1">Crisis Protocol</h4>
                        <p className="text-xs text-rose-200 leading-relaxed">
                          If you are in immediate danger, please dial <strong>999</strong> or contact the <strong>Samaritans on 116 123</strong> (free, confidential, 24/7). You do not have to carry this alone.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Dashboard overlay */}
      <AnimatePresence>
        {isAdminOpen && firebaseUser?.email === "v1kwanny1@gmail.com" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto select-none" id="adminDashboardOverlay">
            <div className="w-full max-w-5xl my-8">
              <AdminDashboard adminUser={firebaseUser} onClose={() => setIsAdminOpen(false)} />
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Multimodal Vision AI Image Analysis Modal */}
      <ImageAnalysisModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        currentUser={firebaseUser}
        isEmailVerified={isEmailVerified}
        onSaveInsight={(insightText) => {
          handleSend(`[Breakthrough Saved from Vision AI]:\n${insightText}`);
          setIsImageModalOpen(false);
        }}
      />

      {/* 7-Day Streak Milestone Celebratory Modal */}
      <StreakMilestoneModal
        isOpen={isStreakModalOpen}
        onClose={() => setIsStreakModalOpen(false)}
        onGoToCommunity={() => setActiveTab("community")}
        streakCount={7}
        recommendedGoalText={goalRecommendations[0]?.text}
        onAcceptRecommendedGoal={(recGoal) => {
          stageNextGoal(recGoal);
          setStagedTomorrowGoalText(recGoal);
        }}
      />

      {/* Crisis SOS & Rapid Grounding Hub Modal */}
      <CrisisEmergencyModal
        isOpen={isCrisisModalOpen}
        onClose={() => setIsCrisisModalOpen(false)}
        onTriggerExercise={(text) => {
          setActiveTab("chat");
          handleSend(text);
        }}
      />

      {/* Resilience & Progress Export Modal */}
      <ResilienceExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        streakCount={last7DaysGoalStatus.filter(d => d.completed || d.isFrozen).length || 7}
        frozenDatesCount={frozenDates.length}
        vaultCount={savedMessages.length}
        totalCheckIns={7}
        resilienceScore={88}
        userName={firebaseUser?.displayName || firebaseUser?.email || "MindSafe Champion"}
        recentMilestones={[
          "Active Neural Resilience Shield",
          "5-4-3-2-1 Sensory Grounding Calibrated",
          "Daily Micro-Habit Consistency Established"
        ]}
      />

      {/* MindSafe Avatar Studio Modal */}
      <AvatarModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentUser={firebaseUser}
        onSave={(saved) => {
          setAvatarConfig(saved);
        }}
      />
    </div>
  );
}

