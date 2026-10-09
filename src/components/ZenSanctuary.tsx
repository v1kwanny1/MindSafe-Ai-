import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Heart,
  Droplets,
  Sun,
  Utensils,
  Wind,
  Plus,
  Trash2,
  Volume2,
  VolumeX,
  Award,
  Clock,
  Calendar,
  Smile,
  Shield,
  Star,
  Flame,
  Check,
  ChevronRight,
  Eye,
  RefreshCw,
  Info,
  Maximize2,
  Minimize2,
  Compass,
  Coffee,
} from "lucide-react";
import { safeLocalStorage } from "../utils/safeStorage";

// ==========================================
// TYPES & DATA DEFINITIONS
// ==========================================

export type SanctuaryType = "tree" | "pet";

export type TreeSpecies = "sakura" | "oak" | "bonsai" | "willow" | "lotus";
export type PetSpecies = "frog" | "dog" | "cat" | "butterfly" | "bird";

export interface OrganismStage {
  stageNumber: number;
  name: string;
  subtitle: string;
  emoji: string;
  visualDesc: string;
  xpRequired: number;
  dialogue: string;
}

export interface SanctuaryEntity {
  id: string;
  type: SanctuaryType;
  species: TreeSpecies | PetSpecies;
  name: string;
  intention: string;
  potOrBedding: string;
  plantedAt: string; // ISO date
  lastCaredAt: string; // ISO date
  stageIndex: number;
  xp: number; // 0 to stage xpRequired
  hydration: number; // 0 - 100
  nourishment: number; // 0 - 100
  happiness: number; // 0 - 100
  cleanliness: number; // 0 - 100
  daysAlive: number;
  evolutionHistory: { stageName: string; date: string }[];
}

// POT & HABITAT CHOICES
export const POT_CHOICES = [
  { id: "terracotta", name: "Warm Terracotta", icon: "🪴", desc: "Classic porous clay for breathable roots", color: "from-amber-700/40 to-orange-800/40 border-amber-600/50" },
  { id: "zen_slate", name: "Zen Slate Stone", icon: "🪨", desc: "Minimalist dark slate grounding energy", color: "from-slate-800/60 to-slate-950 border-slate-600/50" },
  { id: "glazed_jade", name: "Glazed Jade Basin", icon: "🍵", desc: "Ceramic jade bringing harmony and renewal", color: "from-emerald-900/50 to-teal-950 border-emerald-500/50" },
  { id: "golden_ceramic", name: "Golden Porcelain", icon: "✨", desc: "Luminous gold trimmed artisan planter", color: "from-amber-600/40 to-yellow-900/40 border-amber-400/60" },
  { id: "water_pond", name: "Lotus Water Basin", icon: "🌊", desc: "Crystal clear pebble pond with floating petals", color: "from-sky-900/50 to-blue-950 border-sky-400/50" },
];

export const BEDDING_CHOICES = [
  { id: "lily_pad", name: "Tranquil Lily Pad Pond", icon: "🪷", desc: "Fresh crystal water with floating duckweed & moss", color: "from-emerald-950/60 to-teal-900/60 border-emerald-500/50" },
  { id: "fleece_cushion", name: "Cozy Fleece Cloud", icon: "☁️", desc: "Ultra-soft woven cotton blanket with soothing lavender", color: "from-amber-950/40 to-rose-950/40 border-amber-400/40" },
  { id: "sunlit_mat", name: "Sunlit Tatami Mat", icon: "🪵", desc: "Warm woven cedar mat placed right in a morning sunbeam", color: "from-yellow-950/40 to-amber-900/40 border-amber-500/40" },
  { id: "forest_nest", name: "Sacred Forest Nest", icon: "🪹", desc: "Silken pine needles, soft moss and fragrant blossoms", color: "from-stone-900/60 to-emerald-950/60 border-emerald-600/50" },
];

// STAGES CONFIGURATION FOR ALL SPECIES
export const SPECIES_CATALOG: Record<
  TreeSpecies | PetSpecies,
  {
    type: SanctuaryType;
    species: TreeSpecies | PetSpecies;
    commonName: string;
    description: string;
    icon: string;
    color: string;
    stages: OrganismStage[];
    ambientAffirmations: string[];
  }
> = {
  // --- TREES ---
  sakura: {
    type: "tree",
    species: "sakura",
    commonName: "Cherry Blossom (Sakura)",
    description: "Symbol of mindful presence, gentle beauty, and new beginnings.",
    icon: "🌸",
    color: "from-pink-500/20 to-rose-600/20 border-pink-400/40 text-pink-300",
    ambientAffirmations: [
      "I allow myself to bloom in my own sacred timing.",
      "Each gentle petal reminds me to be soft with my heart.",
      "Beauty returns softly after every winter.",
    ],
    stages: [
      { stageNumber: 1, name: "Sakura Seed", subtitle: "Resting in fertile soil", emoji: "🫘", visualDesc: "A small smooth seed tucked warmly into moist soil", xpRequired: 60, dialogue: "The seed rests in quiet peace, drinking in the first morning moisture." },
      { stageNumber: 2, name: "Delicate Sprout", subtitle: "First emerald leaf", emoji: "🌱", visualDesc: "A tender twin leaf breaking through the dark earth towards the sun", xpRequired: 120, dialogue: "Look! A tiny green shoot has opened, greeting the gentle sunlight." },
      { stageNumber: 3, name: "Spring Sapling", subtitle: "Slender branchlet", emoji: "🌿", visualDesc: "A young slender sakura branch with emerging pink flower buds", xpRequired: 200, dialogue: "Branches reach upward with strength and flexibility in the breeze." },
      { stageNumber: 4, name: "Blossoming Sakura", subtitle: "Full pink canopy", emoji: "🌸", visualDesc: "A flourishing cherry blossom tree raining soft pink petals", xpRequired: 300, dialogue: "The canopy is covered in fragrant pink blossoms that soothe your spirit." },
      { stageNumber: 5, name: "Ancient Celestial Sakura", subtitle: "Master Spirit Tree", emoji: "🌺✨", visualDesc: "A majestic ancient tree glowing with luminous stardust and floating petals", xpRequired: 500, dialogue: "An eternal sanctuary of peace, radiating deep tranquility to your entire mind." },
    ],
  },
  oak: {
    type: "tree",
    species: "oak",
    commonName: "Golden Resilience Oak",
    description: "Deep roots, unshakeable courage, and enduring inner fortitude.",
    icon: "🌳",
    color: "from-amber-600/20 to-yellow-700/20 border-amber-400/40 text-amber-300",
    ambientAffirmations: [
      "I am grounded, rooted, and unshaken by passing storms.",
      "My strength grows quietly beneath the surface each day.",
      "Storms only deepen my roots of resilience.",
    ],
    stages: [
      { stageNumber: 1, name: "Golden Acorn", subtitle: "Dormant strength", emoji: "🌰", visualDesc: "A hardy acorn resting securely in rich mountain earth", xpRequired: 60, dialogue: "Within this humble acorn lies the blueprint of an unshakeable giant." },
      { stageNumber: 2, name: "Oak Sprout", subtitle: "Deep root tap", emoji: "🌱", visualDesc: "A vigorous emerald shoot sending strong roots deep downward", xpRequired: 120, dialogue: "The roots anchor deep into the soil before the branches stretch skyward." },
      { stageNumber: 3, name: "Sturdy Sapling", subtitle: "Bark forming", emoji: "🪴", visualDesc: "A resilient young oak with rugged bark and broad scalloped leaves", xpRequired: 200, dialogue: "The trunk thickens, standing tall against brisk winds without bending." },
      { stageNumber: 4, name: "Great Canopy Oak", subtitle: "Grand shade giver", emoji: "🌳", visualDesc: "A towering oak tree with a massive golden-green canopy", xpRequired: 300, dialogue: "Birds nest peacefully in its broad branches; its shade offers calm refuge." },
      { stageNumber: 5, name: "Grand Elder Oak", subtitle: "Ancient World Pillar", emoji: "🌳👑", visualDesc: "A legendary ancient oak with glowing golden leaves and sacred presence", xpRequired: 500, dialogue: "A monument of everlasting resilience. You and your oak have weathered every storm." },
    ],
  },
  bonsai: {
    type: "tree",
    species: "bonsai",
    commonName: "Zen Bonsai Pine",
    description: "Art of patient focus, intentional pruning, and quiet mastery.",
    icon: "🌲",
    color: "from-emerald-600/20 to-teal-700/20 border-emerald-400/40 text-emerald-300",
    ambientAffirmations: [
      "Patience transforms small moments into sacred masterpieces.",
      "I breathe out tension and breathe in mindful stillness.",
      "Simplicity is the highest form of inner peace.",
    ],
    stages: [
      { stageNumber: 1, name: "Pine Seed", subtitle: "Winged seed", emoji: "🌰", visualDesc: "A delicate winged pine seed resting on mossy slate", xpRequired: 60, dialogue: "A miniature seed holding the timeless wisdom of ancient mountain pines." },
      { stageNumber: 2, name: "Micro Pine Needles", subtitle: "First needle tuft", emoji: "🌱", visualDesc: "A cluster of soft emerald pine needles emerging in a spiral", xpRequired: 120, dialogue: "Soft pine needles open like little stars, absorbing the pure mountain air." },
      { stageNumber: 3, name: "Sculpted Bonsai", subtitle: "Wired gracefully", emoji: "🪴", visualDesc: "A miniature curved trunk shaped with patience and reverence", xpRequired: 200, dialogue: "Each curve reflects mindful care and intentional devotion to stillness." },
      { stageNumber: 4, name: "Meditative Pine", subtitle: "Lush layered foliage", emoji: "🌲", visualDesc: "A balanced Japanese bonsai resting atop a wooden tea plinth", xpRequired: 300, dialogue: "The layered needle pads resemble quiet green clouds on a mountain peak." },
      { stageNumber: 5, name: "Master Zen Bonsai", subtitle: "Centuries of Harmony", emoji: "🌲🏮", visualDesc: "A legendary bonsai adorned with glowing lantern spirits and golden moss", xpRequired: 500, dialogue: "The epitome of zen. Looking upon it brings instant mental clarity and calm." },
    ],
  },
  willow: {
    type: "tree",
    species: "willow",
    commonName: "Peaceful Silver Willow",
    description: "Emotional fluidity, bending without breaking, and releasing grief.",
    icon: "🌿",
    color: "from-teal-600/20 to-cyan-700/20 border-teal-400/40 text-teal-300",
    ambientAffirmations: [
      "I bend with the winds of change and remain unbroken.",
      "I let heavy emotions flow gently like cool water down a stream.",
      "Gentleness is my greatest strength.",
    ],
    stages: [
      { stageNumber: 1, name: "Willow Cutting", subtitle: "Fresh cutting", emoji: "💧", visualDesc: "A slender green willow wand placed in pure spring water", xpRequired: 60, dialogue: "Fresh white roots begin to spiral in the cool, crystal water." },
      { stageNumber: 2, name: "Rooted Willow Sprig", subtitle: "Silver shoots", emoji: "🌱", visualDesc: "A rooted willow cutting sprouting soft silvery-green leaves", xpRequired: 120, dialogue: "Leaves shimmer like silver whenever a light breeze passes through." },
      { stageNumber: 3, name: "Cascading Sapling", subtitle: "Arched stems", emoji: "🌿", visualDesc: "Graceful branches beginning to weep softly toward the ground", xpRequired: 200, dialogue: "The branches learn to yield gracefully to the wind, never snapping." },
      { stageNumber: 4, name: "Weeping Willow of Peace", subtitle: "Curtain of green", emoji: "🌾", visualDesc: "A full weeping willow whose hanging fronds brush the clear water", xpRequired: 300, dialogue: "Sitting beneath its cascading branches feels like a protective green sanctuary." },
      { stageNumber: 5, name: "Spirit Water Willow", subtitle: "Luminescent Aurora Tree", emoji: "🌊🌿", visualDesc: "A radiant willow with glowing aqua water droplets hanging like jewels", xpRequired: 500, dialogue: "A sanctuary of deep emotional renewal and perpetual inner peace." },
    ],
  },
  lotus: {
    type: "tree",
    species: "lotus",
    commonName: "Sacred Water Lotus",
    description: "Rising above mud into pristine purity, enlightenment, and hope.",
    icon: "🪷",
    color: "from-violet-600/20 to-pink-700/20 border-violet-400/40 text-violet-300",
    ambientAffirmations: [
      "No mud, no lotus. My struggles transform into pure wisdom.",
      "I remain clean and untarnished by the chaos of the world.",
      "My soul opens petal by petal toward the morning light.",
    ],
    stages: [
      { stageNumber: 1, name: "Lotus Seed", subtitle: "Hard seed pod", emoji: "🪹", visualDesc: "A sacred dark lotus seed resting beneath still mineral water", xpRequired: 60, dialogue: "In the quiet dark depths, life awakens with purpose and divine patience." },
      { stageNumber: 2, name: "Floating Sprout", subtitle: "Unfurling coin leaf", emoji: "🫧", visualDesc: "A delicate round leaf floating on the surface like a green coin", xpRequired: 120, dialogue: "The coin leaf repels water droplets in perfect sparkling spheres." },
      { stageNumber: 3, name: "Emerging Lotus Bud", subtitle: "Pointed pink bud", emoji: "🪷", visualDesc: "A tall elegant stem rising above the water holding a tightly wrapped bud", xpRequired: 200, dialogue: "The pointed bud drinks the morning dew, preparing to unveil its glory." },
      { stageNumber: 4, name: "Radiant Water Lotus", subtitle: "In full blossom", emoji: "🌸", visualDesc: "A breathtaking multi-layered lotus flower glowing in soft magenta", xpRequired: 300, dialogue: "Nanny Frog loves resting next to this fragrant blossom on sunny afternoons." },
      { stageNumber: 5, name: "Cosmic Celestial Lotus", subtitle: "Universal Enlightenment", emoji: "✨🪷", visualDesc: "An ethereal crystalline lotus hovering above water with a rainbow aura", xpRequired: 500, dialogue: "A beacon of divine serenity. No turbulence can disrupt this stillness." },
    ],
  },

  // --- PET COMPANIONS ---
  frog: {
    type: "pet",
    species: "frog",
    commonName: "Zen Pond Frog (Nanny Frog's Kin)",
    description: "Calm anchor, peaceful breather, pond philosopher, and warm guide.",
    icon: "🐸",
    color: "from-emerald-500/20 to-green-600/20 border-emerald-400/40 text-emerald-300",
    ambientAffirmations: [
      "Ribbit... Rest now, little one. The storm passes; the lily still grows.",
      "Breathe in the morning mist, breathe out the heavy thoughts.",
      "You are held safely in the quiet pond of life.",
    ],
    stages: [
      { stageNumber: 1, name: "Frog Spawn", subtitle: "Translucent water eggs", emoji: "🫧", visualDesc: "A cluster of soft translucent jelly spheres with tiny moving embryos inside", xpRequired: 60, dialogue: "Ribbit! Look at the tiny life swimming gently inside the warm pond water." },
      { stageNumber: 2, name: "Tiny Tadpole", subtitle: "Wiggly swimmer", emoji: "🐟", visualDesc: "A lively little tadpole swimming happily among green water plants", xpRequired: 120, dialogue: "Swish, swish! The little tadpole nibbles on fresh mineral algae and waves its tail." },
      { stageNumber: 3, name: "Playful Froglet", subtitle: "Sprouting legs", emoji: "🦎", visualDesc: "A curious froglet with little hind and front legs, resting at the water edge", xpRequired: 200, dialogue: "Little legs are ready! It takes its first cautious leap onto a floating lily pad." },
      { stageNumber: 4, name: "Young Green Frog", subtitle: "Joyful jumper", emoji: "🐸", visualDesc: "A cheerful bright emerald frog catching mindful floating sparks with a smile", xpRequired: 300, dialogue: "Ribbit! Happy croaks fill the morning air. It loves when you stroke its head." },
      { stageNumber: 5, name: "Wise Zen Nanny Frog", subtitle: "Grand Sanctuary Anchor", emoji: "🐸👑", visualDesc: "A venerable smiling frog sitting serenely with a lotus crown and calming aura", xpRequired: 500, dialogue: "'I am always here with you,' smiles Nanny Frog. 'Nothing can shake our calm.'" },
    ],
  },
  dog: {
    type: "pet",
    species: "dog",
    commonName: "MindSafe Guardian Pup",
    description: "Loyalty, unconditional companionship, protective warmth, and joyful play.",
    icon: "🐕",
    color: "from-amber-500/20 to-orange-600/20 border-amber-400/40 text-amber-300",
    ambientAffirmations: [
      "I am never alone; loyalty and comfort surround me.",
      "A joyful tail wag can brighten the heaviest day.",
      "I walk forward with a faithful heart and steady paws.",
    ],
    stages: [
      { stageNumber: 1, name: "Sleepy Newborn Puppy", subtitle: "Snuggled in blanket", emoji: "🐶💤", visualDesc: "A tiny golden puppy sleeping softly wrapped in a warm fleece blanket", xpRequired: 60, dialogue: "Yawn! The little pup snuggles closer to your hand, dreaming sweet dreams." },
      { stageNumber: 2, name: "Playful Pup", subtitle: "Tail wagging explorer", emoji: "🐕🎾", visualDesc: "A bouncy puppy with floppy ears chasing colorful bubbles across the lawn", xpRequired: 120, dialogue: "Woof woof! It brought you its favorite toy to invite you to take a happy break." },
      { stageNumber: 3, name: "Faithful Companion", subtitle: "Steady guardian", emoji: "🦮", visualDesc: "A handsome loyal dog resting its chin gently on your knee with warm eyes", xpRequired: 200, dialogue: "It places a supportive paw on your leg, letting you know everything will be okay." },
      { stageNumber: 4, name: "Guardian Protector", subtitle: "Courageous partner", emoji: "🐕🛡️", visualDesc: "A proud and muscular golden retriever with a protective blue bandana", xpRequired: 300, dialogue: "Alert and protective, it stays by your side as a fortress of companionship." },
      { stageNumber: 5, name: "Celestial Spirit Wolfdog", subtitle: "Legendary Soul Guardian", emoji: "🐺✨", visualDesc: "A majestic radiant wolfdog with a shimmering starlight aura and noble stance", xpRequired: 500, dialogue: "An eternal soulmate of fortitude. Whenever you feel fear, its courage fills you." },
    ],
  },
  cat: {
    type: "pet",
    species: "cat",
    commonName: "Mindful Zen Feline",
    description: "Calm boundaries, healing purr vibrations, peaceful loafing, and grace.",
    icon: "🐈",
    color: "from-indigo-500/20 to-purple-600/20 border-indigo-400/40 text-indigo-300",
    ambientAffirmations: [
      "My peace is sacred; I choose where to spend my energy.",
      "Purring heals the body; stillness heals the mind.",
      "I am comfortable resting in my own quiet grace.",
    ],
    stages: [
      { stageNumber: 1, name: "Newborn Kitten", subtitle: "Fuzzy little bean", emoji: "🐱🍼", visualDesc: "A tiny kitten the size of a tea cup, mewing softly for warm milk", xpRequired: 60, dialogue: "Mew! The tiny kitten curls around your thumb, purring with miniature vibrations." },
      { stageNumber: 2, name: "Curious Kitten", subtitle: "Pouncing & stretching", emoji: "🐈🧶", visualDesc: "A playful kitten batting at a soft ball of yarn and chasing sunbeams", xpRequired: 120, dialogue: "It leaps up to catch a dust mote in the light, then rolls onto its back for chin rubs." },
      { stageNumber: 3, name: "Zen Loafing Cat", subtitle: "Master of stillness", emoji: "🧘🐈", visualDesc: "A sleek feline tucked into a perfect loaf posture basking in the afternoon sun", xpRequired: 200, dialogue: "Its deep rhythmic purr resonates at 432Hz, melting all anxiety from the room." },
      { stageNumber: 4, name: "Elegant Guardian Cat", subtitle: "Silent watcher", emoji: "🐈‍⬛✨", visualDesc: "A graceful feline sitting poised with a silver moon bell collar and bright amber eyes", xpRequired: 300, dialogue: "It rubs its cheek affectionately against your cheek, sharing a wave of calm." },
      { stageNumber: 5, name: "Celestial Mystic Cat", subtitle: "Starlight Entity", emoji: "🌌🐈", visualDesc: "A mythical cosmic cat floating slightly on a soft cloud with glowing starry fur", xpRequired: 500, dialogue: "The ultimate guardian of quiet intuition and uninterrupted peace." },
    ],
  },
  butterfly: {
    type: "pet",
    species: "butterfly",
    commonName: "Metamorphosis Butterfly",
    description: "Transformation, releasing the old self, patience in dark cocoons, and flying free.",
    icon: "🦋",
    color: "from-amber-400/20 to-pink-600/20 border-amber-300/40 text-amber-300",
    ambientAffirmations: [
      "Just when the caterpillar thought the world was over, it became a butterfly.",
      "Dark seasons are simply quiet preparation for flight.",
      "I shed what no longer serves me and step into my wings.",
    ],
    stages: [
      { stageNumber: 1, name: "Silken Egg & Caterpillar", subtitle: "Hungry little seeker", emoji: "🐛🍃", visualDesc: "A tiny striped caterpillar happily munching on a fresh sweet leaf", xpRequired: 60, dialogue: "Munch munch! The little caterpillar grows stronger with every mindful bite." },
      { stageNumber: 2, name: "Chrysalis of Solitude", subtitle: "Sacred inner cocoon", emoji: "🌿🪺", visualDesc: "A glossy jade chrysalis hanging under a leaf rimmed with golden dew drops", xpRequired: 120, dialogue: "Inside the quiet cocoon, miracles occur in silence. Rest is where transformation happens." },
      { stageNumber: 3, name: "Emerging Wings", subtitle: "First flight", emoji: "🦋", visualDesc: "A beautiful monarch butterfly drying its vibrant orange and gold wings in the sun", xpRequired: 200, dialogue: "It gently flexes its wings in the sunlight, feeling the breeze lift its spirit." },
      { stageNumber: 4, name: "Garden Monarch", subtitle: "Dancing on blooms", emoji: "🌺🦋", visualDesc: "A graceful butterfly gliding from blossom to blossom spreading sweet pollen", xpRequired: 300, dialogue: "It lands softly on your outstretched fingertip, a gentle kiss of hope." },
      { stageNumber: 5, name: "Prismatic Aurora Butterfly", subtitle: "Celestial Dream Weaver", emoji: "🦋✨", visualDesc: "A magnificent butterfly with glowing iridescent wings trailing stardust trails", xpRequired: 500, dialogue: "Proof that patience and self-love always lead to boundless freedom." },
    ],
  },
  bird: {
    type: "pet",
    species: "bird",
    commonName: "Songbird of Hope (Phoenix)",
    description: "Uplifting song, rising from ashes, broad horizons, and boundless optimism.",
    icon: "🕊️",
    color: "from-sky-500/20 to-blue-600/20 border-sky-400/40 text-sky-300",
    ambientAffirmations: [
      "I sing my song even before the dawn breaks.",
      "I rise renewed from every hardship with higher perspective.",
      "My wings carry me above the storms of life.",
    ],
    stages: [
      { stageNumber: 1, name: "Speckled Egg", subtitle: "Warm in the nest", emoji: "🪺🥚", visualDesc: "A warm golden-speckled egg nestled comfortably in woven twigs and feathers", xpRequired: 60, dialogue: "Tap tap! A gentle heartbeat pulses warmly beneath the eggshell." },
      { stageNumber: 2, name: "Chirping Fledgling", subtitle: "Fluffy hungry chick", emoji: "🐣", visualDesc: "A fluffy yellow fledgling opening its beak for sweet berry nectar", xpRequired: 120, dialogue: "Peep peep! The fledgling practices flapping its tiny downy wings." },
      { stageNumber: 3, name: "Golden Songbird", subtitle: "Melody maker", emoji: "🐤🎶", visualDesc: "A radiant blue-and-gold songbird perched on a blossoming twig singing clearly", xpRequired: 200, dialogue: "Its uplifting morning melody washes away all heaviness from your chest." },
      { stageNumber: 4, name: "Azure Falcon of Clarity", subtitle: "Soaring skyward", emoji: "🦅", visualDesc: "A swift and noble bird riding thermal air currents high above the mountains", xpRequired: 300, dialogue: "From great heights, yesterday's worries appear small and manageable." },
      { stageNumber: 5, name: "Eternal Solar Phoenix", subtitle: "Bird of Rebirth", emoji: "🔥🦅✨", visualDesc: "A majestic golden-fire phoenix with glowing plumes of renewal and eternal dawn", xpRequired: 500, dialogue: "No matter how dark the night, you will always rise again in golden light." },
    ],
  },
};

// INITIAL SEED SANCTUARY ORGANISMS
const INITIAL_SANCTUARY: SanctuaryEntity[] = [
  {
    id: "default-tree-sakura",
    type: "tree",
    species: "sakura",
    name: "Petals of Peace",
    intention: "To cultivate gentle patience and self-compassion.",
    potOrBedding: "glazed_jade",
    plantedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    lastCaredAt: new Date().toISOString(),
    stageIndex: 2, // Spring Sapling
    xp: 65,
    hydration: 85,
    nourishment: 80,
    happiness: 90,
    cleanliness: 95,
    daysAlive: 3,
    evolutionHistory: [
      { stageName: "Sakura Seed", date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString() },
      { stageName: "Delicate Sprout", date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString() },
      { stageName: "Spring Sapling", date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString() },
    ],
  },
  {
    id: "default-pet-frog",
    type: "pet",
    species: "frog",
    name: "Little Tad",
    intention: "To remind me that the storm passes and the lily still grows.",
    potOrBedding: "lily_pad",
    plantedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    lastCaredAt: new Date().toISOString(),
    stageIndex: 1, // Tiny Tadpole
    xp: 40,
    hydration: 95,
    nourishment: 85,
    happiness: 85,
    cleanliness: 90,
    daysAlive: 4,
    evolutionHistory: [
      { stageName: "Frog Spawn", date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toLocaleDateString() },
      { stageName: "Tiny Tadpole", date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString() },
    ],
  },
];

interface ZenSanctuaryProps {
  onTriggerCompanionMessage?: (prompt: string) => void;
  activeGuide?: "companion" | "nanny" | "mindsafe";
}

export const ZenSanctuary: React.FC<ZenSanctuaryProps> = ({
  onTriggerCompanionMessage,
  activeGuide = "nanny",
}) => {
  // ------------------------------------
  // Persistent Sanctuary State
  // ------------------------------------
  const [sanctuaryList, setSanctuaryList] = useState<SanctuaryEntity[]>(() => {
    try {
      const saved = safeLocalStorage.getItem("mindsafe_zen_sanctuary_data");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_SANCTUARY;
  });

  const [selectedEntityId, setSelectedEntityId] = useState<string>(() => {
    return sanctuaryList[0]?.id || "default-tree-sakura";
  });

  const [viewMode, setViewMode] = useState<"focus" | "grove">("focus");
  const [timeOfDay, setTimeOfDay] = useState<"dawn" | "day" | "sunset" | "night">("day");
  const [isSoundMuted, setIsSoundMuted] = useState(true);

  // Adoption / Planting Modal
  const [isAdoptionModalOpen, setIsAdoptionModalOpen] = useState(false);
  const [adoptCategory, setAdoptCategory] = useState<SanctuaryType>("tree");
  const [adoptSpecies, setAdoptSpecies] = useState<TreeSpecies | PetSpecies>("sakura");
  const [adoptPotOrBedding, setAdoptPotOrBedding] = useState<string>("terracotta");
  const [adoptName, setAdoptName] = useState("");
  const [adoptIntention, setAdoptIntention] = useState("");

  // Care Interaction Feedback States
  const [floatingParticles, setFloatingParticles] = useState<{ id: number; x: number; y: number; emoji: string }[]>([]);
  const [activeSpeechBubble, setActiveSpeechBubble] = useState<string | null>(null);
  const [evolutionCelebration, setEvolutionCelebration] = useState<{
    organismName: string;
    oldStage: string;
    newStage: string;
    emoji: string;
  } | null>(null);

  // Save to safeLocalStorage
  useEffect(() => {
    try {
      safeLocalStorage.setItem("mindsafe_zen_sanctuary_data", JSON.stringify(sanctuaryList));
    } catch (e) {
      console.error("Error saving sanctuary data:", e);
    }
  }, [sanctuaryList]);

  // Selected Entity Ref
  const activeEntity = useMemo(() => {
    return sanctuaryList.find((e) => e.id === selectedEntityId) || sanctuaryList[0];
  }, [sanctuaryList, selectedEntityId]);

  const activeCatalog = useMemo(() => {
    if (!activeEntity) return SPECIES_CATALOG.sakura;
    return SPECIES_CATALOG[activeEntity.species] || SPECIES_CATALOG.sakura;
  }, [activeEntity]);

  const currentStage = useMemo(() => {
    if (!activeEntity) return SPECIES_CATALOG.sakura.stages[0];
    const stages = activeCatalog.stages;
    return stages[Math.min(activeEntity.stageIndex, stages.length - 1)];
  }, [activeEntity, activeCatalog]);

  // Web Audio Synth for soothing effects
  const playSynthesizedTone = (type: "water" | "feed" | "sun" | "pet" | "evolve" | "affirm") => {
    if (isSoundMuted) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      const ctx = new AudioCtxClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === "water") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === "feed") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(520, now + 0.25);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === "sun") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(528, now); // 528Hz healing frequency
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      } else if (type === "pet") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(380, now);
        osc.frequency.linearRampToValueAtTime(420, now + 0.15);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === "evolve") {
        // Magical harp arpeggio
        [440, 554, 659, 880, 1108].forEach((freq, i) => {
          const oscNode = ctx.createOscillator();
          const gainNode = ctx.createGain();
          oscNode.type = "sine";
          oscNode.frequency.setValueAtTime(freq, now + i * 0.1);
          gainNode.gain.setValueAtTime(0.15, now + i * 0.1);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.5);
          oscNode.connect(gainNode);
          gainNode.connect(ctx.destination);
          oscNode.start(now + i * 0.1);
          oscNode.stop(now + i * 0.1 + 0.5);
        });
      } else if (type === "affirm") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(432, now);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      }
    } catch (e) {
      console.warn("Audio feedback error:", e);
    }
  };

  // Trigger floating visual particles on interaction
  const triggerParticle = (emoji: string, e?: React.MouseEvent) => {
    let x = 50 + (Math.random() * 20 - 10);
    let y = 45 + (Math.random() * 20 - 10);
    if (e) {
      const rect = e.currentTarget.getBoundingClientRect();
      x = ((e.clientX - rect.left) / rect.width) * 100;
      y = ((e.clientY - rect.top) / rect.height) * 100;
    }
    const newP = { id: Date.now() + Math.random(), x, y, emoji };
    setFloatingParticles((prev) => [...prev.slice(-12), newP]);
    setTimeout(() => {
      setFloatingParticles((prev) => prev.filter((p) => p.id !== newP.id));
    }, 1200);
  };

  // Perform Care Action on Active Organism
  const handleCareAction = (
    actionType: "water" | "nourish" | "sunlight" | "pet" | "affirmation",
    e?: React.MouseEvent
  ) => {
    if (!activeEntity) return;

    let xpGain = 15;
    let emojiParticle = "✨";
    let speech = "";

    if (actionType === "water") {
      xpGain = 18;
      emojiParticle = "💧";
      playSynthesizedTone("water");
      speech = activeEntity.type === "tree" ? "Ah, refreshing mountain dew quenching the roots!" : "Splish splash! Fresh crystal hydration!";
    } else if (actionType === "nourish") {
      xpGain = 18;
      emojiParticle = "🍎";
      playSynthesizedTone("feed");
      speech = activeEntity.type === "tree" ? "Rich organic fertilizer soaking deep into the soil." : "Yummy wholesome nourishment!";
    } else if (actionType === "sunlight") {
      xpGain = 20;
      emojiParticle = "☀️";
      playSynthesizedTone("sun");
      speech = "Soaking in gentle 528Hz golden morning sunlight!";
    } else if (actionType === "pet") {
      xpGain = 22;
      emojiParticle = "💛";
      playSynthesizedTone("pet");
      speech = activeEntity.type === "tree" ? "Gently stroking the bark with loving presence..." : "Purrrr / Warm happy nudges of pure affection!";
    } else if (actionType === "affirmation") {
      xpGain = 30;
      emojiParticle = "🌟";
      playSynthesizedTone("affirm");
      const randomAff = activeCatalog.ambientAffirmations[Math.floor(Math.random() * activeCatalog.ambientAffirmations.length)];
      speech = `"${randomAff}"`;
    }

    triggerParticle(emojiParticle, e);
    setActiveSpeechBubble(speech);

    // Update entity state & check for level-up evolution
    setSanctuaryList((prevList) =>
      prevList.map((ent) => {
        if (ent.id !== activeEntity.id) return ent;

        const maxStages = activeCatalog.stages.length;
        const currentReq = activeCatalog.stages[ent.stageIndex]?.xpRequired || 100;
        let newXp = ent.xp + xpGain;
        let newStageIndex = ent.stageIndex;
        let newHistory = [...ent.evolutionHistory];

        // Check Evolution Level Up
        if (newXp >= currentReq && ent.stageIndex < maxStages - 1) {
          newStageIndex = ent.stageIndex + 1;
          newXp = newXp - currentReq;
          const evolvedStage = activeCatalog.stages[newStageIndex];
          newHistory.push({
            stageName: evolvedStage.name,
            date: new Date().toLocaleDateString(),
          });

          // Trigger Evolution Modal Celebration
          setTimeout(() => {
            playSynthesizedTone("evolve");
            setEvolutionCelebration({
              organismName: ent.name,
              oldStage: activeCatalog.stages[ent.stageIndex].name,
              newStage: evolvedStage.name,
              emoji: evolvedStage.emoji,
            });
          }, 300);
        }

        return {
          ...ent,
          xp: newXp,
          stageIndex: newStageIndex,
          hydration: Math.min(100, ent.hydration + (actionType === "water" ? 30 : 5)),
          nourishment: Math.min(100, ent.nourishment + (actionType === "nourish" ? 30 : 5)),
          cleanliness: Math.min(100, ent.cleanliness + (actionType === "sunlight" ? 30 : 5)),
          happiness: Math.min(100, ent.happiness + (actionType === "pet" ? 30 : actionType === "affirmation" ? 35 : 10)),
          lastCaredAt: new Date().toISOString(),
          evolutionHistory: newHistory,
        };
      })
    );
  };

  // Create & Plant / Adopt New Companion
  const handleConfirmAdoption = () => {
    if (!adoptName.trim()) return;

    const newId = `sanctuary-${Date.now()}`;
    const defaultIntention = adoptCategory === "tree"
      ? "Growing my roots of inner peace, stillness, and resilience."
      : "A faithful friend walking beside me through life's journey.";

    const newEntity: SanctuaryEntity = {
      id: newId,
      type: adoptCategory,
      species: adoptSpecies,
      name: adoptName.trim(),
      intention: adoptIntention.trim() || defaultIntention,
      potOrBedding: adoptPotOrBedding,
      plantedAt: new Date().toISOString(),
      lastCaredAt: new Date().toISOString(),
      stageIndex: 0, // Starts at Seed / Spawn / Egg
      xp: 0,
      hydration: 90,
      nourishment: 90,
      happiness: 95,
      cleanliness: 95,
      daysAlive: 1,
      evolutionHistory: [
        {
          stageName: SPECIES_CATALOG[adoptSpecies].stages[0].name,
          date: new Date().toLocaleDateString(),
        },
      ],
    };

    setSanctuaryList((prev) => [...prev, newEntity]);
    setSelectedEntityId(newId);
    setIsAdoptionModalOpen(false);
    setAdoptName("");
    setAdoptIntention("");
    playSynthesizedTone("evolve");
  };

  // Delete / Release Organism safely
  const handleDeleteOrganism = (id: string, name: string) => {
    if (sanctuaryList.length <= 1) {
      alert("You must keep at least one mindful tree or companion in your Sanctuary!");
      return;
    }
    if (confirm(`Are you sure you want to gently release "${name}" back into the sacred forest?`)) {
      setSanctuaryList((prev) => prev.filter((item) => item.id !== id));
      if (selectedEntityId === id) {
        const remaining = sanctuaryList.filter((item) => item.id !== id);
        if (remaining.length > 0) {
          setSelectedEntityId(remaining[0].id);
        }
      }
    }
  };

  // Background environment gradients based on time of day
  const timeGradients = {
    dawn: "from-rose-950/60 via-purple-950/50 to-slate-950",
    day: "from-sky-950/50 via-teal-950/40 to-slate-950",
    sunset: "from-amber-950/60 via-orange-950/40 to-slate-950",
    night: "from-slate-950 via-indigo-950/70 to-black",
  };

  return (
    <div
      className="w-full rounded-3xl border border-white/10 p-4 sm:p-6 bg-slate-950/85 backdrop-blur-xl shadow-2xl relative overflow-hidden text-left"
      id="mindSafeZenSanctuary"
    >
      {/* Dynamic Background Atmosphere */}
      <div className={`absolute inset-0 bg-gradient-to-b ${timeGradients[timeOfDay]} opacity-90 transition-colors duration-1000 -z-10`} />

      {/* Floating fireflies/stars in night mode */}
      {timeOfDay === "night" && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-1/4 left-1/5 w-1.5 h-1.5 rounded-full bg-amber-300 animate-ping opacity-75" />
          <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 rounded-full bg-teal-300 animate-pulse opacity-80" />
          <div className="absolute bottom-1/3 left-1/3 w-2 h-2 rounded-full bg-yellow-200 animate-bounce opacity-60" />
        </div>
      )}

      {/* ==========================================
          HEADER: SANCTUARY CONTROLS & TIME TOGGLE
      ========================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 text-xl shadow-[0_0_15px_rgba(52,211,153,0.25)]">
            <span>🌿</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                MindSafe Zen Sanctuary
              </h3>
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Tree &amp; Tamagotchi Haven
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Plant sacred seeds, nurture life cycles from spawn to companion, and grow daily peace
            </p>
          </div>
        </div>

        {/* Top Control Buttons */}
        <div className="flex items-center gap-2">
          {/* Time of Day Switcher */}
          <div className="flex items-center bg-black/40 border border-white/10 p-1 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setTimeOfDay("dawn")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${timeOfDay === "dawn" ? "bg-rose-500/30 text-rose-300" : "text-slate-400 hover:text-white"}`}
              title="Dawn Sunrise"
            >
              🌅
            </button>
            <button
              type="button"
              onClick={() => setTimeOfDay("day")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${timeOfDay === "day" ? "bg-amber-500/30 text-amber-300" : "text-slate-400 hover:text-white"}`}
              title="Bright Day"
            >
              ☀️
            </button>
            <button
              type="button"
              onClick={() => setTimeOfDay("sunset")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${timeOfDay === "sunset" ? "bg-orange-500/30 text-orange-300" : "text-slate-400 hover:text-white"}`}
              title="Amber Sunset"
            >
              🌇
            </button>
            <button
              type="button"
              onClick={() => setTimeOfDay("night")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${timeOfDay === "night" ? "bg-indigo-500/30 text-indigo-300" : "text-slate-400 hover:text-white"}`}
              title="Starry Night"
            >
              🌌
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setIsSoundMuted(!isSoundMuted)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isSoundMuted
                ? "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                : "bg-emerald-500/20 border-emerald-400/40 text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.3)]"
            }`}
            title={isSoundMuted ? "Unmute Nature Audio Tones" : "Mute Sanctuary Sound"}
          >
            {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* View Mode Toggle: Focus vs Full Grove */}
          <button
            type="button"
            onClick={() => setViewMode(viewMode === "focus" ? "grove" : "focus")}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-bold text-slate-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {viewMode === "focus" ? (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Sanctuary Grove</span>
              </>
            ) : (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Care Focus</span>
              </>
            )}
          </button>

          {/* Adopt / Plant New Button */}
          <button
            type="button"
            onClick={() => {
              setAdoptName("");
              setAdoptIntention("");
              setIsAdoptionModalOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold font-mono text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(52,211,153,0.35)] transition-all cursor-pointer"
            id="adoptNewPlantOrPetBtn"
          >
            <Plus className="w-4 h-4" />
            <span>Plant / Adopt</span>
          </button>
        </div>
      </div>

      {/* ==========================================
          SANCTUARY CAROUSEL / SELECTOR TABS
      ========================================== */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10 select-none">
        {sanctuaryList.map((ent) => {
          const spec = SPECIES_CATALOG[ent.species] || SPECIES_CATALOG.sakura;
          const stage = spec.stages[Math.min(ent.stageIndex, spec.stages.length - 1)];
          const isSelected = ent.id === selectedEntityId;

          return (
            <button
              key={ent.id}
              type="button"
              onClick={() => setSelectedEntityId(ent.id)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl border transition-all cursor-pointer shrink-0 font-sans ${
                isSelected
                  ? "bg-gradient-to-r from-amber-400/20 via-amber-500/10 to-teal-500/10 border-amber-400/60 shadow-[0_0_15px_rgba(251,191,36,0.2)] text-white scale-[1.02]"
                  : "bg-black/30 border-white/5 hover:border-white/20 text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-lg">
                <span>{stage.emoji}</span>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-100">{ent.name}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-slate-400">
                    Lv.{ent.stageIndex + 1}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block font-mono">
                  {stage.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ==========================================
          VIEW 1: FULL SANCTUARY GROVE OVERVIEW
      ========================================== */}
      {viewMode === "grove" ? (
        <div className="mt-4 p-6 rounded-3xl bg-black/40 border border-white/10 relative min-h-[360px] flex flex-col justify-between overflow-hidden">
          {/* Grove Landscape Backdrop */}
          <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-emerald-950/70 via-teal-950/40 to-transparent pointer-events-none" />

          <div className="flex items-center justify-between z-10">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-amber-300 font-bold flex items-center gap-1.5">
                <span>🏞️</span>
                <span>The Living Grove Ecosystem</span>
              </span>
              <p className="text-[11px] text-slate-400 font-mono">
                {sanctuaryList.length} conscious lifeforms flourishing in your mindful sanctuary
              </p>
            </div>
            <button
              type="button"
              onClick={() => setViewMode("focus")}
              className="px-3 py-1 text-xs rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/40 font-mono font-bold hover:bg-amber-400/30 transition-all cursor-pointer"
            >
              Return to Care Studio →
            </button>
          </div>

          {/* Interactive Visual Diorama of all entities */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 my-8 z-10">
            {sanctuaryList.map((ent) => {
              const spec = SPECIES_CATALOG[ent.species] || SPECIES_CATALOG.sakura;
              const stage = spec.stages[Math.min(ent.stageIndex, spec.stages.length - 1)];

              return (
                <motion.div
                  key={ent.id}
                  whileHover={{ scale: 1.05, y: -4 }}
                  onClick={() => {
                    setSelectedEntityId(ent.id);
                    setViewMode("focus");
                  }}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-amber-400/50 hover:shadow-[0_0_20px_rgba(251,191,36,0.2)] transition-all cursor-pointer text-center relative group backdrop-blur-md"
                >
                  <div className="text-4xl sm:text-5xl my-2 animate-bounce" style={{ animationDuration: "3s" }}>
                    {stage.emoji}
                  </div>
                  <h4 className="text-xs font-bold text-white mt-1">{ent.name}</h4>
                  <span className="text-[10px] text-amber-300 font-mono block">
                    {stage.name}
                  </span>
                  <div className="w-full bg-black/50 h-1.5 rounded-full mt-2 overflow-hidden border border-white/5">
                    <div
                      className="bg-gradient-to-r from-emerald-400 to-amber-400 h-full"
                      style={{ width: `${Math.round((ent.xp / stage.xpRequired) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono mt-1 block">
                    Tap to care &amp; nurture
                  </span>
                </motion.div>
              );
            })}
          </div>

          <div className="text-center text-[11px] font-mono text-slate-400 z-10">
            🌿 Every daily check-in and moment of calm helps all your sanctuary trees and companions thrive.
          </div>
        </div>
      ) : (
        /* ==========================================
            VIEW 2: DEDICATED CARE & TAMAGOTCHI FOCUS STUDIO
        ========================================== */
        activeEntity && (
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: INTERACTIVE CREATURE / TREE DIORAMA (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div
                className={`relative rounded-3xl border ${activeCatalog.color} bg-black/40 p-6 flex flex-col items-center justify-between min-h-[380px] overflow-hidden shadow-inner`}
                id="interactiveCareCanvas"
              >
                {/* Floating Heart / Water / Sun Particles */}
                <AnimatePresence>
                  {floatingParticles.map((p) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 1, y: 0, scale: 0.8 }}
                      animate={{ opacity: 0, y: -60, scale: 1.4 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="absolute pointer-events-none text-2xl z-30 select-none"
                      style={{ left: `${p.x}%`, top: `${p.y}%` }}
                    >
                      {p.emoji}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Top Organism Header & Intention */}
                <div className="w-full flex items-center justify-between z-10 border-b border-white/5 pb-3">
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-extrabold text-white tracking-wide font-sans">
                        {activeEntity.name}
                      </h2>
                      <span className="text-[10px] font-mono bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                        Stage {activeEntity.stageIndex + 1} of {activeCatalog.stages.length}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 italic font-mono mt-0.5">
                      "{activeEntity.intention}"
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteOrganism(activeEntity.id, activeEntity.name)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border border-rose-500/20 transition-all cursor-pointer"
                    title="Release to Sacred Forest"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Companion Speech Bubble */}
                <AnimatePresence>
                  {activeSpeechBubble && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      className="z-20 bg-slate-900/95 border border-amber-400/40 text-amber-200 text-xs px-4 py-2 rounded-2xl shadow-xl max-w-[85%] text-center backdrop-blur-md font-sans my-2"
                    >
                      <span>💬 {activeSpeechBubble}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* MAIN INTERACTIVE VISUAL AVATAR */}
                <div
                  className="my-auto py-6 flex flex-col items-center justify-center cursor-pointer group select-none relative"
                  onClick={(e) => handleCareAction("pet", e)}
                  title="Tap / Click to gently pet & nurture"
                >
                  {/* Glowing Aura Ring */}
                  <div className="absolute w-44 h-44 rounded-full bg-gradient-to-tr from-amber-400/20 to-teal-400/20 blur-2xl group-hover:scale-125 transition-transform duration-700 pointer-events-none -z-10" />

                  {/* Stage Animated Emoji Graphic */}
                  <motion.div
                    whileHover={{ scale: 1.12, rotate: [0, -3, 3, 0] }}
                    whileTap={{ scale: 0.92 }}
                    className="text-7xl sm:text-8xl filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] transition-all select-none"
                  >
                    {currentStage.emoji}
                  </motion.div>

                  {/* Stage Name Badge */}
                  <div className="mt-3 bg-black/60 border border-white/10 px-3.5 py-1 rounded-full text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5 shadow-md">
                    <span>{currentStage.name}</span>
                    <span className="text-[10px] text-amber-400 font-normal">({currentStage.subtitle})</span>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    ✨ Click / Tap to pet &amp; send love (+22 XP)
                  </span>
                </div>

                {/* Pot / Bedding Ground Platform */}
                <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-white/5 pt-3 z-10">
                  <div className="flex items-center gap-1.5">
                    <span>Habitat:</span>
                    <span className="text-slate-200 font-bold capitalize">
                      {activeEntity.potOrBedding.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Planted: {new Date(activeEntity.plantedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* STAGE EVOLUTION XP PROGRESS BAR */}
              <div className="p-4 rounded-2xl bg-black/30 border border-white/10 text-left space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Evolution Growth Meter</span>
                  </span>
                  <span className="text-slate-300">
                    {activeEntity.xp} / {currentStage.xpRequired} XP ({Math.min(100, Math.round((activeEntity.xp / currentStage.xpRequired) * 100))}%)
                  </span>
                </div>

                <div className="w-full h-3 bg-slate-900 rounded-full border border-white/10 overflow-hidden relative">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-500 via-emerald-400 to-teal-400 rounded-full shadow-[0_0_12px_rgba(52,211,153,0.4)]"
                    style={{ width: `${Math.min(100, (activeEntity.xp / currentStage.xpRequired) * 100)}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (activeEntity.xp / currentStage.xpRequired) * 100)}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>

                <p className="text-[10px] text-slate-400 font-mono">
                  {activeEntity.stageIndex < activeCatalog.stages.length - 1
                    ? `Next Evolution: Reach ${currentStage.xpRequired} XP to grow into "${activeCatalog.stages[activeEntity.stageIndex + 1].name}".`
                    : "👑 Maximum Evolution Reached! This master tree/companion is in its sacred eternal form."}
                </p>
              </div>
            </div>

            {/* RIGHT COLUMN: TAMAGOTCHI VITALS & CARE ACTION DASHBOARD (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4 text-left">
              {/* TAMAGOTCHI VITAL METERS */}
              <div className="p-4 sm:p-5 rounded-3xl bg-black/30 border border-white/10 space-y-3.5">
                <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center justify-between">
                  <span>Sanctuary Vitals</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Status: Flourishing</span>
                </h4>

                <div className="space-y-2.5">
                  {/* Hydration */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="flex items-center gap-1.5 text-sky-300">
                        <Droplets className="w-3.5 h-3.5 text-sky-400" />
                        <span>Hydration</span>
                      </span>
                      <span className="font-bold text-white">{activeEntity.hydration}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                      <div className="bg-sky-400 h-full rounded-full transition-all duration-500" style={{ width: `${activeEntity.hydration}%` }} />
                    </div>
                  </div>

                  {/* Nourishment */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="flex items-center gap-1.5 text-amber-300">
                        <Utensils className="w-3.5 h-3.5 text-amber-400" />
                        <span>Nourishment</span>
                      </span>
                      <span className="font-bold text-white">{activeEntity.nourishment}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                      <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${activeEntity.nourishment}%` }} />
                    </div>
                  </div>

                  {/* Happiness */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="flex items-center gap-1.5 text-pink-300">
                        <Heart className="w-3.5 h-3.5 text-pink-400" />
                        <span>Love &amp; Happiness</span>
                      </span>
                      <span className="font-bold text-white">{activeEntity.happiness}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                      <div className="bg-pink-400 h-full rounded-full transition-all duration-500" style={{ width: `${activeEntity.happiness}%` }} />
                    </div>
                  </div>

                  {/* Cleanliness / Sunlight */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="flex items-center gap-1.5 text-yellow-300">
                        <Sun className="w-3.5 h-3.5 text-yellow-400" />
                        <span>Sunlight &amp; Cleanse</span>
                      </span>
                      <span className="font-bold text-white">{activeEntity.cleanliness}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                      <div className="bg-yellow-400 h-full rounded-full transition-all duration-500" style={{ width: `${activeEntity.cleanliness}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* DAILY TAMAGOTCHI CARE ACTIONS */}
              <div className="p-4 sm:p-5 rounded-3xl bg-black/40 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-100 font-mono uppercase tracking-wider">
                    Daily Care Rituals
                  </h4>
                  <span className="text-[10px] text-amber-300 font-mono">Earn Growth XP</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* Water Action */}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => handleCareAction("water", e)}
                    className="p-3 rounded-2xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/40 text-left transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">💧</span>
                      <span className="text-[9px] font-mono bg-sky-400/20 text-sky-300 px-1.5 py-0.5 rounded font-bold">+18 XP</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-xs font-bold text-sky-200 block">Water Roots</span>
                      <span className="text-[10px] text-sky-400/80 font-mono">Pure spring dew</span>
                    </div>
                  </motion.button>

                  {/* Nourish Action */}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => handleCareAction("nourish", e)}
                    className="p-3 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-left transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">🍎</span>
                      <span className="text-[9px] font-mono bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">+18 XP</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-xs font-bold text-amber-200 block">Nourish</span>
                      <span className="text-[10px] text-amber-400/80 font-mono">Organic nutrients</span>
                    </div>
                  </motion.button>

                  {/* Sunlight Action */}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => handleCareAction("sunlight", e)}
                    className="p-3 rounded-2xl bg-yellow-500/15 hover:bg-yellow-500/25 border border-yellow-400/40 text-left transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">☀️</span>
                      <span className="text-[9px] font-mono bg-yellow-400/20 text-yellow-300 px-1.5 py-0.5 rounded font-bold">+20 XP</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-xs font-bold text-yellow-200 block">Bathe in Sun</span>
                      <span className="text-[10px] text-yellow-400/80 font-mono">Warm 528Hz light</span>
                    </div>
                  </motion.button>

                  {/* Pet / Love Action */}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => handleCareAction("pet", e)}
                    className="p-3 rounded-2xl bg-pink-500/15 hover:bg-pink-500/25 border border-pink-400/40 text-left transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">💛</span>
                      <span className="text-[9px] font-mono bg-pink-400/20 text-pink-300 px-1.5 py-0.5 rounded font-bold">+22 XP</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-xs font-bold text-pink-200 block">Pet &amp; Comfort</span>
                      <span className="text-[10px] text-pink-400/80 font-mono">Loving touch</span>
                    </div>
                  </motion.button>
                </div>

                {/* Speak Positive Affirmation Full-Width Action */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={(e) => handleCareAction("affirmation", e)}
                  className="w-full p-3 rounded-2xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-amber-500/20 hover:from-purple-500/30 hover:to-amber-500/30 border border-purple-400/40 text-left transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">🌟</span>
                    <div>
                      <span className="text-xs font-bold text-purple-200 block">Whisper Loving Affirmation</span>
                      <span className="text-[10px] text-purple-300/80 font-mono">Send healing voice frequencies</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono bg-purple-400/20 text-purple-300 px-2 py-0.5 rounded font-bold border border-purple-400/30">
                    +30 XP
                  </span>
                </motion.button>
              </div>

              {/* COMPANION WISDOM / NANNY FROG ENCOURAGEMENT */}
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 text-left flex items-start gap-3">
                <span className="text-2xl select-none">🐸</span>
                <div>
                  <span className="text-xs font-bold text-emerald-300 font-mono block">Nanny Frog's Sanctuary Wisdom</span>
                  <p className="text-[11px] text-slate-300 font-sans mt-0.5 leading-relaxed">
                    "Every time you care for your tree or companion, you are practicing gentle devotion to your own healing heart."
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {/* ==========================================
          MODAL: ADOPT COMPANION OR PLANT SACRED SEED
      ========================================== */}
      <AnimatePresence>
        {isAdoptionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-xl bg-slate-950 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-5 text-left max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 text-lg">
                    🌱
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                      Plant Seed or Adopt Companion
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Choose what you wish to nurture into life
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAdoptionModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Step 1: Select Category (Tree vs Animal Companion) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider block">
                  1. Select Category
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setAdoptCategory("tree");
                      setAdoptSpecies("sakura");
                      setAdoptPotOrBedding("terracotta");
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                      adoptCategory === "tree"
                        ? "bg-emerald-500/20 border-emerald-400 text-white shadow-[0_0_15px_rgba(52,211,153,0.3)]"
                        : "bg-black/40 border-white/10 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span className="text-3xl">🌳</span>
                    <div>
                      <span className="text-xs font-bold block">Sacred Trees &amp; Flora</span>
                      <span className="text-[10px] text-slate-400 font-mono">Seed → Sprout → Ancient Tree</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAdoptCategory("pet");
                      setAdoptSpecies("frog");
                      setAdoptPotOrBedding("lily_pad");
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                      adoptCategory === "pet"
                        ? "bg-amber-500/20 border-amber-400 text-white shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                        : "bg-black/40 border-white/10 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span className="text-3xl">🐾</span>
                    <div>
                      <span className="text-xs font-bold block">Tamagotchi Companions</span>
                      <span className="text-[10px] text-slate-400 font-mono">Spawn/Egg → Companion</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Step 2: Choose Species */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider block">
                  2. Choose Variety / Lifeform
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {adoptCategory === "tree" ? (
                    <>
                      {[
                        { id: "sakura", name: "Sakura Cherry", icon: "🌸", desc: "Gentle presence" },
                        { id: "oak", name: "Resilience Oak", icon: "🌳", desc: "Unshakeable roots" },
                        { id: "bonsai", name: "Zen Bonsai", icon: "🌲", desc: "Patience & focus" },
                        { id: "willow", name: "Silver Willow", icon: "🌿", desc: "Emotional fluidity" },
                        { id: "lotus", name: "Water Lotus", icon: "🪷", desc: "Pure enlightenment" },
                      ].map((spec) => (
                        <button
                          key={spec.id}
                          type="button"
                          onClick={() => setAdoptSpecies(spec.id as TreeSpecies)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            adoptSpecies === spec.id
                              ? "bg-emerald-500/25 border-emerald-400 text-white shadow-md"
                              : "bg-black/40 border-white/10 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <span className="text-2xl block">{spec.icon}</span>
                          <span className="text-xs font-bold text-slate-100 block mt-1">{spec.name}</span>
                          <span className="text-[9px] text-slate-400 font-mono block">{spec.desc}</span>
                        </button>
                      ))}
                    </>
                  ) : (
                    <>
                      {[
                        { id: "frog", name: "Zen Pond Frog", icon: "🐸", desc: "Spawn → Nanny Frog" },
                        { id: "dog", name: "Guardian Pup", icon: "🐕", desc: "Puppy → Spirit Dog" },
                        { id: "cat", name: "Mindful Cat", icon: "🐈", desc: "Kitten → Celestial Cat" },
                        { id: "butterfly", name: "Metamorphosis", icon: "🦋", desc: "Caterpillar → Butterfly" },
                        { id: "bird", name: "Songbird Phoenix", icon: "🕊️", desc: "Egg → Solar Phoenix" },
                      ].map((spec) => (
                        <button
                          key={spec.id}
                          type="button"
                          onClick={() => setAdoptSpecies(spec.id as PetSpecies)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            adoptSpecies === spec.id
                              ? "bg-amber-500/25 border-amber-400 text-white shadow-md"
                              : "bg-black/40 border-white/10 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <span className="text-2xl block">{spec.icon}</span>
                          <span className="text-xs font-bold text-slate-100 block mt-1">{spec.name}</span>
                          <span className="text-[9px] text-slate-400 font-mono block">{spec.desc}</span>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Step 3: Choose Pot or Bedding Habitat */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider block">
                  3. Select Pot or Habitat Basin
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(adoptCategory === "tree" ? POT_CHOICES : BEDDING_CHOICES).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAdoptPotOrBedding(item.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                        adoptPotOrBedding === item.id
                          ? "bg-white/10 border-white/40 text-white shadow-md"
                          : "bg-black/40 border-white/5 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <span className="text-xs font-bold block text-slate-200">{item.name}</span>
                        <span className="text-[9px] text-slate-400 font-mono block">{item.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 4: Name and Intention */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider block mb-1">
                    4. Give a Name
                  </label>
                  <input
                    type="text"
                    value={adoptName}
                    onChange={(e) => setAdoptName(e.target.value)}
                    placeholder={adoptCategory === "tree" ? "e.g., Willow of Serenity, Sakura Bloom..." : "e.g., Barnaby, Luna, Zenny..."}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 font-sans focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider block mb-1">
                    5. Set a Mindful Intention or Wish (Optional)
                  </label>
                  <input
                    type="text"
                    value={adoptIntention}
                    onChange={(e) => setAdoptIntention(e.target.value)}
                    placeholder="e.g., To remind me to breathe and take small gentle steps forward."
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 font-sans focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAdoptionModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!adoptName.trim()}
                  onClick={handleConfirmAdoption}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold font-mono text-xs shadow-[0_0_15px_rgba(52,211,153,0.4)] disabled:opacity-50 transition-all cursor-pointer"
                >
                  Plant / Adopt Into Sanctuary ✨
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==========================================
          MODAL: CELEBRATION EVOLUTION LEVEL UP
      ========================================== */}
      <AnimatePresence>
        {evolutionCelebration && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-400/60 rounded-3xl p-6 shadow-[0_0_50px_rgba(251,191,36,0.3)] text-center space-y-4 relative overflow-hidden"
            >
              {/* Confetti Glow Background */}
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/10 via-pink-400/10 to-teal-400/10 pointer-events-none -z-10" />

              <div className="text-6xl my-2 animate-bounce">
                {evolutionCelebration.emoji}
              </div>

              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-300 block">
                  ✨ Stage Evolution Breakthrough! ✨
                </span>
                <h3 className="text-xl font-extrabold text-white font-sans mt-1">
                  {evolutionCelebration.organismName} has Evolved!
                </h3>
              </div>

              <div className="p-3 bg-black/50 border border-white/10 rounded-2xl text-xs font-mono space-y-1">
                <div className="flex items-center justify-center gap-2 text-slate-400">
                  <span>{evolutionCelebration.oldStage}</span>
                  <span>→</span>
                  <span className="font-bold text-emerald-300">{evolutionCelebration.newStage}</span>
                </div>
                <p className="text-[11px] text-slate-300 font-sans mt-1">
                  Your daily devotion and loving care have brought forth new life and inner strength.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEvolutionCelebration(null)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-bold font-mono text-xs shadow-lg transition-all cursor-pointer"
              >
                Honor &amp; Celebrate Evolution 🌟
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default ZenSanctuary;
