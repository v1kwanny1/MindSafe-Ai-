import React from "react";
import { AvatarConfig } from "../types/avatar";

interface AvatarDisplayProps {
  config: AvatarConfig;
  size?: number | "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  className?: string;
  showAura?: boolean;
  showPet?: boolean;
  animated?: boolean;
}

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  config,
  size = "md",
  className = "",
  showAura = true,
  showPet = true,
  animated = true,
}) => {
  const rawId = React.useId();
  const uid = `av_${rawId.replace(/[^a-zA-Z0-9_-]/g, "_")}`;

  // Convert size prop to pixel dimension
  let pixelSize = 120;
  if (typeof size === "number") {
    pixelSize = size;
  } else {
    switch (size) {
      case "sm":
        pixelSize = 36;
        break;
      case "md":
        pixelSize = 64;
        break;
      case "lg":
        pixelSize = 128;
        break;
      case "xl":
        pixelSize = 200;
        break;
      case "2xl":
        pixelSize = 320;
        break;
      case "full":
        pixelSize = 400;
        break;
    }
  }

  const {
    skinTone = "#e0ac69",
    hairStyle = "fade_waves",
    hairColor = "#1e1b18",
    eyeStyle = "focused",
    eyeColor = "#382212",
    expression = "gentle_smile",
    outfit = "mindsafe_hoodie",
    outfitColor = "#1e293b",
    outfitSecondaryColor = "#fbbf24",
    accessory = "headphones",
    shoulderPet = "nanny_frog",
    aura = "golden_radiance",
    backgroundTheme = "dark_slate",
  } = config || {};

  // Background Theme Gradients
  const getBackgroundGradient = () => {
    switch (backgroundTheme) {
      case "amber_sunrise":
        return "from-amber-600/30 via-orange-950/40 to-slate-950";
      case "twilight_lavender":
        return "from-purple-600/30 via-indigo-950/40 to-slate-950";
      case "emerald_grove":
        return "from-emerald-600/30 via-teal-950/40 to-slate-950";
      case "celestial_nebula":
        return "from-fuchsia-600/30 via-blue-950/40 to-slate-950";
      case "pure_zen_water":
        return "from-cyan-600/30 via-sky-950/40 to-slate-950";
      case "dark_slate":
      default:
        return "from-slate-800/40 via-slate-900/60 to-slate-950";
    }
  };

  // Aura visual styles
  const getAuraColor = () => {
    switch (aura) {
      case "golden_radiance":
        return "rgba(251, 191, 36, 0.4)";
      case "cosmic_starlight":
        return "rgba(192, 132, 252, 0.45)";
      case "emerald_zen":
        return "rgba(52, 211, 153, 0.4)";
      case "sunset_calm":
        return "rgba(244, 114, 182, 0.4)";
      case "lotus_ripple":
        return "rgba(56, 189, 248, 0.4)";
      default:
        return "transparent";
    }
  };

  return (
    <div
      className={`relative flex items-center justify-center rounded-full overflow-hidden shrink-0 border border-white/10 bg-gradient-to-b ${getBackgroundGradient()} select-none ${className}`}
      style={{
        width: pixelSize,
        height: pixelSize,
        boxShadow:
          showAura && aura !== "none"
            ? `0 0 ${pixelSize * 0.25}px ${getAuraColor()}`
            : "0 4px 12px rgba(0,0,0,0.3)",
      }}
    >
      {/* Dynamic Aura Pulse Ring */}
      {showAura && aura !== "none" && (
        <div
          className={`absolute inset-0 rounded-full pointer-events-none ${
            animated ? "animate-pulse" : ""
          }`}
          style={{
            background: `radial-gradient(circle, ${getAuraColor()} 0%, transparent 70%)`,
          }}
        />
      )}

      {/* SVG Character Avatar Layer */}
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full relative z-10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id={`skin-grad-${uid}`} cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor={skinTone} stopOpacity="1" />
            <stop offset="100%" stopColor={skinTone} stopOpacity="0.88" />
          </radialGradient>

          <linearGradient id={`hoodie-grad-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={outfitColor} />
            <stop offset="100%" stopColor="#090d16" />
          </linearGradient>

          <linearGradient id={`hair-grad-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={hairColor} />
            <stop offset="100%" stopColor="#0a0a0a" />
          </linearGradient>

          <filter id={`soft-shadow-${uid}`} x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* 1. BACKGROUND SACRED HALO (if halo accessory is equipped) */}
        {accessory === "halo_aura" && (
          <g className={animated ? "animate-spin" : ""} style={{ transformOrigin: "100px 90px", animationDuration: "12s" }}>
            <circle cx="100" cy="90" r="75" stroke="#fbbf24" strokeWidth="2" strokeDasharray="6 6" opacity="0.6" />
            <circle cx="100" cy="90" r="82" stroke="#c084fc" strokeWidth="1.5" strokeDasharray="3 9" opacity="0.5" />
          </g>
        )}

        {/* 2. BODY / TORSO & OUTFIT */}
        <g id="avatar-body">
          {/* Base Neck */}
          <path
            d="M86 128 L86 155 Q100 162 114 155 L114 128 Z"
            fill={skinTone}
            filter="brightness(0.9)"
          />

          {/* Shoulders & Clothing */}
          {outfit === "mindsafe_hoodie" && (
            <g id="outfit-hoodie">
              {/* Hoodie Shoulders */}
              <path
                d="M35 200 C35 155 70 142 100 142 C130 142 165 155 165 200 Z"
                fill={`url(#hoodie-grad-${uid})`}
              />
              {/* Hoodie Collar / Drawstrings */}
              <path
                d="M80 144 C88 165 112 165 120 144 C110 175 90 175 80 144 Z"
                fill={outfitSecondaryColor}
                opacity="0.9"
              />
              {/* MindSafe Emblem on Chest */}
              <circle cx="100" cy="178" r="8" fill="#0f172a" stroke={outfitSecondaryColor} strokeWidth="1.5" />
              <text x="100" y="181" textAnchor="middle" fill={outfitSecondaryColor} fontSize="7" fontWeight="bold" fontFamily="sans-serif">
                MS
              </text>
            </g>
          )}

          {outfit === "zen_robes" && (
            <g id="outfit-robes">
              <path
                d="M30 200 C35 150 68 138 100 138 C132 138 165 150 170 200 Z"
                fill={outfitColor}
              />
              {/* Crossed Robe Lapels */}
              <path d="M72 138 L115 200 L95 200 L60 150 Z" fill={outfitSecondaryColor} opacity="0.8" />
              <path d="M128 138 L85 200 L105 200 L140 150 Z" fill={outfitColor} filter="brightness(1.15)" />
              <line x1="88" y1="140" x2="112" y2="185" stroke={outfitSecondaryColor} strokeWidth="2.5" />
            </g>
          )}

          {outfit === "resilience_armor" && (
            <g id="outfit-armor">
              <path
                d="M32 200 C34 150 65 138 100 138 C135 138 166 150 168 200 Z"
                fill={outfitColor}
              />
              {/* Tactical Plate Accents */}
              <polygon points="75,150 100,165 125,150 100,140" fill={outfitSecondaryColor} opacity="0.85" />
              <rect x="90" y="172" width="20" height="28" rx="3" fill="#0f172a" stroke={outfitSecondaryColor} strokeWidth="1" />
              {/* Shoulder Pauldrons */}
              <path d="M35 170 Q55 145 75 160 Z" fill={outfitSecondaryColor} opacity="0.9" />
              <path d="M165 170 Q145 145 125 160 Z" fill={outfitSecondaryColor} opacity="0.9" />
            </g>
          )}

          {outfit === "kimono_harmony" && (
            <g id="outfit-kimono">
              <path
                d="M30 200 C35 150 65 138 100 138 C135 138 165 150 170 200 Z"
                fill={outfitColor}
              />
              <path d="M80 138 L125 195 L108 200 L65 150 Z" fill={outfitSecondaryColor} opacity="0.75" />
              <rect x="75" y="180" width="50" height="15" rx="2" fill="#0f172a" stroke={outfitSecondaryColor} strokeWidth="1" />
            </g>
          )}

          {outfit === "cozy_sweater" && (
            <g id="outfit-sweater">
              <path
                d="M35 200 C35 155 70 142 100 142 C130 142 165 155 165 200 Z"
                fill={outfitColor}
              />
              {/* Ribbed Knit Collar */}
              <path
                d="M78 142 C85 158 115 158 122 142 C115 152 85 152 78 142 Z"
                fill={outfitSecondaryColor}
              />
              {/* Knit Texture lines */}
              <line x1="85" y1="165" x2="85" y2="195" stroke={outfitSecondaryColor} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />
              <line x1="100" y1="160" x2="100" y2="195" stroke={outfitSecondaryColor} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />
              <line x1="115" y1="165" x2="115" y2="195" stroke={outfitSecondaryColor} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />
            </g>
          )}

          {outfit === "nature_cloak" && (
            <g id="outfit-nature">
              <path
                d="M28 200 C32 148 65 138 100 138 C135 138 168 148 172 200 Z"
                fill={outfitColor}
              />
              {/* Botanical Leaf Clasps */}
              <path d="M85 142 C92 152 98 152 100 160 C102 152 108 152 115 142 Z" fill={outfitSecondaryColor} />
              <circle cx="100" cy="155" r="4" fill="#fbbf24" />
            </g>
          )}
        </g>

        {/* 3. HEAD & FACE STRUCTURE */}
        <g id="avatar-head">
          {/* Head Base */}
          <path
            d="M62 92 C62 60 76 40 100 40 C124 40 138 60 138 92 C138 120 124 136 100 136 C76 136 62 120 62 92 Z"
            fill={`url(#skin-grad-${uid})`}
            filter={`url(#soft-shadow-${uid})`}
          />

          {/* Ears */}
          <ellipse cx="61" cy="94" rx="5" ry="9" fill={skinTone} />
          <ellipse cx="61" cy="94" rx="2.5" ry="5" fill={skinTone} filter="brightness(0.85)" />
          <ellipse cx="139" cy="94" rx="5" ry="9" fill={skinTone} />
          <ellipse cx="139" cy="94" rx="2.5" ry="5" fill={skinTone} filter="brightness(0.85)" />

          {/* Cheeks / Glow */}
          <circle cx="76" cy="102" r="7" fill="#f43f5e" opacity="0.12" />
          <circle cx="124" cy="102" r="7" fill="#f43f5e" opacity="0.12" />

          {/* Eyebrows */}
          <g id="avatar-eyebrows" stroke={hairColor} strokeWidth="2.5" strokeLinecap="round">
            {eyeStyle === "focused" && (
              <>
                <path d="M74 76 Q84 73 91 78" />
                <path d="M126 76 Q116 73 109 78" />
              </>
            )}
            {eyeStyle === "serene" && (
              <>
                <path d="M74 76 Q83 73 90 76" />
                <path d="M126 76 Q117 73 110 76" />
              </>
            )}
            {eyeStyle === "joyful" && (
              <>
                <path d="M74 75 Q83 70 91 74" />
                <path d="M126 75 Q117 70 109 74" />
              </>
            )}
            {eyeStyle === "meditative" && (
              <>
                <path d="M75 77 Q84 75 90 77" />
                <path d="M125 77 Q116 75 110 77" />
              </>
            )}
            {eyeStyle === "compassionate" && (
              <>
                <path d="M74 78 Q83 74 91 75" />
                <path d="M126 78 Q117 74 109 75" />
              </>
            )}
            {eyeStyle === "sparkling" && (
              <>
                <path d="M74 74 Q83 69 91 73" />
                <path d="M126 74 Q117 69 109 73" />
              </>
            )}
          </g>

          {/* Eyes */}
          <g id="avatar-eyes">
            {eyeStyle === "meditative" ? (
              // Closed peaceful eyes
              <g stroke={hairColor} strokeWidth="2.5" strokeLinecap="round" fill="none">
                <path d="M74 89 Q82 95 90 89" />
                <path d="M110 89 Q118 95 126 89" />
              </g>
            ) : eyeStyle === "joyful" ? (
              // Joyful curved anime eyes
              <g stroke={hairColor} strokeWidth="2.8" strokeLinecap="round" fill="none">
                <path d="M74 90 Q82 83 90 90" />
                <path d="M110 90 Q118 83 126 90" />
              </g>
            ) : (
              // Open animated eyes
              <>
                {/* Left Eye */}
                <ellipse cx="82" cy="88" rx="6.5" ry="7.5" fill="#ffffff" />
                <ellipse cx="82" cy="88" rx="4.5" ry="5.5" fill={eyeColor} />
                <circle cx="80.5" cy="86" r="2" fill="#ffffff" />
                <circle cx="83.5" cy="90" r="0.9" fill="#ffffff" />

                {/* Right Eye */}
                <ellipse cx="118" cy="88" rx="6.5" ry="7.5" fill="#ffffff" />
                <ellipse cx="118" cy="88" rx="4.5" ry="5.5" fill={eyeColor} />
                <circle cx="116.5" cy="86" r="2" fill="#ffffff" />
                <circle cx="119.5" cy="90" r="0.9" fill="#ffffff" />
              </>
            )}
          </g>

          {/* Nose */}
          <path
            d="M98 96 Q100 102 103 102"
            stroke={skinTone}
            filter="brightness(0.7)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Mouth Expression */}
          <g id="avatar-mouth" stroke="#a24e38" strokeWidth="2.2" strokeLinecap="round" fill="none">
            {expression === "gentle_smile" && <path d="M92 115 Q100 122 108 115" />}
            {expression === "joyful_grin" && (
              <path
                d="M90 114 Q100 125 110 114 Q100 118 90 114 Z"
                fill="#ffffff"
                stroke="#9a3412"
                strokeWidth="1.5"
              />
            )}
            {expression === "calm_focus" && <path d="M93 117 L107 117" />}
            {expression === "serene_peace" && <path d="M93 116 Q100 120 107 116" />}
          </g>
        </g>

        {/* 4. HAIR & HEADGEAR */}
        <g id="avatar-hair">
          {hairStyle === "short_crop" && (
            <path
              d="M60 76 C58 45 74 32 100 32 C126 32 142 45 140 76 C134 50 125 45 100 45 C75 45 66 50 60 76 Z"
              fill={`url(#hair-grad-${uid})`}
            />
          )}

          {hairStyle === "fade_waves" && (
            <g>
              {/* Fade base */}
              <path
                d="M61 74 C59 44 75 30 100 30 C125 30 141 44 139 74 C134 46 122 42 100 42 C78 42 66 46 61 74 Z"
                fill={`url(#hair-grad-${uid})`}
              />
              {/* Top texture wave bumps */}
              <circle cx="82" cy="38" r="8" fill={hairColor} />
              <circle cx="95" cy="34" r="9" fill={hairColor} />
              <circle cx="110" cy="35" r="8.5" fill={hairColor} />
              <circle cx="122" cy="40" r="7.5" fill={hairColor} />
            </g>
          )}

          {hairStyle === "braids_locks" && (
            <g>
              <path
                d="M60 72 C58 40 74 30 100 30 C126 30 142 40 140 72 C135 45 125 42 100 42 C75 42 65 45 60 72 Z"
                fill={hairColor}
              />
              {/* Hanging Braids Left */}
              <path d="M60 75 Q54 110 58 135" stroke={hairColor} strokeWidth="5" strokeLinecap="round" />
              <path d="M68 75 Q62 120 66 145" stroke={hairColor} strokeWidth="5" strokeLinecap="round" />
              {/* Hanging Braids Right */}
              <path d="M140 75 Q146 110 142 135" stroke={hairColor} strokeWidth="5" strokeLinecap="round" />
              <path d="M132 75 Q138 120 134 145" stroke={hairColor} strokeWidth="5" strokeLinecap="round" />
              {/* Golden Hair Beads */}
              <circle cx="58" cy="130" r="3.5" fill="#fbbf24" />
              <circle cx="66" cy="140" r="3.5" fill="#fbbf24" />
              <circle cx="142" cy="130" r="3.5" fill="#fbbf24" />
              <circle cx="134" cy="140" r="3.5" fill="#fbbf24" />
            </g>
          )}

          {hairStyle === "flowing_locks" && (
            <g>
              <path
                d="M58 75 C56 38 72 26 100 26 C128 26 144 38 142 75 C136 44 125 38 100 38 C75 38 64 44 58 75 Z"
                fill={hairColor}
              />
              {/* Flowing side locks */}
              <path d="M58 75 C50 105 52 145 64 165 C55 135 55 95 62 75 Z" fill={hairColor} />
              <path d="M142 75 C150 105 148 145 136 165 C145 135 145 95 138 75 Z" fill={hairColor} />
            </g>
          )}

          {hairStyle === "topknot" && (
            <g>
              <path
                d="M62 76 C60 46 76 34 100 34 C124 34 140 46 138 76 C133 48 123 44 100 44 C77 44 67 48 62 76 Z"
                fill={hairColor}
              />
              {/* Topknot Bun */}
              <ellipse cx="100" cy="24" rx="14" ry="12" fill={hairColor} />
              {/* Bun Tie Pin */}
              <line x1="84" y1="24" x2="116" y2="24" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          )}

          {hairStyle === "lotus_crown" && (
            <g>
              <path
                d="M60 76 C58 45 74 34 100 34 C126 34 142 45 140 76 C134 50 125 45 100 45 C75 45 66 50 60 76 Z"
                fill={hairColor}
              />
              {/* Golden Lotus Crown on Forehead */}
              <path d="M75 58 Q100 48 125 58" stroke="#fbbf24" strokeWidth="3" fill="none" />
              {/* Lotus Petals */}
              <path d="M100 36 C92 48 95 56 100 56 C105 56 108 48 100 36 Z" fill="#f472b6" stroke="#fbbf24" strokeWidth="1" />
              <path d="M88 44 C84 52 88 56 93 56 C96 52 94 47 88 44 Z" fill="#ec4899" />
              <path d="M112 44 C116 52 112 56 107 56 C104 52 106 47 112 44 Z" fill="#ec4899" />
              <circle cx="100" cy="54" r="2.5" fill="#fbbf24" />
            </g>
          )}

          {hairStyle === "focus_headband" && (
            <g>
              <path
                d="M60 76 C58 45 74 32 100 32 C126 32 142 45 140 76 C134 50 125 45 100 45 C75 45 66 50 60 76 Z"
                fill={hairColor}
              />
              {/* Warrior Headband */}
              <path d="M59 62 Q100 52 141 62 L141 72 Q100 62 59 72 Z" fill="#fbbf24" />
              {/* MindSafe Inscription on Headband */}
              <circle cx="100" cy="65" r="4.5" fill="#0f172a" />
              <text x="100" y="67.5" textAnchor="middle" fill="#fbbf24" fontSize="5" fontWeight="bold" fontFamily="sans-serif">
                🧠
              </text>
            </g>
          )}

          {hairStyle === "calm_beanie" && (
            <g>
              {/* Knit Beanie */}
              <path
                d="M58 74 C56 30 72 20 100 20 C128 20 144 30 142 74 C132 70 120 68 100 68 C80 68 68 70 58 74 Z"
                fill="#1e293b"
                stroke="#fbbf24"
                strokeWidth="1.5"
              />
              <path d="M58 74 Q100 64 142 74 L142 80 Q100 70 58 80 Z" fill="#334155" />
              <circle cx="100" cy="18" r="5" fill="#fbbf24" />
            </g>
          )}

          {hairStyle === "zen_shaved" && (
            // Shaved head with serene forehead mark
            <g>
              <circle cx="100" cy="65" r="2.5" fill="#fbbf24" opacity="0.8" />
            </g>
          )}
        </g>

        {/* 5. ACCESSORIES */}
        <g id="avatar-accessories">
          {accessory === "headphones" && (
            <g id="accessory-headphones">
              {/* Headphone Band */}
              <path
                d="M56 86 C52 38 72 22 100 22 C128 22 148 38 144 86"
                stroke="#0f172a"
                strokeWidth="7"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M56 86 C52 38 72 22 100 22 C128 22 148 38 144 86"
                stroke="#fbbf24"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
              {/* Left Ear Cushion */}
              <rect x="52" y="78" width="10" height="28" rx="5" fill="#0f172a" stroke="#fbbf24" strokeWidth="1.5" />
              {/* Right Ear Cushion */}
              <rect x="138" y="78" width="10" height="28" rx="5" fill="#0f172a" stroke="#fbbf24" strokeWidth="1.5" />
            </g>
          )}

          {accessory === "mala_beads" && (
            <g id="accessory-mala">
              {/* Sacred Prayer Mala Beads Necklace */}
              <path
                d="M80 144 C82 178 118 178 120 144"
                stroke="#78350f"
                strokeWidth="4"
                strokeDasharray="1 6"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="100" cy="172" r="4.5" fill="#fbbf24" />
              <path d="M100 176 L100 186" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          )}

          {accessory === "crystal_amulet" && (
            <g id="accessory-amulet">
              <path d="M84 140 L100 168 L116 140" stroke="#94a3b8" strokeWidth="1.5" fill="none" />
              <polygon points="100,164 106,174 100,184 94,174" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
            </g>
          )}

          {accessory === "mindsafe_bandana" && (
            <g id="accessory-bandana">
              <path d="M60 66 Q100 56 140 66 L140 76 Q100 66 60 76 Z" fill="#0f172a" />
              <circle cx="100" cy="71" r="3" fill="#fbbf24" />
            </g>
          )}
        </g>

        {/* 6. SHOULDER COMPANION PET */}
        {showPet && shoulderPet !== "none" && (
          <g
            id="avatar-shoulder-pet"
            className={animated ? "animate-bounce" : ""}
            style={{ transformOrigin: "155px 145px", animationDuration: "3.5s" }}
          >
            {shoulderPet === "nanny_frog" && (
              <g id="pet-nanny-frog">
                {/* Nanny Frog Body on shoulder */}
                <ellipse cx="156" cy="146" rx="14" ry="11" fill="#10b981" stroke="#064e3b" strokeWidth="1.5" />
                <ellipse cx="156" cy="148" rx="8" ry="6" fill="#6ee7b7" />
                {/* Eyes */}
                <circle cx="148" cy="138" r="4.5" fill="#10b981" />
                <circle cx="148" cy="138" r="2.5" fill="#ffffff" />
                <circle cx="148" cy="138" r="1.5" fill="#0f172a" />
                <circle cx="164" cy="138" r="4.5" fill="#10b981" />
                <circle cx="164" cy="138" r="2.5" fill="#ffffff" />
                <circle cx="164" cy="138" r="1.5" fill="#0f172a" />
                {/* Little Smile & Golden Lotus Mini Crown */}
                <path d="M152 145 Q156 148 160 145" stroke="#064e3b" strokeWidth="1" fill="none" />
                <polygon points="152,135 156,131 160,135 156,134" fill="#fbbf24" />
              </g>
            )}

            {shoulderPet === "zen_cat" && (
              <g id="pet-zen-cat">
                <ellipse cx="156" cy="148" rx="13" ry="10" fill="#f59e0b" />
                <polygon points="146,140 148,132 153,138" fill="#f59e0b" />
                <polygon points="159,138 164,132 166,140" fill="#f59e0b" />
                <circle cx="151" cy="146" r="1.5" fill="#0f172a" />
                <circle cx="161" cy="146" r="1.5" fill="#0f172a" />
                <path d="M156 148 L156 150" stroke="#0f172a" strokeWidth="1" />
              </g>
            )}

            {shoulderPet === "guardian_pup" && (
              <g id="pet-guardian-pup">
                <ellipse cx="156" cy="148" rx="14" ry="11" fill="#78350f" />
                {/* Floppy ears */}
                <ellipse cx="145" cy="142" rx="4" ry="7" fill="#451a03" />
                <ellipse cx="167" cy="142" rx="4" ry="7" fill="#451a03" />
                <circle cx="151" cy="146" r="2" fill="#ffffff" />
                <circle cx="151" cy="146" r="1" fill="#0f172a" />
                <circle cx="161" cy="146" r="2" fill="#ffffff" />
                <circle cx="161" cy="146" r="1" fill="#0f172a" />
                <circle cx="156" cy="151" r="1.8" fill="#0f172a" />
              </g>
            )}

            {shoulderPet === "hope_butterfly" && (
              <g id="pet-butterfly">
                <ellipse cx="156" cy="142" rx="2" ry="7" fill="#0f172a" />
                {/* Glowing Wings */}
                <ellipse cx="147" cy="138" rx="8" ry="6" fill="#c084fc" opacity="0.85" />
                <ellipse cx="165" cy="138" rx="8" ry="6" fill="#c084fc" opacity="0.85" />
                <ellipse cx="149" cy="146" rx="5" ry="4" fill="#38bdf8" opacity="0.8" />
                <ellipse cx="163" cy="146" rx="5" ry="4" fill="#38bdf8" opacity="0.8" />
              </g>
            )}

            {shoulderPet === "songbird" && (
              <g id="pet-songbird">
                <ellipse cx="156" cy="146" rx="11" ry="8" fill="#38bdf8" />
                <circle cx="163" cy="142" r="5.5" fill="#38bdf8" />
                <polygon points="167,142 173,144 167,146" fill="#fbbf24" />
                <circle cx="164" cy="141" r="1.2" fill="#0f172a" />
                <ellipse cx="153" cy="146" rx="6" ry="4" fill="#0284c7" />
              </g>
            )}
          </g>
        )}
      </svg>
    </div>
  );
};
