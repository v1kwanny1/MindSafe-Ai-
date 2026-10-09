import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileText, 
  Table, 
  Calendar as CalendarIcon, 
  Mail, 
  FolderPlus, 
  Plus, 
  Trash2, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  Loader2,
  Send,
  Download,
  Share2,
  HardDrive
} from "lucide-react";
import { 
  googleSignInWithWorkspace, 
  getWorkspaceAccessToken, 
  workspaceLogout, 
  listDriveFiles, 
  createDriveFile, 
  deleteDriveFile,
  createResilienceSpreadsheet,
  listCalendarEvents,
  createCalendarEvent,
  deleteCalendarEvent,
  listRecentGmailMessages,
  sendGmailMessage,
  DriveFileItem,
  CalendarEventItem,
  GmailMessagePreview,
  SheetRowData
} from "../utils/googleWorkspace";
import { auth } from "../firebase";

interface GoogleWorkspaceHubProps {
  currentUser: any;
  savedMessagesCount?: number;
  recentJournalEntry?: string;
  dailyGoalText?: string;
}

export const GoogleWorkspaceHub: React.FC<GoogleWorkspaceHubProps> = ({
  currentUser,
  savedMessagesCount = 0,
  recentJournalEntry = "",
  dailyGoalText = "Daily MindSafe Resilience Practice"
}) => {
  const [activeTab, setActiveTab] = useState<"drive" | "sheets" | "calendar" | "gmail">("drive");
  const [isConnected, setIsConnected] = useState<boolean>(() => !!getWorkspaceAccessToken());
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Drive state
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [loadingDrive, setLoadingDrive] = useState<boolean>(false);
  const [newDocTitle, setNewDocTitle] = useState<string>("MindSafe_Resilience_Reflections.md");

  // Sheets state
  const [sheetUrl, setSheetUrl] = useState<string | null>(null);
  const [isExportingSheet, setIsExportingSheet] = useState<boolean>(false);

  // Calendar state
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventItem[]>([]);
  const [loadingCalendar, setLoadingCalendar] = useState<boolean>(false);
  const [eventSummary, setEventSummary] = useState<string>("🧠 MindSafe Daily Focus Hour");
  const [eventDate, setEventDate] = useState<string>(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [eventDurationMinutes, setEventDurationMinutes] = useState<number>(45);

  // Gmail state
  const [gmailMessages, setGmailMessages] = useState<GmailMessagePreview[]>([]);
  const [loadingGmail, setLoadingGmail] = useState<boolean>(false);
  const [mailTo, setMailTo] = useState<string>(currentUser?.email || "");
  const [mailSubject, setMailSubject] = useState<string>("MindSafe Resilience Check-In & Action Plan");
  const [mailBody, setMailBody] = useState<string>(
    "Hello,\n\nHere is my MindSafe Daily Resilience summary and grounding commitments for today.\n\nKey Milestone:\n- " +
    dailyGoalText +
    "\n\nReflections:\n- Steady mind, clear vision, grounded heart.\n\nSent safely via MindSafe AI."
  );

  // Operational status feedback
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Confirmation Modal State (MANDATORY: Workspace safety confirmation)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionLabel: string;
    isDestructive?: boolean;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: "",
    description: "",
    actionLabel: "Confirm",
    onConfirm: async () => {}
  });

  const [isExecutingAction, setIsExecutingAction] = useState<boolean>(false);

  // Check auth state on mount
  useEffect(() => {
    const token = getWorkspaceAccessToken();
    if (token) {
      setIsConnected(true);
      loadCurrentTabData(activeTab);
    }
  }, [activeTab]);

  const loadCurrentTabData = async (tab: "drive" | "sheets" | "calendar" | "gmail") => {
    const token = getWorkspaceAccessToken();
    if (!token) return;

    if (tab === "drive") {
      fetchDriveFiles();
    } else if (tab === "calendar") {
      fetchCalendarEvents();
    } else if (tab === "gmail") {
      fetchGmailMessages();
    }
  };

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const res = await googleSignInWithWorkspace();
      if (res.accessToken) {
        setIsConnected(true);
        setStatusMessage({ text: "Successfully connected to Google Workspace!", type: "success" });
        loadCurrentTabData(activeTab);
      }
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || "Failed to authenticate with Google Workspace.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleDisconnect = async () => {
    await workspaceLogout();
    setIsConnected(false);
    setDriveFiles([]);
    setCalendarEvents([]);
    setGmailMessages([]);
    setStatusMessage({ text: "Disconnected from Google Workspace.", type: "info" });
  };

  // ==========================
  // Google Drive Handlers
  // ==========================
  const fetchDriveFiles = async () => {
    setLoadingDrive(true);
    try {
      const files = await listDriveFiles();
      setDriveFiles(files);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ text: "Unable to load Drive files: " + err.message, type: "error" });
    } finally {
      setLoadingDrive(false);
    }
  };

  const requestCreateDriveDoc = () => {
    const docContent = `# MindSafe Resilience & Growth Document
Generated: ${new Date().toLocaleString()}
User: ${currentUser?.email || "MindSafe Warrior"}

## Current Goal & Focus
- ${dailyGoalText}

## Private Journal Snapshot
${recentJournalEntry || "No private entry logged for this period. Maintain focus and steady breathing."}

## Guidance & Grounding
- Anchor your spirit in quiet confidence.
- You are not alone in this journey.
- Ground your breath when waves of tension rise.

---
Safe Minds, Better Lives • MindSafe AI v4.0`;

    setConfirmDialog({
      isOpen: true,
      title: "Save File to Google Drive?",
      description: `Create a new document titled "${newDocTitle}" in your Google Drive account with your latest reflections and resilience goals.`,
      actionLabel: "Save to Drive",
      isDestructive: false,
      onConfirm: async () => {
        setIsExecutingAction(true);
        try {
          const res = await createDriveFile(newDocTitle, docContent, "text/markdown");
          setStatusMessage({ text: `Document "${res.name}" successfully created in Google Drive!`, type: "success" });
          fetchDriveFiles();
        } catch (e: any) {
          setStatusMessage({ text: "Failed to create file: " + e.message, type: "error" });
        } finally {
          setIsExecutingAction(false);
        }
      }
    });
  };

  const requestDeleteDriveFile = (file: DriveFileItem) => {
    setConfirmDialog({
      isOpen: true,
      title: "Permanently Delete File from Google Drive?",
      description: `Are you sure you want to delete "${file.name}" from your Google Drive? This action cannot be undone.`,
      actionLabel: "Delete File",
      isDestructive: true,
      onConfirm: async () => {
        setIsExecutingAction(true);
        try {
          await deleteDriveFile(file.id);
          setStatusMessage({ text: `File "${file.name}" was deleted.`, type: "info" });
          setDriveFiles(prev => prev.filter(f => f.id !== file.id));
        } catch (e: any) {
          setStatusMessage({ text: "Failed to delete file: " + e.message, type: "error" });
        } finally {
          setIsExecutingAction(false);
        }
      }
    });
  };

  // ==========================
  // Google Sheets Handlers
  // ==========================
  const requestExportSheets = () => {
    setConfirmDialog({
      isOpen: true,
      title: "Export Resilience Tracker to Google Sheets?",
      description: "Create a new formatted spreadsheet in Google Sheets containing your daily mood check-ins, focus minutes, and resilience reflections.",
      actionLabel: "Create Spreadsheet",
      isDestructive: false,
      onConfirm: async () => {
        setIsExecutingAction(true);
        setIsExportingSheet(true);
        try {
          // Compile real tracker rows from localStorage if available
          let storedRows: SheetRowData[] = [];
          try {
            const history = JSON.parse(localStorage.getItem("mindsafe_checkin_history") || "[]");
            if (Array.isArray(history) && history.length > 0) {
              storedRows = history.map((item: any) => ({
                date: item.date || new Date().toISOString().split("T")[0],
                moodScore: item.mood || item.score || 8,
                focusMinutes: item.focusMinutes || 45,
                goalStatus: item.goalCompleted ? "Completed" : "In Progress",
                notes: item.notes || "Grounded daily check-in"
              }));
            }
          } catch (e) {
            console.warn(e);
          }

          if (storedRows.length === 0) {
            storedRows = [
              {
                date: new Date().toISOString().split("T")[0],
                moodScore: 8,
                focusMinutes: 45,
                goalStatus: "Completed",
                notes: dailyGoalText
              },
              {
                date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
                moodScore: 7,
                focusMinutes: 30,
                goalStatus: "Completed",
                notes: "Calm breathing & focus sprint"
              }
            ];
          }

          const res = await createResilienceSpreadsheet(
            `MindSafe Resilience Tracker (${new Date().toLocaleDateString()})`,
            storedRows
          );
          setSheetUrl(res.spreadsheetUrl);
          setStatusMessage({ text: "Spreadsheet created successfully! Click below to view.", type: "success" });
        } catch (e: any) {
          setStatusMessage({ text: "Export to Sheets failed: " + e.message, type: "error" });
        } finally {
          setIsExecutingAction(false);
          setIsExportingSheet(false);
        }
      }
    });
  };

  // ==========================
  // Google Calendar Handlers
  // ==========================
  const fetchCalendarEvents = async () => {
    setLoadingCalendar(true);
    try {
      const events = await listCalendarEvents();
      setCalendarEvents(events);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ text: "Unable to load Calendar events: " + err.message, type: "error" });
    } finally {
      setLoadingCalendar(false);
    }
  };

  const requestCreateCalendarEvent = () => {
    const startObj = new Date(eventDate);
    const endObj = new Date(startObj.getTime() + eventDurationMinutes * 60000);

    setConfirmDialog({
      isOpen: true,
      title: "Schedule on Google Calendar?",
      description: `Add "${eventSummary}" to your Google Calendar on ${startObj.toLocaleDateString()} from ${startObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} to ${endObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
      actionLabel: "Add Event",
      isDestructive: false,
      onConfirm: async () => {
        setIsExecutingAction(true);
        try {
          const newEvent = await createCalendarEvent({
            summary: eventSummary,
            description: `MindSafe Focus Block • Intention: ${dailyGoalText}\n\nSafe Minds, Better Lives.`,
            startDateTime: startObj.toISOString(),
            endDateTime: endObj.toISOString(),
            location: "MindSafe Sanctuary"
          });
          setStatusMessage({ text: `Event "${newEvent.summary}" added to Google Calendar!`, type: "success" });
          fetchCalendarEvents();
        } catch (e: any) {
          setStatusMessage({ text: "Failed to schedule event: " + e.message, type: "error" });
        } finally {
          setIsExecutingAction(false);
        }
      }
    });
  };

  const requestDeleteCalendarEvent = (event: CalendarEventItem) => {
    setConfirmDialog({
      isOpen: true,
      title: "Remove Event from Google Calendar?",
      description: `Are you sure you want to remove "${event.summary}" from your Google Calendar?`,
      actionLabel: "Remove Event",
      isDestructive: true,
      onConfirm: async () => {
        setIsExecutingAction(true);
        try {
          await deleteCalendarEvent(event.id);
          setStatusMessage({ text: `Event removed from Google Calendar.`, type: "info" });
          setCalendarEvents(prev => prev.filter(e => e.id !== event.id));
        } catch (e: any) {
          setStatusMessage({ text: "Failed to delete event: " + e.message, type: "error" });
        } finally {
          setIsExecutingAction(false);
        }
      }
    });
  };

  // ==========================
  // Gmail Handlers
  // ==========================
  const fetchGmailMessages = async () => {
    setLoadingGmail(true);
    try {
      const msgs = await listRecentGmailMessages();
      setGmailMessages(msgs);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ text: "Unable to load Gmail messages: " + err.message, type: "error" });
    } finally {
      setLoadingGmail(false);
    }
  };

  const requestSendGmail = () => {
    if (!mailTo) {
      setStatusMessage({ text: "Please enter a valid recipient email address.", type: "error" });
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: "Send Email via Gmail?",
      description: `Send an email from your Gmail account to "${mailTo}" with subject "${mailSubject}".`,
      actionLabel: "Send Email",
      isDestructive: false,
      onConfirm: async () => {
        setIsExecutingAction(true);
        try {
          await sendGmailMessage(mailTo, mailSubject, mailBody);
          setStatusMessage({ text: `Email sent safely to ${mailTo}!`, type: "success" });
        } catch (e: any) {
          setStatusMessage({ text: "Failed to send email: " + e.message, type: "error" });
        } finally {
          setIsExecutingAction(false);
        }
      }
    });
  };

  return (
    <div className="w-full flex flex-col gap-6 text-left">
      {/* HEADER CARD */}
      <div className="bg-slate-900/50 border border-white/10 rounded-[24px] p-6 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🌐</span>
              <h2 className="text-lg font-bold text-white font-display">Google Workspace Hub</h2>
            </div>
            <p className="text-xs text-slate-300 font-sans">
              Seamlessly link your Google Drive, Sheets, Calendar, and Gmail with MindSafe AI.
            </p>
          </div>

          <div>
            {isConnected ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-emerald-300 font-mono font-bold">Google Connected</span>
                </div>
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-400 hover:text-white transition-all cursor-pointer font-mono"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              /* MANDATORY OFFICIAL GOOGLE SIGN-IN BUTTON */
              <button
                type="button"
                onClick={handleSignIn}
                disabled={isAuthenticating}
                className="gsi-material-button inline-flex items-center justify-center bg-white hover:bg-slate-100 text-slate-800 font-medium text-xs px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper flex items-center gap-2">
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
                    {isAuthenticating ? "Connecting..." : "Sign in with Google"}
                  </span>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* FEEDBACK STATUS BANNER */}
        {statusMessage && (
          <div className={`mt-3 p-3 rounded-xl border text-xs font-mono flex items-center justify-between gap-2 ${
            statusMessage.type === "success" 
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200" 
              : statusMessage.type === "error"
              ? "bg-rose-500/10 border-rose-500/30 text-rose-200"
              : "bg-sky-500/10 border-sky-500/30 text-sky-200"
          }`}>
            <span>{statusMessage.text}</span>
            <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}

        {authError && (
          <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs font-mono text-rose-200">
            {authError}
          </div>
        )}

        {/* WORKSPACE SUB-TABS */}
        <div className="flex items-center gap-2 mt-5 overflow-x-auto pb-1 select-none">
          <button
            type="button"
            onClick={() => setActiveTab("drive")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer ${
              activeTab === "drive"
                ? "bg-amber-400 text-slate-950 font-extrabold shadow-md"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Google Drive</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sheets")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer ${
              activeTab === "sheets"
                ? "bg-amber-400 text-slate-950 font-extrabold shadow-md"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Google Sheets</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("calendar")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer ${
              activeTab === "calendar"
                ? "bg-amber-400 text-slate-950 font-extrabold shadow-md"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Google Calendar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("gmail")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer ${
              activeTab === "gmail"
                ? "bg-amber-400 text-slate-950 font-extrabold shadow-md"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Gmail</span>
          </button>
        </div>
      </div>

      {/* TAB CONTENT AREA */}
      {!isConnected ? (
        <div className="bg-white/5 border border-dashed border-white/15 rounded-[24px] p-8 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-xl">
            🔒
          </div>
          <h3 className="text-sm font-bold text-white">Google Workspace Authorization Required</h3>
          <p className="text-xs text-slate-400 max-w-md">
            Click "Sign in with Google" above to grant permission to securely access your Google Drive, Sheets, Calendar, and Gmail in this session.
          </p>
          <button
            type="button"
            onClick={handleSignIn}
            className="mt-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs font-mono transition-all cursor-pointer shadow-md"
          >
            Connect with Google
          </button>
        </div>
      ) : (
        <div>
          {/* 1. GOOGLE DRIVE PANEL */}
          {activeTab === "drive" && (
            <div className="bg-slate-900/50 border border-white/10 rounded-[24px] p-6 backdrop-blur-md flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-amber-400" />
                    <span>MindSafe Google Drive Sync</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Backup journals, wisdom transcripts, and resilience action plans directly to Google Drive.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={fetchDriveFiles}
                  disabled={loadingDrive}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer font-mono"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingDrive ? "animate-spin" : ""}`} />
                  <span>Refresh Files</span>
                </button>
              </div>

              {/* SAVE NEW DOCUMENT SECTION */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">New Document Title</label>
                  <input
                    type="text"
                    value={newDocTitle}
                    onChange={(e) => setNewDocTitle(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400/50 font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={requestCreateDriveDoc}
                  className="sm:self-end px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs font-mono transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer shrink-0"
                >
                  <FolderPlus className="w-4 h-4 text-slate-950" />
                  <span>Backup to Google Drive</span>
                </button>
              </div>

              {/* RECENT FILES LIST */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Files on Google Drive ({driveFiles.length})
                </span>

                {loadingDrive ? (
                  <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2 text-xs font-mono">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Loading Drive files...</span>
                  </div>
                ) : driveFiles.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 border border-dashed border-white/10 rounded-2xl text-xs">
                    No files found in Google Drive yet. Click "Backup to Google Drive" above to create your first document!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {driveFiles.map((file) => (
                      <div
                        key={file.id}
                        className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-amber-400/30 transition-all flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                          <div className="overflow-hidden">
                            <span className="text-xs font-bold text-slate-200 group-hover:text-white block truncate">
                              {file.name}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono block">
                              {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString() : "Google Drive"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                              title="Open in Google Drive"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => requestDeleteDriveFile(file)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 transition-colors cursor-pointer"
                            title="Delete file"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. GOOGLE SHEETS PANEL */}
          {activeTab === "sheets" && (
            <div className="bg-slate-900/50 border border-white/10 rounded-[24px] p-6 backdrop-blur-md flex flex-col gap-6">
              <div>
                <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                  <Table className="w-4 h-4 text-emerald-400" />
                  <span>MindSafe Google Sheets Analytics</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Export structured resilience metrics, mood logs, and focus sessions directly into Google Sheets.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white">Resilience &amp; Habit Log Export</h4>
                  <p className="text-[11px] text-slate-400">
                    Generates columns for Date, Mood Rating (/10), Daily Focus Minutes, Goal Status, and Reflections.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={requestExportSheets}
                  disabled={isExportingSheet}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs font-mono transition-all flex items-center gap-2 shadow-md cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {isExportingSheet ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Creating Sheet...</span>
                    </>
                  ) : (
                    <>
                      <Table className="w-4 h-4 text-slate-950" />
                      <span>Export to Google Sheets</span>
                    </>
                  )}
                </button>
              </div>

              {sheetUrl && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-emerald-200 block">Spreadsheet Created Successfully!</span>
                      <span className="text-[10px] text-emerald-400/80 font-mono block">Data written to Google Sheets</span>
                    </div>
                  </div>
                  <a
                    href={sheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs font-mono flex items-center gap-1.5 transition-all"
                  >
                    <span>Open Sheet</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* 3. GOOGLE CALENDAR PANEL */}
          {activeTab === "calendar" && (
            <div className="bg-slate-900/50 border border-white/10 rounded-[24px] p-6 backdrop-blur-md flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-purple-400" />
                    <span>MindSafe Google Calendar Sync</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Schedule daily focus hours, mindfulness breaks, and routine check-ins on your Google Calendar.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={fetchCalendarEvents}
                  disabled={loadingCalendar}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer font-mono"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingCalendar ? "animate-spin" : ""}`} />
                  <span>Sync Events</span>
                </button>
              </div>

              {/* SCHEDULE NEW EVENT FORM */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Schedule New Routine Milestone
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">Event Title</label>
                    <input
                      type="text"
                      value={eventSummary}
                      onChange={(e) => setEventSummary(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400/50 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">Date &amp; Time</label>
                    <input
                      type="datetime-local"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400/50 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">Duration (Minutes)</label>
                    <select
                      value={eventDurationMinutes}
                      onChange={(e) => setEventDurationMinutes(parseInt(e.target.value, 10))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400/50 font-mono"
                    >
                      <option value={15}>15 Mins (Quick Reset)</option>
                      <option value={30}>30 Mins (Sanctuary Walk)</option>
                      <option value={45}>45 Mins (Focus Sprint)</option>
                      <option value={60}>60 Mins (Full Focus Hour)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end mt-1">
                  <button
                    type="button"
                    onClick={requestCreateCalendarEvent}
                    className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Google Calendar</span>
                  </button>
                </div>
              </div>

              {/* UPCOMING EVENTS LIST */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Upcoming Google Calendar Events ({calendarEvents.length})
                </span>

                {loadingCalendar ? (
                  <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2 text-xs font-mono">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                    <span>Loading calendar events...</span>
                  </div>
                ) : calendarEvents.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 border border-dashed border-white/10 rounded-2xl text-xs">
                    No upcoming events found on primary calendar.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {calendarEvents.map((evt) => {
                      const startTime = evt.start?.dateTime ? new Date(evt.start.dateTime).toLocaleString([], { dateStyle: "short", timeStyle: "short" }) : (evt.start?.date || "");
                      return (
                        <div
                          key={evt.id}
                          className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-purple-400/30 transition-all flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <Clock className="w-4 h-4 text-purple-400 shrink-0" />
                            <div className="overflow-hidden">
                              <span className="text-xs font-bold text-slate-200 block truncate">
                                {evt.summary}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono block">
                                {startTime} {evt.location ? `• ${evt.location}` : ""}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {evt.htmlLink && (
                              <a
                                href={evt.htmlLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                                title="Open in Google Calendar"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => requestDeleteCalendarEvent(evt)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 cursor-pointer"
                              title="Delete event"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. GMAIL PANEL */}
          {activeTab === "gmail" && (
            <div className="bg-slate-900/50 border border-white/10 rounded-[24px] p-6 backdrop-blur-md flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                    <Mail className="w-4 h-4 text-rose-400" />
                    <span>MindSafe Gmail Messenger</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Send daily resilience updates, accountability check-ins, or emergency reflections via your Gmail.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={fetchGmailMessages}
                  disabled={loadingGmail}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer font-mono"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingGmail ? "animate-spin" : ""}`} />
                  <span>Check Inbox</span>
                </button>
              </div>

              {/* COMPOSE GMAIL FORM */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Compose Wellness / Resilience Email
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">To (Email)</label>
                    <input
                      type="email"
                      value={mailTo}
                      onChange={(e) => setMailTo(e.target.value)}
                      placeholder="recipient@example.com"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400/50 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">Subject</label>
                    <input
                      type="text"
                      value={mailSubject}
                      onChange={(e) => setMailSubject(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400/50 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Message Body</label>
                  <textarea
                    rows={4}
                    value={mailBody}
                    onChange={(e) => setMailBody(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400/50 font-sans resize-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={requestSendGmail}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white font-bold text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send via Gmail</span>
                  </button>
                </div>
              </div>

              {/* RECENT INBOX MESSAGES */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Recent Gmail Inbox Messages ({gmailMessages.length})
                </span>

                {loadingGmail ? (
                  <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2 text-xs font-mono">
                    <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                    <span>Loading recent Gmail messages...</span>
                  </div>
                ) : gmailMessages.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 border border-dashed border-white/10 rounded-2xl text-xs">
                    No recent inbox messages loaded. Click "Check Inbox" to refresh.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {gmailMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex flex-col gap-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-white truncate max-w-sm">
                            {msg.subject}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono shrink-0">
                            {msg.date ? new Date(msg.date).toLocaleDateString() : ""}
                          </span>
                        </div>
                        <span className="text-[11px] text-amber-300/80 font-mono">
                          From: {msg.from}
                        </span>
                        <p className="text-[11px] text-slate-300 line-clamp-2">
                          {msg.snippet}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MANDATORY USER CONFIRMATION DIALOG (FOR DESTRUCTIVE/MUTATING WORKSPACE OPERATIONS) */}
      <AnimatePresence>
        {confirmDialog.isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-slate-900 border border-amber-400/40 rounded-[24px] p-6 shadow-2xl relative select-none"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg ${
                  confirmDialog.isDestructive ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                }`}>
                  {confirmDialog.isDestructive ? <AlertTriangle className="w-5 h-5 text-rose-400" /> : <Sparkles className="w-5 h-5 text-amber-400" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-display">
                    {confirmDialog.title}
                  </h3>
                  <span className="text-[10px] text-amber-300/80 font-mono">
                    Google Workspace Confirmation
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 font-sans leading-relaxed mb-6">
                {confirmDialog.description}
              </p>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                  disabled={isExecutingAction}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-xs font-mono font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    await confirmDialog.onConfirm();
                    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                  }}
                  disabled={isExecutingAction}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 shadow-md ${
                    confirmDialog.isDestructive
                      ? "bg-rose-600 hover:bg-rose-500 text-white"
                      : "bg-amber-400 hover:bg-amber-300 text-slate-950 font-black"
                  }`}
                >
                  {isExecutingAction && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{confirmDialog.actionLabel}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default GoogleWorkspaceHub;
