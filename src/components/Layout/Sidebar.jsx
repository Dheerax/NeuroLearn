import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CheckSquare,
  BookOpen,
  MessageCircle,
  Timer,
  Settings,
  Brain,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Palette,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useGamification } from "../../context/GamificationContext";
import { useTheme, THEMES } from "../../context/ThemeContext";

const NAV_ITEMS = [
  {
    path: "/",
    icon: LayoutDashboard,
    label: "Dashboard",
    description: "Overview & stats",
  },
  {
    path: "/tasks",
    icon: CheckSquare,
    label: "Tasks",
    description: "Manage your tasks",
  },
  {
    path: "/learning",
    icon: BookOpen,
    label: "Learning",
    description: "Study materials",
  },
  {
    path: "/communication",
    icon: MessageCircle,
    label: "Social Skills",
    description: "Practice scenarios",
  },
  {
    path: "/focus",
    icon: Timer,
    label: "Focus Mode",
    description: "Pomodoro timer",
  },
  {
    path: "/settings",
    icon: Settings,
    label: "Settings",
    description: "Preferences",
  },
];

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const { level, xp, xpToNextLevel } = useGamification();
  const { theme, setTheme, themes } = useTheme();

  const [collapsed, setCollapsed] = useState(false);
  const [showThemes, setShowThemes] = useState(false);

  const xpProgress = (xp / xpToNextLevel) * 100;

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-screen z-30 flex flex-col transition-theme"
      style={{
        background: "var(--surface)",
        borderRight: "1px solid var(--border-light)",
      }}
    >
      {/* Logo Section */}
      <div className="p-4 flex items-center justify-between">
        <motion.div
          className="flex items-center gap-3 overflow-hidden"
          animate={{ opacity: collapsed ? 0 : 1 }}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <Brain className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <h1
                className="font-display font-bold text-lg"
                style={{ color: "var(--text-primary)" }}
              >
                NeuroLearn
              </h1>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                Learning Companion
              </p>
            </motion.div>
          )}
        </motion.div>

        {collapsed && (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto">
            <Brain className="w-6 h-6 text-white" />
          </div>
        )}
      </div>

      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full flex items-center justify-center z-10 hover-scale"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border-medium)",
          color: "var(--text-secondary)",
        }}
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item, index) => {
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="relative block group"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                  collapsed ? "justify-center" : ""
                } ${isActive ? "nav-item-active" : "nav-item-inactive"}`}
                whileHover={{ x: collapsed ? 0 : 4 }}
              >
                {/* Active Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                    style={{ background: "var(--primary-500)" }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                  />
                )}

                <item.icon
                  className={`w-5 h-5 flex-shrink-0 ${
                    isActive ? "" : "group-hover:scale-110"
                  } transition-transform`}
                  style={{
                    color: isActive
                      ? "var(--primary-500)"
                      : "var(--text-secondary)",
                  }}
                />

                {!collapsed && (
                  <motion.div className="flex-1 min-w-0">
                    <p
                      className="font-medium text-sm truncate"
                      style={{
                        color: isActive
                          ? "var(--primary-500)"
                          : "var(--text-secondary)",
                      }}
                    >
                      {item.label}
                    </p>
                    <p
                      className="text-xs truncate"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      {item.description}
                    </p>
                  </motion.div>
                )}
              </motion.div>

              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div
                  className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50"
                  style={{
                    background: "var(--text-primary)",
                    color: "var(--bg-primary)",
                  }}
                >
                  {item.label}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Theme Switcher */}
      <div className="px-3 pb-3">
        <button
          onClick={() => setShowThemes(!showThemes)}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
            collapsed ? "justify-center" : ""
          }`}
          style={{
            background: showThemes ? "var(--surface-hover)" : "transparent",
            color: "var(--text-secondary)",
          }}
        >
          <Palette className="w-5 h-5" />
          {!collapsed && <span className="text-sm font-medium">Theme</span>}
          {!collapsed && (
            <span className="ml-auto text-lg">{THEMES[theme].icon}</span>
          )}
        </button>

        <AnimatePresence>
          {showThemes && !collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-2"
            >
              <div
                className="grid grid-cols-5 gap-2 p-2 rounded-xl"
                style={{ background: "var(--bg-tertiary)" }}
              >
                {Object.values(THEMES).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTheme(t.id);
                      setShowThemes(false);
                    }}
                    className={`w-full aspect-square rounded-lg flex items-center justify-center text-lg transition-all ${
                      theme === t.id
                        ? "ring-2 ring-offset-2 scale-110"
                        : "hover:scale-105"
                    }`}
                    style={{
                      background: t.colors.surface,
                      ringColor: "var(--primary-500)",
                      ringOffsetColor: "var(--bg-tertiary)",
                    }}
                    title={t.name}
                  >
                    {t.icon}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User Level Card */}
      <div className="p-3">
        <motion.div
          className="rounded-xl p-3 overflow-hidden relative"
          style={{ background: "var(--bg-tertiary)" }}
          whileHover={{ scale: 1.02 }}
        >
          {/* Glow effect */}
          <div
            className="absolute inset-0 opacity-20"
            style={{ background: "var(--gradient-primary)" }}
          />

          <div className="relative">
            <div
              className={`flex items-center ${
                collapsed ? "justify-center" : "gap-3"
              }`}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                style={{ background: "var(--gradient-primary)" }}
              >
                {user?.avatar || "🧠"}
              </div>

              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p
                    className="font-semibold text-sm truncate"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {user?.name || "Student"}
                  </p>
                  <div className="flex items-center gap-1">
                    <Sparkles
                      className="w-3 h-3"
                      style={{ color: "var(--primary-500)" }}
                    />
                    <span
                      className="text-xs"
                      style={{ color: "var(--primary-500)" }}
                    >
                      Level {level}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {!collapsed && (
              <div className="mt-3">
                <div
                  className="flex justify-between text-xs mb-1"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  <span>{xp} XP</span>
                  <span>{xpToNextLevel} XP</span>
                </div>
                <div className="progress-bar">
                  <motion.div
                    className="progress-bar-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.aside>
  );
}
