import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  limit, 
  serverTimestamp,
  doc,
  setDoc
} from "firebase/firestore";
import { db } from "../firebase";
import { 
  MessageSquare, 
  Crown, 
  Users, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  Heart, 
  Lock, 
  CheckCircle2, 
  Search, 
  Flame, 
  Info, 
  Mail, 
  Award,
  Zap,
  Bot,
  User
} from "lucide-react";
import { AvatarDisplay } from "./AvatarDisplay";
import { AvatarConfig, DEFAULT_AVATAR } from "../types/avatar";
import { safeLocalStorage } from "../utils/safeStorage";

interface CommunityMessage {
  id: string;
  text: string;
  senderName: string;
  senderEmail: string;
  senderUid: string;
  isElite: boolean;
  isBot?: boolean;
  avatarConfig?: AvatarConfig;
  reactions?: Record<string, number>;
  createdAt: number;
  room: "standard" | "vip";
}

interface CommunityChatProps {
  currentUser: any;
  isEliteUser: boolean;
  isEmailVerified?: boolean;
  onUpgradeToElite: () => void;
  onOpenAuthGate: () => void;
}

export default function CommunityChat({ 
  currentUser, 
  isEliteUser, 
  isEmailVerified = true,
  onUpgradeToElite,
  onOpenAuthGate
}: CommunityChatProps) {
  const [activeRoom, setActiveRoom] = useState<"standard" | "vip">("standard");
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Default seed messages for rich immediate experience if Firestore room is empty
  const defaultStandardMessages: CommunityMessage[] = [
    {
      id: "seed-std-1",
      text: "Welcome to the Active Member Chat Room! 🌟 Remember to celebrate every small resilience win today.",
      senderName: "MindSafe Bot",
      senderEmail: "bot@mindsafe.ai",
      senderUid: "bot-mindsafe",
      isElite: true,
      isBot: true,
      reactions: { "❤️": 12, "💪": 8, "🌟": 15 },
      createdAt: Date.now() - 1000 * 60 * 60 * 2,
      room: "standard"
    },
    {
      id: "seed-std-2",
      text: "Just completed my morning 10-minute deep breathing exercise. Feeling focused and ready for the day ahead!",
      senderName: "Sarah K.",
      senderEmail: "sarah@example.com",
      senderUid: "user-sarah",
      isElite: false,
      reactions: { "❤️": 5, "🙏": 4 },
      createdAt: Date.now() - 1000 * 60 * 30,
      room: "standard"
    },
    {
      id: "seed-std-3",
      text: "Has anyone tried the daily resilience anchor tool? It really helped ground my anxiety yesterday.",
      senderName: "Alex M.",
      senderEmail: "alex@example.com",
      senderUid: "user-alex",
      isElite: false,
      reactions: { "💪": 7, "❤️": 3 },
      createdAt: Date.now() - 1000 * 60 * 10,
      room: "standard"
    }
  ];

  const defaultVipMessages: CommunityMessage[] = [
    {
      id: "seed-vip-1",
      text: "👑 Welcome to the MindSafe VIP Lounge! Elite members receive priority counselor guidance and weekly masterclasses.",
      senderName: "MindSafe VIP Mentor",
      senderEmail: "vip-bot@mindsafe.ai",
      senderUid: "bot-vip-mindsafe",
      isElite: true,
      isBot: true,
      reactions: { "👑": 18, "🔥": 12, "🚀": 14 },
      createdAt: Date.now() - 1000 * 60 * 60 * 5,
      room: "vip"
    },
    {
      id: "seed-vip-2",
      text: "The high-performance stress management framework in session #4 completely transformed my focus during board meetings.",
      senderName: "David V. (Elite Member)",
      senderEmail: "david@example.com",
      senderUid: "user-david",
      isElite: true,
      reactions: { "🔥": 9, "🌟": 6 },
      createdAt: Date.now() - 1000 * 60 * 45,
      room: "vip"
    }
  ];

  // Subscribe to real-time messages from Firestore based on active room
  useEffect(() => {
    const colName = activeRoom === "standard" ? "community_chat_standard" : "community_chat_vip";
    const q = query(
      collection(db, colName),
      orderBy("createdAt", "asc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: CommunityMessage[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        fetched.push({
          id: docSnap.id,
          text: data.text || "",
          senderName: data.senderName || "Member",
          senderEmail: data.senderEmail || "",
          senderUid: data.senderUid || "",
          isElite: !!data.isElite,
          isBot: !!data.isBot,
          reactions: data.reactions || {},
          createdAt: data.createdAt || Date.now(),
          room: activeRoom
        });
      });

      if (fetched.length > 0) {
        setMessages(fetched);
      } else {
        // Fallback seed messages if database collection is initial
        setMessages(activeRoom === "standard" ? defaultStandardMessages : defaultVipMessages);
      }
    }, (error) => {
      console.warn("Firestore listener fallback to seed messages:", error);
      setMessages(activeRoom === "standard" ? defaultStandardMessages : defaultVipMessages);
    });

    return () => unsubscribe();
  }, [activeRoom]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (!currentUser) {
      onOpenAuthGate();
      return;
    }

    if (!isEmailVerified) {
      onOpenAuthGate();
      return;
    }

    if (activeRoom === "vip" && !isEliteUser) {
      setShowUpgradeModal(true);
      return;
    }

    const textToSend = inputText.trim();
    setInputText("");
    setLoading(true);

    let userAvatarConfig: AvatarConfig = DEFAULT_AVATAR;
    try {
      const saved = safeLocalStorage.getItem("mindsafe_custom_avatar_config");
      if (saved) userAvatarConfig = JSON.parse(saved);
    } catch {}

    const newMessageData = {
      text: textToSend,
      senderName: currentUser.displayName || currentUser.email.split("@")[0] || "Warrior",
      senderEmail: currentUser.email || "",
      senderUid: currentUser.uid || "anon",
      isElite: isEliteUser,
      isBot: false,
      avatarConfig: userAvatarConfig,
      reactions: {},
      createdAt: Date.now(),
      room: activeRoom
    };

    try {
      const colName = activeRoom === "standard" ? "community_chat_standard" : "community_chat_vip";
      await addDoc(collection(db, colName), newMessageData);

      // Trigger automatic AI encouragement bot reply after 1.5 seconds if message sounds like seeking support
      if (textToSend.toLowerCase().includes("help") || textToSend.toLowerCase().includes("anxious") || textToSend.toLowerCase().includes("win") || textToSend.toLowerCase().includes("today")) {
        setTimeout(async () => {
          const botReply = {
            text: `Great post, ${newMessageData.senderName}! Keep going strong 💪.`,
            senderName: activeRoom === "vip" ? "MindSafe VIP Counselor" : "MindSafe Support Bot",
            senderEmail: "support@mindsafe.ai",
            senderUid: "bot-mindsafe-auto",
            isElite: true,
            isBot: true,
            reactions: { "❤️": 1, "🙏": 1 },
            createdAt: Date.now(),
            room: activeRoom
          };
          try {
            await addDoc(collection(db, colName), botReply);
          } catch (err) {
            console.error("Bot reply failed:", err);
          }
        }, 1500);
      }
    } catch (err) {
      console.error("Failed to post message to Firestore:", err);
      // Local optimistic append
      setMessages((prev) => [
        ...prev,
        { ...newMessageData, id: `local-${Date.now()}` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleReaction = React.useCallback(async (msgId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === msgId) {
          const currentCount = m.reactions?.[emoji] || 0;
          return {
            ...m,
            reactions: {
              ...m.reactions,
              [emoji]: currentCount + 1
            }
          };
        }
        return m;
      })
    );
  }, []);

  const handleConfirmUpgrade = React.useCallback(() => {
    onUpgradeToElite();
    setShowUpgradeModal(false);
    try {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch {
      // safe fallback
    }
  }, [onUpgradeToElite]);

  const filteredMessages = React.useMemo(() => {
    if (!searchQuery.trim()) return messages;
    const q = searchQuery.toLowerCase().trim();
    return messages.filter((m) =>
      m.text.toLowerCase().includes(q) ||
      m.senderName.toLowerCase().includes(q)
    );
  }, [messages, searchQuery]);

  return (
    <div className="w-full flex flex-col gap-6 text-left select-none">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-[28px] bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-white/10 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="p-2 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
                <Users className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                MINDSAFE RESILIENCE COMMUNITY
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight">
              Member Chat Rooms &amp; VIP Lounge
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
              Connect with fellow warriors, share daily progress, and access exclusive MindSafe Elite counselor support threads.
            </p>
          </div>

          {/* Account & Subscription Status Pill */}
          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-3 shrink-0">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-bold text-slate-950 text-sm font-mono shadow">
                  {currentUser.displayName?.[0] || currentUser.email?.[0] || "U"}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">
                      {currentUser.displayName || currentUser.email.split("@")[0]}
                    </span>
                    {isEliteUser ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-[9px] font-bold font-mono text-amber-300 flex items-center gap-1">
                        <Crown className="w-3 h-3 text-amber-400" /> VIP Elite
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-bold font-mono text-emerald-300">
                        Standard Member
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                    {currentUser.email}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-slate-200 block">Guest Mode</span>
                  <button
                    type="button"
                    onClick={onOpenAuthGate}
                    className="text-[10px] text-amber-400 hover:underline font-mono font-bold cursor-pointer"
                  >
                    Create Account / Sign In →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Room Navigation Switcher Tabs */}
        <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 p-1 bg-black/40 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setActiveRoom("standard")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer font-sans ${
                activeRoom === "standard"
                  ? "bg-amber-400 text-slate-950 shadow-[0_0_12px_rgba(251,191,36,0.3)]"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Active Member Chat Room</span>
              <span className="px-1.5 py-0.5 rounded bg-black/20 text-[9px] font-mono">
                Standard
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!isEliteUser) {
                  setShowUpgradeModal(true);
                } else {
                  setActiveRoom("vip");
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer font-sans ${
                activeRoom === "vip"
                  ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.4)]"
                  : "text-amber-300 hover:text-amber-200 hover:bg-amber-400/10"
              }`}
            >
              <Crown className="w-4 h-4 text-amber-400" />
              <span>VIP Elite Lounge</span>
              {!isEliteUser ? (
                <Lock className="w-3.5 h-3.5 text-amber-400 ml-1" />
              ) : (
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-[9px] font-mono text-slate-950 font-bold">
                  Unlocked
                </span>
              )}
            </button>
          </div>

          {/* Search messages filter */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search chat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-black/30 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400/40 w-44 font-sans"
            />
          </div>
        </div>
      </div>

      {/* VIP LOCKED PREVIEW BANNER IF ON STANDARD SUBSCRIPTION */}
      {activeRoom === "vip" && !isEliteUser && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-600/15 to-purple-500/10 border border-amber-400/30 backdrop-blur-md relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-300 shrink-0">
              <Lock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-extrabold text-white font-display">
                  VIP Elite Chat Room Locked
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-bold font-mono">
                  ELITE ONLY
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                Upgrade your subscription to unlock high-priority counselor threads, exclusive audio exercises, and 1-on-1 expert Q&amp;A sessions in the VIP Chat Room.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleConfirmUpgrade}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(251,191,36,0.35)] hover:scale-105 transition-all cursor-pointer shrink-0 flex items-center gap-2 font-mono"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>Unlock VIP Membership ($9.99/mo)</span>
          </button>
        </motion.div>
      )}

      {/* MAIN CHAT DISPLAY */}
      {(activeRoom === "standard" || isEliteUser) && (
        <div className="p-6 rounded-[28px] bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-col h-[520px] relative overflow-hidden shadow-xl">
          {/* Room Subheader */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${activeRoom === "vip" ? "bg-amber-400 animate-ping" : "bg-emerald-400 animate-pulse"}`} />
              <span className="text-xs font-bold text-slate-200 font-sans">
                {activeRoom === "vip" ? "👑 MindSafe VIP Elite Lounge" : "💬 Active Member Discussion"}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                ({filteredMessages.length} messages)
              </span>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Encrypted Member Hub</span>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-white/10">
            {filteredMessages.map((msg) => {
              const isCurrentUser = currentUser && msg.senderUid === currentUser.uid;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    {!msg.isBot && (
                      <AvatarDisplay
                        config={msg.avatarConfig || DEFAULT_AVATAR}
                        size={18}
                        showAura={false}
                        showPet={false}
                        animated={false}
                      />
                    )}
                    <span className="text-[10px] font-bold text-slate-300 font-sans">
                      {msg.senderName}
                    </span>
                    {msg.isBot && (
                      <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[8px] font-mono font-bold flex items-center gap-0.5 border border-purple-500/30">
                        <Bot className="w-2.5 h-2.5" /> MindSafe Bot
                      </span>
                    )}
                    {msg.isElite && !msg.isBot && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 text-[8px] font-mono font-bold flex items-center gap-0.5 border border-amber-400/30">
                        <Crown className="w-2.5 h-2.5 text-amber-400" /> VIP
                      </span>
                    )}
                    <span className="text-[9px] text-slate-500 font-mono">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <div
                    className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed font-sans relative ${
                      msg.isBot
                        ? "bg-gradient-to-r from-purple-900/40 via-purple-800/30 to-slate-900 border border-purple-500/30 text-purple-100 shadow-md"
                        : isCurrentUser
                        ? "bg-amber-400 text-slate-950 font-medium rounded-tr-none shadow-[0_2px_12px_rgba(251,191,36,0.2)]"
                        : msg.isElite
                        ? "bg-slate-800/90 border border-amber-400/30 text-slate-100 rounded-tl-none"
                        : "bg-slate-800/60 border border-white/10 text-slate-200 rounded-tl-none"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* Reactions Bar */}
                    <div className="mt-2 pt-2 border-t border-black/10 flex items-center gap-1.5 flex-wrap">
                      {["❤️", "🙏", "💪", "🌟", "🔥"].map((emoji) => {
                        const count = msg.reactions?.[emoji] || 0;
                        return (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => handleToggleReaction(msg.id, emoji)}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-all ${
                              count > 0
                                ? "bg-black/20 border border-white/20 text-white font-bold"
                                : "bg-black/10 hover:bg-black/20 text-slate-400 border border-transparent"
                            }`}
                          >
                            <span>{emoji}</span>
                            {count > 0 && <span>{count}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Email Verification Alert Banner in Chat */}
          {currentUser && !isEmailVerified && (
            <div className="mt-3 p-3 rounded-xl bg-amber-950/60 border border-amber-400/30 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-bold">⚠️</span>
                <span className="text-amber-200 text-[11px] font-mono">
                  Email verification required to send messages to the community.
                </span>
              </div>
              <button
                type="button"
                onClick={onOpenAuthGate}
                className="px-3 py-1 rounded-lg bg-amber-400 text-slate-950 text-[10px] font-bold font-mono hover:bg-amber-300 transition-all cursor-pointer shrink-0"
              >
                Verify Email
              </button>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
            <input
              type="text"
              placeholder={
                !currentUser
                  ? "Sign in to join the conversation..."
                  : activeRoom === "vip"
                  ? "Post to VIP Elite lounge..."
                  : "Type your message to members..."
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={loading}
              className="flex-1 bg-black/40 border border-white/10 focus:border-amber-400/40 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none transition-all font-sans"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer font-mono shadow-[0_0_12px_rgba(251,191,36,0.3)]"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* UPGRADE MODAL */}
      <AnimatePresence>
        {showUpgradeModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-slate-900 border border-amber-400/30 rounded-[28px] p-6 sm:p-8 text-left relative shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                  <Crown className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white font-display">
                    MindSafe Elite Subscription
                  </h3>
                  <span className="text-[10px] text-amber-400 font-mono font-bold uppercase tracking-wider block">
                    VIP Lounge &amp; Master Coaching Access
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-6 bg-black/30 p-4 rounded-2xl border border-white/5 text-xs text-slate-300 leading-relaxed font-sans">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Unlimited VIP Elite Chat Room access</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Priority AI Counselor &amp; Group Threads</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Exclusive audio meditation &amp; resilience tools</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Golden VIP Badge on all community posts</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUpgradeModal(false)}
                  className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-bold cursor-pointer transition-all"
                >
                  Maybe Later
                </button>

                <button
                  type="button"
                  onClick={handleConfirmUpgrade}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer transition-all font-mono shadow-[0_0_15px_rgba(251,191,36,0.35)] flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Activate Elite ($9.99/mo)</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
