import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useAuth } from "./AuthContext";

const FocusContext = createContext(null);

// API base
const API_BASE = "/api/focus";

// Session types with durations
export const SESSION_TYPES = {
  quick: { name: "Quick Focus", duration: 15, breakDuration: 3, icon: "⚡" },
  standard: { name: "Standard", duration: 25, breakDuration: 5, icon: "🎯" },
  deep_work: { name: "Deep Work", duration: 50, breakDuration: 10, icon: "🧠" },
  ultra: { name: "Ultra Focus", duration: 90, breakDuration: 15, icon: "🔥" },
  custom: { name: "Custom", duration: 25, breakDuration: 5, icon: "⚙️" },
};

// Focus modes with themes
export const FOCUS_MODES = {
  default: { name: "Default", color: "#3b82f6", icon: "💡" },
  deep_work: { name: "Deep Work", color: "#8b5cf6", icon: "🧠" },
  study: { name: "Study", color: "#22c55e", icon: "📚" },
  creative: { name: "Creative", color: "#f59e0b", icon: "🎨" },
  exam_prep: { name: "Exam Prep", color: "#ef4444", icon: "📝" },
  zen: { name: "Zen", color: "#06b6d4", icon: "🧘" },
};

export function FocusProvider({ children }) {
  const { token } = useAuth();

  // Session state
  const [currentSession, setCurrentSession] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // Configuration
  const [sessionType, setSessionType] = useState("standard");
  const [focusMode, setFocusMode] = useState("default");
  const [preSessionGoal, setPreSessionGoal] = useState("");
  const [activeSounds, setActiveSounds] = useState([]);
  const [soundVolumes, setSoundVolumes] = useState({});

  // Custom duration support
  const [customDuration, setCustomDuration] = useState(25);
  const [customBreakDuration, setCustomBreakDuration] = useState(5);

  // Stats
  const [todayStats, setTodayStats] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [userStats, setUserStats] = useState(null);

  // UI state
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completedSession, setCompletedSession] = useState(null);

  const timerRef = useRef(null);
  const sessionStartTimeRef = useRef(null);

  // Fetch helper
  const fetchApi = useCallback(
    async (endpoint, options = {}) => {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      });
      if (!response.ok) throw new Error("API request failed");
      return response.json();
    },
    [token]
  );

  // Load stats on mount
  useEffect(() => {
    if (token) {
      loadStats();
      checkActiveSession();
    }
  }, [token]);

  // Timer effect
  useEffect(() => {
    if (isRunning && !isPaused && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, isPaused]);

  const loadStats = async () => {
    try {
      const [daily, weekly, stats] = await Promise.all([
        fetchApi("/stats/daily"),
        fetchApi("/stats/weekly"),
        fetchApi("/stats"),
      ]);
      setTodayStats(daily);
      setWeeklyStats(weekly);
      setUserStats(stats);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const checkActiveSession = async () => {
    try {
      const { session } = await fetchApi("/sessions/active");
      if (session) {
        // Resume active session
        setCurrentSession(session);
        setSessionType(session.sessionType);
        setFocusMode(session.focusMode);
        setPreSessionGoal(session.preSessionGoal || "");
        setActiveSounds(session.ambientSounds || []);

        // Calculate remaining time
        const elapsed = Math.floor(
          (Date.now() - new Date(session.startTime)) / 1000
        );
        const totalSeconds = session.plannedDuration * 60;
        const remaining = Math.max(0, totalSeconds - elapsed);

        setTimeLeft(remaining);
        setIsRunning(session.status === "active");
        setIsPaused(session.status === "paused");
      }
    } catch (error) {
      console.error("Failed to check active session:", error);
    }
  };

  const startSession = async (goal = "") => {
    const config = SESSION_TYPES[sessionType];
    // Use custom duration if session type is custom
    const duration =
      sessionType === "custom" ? customDuration : config.duration;

    // Start timer immediately (local state)
    const localSession = {
      _id: `local_${Date.now()}`,
      plannedDuration: duration,
      sessionType,
      focusMode,
      preSessionGoal: goal || preSessionGoal,
      startTime: new Date(),
    };

    setCurrentSession(localSession);
    setTimeLeft(duration * 60);
    setIsRunning(true);
    setIsPaused(false);
    setIsBreak(false);
    sessionStartTimeRef.current = Date.now();
    setShowGoalModal(false);

    // Try to sync with API in background (don't block UI)
    try {
      const { session } = await fetchApi("/sessions/start", {
        method: "POST",
        body: JSON.stringify({
          plannedDuration: duration,
          sessionType,
          focusMode,
          preSessionGoal: goal || preSessionGoal,
          ambientSounds: activeSounds,
        }),
      });
      // Update with real session ID from server
      setCurrentSession(session);
      return session;
    } catch (error) {
      console.error("Failed to sync session with server:", error);
      // Timer still works locally
      return localSession;
    }
  };

  const pauseSession = async () => {
    if (!currentSession) return;

    // Update UI immediately
    setIsPaused(true);

    // Try API in background
    try {
      await fetchApi(`/sessions/${currentSession._id}/pause`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Failed to sync pause with server:", error);
    }
  };

  const resumeSession = async () => {
    if (!currentSession) return;

    // Update UI immediately
    setIsPaused(false);

    // Try API in background
    try {
      await fetchApi(`/sessions/${currentSession._id}/resume`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Failed to sync resume with server:", error);
    }
  };

  const endSession = async (completed = true, notes = "", rating = 0) => {
    if (!currentSession) return;

    // Reset UI state immediately so button always works
    const sessionId = currentSession._id;
    setCurrentSession(null);
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(0);

    try {
      const result = await fetchApi(`/sessions/${sessionId}/end`, {
        method: "PUT",
        body: JSON.stringify({
          completed,
          postSessionNotes: notes,
          userRating: rating,
        }),
      });

      if (completed) {
        setCompletedSession(result);
        setShowCompletionModal(true);
      }

      // Reload stats
      loadStats();

      return result;
    } catch (error) {
      console.error("Failed to end session:", error);
      // State already reset, so user can continue
    }
  };

  const handleTimerComplete = async () => {
    if (isBreak) {
      // Break ended, ready for next focus session
      setIsBreak(false);
      setIsRunning(false);
      setTimeLeft(SESSION_TYPES[sessionType].duration * 60);
    } else {
      // Focus session ended
      await endSession(true);
    }
  };

  const startBreak = () => {
    const config = SESSION_TYPES[sessionType];
    setIsBreak(true);
    setTimeLeft(config.breakDuration * 60);
    setIsRunning(true);
  };

  const skipBreak = () => {
    setIsBreak(false);
    setTimeLeft(SESSION_TYPES[sessionType].duration * 60);
    setIsRunning(false);
  };

  const resetTimer = () => {
    if (currentSession) {
      endSession(false);
    }
    const config = SESSION_TYPES[sessionType];
    setTimeLeft(config.duration * 60);
    setIsRunning(false);
    setIsPaused(false);
    setIsBreak(false);
  };

  const logDistraction = async (confidence, action) => {
    if (!currentSession) return;

    try {
      await fetchApi("/distraction", {
        method: "POST",
        body: JSON.stringify({ confidence, action }),
      });
    } catch (error) {
      console.error("Failed to log distraction:", error);
    }
  };

  const toggleSound = (soundId) => {
    setActiveSounds((prev) =>
      prev.includes(soundId)
        ? prev.filter((s) => s !== soundId)
        : [...prev, soundId]
    );
  };

  const setSoundVolume = (soundId, volume) => {
    setSoundVolumes((prev) => ({
      ...prev,
      [soundId]: volume,
    }));
  };

  // Computed values
  const progress =
    timeLeft > 0
      ? ((SESSION_TYPES[sessionType][isBreak ? "breakDuration" : "duration"] *
          60 -
          timeLeft) /
          (SESSION_TYPES[sessionType][isBreak ? "breakDuration" : "duration"] *
            60)) *
        100
      : 0;

  const dailyGoalProgress = todayStats
    ? Math.min(100, (todayStats.todayMinutes / todayStats.dailyGoal) * 100)
    : 0;

  const value = {
    // State
    currentSession,
    isRunning,
    isPaused,
    isBreak,
    timeLeft,
    progress,

    // Config
    sessionType,
    setSessionType,
    focusMode,
    setFocusMode,
    preSessionGoal,
    setPreSessionGoal,
    activeSounds,
    soundVolumes,

    // Custom duration
    customDuration,
    setCustomDuration,
    customBreakDuration,
    setCustomBreakDuration,

    // Stats
    todayStats,
    weeklyStats,
    userStats,
    dailyGoalProgress,

    // UI
    showGoalModal,
    setShowGoalModal,
    showCompletionModal,
    setShowCompletionModal,
    completedSession,

    // Actions
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    startBreak,
    skipBreak,
    resetTimer,
    logDistraction,
    toggleSound,
    setSoundVolume,
    loadStats,

    // Constants
    SESSION_TYPES,
    FOCUS_MODES,
  };

  return (
    <FocusContext.Provider value={value}>{children}</FocusContext.Provider>
  );
}

export function useFocus() {
  const context = useContext(FocusContext);
  if (!context) {
    throw new Error("useFocus must be used within a FocusProvider");
  }
  return context;
}

export default FocusContext;
