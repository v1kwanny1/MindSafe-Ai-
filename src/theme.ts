import { safeLocalStorage } from "./utils/safeStorage";

export interface ThemeOption {
  id: string;
  name: string;
  tagline: string;
  description: string;
  gradient: string;
  primaryColor: string;
  accentColor: string;
  glowColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  previewGradient: string;
}

export const THEME_PRESETS: ThemeOption[] = [
  {
    id: "calm-sea",
    name: "Calm Sea",
    tagline: "Oceanic Serenity",
    description: "Deep oceanic navy canvas with warm gold and sky blue accents.",
    gradient: "radial-gradient(circle at 10% 20%, #0F172A 0%, #1E293B 50%, #090D16 100%)",
    primaryColor: "#FBBF24",
    accentColor: "#60A5FA",
    glowColor: "rgba(251, 191, 36, 0.35)",
    badgeBg: "bg-amber-400/15",
    badgeBorder: "border-amber-400/30",
    badgeText: "text-amber-300",
    previewGradient: "from-slate-900 via-blue-950 to-slate-950",
  },
  {
    id: "forest-grounding",
    name: "Forest Grounding",
    tagline: "Natural Equilibrium",
    description: "Deep pine forest background with restorative emerald and tranquil mint tones.",
    gradient: "radial-gradient(circle at 10% 20%, #064E3B 0%, #022C22 50%, #01140E 100%)",
    primaryColor: "#34D399",
    accentColor: "#6EE7B7",
    glowColor: "rgba(52, 211, 153, 0.35)",
    badgeBg: "bg-emerald-400/15",
    badgeBorder: "border-emerald-400/30",
    badgeText: "text-emerald-300",
    previewGradient: "from-emerald-950 via-teal-950 to-slate-950",
  },
  {
    id: "warm-sunset",
    name: "Warm Sunset",
    tagline: "Twilight Comfort",
    description: "Rich twilight violet canvas with comforting coral, rose and warm amber glow.",
    gradient: "radial-gradient(circle at 10% 20%, #4C1D95 0%, #1E1B4B 50%, #0F0A2A 100%)",
    primaryColor: "#FB923C",
    accentColor: "#F43F5E",
    glowColor: "rgba(251, 146, 60, 0.35)",
    badgeBg: "bg-orange-400/15",
    badgeBorder: "border-orange-400/30",
    badgeText: "text-orange-300",
    previewGradient: "from-purple-950 via-indigo-950 to-slate-950",
  },
  {
    id: "midnight-obsidian",
    name: "Midnight Obsidian",
    tagline: "Focused Clarity",
    description: "Sleek obsidian black canvas with high-contrast mystic amethyst highlights.",
    gradient: "radial-gradient(circle at 10% 20%, #18181B 0%, #09090B 50%, #000000 100%)",
    primaryColor: "#C084FC",
    accentColor: "#E879F9",
    glowColor: "rgba(192, 132, 252, 0.35)",
    badgeBg: "bg-purple-400/15",
    badgeBorder: "border-purple-400/30",
    badgeText: "text-purple-300",
    previewGradient: "from-zinc-900 via-stone-950 to-black",
  },
];

export function getSavedThemeId(): string {
  if (typeof window === "undefined") return "calm-sea";
  return safeLocalStorage.getItem("mindsafe_user_theme") || "calm-sea";
}

export function applyTheme(themeId: string): ThemeOption {
  const theme = THEME_PRESETS.find((t) => t.id === themeId) || THEME_PRESETS[0];
  if (typeof document !== "undefined") {
    const root = document.documentElement;
    root.style.setProperty("--app-bg", theme.gradient);
    root.style.setProperty("--theme-primary-color", theme.primaryColor);
    root.style.setProperty("--theme-accent-color", theme.accentColor);
    root.style.setProperty("--theme-glow-color", theme.glowColor);
    safeLocalStorage.setItem("mindsafe_user_theme", theme.id);

    // Dispatch custom event for reactive subscribers
    window.dispatchEvent(new CustomEvent("mindsafe-theme-changed", { detail: theme }));
  }
  return theme;
}
