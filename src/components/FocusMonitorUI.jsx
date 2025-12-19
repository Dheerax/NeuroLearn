import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Activity,
  Brain,
  CheckCircle,
  AlertCircle,
  Loader,
} from "lucide-react";
import { useFocusMonitor } from "../context/FocusMonitorContext";

export function FocusMonitorToggle() {
  const { isEnabled, toggleMonitoring, isLoading } = useFocusMonitor();

  return (
    <div className="flex items-center justify-between p-4 bg-surface-elevated rounded-xl border border-border">
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-lg ${
            isEnabled
              ? "bg-primary/20 text-primary"
              : "bg-surface text-text-secondary"
          }`}
        >
          {isEnabled ? (
            <Eye className="w-5 h-5" />
          ) : (
            <EyeOff className="w-5 h-5" />
          )}
        </div>
        <div>
          <h4 className="font-medium text-text-primary">Focus Monitoring</h4>
          <p className="text-xs text-text-secondary">
            Check focus level every 5 minutes
          </p>
        </div>
      </div>

      <motion.button
        onClick={() => toggleMonitoring(!isEnabled)}
        disabled={isLoading}
        className={`relative w-14 h-8 rounded-full p-1 transition-colors ${
          isEnabled ? "bg-primary" : "bg-surface"
        }`}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          className="w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center"
          animate={{ x: isEnabled ? 24 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          {isLoading && (
            <Loader className="w-3 h-3 text-primary animate-spin" />
          )}
        </motion.div>
      </motion.button>
    </div>
  );
}

export function FocusStatusIndicator({ compact = false }) {
  const {
    isEnabled,
    lastResult,
    lastCheck,
    isLoading,
    sessionStats,
    checkFocus,
  } = useFocusMonitor();

  if (!isEnabled) return null;

  const formatTime = (date) => {
    if (!date) return "Never";
    const now = new Date();
    const diff = Math.floor((now - date) / 1000 / 60);
    if (diff < 1) return "Just now";
    if (diff === 1) return "1 min ago";
    if (diff < 60) return `${diff} mins ago`;
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
          lastResult?.prediction === "focused"
            ? "bg-success/20 text-success"
            : lastResult?.prediction === "distracted"
            ? "bg-warning/20 text-warning"
            : "bg-surface-elevated text-text-secondary"
        }`}
      >
        {isLoading ? (
          <Loader className="w-3 h-3 animate-spin" />
        ) : lastResult?.prediction === "focused" ? (
          <CheckCircle className="w-3 h-3" />
        ) : lastResult?.prediction === "distracted" ? (
          <AlertCircle className="w-3 h-3" />
        ) : (
          <Activity className="w-3 h-3" />
        )}
        <span className="capitalize">
          {isLoading ? "Checking..." : lastResult?.prediction || "Monitoring"}
        </span>
      </motion.div>
    );
  }

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <h4 className="font-medium text-text-primary">Focus Status</h4>
        </div>
        <motion.button
          onClick={checkFocus}
          disabled={isLoading}
          className="text-xs text-primary hover:underline disabled:opacity-50"
          whileTap={{ scale: 0.95 }}
        >
          {isLoading ? "Checking..." : "Check Now"}
        </motion.button>
      </div>

      {/* Current Status */}
      <div className="flex items-center gap-3 mb-4">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="w-12 h-12 rounded-xl bg-surface-elevated flex items-center justify-center"
            >
              <Loader className="w-6 h-6 text-primary animate-spin" />
            </motion.div>
          ) : lastResult ? (
            <motion.div
              key={lastResult.prediction}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                lastResult.prediction === "focused"
                  ? "bg-success/20"
                  : "bg-warning/20"
              }`}
            >
              {lastResult.prediction === "focused" ? (
                <CheckCircle className="w-6 h-6 text-success" />
              ) : (
                <AlertCircle className="w-6 h-6 text-warning" />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              className="w-12 h-12 rounded-xl bg-surface-elevated flex items-center justify-center"
            >
              <Activity className="w-6 h-6 text-text-secondary" />
            </motion.div>
          )}
        </AnimatePresence>

        <div>
          <p
            className={`font-medium capitalize ${
              lastResult?.prediction === "focused"
                ? "text-success"
                : lastResult?.prediction === "distracted"
                ? "text-warning"
                : "text-text-primary"
            }`}
          >
            {isLoading ? "Analyzing..." : lastResult?.prediction || "Waiting"}
          </p>
          <p className="text-xs text-text-secondary">
            Last check: {formatTime(lastCheck)}
          </p>
        </div>

        {lastResult && (
          <div className="ml-auto text-right">
            <p className="text-lg font-bold text-text-primary">
              {Math.round(lastResult.confidence * 100)}%
            </p>
            <p className="text-xs text-text-secondary">confidence</p>
          </div>
        )}
      </div>

      {/* Session Stats */}
      {sessionStats.checks > 0 && (
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-surface-elevated rounded-lg">
            <p className="text-lg font-bold text-text-primary">
              {sessionStats.checks}
            </p>
            <p className="text-xs text-text-secondary">Checks</p>
          </div>
          <div className="p-2 bg-success/10 rounded-lg">
            <p className="text-lg font-bold text-success">
              {sessionStats.focused}
            </p>
            <p className="text-xs text-text-secondary">Focused</p>
          </div>
          <div className="p-2 bg-warning/10 rounded-lg">
            <p className="text-lg font-bold text-warning">
              {sessionStats.distracted}
            </p>
            <p className="text-xs text-text-secondary">Distracted</p>
          </div>
        </div>
      )}
    </div>
  );
}
