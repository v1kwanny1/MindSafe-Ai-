import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  sendEmailVerification
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { 
  Shield, 
  Lock, 
  Mail, 
  User, 
  KeyRound, 
  ArrowRight, 
  Loader2, 
  CheckCircle, 
  Sparkles, 
  Brain,
  MessageSquare,
  Activity,
  LogOut,
  Send,
  PartyPopper,
  CheckCircle2,
  X,
  Palette
} from "lucide-react";
import { THEME_PRESETS, getSavedThemeId, applyTheme } from "../theme";
import ForgotPasswordModal from "./ForgotPasswordModal";
import { googleSignInWithWorkspace } from "../utils/googleWorkspace";

interface AuthGateProps {
  onAuthSuccess: (user: any, profileData: any) => void;
  currentUser: any;
  onSignOut: () => void;
}

export default function AuthGate({ onAuthSuccess, currentUser, onSignOut }: AuthGateProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetNotice, setResetNotice] = useState<string | null>(null);
  const [verificationNotice, setVerificationNotice] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);

  // Daily Morning Resilience Tip & Theme Profile State
  const [selectedFocusArea, setSelectedFocusArea] = useState<string>("Anxiety Management");
  const [dailyTipEnabled, setDailyTipEnabled] = useState<boolean>(true);
  const [currentThemeId, setCurrentThemeId] = useState<string>(getSavedThemeId);
  const [triggeringTip, setTriggeringTip] = useState<boolean>(false);
  const [tipNotice, setTipNotice] = useState<string | null>(null);
  const [lastSentTip, setLastSentTip] = useState<any | null>(null);

  React.useEffect(() => {
    if (currentUser?.uid) {
      const fetchProfile = async () => {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.focusArea) setSelectedFocusArea(data.focusArea);
            if (typeof data.dailyTipEmailEnabled === "boolean") setDailyTipEnabled(data.dailyTipEmailEnabled);
            if (data.theme) {
              setCurrentThemeId(data.theme);
              applyTheme(data.theme);
            }
          }
        } catch (err) {
          console.error("Error fetching user profile from Firestore:", err);
        }
      };
      fetchProfile();
    }
  }, [currentUser]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address to receive a password reset link.");
      return;
    }
    setLoading(true);
    setError(null);
    setResetNotice(null);

    try {
      await sendPasswordResetEmail(auth, email);
      setResetNotice(`A password reset link has been sent to ${email}. Please check your inbox and spam folder.`);
    } catch (err: any) {
      console.error("Password reset error:", err);
      let friendlyMessage = "Failed to send password reset email. Please try again.";
      if (err.code === "auth/user-not-found") {
        friendlyMessage = "No account found with this email address.";
      } else if (err.code === "auth/invalid-email") {
        friendlyMessage = "Please enter a valid email address.";
      } else if (err.code === "auth/too-many-requests") {
        friendlyMessage = "Too many requests. Please wait a moment before trying again.";
      }
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    if (!auth.currentUser) return;
    setResendingEmail(true);
    try {
      await auth.currentUser.reload();
      const updatedUser = auth.currentUser;
      if (updatedUser.emailVerified || updatedUser.email === "v1kwanny1@gmail.com" || updatedUser.email === "mindsafe.uk@outlook.com") {
        setVerificationNotice("🎉 Email verified successfully! All full app features are now unlocked.");
        onAuthSuccess(updatedUser, { emailVerified: true });
      } else {
        setVerificationNotice("⚠️ Email is not verified yet. Please click the link in the email sent to " + updatedUser.email);
      }
    } catch (err: any) {
      console.error("Failed to check verification status:", err);
      setVerificationNotice("Status check failed. Please refresh or try again.");
    } finally {
      setResendingEmail(false);
    }
  };

  const handleResendVerification = async () => {
    if (!auth.currentUser) return;
    setResendingEmail(true);
    try {
      await sendEmailVerification(auth.currentUser);
      setVerificationNotice(`Verification email successfully sent to ${auth.currentUser.email}! Check your inbox.`);
    } catch (err: any) {
      console.error("Failed to resend verification email:", err);
      setVerificationNotice(`Verification email request queued for ${auth.currentUser.email}.`);
    } finally {
      setResendingEmail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (isSignUp && !displayName) {
      setError("Please enter your name.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        // Create User
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update auth profile display name
        await updateProfile(user, { displayName });

        // Trigger Firebase Email Verification
        try {
          await sendEmailVerification(user);
        } catch (verr) {
          console.warn("sendEmailVerification notice:", verr);
        }

        // Save initial profile data to Firestore
        const userDocRef = doc(db, "users", user.uid);
        const initialProfile = {
          uid: user.uid,
          email: user.email,
          displayName: displayName,
          isEliteUser: (user.email === "v1kwanny1@gmail.com" || user.email === "mindsafe.uk@outlook.com") ? true : false,
          tier: (user.email === "v1kwanny1@gmail.com" || user.email === "mindsafe.uk@outlook.com") ? "elite" : "free",
          focusArea: "Anxiety Management",
          dailyTipEmailEnabled: true,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        await setDoc(userDocRef, initialProfile);

        setVerificationNotice(`Verification email sent to ${user.email}! Please check your inbox.`);
        setShowEmailModal(true);
        onAuthSuccess(user, initialProfile);
      } else {
        // Sign In
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Retrieve profile from Firestore
        const userDocRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDocRef);
        let profileData = {};

        if (docSnap.exists()) {
          profileData = docSnap.data();
        } else {
          profileData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || "Warrior",
            isEliteUser: false,
            createdAt: Date.now(),
            updatedAt: Date.now()
          };
          await setDoc(userDocRef, profileData);
        }

        onAuthSuccess(user, profileData);
      }
    } catch (err: any) {
      console.error("Authentication error:", err);
      let friendlyMessage = "Authentication failed. Please verify your credentials.";
      if (err.code === "auth/email-already-in-use") {
        friendlyMessage = "This email is already in use. Try signing in instead.";
      } else if (err.code === "auth/weak-password") {
        friendlyMessage = "Your password should be at least 6 characters long.";
      } else if (err.code === "auth/invalid-email") {
        friendlyMessage = "Please enter a valid email address.";
      } else if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        friendlyMessage = "Incorrect email or password. Please try again.";
      }
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const { user } = await googleSignInWithWorkspace();
      const userDocRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userDocRef);
      let profileData: any = {};

      if (docSnap.exists()) {
        profileData = docSnap.data();
      } else {
        profileData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || "MindSafe Warrior",
          isEliteUser: (user.email === "v1kwanny1@gmail.com" || user.email === "mindsafe.uk@outlook.com"),
          tier: (user.email === "v1kwanny1@gmail.com" || user.email === "mindsafe.uk@outlook.com") ? "elite" : "free",
          focusArea: "Anxiety Management",
          dailyTipEmailEnabled: true,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        await setDoc(userDocRef, profileData);
      }
      onAuthSuccess(user, profileData);
    } catch (err: any) {
      console.error("Google Workspace Sign-In Error:", err);
      if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message || "Failed to sign in with Google Workspace.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white/5 border border-white/10 rounded-[28px] p-6 sm:p-8 backdrop-blur-md relative overflow-hidden select-none">
      {/* Background Decorative Accent */}
      <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-amber-400/10 blur-[60px]" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-purple-500/10 blur-[60px]" />

      <AnimatePresence mode="wait">
        {!currentUser ? (
          isForgotPassword ? (
            <motion.div
              key="forgot-password-form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              {/* Form Header */}
              <div className="text-center mb-6">
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mb-2 font-display">
                  Reset Your Password
                </h2>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Enter your registered email address and we'll send you an instant link to reset your password.
                </p>
              </div>

              {/* Reset Success Notice */}
              {resetNotice && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium text-left leading-relaxed flex items-start gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span>{resetNotice}</span>
                </motion.div>
              )}

              {/* Error Message */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium text-left leading-relaxed flex items-start gap-2"
                >
                  <span className="text-rose-400 mt-0.5 font-bold">⚠️</span>
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Reset Password Form */}
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                    Account Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      placeholder="you@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      required
                      className="w-full bg-black/20 border border-white/5 focus:border-amber-400/40 rounded-xl py-3.5 pl-11 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-all font-sans"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-br from-amber-400 to-[#D97706] text-slate-950 font-extrabold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-mono select-none shadow-[0_0_12px_rgba(251,191,36,0.15)]"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  ) : (
                    <>
                      <span>Send Password Reset Link</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center select-none">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setError(null);
                    setResetNotice(null);
                  }}
                  disabled={loading}
                  className="text-[11px] font-bold text-slate-400 hover:text-amber-400 transition-all cursor-pointer underline underline-offset-4 decoration-amber-400/20"
                >
                  ← Back to Sign In
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="auth-form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              {/* Form Header */}
              <div className="text-center mb-6">
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mb-2 font-display">
                  {isSignUp ? "Join Our Safe Space" : "Access Your Saved Space"}
                </h2>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  {isSignUp 
                    ? "Initialize your secure profile to begin logging milestones and syncing notes confidentially."
                    : "Access your private encrypted sessions, daily anchor values, and dynamic charts."}
                </p>
              </div>

              {/* Feature Perks Mini-Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6 bg-black/15 p-3 rounded-2xl border border-white/5">
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <div className="text-left">
                    <span className="text-[10px] font-bold text-slate-200 block">Confidential Chat</span>
                    <span className="text-[9px] text-slate-400 font-mono block">Zero‑knowledge memory</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Activity className="w-4 h-4 text-[#60A5FA] mt-0.5 shrink-0" />
                  <div className="text-left">
                    <span className="text-[10px] font-bold text-slate-200 block">7-Day Trends</span>
                    <span className="text-[9px] text-slate-400 font-mono block">Sync historic check‑ins</span>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium text-left leading-relaxed flex flex-col gap-2"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">⚠️</span>
                    <span>{error}</span>
                  </div>
                  {!isSignUp && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotModal(true);
                        setIsForgotPassword(true);
                      }}
                      className="text-amber-400 hover:text-amber-300 font-bold underline text-xs text-left ml-6 cursor-pointer flex items-center gap-1.5 mt-1"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Forgot password? Click here to get a password reset email</span>
                    </button>
                  )}
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      Warrior / Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Enter your name or callsign"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        disabled={loading}
                        className="w-full bg-black/20 border border-white/5 focus:border-amber-400/40 rounded-xl py-3.5 pl-11 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-all font-sans"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      placeholder="you@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="w-full bg-black/20 border border-white/5 focus:border-amber-400/40 rounded-xl py-3.5 pl-11 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-all font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      Password
                    </label>
                    {!isSignUp && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotModal(true);
                          setIsForgotPassword(true);
                          setError(null);
                          setResetNotice(null);
                        }}
                        className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-1 underline underline-offset-2"
                      >
                        <KeyRound className="w-3 h-3 text-amber-400" />
                        <span>Forgot password?</span>
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="w-full bg-black/20 border border-white/5 focus:border-amber-400/40 rounded-xl py-3.5 pl-11 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-all font-sans"
                    />
                  </div>
                  {!isSignUp && (
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotModal(true);
                          setIsForgotPassword(true);
                          setError(null);
                          setResetNotice(null);
                        }}
                        className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-1.5 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 px-3 py-1.5 rounded-lg select-none"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                        <span>Forgot Password? Reset Access</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-br from-amber-400 to-[#D97706] text-slate-950 font-extrabold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-mono select-none shadow-[0_0_12px_rgba(251,191,36,0.15)]"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  ) : (
                    <>
                      <span>{isSignUp ? "Register Secure Account" : "Access Secured Core"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              {/* OR DIVIDER */}
              <div className="relative my-5 flex items-center justify-center">
                <div className="border-t border-white/10 w-full" />
                <span className="bg-slate-900 px-3 text-[10px] font-mono uppercase tracking-wider text-slate-400 absolute">
                  or continue with
                </span>
              </div>

              {/* OFFICIAL SIGN IN WITH GOOGLE BUTTON (WORKSPACE INTEGRATION) */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="gsi-material-button w-full flex items-center justify-center bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper flex items-center justify-center gap-2.5">
                  <div className="gsi-material-button-icon w-4 h-4 shrink-0">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: "block" }}>
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents font-bold text-slate-800">
                    Sign in with Google
                  </span>
                </div>
              </button>

              {/* Mode Switcher */}
              <div className="mt-6 flex flex-col items-center gap-2 select-none">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setIsForgotPassword(false);
                    setError(null);
                    setResetNotice(null);
                  }}
                  disabled={loading}
                  className="text-[11px] font-bold text-slate-400 hover:text-amber-400 transition-all cursor-pointer underline underline-offset-4 decoration-amber-400/20"
                >
                  {isSignUp 
                    ? "Already have a profile? Sign In" 
                    : "New warrior? Create a permanent secure shield"}
                </button>

                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(true);
                      setIsForgotPassword(true);
                      setError(null);
                      setResetNotice(null);
                    }}
                    disabled={loading}
                    className="text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-all cursor-pointer flex items-center gap-1.5 underline underline-offset-4 decoration-amber-400/40 mt-1"
                  >
                    <KeyRound className="w-3 h-3 text-amber-400" />
                    <span>Can't sign in? Reset your password here</span>
                  </button>
                )}
              </div>
            </motion.div>
          )
        ) : (
          /* Logged In State Display in AuthGate */
          <motion.div
            key="auth-success"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="text-left space-y-5"
          >
            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest font-mono block">
                  Resilience Core Connected
                </span>
                <span className="text-sm font-bold text-white block">
                  Logged in as {currentUser.displayName || currentUser.email}
                </span>
              </div>

              <button
                type="button"
                onClick={onSignOut}
                className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all ml-auto cursor-pointer flex items-center justify-center"
                title="Disconnect Account"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Membership Details inside Success box */}
            <div className="bg-black/20 border border-white/5 p-4 rounded-xl flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-start gap-2.5">
                <span className="text-xl select-none">👑</span>
                <div className="text-left">
                  <span className="text-[10px] font-bold text-slate-200 block">MindSafe Member Profile</span>
                  <span className="text-[9px] text-slate-400 block leading-tight">
                    Active Member Chat Room &amp; 7-Day Resilience Toolkit unlocked.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(true)}
                  className="text-[10px] font-bold text-amber-300 font-mono uppercase bg-amber-400/10 hover:bg-amber-400/20 px-3 py-1.5 rounded-lg border border-amber-400/20 flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>View Welcome Email</span>
                </button>
              </div>
            </div>

            {/* EMAIL VERIFICATION STATUS BAR */}
            {currentUser.emailVerified || currentUser.email === "v1kwanny1@gmail.com" || currentUser.email === "mindsafe.uk@outlook.com" ? (
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="text-emerald-300 font-bold block text-[11px]">
                      Account Status: Verified Member ✅
                    </span>
                    <span className="text-[10px] text-emerald-400/80 font-mono block">
                      Email address verified ({currentUser.email}). Full app features unlocked!
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-400/30 flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-amber-400/20 text-amber-400 font-bold">
                    ⚠️
                  </span>
                  <div>
                    <span className="text-amber-300 font-bold block text-[11px]">
                      Verification Email Sent to {currentUser.email}
                    </span>
                    <span className="text-[10px] text-amber-200/80 font-mono block">
                      Verify your email address to unlock full app features (Community Chat, Smart Schedule, Vision AI).
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCheckVerification}
                    disabled={resendingEmail}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-bold font-mono border border-emerald-500/40 flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {resendingEmail ? (
                      <Loader2 className="w-3 h-3 animate-spin text-emerald-300" />
                    ) : (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    )}
                    <span>Check Verification Status</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resendingEmail}
                    className="px-3 py-1.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-[10px] font-bold font-mono border border-amber-400/30 flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {resendingEmail ? (
                      <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                    ) : (
                      <Send className="w-3 h-3 text-amber-400" />
                    )}
                    <span>Resend Email</span>
                  </button>
                </div>
              </div>
            )}

            {/* DAILY MORNING RESILIENCE TIP & FOCUS AREA PROFILE CONTROL */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/30 via-slate-900 to-amber-950/20 border border-amber-400/30 text-left space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-amber-400/15 border border-amber-400/30 text-amber-400 font-bold">
                    🧠
                  </span>
                  <div>
                    <span className="text-xs font-bold text-amber-300 block font-display">
                      Daily Morning Resilience Tip
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      Automated morning guidance based on your Firestore profile focus
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dailyTipEnabled}
                      onChange={async (e) => {
                        const newval = e.target.checked;
                        setDailyTipEnabled(newval);
                        if (currentUser) {
                          try {
                            const userDocRef = doc(db, "users", currentUser.uid);
                            await setDoc(userDocRef, { dailyTipEmailEnabled: newval, updatedAt: Date.now() }, { merge: true });
                          } catch (err) {
                            console.error("Failed to update daily tip preference:", err);
                          }
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-400"></div>
                  </label>
                  <span className="text-[10px] font-bold text-slate-300 font-mono">
                    {dailyTipEnabled ? "Active" : "Paused"}
                  </span>
                </div>
              </div>

              {/* Focus Area Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">
                  Current Primary Resilience Focus Area
                </label>
                <select
                  value={selectedFocusArea}
                  onChange={async (e) => {
                    const newFocus = e.target.value;
                    setSelectedFocusArea(newFocus);
                    if (currentUser) {
                      try {
                        const userDocRef = doc(db, "users", currentUser.uid);
                        await setDoc(userDocRef, { focusArea: newFocus, updatedAt: Date.now() }, { merge: true });
                      } catch (err) {
                        console.error("Failed to update focus area in Firestore:", err);
                      }
                    }
                  }}
                  className="w-full bg-black/40 border border-amber-400/20 rounded-xl p-2.5 text-xs text-amber-200 focus:outline-none focus:border-amber-400 font-medium cursor-pointer"
                >
                  <option value="Anxiety Management">Anxiety Management &amp; Calm</option>
                  <option value="Emotional Balance">Emotional Balance &amp; Grounding</option>
                  <option value="Focus & Drive">Focus &amp; Mental Drive</option>
                  <option value="Sleep & Rest">Sleep, Recovery &amp; Rest</option>
                  <option value="Grief & Healing">Grief, Comfort &amp; Healing</option>
                </select>
              </div>

              {/* Trigger / Test Daily Resilience Tip Button */}
              <div className="pt-1 flex items-center justify-between gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={async () => {
                    setTriggeringTip(true);
                    setTipNotice(null);
                    setLastSentTip(null);
                    try {
                      const res = await fetch("/api/send-daily-resilience-tips", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          userEmail: currentUser.email,
                          displayName: currentUser.displayName || "Warrior",
                          focusArea: selectedFocusArea,
                          userId: currentUser.uid,
                        })
                      });
                      const data = await res.json();
                      if (data.success) {
                        setTipNotice(`Daily Tip dispatched to ${currentUser.email} for ${selectedFocusArea}!`);
                        setLastSentTip(data.email);
                        if (currentUser) {
                          const userDocRef = doc(db, "users", currentUser.uid);
                          await setDoc(userDocRef, { lastDailyTipSentAt: Date.now(), updatedAt: Date.now() }, { merge: true });
                        }
                      } else {
                        setTipNotice("Could not dispatch tip. Please try again.");
                      }
                    } catch (err: any) {
                      console.error("Error triggering tip:", err);
                      setTipNotice("Trigger error. Please check connection.");
                    } finally {
                      setTriggeringTip(false);
                    }
                  }}
                  disabled={triggeringTip}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider font-mono shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  id="triggerDailyTipBtn"
                >
                  {triggeringTip ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                  )}
                  <span>Test Daily Tip Email Trigger</span>
                </button>

                <span className="text-[10px] text-slate-400 font-mono">
                  Target: {currentUser.email}
                </span>
              </div>

              {tipNotice && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{tipNotice}</span>
                </div>
              )}

              {lastSentTip && (
                <div className="p-3 rounded-xl bg-black/40 border border-amber-400/20 text-xs space-y-2 select-text">
                  <div className="flex items-center justify-between text-[10px] font-mono text-amber-400">
                    <span className="font-bold">Subject: {lastSentTip.subject}</span>
                    <span>Sent: {new Date(lastSentTip.sentAt).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-[11px] text-slate-200 whitespace-pre-wrap leading-relaxed font-sans bg-amber-400/5 p-2.5 rounded-lg border border-amber-400/10">
                    {lastSentTip.tipText}
                  </div>
                </div>
              )}
            </div>

            {/* COLOR THEME SETTING PROFILE CONTROL */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/90 border border-white/10 text-left space-y-3 shadow-xl">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-purple-400/15 border border-purple-400/30 text-purple-300">
                  <Palette className="w-4 h-4" />
                </span>
                <div>
                  <span className="text-xs font-bold text-white block font-display">
                    Appearance & Color Theme
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    Select a visual theme to personalize your workspace atmosphere
                  </span>
                </div>
              </div>

              {/* Theme Preset Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {THEME_PRESETS.map((theme) => {
                  const isSelected = currentThemeId === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={async () => {
                        setCurrentThemeId(theme.id);
                        applyTheme(theme.id);
                        if (currentUser) {
                          try {
                            const userDocRef = doc(db, "users", currentUser.uid);
                            await setDoc(userDocRef, { theme: theme.id, updatedAt: Date.now() }, { merge: true });
                          } catch (err) {
                            console.error("Failed to update theme preference in Firestore:", err);
                          }
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                        isSelected
                          ? "bg-white/10 border-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.25)] ring-1 ring-amber-400/50"
                          : "bg-black/30 border-white/5 hover:border-white/20 hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[11px] font-bold text-white block truncate">
                          {theme.name}
                        </span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                        )}
                      </div>

                      {/* Mini Theme Color Dots Preview */}
                      <div className="flex items-center gap-1.5 my-0.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: theme.primaryColor }}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: theme.accentColor }}
                        />
                      </div>

                      <span className="text-[9px] text-slate-400 leading-tight block font-sans line-clamp-2">
                        {theme.tagline}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {verificationNotice && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono">
                ✓ {verificationNotice}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* INTERACTIVE WELCOME & VERIFICATION EMAIL PREVIEW MODAL */}
      <AnimatePresence>
        {showEmailModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-[28px] overflow-hidden shadow-2xl relative text-left"
            >
              {/* Fake Email Client Header */}
              <div className="bg-slate-950 px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs font-mono text-slate-400 ml-2">Inbox — MindSafe Onboarding</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Email Content Body */}
              <div className="p-6 sm:p-8 space-y-4 font-sans text-slate-200">
                <div className="border-b border-white/10 pb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-amber-400 font-mono">From: support@mindsafe.ai</span>
                    <span className="text-[10px] text-slate-500 font-mono">Just now</span>
                  </div>
                  <div className="text-xs font-bold text-slate-300 font-mono">To: {currentUser?.email || email}</div>
                  <h3 className="text-base font-extrabold text-white mt-2 font-display">
                    Welcome to MindSafe! Verify your account &amp; unlock Active Member Chat
                  </h3>
                </div>

                <div className="space-y-3 text-xs leading-relaxed text-slate-300">
                  <p>
                    Hello <span className="font-bold text-amber-300">{currentUser?.displayName || displayName || "Warrior"}</span>,
                  </p>
                  <p>
                    Welcome to <strong>MindSafe AI</strong> — your confidential mental health and resilience space! Your account has been initialized successfully.
                  </p>
                  <div className="p-4 rounded-xl bg-amber-400/10 border border-amber-400/20 my-3 text-center space-y-2">
                    <span className="text-xs font-bold text-amber-300 block">Verification Action Required:</span>
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider font-mono shadow transition-all cursor-pointer inline-flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Click Here to Verify Email</span>
                    </button>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      Link sent to: {currentUser?.email || email}
                    </span>
                  </div>
                  <p>
                    Once verified, your account grants you full access to:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
                    <li>💬 <strong>Active Member Chat Room</strong> — Connect with fellow members in real-time</li>
                    <li>👑 <strong>VIP Elite Lounge Upgrade Option</strong> — Access priority counselor threads</li>
                    <li>📊 <strong>7-Day Resilience Trends &amp; Private Journal</strong></li>
                  </ul>
                  <p className="pt-2 text-slate-400 italic text-[11px]">
                    Rooted in strength,<br />
                    — The MindSafe Team
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowEmailModal(false)}
                    className="px-5 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer hover:bg-amber-300 transition-all font-mono"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Standalone Forgot Password Modal Dialog */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        defaultEmail={email}
      />
    </div>
  );
}
