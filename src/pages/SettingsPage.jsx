import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Bell,
  Clock,
  Brain,
  Save,
  LogOut,
  Loader2,
  Check,
  Palette,
  Monitor,
  Volume2,
  Eye,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme, THEMES } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { FocusMonitorToggle } from "../components/FocusMonitorUI";

const CONDITIONS = [
  {
    id: "adhd",
    name: "ADHD",
    icon: "⚡",
    description: "Attention, focus, and executive function support",
  },
  {
    id: "autism",
    name: "Autism",
    icon: "🧩",
    description: "Social skills and sensory-friendly features",
  },
  {
    id: "dyslexia",
    name: "Dyslexia",
    icon: "📖",
    description: "Reading and text formatting support",
  },
  {
    id: "anxiety",
    name: "Anxiety",
    icon: "🌿",
    description: "Calming features and break reminders",
  },
  {
    id: "other",
    name: "Other",
    icon: "✨",
    description: "General learning support",
  },
];

const AVATARS = [
  "🧠",
  "🌟",
  "🚀",
  "🎯",
  "💡",
  "🦋",
  "🌈",
  "🔥",
  "💪",
  "🎨",
  "🌸",
  "⭐",
];

function SettingsSection({ icon: Icon, title, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="card"
    >
      <h2
        className="text-lg font-semibold mb-4 flex items-center gap-2"
        style={{ color: "var(--text-primary)" }}
      >
        <Icon className="w-5 h-5" style={{ color: "var(--primary-500)" }} />
        {title}
      </h2>
      {children}
    </motion.div>
  );
}

export default function SettingsPage() {
  const { user, updateProfile, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [localSettings, setLocalSettings] = useState({
    name: "",
    avatar: "🧠",
    learningStyle: "visual",
    breakInterval: 25,
    breakDuration: 5,
    focusIntensity: "medium",
    notifications: true,
    soundEnabled: true,
    conditions: [],
  });

  useEffect(() => {
    if (user) {
      setLocalSettings({
        name: user.name || "Student",
        avatar: user.avatar || "🧠",
        learningStyle: user.preferences?.learningStyle || "visual",
        breakInterval: user.preferences?.breakInterval || 25,
        breakDuration: user.preferences?.breakDuration || 5,
        focusIntensity: user.preferences?.focusIntensity || "medium",
        notifications: user.preferences?.notifications ?? true,
        soundEnabled: user.preferences?.soundEnabled ?? true,
        conditions: user.profile?.conditions || [],
      });
    }
  }, [user]);

  const handleChange = (key, value) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleConditionToggle = (conditionId) => {
    setLocalSettings((prev) => ({
      ...prev,
      conditions: prev.conditions.includes(conditionId)
        ? prev.conditions.filter((c) => c !== conditionId)
        : [...prev.conditions, conditionId],
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);

    await updateProfile({
      name: localSettings.name,
      avatar: localSettings.avatar,
      preferences: {
        learningStyle: localSettings.learningStyle,
        breakInterval: localSettings.breakInterval,
        breakDuration: localSettings.breakDuration,
        focusIntensity: localSettings.focusIntensity,
        notifications: localSettings.notifications,
        soundEnabled: localSettings.soundEnabled,
      },
      profile: {
        conditions: localSettings.conditions,
      },
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1
            className="text-2xl font-display font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Settings
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Customize your experience
          </p>
        </div>
        <motion.button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <Check className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saved ? "Saved!" : "Save Changes"}
        </motion.button>
      </motion.div>

      {/* Profile */}
      <SettingsSection icon={User} title="Profile" delay={0.1}>
        <div className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Name
            </label>
            <input
              type="text"
              value={localSettings.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="input-field max-w-xs"
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-3"
              style={{ color: "var(--text-secondary)" }}
            >
              Avatar
            </label>
            <div className="flex gap-2 flex-wrap">
              {AVATARS.map((emoji) => (
                <motion.button
                  key={emoji}
                  onClick={() => handleChange("avatar", emoji)}
                  className={`w-12 h-12 text-2xl rounded-xl flex items-center justify-center transition-all`}
                  style={{
                    background:
                      localSettings.avatar === emoji
                        ? "var(--primary-500)"
                        : "var(--bg-tertiary)",
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
              Email:{" "}
              <span style={{ color: "var(--text-secondary)" }}>
                {user?.email}
              </span>
            </p>
          </div>
        </div>
      </SettingsSection>

      {/* Theme */}
      <SettingsSection icon={Palette} title="Appearance" delay={0.15}>
        <div>
          <label
            className="block text-sm font-medium mb-3"
            style={{ color: "var(--text-secondary)" }}
          >
            Theme
          </label>
          <div className="grid grid-cols-5 gap-3">
            {Object.values(THEMES).map((t) => (
              <motion.button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all ${
                  theme === t.id ? "ring-2" : ""
                }`}
                style={{
                  background: t.colors.surface,
                  ringColor: "var(--primary-500)",
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-2xl">{t.icon}</span>
                <span
                  className="text-xs font-medium"
                  style={{ color: t.colors.text }}
                >
                  {t.name}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </SettingsSection>

      {/* Neurodivergent Profile */}
      <SettingsSection icon={Brain} title="Your Profile" delay={0.2}>
        <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
          Select any that apply to personalize your experience.
        </p>

        <div className="space-y-3">
          {CONDITIONS.map((condition) => (
            <motion.button
              key={condition.id}
              onClick={() => handleConditionToggle(condition.id)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all`}
              style={{
                borderColor: localSettings.conditions.includes(condition.id)
                  ? "var(--primary-500)"
                  : "var(--border-light)",
                background: localSettings.conditions.includes(condition.id)
                  ? "rgba(0, 132, 255, 0.05)"
                  : "transparent",
              }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{condition.icon}</span>
                  <div>
                    <p
                      className="font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {condition.name}
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      {condition.description}
                    </p>
                  </div>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all`}
                  style={{
                    background: localSettings.conditions.includes(condition.id)
                      ? "var(--primary-500)"
                      : "transparent",
                    borderColor: localSettings.conditions.includes(condition.id)
                      ? "var(--primary-500)"
                      : "var(--border-medium)",
                  }}
                >
                  {localSettings.conditions.includes(condition.id) && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </SettingsSection>

      {/* Focus Settings */}
      <SettingsSection icon={Clock} title="Focus Settings" delay={0.25}>
        {/* AI Focus Monitoring */}
        <div className="mb-6">
          <FocusMonitorToggle />
          <p className="text-xs text-text-tertiary mt-2 ml-14">
            Uses your webcam to detect focus level periodically and suggest
            breaks or games when distracted.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Focus Duration: {localSettings.breakInterval} minutes
            </label>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={localSettings.breakInterval}
              onChange={(e) =>
                handleChange("breakInterval", parseInt(e.target.value))
              }
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Break Duration: {localSettings.breakDuration} minutes
            </label>
            <input
              type="range"
              min="1"
              max="15"
              step="1"
              value={localSettings.breakDuration}
              onChange={(e) =>
                handleChange("breakDuration", parseInt(e.target.value))
              }
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Focus Intensity
            </label>
            <div className="flex gap-2">
              {["low", "medium", "high"].map((level) => (
                <button
                  key={level}
                  onClick={() => handleChange("focusIntensity", level)}
                  className={`flex-1 py-2 px-4 rounded-lg capitalize transition-all`}
                  style={{
                    background:
                      localSettings.focusIntensity === level
                        ? "var(--primary-500)"
                        : "var(--bg-tertiary)",
                    color:
                      localSettings.focusIntensity === level
                        ? "white"
                        : "var(--text-secondary)",
                  }}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Learning Style
            </label>
            <select
              value={localSettings.learningStyle}
              onChange={(e) => handleChange("learningStyle", e.target.value)}
              className="input-field"
            >
              <option value="visual">Visual (Videos & Images)</option>
              <option value="audio">Audio (Narration)</option>
              <option value="text">Text (Reading)</option>
              <option value="mixed">Mixed (All formats)</option>
            </select>
          </div>
        </div>
      </SettingsSection>

      {/* Notifications */}
      <SettingsSection icon={Bell} title="Notifications & Sound" delay={0.3}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p
                className="font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                Break Reminders
              </p>
              <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                Get notified when it's time for a break
              </p>
            </div>
            <button
              onClick={() =>
                handleChange("notifications", !localSettings.notifications)
              }
              className={`w-12 h-7 rounded-full transition-colors relative`}
              style={{
                background: localSettings.notifications
                  ? "var(--primary-500)"
                  : "var(--border-medium)",
              }}
            >
              <motion.div
                className="w-5 h-5 bg-white rounded-full shadow absolute top-1"
                animate={{ left: localSettings.notifications ? 26 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p
                className="font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                Sound Effects
              </p>
              <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                Play sounds for completions and alerts
              </p>
            </div>
            <button
              onClick={() =>
                handleChange("soundEnabled", !localSettings.soundEnabled)
              }
              className={`w-12 h-7 rounded-full transition-colors relative`}
              style={{
                background: localSettings.soundEnabled
                  ? "var(--primary-500)"
                  : "var(--border-medium)",
              }}
            >
              <motion.div
                className="w-5 h-5 bg-white rounded-full shadow absolute top-1"
                animate={{ left: localSettings.soundEnabled ? 26 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
          </div>
        </div>
      </SettingsSection>

      {/* Logout */}
      <motion.div
        className="card"
        style={{ borderColor: "var(--error)" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 font-medium"
          style={{ color: "var(--error)" }}
        >
          <LogOut className="w-5 h-5" />
          Sign out of your account
        </button>
      </motion.div>
    </div>
  );
}
