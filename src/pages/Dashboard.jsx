import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckSquare,
  Timer,
  BookOpen,
  MessageCircle,
  TrendingUp,
  Award,
  Flame,
  Target,
  Sparkles,
  ArrowRight,
  Play,
  Clock,
  Zap,
  Brain,
  Heart,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../context/TaskContext";
import { useGamification } from "../context/GamificationContext";

// Animated counter component
function AnimatedNumber({ value, duration = 1000 }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setDisplayValue(Math.floor(progress * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span>{displayValue}</span>;
}

// Stat card component
function StatCard({ icon: Icon, label, value, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="card hover-lift cursor-pointer group"
    >
      <div className="flex items-start justify-between">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
          style={{ background: `${color}20` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <motion.div
          className="text-right"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: delay + 0.2, type: "spring" }}
        >
          <p className="text-3xl font-display font-bold text-gradient">
            <AnimatedNumber value={value} />
          </p>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {label}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Quick action button
function QuickAction({ to, icon: Icon, label, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
    >
      <Link
        to={to}
        className="card flex flex-col items-center gap-3 py-6 hover-lift group text-center"
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110"
          style={{
            background: `linear-gradient(135deg, ${color}, ${color}dd)`,
          }}
        >
          <Icon className="w-7 h-7 text-white" />
        </div>
        <p className="font-medium" style={{ color: "var(--text-primary)" }}>
          {label}
        </p>
      </Link>
    </motion.div>
  );
}

// Motivational quotes
const QUOTES = [
  {
    text: "Every step forward counts, no matter how small.",
    author: "Progress mindset",
  },
  {
    text: "Your brain works differently – that's your superpower.",
    author: "Neurodiversity",
  },
  { text: "Take breaks. Rest is part of the journey.", author: "Self-care" },
  {
    text: "Celebrate small wins. They add up to big achievements.",
    author: "Growth",
  },
  { text: "It's okay to do things your own way.", author: "Self-acceptance" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { tasks } = useTasks();
  const { level, xp, currentStreak, earnedBadges, xpToNextLevel } =
    useGamification();

  const [quote] = useState(
    () => QUOTES[Math.floor(Math.random() * QUOTES.length)]
  );

  const pendingTasks = tasks.filter((t) => t.status === "pending").length;
  const completedToday = tasks.filter((t) => {
    if (!t.completedAt) return false;
    const today = new Date().toDateString();
    return new Date(t.completedAt).toDateString() === today;
  }).length;
  const inProgressTasks = tasks.filter(
    (t) => t.status === "in-progress"
  ).length;

  const xpProgress = (xp / xpToNextLevel) * 100;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-6 md:p-8"
        style={{ background: "var(--gradient-primary)" }}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl"
            style={{ background: "white" }}
          />
          <div
            className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl"
            style={{ background: "white" }}
          />
        </div>

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="text-white">
            <motion.p
              className="text-white/80 mb-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {getGreeting()},
            </motion.p>
            <motion.h1
              className="text-3xl md:text-4xl font-display font-bold mb-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              {user?.name || "Student"} {user?.avatar}
            </motion.h1>
            <motion.p
              className="text-white/90 max-w-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              "{quote.text}"{" "}
              <span className="text-white/60">— {quote.author}</span>
            </motion.p>
          </div>

          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="glass rounded-2xl p-4 text-white text-center min-w-[100px]">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Sparkles className="w-5 h-5" />
                <span className="text-2xl font-bold">Lvl {level}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/20 mt-2">
                <motion.div
                  className="h-full rounded-full bg-white"
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress}%` }}
                  transition={{ delay: 0.7, duration: 1 }}
                />
              </div>
              <p className="text-xs text-white/70 mt-1">
                {xp}/{xpToNextLevel} XP
              </p>
            </div>

            {currentStreak > 0 && (
              <div className="glass rounded-2xl p-4 text-white text-center">
                <Flame className="w-8 h-8 mx-auto mb-1" />
                <p className="text-2xl font-bold">{currentStreak}</p>
                <p className="text-xs text-white/70">day streak</p>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Target}
          label="Pending Tasks"
          value={pendingTasks}
          color="#3b82f6"
          delay={0.1}
        />
        <StatCard
          icon={CheckSquare}
          label="Completed Today"
          value={completedToday}
          color="#10b981"
          delay={0.2}
        />
        <StatCard
          icon={Zap}
          label="In Progress"
          value={inProgressTasks}
          color="#f59e0b"
          delay={0.3}
        />
        <StatCard
          icon={Award}
          label="Badges Earned"
          value={earnedBadges.length}
          color="#8b5cf6"
          delay={0.4}
        />
      </div>

      {/* Quick Actions */}
      <div>
        <motion.h2
          className="text-lg font-semibold mb-4 flex items-center gap-2"
          style={{ color: "var(--text-primary)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Play className="w-5 h-5" style={{ color: "var(--primary-500)" }} />
          Quick Actions
        </motion.h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAction
            to="/tasks"
            icon={CheckSquare}
            label="Manage Tasks"
            color="#3b82f6"
            delay={0.1}
          />
          <QuickAction
            to="/focus"
            icon={Timer}
            label="Start Focus"
            color="#10b981"
            delay={0.2}
          />
          <QuickAction
            to="/learning"
            icon={BookOpen}
            label="Learn"
            color="#f59e0b"
            delay={0.3}
          />
          <QuickAction
            to="/communication"
            icon={MessageCircle}
            label="Practice"
            color="#8b5cf6"
            delay={0.4}
          />
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <motion.div
          className="card"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              className="font-semibold flex items-center gap-2"
              style={{ color: "var(--text-primary)" }}
            >
              <Clock
                className="w-5 h-5"
                style={{ color: "var(--primary-500)" }}
              />
              Recent Tasks
            </h2>
            <Link
              to="/tasks"
              className="text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
              style={{ color: "var(--primary-500)" }}
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {tasks.slice(0, 4).map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-xl transition-colors"
                style={{ background: "var(--bg-secondary)" }}
              >
                <div
                  className={`w-3 h-3 rounded-full ${
                    task.status === "completed"
                      ? "bg-green-500"
                      : task.status === "in-progress"
                      ? "bg-yellow-500"
                      : "bg-gray-400"
                  }`}
                />
                <p
                  className="flex-1 truncate"
                  style={{ color: "var(--text-primary)" }}
                >
                  {task.title}
                </p>
                <span
                  className={`badge badge-${
                    task.priority === "high" || task.priority === "urgent"
                      ? "warning"
                      : "primary"
                  }`}
                >
                  {task.priority}
                </span>
              </motion.div>
            ))}

            {tasks.length === 0 && (
              <div className="text-center py-8">
                <Brain
                  className="w-12 h-12 mx-auto mb-3"
                  style={{ color: "var(--text-tertiary)" }}
                />
                <p style={{ color: "var(--text-secondary)" }}>No tasks yet</p>
                <Link to="/tasks" className="btn-primary mt-4 inline-flex">
                  Create your first task
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Badges & Achievements */}
        <motion.div
          className="card"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              className="font-semibold flex items-center gap-2"
              style={{ color: "var(--text-primary)" }}
            >
              <Award className="w-5 h-5" style={{ color: "var(--warning)" }} />
              Your Achievements
            </h2>
          </div>

          {earnedBadges.length > 0 ? (
            <div className="grid grid-cols-4 gap-3">
              {earnedBadges.slice(0, 8).map((badge, index) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
                  className="flex flex-col items-center p-3 rounded-xl text-center hover-scale cursor-pointer"
                  style={{ background: "var(--bg-secondary)" }}
                  title={badge.name}
                >
                  <span className="text-3xl mb-1">{badge.icon}</span>
                  <span
                    className="text-xs truncate w-full"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {badge.name}
                  </span>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div
                className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
                style={{ background: "var(--bg-tertiary)" }}
              >
                <Award
                  className="w-8 h-8"
                  style={{ color: "var(--text-tertiary)" }}
                />
              </div>
              <p style={{ color: "var(--text-secondary)" }} className="mb-1">
                No badges yet
              </p>
              <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                Complete tasks to earn achievements!
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Daily Tip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card-glass flex items-start gap-4 p-6"
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(239, 68, 68, 0.1)" }}
        >
          <Heart className="w-6 h-6" style={{ color: "#ef4444" }} />
        </div>
        <div>
          <h3
            className="font-semibold mb-1"
            style={{ color: "var(--text-primary)" }}
          >
            Daily Wellness Tip
          </h3>
          <p style={{ color: "var(--text-secondary)" }}>
            Remember to take regular breaks! Studies show that stepping away
            from work actually improves focus and creativity. Try the Pomodoro
            technique in Focus Mode.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
