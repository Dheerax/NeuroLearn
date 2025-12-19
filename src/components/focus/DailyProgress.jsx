import { motion } from "framer-motion";
import { Target, TrendingUp, Flame } from "lucide-react";
import { useFocus } from "../../context/FocusContext";

export default function DailyProgress() {
  const { todayStats, dailyGoalProgress } = useFocus();

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Progress bar */}
      <div className="flex items-center gap-4 mb-2">
        <div
          className="flex-1 h-3 rounded-full overflow-hidden"
          style={{ background: "var(--bg-tertiary)" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background:
                dailyGoalProgress >= 100
                  ? "linear-gradient(90deg, #22c55e, #16a34a)"
                  : "var(--gradient-primary)",
            }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(dailyGoalProgress, 100)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            {todayStats?.todayMinutes || 0}
          </span>
          <span style={{ color: "var(--text-tertiary)" }}>/</span>
          <span style={{ color: "var(--text-tertiary)" }}>
            {todayStats?.dailyGoal || 60} min
          </span>

          {dailyGoalProgress >= 100 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-lg"
            >
              🎉
            </motion.span>
          )}
        </div>
      </div>

      {/* Mini stats */}
      <div className="flex items-center gap-6 text-xs">
        <div
          className="flex items-center gap-1"
          style={{ color: "var(--text-tertiary)" }}
        >
          <Target className="w-3 h-3" style={{ color: "var(--primary-500)" }} />
          <span>{todayStats?.sessionsToday || 0} sessions today</span>
        </div>

        {todayStats?.currentStreak > 0 && (
          <div
            className="flex items-center gap-1"
            style={{ color: "var(--text-tertiary)" }}
          >
            <Flame className="w-3 h-3" style={{ color: "var(--warning)" }} />
            <span>{todayStats.currentStreak} day streak</span>
          </div>
        )}

        <div
          className="flex items-center gap-1"
          style={{ color: "var(--text-tertiary)" }}
        >
          <TrendingUp className="w-3 h-3" style={{ color: "var(--success)" }} />
          <span>{Math.round(dailyGoalProgress)}% of daily goal</span>
        </div>
      </div>
    </motion.div>
  );
}
