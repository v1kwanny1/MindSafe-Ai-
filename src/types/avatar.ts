export interface AvatarConfig {
  id: string;
  avatarName: string;
  title: string;
  mantra: string;
  archetype: "warrior" | "zen_monk" | "cosmic_sage" | "botanical_spirit" | "modern_hero" | "nanny_frog_kin";
  skinTone: string; // Hex color code
  hairStyle: "short_crop" | "fade_waves" | "braids_locks" | "flowing_locks" | "topknot" | "zen_shaved" | "lotus_crown" | "focus_headband" | "calm_beanie";
  hairColor: string; // Hex color code
  eyeStyle: "serene" | "focused" | "joyful" | "meditative" | "compassionate" | "sparkling";
  eyeColor: string;
  expression: "gentle_smile" | "calm_focus" | "joyful_grin" | "serene_peace";
  outfit: "mindsafe_hoodie" | "zen_robes" | "resilience_armor" | "cozy_sweater" | "kimono_harmony" | "nature_cloak";
  outfitColor: string;
  outfitSecondaryColor: string;
  accessory: "none" | "headphones" | "mala_beads" | "crystal_amulet" | "halo_aura" | "mindsafe_bandana";
  shoulderPet: "none" | "nanny_frog" | "zen_cat" | "guardian_pup" | "hope_butterfly" | "songbird";
  aura: "none" | "golden_radiance" | "cosmic_starlight" | "emerald_zen" | "sunset_calm" | "lotus_ripple";
  backgroundTheme: "dark_slate" | "amber_sunrise" | "twilight_lavender" | "emerald_grove" | "celestial_nebula" | "pure_zen_water";
  updatedAt: number;
}

export const DEFAULT_AVATAR: AvatarConfig = {
  id: "default_avatar",
  avatarName: "MindSafe Warrior",
  title: "Guardian of Inner Peace",
  mantra: "Safe minds, better lives — unbroken through every storm.",
  archetype: "modern_hero",
  skinTone: "#e0ac69",
  hairStyle: "fade_waves",
  hairColor: "#1e1b18",
  eyeStyle: "focused",
  eyeColor: "#452814",
  expression: "gentle_smile",
  outfit: "mindsafe_hoodie",
  outfitColor: "#1e293b",
  outfitSecondaryColor: "#fbbf24",
  accessory: "headphones",
  shoulderPet: "nanny_frog",
  aura: "golden_radiance",
  backgroundTheme: "dark_slate",
  updatedAt: Date.now(),
};

export interface AvatarPreset {
  id: string;
  name: string;
  description: string;
  config: Partial<AvatarConfig>;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: "mindsafe_champion",
    name: "MindSafe Champion",
    description: "Equipped with tactical focus headphones and the golden resilience hoodie.",
    config: {
      avatarName: "MindSafe Champion",
      title: "Resilience Pioneer",
      mantra: "Every scar is proof of an obstacle overcome.",
      archetype: "modern_hero",
      skinTone: "#8d5524",
      hairStyle: "fade_waves",
      hairColor: "#0f172a",
      eyeStyle: "focused",
      expression: "gentle_smile",
      outfit: "mindsafe_hoodie",
      outfitColor: "#0f172a",
      outfitSecondaryColor: "#fbbf24",
      accessory: "headphones",
      shoulderPet: "guardian_pup",
      aura: "golden_radiance",
      backgroundTheme: "dark_slate",
    },
  },
  {
    id: "nanny_frog_disciple",
    name: "Nanny Frog's Kin",
    description: "Guided by gentle maternal wisdom and soft pond lily blossoms.",
    config: {
      avatarName: "Pond Walker",
      title: "Soul Restorer",
      mantra: "Rest now, little one. The storm passes — the lily still grows.",
      archetype: "nanny_frog_kin",
      skinTone: "#f5d0a9",
      hairStyle: "lotus_crown",
      hairColor: "#10b981",
      eyeStyle: "compassionate",
      expression: "serene_peace",
      outfit: "zen_robes",
      outfitColor: "#064e3b",
      outfitSecondaryColor: "#34d399",
      accessory: "mala_beads",
      shoulderPet: "nanny_frog",
      aura: "emerald_zen",
      backgroundTheme: "emerald_grove",
    },
  },
  {
    id: "zen_monk",
    name: "Zen Mountain Monk",
    description: "Calm breathing, sacred mala prayer beads, and deep inner stillness.",
    config: {
      avatarName: "Stillwater Monk",
      title: "Master of Stillness",
      mantra: "In the depth of winter, I found within me an invincible summer.",
      archetype: "zen_monk",
      skinTone: "#e0ac69",
      hairStyle: "zen_shaved",
      hairColor: "#334155",
      eyeStyle: "meditative",
      expression: "calm_focus",
      outfit: "kimono_harmony",
      outfitColor: "#78350f",
      outfitSecondaryColor: "#fbbf24",
      accessory: "mala_beads",
      shoulderPet: "zen_cat",
      aura: "lotus_ripple",
      backgroundTheme: "pure_zen_water",
    },
  },
  {
    id: "cosmic_sage",
    name: "Cosmic Nebula Sage",
    description: "Starlight wisdom, celestial aura, and unshakeable cosmic perspective.",
    config: {
      avatarName: "Starborn Sage",
      title: "Astral Protector",
      mantra: "We are the universe experiencing itself with courage.",
      archetype: "cosmic_sage",
      skinTone: "#c68642",
      hairStyle: "flowing_locks",
      hairColor: "#c084fc",
      eyeStyle: "sparkling",
      expression: "joyful_grin",
      outfit: "resilience_armor",
      outfitColor: "#312e81",
      outfitSecondaryColor: "#a855f7",
      accessory: "halo_aura",
      shoulderPet: "hope_butterfly",
      aura: "cosmic_starlight",
      backgroundTheme: "celestial_nebula",
    },
  },
  {
    id: "forest_healer",
    name: "Botanical Spirit Healer",
    description: "Rooted in the earth, breathing with the trees and morning dew.",
    config: {
      avatarName: "Dewdrop Guardian",
      title: "Spirit of the Grove",
      mantra: "Deep roots do not fear the wind.",
      archetype: "botanical_spirit",
      skinTone: "#ffdbac",
      hairStyle: "braids_locks",
      hairColor: "#047857",
      eyeStyle: "serene",
      expression: "gentle_smile",
      outfit: "nature_cloak",
      outfitColor: "#14532d",
      outfitSecondaryColor: "#86efac",
      accessory: "crystal_amulet",
      shoulderPet: "songbird",
      aura: "sunset_calm",
      backgroundTheme: "amber_sunrise",
    },
  },
];
