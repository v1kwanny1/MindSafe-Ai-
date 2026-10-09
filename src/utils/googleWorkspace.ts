import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User, signOut } from "firebase/auth";
import { auth } from "../firebase";

// Mandatory Google Workspace Scopes
export const WORKSPACE_SCOPES = [
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.readonly"
];

const provider = new GoogleAuthProvider();
WORKSPACE_SCOPES.forEach((scope) => provider.addScope(scope));

// In-Memory Token Cache (MANDATORY: Never in localStorage/sessionStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Initialize Workspace Auth State Listener
export const initWorkspaceAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else if (!isSigningIn) {
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in with Google Popup and obtain access token
export const googleSignInWithWorkspace = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Unable to obtain Google Workspace access token.");
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error("Google Workspace Sign-In Error:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getWorkspaceAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const setWorkspaceAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const workspaceLogout = async () => {
  cachedAccessToken = null;
  await signOut(auth);
};

// ==========================================
// 1. GOOGLE DRIVE APIS (Client-Side Bearer)
// ==========================================

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  webViewLink?: string;
  size?: string;
}

export const listDriveFiles = async (query?: string): Promise<DriveFileItem[]> => {
  const token = getWorkspaceAccessToken();
  if (!token) throw new Error("Google Workspace authentication required.");

  let q = "trashed = false";
  if (query) {
    q += ` and name contains '${query.replace(/'/g, "\\'")}'`;
  }

  const url = new URL("https://www.googleapis.com/drive/v3/files");
  url.searchParams.set("q", q);
  url.searchParams.set("fields", "files(id, name, mimeType, modifiedTime, webViewLink, size)");
  url.searchParams.set("pageSize", "20");
  url.searchParams.set("orderBy", "modifiedTime desc");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Google Drive API error: ${res.status} - ${errorText}`);
  }

  const data = await res.json();
  return data.files || [];
};

export const createDriveFile = async (
  filename: string,
  content: string,
  mimeType: string = "text/markdown"
): Promise<{ id: string; name: string; webViewLink?: string }> => {
  const token = getWorkspaceAccessToken();
  if (!token) throw new Error("Google Workspace authentication required.");

  // Multipart upload to Google Drive v3
  const boundary = "-------314159265358979323846";
  const delimiter = "\r\n--" + boundary + "\r\n";
  const closeDelimiter = "\r\n--" + boundary + "--";

  const metadata = {
    name: filename,
    mimeType: mimeType
  };

  const multipartRequestBody =
    delimiter +
    "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    content +
    closeDelimiter;

  const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": `multipart/related; boundary=${boundary}`
    },
    body: multipartRequestBody
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to create Google Drive file: ${res.status} - ${errorText}`);
  }

  return await res.json();
};

export const deleteDriveFile = async (fileId: string): Promise<boolean> => {
  const token = getWorkspaceAccessToken();
  if (!token) throw new Error("Google Workspace authentication required.");

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to delete Google Drive file: ${res.status} - ${errorText}`);
  }

  return true;
};

// ==========================================
// 2. GOOGLE SHEETS APIS (Client-Side Bearer)
// ==========================================

export interface SheetRowData {
  date: string;
  moodScore: number | string;
  focusMinutes: number | string;
  goalStatus: string;
  notes: string;
}

export const createResilienceSpreadsheet = async (
  title: string,
  rows: SheetRowData[]
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> => {
  const token = getWorkspaceAccessToken();
  if (!token) throw new Error("Google Workspace authentication required.");

  // Create empty spreadsheet with formatted sheet
  const createRes = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      properties: { title: title || "MindSafe Resilience Tracker" },
      sheets: [
        {
          properties: {
            title: "Daily Resilience Log",
            gridProperties: { rowCount: 100, columnCount: 10 }
          }
        }
      ]
    })
  });

  if (!createRes.ok) {
    const errorText = await createRes.text();
    throw new Error(`Failed to create Google Sheet: ${createRes.status} - ${errorText}`);
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;

  // Header row + data rows
  const header = ["Date & Time", "Mood Score (/10)", "Focus Minutes", "Daily Goal Status", "Reflections & Guidance"];
  const formattedRows = rows.map(r => [
    r.date,
    r.moodScore.toString(),
    r.focusMinutes.toString(),
    r.goalStatus,
    r.notes
  ]);

  const values = [header, ...formattedRows];

  // Append initial values
  const appendRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Daily Resilience Log!A1:E${values.length}:append?valueInputOption=USER_ENTERED`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ values })
    }
  );

  if (!appendRes.ok) {
    console.warn("Notice updating initial sheet rows:", await appendRes.text());
  }

  return {
    spreadsheetId,
    spreadsheetUrl: sheetData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`
  };
};

export const appendSheetRow = async (
  spreadsheetId: string,
  row: SheetRowData
): Promise<boolean> => {
  const token = getWorkspaceAccessToken();
  if (!token) throw new Error("Google Workspace authentication required.");

  const values = [[row.date, row.moodScore.toString(), row.focusMinutes.toString(), row.goalStatus, row.notes]];

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Daily Resilience Log!A:E:append?valueInputOption=USER_ENTERED`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ values })
    }
  );

  return res.ok;
};

// ==========================================
// 3. GOOGLE CALENDAR APIS (Client-Side Bearer)
// ==========================================

export interface CalendarEventItem {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  htmlLink?: string;
  location?: string;
}

export const listCalendarEvents = async (maxResults: number = 15): Promise<CalendarEventItem[]> => {
  const token = getWorkspaceAccessToken();
  if (!token) throw new Error("Google Workspace authentication required.");

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
  url.searchParams.set("timeMin", now.toISOString());
  url.searchParams.set("maxResults", maxResults.toString());
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to load Google Calendar events: ${res.status} - ${errorText}`);
  }

  const data = await res.json();
  return data.items || [];
};

export const createCalendarEvent = async (event: {
  summary: string;
  description: string;
  startDateTime: string; // ISO format
  endDateTime: string;   // ISO format
  location?: string;
}): Promise<CalendarEventItem> => {
  const token = getWorkspaceAccessToken();
  if (!token) throw new Error("Google Workspace authentication required.");

  const res = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      summary: event.summary,
      description: event.description,
      start: { dateTime: event.startDateTime },
      end: { dateTime: event.endDateTime },
      location: event.location || "MindSafe Sanctuary",
      reminders: {
        useDefault: false,
        overrides: [
          { method: "popup", minutes: 15 },
          { method: "popup", minutes: 5 }
        ]
      }
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to create Google Calendar event: ${res.status} - ${errorText}`);
  }

  return await res.json();
};

export const deleteCalendarEvent = async (eventId: string): Promise<boolean> => {
  const token = getWorkspaceAccessToken();
  if (!token) throw new Error("Google Workspace authentication required.");

  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to delete Google Calendar event: ${res.status} - ${errorText}`);
  }

  return true;
};

// ==========================================
// 4. GMAIL APIS (Client-Side Bearer)
// ==========================================

export interface GmailMessagePreview {
  id: string;
  threadId: string;
  snippet?: string;
  subject?: string;
  from?: string;
  date?: string;
}

export const listRecentGmailMessages = async (maxResults: number = 8): Promise<GmailMessagePreview[]> => {
  const token = getWorkspaceAccessToken();
  if (!token) throw new Error("Google Workspace authentication required.");

  const url = new URL("https://gmail.googleapis.com/gmail/v1/users/me/messages");
  url.searchParams.set("maxResults", maxResults.toString());
  url.searchParams.set("q", "label:INBOX");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to list Gmail messages: ${res.status} - ${errorText}`);
  }

  const data = await res.json();
  const messages = data.messages || [];

  // Fetch snippets & headers for top messages
  const messagePreviews: GmailMessagePreview[] = [];
  for (const m of messages.slice(0, 5)) {
    try {
      const msgRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (msgRes.ok) {
        const item = await msgRes.json();
        const headers = item.payload?.headers || [];
        const subject = headers.find((h: any) => h.name.toLowerCase() === "subject")?.value || "(No Subject)";
        const from = headers.find((h: any) => h.name.toLowerCase() === "from")?.value || "Unknown Sender";
        const date = headers.find((h: any) => h.name.toLowerCase() === "date")?.value || "";
        messagePreviews.push({
          id: item.id,
          threadId: item.threadId,
          snippet: item.snippet,
          subject,
          from,
          date
        });
      }
    } catch (e) {
      console.warn("Notice loading message metadata:", e);
    }
  }

  return messagePreviews;
};

// RFC 2822 email encoder
function makeEmail(to: string, subject: string, message: string): string {
  const emailLines = [
    `To: ${to}`,
    "Content-Type: text/plain; charset=utf-8",
    "MIME-Version: 1.0",
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    "",
    message
  ];
  const email = emailLines.join("\r\n");
  return btoa(unescape(encodeURIComponent(email)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export const sendGmailMessage = async (
  to: string,
  subject: string,
  bodyText: string
): Promise<{ id: string; threadId: string }> => {
  const token = getWorkspaceAccessToken();
  if (!token) throw new Error("Google Workspace authentication required.");

  const raw = makeEmail(to, subject, bodyText);

  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ raw })
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to send email via Gmail: ${res.status} - ${errorText}`);
  }

  return await res.json();
};
