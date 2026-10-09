export interface ReflectionPrompt {
  id: string;
  focus: string;
  emoji: string;
  title: string;
  text: string;
  tag: string;
}

export const RESILIENCE_FOCUS_PROMPTS: Record<string, ReflectionPrompt[]> = {
  "Trauma Recovery": [
    {
      id: "tr-1",
      focus: "Trauma Recovery",
      emoji: "🛡️",
      title: "Boundary of Peace",
      text: "Today, what is one boundary that protected my peace, and how did holding it feel in my body?",
      tag: "Boundaries"
    },
    {
      id: "tr-2",
      focus: "Trauma Recovery",
      emoji: "⚓",
      title: "Grounding in the Now",
      text: "When past distress or emotional flashbacks surface, what grounded truth reminds me that I am safe in this room right now?",
      tag: "Safety"
    },
    {
      id: "tr-3",
      focus: "Trauma Recovery",
      emoji: "🦁",
      title: "Honoring Survival",
      text: "What part of my survival story am I ready to honor with compassion today instead of judging?",
      tag: "Self-Compassion"
    },
    {
      id: "tr-4",
      focus: "Trauma Recovery",
      emoji: "🌱",
      title: "Reclaiming My Voice",
      text: "What does speaking my authentic truth feel like today, and where can I give myself permission to be heard?",
      tag: "Sovereignty"
    },
    {
      id: "tr-5",
      focus: "Trauma Recovery",
      emoji: "🕯️",
      title: "Deconstructing a Trigger",
      text: "I want to explore a trigger that caught me off-guard recently and understand the emotional need underneath it...",
      tag: "Awareness"
    },
    {
      id: "tr-6",
      focus: "Trauma Recovery",
      emoji: "🏰",
      title: "Evolution of Safety",
      text: "How has my definition of personal safety evolved since the most difficult seasons of my journey?",
      tag: "Growth"
    },
    {
      id: "tr-7",
      focus: "Trauma Recovery",
      emoji: "🤝",
      title: "Navigating Trust",
      text: "Help me work through feelings of guardedness or isolation while staying anchored in healthy discernment and strength...",
      tag: "Trust"
    },
    {
      id: "tr-8",
      focus: "Trauma Recovery",
      emoji: "🏆",
      title: "The Scar of Resilience",
      text: "What has surviving life's heaviest storms revealed about the unbreakable lion inside me?",
      tag: "Courage"
    }
  ],

  "Anxiety Relief": [
    {
      id: "ar-1",
      focus: "Anxiety Relief",
      emoji: "🌬️",
      title: "Calm Observation",
      text: "What catastrophic thought is trying to convince me of danger right now, and what is the calm, factual reality?",
      tag: "Cognitive Reframe"
    },
    {
      id: "ar-2",
      focus: "Anxiety Relief",
      emoji: "⚖️",
      title: "The 10% Control Rule",
      text: "Let's dissect the worry weighing on my mind: what 10% is within my direct control today, and how can I release the rest?",
      tag: "Control"
    },
    {
      id: "ar-3",
      focus: "Anxiety Relief",
      emoji: "🌊",
      title: "Riding the Wave",
      text: "My body feels jittery and on edge today. Help me ground my breath and unpack what's creating this tension...",
      tag: "Somatic Calm"
    },
    {
      id: "ar-4",
      focus: "Anxiety Relief",
      emoji: "🧠",
      title: "Wisest Perspective",
      text: "What would my wisest, unshakeable self tell me about the deadline or situation I am currently dreading?",
      tag: "Higher Self"
    },
    {
      id: "ar-5",
      focus: "Anxiety Relief",
      emoji: "👣",
      title: "5-Sense Anchor",
      text: "When I feel the sudden surge of overwhelm, what physical sensations in this space can pull me back to stillness?",
      tag: "Grounding"
    },
    {
      id: "ar-6",
      focus: "Anxiety Relief",
      emoji: "⏳",
      title: "Releasing False Urgency",
      text: "Help me reframe this feeling of frantic urgency so I can breathe, prioritize, and move at a steady, human pace today...",
      tag: "Pacing"
    },
    {
      id: "ar-7",
      focus: "Anxiety Relief",
      emoji: "🌅",
      title: "Anticipatory Ease",
      text: "I notice anticipatory anxiety creeping in about tomorrow. How can I protect my peace and rest deeply this evening?",
      tag: "Evening Peace"
    },
    {
      id: "ar-8",
      focus: "Anxiety Relief",
      emoji: "✨",
      title: "Releasing Perfection",
      text: "Today I want to challenge the pressure of perfectionism and practice being completely at ease with 'good enough'...",
      tag: "Grace"
    }
  ],

  "Nervous System Regulation": [
    {
      id: "ns-1",
      focus: "Nervous System Regulation",
      emoji: "🫀",
      title: "Softening Armor",
      text: "Where in my body am I holding physical tension or armor right now, and what gentle care does it need to soften?",
      tag: "Body Scan"
    },
    {
      id: "ns-2",
      focus: "Nervous System Regulation",
      emoji: "🌿",
      title: "Resetting the Freeze",
      text: "I've been feeling stuck in hyper-vigilance or shutdown mode lately. Guide me through gentle micro-steps to reset my system...",
      tag: "Somatic Reset"
    },
    {
      id: "ns-3",
      focus: "Nervous System Regulation",
      emoji: "🪷",
      title: "Vagus Nerve Soother",
      text: "What soothing sounds, visual calm, or slow breathing rhythms can I introduce today to signal biological safety to my nervous system?",
      tag: "Vagus Nerve"
    },
    {
      id: "ns-4",
      focus: "Nervous System Regulation",
      emoji: "☕",
      title: "Rest Over Output",
      text: "How can I balance periods of high cognitive work with genuine, guilt-free somatic rest pauses today?",
      tag: "Rest Rhythms"
    },
    {
      id: "ns-5",
      focus: "Nervous System Regulation",
      emoji: "🔄",
      title: "Regulating Transitions",
      text: "Let's review my morning and evening transitions to see where my nervous system feels overstimulated or rushed...",
      tag: "Daily Rhythm"
    },
    {
      id: "ns-6",
      focus: "Nervous System Regulation",
      emoji: "🧘",
      title: "Baseline Recovery",
      text: "What is one gentle grounding movement or slow physiological sigh that reliably brings me back to baseline when stressed?",
      tag: "Breathwork"
    },
    {
      id: "ns-7",
      focus: "Nervous System Regulation",
      emoji: "🛋️",
      title: "Post-Overwhelm Care",
      text: "I felt emotionally hijacked or depleted earlier. Help me map out how my system responded and how to nurse it back to calm...",
      tag: "Recovery"
    },
    {
      id: "ns-8",
      focus: "Nervous System Regulation",
      emoji: "🌙",
      title: "Sanctuary of Stillness",
      text: "How can I honor my biological need for quiet space without feeling guilty or unproductive?",
      tag: "Stillness"
    }
  ],

  "Grief & Healing": [
    {
      id: "gh-1",
      focus: "Grief & Healing",
      emoji: "💜",
      title: "Holding the Wave",
      text: "What wave of sorrow or missing someone is visiting my heart today, and how can I give it gentle room to breathe?",
      tag: "Validation"
    },
    {
      id: "gh-2",
      focus: "Grief & Healing",
      emoji: "💧",
      title: "Unspoken Tears",
      text: "It feels exhausting pretending everything is fine. Help me hold sacred space for the thoughts and tears I haven't expressed yet...",
      tag: "Sacred Space"
    },
    {
      id: "gh-3",
      focus: "Grief & Healing",
      emoji: "🕯️",
      title: "Enduring Love",
      text: "What is a treasured memory, shared value, or love that remains unbroken despite the physical absence or loss?",
      tag: "Remembrance"
    },
    {
      id: "gh-4",
      focus: "Grief & Healing",
      emoji: "🌻",
      title: "Joy Without Guilt",
      text: "I experienced a moment of joy or smiling today, but guilt crept in afterward. Can we explore this complex tender feeling?",
      tag: "Emotional Range"
    },
    {
      id: "gh-5",
      focus: "Grief & Healing",
      emoji: "🕊️",
      title: "Ritual of Comfort",
      text: "What quiet ritual of remembrance or comforting habit can I cultivate today to soothe my aching spirit?",
      tag: "Rituals"
    },
    {
      id: "gh-6",
      focus: "Grief & Healing",
      emoji: "🐸",
      title: "Carrying the Ache",
      text: "Healing doesn't mean forgetting; it means learning how to carry love alongside the ache. Let's reflect on this balance...",
      tag: "Nanny Wisdom"
    },
    {
      id: "gh-7",
      focus: "Grief & Healing",
      emoji: "⚓",
      title: "Anchoring the Storm",
      text: "When memories or unexpected anniversaries knock the wind out of me, what anchors can hold my heart steady?",
      tag: "Anchors"
    },
    {
      id: "gh-8",
      focus: "Grief & Healing",
      emoji: "💌",
      title: "Words from the Heart",
      text: "What tender words would my loved one or wisest guardian whisper to my soul right at this very moment?",
      tag: "Compassion"
    }
  ],

  "Mindfulness & Presence": [
    {
      id: "mp-1",
      focus: "Mindfulness & Presence",
      emoji: "👁️",
      title: "The Present Truth",
      text: "If I pause all future anticipation and past regret right this second, what is genuinely true and peaceful about this moment?",
      tag: "Here & Now"
    },
    {
      id: "mp-2",
      focus: "Mindfulness & Presence",
      emoji: "🍃",
      title: "Ordinary Wonder",
      text: "What is one ordinary detail in my physical surroundings today that deserves my full, unhurried, grateful attention?",
      tag: "Gratitude"
    },
    {
      id: "mp-3",
      focus: "Mindfulness & Presence",
      emoji: "☁️",
      title: "Passing Clouds",
      text: "How can I practice observing thoughts like passing clouds in the sky today without attaching identity or worry to them?",
      tag: "Detachment"
    },
    {
      id: "mp-4",
      focus: "Mindfulness & Presence",
      emoji: "🍵",
      title: "Sensory Immersion",
      text: "Let's explore a 3-minute sensory reset to dissolve cognitive clutter and anchor my awareness in the present...",
      tag: "Sensory Reset"
    },
    {
      id: "mp-5",
      focus: "Mindfulness & Presence",
      emoji: "🚶",
      title: "Mindful Transition",
      text: "Where did my mind wander during routine chores today, and how can I bring mindful presence to my very next action?",
      tag: "Daily Practice"
    },
    {
      id: "mp-6",
      focus: "Mindfulness & Presence",
      emoji: "👂",
      title: "Generous Listening",
      text: "What does it feel like to listen deeply to someone today without mentally formulating my response while they speak?",
      tag: "Deep Listening"
    },
    {
      id: "mp-7",
      focus: "Mindfulness & Presence",
      emoji: "🪞",
      title: "Stillness Over Hurry",
      text: "I want to notice the subtle threshold between feeling hurried and intentionally choosing stillness. Guide me through this...",
      tag: "Inner Peace"
    },
    {
      id: "mp-8",
      focus: "Mindfulness & Presence",
      emoji: "🌸",
      title: "Patience with Blooming",
      text: "As Nanny Frog says, 'The lily does not rush the sun.' Where in my life can I stop forcing and trust the natural unfolding?",
      tag: "Patience"
    }
  ],

  "General Well-being": [
    {
      id: "gw-1",
      focus: "General Well-being",
      emoji: "☀️",
      title: "Energy & Vitality",
      text: "What is the single most loving, restorative choice I can make for my physical and mental energy today?",
      tag: "Self-Care"
    },
    {
      id: "gw-2",
      focus: "General Well-being",
      emoji: "🪜",
      title: "The Micro-Victory",
      text: "What quiet progress or micro-victory did I achieve today that I haven't given myself proper credit for?",
      tag: "Celebration"
    },
    {
      id: "gw-3",
      focus: "General Well-being",
      emoji: "💧",
      title: "Three Vital Pillars",
      text: "Looking honestly at my sleep, hydration, and movement: which pillar needs an extra measure of kindness this week?",
      tag: "Holistic Health"
    },
    {
      id: "gw-4",
      focus: "General Well-being",
      emoji: "🧭",
      title: "Aligning Priorities",
      text: "How can I align my hours today with what truly brings me peace and purpose rather than what merely screams the loudest?",
      tag: "Alignment"
    },
    {
      id: "gw-5",
      focus: "General Well-being",
      emoji: "🤝",
      title: "Authentic Connection",
      text: "Who in my life or community could I reach out to today for a moment of genuine, warm connection?",
      tag: "Connection"
    },
    {
      id: "gw-6",
      focus: "General Well-being",
      emoji: "🔋",
      title: "Protecting My Battery",
      text: "What drained my battery the most this past week, and what kind, firm boundary can I set to protect my reserves?",
      tag: "Energy Balance"
    },
    {
      id: "gw-7",
      focus: "General Well-being",
      emoji: "🎨",
      title: "Spark of Curiosity",
      text: "What joyful curiosity, creative impulse, or simple playful habit would I love to explore without any pressure to succeed?",
      tag: "Joy"
    },
    {
      id: "gw-8",
      focus: "General Well-being",
      emoji: "⚖️",
      title: "Equilibrium Check",
      text: "Let's do an equilibrium check: where in my life do I feel fulfilled, and where am I feeling stretched too thin?",
      tag: "Life Balance"
    }
  ]
};

/**
 * Returns 3 random, non-repeating prompts for the given resilience focus.
 * Falls back to "General Well-being" if the focus is unrecognized.
 */
export function getRandomReflectionPrompts(focus: string, count = 3): ReflectionPrompt[] {
  const pool = RESILIENCE_FOCUS_PROMPTS[focus] || RESILIENCE_FOCUS_PROMPTS["General Well-being"];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
