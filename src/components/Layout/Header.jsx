import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  Flame,
  LogOut,
  ChevronDown,
  Settings,
  Command,
  Sun,
  Moon,
  User,
  X,
  Zap,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useGamification } from "../../context/GamificationContext";
import { useTheme, THEMES } from "../../context/ThemeContext";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { currentStreak, recentRewards } = useGamification();
  const { theme, setTheme } = useTheme();

  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [apiEnabled, setApiEnabled] = useState(() => {
    const saved = localStorage.getItem("neurolearn_api_enabled");
    return saved !== null ? saved === "true" : true;
  });

  const toggleApi = () => {
    const newValue = !apiEnabled;
    setApiEnabled(newValue);
    localStorage.setItem("neurolearn_api_enabled", String(newValue));
  };

  // Close menus on route change
  useEffect(() => {
    setShowMenu(false);
    setShowNotifications(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const getPageTitle = () => {
    const titles = {
      "/": "Dashboard",
      "/tasks": "Task Manager",
      "/learning": "Learning Hub",
      "/communication": "Social Skills",
      "/focus": "Focus Mode",
      "/settings": "Settings",
    };
    return titles[location.pathname] || "Dashboard";
  };

  return (
    <header
      className="sticky top-0 z-20 glass transition-theme"
      style={{
        borderBottom: "1px solid var(--border-light)",
      }}
    >
      <div className="px-6 py-4 flex items-center justify-between gap-4">
        {/* Page Title & Breadcrumb */}
        <div className="flex items-center gap-4">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden md:block"
          >
            <h1
              className="text-xl font-display font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {getPageTitle()}
            </h1>
          </motion.div>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative group" onClick={() => setShowSearch(true)}>
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: "var(--text-tertiary)" }}
            />
            <input
              type="text"
              placeholder="Search tasks, lessons... (Ctrl+K)"
              className="input-field pl-10 pr-20 py-2.5 text-sm w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div
              className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
              style={{
                background: "var(--bg-tertiary)",
                color: "var(--text-tertiary)",
              }}
            >
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* API Toggle */}
          <button
            onClick={toggleApi}
            className="flex items-center gap-1.5 px-2 py-1 rounded-full cursor-pointer transition-all"
            style={{ background: "var(--bg-tertiary)" }}
            title={
              apiEnabled
                ? "API Enabled - Click to disable"
                : "API Disabled - Click to enable"
            }
          >
            <div
              className="w-2.5 h-2.5 rounded-full transition-colors"
              style={{ background: apiEnabled ? "#22c55e" : "#ef4444" }}
            />
            <span
              className="text-xs font-medium hidden sm:inline"
              style={{ color: "var(--text-secondary)" }}
            >
              AI
            </span>
          </button>

          {/* Mobile Search */}
          <button
            className="md:hidden btn-icon"
            onClick={() => setShowSearch(!showSearch)}
          >
            <Search
              className="w-5 h-5"
              style={{ color: "var(--text-secondary)" }}
            />
          </button>

          {/* Theme Toggle */}
          <motion.button
            className="btn-icon hidden sm:flex"
            onClick={toggleTheme}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode="wait">
              {theme === "dark" ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                >
                  <Sun
                    className="w-5 h-5"
                    style={{ color: "var(--warning)" }}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                >
                  <Moon
                    className="w-5 h-5"
                    style={{ color: "var(--text-secondary)" }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Streak Badge */}
          {currentStreak > 0 && (
            <motion.div
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: "var(--warning-bg)" }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500 }}
            >
              <Flame className="w-4 h-4" style={{ color: "var(--warning)" }} />
              <span
                className="text-sm font-medium"
                style={{ color: "var(--warning)" }}
              >
                {currentStreak}
              </span>
            </motion.div>
          )}

          {/* Notifications */}
          <div className="relative">
            <motion.button
              className="btn-icon relative"
              onClick={() => setShowNotifications(!showNotifications)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell
                className="w-5 h-5"
                style={{ color: "var(--text-secondary)" }}
              />
              {recentRewards.length > 0 && (
                <motion.span
                  className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full"
                  style={{ background: "var(--error)" }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                />
              )}
            </motion.button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowNotifications(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="dropdown right-0 top-full mt-2 w-80 p-0 overflow-hidden"
                  >
                    <div
                      className="px-4 py-3 border-b"
                      style={{ borderColor: "var(--border-light)" }}
                    >
                      <h3
                        className="font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Notifications
                      </h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {recentRewards.length > 0 ? (
                        recentRewards.slice(0, 5).map((reward, i) => (
                          <div key={i} className="dropdown-item">
                            <span className="text-xl">
                              {reward.icon || "🎉"}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {reward.name}
                              </p>
                              <p
                                className="text-xs"
                                style={{ color: "var(--text-tertiary)" }}
                              >
                                +{reward.xp || 0} XP
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center">
                          <Bell
                            className="w-8 h-8 mx-auto mb-2"
                            style={{ color: "var(--text-tertiary)" }}
                          />
                          <p
                            className="text-sm"
                            style={{ color: "var(--text-tertiary)" }}
                          >
                            No new notifications
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          <div className="relative">
            <motion.button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 p-1.5 rounded-xl transition-colors"
              style={{
                background: showMenu ? "var(--surface-hover)" : "transparent",
              }}
              whileHover={{ background: "var(--surface-hover)" }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-medium"
                style={{
                  background: "var(--gradient-primary)",
                  color: "white",
                }}
              >
                {user?.avatar || "🧠"}
              </div>
              <span
                className="hidden md:block font-medium text-sm"
                style={{ color: "var(--text-primary)" }}
              >
                {user?.name || "User"}
              </span>
              <ChevronDown
                className={`hidden md:block w-4 h-4 transition-transform ${
                  showMenu ? "rotate-180" : ""
                }`}
                style={{ color: "var(--text-tertiary)" }}
              />
            </motion.button>

            {/* User Dropdown */}
            <AnimatePresence>
              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="dropdown right-0 top-full mt-2 w-56"
                  >
                    <div
                      className="px-4 py-3 border-b"
                      style={{ borderColor: "var(--border-light)" }}
                    >
                      <p
                        className="font-semibold text-sm"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {user?.name}
                      </p>
                      <p
                        className="text-xs truncate"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        {user?.email}
                      </p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          navigate("/settings");
                          setShowMenu(false);
                        }}
                        className="dropdown-item w-full"
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate("/settings");
                          setShowMenu(false);
                        }}
                        className="dropdown-item w-full"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </button>
                    </div>

                    <div
                      className="border-t py-1"
                      style={{ borderColor: "var(--border-light)" }}
                    >
                      <button
                        onClick={handleLogout}
                        className="dropdown-item w-full"
                        style={{ color: "var(--error)" }}
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute inset-x-0 top-full p-4 glass"
            style={{ borderBottom: "1px solid var(--border-light)" }}
          >
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: "var(--text-tertiary)" }}
              />
              <input
                type="text"
                placeholder="Search..."
                className="input-field pl-10 pr-10 py-2.5 text-sm w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setShowSearch(false)}
              >
                <X
                  className="w-4 h-4"
                  style={{ color: "var(--text-tertiary)" }}
                />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
