import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  orderBy,
  deleteDoc
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { 
  Shield, 
  Users, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X, 
  RefreshCw, 
  Star, 
  Calendar, 
  Sparkles, 
  AlertTriangle, 
  UserMinus,
  TrendingUp,
  Activity
} from "lucide-react";

// Firestore Error Handlers according to standard specifications
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  isEliteUser: boolean;
  createdAt: number;
  updatedAt: number;
  // Fallbacks if database contains different naming (e.g. name or tier)
  name?: string;
  tier?: string;
  joined?: any;
}

interface AdminDashboardProps {
  onClose: () => void;
  adminUser: any;
}

export default function AdminDashboard({ onClose, adminUser }: AdminDashboardProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);
  const [isDeletingUid, setIsDeletingUid] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const usersPath = "users";
      let usersSnap;
      try {
        const usersQuery = query(collection(db, usersPath), orderBy("createdAt", "desc"));
        usersSnap = await getDocs(usersQuery);
      } catch (err) {
        // Fallback without ordering in case index is building
        const usersQuery = collection(db, usersPath);
        usersSnap = await getDocs(usersQuery);
      }

      const usersList: UserProfile[] = [];
      usersSnap.forEach((docSnap) => {
        const data = docSnap.data();
        // Standardize different fields that might be used
        const uid = data.uid || docSnap.id;
        const email = data.email || "";
        const displayName = data.displayName || data.name || "Anonymous Warrior";
        const isEliteUser = typeof data.isEliteUser === "boolean" 
          ? data.isEliteUser 
          : (data.tier === "elite" || data.isElite === true);
        
        let createdAt = data.createdAt;
        if (!createdAt && data.joined) {
          // If Firestore timestamp
          createdAt = data.joined.seconds ? data.joined.seconds * 1000 : data.joined;
        }
        if (!createdAt) {
          createdAt = Date.now() - (30 * 24 * 60 * 60 * 1000); // 30 days ago fallback
        }

        const updatedAt = data.updatedAt || createdAt;

        usersList.push({
          uid,
          email,
          displayName,
          isEliteUser,
          createdAt,
          updatedAt
        });
      });

      // Secondary client-side sorting in case the fallback was used
      usersList.sort((a, b) => b.createdAt - a.createdAt);
      
      setUsers(usersList);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError("Failed to fetch registered users. Verify database security rules.");
      try {
        handleFirestoreError(err, OperationType.LIST, "users");
      } catch (e) {}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleElite = async (user: UserProfile) => {
    setUpdatingUid(user.uid);
    const nextVal = !user.isEliteUser;
    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        isEliteUser: nextVal,
        tier: nextVal ? "elite" : "free",
        updatedAt: Date.now()
      });

      setUsers((prev) =>
        prev.map((u) => (u.uid === user.uid ? { ...u, isEliteUser: nextVal } : u))
      );

      setSuccessMessage(`Successfully updated status for ${user.displayName || user.email}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Failed to update status:", err);
      setError(`Permission denied or database error while updating ${user.displayName || user.email}`);
      setTimeout(() => setError(null), 5000);
      try {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
      } catch (e) {}
    } finally {
      setUpdatingUid(null);
    }
  };

  const handleDeleteUser = async (user: UserProfile) => {
    if (user.uid === adminUser?.uid) {
      alert("You cannot delete your own admin account.");
      return;
    }
    if (!window.confirm(`Are you absolutely sure you want to delete ${user.displayName || user.email} permanently from MindSafe?`)) {
      return;
    }

    setIsDeletingUid(user.uid);
    try {
      await deleteDoc(doc(db, "users", user.uid));
      setUsers((prev) => prev.filter((u) => u.uid !== user.uid));
      setSuccessMessage(`Successfully deleted user profile: ${user.displayName || user.email}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Failed to delete user profile:", err);
      setError("Could not complete delete operation on Firestore database.");
      setTimeout(() => setError(null), 5000);
      try {
        handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}`);
      } catch (e) {}
    } finally {
      setIsDeletingUid(null);
    }
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.displayName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.uid.toLowerCase().includes(q)
    );
  });

  // Pagination calculations
  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  // Reset page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Analytics Metrics
  const totalUsersCount = users.length;
  const eliteUsersCount = users.filter((u) => u.isEliteUser).length;
  const freeUsersCount = totalUsersCount - eliteUsersCount;
  const elitePercentage = totalUsersCount > 0 ? Math.round((eliteUsersCount / totalUsersCount) * 100) : 0;

  // Newest user registration within last 7 days
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const newUsersLastWeek = users.filter((u) => u.createdAt >= sevenDaysAgo).length;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="w-full bg-[#121B2E]/95 border border-amber-400/20 rounded-[28px] p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden select-none text-left"
    >
      {/* Background Decorative Gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-display flex items-center gap-2">
              MindSafe Admin Core
              <span className="text-[10px] font-mono text-amber-400 border border-amber-400/20 px-2 py-0.5 rounded-md uppercase tracking-wider font-extrabold bg-amber-400/5">
                SECURE ACCESS
              </span>
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              System diagnostics, subscription tier status, and member analytics.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-xs font-bold sm:self-center self-end"
          title="Return to resilience chat screen"
          id="adminCloseBtn"
        >
          <X className="w-4 h-4" />
          <span>Close Control Room</span>
        </button>
      </div>

      {/* Toast notifications */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>{successMessage}</span>
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* bento-grid usage statistics/analytics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Total Members</span>
            <span className="text-2xl font-black text-white font-mono">{totalUsersCount}</span>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
            <Star className="w-5 h-5 fill-amber-400/15" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Elite Subscriptions</span>
            <span className="text-2xl font-black text-white font-mono">
              {eliteUsersCount} <span className="text-xs text-amber-400">({elitePercentage}%)</span>
            </span>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#F189B1]/10 border border-[#F189B1]/20 flex items-center justify-center text-[#F189B1]">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">New This Week</span>
            <span className="text-2xl font-black text-white font-mono">{newUsersLastWeek}</span>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Free Tiers</span>
            <span className="text-2xl font-black text-white font-mono">{freeUsersCount}</span>
          </div>
        </div>
      </div>

      {/* Main Table section */}
      <div className="bg-slate-900/40 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
        {/* Search, filters, refresh */}
        <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search user email, name, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/40 transition-colors"
            />
          </div>

          <button
            type="button"
            onClick={fetchUsers}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold self-stretch sm:self-auto justify-center disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Reload Database</span>
          </button>
        </div>

        {/* User Table container */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 select-none">
              <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
              <p className="text-xs text-slate-400 font-mono uppercase tracking-widest">
                Fetching registered profiles from Firestore...
              </p>
            </div>
          ) : currentUsers.length === 0 ? (
            <div className="text-center py-16 text-slate-400 select-none">
              <Users className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="text-xs font-semibold">No registered members found.</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Try modifying your filter keyword or registering new profiles.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Member Name</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono hidden md:table-cell">Email Address</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Joined Date</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono text-center">Elite Tier Status</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {currentUsers.map((user) => {
                  const joinedDate = new Date(user.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                  });
                  return (
                    <tr 
                      key={user.uid} 
                      className="hover:bg-white/[0.02] transition-colors group/row text-xs font-sans text-slate-200"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center font-extrabold text-xs select-none text-slate-950 font-mono ${
                            user.isEliteUser ? "from-amber-400 to-[#D97706]" : "from-slate-400 to-slate-500"
                          }`}>
                            {(user.displayName || user.email).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-white block">
                              {user.displayName}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono block select-all">
                              ID: {user.uid.slice(0, 8)}...
                            </span>
                            <span className="text-[10px] text-slate-400 md:hidden block">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-slate-300 hidden md:table-cell select-all">
                        {user.email}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{joinedDate}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => handleToggleElite(user)}
                            disabled={updatingUid === user.uid}
                            className={`px-3 py-1.5 rounded-xl border font-mono font-bold text-[10px] uppercase transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 select-none ${
                              user.isEliteUser
                                ? "bg-amber-400/10 hover:bg-amber-400/20 border-amber-400/20 hover:border-amber-400/40 text-amber-300"
                                : "bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20 text-slate-400 hover:text-slate-300"
                            }`}
                            title={`Toggle elite privileges for ${user.displayName}`}
                          >
                            {updatingUid === user.uid ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : user.isEliteUser ? (
                              <>
                                <Star className="w-3 h-3 fill-amber-300 stroke-amber-300" />
                                <span>Elite Active</span>
                              </>
                            ) : (
                              <>
                                <Star className="w-3 h-3" />
                                <span>Free Tier</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-80 group-hover/row:opacity-100 transition-opacity">
                          {/* Trash button to wipe the profile out */}
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user)}
                            disabled={isDeletingUid === user.uid || user.uid === adminUser?.uid}
                            className="p-1.5 rounded-lg bg-rose-500/5 border border-rose-500/10 text-rose-400 hover:bg-rose-500/15 hover:border-rose-500/30 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Delete this user from MindSafe Firestore Database"
                          >
                            {isDeletingUid === user.uid ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <UserMinus className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Paginated Footer */}
        {filteredUsers.length > 0 && !loading && (
          <div className="p-4 border-t border-white/10 bg-white/[0.01] flex items-center justify-between select-none text-xs font-medium text-slate-400">
            <span>
              Showing <span className="text-white">{indexOfFirstItem + 1}</span> to{" "}
              <span className="text-white">
                {Math.min(indexOfLastItem, totalItems)}
              </span>{" "}
              of <span className="text-white">{totalItems}</span> entries
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer border border-white/10"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center px-3 font-mono text-xs text-white bg-black/20 rounded-xl border border-white/5 font-semibold">
                Page {currentPage} of {totalPages}
              </div>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer border border-white/10"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Advisory Notice */}
      <div className="mt-5 p-3.5 rounded-2xl border border-amber-400/20 bg-amber-400/5 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-300/80 leading-relaxed font-sans">
          <strong>Security Council Directive:</strong> MindSafe AI respects complete client confidentiality. Subscription tier changes synchronize in real-time. Any destructive operation directly updates active Firestore rules. Admin actions are securely logged.
        </p>
      </div>
    </motion.div>
  );
}
