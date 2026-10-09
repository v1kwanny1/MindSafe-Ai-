import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import {
  User,
  Sparkles,
  Shuffle,
  Save,
  Check,
  Download,
  Palette,
  Heart,
  Shield,
  Crown,
  Eye,
  Smile,
  Shirt,
  Headphones,
  Flame,
  Volume2,
  X,
  RefreshCw,
  Award,
  BookOpen,
} from "lucide-react";
import {
  AvatarConfig,
  DEFAULT_AVATAR,
  AVATAR_PRESETS,
} from "../types/avatar";
import { AvatarDisplay } from "./AvatarDisplay";
import { safeLocalStorage } from "../utils/safeStorage";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

interface AvatarStudioProps {
  currentUser?: any;
  initialConfig?: AvatarConfig;
  onSave?: (config: AvatarConfig) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const AvatarStudio: React.FC<AvatarStudioProps> = ({
  currentUser,
  initialConfig,
  onSave,
  onClose,
  isModal = false,
}) => {
  // Load saved config or fallback
  const [config, setConfig] = useState<AvatarConfig>(() => {
    if (initialConfig) return initialConfig;
    try {
      const saved = safeLocalStorage.getItem("mindsafe_custom_avatar_config");
      if (saved) {
        return { ...DEFAULT_AVATAR, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn("Could not load avatar config:", e);
    }
    return { ...DEFAULT_AVATAR, avatarName: currentUser?.displayName || "MindSafe Warrior" };
  });

  const [activeTab, setActiveTab] = useState<
    "presets" | "face" | "hair" | "outfit" | "accessories" | "pet" | "aura" | "identity"
  >("presets");

  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewScale, setPreviewScale] = useState<"standard" | "large">("standard");

  // Audio tone feedback synthesizer
  const playSoundTone = (freq: number = 528, type: OscillatorType = "sine") => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio fallback silent
    }
  };

  // Preset Skin Palettes
  const skinTones = [
    { name: "Deep Espresso", color: "#3d2314" },
    { name: "Rich Ebony", color: "#543825" },
    { name: "Caramel Bronze", color: "#8d5524" },
    { name: "Warm Chestnut", color: "#c68642" },
    { name: "Golden Olive", color: "#e0ac69" },
    { name: "Soft Honey", color: "#f5d0a9" },
    { name: "Fair Peach", color: "#ffdbac" },
    { name: "Celestial Jade", color: "#6ee7b7" },
    { name: "Cosmic Indigo", color: "#818cf8" },
  ];

  // Hair Color Swatches
  const hairColors = [
    { name: "Obsidian Black", color: "#0f172a" },
    { name: "Deep Chestnut", color: "#451a03" },
    { name: "Espresso Brown", color: "#78350f" },
    { name: "Golden Amber", color: "#d97706" },
    { name: "Platinum Silver", color: "#cbd5e1" },
    { name: "Rose Petal", color: "#f472b6" },
    { name: "Emerald Sage", color: "#059669" },
    { name: "Cosmic Violet", color: "#9333ea" },
    { name: "Starlight Cyan", color: "#06b6d4" },
  ];

  // Outfit Primary Swatches
  const outfitColors = [
    { name: "Midnight Navy", color: "#0f172a" },
    { name: "Deep Slate", color: "#1e293b" },
    { name: "MindSafe Amber", color: "#b45309" },
    { name: "Zen Emerald", color: "#064e3b" },
    { name: "Royal Purple", color: "#4c1d95" },
    { name: "Ruby Crimson", color: "#881337" },
    { name: "Charcoal Black", color: "#18181b" },
    { name: "Pure Sand", color: "#d4d4d8" },
  ];

  // Outfit Accent Swatches
  const accentColors = [
    { name: "Golden Resilience", color: "#fbbf24" },
    { name: "Emerald Healing", color: "#34d399" },
    { name: "Sky Calm", color: "#38bdf8" },
    { name: "Lotus Rose", color: "#f472b6" },
    { name: "Starlight Purple", color: "#c084fc" },
    { name: "Pure White", color: "#ffffff" },
  ];

  // Eye Color Swatches
  const eyeColors = [
    { name: "Deep Espresso", color: "#291507" },
    { name: "Golden Hazel", color: "#854d0e" },
    { name: "Emerald Green", color: "#047857" },
    { name: "Ocean Blue", color: "#0284c7" },
    { name: "Amethyst Violet", color: "#7e22ce" },
    { name: "Pure Amber", color: "#d97706" },
  ];

  const handleUpdate = <K extends keyof AvatarConfig>(key: K, value: AvatarConfig[K]) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
      updatedAt: Date.now(),
    }));
    setIsSaved(false);
    playSoundTone(440 + Math.random() * 200, "sine");
  };

  const applyPreset = (preset: (typeof AVATAR_PRESETS)[0]) => {
    setConfig((prev) => ({
      ...prev,
      ...preset.config,
      updatedAt: Date.now(),
    }));
    setIsSaved(false);
    playSoundTone(587, "triangle");
  };

  const handleRandomize = () => {
    const archetypes: AvatarConfig["archetype"][] = [
      "warrior",
      "zen_monk",
      "cosmic_sage",
      "botanical_spirit",
      "modern_hero",
      "nanny_frog_kin",
    ];
    const hairStyles: AvatarConfig["hairStyle"][] = [
      "short_crop",
      "fade_waves",
      "braids_locks",
      "flowing_locks",
      "topknot",
      "lotus_crown",
      "focus_headband",
      "calm_beanie",
      "zen_shaved",
    ];
    const eyeStyles: AvatarConfig["eyeStyle"][] = [
      "serene",
      "focused",
      "joyful",
      "meditative",
      "compassionate",
      "sparkling",
    ];
    const expressions: AvatarConfig["expression"][] = [
      "gentle_smile",
      "calm_focus",
      "joyful_grin",
      "serene_peace",
    ];
    const outfits: AvatarConfig["outfit"][] = [
      "mindsafe_hoodie",
      "zen_robes",
      "resilience_armor",
      "cozy_sweater",
      "kimono_harmony",
      "nature_cloak",
    ];
    const accessories: AvatarConfig["accessory"][] = [
      "none",
      "headphones",
      "mala_beads",
      "crystal_amulet",
      "halo_aura",
      "mindsafe_bandana",
    ];
    const pets: AvatarConfig["shoulderPet"][] = [
      "nanny_frog",
      "zen_cat",
      "guardian_pup",
      "hope_butterfly",
      "songbird",
      "none",
    ];
    const auras: AvatarConfig["aura"][] = [
      "golden_radiance",
      "cosmic_starlight",
      "emerald_zen",
      "sunset_calm",
      "lotus_ripple",
      "none",
    ];
    const backgrounds: AvatarConfig["backgroundTheme"][] = [
      "dark_slate",
      "amber_sunrise",
      "twilight_lavender",
      "emerald_grove",
      "celestial_nebula",
      "pure_zen_water",
    ];

    const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

    const randomSkin = pick(skinTones).color;
    const randomHair = pick(hairColors).color;
    const randomOutfitColor = pick(outfitColors).color;
    const randomAccentColor = pick(accentColors).color;
    const randomEyeColor = pick(eyeColors).color;

    setConfig((prev) => ({
      ...prev,
      archetype: pick(archetypes),
      skinTone: randomSkin,
      hairStyle: pick(hairStyles),
      hairColor: randomHair,
      eyeStyle: pick(eyeStyles),
      eyeColor: randomEyeColor,
      expression: pick(expressions),
      outfit: pick(outfits),
      outfitColor: randomOutfitColor,
      outfitSecondaryColor: randomAccentColor,
      accessory: pick(accessories),
      shoulderPet: pick(pets),
      aura: pick(auras),
      backgroundTheme: pick(backgrounds),
      updatedAt: Date.now(),
    }));

    setIsSaved(false);
    playSoundTone(659, "sawtooth");
  };

  const handleSaveAvatar = async () => {
    setIsSaving(true);
    try {
      const finalConfig = {
        ...config,
        updatedAt: Date.now(),
      };

      // 1. Save to local storage
      safeLocalStorage.setItem(
        "mindsafe_custom_avatar_config",
        JSON.stringify(finalConfig)
      );

      // 2. Dispatch custom event so all components in App.tsx update instantaneously
      window.dispatchEvent(
        new CustomEvent("mindsafe-avatar-updated", { detail: finalConfig })
      );

      // 3. Sync to Firestore if user logged in
      if (currentUser?.uid) {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          await setDoc(
            userDocRef,
            {
              avatarConfig: finalConfig,
              updatedAt: Date.now(),
            },
            { merge: true }
          );
        } catch (e) {
          console.warn("Could not sync avatar to Firestore:", e);
        }
      }

      setIsSaved(true);
      if (onSave) onSave(finalConfig);

      // Confetti celebration & harmonic chime
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#fbbf24", "#34d399", "#38bdf8", "#c084fc"],
      });

      playSoundTone(528, "sine");
      setTimeout(() => playSoundTone(660, "sine"), 120);
      setTimeout(() => playSoundTone(792, "sine"), 240);

      setTimeout(() => {
        setIsSaved(false);
      }, 3000);
    } catch (err) {
      console.error("Save avatar error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className={`w-full bg-slate-900/90 border border-amber-400/20 rounded-[28px] p-4 sm:p-7 backdrop-blur-xl shadow-2xl text-left relative overflow-hidden flex flex-col gap-6 ${
        isModal ? "max-h-[90vh] overflow-y-auto" : ""
      }`}
      id="mindsafeAvatarStudio"
    >
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400">
              <User className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
              MINDSAFE AVATAR STUDIO
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight flex items-center gap-2">
            <span>Craft Your MindSafe Avatar</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Personalize your identity, companion pet, attire, and resilience mantra across MindSafe.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleRandomize}
            className="px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer"
            title="Randomize Avatar Sparks"
            id="randomizeAvatarBtn"
          >
            <Shuffle className="w-4 h-4 text-amber-400" />
            <span>Randomize</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAvatar}
            disabled={isSaving}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg ${
              isSaved
                ? "bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                : "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:shadow-[0_0_20px_rgba(251,191,36,0.4)] hover:scale-105 active:scale-100"
            }`}
            id="saveAvatarBtn"
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Equipped &amp; Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isSaving ? "Equipping..." : "Equip & Save Avatar"}</span>
              </>
            )}
          </button>

          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Close Avatar Studio"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Studio Grid: Left Live Preview & Right Customizer Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* LEFT COLUMN: LIVE AVATAR PREVIEW CARD */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-inner text-center">
            {/* Background Aura particles */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/20 to-slate-950/80 pointer-events-none" />

            {/* Avatar Preview */}
            <motion.div
              key={`${config.archetype}-${config.hairStyle}-${config.outfit}-${config.shoulderPet}`}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="relative my-4"
            >
              <AvatarDisplay
                config={config}
                size={previewScale === "large" ? 240 : 190}
                showAura={true}
                showPet={true}
                animated={true}
              />

              {/* Archetype Badge Pill */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-900 border border-amber-400/40 text-[10px] font-bold font-mono text-amber-300 shadow-md whitespace-nowrap">
                {config.archetype.replace("_", " ").toUpperCase()}
              </div>
            </motion.div>

            {/* Name, Title & Mantra Card */}
            <div className="mt-4 w-full space-y-1.5 border-t border-white/10 pt-4">
              <h3 className="text-lg font-bold text-white font-display">
                {config.avatarName || "MindSafe Warrior"}
              </h3>
              <p className="text-xs font-semibold text-amber-400 font-mono">
                {config.title || "Guardian of Inner Peace"}
              </p>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-[11px] text-slate-300 italic max-w-sm mx-auto leading-relaxed">
                "{config.mantra || "Safe minds, better lives."}"
              </div>
            </div>

            {/* Quick Toggle preview size */}
            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewScale(previewScale === "standard" ? "large" : "standard")}
                className="text-[10px] font-mono text-slate-400 hover:text-amber-300 underline cursor-pointer"
              >
                {previewScale === "standard" ? "🔍 Expand Preview Size" : "🔍 Standard Size"}
              </button>
            </div>
          </div>

          {/* Quick Presets Carousel */}
          <div className="bg-slate-950/40 border border-white/10 rounded-2xl p-4 space-y-2.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              MindSafe One-Click Archetypes
            </span>
            <div className="grid grid-cols-2 gap-2">
              {AVATAR_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="p-2.5 rounded-xl border text-left transition-all cursor-pointer bg-white/5 border-white/10 hover:border-amber-400/50 hover:bg-amber-400/5 flex flex-col justify-between group"
                >
                  <span className="text-xs font-bold text-slate-200 group-hover:text-amber-300 block">
                    {preset.name}
                  </span>
                  <span className="text-[9px] text-slate-400 line-clamp-1 mt-0.5">
                    {preset.description}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TABBED CUSTOMIZATION CONTROLS */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-white/10 scrollbar-none">
            {[
              { id: "presets", label: "Archetype", icon: Crown },
              { id: "face", label: "Skin & Eyes", icon: Eye },
              { id: "hair", label: "Hair & Head", icon: Palette },
              { id: "outfit", label: "Attire", icon: Shirt },
              { id: "accessories", label: "Gear", icon: Headphones },
              { id: "pet", label: "Shoulder Pet", icon: Heart },
              { id: "aura", label: "Aura & Scene", icon: Sparkles },
              { id: "identity", label: "Identity", icon: BookOpen },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    playSoundTone(520, "sine");
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-amber-400 text-slate-950 shadow-md scale-105 font-mono"
                      : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB CONTENT PANELS */}
          <div className="bg-slate-950/50 border border-white/10 rounded-2xl p-5 space-y-5">
            {/* 1. ARCHETYPE SELECTION */}
            {activeTab === "presets" && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  Choose Your Core Spiritual Archetype
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      id: "modern_hero",
                      title: "MindSafe Hero",
                      desc: "Equipped with tactical focus headphones & protective resilience hoodie.",
                      icon: "🎧",
                    },
                    {
                      id: "nanny_frog_kin",
                      title: "Nanny Frog's Kin",
                      desc: "Guided by soft maternal wisdom, gentle pond lilies & green aura.",
                      icon: "🐸",
                    },
                    {
                      id: "zen_monk",
                      title: "Stillness Monk",
                      desc: "Practicing diaphragmatic breath, sacred mala beads & mindful stillness.",
                      icon: "🧘",
                    },
                    {
                      id: "cosmic_sage",
                      title: "Cosmic Sage",
                      desc: "Starlight wisdom, celestial nebula aura & unshakeable perspective.",
                      icon: "✨",
                    },
                    {
                      id: "botanical_spirit",
                      title: "Botanical Healer",
                      desc: "Rooted in nature, fresh morning dew, and organic calm cloaks.",
                      icon: "🌿",
                    },
                    {
                      id: "warrior",
                      title: "Resilience Guard",
                      desc: "Battle-tested, wearing reinforced armor against negative spirals.",
                      icon: "🛡️",
                    },
                  ].map((arch) => (
                    <button
                      key={arch.id}
                      type="button"
                      onClick={() => handleUpdate("archetype", arch.id as any)}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                        config.archetype === arch.id
                          ? "bg-amber-400/10 border-amber-400 text-white ring-1 ring-amber-400/50 shadow-md"
                          : "bg-white/5 border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/10"
                      }`}
                    >
                      <span className="text-2xl shrink-0 p-1.5 bg-black/30 rounded-xl">{arch.icon}</span>
                      <div>
                        <span className="text-xs font-bold text-white block">{arch.title}</span>
                        <span className="text-[10px] text-slate-400 leading-snug block mt-0.5">
                          {arch.desc}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. SKIN & EYE EXPRESSIONS */}
            {activeTab === "face" && (
              <div className="space-y-5">
                {/* Skin Tone Swatches */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white font-mono uppercase tracking-wider block">
                    Skin Complexion &amp; Tone
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {skinTones.map((st) => (
                      <button
                        key={st.color}
                        type="button"
                        onClick={() => handleUpdate("skinTone", st.color)}
                        className={`w-9 h-9 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center ${
                          config.skinTone === st.color
                            ? "border-amber-400 scale-110 shadow-[0_0_12px_rgba(251,191,36,0.5)] ring-2 ring-amber-400/30"
                            : "border-white/20 hover:scale-105"
                        }`}
                        style={{ backgroundColor: st.color }}
                        title={st.name}
                      >
                        {config.skinTone === st.color && (
                          <Check className="w-4 h-4 text-white drop-shadow stroke-[3]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Eye Style */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white font-mono uppercase tracking-wider block">
                    Eye Look &amp; Focus
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: "focused", label: "Focused & Steady" },
                      { id: "serene", label: "Serene & Gentle" },
                      { id: "joyful", label: "Joyful & Bright" },
                      { id: "meditative", label: "Meditative (Closed)" },
                      { id: "compassionate", label: "Compassionate" },
                      { id: "sparkling", label: "Sparkling Energy" },
                    ].map((eye) => (
                      <button
                        key={eye.id}
                        type="button"
                        onClick={() => handleUpdate("eyeStyle", eye.id as any)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                          config.eyeStyle === eye.id
                            ? "bg-amber-400/20 border-amber-400 text-amber-300"
                            : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                        }`}
                      >
                        {eye.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Iris Color */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white font-mono uppercase tracking-wider block">
                    Iris Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {eyeColors.map((ec) => (
                      <button
                        key={ec.color}
                        type="button"
                        onClick={() => handleUpdate("eyeColor", ec.color)}
                        className={`w-7 h-7 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                          config.eyeColor === ec.color
                            ? "border-amber-400 scale-110 shadow-sm ring-2 ring-amber-400/40"
                            : "border-white/20 hover:scale-105"
                        }`}
                        style={{ backgroundColor: ec.color }}
                        title={ec.name}
                      >
                        {config.eyeColor === ec.color && (
                          <Check className="w-3 h-3 text-white stroke-[3]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Expression */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white font-mono uppercase tracking-wider block">
                    Facial Expression
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: "gentle_smile", label: "Gentle Smile" },
                      { id: "calm_focus", label: "Calm Neutral" },
                      { id: "joyful_grin", label: "Joyful Grin" },
                      { id: "serene_peace", label: "Serene Peace" },
                    ].map((exp) => (
                      <button
                        key={exp.id}
                        type="button"
                        onClick={() => handleUpdate("expression", exp.id as any)}
                        className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                          config.expression === exp.id
                            ? "bg-amber-400/20 border-amber-400 text-amber-300"
                            : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                        }`}
                      >
                        {exp.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3. HAIR & HEADGEAR */}
            {activeTab === "hair" && (
              <div className="space-y-5">
                {/* Hair Style */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white font-mono uppercase tracking-wider block">
                    Hair Style &amp; Headpiece
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: "fade_waves", label: "Fade & Waves" },
                      { id: "braids_locks", label: "Braids & Gold Beads" },
                      { id: "short_crop", label: "Short Textured Crop" },
                      { id: "flowing_locks", label: "Flowing Waves" },
                      { id: "topknot", label: "Zen Topknot Bun" },
                      { id: "lotus_crown", label: "Lotus Forehead Crown" },
                      { id: "focus_headband", label: "MindSafe Headband" },
                      { id: "calm_beanie", label: "Cozy Knit Beanie" },
                      { id: "zen_shaved", label: "Zen Shaved" },
                    ].map((style) => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => handleUpdate("hairStyle", style.id as any)}
                        className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                          config.hairStyle === style.id
                            ? "bg-amber-400/20 border-amber-400 text-amber-300 shadow-sm"
                            : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                        }`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hair Color Palette */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white font-mono uppercase tracking-wider block">
                    Hair &amp; Accent Color
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {hairColors.map((hc) => (
                      <button
                        key={hc.color}
                        type="button"
                        onClick={() => handleUpdate("hairColor", hc.color)}
                        className={`w-9 h-9 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center ${
                          config.hairColor === hc.color
                            ? "border-amber-400 scale-110 shadow-[0_0_12px_rgba(251,191,36,0.5)] ring-2 ring-amber-400/30"
                            : "border-white/20 hover:scale-105"
                        }`}
                        style={{ backgroundColor: hc.color }}
                        title={hc.name}
                      >
                        {config.hairColor === hc.color && (
                          <Check className="w-4 h-4 text-white drop-shadow stroke-[3]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 4. OUTFITS & ATTIRE */}
            {activeTab === "outfit" && (
              <div className="space-y-5">
                {/* Outfit Type */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white font-mono uppercase tracking-wider block">
                    Attire &amp; Armor Type
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: "mindsafe_hoodie", label: "MindSafe Hoodie", desc: "Signature 🧠👊🏼 emblem" },
                      { id: "zen_robes", label: "Zen Robes", desc: "Layered meditation wrap" },
                      { id: "resilience_armor", label: "Resilience Armor", desc: "Tactical plates" },
                      { id: "kimono_harmony", label: "Kimono of Harmony", desc: "Traditional elegance" },
                      { id: "cozy_sweater", label: "Cozy Knit Sweater", desc: "Warm comfort" },
                      { id: "nature_cloak", label: "Botanical Cloak", desc: "Leaf clasps" },
                    ].map((out) => (
                      <button
                        key={out.id}
                        type="button"
                        onClick={() => handleUpdate("outfit", out.id as any)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          config.outfit === out.id
                            ? "bg-amber-400/20 border-amber-400 text-white shadow-sm"
                            : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                        }`}
                      >
                        <span className="text-xs font-bold block">{out.label}</span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">{out.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary Fabric Color */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white font-mono uppercase tracking-wider block">
                    Primary Fabric Color
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {outfitColors.map((oc) => (
                      <button
                        key={oc.color}
                        type="button"
                        onClick={() => handleUpdate("outfitColor", oc.color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center ${
                          config.outfitColor === oc.color
                            ? "border-amber-400 scale-110 shadow-sm ring-2 ring-amber-400/30"
                            : "border-white/20 hover:scale-105"
                        }`}
                        style={{ backgroundColor: oc.color }}
                        title={oc.name}
                      >
                        {config.outfitColor === oc.color && (
                          <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Secondary Accent Color */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white font-mono uppercase tracking-wider block">
                    Emblem &amp; Trim Accent Color
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {accentColors.map((ac) => (
                      <button
                        key={ac.color}
                        type="button"
                        onClick={() => handleUpdate("outfitSecondaryColor", ac.color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center ${
                          config.outfitSecondaryColor === ac.color
                            ? "border-amber-400 scale-110 shadow-sm ring-2 ring-amber-400/30"
                            : "border-white/20 hover:scale-105"
                        }`}
                        style={{ backgroundColor: ac.color }}
                        title={ac.name}
                      >
                        {config.outfitSecondaryColor === ac.color && (
                          <Check className="w-3.5 h-3.5 text-slate-900 stroke-[3]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 5. GEAR & ACCESSORIES */}
            {activeTab === "accessories" && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  Equip Mindfulness Gear &amp; Focus Relics
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { id: "headphones", label: "Noise-Cancelling Headphones", icon: "🎧", desc: "Blocks outside noise" },
                    { id: "mala_beads", label: "Sacred Mala Prayer Beads", icon: "📿", desc: "108 mindful counts" },
                    { id: "crystal_amulet", label: "Crystal Resilience Amulet", icon: "💎", desc: "Emotional shield" },
                    { id: "halo_aura", label: "Cosmic Halo Ring", icon: "✨", desc: "Higher perspective" },
                    { id: "mindsafe_bandana", label: "MindSafe Bandana", icon: "🧣", desc: "Warrior resolve" },
                    { id: "none", label: "No Extra Gear", icon: "🚫", desc: "Clean minimalist style" },
                  ].map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => handleUpdate("accessory", acc.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        config.accessory === acc.id
                          ? "bg-amber-400/20 border-amber-400 text-white shadow-sm ring-1 ring-amber-400/40"
                          : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      <span className="text-xl block mb-1">{acc.icon}</span>
                      <span className="text-xs font-bold block text-white">{acc.label}</span>
                      <span className="text-[9px] text-slate-400 block mt-0.5">{acc.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 6. SHOULDER COMPANION PET */}
            {activeTab === "pet" && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <span>🐾</span> Perched Shoulder Companion
                </h4>
                <p className="text-xs text-slate-400">
                  Select a faithful companion to sit on your shoulder and accompany your daily journey.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      id: "nanny_frog",
                      name: "Baby Nanny Frog",
                      icon: "🐸",
                      desc: "Soft maternal wisdom, lotus crown & gentle protection.",
                    },
                    {
                      id: "guardian_pup",
                      name: "Guardian Pup",
                      icon: "🐕",
                      desc: "Loyal, watchful, and steadfast through every storm.",
                    },
                    {
                      id: "zen_cat",
                      name: "Mindful Zen Cat",
                      icon: "🐈",
                      desc: "Purrs at 528Hz healing frequencies for nervous system regulation.",
                    },
                    {
                      id: "hope_butterfly",
                      name: "Butterfly of Metamorphosis",
                      icon: "🦋",
                      desc: "A symbol that your hardest struggles are leading to your greatest wings.",
                    },
                    {
                      id: "songbird",
                      name: "Azure Blue Songbird",
                      icon: "🕊️",
                      desc: "Sings gentle morning melodies to lift heavy mornings.",
                    },
                    {
                      id: "none",
                      name: "No Shoulder Pet",
                      icon: "🚫",
                      desc: "Solo path of focus.",
                    },
                  ].map((pet) => (
                    <button
                      key={pet.id}
                      type="button"
                      onClick={() => handleUpdate("shoulderPet", pet.id as any)}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                        config.shoulderPet === pet.id
                          ? "bg-amber-400/15 border-amber-400 text-white ring-1 ring-amber-400/50 shadow-md"
                          : "bg-white/5 border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/10"
                      }`}
                    >
                      <span className="text-2xl shrink-0 p-1.5 bg-black/40 rounded-xl">{pet.icon}</span>
                      <div>
                        <span className="text-xs font-bold text-white block">{pet.name}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5 leading-snug">
                          {pet.desc}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 7. AURA & BACKGROUND SCENE */}
            {activeTab === "aura" && (
              <div className="space-y-5">
                {/* Aura Glow */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white font-mono uppercase tracking-wider block">
                    Resilience Aura Glow
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: "golden_radiance", label: "Golden Radiance", color: "#fbbf24" },
                      { id: "emerald_zen", label: "Emerald Zen Healing", color: "#34d399" },
                      { id: "cosmic_starlight", label: "Cosmic Starlight", color: "#c084fc" },
                      { id: "sunset_calm", label: "Sunset Rose Calm", color: "#f472b6" },
                      { id: "lotus_ripple", label: "Lotus Azure Ripple", color: "#38bdf8" },
                      { id: "none", label: "Subtle / No Aura", color: "#94a3b8" },
                    ].map((aur) => (
                      <button
                        key={aur.id}
                        type="button"
                        onClick={() => handleUpdate("aura", aur.id as any)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                          config.aura === aur.id
                            ? "bg-amber-400/20 border-amber-400 text-white shadow-sm"
                            : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full shrink-0 shadow"
                          style={{ backgroundColor: aur.color }}
                        />
                        <span className="truncate">{aur.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Background Atmosphere */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white font-mono uppercase tracking-wider block">
                    Sanctuary Atmosphere
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: "dark_slate", label: "Deep Obsidian" },
                      { id: "amber_sunrise", label: "Golden Sunrise" },
                      { id: "emerald_grove", label: "Emerald Bamboo Grove" },
                      { id: "celestial_nebula", label: "Celestial Nebula" },
                      { id: "twilight_lavender", label: "Twilight Lavender" },
                      { id: "pure_zen_water", label: "Zen Pond Water" },
                    ].map((bg) => (
                      <button
                        key={bg.id}
                        type="button"
                        onClick={() => handleUpdate("backgroundTheme", bg.id as any)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                          config.backgroundTheme === bg.id
                            ? "bg-amber-400/20 border-amber-400 text-amber-300 shadow-sm"
                            : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                        }`}
                      >
                        {bg.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 8. IDENTITY & MANTRA */}
            {activeTab === "identity" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white font-mono uppercase tracking-wider block">
                    Avatar / Warrior Name
                  </label>
                  <input
                    type="text"
                    value={config.avatarName}
                    onChange={(e) => handleUpdate("avatarName", e.target.value)}
                    maxLength={30}
                    placeholder="e.g. MindSafe Champion"
                    className="w-full bg-slate-900 border border-white/10 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white font-mono uppercase tracking-wider block">
                    Honorary Title
                  </label>
                  <input
                    type="text"
                    value={config.title}
                    onChange={(e) => handleUpdate("title", e.target.value)}
                    maxLength={40}
                    placeholder="e.g. Guardian of Inner Calm"
                    className="w-full bg-slate-900 border border-white/10 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white font-mono uppercase tracking-wider block">
                    Personal Daily Resilience Mantra
                  </label>
                  <textarea
                    rows={2}
                    value={config.mantra}
                    onChange={(e) => handleUpdate("mantra", e.target.value)}
                    maxLength={140}
                    placeholder="e.g. Safe minds, better lives — unbroken through every storm."
                    className="w-full bg-slate-900 border border-white/10 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none resize-none leading-relaxed"
                  />
                </div>

                {/* Quick Mantra Suggestions */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    Suggested MindSafe Mantras:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "I bend, but I never break.",
                      "Rest now, little one. The lily still grows.",
                      "Every scar is proof of an obstacle overcome.",
                      "Calm mind, steady heart, invincible spirit.",
                    ].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => handleUpdate("mantra", m)}
                        className="text-[10px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-amber-300 transition-all cursor-pointer text-left"
                      >
                        "{m}"
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
