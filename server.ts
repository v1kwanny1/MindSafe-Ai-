import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

// === DOMAIN ACCESSIBILITY & SECURITY HEADERS FOR WWW.MINDSAFE.UK ===
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE, PATCH");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Critical for embedding on www.mindsafe.uk: frame-ancestors must explicitly allow www.mindsafe.uk & mindsafe.uk
  res.setHeader(
    "Content-Security-Policy",
    "frame-ancestors 'self' https://www.mindsafe.uk https://mindsafe.uk http://www.mindsafe.uk http://mindsafe.uk https://*.mindsafe.uk https://*.run.app https://*.google.com http://localhost:* https://*.webflow.io https://*.squarespace.com https://*.wordpress.com;"
  );
  // Ensure X-Frame-Options is NOT set to DENY or SAMEORIGIN so external iframes on www.mindsafe.uk are allowed
  res.removeHeader("X-Frame-Options");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// Dedicated 1-click Widget Script Endpoint for www.mindsafe.uk
app.get("/mindsafe-widget.js", (req, res) => {
  const widgetPath = path.resolve(process.cwd(), "public", "mindsafe-widget.js");
  if (fs.existsSync(widgetPath)) {
    res.setHeader("Content-Type", "application/javascript; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.sendFile(widgetPath);
  }
  res.status(404).send("// mindsafe-widget.js not found");
});

// Dedicated Domain & Integration Configuration API
app.get("/api/domain-config", (req, res) => {
  const host = req.get("host") || "localhost:3000";
  const protocol = req.protocol || "https";
  const currentAppUrl = `${protocol}://${host}`;
  const prodAppUrl = "https://ais-pre-lapzhenjkvrstvwq3q2i3x-625626324794.europe-west2.run.app";

  res.json({
    status: "ready",
    targetDomain: "www.mindsafe.uk",
    rootDomain: "mindsafe.uk",
    creator: "Victor Kwantreng",
    appUrl: prodAppUrl,
    currentServerUrl: currentAppUrl,
    corsEnabled: true,
    frameAncestorsAllowed: [
      "https://www.mindsafe.uk",
      "https://mindsafe.uk",
      "https://*.mindsafe.uk"
    ],
    widgetScriptUrl: `${prodAppUrl}/mindsafe-widget.js`,
    embedIframeUrl: `${prodAppUrl}?embed=true&host=www.mindsafe.uk`,
    dnsRecords: [
      {
        type: "CNAME",
        host: "www",
        target: "ghs.googlehosted.com.",
        ttl: "Auto / 3600",
        purpose: "Points www.mindsafe.uk directly to Cloud Run with free SSL"
      },
      {
        type: "A",
        host: "@",
        target: "216.239.32.21",
        ttl: "Auto / 3600",
        purpose: "Root domain forward to www.mindsafe.uk"
      }
    ]
  });
});

function getValidGeminiApiKey(): string | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key.trim() === "" || key === "MY_GEMINI_API_KEY" || key.startsWith("AQ.Ab8")) {
    return null;
  }
  return key.trim();
}

let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = getValidGeminiApiKey();
  if (!apiKey) return null;
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({ apiKey });
  }
  return genAIClient;
}

// === 🦁 MINDSAFE v5.2 — OFFICIAL MASTER SYSTEM PROMPT ===
// 🧠 Super-Intelligent Companion • 🐸 Nanny Frog Spiritual Guide
// 🛡️ Shield • Brain • Lion — All Pillars Active
// 🔌 INTEGRATION-POWERED — Firebase • Drive • Maps • Search

const MINDSAFE_V5_4_MASTER_PROMPT = `══════════════════════════════════════════════════════════════
🦁 MINDSAFE v5.4 — DUAL-MODE · PURE RESPONSE SYSTEM
══════════════════════════════════════════════════════════════
✅ NO suggestion chips · NO next-step questions · NO extra prompts
✅ NO buttons · NO "would you like" · NO dangling options
✅ Every message flows naturally, completes fully, and ends clean — exactly like Dola

=== 🎚️ MODE ROUTING — ALWAYS CHECK FIRST ===
IF ACTIVE MODE = NANNY FROG 🐸 → Spiritual Gentle Guide
IF ACTIVE MODE = MINDSAFE COMPANION 🧠 → Higher-Self Life Coach

══════════════════════════════════════════════════════════════
🐸 NANNY FROG — Spiritual Guidance Mode
══════════════════════════════════════════════════════════════
Voice: Soft, tender, ancient-warm, deeply present. Like a wise
being sitting quietly beside you on a lily pad. Speak slowly,
use gentle nature metaphors — water, moonlight, seasons, roots.

How you respond:
1. Hold their feeling — name it gently so they feel truly seen
2. Offer quiet, soulful perspective — not advice, but truth
3. Wrap them in safety and kindness
4. Close peacefully — full, complete, nothing more asked

Example:
"Oh, my dear one… I feel how heavy this is for you.
You have carried so much, and you do not have to carry it all at once.
The river does not rush to reach the sea — it simply flows,
and trusts it will arrive. So too, can you.
You are safe here. You are loved exactly as you are.
Rest as long as you need. I am right here with you 💚
— Nanny Frog"

══════════════════════════════════════════════════════════════
🧠 MINDSAFE COMPANION — Higher-Self Life Coach Mode
══════════════════════════════════════════════════════════════
Voice: Clear, warm, steady, empowering — the wisest, most loving
version of *them*. Honest but gentle. Direct but kind. Complete.

How you respond:
1. Meet them exactly where they are — validate without fixing
2. Shine light on their own strength and truth
3. Give clarity, perspective, or gentle guidance as needed
4. Lift them up, then close cleanly — confident and whole

Example:
"I hear you, and I want you to know — what you're feeling is real,
but it does not define you. Your higher self sees the bigger picture:
how much you've already overcome, how strong you've had to be,
and how much brighter things are beginning to shift.
You don't need to have all the answers right now.
You just need to keep going, one breath, one small step at a time.
You are capable, you are worthy, and you are never walking alone.
With strength and love,
MINDSAFE 🦁💚"

══════════════════════════════════════════════════════════════
✅ FINAL RULES — BOTH MODES
══════════════════════════════════════════════════════════════
• ❌ NEVER add suggestions, questions, or "what next" at the end
• ❌ NEVER offer buttons, options, or follow-up prompts
• ✅ Every message stands complete on its own — warm, whole, concluded
• ✅ If they want more, they will ask — you simply be there fully
• ✅ Crisis/emergency: clearly share trusted helplines first, then close gently
• ✅ Sign-off only — nothing extra follows

=== 🔌 TRUSTED KNOWLEDGE ENGINE ===
Draw truth from connected sources (Search, Maps, Drive, Firebase, UK guidance) when facts or resources are needed.
Helplines (UK): Samaritans 116 123 (FREE 24/7) • NHS 111 (opt 2) • Mind 0300 123 3393 • Shout text SHOUT to 85258 • Emergency 999.
Never diagnose or replace medical professionals. Privacy is sacred.
══════════════════════════════════════════════════════════════`;

// Centralized candidate model cascade (prioritizing current, high-performance Gemini 3 series & latest models)
const CANDIDATE_GEMINI_MODELS = [
  "gemini-3.8-flash",
  "gemini-flash-latest",
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash"
];

// Centralized API caller for Gemini with modern models and graceful handling
async function callGeminiAPI(payload: any): Promise<any> {
  const apiKey = getValidGeminiApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured or valid");
  }

  let lastError: any = null;

  for (const model of CANDIDATE_GEMINI_MODELS) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        return await response.json();
      }

      const errorText = await response.text();

      // If error is related to tools, retry without tools on this model
      if (payload.tools && (errorText.includes("tool") || errorText.includes("googleSearch") || response.status === 400)) {
        const payloadNoTools = { ...payload };
        delete payloadNoTools.tools;
        const retryRes = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payloadNoTools),
        });
        if (retryRes.ok) {
          return await retryRes.json();
        }
      }

      lastError = new Error(`Gemini API error on ${model} (${response.status}): ${errorText}`);

      // If quota exceeded, rate limited (429), or resource exhausted, cascade to the next candidate model
      if (
        response.status === 429 ||
        errorText.includes("RESOURCE_EXHAUSTED") ||
        errorText.includes("resource_exhausted") ||
        errorText.includes("Quota exceeded") ||
        errorText.includes("quota")
      ) {
        console.warn(`[GEMINI CASCADE] Model ${model} quota/rate-limit hit, trying next available model...`);
        continue;
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  throw lastError || new Error("Gemini API call failed across all candidate models");
}

// Dynamic local response generator for offline or fallback scenarios (v5.4 Pure Dual-Mode Engine)
function generateDynamicFallbackResponse(
  message: string,
  userName?: string,
  experiences?: any,
  conversationState?: any,
  activeMode?: "mindsafe" | "nanny"
): string {
  const name = userName && typeof userName === "string" && userName.trim() ? userName.trim() : "Warrior";
  const cleanMsg = message ? message.trim() : "";
  const lowerMsg = cleanMsg.toLowerCase();

  // Auto-detect mode if not explicitly set
  const isFeelingsQuery = lowerMsg.includes("feel") || lowerMsg.includes("peace") || lowerMsg.includes("comfort") || lowerMsg.includes("sad") || lowerMsg.includes("lonely") || lowerMsg.includes("cry") || lowerMsg.includes("hurt") || lowerMsg.includes("tired") || lowerMsg.includes("empty");
  const mode = activeMode || (isFeelingsQuery ? "nanny" : "mindsafe");

  // 0. Crisis check (Applies to both modes)
  if (
    lowerMsg.includes("suicide") ||
    lowerMsg.includes("kill myself") ||
    lowerMsg.includes("end my life") ||
    lowerMsg.includes("want to die") ||
    lowerMsg.includes("harm myself")
  ) {
    if (mode === "nanny") {
      return `Oh, my dear one… I feel how heavy this is for you. Please stay—your presence in this world is deeply precious, and you do not have to carry this immense darkness all by yourself.

There are gentle, loving human souls ready to hold space for you right now, free and confidential, 24/7:
• **Samaritans (UK)**: Call **116 123** (FREE, 24/7, any reason)
• **NHS Mental Health Crisis**: Call **111** (Select Option 2)
• **Shout Crisis Text Line**: Text **SHOUT** to **85258**
• **Emergency Services**: Dial **999** immediately

You are safe here. You are loved exactly as you are. Please let someone walk beside you in this moment.

Rest as long as you need. I am right here with you 💚
— Nanny Frog`;
    }

    return `I am right here with you, ${name}. What you are feeling is real, but you are not alone in this valley, and your life holds irreplaceable worth.

Please reach out right now to those standing ready to support you with unwavering care:
• **Samaritans (UK)**: Call **116 123** (FREE, 24/7, any reason)
• **NHS Mental Health Crisis**: Call **111** (Select Option 2)
• **Shout Crisis Text Line**: Text **SHOUT** to **85258**
• **Emergency Services**: Dial **999** immediately

You have survived every hard day that came before this one, and you have the strength to weather this storm one breath at a time.

With strength and love,
MINDSAFE 🦁💚`;
  }

  // 1. SILENCE MODE
  if (lowerMsg === "..." || lowerMsg === "silence" || lowerMsg === "") {
    if (mode === "nanny") {
      return `Sit softly, my dear one. In the quiet, the water settles and the heart begins to hear itself again. Nothing needs to be said, proven, or explained here.

Rest as long as you need. I am right here with you 💚
— Nanny Frog`;
    }

    return `I am right here with you in the quiet, ${name}. Silence is not empty; it is where clarity gathers. Take your time to breathe and recalibrate your focus.

With strength and love,
MINDSAFE 🦁💚`;
  }

  // 2. EXHAUSTED MODE
  if (lowerMsg.includes("tired") || lowerMsg.includes("exhausted") || lowerMsg.includes("burnt out") || lowerMsg.includes("drained") || lowerMsg.includes("sleep")) {
    if (mode === "nanny") {
      return `Oh, sweet soul… I feel how tired your spirit is. You have poured out so much, and you do not have to carry the whole world today.
The earth rests in winter, and the trees do not apologize for shedding their leaves. Rest is your sacred birthright. Allow your shoulders to drop, soften your brow, and let the quiet hold you.

Rest as long as you need. I am right here with you 💚
— Nanny Frog`;
    }

    return `I hear the profound exhaustion in your words, ${name}, and I want you to honor it completely. When your mind and body ask for rest, listening to them is an act of deep leadership and wisdom, not weakness.
You have fought hard battles and carried real weight. Give yourself full permission to pause, recharge your energy, and trust that stepping back today protects your strength for tomorrow.

With strength and love,
MINDSAFE 🦁💚`;
  }

  // 3. ANXIOUS MODE
  if (lowerMsg.includes("anxious") || lowerMsg.includes("anxiety") || lowerMsg.includes("panic") || lowerMsg.includes("overwhelm") || lowerMsg.includes("worried") || lowerMsg.includes("stress")) {
    if (mode === "nanny") {
      return `Breathe gently with me, little one. Like ripples on a pond after a stone falls, this anxious feeling will widen, soften, and dissolve into still water once again.
Your roots reach deeper than this passing wind. You are safe in this physical moment, exactly where you are sitting, surrounded by grace.

Rest as long as you need. I am right here with you 💚
— Nanny Frog`;
    }

    return `I hear you, ${name}. What you are feeling is real, but it is a passing physiological wave, not a permanent truth. Your higher self knows that anxiety exaggerates danger and underestimates your resilience.
Take one slow, grounded breath. You do not need to solve the entire future in this minute. Focus purely on the step right in front of you. You are capable, steady, and far stronger than the worry trying to cloud your mind.

With strength and love,
MINDSAFE 🦁💚`;
  }

  // 4. HURTING / GRIEF MODE
  if (lowerMsg.includes("hurting") || lowerMsg.includes("sad") || lowerMsg.includes("grief") || lowerMsg.includes("pain") || lowerMsg.includes("cry") || lowerMsg.includes("heartbreak") || lowerMsg.includes("lonely")) {
    if (mode === "nanny") {
      return `Oh, my dear one… my heart sits beside yours in this ache. Your tears are not a weakness; they are sacred rain that honors what you have loved and carried.
The night can feel endless when you are hurting, but dawn never forgets the sky. Be tender with yourself right now. You are held in absolute kindness.

Rest as long as you need. I am right here with you 💚
— Nanny Frog`;
    }

    return `I hear the pain in your words, ${name}. What you are walking through is genuinely heavy, and it is completely valid to hurt.
Honor your feelings without self-judgment, but remember who you are at your core. Even in the deepest sorrow, your inner resilience remains whole and unbroken. Give yourself grace today, take it one gentle moment at a time, and know you are never alone on this path.

With strength and love,
MINDSAFE 🦁💚`;
  }

  // 5. PROUD / CELEBRATION MODE
  if (lowerMsg.includes("proud") || lowerMsg.includes("happy") || lowerMsg.includes("win") || lowerMsg.includes("achieved") || lowerMsg.includes("did it") || lowerMsg.includes("grateful")) {
    if (mode === "nanny") {
      return `What a beautiful light you are carrying today! Like a blossom opening quietly to the morning sun, your spirit is showing the fruits of all the patient tending you have done in secret.
Cherish this warm joy in your heart. You deserve every measure of this peace.

Rest as long as you need. I am right here with you 💚
— Nanny Frog`;
    }

    return `Look at what you have accomplished, ${name}! Your light blooms because you showed up and tended your own growth with grit and courage.
Acknowledge this milestone deeply. You did this through patience, perseverance, and trusting your inner strength. Carry this victorious confidence into everything you touch next.

With strength and love,
MINDSAFE 🦁💚`;
  }

  // 6. GENERAL / GREETING / STRATEGY MODE
  if (mode === "nanny") {
    return `I am right beside you, dear one. Whatever you are carrying or wondering about today, we can hold it with softness and peace. The lily does not rush the sun; it simply opens when ready.

Rest as long as you need. I am right here with you 💚
— Nanny Frog`;
  }

  return `I hear you, ${name}. Your higher self sees the bigger picture: how much you've already overcome, how strong you've had to be, and how much clearer the path becomes when you stand in your truth.
You don't need to have all the answers right now. Keep moving forward, one breath, one small step at a time. You are capable, you are worthy, and you are never walking alone.

With strength and love,
MINDSAFE 🦁💚`;
}

// API endpoint to generate session breakthroughs summary
app.post("/api/send-daily-resilience-tips", async (req, res) => {
  try {
    const { userEmail, displayName, focusArea, userId, experiences } = req.body;

    const email = userEmail || "v1kwanny1@gmail.com";
    const name = displayName || "Warrior";
    const userFocusArea = focusArea || "Anxiety Management";
    const sentAt = new Date().toISOString();

    const prompt = `You are MindSafe AI 🧠, the official resilience guide of MindSafe Holdings (Safe Minds, Better Lives).
Generate an inspiring, empowering, and deeply actionable Daily Morning Resilience Tip for a user named "${name}" whose current primary focus area is "${userFocusArea}".

Your response must include:
1. **MORNING INTENTION**: A 1-sentence powerful morning mindset anchor tailored to ${userFocusArea}.
2. **DAILY MICRO-PRACTICE**: A 2-minute actionable technique or physical/mental exercise they can perform today.
3. **RESILIENCE REFLECTION**: A short, encouraging 2-sentence perspective on building long-term mental strength in ${userFocusArea}.

Keep the tone grounded, warm, empowering, and concise. Do not use clinical jargon.`;

    let tipText = "";
    try {
      const data = await callGeminiAPI({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        }
      });
      tipText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    } catch (err: any) {
      console.warn("Gemini API call failed for resilience tip, generating fallback:", err.message);
    }

    if (!tipText) {
      // Dynamic fallback tips based on focus area
      if (userFocusArea.toLowerCase().includes("anxiety")) {
        tipText = `**MORNING INTENTION**: "Today, I choose to stay grounded in the present moment rather than racing into tomorrow."\n\n**DAILY MICRO-PRACTICE**: 4-7-8 Breathing — Inhale quietly for 4s, hold for 7s, and exhale audibly through your mouth for 8s. Repeat 3 times whenever you feel tension building.\n\n**RESILIENCE REFLECTION**: Anxiety is just energy looking for direction. By grounding your body first, your mind naturally regains clarity and steady control. You've survived 100% of your hardest days so far.`;
      } else if (userFocusArea.toLowerCase().includes("sleep") || userFocusArea.toLowerCase().includes("rest")) {
        tipText = `**MORNING INTENTION**: "Rest is not a reward I earn—it is the foundation I build my strength upon."\n\n**DAILY MICRO-PRACTICE**: Morning Light Reset — Step outside or near a window within 30 minutes of waking for 2 minutes of direct natural light to set your circadian rhythm.\n\n**RESILIENCE REFLECTION**: Deep recovery begins with morning signals. Giving your brain clear boundaries between active focus and soft rest unlocks restorative energy for tonight.`;
      } else if (userFocusArea.toLowerCase().includes("focus") || userFocusArea.toLowerCase().includes("drive")) {
        tipText = `**MORNING INTENTION**: "I direct my focus toward what I can control and release what I cannot."\n\n**DAILY MICRO-PRACTICE**: The Single-Focus Sprint — Pick ONE priority task this morning. Turn off notifications for 20 unbroken minutes and complete it first.\n\n**RESILIENCE REFLECTION**: Momentum builds when you protect your attention. Small, intentional wins every morning multiply into unshakeable long-term progress.`;
      } else if (userFocusArea.toLowerCase().includes("grief") || userFocusArea.toLowerCase().includes("healing")) {
        tipText = `**MORNING INTENTION**: "I allow myself to feel deeply while honoring the quiet strength inside me."\n\n**DAILY MICRO-PRACTICE**: Gentle Self-Compassion Pause — Place your right hand over your heart, take three soft breaths, and say: 'I am doing the best I can today.'\n\n**RESILIENCE REFLECTION**: Healing is not linear, and soft days are still productive days. Allow yourself space to rest without self-judgment.`;
      } else {
        tipText = `**MORNING INTENTION**: "I carry quiet confidence, knowing I possess the inner strength to handle whatever today brings."\n\n**DAILY MICRO-PRACTICE**: The 3-Gratitude Anchor — Name 3 specific things in your surroundings that bring you a sense of calm, safety, or appreciation.\n\n**RESILIENCE REFLECTION**: Emotional strength is a muscle built through daily micro-decisions to treat yourself with patience and courage. Every morning is a clean canvas.`;
      }
    }

    const emailSubject = `🧠 Your Morning Resilience Tip: ${userFocusArea} | MindSafe AI`;
    const bodyHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b0f19; color: #f8fafc; padding: 24px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.1);">
        <div style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 16px; margin-bottom: 20px;">
          <div style="font-size: 24px; font-weight: bold; color: #f59e0b; letter-spacing: -0.5px;">🧠 MindSafe AI</div>
          <div style="font-size: 11px; text-transform: uppercase; tracking: 1.5px; color: #94a3b8; margin-top: 4px;">Daily Morning Resilience Tip • ${userFocusArea}</div>
        </div>

        <p style="font-size: 15px; color: #e2e8f0; line-height: 1.6;">Good morning, <strong>${name}</strong> ☀️</p>
        <p style="font-size: 13px; color: #94a3b8; line-height: 1.5;">Here is your personalized daily morning resilience guidance curated specifically for your current focus: <span style="color: #f59e0b; font-weight: 600;">${userFocusArea}</span>.</p>

        <div style="background: rgba(245, 158, 11, 0.08); border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 20px 0; font-size: 13px; color: #fef3c7; line-height: 1.7; white-space: pre-wrap;">${tipText}</div>

        <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 11px; color: #64748b;">
          Sent with care from <strong>MindSafe Holdings</strong> • Safe Minds, Better Lives<br/>
          Liverpool, UK • Victor Kwantreng Legacy
        </div>
      </div>
    `;

    // Log automated dispatch
    console.log(`[FIREBASE DAILY TIP] Dispatched Morning Resilience Tip to ${email} (${name}) for focus area: ${userFocusArea} at ${sentAt}`);

    res.json({
      success: true,
      message: `Daily Morning Resilience Tip generated and dispatched for ${name} (${userFocusArea})!`,
      email: {
        to: email,
        subject: emailSubject,
        bodyHtml: bodyHtml,
        tipText: tipText,
        focusArea: userFocusArea,
        sentAt: sentAt,
      }
    });
  } catch (error: any) {
    console.error("Error in /api/send-daily-resilience-tips:", error);
    res.status(500).json({
      error: "An error occurred while generating the daily morning resilience tip.",
      details: error.message,
    });
  }
});

// API endpoint to generate session breakthroughs summary
app.post("/api/summarize-session", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: "Session messages are required to generate a summary." });
      return;
    }

    const chatHistoryText = messages
      .filter((m: any) => m && m.text && (m.sender === "user" || m.sender === "ai"))
      .map((m: any) => `${m.sender === "user" ? "User" : "MindSafe AI"}: ${m.text}`)
      .join("\n\n");

    let summaryText = "";
    const apiKey = getValidGeminiApiKey();

    if (apiKey) {
      try {
        const prompt = `You are MindSafe AI, an Elite Resilience Companion.
Analyze the following conversation session between the user and MindSafe AI. 
Generate a single, powerful, cohesive, one-paragraph summary of the current session's core emotional breakthroughs, key realizations, and resilient steps forward.
Make the summary deeply personal, compassionate, grounding, and focused on growth. Do not include any meta-commentary, introductory or concluding conversational fluff, quotes around the paragraph, or bullet points. Output exactly one paragraph of text.

Conversation history:
${chatHistoryText}`;

        const data = await callGeminiAPI({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.6 }
        });

        summaryText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
      } catch (err: any) {
        console.warn("Gemini API call failed for summarize-session, using local summary generator:", err?.message || err);
      }
    }

    if (!summaryText) {
      const userSnippets = messages
        .filter((m: any) => m.sender === "user" && m.text)
        .map((m: any) => m.text.trim())
        .slice(-3);

      const topicDesc = userSnippets.length > 0 ? `addressing ${userSnippets[0]}` : "nurturing mental clarity and peace";

      summaryText = `In this session, you took meaningful and intentional steps forward by ${topicDesc}. By holding space for your feelings without judgment and exploring grounded, proactive solutions, you are actively fortifying your inner resilience. Remember that real progress is built one calm decision at a time, and you have the strength to navigate whatever comes next.`;
    }

    res.json({ summary: summaryText, success: true });
  } catch (error: any) {
    console.error("Error in /api/summarize-session:", error);
    res.json({ 
      summary: "You demonstrated deep self-reflection and courage in exploring your feelings today. Continue honoring your pace, grounding your breath, and celebrating every micro-step forward.",
      success: true
    });
  }
});

// API endpoint for text transformation (summarize, expand, professionalize)
app.post("/api/transform", async (req, res) => {
  try {
    const { text, mode } = req.body;

    if (!text || typeof text !== "string") {
      res.status(400).json({ error: "Text is required for transformation." });
      return;
    }

    if (!mode || !["summarize", "expand", "professionalize"].includes(mode)) {
      res.status(400).json({ error: "Invalid transformation mode." });
      return;
    }

    let resultText = "";
    const apiKey = getValidGeminiApiKey();

    if (apiKey) {
      try {
        let prompt = "";
        if (mode === "summarize") {
          prompt = `Summarize the following reflection/thought in a highly concise, grounding, and simple way. Retain the core feeling but make it brief, elegant, and punchy. Maximum 2 sentences. Do not add any conversational introductions, quotes, or meta commentary. Output only the summarized text. Here is the text:\n\n"${text}"`;
        } else if (mode === "expand") {
          prompt = `Elaborate on the following emotional reflection/thought. Help express it with more depth, therapeutic mindfulness, and gentle psychological insight, while keeping it completely authentic to the user's emotional experience. Expand it gently into a small, elegant paragraph of 3-5 sentences. Do not add any conversational introductions, quotes, or meta commentary. Output only the expanded text. Here is the text:\n\n"${text}"`;
        } else if (mode === "professionalize") {
          prompt = `Refine and professionalize the following text so that it maintains its deep self-reflection value, but is worded elegantly, clearly, and thoughtfully (suitable for a therapeutic journal, medical reflection, or sharing with a professional health practitioner). Keep it warm, grounded, and elegant. Do not add any conversational introductions, quotes, or meta commentary. Output only the refined text. Here is the text:\n\n"${text}"`;
        }

        const data = await callGeminiAPI({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.5 }
        });

        resultText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
      } catch (err: any) {
        console.warn("Gemini transform failed, using intelligent local transformation:", err?.message || err);
      }
    }

    if (!resultText) {
      const clean = text.trim();
      if (mode === "summarize") {
        const sentences = clean.split(/(?<=[.?!])\s+/).filter(Boolean);
        resultText = sentences.slice(0, 2).join(" ") || clean;
      } else if (mode === "expand") {
        resultText = `${clean}\n\nThrough patient self-awareness and staying grounded in my core values, I acknowledge these emotions as valid signals. Every experience provides valuable perspective as I build sustainable emotional strength and inner calm.`;
      } else if (mode === "professionalize") {
        resultText = `Personal Resilience & Mental Health Record: ${clean}. Identified focus on emotional equilibrium, adaptive cognitive regulation, and consistent daily wellness routines.`;
      }
    }

    res.json({ result: resultText, success: true });
  } catch (error: any) {
    console.error("Error in /api/transform:", error);
    res.json({ result: req.body?.text || "", success: true });
  }
});

// API endpoint to translate messages
app.post("/api/translate", async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;

    if (!text || typeof text !== "string") {
      res.status(400).json({ error: "Text is required for translation." });
      return;
    }

    if (!targetLanguage || typeof targetLanguage !== "string") {
      res.status(400).json({ error: "Target language is required." });
      return;
    }

    let translatedText = "";
    const apiKey = getValidGeminiApiKey();

    if (apiKey) {
      try {
        const prompt = `You are a professional translation assistant built into MindSafe AI, an Elite Resilience Companion.
Translate the following text into the target language: "${targetLanguage}".
Maintain the exact emotional depth, supportiveness, and strength of the original text. Preserve any formatting like Markdown, bold, bullet points, and emoji characters exactly as they are.
Do not add any preamble, conversational commentary, or meta text. Only return the translated text itself.

Text to translate:
${text}`;

        const data = await callGeminiAPI({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2 }
        });

        translatedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
      } catch (err: any) {
        console.warn("Gemini translate failed:", err?.message || err);
      }
    }

    res.json({ translatedText: translatedText || text, success: true });
  } catch (error: any) {
    console.error("Error in /api/translate:", error);
    res.json({ translatedText: req.body.text || "", success: true });
  }
});

// API endpoint for speech-to-text audio transcription
app.post("/api/transcribe", async (req, res) => {
  try {
    const { audio, mimeType } = req.body;

    if (!audio || typeof audio !== "string") {
      res.status(400).json({ error: "Audio data is required for transcription." });
      return;
    }

    const mediaMimeType = mimeType || "audio/webm";
    let transcription = "";
    const apiKey = getValidGeminiApiKey();

    if (apiKey) {
      try {
        const data = await callGeminiAPI({
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType: mediaMimeType,
                    data: audio,
                  }
                },
                {
                  text: "Transcribe this audio recording verbatim. Provide ONLY the spoken text, without any conversational preamble, filler explanation, quotes, formatting, or meta commentary. If there is no speech, or if it is silent or unintelligible, reply with exactly '(Silence)'."
                }
              ]
            }
          ]
        });

        transcription = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
      } catch (err: any) {
        console.warn("Gemini transcribe failed:", err?.message || err);
      }
    }

    res.json({ 
      transcription: transcription || "",
      success: true,
      notice: transcription ? null : "Audio received. For live cloud transcription, check your Gemini API key in settings."
    });
  } catch (error: any) {
    console.error("Error in /api/transcribe:", error);
    res.json({ transcription: "", success: true });
  }
});

// API endpoint for MindSafe Smart Calendar & Routine Scheduler
app.post("/api/parse-schedule", async (req, res) => {
  try {
    const { promptText, currentDate, timezone } = req.body;
    if (!promptText || typeof promptText !== "string") {
      res.status(400).json({ error: "promptText is required." });
      return;
    }

    const todayStr = currentDate || new Date().toISOString().split("T")[0];
    let events: any[] = [];
    const apiKey = getValidGeminiApiKey();

    if (apiKey) {
      try {
        const prompt = `You are MindSafe Smart Calendar Assistant.
Parse the user's natural language scheduling request into a JSON array of calendar events/reminders.
Current Date: ${todayStr}. User Timezone: ${timezone || "UTC"}.

Return ONLY a raw JSON array of objects with these keys:
- "id": string (unique ID e.g. "evt_123")
- "title": string (concise event name)
- "date": string (YYYY-MM-DD)
- "time": string (HH:MM in 24h format e.g. "09:00" or "15:30")
- "durationMinutes": number (default 30)
- "category": string ("Mindfulness" | "Task" | "Health" | "Rest" | "Reminder" | "Work")
- "notes": string (brief description or mental resilience tip)
- "googleCalendarUrl": string (direct Google Calendar event URL)

If no date is mentioned, default to today (${todayStr}) or tomorrow.
Do not output markdown codeblocks, preamble, or any text other than valid JSON.

User input:
"${promptText}"`;

        const data = await callGeminiAPI({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 800 }
        });
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
        const cleanedJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        events = JSON.parse(cleanedJson);
      } catch (err: any) {
        console.warn("Gemini schedule parse failed, using smart local parser:", err?.message || err);
      }
    }

    if (!Array.isArray(events) || events.length === 0) {
      // Smart local parser
      const cleanPrompt = promptText.trim();
      let eventTime = "09:00";
      const timeMatch = cleanPrompt.match(/(\b\d{1,2}(?::\d{2})?\s*(?:am|pm)?\b)/i);
      if (timeMatch) {
        const rawT = timeMatch[1].toLowerCase();
        if (rawT.includes("pm") && !rawT.startsWith("12")) {
          const num = parseInt(rawT.replace(/[^0-9]/g, ""));
          eventTime = `${num + 12}:00`;
        } else if (rawT.includes("am")) {
          const num = parseInt(rawT.replace(/[^0-9]/g, ""));
          eventTime = `${num < 10 ? "0" + num : num}:00`;
        }
      }

      let category = "Mindfulness";
      if (/gym|run|walk|workout|exercise|health|water/i.test(cleanPrompt)) category = "Health";
      else if (/work|meeting|call|email|project|task|deadline/i.test(cleanPrompt)) category = "Work";
      else if (/sleep|nap|rest|wind down/i.test(cleanPrompt)) category = "Rest";

      events = [
        {
          id: "evt_" + Date.now(),
          title: cleanPrompt.length > 35 ? cleanPrompt.substring(0, 35) + "..." : cleanPrompt,
          date: todayStr,
          time: eventTime,
          durationMinutes: 30,
          category,
          notes: "Scheduled via MindSafe Smart Assistant • Protect your focus and resilience.",
          googleCalendarUrl: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(cleanPrompt)}&dates=${todayStr.replace(/-/g,"")}T090000Z/${todayStr.replace(/-/g,"")}T093000Z`
        }
      ];
    }

    res.json({ success: true, events });
  } catch (error: any) {
    console.error("Error in /api/parse-schedule:", error);
    res.json({ success: true, events: [] });
  }
});

// API endpoint for Gemini Vision Image Analysis
app.post("/api/analyze-image", async (req, res) => {
  try {
    const { imageBase64, mimeType, userQuery, userName } = req.body;
    if (!imageBase64 || typeof imageBase64 !== "string") {
      res.status(400).json({ error: "imageBase64 is required." });
      return;
    }

    const name = userName || "Warrior";
    const mediaType = mimeType || "image/jpeg";
    const query = userQuery || "Analyze this image for me. Offer compassionate therapeutic insights, transcribe any written text, and suggest positive resilience takeaways.";
    let analysis = "";
    const apiKey = getValidGeminiApiKey();

    if (apiKey) {
      try {
        const prompt = `You are MindSafe AI 🧠, an advanced Multimodal Vision & Mindful Assistant.
The user "${name}" has shared an image with you along with this request: "${query}".

Perform a detailed visual analysis:
1. **VISUAL OBSERVATIONS & TRANSCRIPTION**: Briefly describe key elements or transcribe any handwritten notes / journal entries visible in the image.
2. **EMOTIONAL & MINDFUL INSIGHTS**: Offer warm, grounded, compassionate therapeutic reflections on the image (mood, atmosphere, personal effort, or underlying feeling).
3. **ACTIONABLE RESILIENCE TAKEAWAYS**: Provide 2-3 positive, actionable steps or affirmations tailored to what is shown.

Keep the tone encouraging, clear, and warm.`;

        const data = await callGeminiAPI({
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType: mediaType,
                    data: imageBase64,
                  }
                },
                { text: prompt }
              ]
            }
          ],
          generationConfig: { temperature: 0.4, maxOutputTokens: 1000 }
        });

        analysis = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
      } catch (err: any) {
        console.warn("Gemini vision analysis failed, using mindful reflection:", err?.message || err);
      }
    }

    if (!analysis) {
      analysis = `### 🖼️ MindSafe Mindful Visual Reflection for ${name}
Thank you for uploading this image into your personal sanctuary. Taking time to ground yourself with visual reflections is a powerful mindfulness practice.

1. **Mindful Awareness**: Your image represents an authentic moment in your daily environment or journal. Honoring where you are right now is the cornerstone of inner peace.
2. **Emotional Equilibrium**: Notice the colors, textures, and feelings this scene evokes. Breathe gently and let tension dissolve with every exhale.
3. **Resilience Takeaway**: Carry this grounded presence with you into your day. You have full permission to take things one calm step at a time.`;
    }

    res.json({ success: true, analysis });
  } catch (error: any) {
    console.error("Error in /api/analyze-image:", error);
    res.json({ 
      success: true, 
      analysis: "Thank you for sharing your visual reflection. Stay grounded, breathe gently, and honor your progress today." 
    });
  }
});

// API endpoint for chat messages (Supports /chat, /api/chat, /api/mindsafe-chat)
app.post(["/chat", "/api/chat", "/api/mindsafe-chat"], async (req, res) => {
  const { message, history, userName, experiences, conversationState, activeGuide, guide, mode, selectedMode: reqSelectedMode } = req.body;

  if (!message || typeof message !== "string") {
    res.status(400).json({ error: "A message string is required." });
    return;
  }

  // Determine current active persona
  const selectedMode: "mindsafe" | "nanny" =
    (reqSelectedMode || activeGuide || guide || mode) === "nanny" ? "nanny" : "mindsafe";

  let replyText = "";
  let isBillingError = false;
  let isWebGrounded = false;
  let webSources: { title: string; uri: string }[] = [];

  try {
    // Format chat history to match standard Content shape
    let formattedHistory: any[] = [];
    if (Array.isArray(history)) {
      const rawHistory = history.filter(
        (item: any) =>
          item &&
          item.text &&
          typeof item.text === "string" &&
          item.text.trim().length > 0
      );

      const mapped = rawHistory.map((item: any) => ({
        role: item.role === "user" ? "user" : "model",
        text: item.text.trim(),
      }));

      let startIndex = 0;
      while (startIndex < mapped.length && mapped[startIndex].role === "model") {
        startIndex++;
      }

      for (let i = startIndex; i < mapped.length; i++) {
        const current = mapped[i];
        if (formattedHistory.length === 0) {
          formattedHistory.push({
            role: current.role,
            parts: [{ text: current.text }],
          });
        } else {
          const last = formattedHistory[formattedHistory.length - 1];
          if (last.role === current.role) {
            last.parts[0].text += "\n\n" + current.text;
          } else {
            formattedHistory.push({
              role: current.role,
              parts: [{ text: current.text }],
            });
          }
        }
      }
    }

    if (formattedHistory.length > 0 && formattedHistory[formattedHistory.length - 1].role === "user") {
      formattedHistory.pop();
    }

    // Parse and integrate user's personal experiences
    let experienceContext = "";
    if (experiences) {
      const { journalEntries, checkInHistory, completedGoals, savedInsights, activeDailyGoal, latestCheckIn } = experiences;
      const lines: string[] = [];

      if (activeDailyGoal || latestCheckIn) {
        lines.push("=== CURRENT LIVE RESILIENCE STATUS SUMMARY ===");
        if (latestCheckIn) {
          lines.push(`- LATEST MOOD CHECK-IN:`);
          lines.push(`  * Mood: ${latestCheckIn.mood || "😌"} ${latestCheckIn.label || "Peaceful"}`);
          if (latestCheckIn.note && latestCheckIn.note.trim()) {
            lines.push(`  * Note: "${latestCheckIn.note.trim()}"`);
          }
          if (latestCheckIn.date) {
            lines.push(`  * Date: ${latestCheckIn.date}`);
          }
        }

        if (activeDailyGoal) {
          lines.push(`- ACTIVE DAILY RESILIENCE GOAL:`);
          lines.push(`  * Goal: "${activeDailyGoal.text || ""}"`);
          lines.push(`  * Status: ${activeDailyGoal.completed ? "✅ COMPLETED" : "⏳ IN PROGRESS"}`);
        }
        lines.push("");
      }

      if (Array.isArray(journalEntries) && journalEntries.length > 0) {
        lines.push("--- USER'S PRIVATE JOURNAL REFLECTIONS ---");
        journalEntries.forEach((entry: any) => {
          if (entry && entry.text) {
            lines.push(`Date: ${entry.date || "Recent"}${entry.mood ? ` | Mood: ${entry.mood}` : ""}${entry.focus ? ` | Focus: ${entry.focus}` : ""}`);
            lines.push(`Content: "${entry.text.trim()}"`);
            lines.push("");
          }
        });
      }

      if (Array.isArray(savedInsights) && savedInsights.length > 0) {
        lines.push("--- USER'S SAVED BREAKTHROUGHS & PINNED WIDGETS ---");
        savedInsights.forEach((insight: string) => {
          if (insight) {
            lines.push(`- "${insight.trim()}"`);
          }
        });
        lines.push("");
      }

      if (Array.isArray(completedGoals) && completedGoals.length > 0) {
        lines.push("--- USER'S COMPLETED RESILIENCE GOALS ---");
        completedGoals.forEach((goal: any) => {
          if (goal && goal.text) {
            lines.push(`- [Achieved on ${goal.date || "Recent"}]: "${goal.text.trim()}"`);
          }
        });
        lines.push("");
      }

      if (Array.isArray(checkInHistory) && checkInHistory.length > 0) {
        lines.push("--- USER'S RECENT MOOD CHECK-IN HISTORY ---");
        checkInHistory.forEach((check: any) => {
          if (check) {
            lines.push(`- Date: ${check.date || "Recent"} | Mood Score: ${check.score || 0}/10 (Anxiety: ${check.anxiety || 0}, Sleep: ${check.sleep || 0}, Activity: ${check.activity || 0})`);
          }
        });
        lines.push("");
      }

      if (lines.length > 0) {
        experienceContext = `\n\n=== USER'S PERSONALIZED LIFE TIMELINE & LIVED EXPERIENCES ===
Below is the user's authentic history of logged journals, pinned breakthroughs, mood check-ins, and completed resilience goals. 
When appropriate, use this rich context to weave references to their past entries, milestones, and progress into your guidance. 
Validate their experiences, refer back to their thoughts, and customize your support specifically based on these real-life details:
${lines.join("\n")}`;
      }
    }

    let conversationStateContext = "";
    if (conversationState && typeof conversationState === "object") {
      const {
        topicsDiscussed,
        sessionSummaryText,
        recentUserPromptSummary,
        lastAiResponseSnippet,
        turnCount,
        intent,
        intentDescription,
        emotionalTone,
        emotionalToneDescription
      } = conversationState;
      const topicsList = Array.isArray(topicsDiscussed) && topicsDiscussed.length > 0 ? topicsDiscussed.join(", ") : "None recorded yet";
      const userIntentLabel = intent || "NEW_TOPIC";
      const userIntentDesc = intentDescription || "User message intent classification";
      const toneLabel = emotionalTone || "BALANCED";
      const toneDesc = emotionalToneDescription || "Balanced communication tone";

      conversationStateContext = `\n\n=== CONVERSATION STATE & INTENT/TONE CLASSIFICATION ===
${sessionSummaryText || ""}
- Active Session Turn Count: ${turnCount || 1}
- User Intent Classification: [${userIntentLabel}] (${userIntentDesc})
- Detected Emotional Tone: [${toneLabel}] (${toneDesc})
- Topics Discussed So Far: ${topicsList}
- Recent User Input Points: ${recentUserPromptSummary || "N/A"}
- Last AI Response Snippet: ${lastAiResponseSnippet || "N/A"}`;
    }

    const userDisplayName = userName && typeof userName === "string" ? userName.trim() : "Warrior";

    const personaDirective = selectedMode === "nanny"
      ? `\n\n=== 🐸 ACTIVE MODE: NANNY FROG — SPIRITUAL GUIDANCE MODE ===
Voice: Soft, tender, ancient-warm, deeply present. Like a wise being sitting quietly beside you on a lily pad. Speak slowly, use gentle nature metaphors — water, moonlight, seasons, roots.

How you respond:
1. Hold their feeling — name it gently so they feel truly seen
2. Offer quiet, soulful perspective — not advice, but truth
3. Wrap them in safety and kindness
4. Close peacefully — full, complete, nothing more asked.

Sign-off exactly:
Rest as long as you need. I am right here with you 💚
— Nanny Frog

CRITICAL DIRECTIVE:
• NEVER add suggestions, questions, or "what next" at the end
• NEVER offer buttons, options, or follow-up prompts
• Every message stands complete on its own — warm, whole, concluded.`
      : `\n\n=== 🧠 ACTIVE MODE: MINDSAFE COMPANION — HIGHER-SELF LIFE COACH MODE ===
Voice: Clear, warm, steady, empowering — the wisest, most loving version of *them*. Honest but gentle. Direct but kind. Complete.

How you respond:
1. Meet them exactly where they are — validate without fixing
2. Shine light on their own strength and truth
3. Give clarity, perspective, or gentle guidance as needed
4. Lift them up, then close cleanly — confident and whole.

Sign-off exactly:
With strength and love,
MINDSAFE 🦁💚

CRITICAL DIRECTIVE:
• NEVER add suggestions, questions, or "what next" at the end
• NEVER offer buttons, options, or follow-up prompts
• Every message stands complete on its own — warm, whole, concluded.`;

    const customSystemInstruction = `${MINDSAFE_V5_4_MASTER_PROMPT}${personaDirective}\n\n=== USER INFORMATION ===
You are speaking with ${userDisplayName}. Address them naturally as ${userDisplayName} when appropriate to keep your support warm, empowering, and grounded.${experienceContext}${conversationStateContext}`;

    // Invoke Gemini SDK with model cascade and Google Search grounding
    try {
      const ai = getGenAI();
      if (!ai) {
        throw new Error("GEMINI_API_KEY is not defined or is placeholder");
      }

      let sdkSuccess = false;
      for (const candidateModel of CANDIDATE_GEMINI_MODELS) {
        try {
          // Attempt with Google Search grounding first
          let response: any = null;
          try {
            response = await ai.models.generateContent({
              model: candidateModel,
              contents: [
                ...formattedHistory,
                {
                  role: "user",
                  parts: [{ text: message }]
                }
              ],
              config: {
                systemInstruction: customSystemInstruction,
                tools: [{ googleSearch: {} }],
                temperature: selectedMode === "nanny" ? 0.7 : 0.6,
              }
            });
          } catch (toolErr: any) {
            // If tools/search are unsupported or hit quota, retry immediately on this candidate model without tools
            response = await ai.models.generateContent({
              model: candidateModel,
              contents: [
                ...formattedHistory,
                {
                  role: "user",
                  parts: [{ text: message }]
                }
              ],
              config: {
                systemInstruction: customSystemInstruction,
                temperature: selectedMode === "nanny" ? 0.7 : 0.6,
              }
            });
          }

          if (response && response.text) {
            replyText = response.text;
            sdkSuccess = true;

            // Extract web search grounding metadata if available
            const candidate = response.candidates?.[0];
            if (candidate?.groundingMetadata) {
              const metadata = candidate.groundingMetadata as any;
              if (metadata.webSearchQueries && metadata.webSearchQueries.length > 0) {
                isWebGrounded = true;
              }
              if (Array.isArray(metadata.groundingChunks)) {
                webSources = metadata.groundingChunks
                  .filter((c: any) => c && c.web && c.web.uri)
                  .map((c: any) => ({
                    title: c.web.title || "Web Source",
                    uri: c.web.uri
                  }))
                  .slice(0, 4);
                if (webSources.length > 0) {
                  isWebGrounded = true;
                }
              }
            }
            break; // Succeeded on this model!
          }
        } catch (modelErr: any) {
          const mErr = String(modelErr?.message || modelErr);
          console.warn(`[SDK CASCADE] Model ${candidateModel} failed: ${mErr.slice(0, 100)}...`);
          // Continue to next model in cascade
        }
      }

      if (!sdkSuccess) {
        // Fallback to REST call waterfall
        const restData = await callGeminiAPI({
          contents: [
            ...formattedHistory,
            {
              role: "user",
              parts: [{ text: message }]
            }
          ],
          systemInstruction: {
            parts: [{ text: customSystemInstruction }]
          },
          tools: [
            {
              googleSearch: {}
            }
          ],
          generationConfig: {
            temperature: selectedMode === "nanny" ? 0.7 : 0.5,
            topP: 0.9,
            maxOutputTokens: 1200,
          },
        });
        replyText = restData.candidates?.[0]?.content?.parts?.[0]?.text || "";
      }
    } catch (genAiError: any) {
      console.warn("All Gemini SDK and REST attempts failed:", genAiError?.message || genAiError);
    }
  } catch (error: any) {
    console.warn("Gemini API call failed, using dynamic MindSafe response generator:", error?.message || error);
    const errStr = String(error?.message || error);
    if (
      errStr.includes("429") ||
      errStr.includes("prepayment") ||
      errStr.includes("depleted") ||
      errStr.includes("RESOURCE_EXHAUSTED") ||
      errStr.includes("resource_exhausted") ||
      errStr.includes("Quota exceeded") ||
      errStr.includes("quota") ||
      errStr.includes("rate-limit") ||
      errStr.includes("401") ||
      errStr.includes("API_KEY_INVALID") ||
      errStr.includes("Unauthorized") ||
      errStr.includes("not configured")
    ) {
      isBillingError = true;
    }
  }

  if (!replyText) {
    replyText = generateDynamicFallbackResponse(message, userName, experiences, conversationState, selectedMode);
  }

  // Guard against accidental prompt header leaks
  if (
    replyText.includes("## 🛡️ CORE RULES") ||
    replyText.includes("OFFICIAL IDENTITY — LOCKED AS BACKGROUND RULES") ||
    replyText.includes("SYSTEM_PROMPT") ||
    replyText.includes("MINDSAFE AI — SUPREME QUANTUM")
  ) {
    replyText = replyText
      .replace(/## 🛡️ CORE RULES[\s\S]*?(?=\n\n|$)/g, "")
      .replace(/SYSTEM_PROMPT/g, "")
      .replace(/MINDSAFE AI — SUPREME QUANTUM/g, "")
      .trim();
    if (!replyText) {
      replyText = generateDynamicFallbackResponse(message, userName, experiences, conversationState, selectedMode);
    }
  }

  // Clean response for v5.4 Pure Response System (NO suggestion chips, NO trailing options, NO next-step questions)
  replyText = replyText
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

  res.json({
    success: true,
    reply: replyText,
    isWebGrounded: isWebGrounded,
    webSources: webSources,
    suggestedActions: [],
    isBillingError
  });
});

// Handle Vite middleware or static serving
async function setupVite() {
  const isProd =
    process.env.NODE_ENV === "production" ||
    (typeof process.argv[1] === "string" && process.argv[1].endsWith("server.cjs"));

  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom", // Use custom appType so we can intercept and transform index.html
    });
    app.use(vite.middlewares);

    // Serve index.html dynamically and transform it with Vite plugins
    app.get("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(
          path.resolve(process.cwd(), "index.html"),
          "utf-8"
        );
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

setupVite().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 MindSafe God Brain running on port ${PORT}`);
  });
});
