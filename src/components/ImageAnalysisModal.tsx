import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Image as ImageIcon,
  Upload,
  Sparkles,
  X,
  Loader2,
  CheckCircle2,
  Eye,
  FileText,
  Bookmark
} from "lucide-react";

interface ImageAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  isEmailVerified?: boolean;
  onSaveInsight?: (text: string) => void;
}

export const ImageAnalysisModal: React.FC<ImageAnalysisModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  isEmailVerified = true,
  onSaveInsight
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/jpeg");
  const [queryPrompt, setQueryPrompt] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMimeType(file.type || "image/jpeg");
    const reader = new FileReader();
    reader.onload = (evt) => {
      const base64 = evt.target?.result as string;
      setSelectedImage(base64);
      setAnalysisResult(null);
      setIsSaved(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRunAnalysis = async () => {
    if (!selectedImage || isAnalyzing) return;

    if (currentUser && !isEmailVerified) {
      setAnalysisResult("⚠️ Email verification required: Please verify your email address (" + currentUser.email + ") to run Multimodal Vision AI analysis.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      // Extract pure base64 string without data:image/...;base64, prefix
      const base64Data = selectedImage.split(",")[1] || selectedImage;

      const res = await fetch("/api/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: mimeType,
          userQuery: queryPrompt.trim() || undefined,
          userName: currentUser?.displayName || "Warrior"
        })
      });

      const data = await res.json();
      if (data.analysis) {
        setAnalysisResult(data.analysis);
      } else {
        setAnalysisResult("⚠️ Analysis complete. Stay strong and continue your mindfulness reflections.");
      }
    } catch (err: any) {
      console.error("Image analysis error:", err);
      setAnalysisResult("⚠️ Multimodal Vision AI is temporarily unavailable offline.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveToBreakthroughs = () => {
    if (analysisResult && onSaveInsight) {
      onSaveInsight(analysisResult);
      setIsSaved(true);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-2xl bg-slate-900 border border-purple-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-left space-y-4 max-h-[90vh] overflow-y-auto"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full bg-white/5 hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-purple-500/20 border border-purple-400/30 text-purple-300">
              <Eye className="w-6 h-6" />
            </span>
            <div>
              <h3 className="text-lg font-black text-white font-display">
                Multimodal AI Image &amp; Journal Vision Analysis
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Analyze handwritten journals, mood drawings, or scenery with Gemini Vision
              </p>
            </div>
          </div>

          {/* Upload Area */}
          <div className="space-y-3">
            {!selectedImage ? (
              <label className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-white/15 bg-black/30 hover:border-purple-400/50 hover:bg-white/5 transition-all cursor-pointer text-center space-y-2">
                <Upload className="w-8 h-8 text-purple-400 animate-bounce" />
                <span className="text-xs font-bold text-white">
                  Click to Upload or Drag &amp; Drop an Image
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Supports JPG, PNG, WEBP (Handwritten notes, mood art, scenery, etc.)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black/40 max-h-56 flex items-center justify-center">
                  <img
                    src={selectedImage}
                    alt="Upload Preview"
                    className="max-h-56 object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null);
                      setAnalysisResult(null);
                    }}
                    className="absolute top-2 right-2 px-2.5 py-1 rounded-xl bg-black/70 hover:bg-black text-white text-[11px] font-mono border border-white/20"
                  >
                    Change Image
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={queryPrompt}
                    onChange={(e) => setQueryPrompt(e.target.value)}
                    placeholder="Optional query e.g. 'Transcribe my journal entry' or 'What mood does this artwork reflect?'"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-400"
                  />
                  <button
                    type="button"
                    onClick={handleRunAnalysis}
                    disabled={isAnalyzing}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Analyze with Gemini</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Analysis Result */}
          {analysisResult && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 to-slate-900 border border-purple-400/30 space-y-3 text-left">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-bold text-purple-300 font-display flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  Multimodal Analysis Breakthrough
                </span>
                <button
                  type="button"
                  onClick={handleSaveToBreakthroughs}
                  disabled={isSaved}
                  className="px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Bookmark className="w-3 h-3" />
                  <span>{isSaved ? "Saved to Breakthroughs ✓" : "Save Breakthrough"}</span>
                </button>
              </div>

              <div className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                {analysisResult}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ImageAnalysisModal;
