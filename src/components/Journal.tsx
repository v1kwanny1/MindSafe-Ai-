import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Calendar, ChevronLeft, ChevronRight, Trash2, Search, Check, Save, Heart, Sparkles, Smile, Award, PenTool, Mic, MicOff, Download, Loader2, Undo2, X, Filter } from "lucide-react";

interface JournalEntry {
  date: string; // YYYY-MM-DD
  text: string;
  mood?: string;
  focus?: string;
  updatedAt: string;
}

const MOODS = [
  { emoji: "🌱", label: "Growing", color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10" },
  { emoji: "👊🏽", label: "Unstoppable", color: "text-amber-400 border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10" },
  { emoji: "💛", label: "Peaceful", color: "text-yellow-400 border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/10" },
  { emoji: "⚡", label: "Anxious", color: "text-rose-400 border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10" },
  { emoji: "🌊", label: "Flowing", color: "text-blue-400 border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10" },
];

export default function Journal() {
  const getTodayDateStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateStr);
  const [entries, setEntries] = useState<Record<string, JournalEntry>>(() => {
    try {
      const saved = localStorage.getItem("mindsafe_journal_entries");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error("Failed to parse journal entries", e);
      return {};
    }
  });

  const [inputText, setInputText] = useState("");
  const [selectedMood, setSelectedMood] = useState("");
  const [dailyFocus, setDailyFocus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimeoutRef = useRef<any>(null);

  // AI Reflection Transformation states
  const [isTransforming, setIsTransforming] = useState(false);
  const [originalTextBeforeTransform, setOriginalTextBeforeTransform] = useState<string | null>(null);

  // Audio recording states for journal entries
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const durationIntervalRef = useRef<any>(null);

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Your browser does not support microphone access.");
        return;
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      
      let mimeType = "audio/webm";
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        mimeType = "audio/webm;codecs=opus";
      } else if (MediaRecorder.isTypeSupported("audio/webm")) {
        mimeType = "audio/webm";
      } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
        mimeType = "audio/ogg";
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        mimeType = "audio/mp4";
      } else if (MediaRecorder.isTypeSupported("audio/aac")) {
        mimeType = "audio/aac";
      }

      const options = { mimeType };
      const mediaRecorder = new MediaRecorder(stream, options);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());

        if (audioChunksRef.current.length === 0) {
          setIsTranscribing(false);
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setIsTranscribing(true);
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Data = reader.result as string;
          const base64Payload = base64Data.split(",")[1];
          
          try {
            const res = await fetch("/api/transcribe", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                audio: base64Payload,
                mimeType: mimeType,
              }),
            });

            if (!res.ok) {
              throw new Error("Failed to transcribe audio");
            }

            const data = await res.json();
            const text = data.transcription?.trim();
            
            if (text && text !== "(Silence)") {
              setInputText((prev) => {
                const updated = prev ? `${prev.trim()}\n${text}` : text;
                handleSave(updated, selectedMood, dailyFocus);
                return updated;
              });
            } else if (text === "(Silence)") {
              alert("The audio recording was too quiet or no speech was detected.");
            } else {
              alert("Could not transcribe the audio. Let's try again!");
            }
          } catch (err) {
            console.error("Transcription error:", err);
            alert("An error occurred during transcription. Please try typing instead.");
          } finally {
            setIsTranscribing(false);
          }
        };
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingDuration(0);

      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Failed to access microphone:", err);
      alert("Microphone access denied or not available.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    }
  };

  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  const handleTransform = async (mode: "summarize" | "expand" | "professionalize") => {
    if (!inputText.trim()) {
      alert("Please write some thoughts first before reframing them.");
      return;
    }

    setIsTransforming(true);
    setOriginalTextBeforeTransform(inputText);

    try {
      const res = await fetch("/api/transform", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: inputText,
          mode,
        }),
      });

      if (!res.ok) {
        throw new Error("Transformation request failed");
      }

      const data = await res.json();
      if (data.result) {
        setInputText(data.result);
        handleSave(data.result, selectedMood, dailyFocus);
      }
    } catch (err) {
      console.error("Transformation error:", err);
      alert("Unable to transform your thoughts at this time.");
    } finally {
      setIsTransforming(false);
    }
  };

  const handleUndoTransform = () => {
    if (originalTextBeforeTransform !== null) {
      setInputText(originalTextBeforeTransform);
      handleSave(originalTextBeforeTransform, selectedMood, dailyFocus);
      setOriginalTextBeforeTransform(null);
    }
  };

  const handleExportJournalLogs = () => {
    const dates = Object.keys(entries).sort((a, b) => b.localeCompare(a));
    if (dates.length === 0) {
      alert("No journal entries available to export.");
      return;
    }

    let fileContent = `# MINDSAFE PRIVATE JOURNAL EXPORT\n`;
    fileContent += `Generated on: ${new Date().toLocaleString()}\n`;
    fileContent += `==================================================\n\n`;

    dates.forEach((date) => {
      const entry = entries[date];
      fileContent += `## Entry Date: ${entry.date}\n`;
      if (entry.mood) {
        fileContent += `* **Spirit/Mood:** ${entry.mood}\n`;
      }
      if (entry.focus) {
        fileContent += `* **Intention/Anchor:** ${entry.focus}\n`;
      }
      fileContent += `* **Last Updated:** ${new Date(entry.updatedAt).toLocaleString()}\n\n`;
      fileContent += `### Thoughts:\n${entry.text}\n\n`;
      fileContent += `--------------------------------------------------\n\n`;
    });

    const blob = new Blob([fileContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mindsafe-private-journal-backup-${new Date().toISOString().split("T")[0]}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Sync state when selected date changes
  useEffect(() => {
    const pendingDraft = localStorage.getItem("mindsafe_pending_journal_draft");
    if (pendingDraft && selectedDate === getTodayDateStr()) {
      localStorage.removeItem("mindsafe_pending_journal_draft");
      const currentText = entries[selectedDate]?.text || "";
      const mergedText = currentText ? `${currentText}\n\n${pendingDraft}` : pendingDraft;
      setInputText(mergedText);
      const mood = entries[selectedDate]?.mood || "🌱";
      const focus = entries[selectedDate]?.focus || "MindSafe Reflection";
      setSelectedMood(mood);
      setDailyFocus(focus);
      handleSave(mergedText, mood, focus);
      return;
    }

    const entry = entries[selectedDate];
    if (entry) {
      setInputText(entry.text);
      setSelectedMood(entry.mood || "");
      setDailyFocus(entry.focus || "");
    } else {
      setInputText("");
      setSelectedMood("");
      setDailyFocus("");
    }
  }, [selectedDate, entries]);

  // Persist entries to localStorage
  const saveEntries = (updatedEntries: Record<string, JournalEntry>) => {
    localStorage.setItem("mindsafe_journal_entries", JSON.stringify(updatedEntries));
    setEntries(updatedEntries);
  };

  // Debounced auto-save or manual save
  const handleSave = (textToSave = inputText, moodToSave = selectedMood, focusToSave = dailyFocus) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setSaveStatus("saving");

    saveTimeoutRef.current = setTimeout(() => {
      const updated = { ...entries };
      const trimmedText = textToSave.trim();

      if (!trimmedText && !moodToSave && !focusToSave) {
        // If everything is empty, delete the entry for this date
        if (updated[selectedDate]) {
          delete updated[selectedDate];
        }
      } else {
        // Save/Update the entry
        updated[selectedDate] = {
          date: selectedDate,
          text: trimmedText,
          mood: moodToSave,
          focus: focusToSave.trim(),
          updatedAt: new Date().toISOString(),
        };
      }

      saveEntries(updated);
      setSaveStatus("saved");

      setTimeout(() => {
        setSaveStatus("idle");
      }, 1500);
    }, 600);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputText(val);
    handleSave(val, selectedMood, dailyFocus);
  };

  const handleMoodSelect = (mood: string) => {
    const nextMood = selectedMood === mood ? "" : mood;
    setSelectedMood(nextMood);
    handleSave(inputText, nextMood, dailyFocus);
  };

  const handleFocusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDailyFocus(val);
    handleSave(inputText, selectedMood, val);
  };

  const handleDeleteEntry = (dateToDelete: string) => {
    if (confirm(`Are you sure you want to delete your journal entry for ${dateToDelete}?`)) {
      const updated = { ...entries };
      delete updated[dateToDelete];
      saveEntries(updated);
      if (selectedDate === dateToDelete) {
        setInputText("");
        setSelectedMood("");
        setDailyFocus("");
      }
    }
  };

  // Date Navigation Helper
  const adjustDate = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`;
    setSelectedDate(dateStr);
  };

  // Filter & Search entries
  const filteredEntries: JournalEntry[] = React.useMemo(() => {
    return Object.keys(entries)
      .map((key) => entries[key])
      .filter((entry) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          entry.text.toLowerCase().includes(q) ||
          (entry.focus && entry.focus.toLowerCase().includes(q)) ||
          (entry.mood && entry.mood.toLowerCase().includes(q)) ||
          entry.date.includes(q)
        );
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [entries, searchQuery]);

  const formatDateLabel = (dateStr: string) => {
    const today = getTodayDateStr();
    const d = new Date(dateStr);
    
    // Yesterday check
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

    if (dateStr === today) return "Today";
    if (dateStr === yesterdayStr) return "Yesterday";
    
    return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-[24px] p-6 backdrop-blur-md text-left relative overflow-hidden flex flex-col" id="privateJournalSection">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#FBBF24]/5 rounded-full blur-2xl pointer-events-none" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 select-none">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-lg bg-[#FBBF24]/10 text-[#FBBF24]">
            <BookOpen className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-100 tracking-wide font-sans">
              Private Resilience Journal
            </h3>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">
              CONFIDENTIAL • SECURE LOGS
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {saveStatus === "saving" && (
            <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-[#FBBF24] rounded-full animate-ping" />
              Saving...
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <Check className="w-3 h-3" />
              Saved
            </span>
          )}
        </div>
      </div>

      {/* Date Navigation Bar */}
      <div className="flex items-center justify-between gap-2 mb-4 bg-black/20 p-2 rounded-xl border border-white/5">
        <button
          type="button"
          onClick={() => adjustDate(-1)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          title="Previous Day"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex-1 flex items-center justify-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          <input
            type="date"
            value={selectedDate}
            max={getTodayDateStr()}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent border-none text-xs font-bold font-mono text-slate-200 focus:outline-none cursor-pointer"
          />
          <span className="text-[10px] text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full uppercase font-mono">
            {formatDateLabel(selectedDate)}
          </span>
        </div>

        <button
          type="button"
          onClick={() => adjustDate(1)}
          disabled={selectedDate >= getTodayDateStr()}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          title="Next Day"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Mood Selector for Selected Date */}
      <div className="mb-4">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-2 select-none font-mono">
          How is your spirit today?
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          {MOODS.map((m) => (
            <button
              key={m.label}
              type="button"
              onClick={() => handleMoodSelect(m.label)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] font-medium transition-all cursor-pointer ${
                selectedMood === m.label
                  ? "border-amber-400 bg-amber-400/10 text-amber-300 font-bold shadow-[0_0_8px_rgba(251,191,36,0.15)]"
                  : "border-white/5 text-slate-400 hover:text-slate-200"
              } ${m.color.split(" ").slice(1).join(" ")}`}
              title={m.label}
            >
              <span className="text-sm">{m.emoji}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Daily Focus / Mindful Anchor input */}
      <div className="mb-4">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 select-none font-mono">
          Daily Anchor / Personal Intention
        </span>
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={dailyFocus}
              onChange={handleFocusChange}
              maxLength={50}
              placeholder="e.g. Speak kindly to myself, take deep breaths"
              className="w-full bg-black/20 border border-white/5 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors font-sans"
            />
            <PenTool className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <button
            type="button"
            onClick={() => handleSave(inputText, selectedMood, dailyFocus)}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/35 text-xs text-amber-400 font-bold tracking-wide uppercase cursor-pointer select-none transition-all flex items-center gap-1 shrink-0"
            title="Save daily intention anchor"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save Focus</span>
          </button>
        </div>
      </div>

      {/* Journal Entry Textarea & Voice Note Recorder */}
      <div className="mb-4 relative">
        <div className="flex items-center justify-between mb-1.5 select-none">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
            Confidential Thoughts & Reflections
          </span>

          {/* Quick Dedicated Record Voice Note Button */}
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isTransforming || isTranscribing}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm select-none ${
              isRecording
                ? "bg-rose-500 text-white border border-rose-400/50 animate-pulse shadow-rose-500/30"
                : "bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-400/30 hover:border-amber-400/60"
            }`}
            id="recordVoiceNoteBtn"
            title={isRecording ? "Click to stop and transcribe voice note" : "Record your thoughts with voice note transcription"}
          >
            {isTranscribing ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-amber-300" />
                <span>Transcribing...</span>
              </>
            ) : isRecording ? (
              <>
                <MicOff className="w-3 h-3 text-white animate-bounce" />
                <span>Stop Recording ({Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, "0")})</span>
              </>
            ) : (
              <>
                <Mic className="w-3 h-3 text-amber-400" />
                <span>Record Voice Note</span>
              </>
            )}
          </button>
        </div>

        <div className="relative">
          <textarea
            value={inputText}
            onChange={handleTextChange}
            disabled={isTransforming || isTranscribing}
            placeholder="Write down or record whatever is in your head. Nobody can see this but you..."
            className="w-full bg-black/20 border border-white/5 rounded-xl p-3 pr-36 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors font-sans min-h-[120px] resize-none leading-relaxed animate-none"
          />
          {/* Audio voice dictation & Undo overlay buttons */}
          <div className="absolute right-3.5 bottom-3.5 flex items-center gap-2">
            {originalTextBeforeTransform && (
              <button
                type="button"
                onClick={handleUndoTransform}
                disabled={isTransforming || isTranscribing}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer flex items-center justify-center select-none"
                title="Undo AI Reframe"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
            )}
            
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isTransforming || isTranscribing}
              className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center select-none ${
                isRecording
                  ? "bg-rose-500/30 text-rose-300 border border-rose-500/50 animate-pulse"
                  : "bg-white/5 hover:bg-white/10 text-amber-400 hover:text-amber-300"
              }`}
              title={isRecording ? "Stop recording & transcribe" : "Record Voice Note"}
            >
              {isTranscribing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
              ) : isRecording ? (
                <MicOff className="w-3.5 h-3.5 text-rose-300" />
              ) : (
                <Mic className="w-3.5 h-3.5" />
              )}
            </button>

            {/* SEND / SAVE ENTRY BUTTON */}
            <button
              type="button"
              onClick={() => handleSave(inputText, selectedMood, dailyFocus)}
              disabled={isTransforming || isTranscribing || !inputText.trim()}
              className="p-1.5 px-3 rounded-lg bg-gradient-to-r from-amber-400 to-[#D97706] hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-[10px] uppercase tracking-wider transition-all hover:scale-[1.03] active:scale-[0.97] disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed select-none flex items-center gap-1 cursor-pointer shadow-md"
              title="Save thoughts to secure journal"
            >
              <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />
              <span>Save</span>
            </button>
          </div>
        </div>

        {/* Live Active Voice Note Recording Banner */}
        {isRecording && (
          <div className="mt-2 p-2.5 bg-gradient-to-r from-rose-950/60 via-slate-900 to-rose-950/60 border border-rose-500/30 text-rose-200 text-xs font-mono rounded-xl flex items-center justify-between select-none shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping shrink-0" />
              <div className="flex flex-col">
                <span className="font-bold text-rose-300 flex items-center gap-1.5">
                  Recording Voice Note...
                  <span className="flex items-center gap-0.5">
                    <span className="w-1 h-3 bg-rose-400 rounded-full animate-[bounce_1s_infinite_100ms]" />
                    <span className="w-1 h-4 bg-rose-400 rounded-full animate-[bounce_1s_infinite_200ms]" />
                    <span className="w-1 h-2 bg-rose-400 rounded-full animate-[bounce_1s_infinite_300ms]" />
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 font-sans">Speak your thoughts clearly. Tap stop when finished.</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="bg-rose-500/20 px-2 py-0.5 rounded-md border border-rose-500/30 text-rose-300 font-mono text-xs font-bold">
                {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, "0")}
              </span>
              <button
                type="button"
                onClick={stopRecording}
                className="px-2.5 py-1 bg-rose-500 hover:bg-rose-600 text-white font-bold text-[10px] uppercase rounded-lg transition-colors cursor-pointer shadow-md"
              >
                Stop & Transcribe
              </button>
            </div>
          </div>
        )}

        {/* Live Transcription Processing Banner */}
        {isTranscribing && (
          <div className="mt-2 p-2.5 bg-gradient-to-r from-amber-950/50 via-slate-900 to-amber-950/50 border border-amber-500/30 text-amber-200 text-xs font-mono rounded-xl flex items-center gap-2.5 select-none shadow-lg">
            <Loader2 className="w-4 h-4 animate-spin text-amber-400 shrink-0" />
            <div className="flex flex-col">
              <span className="font-bold text-amber-300">Transcribing Voice Note...</span>
              <span className="text-[10px] text-slate-400 font-sans">Gemini AI is processing your speech into verbatim text for your reflection entry.</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-1 select-none text-[9.5px] text-slate-500 font-mono">
          <span>{inputText.length} characters</span>
          <span>{inputText.split(/\s+/).filter(Boolean).length} words</span>
        </div>
      </div>

      {/* AI REFRACTION & TOOLBAR BUTTONS */}
      <div className="flex flex-wrap gap-3 mb-4 items-center justify-between border-t border-white/5 pt-3.5 select-none">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            AI Reframe:
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => handleTransform("summarize")}
              disabled={isTransforming || isTranscribing || !inputText.trim()}
              className="text-[9.5px] font-bold px-2 py-1 rounded-lg bg-white/5 border border-white/5 hover:border-amber-400/20 text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title="Summarize your entry into 1-2 punchy, mindful sentences"
            >
              Summarize
            </button>
            <button
              type="button"
              onClick={() => handleTransform("expand")}
              disabled={isTransforming || isTranscribing || !inputText.trim()}
              className="text-[9.5px] font-bold px-2 py-1 rounded-lg bg-white/5 border border-white/5 hover:border-amber-400/20 text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title="Expand thoughts with emotional depth and therapeutic insight"
            >
              Expand Depth
            </button>
            <button
              type="button"
              onClick={() => handleTransform("professionalize")}
              disabled={isTransforming || isTranscribing || !inputText.trim()}
              className="text-[9.5px] font-bold px-2 py-1 rounded-lg bg-white/5 border border-white/5 hover:border-amber-400/20 text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title="Word feelings elegantly, suitable for medical journals or sharing with therapists"
            >
              Refine Professionally
            </button>
          </div>
        </div>

        {/* Export Secure Journal Button */}
        <button
          type="button"
          onClick={handleExportJournalLogs}
          className="text-[9.5px] font-bold px-2.5 py-1.5 rounded-lg bg-amber-400/10 border border-amber-400/15 text-amber-300 hover:bg-amber-400 hover:text-slate-950 font-mono tracking-wide uppercase transition-all cursor-pointer flex items-center gap-1 ml-auto"
          title="Backup and export all private journals to Markdown"
        >
          <Download className="w-3 h-3" />
          <span>Export Logs</span>
        </button>
      </div>

      {/* PAST JOURNAL DIRECTORY / TIMELINE & SEARCH */}
      <div className="mt-2 border-t border-white/10 pt-4 flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3 select-none">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider font-mono">
              Journal Timeline ({filteredEntries.length} {filteredEntries.length === 1 ? "entry" : "entries"})
            </span>
            {searchQuery && (
              <span className="text-[9.5px] bg-amber-400/15 text-amber-300 px-2 py-0.5 rounded-full font-mono border border-amber-400/30 flex items-center gap-1">
                <Filter className="w-2.5 h-2.5" />
                Filtered
              </span>
            )}
          </div>
          
          {/* Prominent Search Bar with Clear Button */}
          <div className="relative flex items-center w-full sm:w-auto sm:min-w-[260px]">
            <input
              type="text"
              placeholder="Search reflections by keyword, topic, or date (YYYY-MM-DD)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 hover:border-white/20 focus:border-amber-400/50 rounded-xl pl-8 pr-8 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none transition-all font-sans shadow-inner"
              id="journalSearchInput"
            />
            <Search className="w-3.5 h-3.5 text-amber-400 absolute left-2.5 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 text-slate-400 hover:text-white p-0.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="text-center py-6 text-slate-400 border border-dashed border-white/10 rounded-2xl p-4 bg-black/15 select-none flex flex-col items-center justify-center gap-1.5">
            <Search className="w-5 h-5 text-slate-500 mb-0.5" />
            <p className="text-xs font-semibold text-slate-300">
              {searchQuery ? `No entries matching "${searchQuery}"` : "No journal entries recorded yet."}
            </p>
            <p className="text-[10px] text-slate-500 max-w-xs">
              {searchQuery ? "Try searching for a different keyword, mood label, or date string." : "Write your thoughts above or dictate your voice reflection to begin."}
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-2 text-[10px] font-bold text-amber-400 hover:text-amber-300 underline font-mono cursor-pointer"
              >
                Clear Search Filter
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredEntries.map((entry) => {
              const matchedMood = MOODS.find((m) => m.label === entry.mood);
              return (
                <div
                  key={entry.date}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer group flex flex-col ${
                    selectedDate === entry.date
                      ? "bg-amber-500/10 border-amber-500/20 shadow-sm"
                      : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10"
                  }`}
                  onClick={() => setSelectedDate(entry.date)}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5 select-none">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-amber-400" />
                      <span className="text-[10px] font-bold font-mono text-slate-300">
                        {entry.date}
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium">
                        ({formatDateLabel(entry.date)})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {matchedMood && (
                        <span className="text-xs" title={matchedMood.label}>
                          {matchedMood.emoji}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEntry(entry.date);
                        }}
                        className="text-slate-500 hover:text-rose-400 p-0.5 rounded transition-all opacity-0 group-hover:opacity-100"
                        title="Delete this entry"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {entry.focus && (
                    <p className="text-[10px] text-amber-300 font-mono truncate mb-1 border-l border-amber-500/30 pl-1.5">
                      ⚓ {entry.focus}
                    </p>
                  )}

                  <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">
                    {entry.text}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
