import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Play, Pause, RotateCcw, Wind, Volume2, VolumeX } from "lucide-react";

interface CalmBreathingProps {
  isOpen: boolean;
  onClose: () => void;
}

type BreathState = "idle" | "inhale" | "hold" | "exhale" | "completed";

export default function CalmBreathing({ isOpen, onClose }: CalmBreathingProps) {
  const [breathState, setBreathState] = useState<BreathState>("idle");
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [cycle, setCycle] = useState(1);
  const [isActive, setIsActive] = useState(false);
  const [isAudioGuideEnabled, setIsAudioGuideEnabled] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stateRef = useRef({ breathState, cycle, secondsLeft, isActive });
  stateRef.current = { breathState, cycle, secondsLeft, isActive };

  // Web Audio Guide Synthesis
  const breathAudioCtxRef = useRef<AudioContext | null>(null);
  const breathOscRef = useRef<OscillatorNode | null>(null);
  const breathGainRef = useRef<GainNode | null>(null);

  const initBreathAudio = () => {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      const ctx = new AudioCtxClass();
      breathAudioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      gain.gain.setValueAtTime(0, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(0);

      breathOscRef.current = osc;
      breathGainRef.current = gain;
    } catch (e) {
      console.error("Failed to initialize breath audio synthesis", e);
    }
  };

  const stopBreathAudio = () => {
    try {
      if (breathOscRef.current) {
        breathOscRef.current.stop();
        breathOscRef.current.disconnect();
        breathOscRef.current = null;
      }
      if (breathGainRef.current) {
        breathGainRef.current.disconnect();
        breathGainRef.current = null;
      }
      if (breathAudioCtxRef.current) {
        if (breathAudioCtxRef.current.state !== "closed") {
          breathAudioCtxRef.current.close();
        }
        breathAudioCtxRef.current = null;
      }
    } catch {}
  };

  // Synchronize dynamic frequency & level changes on state changes
  useEffect(() => {
    if (!isAudioGuideEnabled || !isActive) {
      stopBreathAudio();
      return;
    }

    if (!breathAudioCtxRef.current) {
      initBreathAudio();
    }

    const ctx = breathAudioCtxRef.current;
    const osc = breathOscRef.current;
    const gain = breathGainRef.current;

    if (!ctx || !osc || !gain) return;

    const now = ctx.currentTime;

    if (breathState === "inhale") {
      // Smooth pitch rise during inhale (4s)
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 4);
      // Soft fade in
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.05, now + 0.5);
    } else if (breathState === "hold") {
      // Extremely low therapeutic steady resonance
      osc.frequency.setValueAtTime(160, now);
      gain.gain.setValueAtTime(0.03, now);
    } else if (breathState === "exhale") {
      // Smooth fall during long deep exhale (8s)
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 8);
      // Gradual fade out
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0, now + 8);
    } else {
      gain.gain.setValueAtTime(0, now);
    }
  }, [breathState, isActive, isAudioGuideEnabled]);

  // Handle 4-7-8 Breathing Cycle Sequence Timer
  useEffect(() => {
    if (!isActive) {
      return;
    }

    const interval = setInterval(() => {
      const current = stateRef.current;
      if (current.secondsLeft <= 1) {
        if (current.breathState === "inhale") {
          setBreathState("hold");
          setSecondsLeft(7);
        } else if (current.breathState === "hold") {
          setBreathState("exhale");
          setSecondsLeft(8);
        } else if (current.breathState === "exhale") {
          if (current.cycle >= 4) {
            setBreathState("completed");
            setIsActive(false);
            setSecondsLeft(0);
          } else {
            setCycle((c) => c + 1);
            setBreathState("inhale");
            setSecondsLeft(4);
          }
        }
      } else {
        setSecondsLeft((prev) => prev - 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  // Clean up Web Audio synthesis and interval on close or unmount
  useEffect(() => {
    return () => {
      stopBreathAudio();
    };
  }, []);

  const handleStart = () => {
    setBreathState("inhale");
    setSecondsLeft(4);
    setCycle(1);
    setIsActive(true);
  };

  const handlePauseToggle = () => {
    setIsActive((prev) => !prev);
  };

  const handleReset = () => {
    setIsActive(false);
    setBreathState("idle");
    setSecondsLeft(4);
    setCycle(1);
    stopBreathAudio();
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const prompt = (() => {
    switch (breathState) {
      case "inhale":
        return {
          title: "Inhale",
          desc: "Breathe in deeply through your nose",
          color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
          accentColor: "bg-emerald-400"
        };
      case "hold":
        return {
          title: "Hold",
          desc: "Suspend your breath and completely relax",
          color: "text-amber-400 border-amber-500/20 bg-amber-500/5",
          accentColor: "bg-amber-400"
        };
      case "exhale":
        return {
          title: "Exhale",
          desc: "Sigh fully through your mouth with a gentle 'whoosh'",
          color: "text-blue-400 border-blue-500/20 bg-blue-500/5",
          accentColor: "bg-blue-400"
        };
      case "completed":
        return {
          title: "Completed",
          desc: "Excellent presence. You completed 4 rounds of resilience breath.",
          color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
          accentColor: "bg-emerald-400"
        };
      default:
        return {
          title: "Ready",
          desc: "Settle into a comfortable posture and find your center.",
          color: "text-slate-300 border-white/5 bg-white/5",
          accentColor: "bg-[#60A5FA]"
        };
    }
  })();

  const getCircleAnimation = () => {
    switch (breathState) {
      case "inhale":
        return {
          scale: 1.6,
          backgroundColor: "rgba(16, 185, 129, 0.2)",
          borderColor: "rgba(16, 185, 129, 0.5)",
          transition: { duration: 4, ease: "easeInOut" as const }
        };
      case "hold":
        return {
          scale: 1.6,
          backgroundColor: "rgba(245, 158, 11, 0.2)",
          borderColor: "rgba(245, 158, 11, 0.5)",
          transition: { duration: 0.2 }
        };
      case "exhale":
        return {
          scale: 1.0,
          backgroundColor: "rgba(59, 130, 246, 0.2)",
          borderColor: "rgba(59, 130, 246, 0.5)",
          transition: { duration: 8, ease: "easeInOut" as const }
        };
      default:
        return {
          scale: 1.0,
          backgroundColor: "rgba(255, 255, 255, 0.03)",
          borderColor: "rgba(255, 255, 255, 0.15)",
          transition: { duration: 0.5 }
        };
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-slate-900 border border-white/10 w-full max-w-md rounded-[32px] p-6 relative shadow-2xl overflow-hidden text-center flex flex-col items-center"
            id="calmBreathingModal"
          >
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="w-full flex items-center justify-between mb-6 select-none relative z-10">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-blue-500/10 text-[#60A5FA]">
                  <Wind className="w-5 h-5" />
                </span>
                <div className="text-left">
                  <h3 className="text-base font-bold text-slate-100 tracking-wide font-sans">
                    Resilience Breathing
                  </h3>
                  <p className="text-[9px] text-slate-400 font-mono uppercase tracking-widest">
                    4-7-8 CALMING REGIMEN
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer select-none"
                title="Close breathing guide"
                id="closeBreathingModalButton"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Description or Informational Guide */}
            <div className="mb-6 select-none text-left relative z-10">
              <p className="text-xs text-slate-400 leading-relaxed">
                The 4-7-8 breathing method is a scientifically verified pathway to instantly down-regulate your nervous system and dissolve stress.
              </p>
            </div>

            {/* Visualization Stage */}
            <div className="relative w-64 h-64 flex items-center justify-center my-6 select-none">
              {/* Outer Pulsing Aura Loops */}
              {isActive && breathState !== "completed" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="w-32 h-32 rounded-full border border-white/5"
                    animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.div
                    className="w-32 h-32 rounded-full border border-white/5"
                    animate={{ scale: [1.3, 2.1, 1.3], opacity: [0.15, 0, 0.15] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                  />
                </div>
              )}

              {/* Central Expanding/Contracting Circle */}
              <motion.div
                animate={getCircleAnimation()}
                className="w-36 h-36 rounded-full border-2 flex flex-col items-center justify-center relative z-10 shadow-xl backdrop-blur-sm"
              >
                {isActive && breathState !== "completed" && breathState !== "idle" ? (
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-black font-mono tracking-tight text-white mb-0.5">
                      {secondsLeft}s
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                      {breathState}
                    </span>
                  </div>
                ) : (
                  <Wind className="w-12 h-12 text-slate-400/60" />
                )}
              </motion.div>
            </div>

            {/* Active Status Display and Cycle Tracker */}
            <div className="w-full relative z-10 flex flex-col items-center mb-6">
              <div className={`p-4 rounded-2xl border ${prompt.color} w-full text-center transition-all duration-300`}>
                <h4 className="text-sm font-bold tracking-wide uppercase mb-1 font-sans">
                  {prompt.title}
                </h4>
                <p className="text-xs text-slate-300 font-medium">
                  {prompt.desc}
                </p>
              </div>

              {isActive && breathState !== "completed" && (
                <div className="mt-3 flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                    PROGRESS:
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          step < cycle
                            ? "bg-emerald-400"
                            : step === cycle
                            ? `${prompt.accentColor} scale-125 shadow-lg`
                            : "bg-white/10"
                        }`}
                        title={`Cycle ${step}`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest ml-1">
                    ROUND {cycle}/4
                  </span>
                </div>
              )}
            </div>

            {/* Controls Bar */}
            <div className="w-full relative z-10 flex items-center justify-between gap-3 mt-auto">
              {/* Audio Guide Toggle */}
              <button
                type="button"
                onClick={() => setIsAudioGuideEnabled(!isAudioGuideEnabled)}
                className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-2 select-none text-xs font-semibold ${
                  isAudioGuideEnabled
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                    : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
                }`}
                title={isAudioGuideEnabled ? "Disable breathing sound synth" : "Enable soothing breath sound guide"}
                id="breathingAudioGuideToggle"
              >
                {isAudioGuideEnabled ? (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span>Sound Guide: On</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-4 h-4" />
                    <span>Sound Guide: Off</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                {/* Reset button */}
                {(isActive || breathState !== "idle") && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer select-none flex items-center justify-center"
                    title="Reset exercise"
                    id="resetBreathingButton"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}

                {/* Main Action Button */}
                {breathState === "idle" || breathState === "completed" ? (
                  <button
                    type="button"
                    onClick={handleStart}
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#60A5FA] to-blue-500 hover:from-[#60A5FA]/90 hover:to-blue-600 text-white font-bold text-xs select-none tracking-wider uppercase transition-all shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer"
                    id="startBreathingButton"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Exercise</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePauseToggle}
                    className={`px-5 py-3 rounded-2xl font-bold text-xs select-none tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer border ${
                      isActive
                        ? "bg-white/5 border-white/10 text-white hover:bg-white/10"
                        : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-lg shadow-emerald-500/10"
                    }`}
                    id="pauseBreathingButton"
                  >
                    {isActive ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Resume</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
