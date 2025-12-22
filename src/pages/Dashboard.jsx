import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckSquare,
  Timer,
  BookOpen,
  MessageCircle,
  Award,
  Flame,
  Sparkles,
  ArrowUpRight,
  Zap,
  Brain,
  Gamepad2,
  Clock,
  ChevronRight,
  Play,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../context/TaskContext";
import { useGamification } from "../context/GamificationContext";

const QUOTES = [
  "Every step forward counts.",
  "Your unique mind is your superpower.",
  "Small wins build mountains.",
  "Progress, not perfection.",
  "You're doing great.",
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tasks } = useTasks();
  const {
    level = 1,
    xp = 0,
    currentStreak = 0,
    earnedBadges = [],
    xpToNextLevel = 100,
    stats = {},
  } = useGamification() || {};
  const [quote] = useState(
    () => QUOTES[Math.floor(Math.random() * QUOTES.length)]
  );
  const [time, setTime] = useState(new Date());
  const [hoveredNav, setHoveredNav] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const completedToday =
    tasks?.filter((t) => {
      if (!t.completedAt) return false;
      return (
        new Date(t.completedAt).toDateString() === new Date().toDateString()
      );
    }).length || 0;
  const pendingTasks = tasks?.filter((t) => t.status === "pending").length || 0;
  const xpProgress =
    xpToNextLevel > 0 ? Math.min((xp / xpToNextLevel) * 100, 100) : 0;

  const hour = time.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const navItems = [
    {
      id: "tasks",
      icon: CheckSquare,
      label: "Tasks",
      path: "/tasks",
      stat: pendingTasks,
    },
    { id: "focus", icon: Timer, label: "Focus", path: "/focus", stat: null },
    {
      id: "learn",
      icon: BookOpen,
      label: "Learn",
      path: "/learning",
      stat: null,
    },
    {
      id: "social",
      icon: MessageCircle,
      label: "Social",
      path: "/communication",
      stat: null,
    },
    { id: "games", icon: Gamepad2, label: "Games", path: "/games", stat: null },
  ];

  return (
    <div
      className="min-h-full relative"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Subtle ambient gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top right, rgba(102,126,234,0.05) 0%, transparent 50%), radial-gradient(ellipse at bottom left, rgba(236,72,153,0.03) 0%, transparent 50%)",
          zIndex: 0,
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Time & Greeting */}
        <div className="text-center mb-12">
          <p
            className="text-6xl md:text-7xl font-light tracking-tight mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            {time.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <p className="text-lg" style={{ color: "var(--text-tertiary)" }}>
            {greeting},{" "}
            <span style={{ color: "var(--text-primary)" }}>
              {user?.name || "friend"}
            </span>
          </p>
          <p
            className="text-sm italic mt-4"
            style={{ color: "var(--text-tertiary)" }}
          >
            "{quote}"
          </p>
        </div>

        {/* Stats Row */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {/* Level */}
          <div
            className="flex items-center gap-3 px-5 py-3 rounded-full"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-light)",
            }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                Level
              </p>
              <p
                className="text-xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {level}
              </p>
            </div>
            <div
              className="w-16 h-1.5 rounded-full ml-2"
              style={{ background: "var(--bg-tertiary)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  background: "var(--gradient-primary)",
                  width: `${xpProgress}%`,
                }}
              />
            </div>
          </div>

          {/* XP */}
          <div
            className="flex items-center gap-3 px-5 py-3 rounded-full"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-light)",
            }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
              }}
            >
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                Total XP
              </p>
              <p
                className="text-xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {stats?.totalXP || xp}
              </p>
            </div>
          </div>

          {/* Streak */}
          {currentStreak > 0 && (
            <div
              className="flex items-center gap-3 px-5 py-3 rounded-full"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border-light)",
              }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, #ef4444 0%, #f97316 100%)",
                }}
              >
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Streak
                </p>
                <p
                  className="text-xl font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {currentStreak} days
                </p>
              </div>
            </div>
          )}

          {/* Badges */}
          <div
            className="flex items-center gap-3 px-5 py-3 rounded-full"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-light)",
            }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)",
              }}
            >
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                Badges
              </p>
              <p
                className="text-xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {earnedBadges?.length || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all"
              style={{
                background:
                  hoveredNav === item.id ? "var(--surface)" : "transparent",
                border: `1px solid ${
                  hoveredNav === item.id
                    ? "var(--border-medium)"
                    : "transparent"
                }`,
              }}
              onMouseEnter={() => setHoveredNav(item.id)}
              onMouseLeave={() => setHoveredNav(null)}
            >
              <item.icon
                className="w-5 h-5"
                style={{
                  color:
                    hoveredNav === item.id
                      ? "var(--accent-color)"
                      : "var(--text-tertiary)",
                }}
              />
              <span
                className="font-medium"
                style={{
                  color:
                    hoveredNav === item.id
                      ? "var(--text-primary)"
                      : "var(--text-secondary)",
                }}
              >
                {item.label}
              </span>
              {item.stat !== null && item.stat > 0 && (
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-bold text-white"
                  style={{ background: "var(--accent-color)" }}
                >
                  {item.stat}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-3 mb-12">
          <button
            onClick={() => navigate("/focus")}
            className="flex items-center gap-2 px-6 py-3 rounded-full font-medium text-white transition-transform hover:scale-105"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Play className="w-4 h-4" />
            Start Focus Session
          </button>

          <button
            onClick={() => navigate("/tasks")}
            className="flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-transform hover:scale-105"
            style={{
              background: "var(--surface)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-light)",
            }}
          >
            <CheckSquare className="w-4 h-4" />
            Add Task
          </button>
        </div>

        {/* Recent Tasks */}
        {tasks && tasks.length > 0 && (
          <div className="max-w-lg mx-auto mb-12">
            <div className="flex items-center justify-between mb-4 px-2">
              <p
                className="text-sm font-medium"
                style={{ color: "var(--text-tertiary)" }}
              >
                Recent Activity
              </p>
              <Link
                to="/tasks"
                className="text-sm flex items-center gap-1"
                style={{ color: "var(--accent-color)" }}
              >
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-2">
              {tasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-4 rounded-2xl transition-all hover:translate-x-1"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border-light)",
                  }}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      task.status === "completed"
                        ? "bg-green-500"
                        : task.status === "in-progress"
                        ? "bg-yellow-500"
                        : "bg-gray-400"
                    }`}
                  />
                  <span
                    className="flex-1 truncate"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {task.title}
                  </span>
                  <Clock
                    className="w-4 h-4"
                    style={{ color: "var(--text-tertiary)" }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {(!tasks || tasks.length === 0) && (
          <div className="text-center py-12">
            <Brain
              className="w-16 h-16 mx-auto mb-4"
              style={{ color: "var(--text-tertiary)" }}
            />
            <p
              className="text-lg mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Your journey begins here
            </p>
            <p
              className="text-sm mb-6"
              style={{ color: "var(--text-tertiary)" }}
            >
              Create your first task to get started
            </p>
            <button
              onClick={() => navigate("/tasks")}
              className="px-6 py-3 rounded-full font-medium text-white"
              style={{ background: "var(--gradient-primary)" }}
            >
              Create Task
            </button>
          </div>
        )}

        {/* Badges Preview */}
        {earnedBadges && earnedBadges.length > 0 && (
          <div className="flex justify-center gap-2 mb-8">
            {earnedBadges.slice(0, 5).map((badge) => (
              <div
                key={badge.id}
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-transform hover:scale-110"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border-light)",
                }}
                title={badge.name}
              >
                {badge.icon}
              </div>
            ))}
            {earnedBadges.length > 5 && (
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium"
                style={{
                  background: "var(--bg-tertiary)",
                  color: "var(--text-tertiary)",
                }}
              >
                +{earnedBadges.length - 5}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            {completedToday > 0
              ? `🎉 You've completed ${completedToday} task${
                  completedToday > 1 ? "s" : ""
                } today!`
              : "Ready to make today count?"}
          </p>
        </div>
      </div>
    </div>
  );
}
