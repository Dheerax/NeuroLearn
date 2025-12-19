import { motion } from "framer-motion";
import { Lightbulb, Clock, TrendingUp, Award } from "lucide-react";
import { useFocus } from "../../context/FocusContext";

export default function FocusInsights() {
  const { userStats, weeklyStats } = useFocus();

  // Generate insights based on data
  const insights = [];

  if (weeklyStats?.bestHours?.length > 0) {
    const hourStr = weeklyStats.bestHours
      .map((h) => {
        const hour = h % 12 || 12;
        const ampm = h < 12 ? "AM" : "PM";
        return `${hour}${ampm}`;
      })
      .join(", ");
    insights.push({
      icon: Clock,
      color: "#3b82f6",
      text: `Your peak focus hours are around ${hourStr}`,
    });
  }

  if (userStats?.currentStreak >= 3) {
    insights.push({
      icon: Award,
      color: "#f59e0b",
      text: `Amazing ${userStats.currentStreak}-day streak! Keep going!`,
    });
  }

  if (userStats?.averageFocusScore > 80) {
    insights.push({
      icon: TrendingUp,
      color: "#22c55e",
      text: `Your focus score is excellent at ${userStats.averageFocusScore}%`,
    });
  }

  if (userStats?.averageSessionLength) {
    insights.push({
      icon: Lightbulb,
      color: "#8b5cf6",
      text: `Your average session is ${userStats.averageSessionLength} minutes`,
    });
  }

  // Default insights if no data
  if (insights.length === 0) {
    insights.push(
      {
        icon: Lightbulb,
        color: "#3b82f6",
        text: "Complete a few sessions to see personalized insights!",
      },
      {
        icon: Clock,
        color: "#22c55e",
        text: "Try the 25-minute Pomodoro technique to start.",
      }
    );
  }

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 }}
    >
      <h3
        className="font-semibold mb-4 flex items-center gap-2"
        style={{ color: "var(--text-primary)" }}
      >
        <Lightbulb className="w-5 h-5" style={{ color: "var(--warning)" }} />
        Insights
      </h3>

      <div className="space-y-3">
        {insights.slice(0, 3).map((insight, index) => {
          const Icon = insight.icon;
          return (
            <motion.div
              key={index}
              className="flex items-start gap-3 p-3 rounded-xl"
              style={{ background: "var(--bg-tertiary)" }}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${insight.color}20` }}
              >
                <Icon className="w-4 h-4" style={{ color: insight.color }} />
              </div>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {insight.text}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Weekly comparison */}
      {weeklyStats && (
        <div
          className="mt-4 pt-4 border-t"
          style={{ borderColor: "var(--border-light)" }}
        >
          <div className="flex justify-between text-sm">
            <span style={{ color: "var(--text-tertiary)" }}>This week</span>
            <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              {Math.round((weeklyStats.totalMinutes / 60) * 10) / 10} hours
            </span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span style={{ color: "var(--text-tertiary)" }}>Sessions</span>
            <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              {weeklyStats.totalSessions}
            </span>
          </div>
          {weeklyStats.goalProgress && (
            <div className="flex justify-between text-sm mt-1">
              <span style={{ color: "var(--text-tertiary)" }}>Weekly goal</span>
              <span
                style={{
                  color:
                    weeklyStats.goalProgress >= 100
                      ? "var(--success)"
                      : "var(--text-primary)",
                  fontWeight: 600,
                }}
              >
                {weeklyStats.goalProgress}%
              </span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
