import React, { useMemo } from "react";
import { motion } from "motion/react";
import { Sparkles, Trophy } from "lucide-react";

interface Particle {
  id: number;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  color: string;
  shape: "circle" | "star" | "square" | "diamond";
  size: number;
  delay: number;
  duration: number;
}

interface CheckboxParticleExplosionProps {
  key?: React.Key;
  onComplete?: () => void;
}

export default function CheckboxParticleExplosion({ onComplete }: CheckboxParticleExplosionProps) {
  // Generate 28 particles with randomized 360-degree trajectories
  const particles: Particle[] = useMemo(() => {
    const colors = [
      "#FBBF24", // Gold
      "#F59E0B", // Amber
      "#FCD34D", // Light Yellow
      "#F43F5E", // Rose
      "#10B981", // Emerald
      "#38BDF8", // Sky Blue
      "#A855F7", // Purple
      "#FFFFFF"  // Bright White
    ];

    const shapes: ("circle" | "star" | "square" | "diamond")[] = ["circle", "star", "square", "diamond"];

    const list: Particle[] = [];
    const count = 28;

    for (let i = 0; i < count; i++) {
      // Calculate angle spread across 360 degrees with random variance
      const angleDeg = (i / count) * 360 + (Math.random() * 24 - 12);
      const angleRad = (angleDeg * Math.PI) / 180;

      // Distance outward (between 35px and 100px)
      const distance = 35 + Math.random() * 65;
      const x = Math.cos(angleRad) * distance;
      const y = Math.sin(angleRad) * distance;

      list.push({
        id: i,
        x,
        y,
        scale: 0.6 + Math.random() * 0.8,
        rotation: Math.random() * 520 - 260,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        size: Math.floor(5 + Math.random() * 7), // 5px to 12px
        delay: Math.random() * 0.08,
        duration: 1.0 + Math.random() * 0.4
      });
    }

    return list;
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-50">
      {/* Central Shockwave Ring */}
      <motion.div
        initial={{ scale: 0.2, opacity: 0.9, borderWidth: "4px" }}
        animate={{ scale: 4.5, opacity: 0, borderWidth: "0px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute rounded-full border-2 border-amber-400 w-6 h-6 shadow-[0_0_20px_rgba(251,191,36,0.9)]"
      />

      {/* Golden Radial Flash */}
      <motion.div
        initial={{ scale: 0.4, opacity: 0.8 }}
        animate={{ scale: 3.0, opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="absolute rounded-full bg-amber-400/40 blur-md w-8 h-8"
      />

      {/* Floating 7-Day Streak Badge */}
      <motion.div
        initial={{ opacity: 0, y: 0, scale: 0.4 }}
        animate={{ opacity: [0, 1, 1, 0], y: -38, scale: [0.4, 1.1, 1, 0.9] }}
        transition={{ duration: 1.8, times: [0, 0.2, 0.85, 1], ease: "easeOut" }}
        className="absolute -top-6 whitespace-nowrap bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-[0_0_18px_rgba(251,191,36,0.7)] font-mono flex items-center gap-1 z-50"
      >
        <Trophy className="w-3 h-3 text-slate-950 fill-slate-950 animate-bounce" />
        <span>7-DAY STREAK! 🔥</span>
      </motion.div>

      {/* Particles Explosion */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, scale: 0.2, opacity: 1, rotate: 0 }}
          animate={{
            x: [0, p.x * 0.8, p.x],
            y: [0, p.y * 0.8, p.y + 12], // slight gravity drop
            scale: [0.2, p.scale, 0],
            opacity: [1, 1, 0],
            rotate: p.rotation
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: [0.22, 1, 0.36, 1]
          }}
          style={{
            position: "absolute",
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.shape === "star" ? "transparent" : p.color,
            borderRadius: p.shape === "circle" ? "50%" : p.shape === "diamond" ? "1px" : "2px",
            transform: p.shape === "diamond" ? "rotate(45deg)" : "none",
            boxShadow: `0 0 10px ${p.color}`,
          }}
        >
          {p.shape === "star" && (
            <Sparkles
              className="w-full h-full"
              style={{ color: p.color, fill: p.color }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}
