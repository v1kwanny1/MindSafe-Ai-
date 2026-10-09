import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { 
  Mail, 
  KeyRound, 
  Send, 
  Loader2, 
  CheckCircle2, 
  X, 
  ShieldCheck,
  AlertCircle
} from "lucide-react";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

export default function ForgotPasswordModal({
  isOpen,
  onClose,
  defaultEmail = ""
}: ForgotPasswordModalProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (defaultEmail) {
      setEmail(defaultEmail);
    }
  }, [defaultEmail]);

  useEffect(() => {
    if (!isOpen) {
      // Reset state on close
      setError(null);
      setSuccessMessage(null);
      setLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await sendPasswordResetEmail(auth, trimmedEmail);
      setSuccessMessage(`Password reset link sent to ${trimmedEmail}! Please check your inbox and spam folder.`);
    } catch (err: any) {
      console.error("Firebase sendPasswordResetEmail error:", err);
      let msg = "Failed to send password reset email. Please try again.";
      if (err.code === "auth/user-not-found") {
        msg = "No account found with this email address.";
      } else if (err.code === "auth/invalid-email") {
        msg = "Please enter a valid email address.";
      } else if (err.code === "auth/too-many-requests") {
        msg = "Too many requests. Please wait a moment before trying again.";
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
            className="relative w-full max-w-md bg-slate-900 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-slate-100 z-10"
          >
            {/* Background Gradient Accents */}
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-amber-500/10 blur-[50px] pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-indigo-500/10 blur-[50px] pointer-events-none" />

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-amber-400/10 border border-amber-500/30 flex items-center justify-center mb-3 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white tracking-tight font-display mb-1">
                Reset Password
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                Enter your account email address and we'll send you an official Firebase password reset link.
              </p>
            </div>

            {/* Success Message Banner */}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium leading-relaxed flex items-start gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-emerald-200 mb-0.5">Reset Email Sent</p>
                  <p>{successMessage}</p>
                </div>
              </motion.div>
            )}

            {/* Error Message Banner */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium leading-relaxed flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-rose-200 mb-0.5">Reset Request Failed</p>
                  <p>{error}</p>
                </div>
              </motion.div>
            )}

            {/* Reset Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    disabled={loading}
                    required
                    className="w-full bg-slate-950/60 border border-slate-800 focus:border-amber-400/50 rounded-xl py-3.5 pl-11 pr-4 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-all font-sans"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-extrabold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all hover:shadow-[0_0_20px_rgba(245,158,11,0.25)] active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-mono"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Email</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Information */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>MindSafe Protected Auth</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-amber-400 font-medium transition-colors cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
