import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Bell,
  Brain,
  Save,
  Loader2,
  Check,
  Palette,
  Accessibility,
  Lock,
  Keyboard,
  Settings,
  Download,
  Upload,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme, THEMES } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { FocusMonitorToggle } from "../components/FocusMonitorUI";
import SettingsSidebar from "../components/settings/SettingsSidebar";
import SettingsSection from "../components/settings/SettingsSection";
import SettingsToggle from "../components/settings/SettingsToggle";
import SettingsSlider from "../components/settings/SettingsSlider";
import SettingsSelect from "../components/settings/SettingsSelect";

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
  "🎮",
  "📚",
  "🎵",
  "🌙",
];

const FONT_SIZE_OPTIONS = [
  { value: "small", label: "Small", icon: "A" },
  { value: "medium", label: "Medium", icon: "A" },
  { value: "large", label: "Large", icon: "A" },
  { value: "extra-large", label: "Extra Large", icon: "A" },
];

const COLORBLIND_OPTIONS = [
  { value: "none", label: "None" },
  { value: "protanopia", label: "Protanopia (Red-blind)" },
  { value: "deuteranopia", label: "Deuteranopia (Green-blind)" },
  { value: "tritanopia", label: "Tritanopia (Blue-blind)" },
];

const FOCUS_SOUND_OPTIONS = [
  { value: "none", label: "None", icon: "🔇" },
  { value: "chime", label: "Chime", icon: "🔔" },
  { value: "bell", label: "Bell", icon: "🛎️" },
  { value: "nature", label: "Nature", icon: "🌿" },
];

const LEARNING_STYLE_OPTIONS = [
  { value: "visual", label: "Visual (Videos & Images)", icon: "👁️" },
  { value: "audio", label: "Audio (Narration)", icon: "🎧" },
  { value: "text", label: "Text (Reading)", icon: "📖" },
  { value: "mixed", label: "Mixed (All formats)", icon: "🎯" },
];

const DEFAULT_SHORTCUTS = {
  startFocus: "Ctrl+Shift+F",
  pauseTimer: "Space",
  skipBreak: "Ctrl+S",
  openSettings: "Ctrl+,",
  toggleTheme: "Ctrl+Shift+T",
  goToDashboard: "Ctrl+D",
};

export default function SettingsPage() {
  const { user, updateProfile, logout, token, loading } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const saveTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  const [localSettings, setLocalSettings] = useState({
    // Profile
    name: "",
    avatar: "🧠",
    conditions: [],
    // Focus
    learningStyle: "visual",
    breakInterval: 25,
    breakDuration: 5,
    focusIntensity: "medium",
    // Notifications
    notifications: true,
    soundEnabled: true,
    dailyReminder: true,
    dailyReminderTime: "09:00",
    weeklyReport: true,
    achievementAlerts: true,
    focusEndSound: "chime",
    // Accessibility
    fontSize: "medium",
    dyslexiaFont: false,
    highContrast: false,
    reducedMotion: false,
    screenReader: false,
    colorBlindMode: "none",
    // Privacy
    analyticsEnabled: true,
    shareProgress: false,
    showStreak: true,
    // Shortcuts
    keyboardShortcutsEnabled: true,
    shortcuts: DEFAULT_SHORTCUTS,
    // Session
    autoStartTimer: false,
    showTimeRemaining: true,
    pauseOnInactivity: true,
  });

  // Show loading state while auth is loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2
            className="w-8 h-8 animate-spin mx-auto mb-4"
            style={{ color: "var(--primary-500)" }}
          />
          <p style={{ color: "var(--text-tertiary)" }}>Loading settings...</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (user) {
      setLocalSettings({
        name: user.name || "Student",
        avatar: user.avatar || "🧠",
        conditions: user.profile?.conditions || [],
        learningStyle: user.preferences?.learningStyle || "visual",
        breakInterval: user.preferences?.breakInterval || 25,
        breakDuration: user.preferences?.breakDuration || 5,
        focusIntensity: user.preferences?.focusIntensity || "medium",
        notifications: user.preferences?.notifications ?? true,
        soundEnabled: user.preferences?.soundEnabled ?? true,
        dailyReminder:
          user.preferences?.advancedNotifications?.dailyReminder ?? true,
        dailyReminderTime:
          user.preferences?.advancedNotifications?.dailyReminderTime || "09:00",
        weeklyReport:
          user.preferences?.advancedNotifications?.weeklyReport ?? true,
        achievementAlerts:
          user.preferences?.advancedNotifications?.achievementAlerts ?? true,
        focusEndSound:
          user.preferences?.advancedNotifications?.focusEndSound || "chime",
        fontSize: user.preferences?.accessibility?.fontSize || "medium",
        dyslexiaFont: user.preferences?.accessibility?.dyslexiaFont ?? false,
        highContrast: user.preferences?.accessibility?.highContrast ?? false,
        reducedMotion: user.preferences?.accessibility?.reducedMotion ?? false,
        screenReader: user.preferences?.accessibility?.screenReader ?? false,
        colorBlindMode:
          user.preferences?.accessibility?.colorBlindMode || "none",
        analyticsEnabled: user.preferences?.privacy?.analyticsEnabled ?? true,
        shareProgress: user.preferences?.privacy?.shareProgress ?? false,
        showStreak: user.preferences?.privacy?.showStreak ?? true,
        keyboardShortcutsEnabled:
          user.preferences?.keyboardShortcuts?.enabled ?? true,
        shortcuts: {
          ...DEFAULT_SHORTCUTS,
          ...(user.preferences?.keyboardShortcuts?.customBindings instanceof Map
            ? Object.fromEntries(
                user.preferences.keyboardShortcuts.customBindings
              )
            : user.preferences?.keyboardShortcuts?.customBindings || {}),
        },
        autoStartTimer: user.preferences?.session?.autoStartTimer ?? false,
        showTimeRemaining: user.preferences?.session?.showTimeRemaining ?? true,
        pauseOnInactivity: user.preferences?.session?.pauseOnInactivity ?? true,
      });
    }
  }, [user]);

  const handleChange = useCallback((key, value) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }, []);

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
    if (!updateProfile) return;

    setSaving(true);

    try {
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
          accessibility: {
            fontSize: localSettings.fontSize,
            dyslexiaFont: localSettings.dyslexiaFont,
            highContrast: localSettings.highContrast,
            reducedMotion: localSettings.reducedMotion,
            screenReader: localSettings.screenReader,
            colorBlindMode: localSettings.colorBlindMode,
          },
          privacy: {
            analyticsEnabled: localSettings.analyticsEnabled,
            shareProgress: localSettings.shareProgress,
            showStreak: localSettings.showStreak,
          },
          keyboardShortcuts: {
            enabled: localSettings.keyboardShortcutsEnabled,
          },
          advancedNotifications: {
            dailyReminder: localSettings.dailyReminder,
            dailyReminderTime: localSettings.dailyReminderTime,
            weeklyReport: localSettings.weeklyReport,
            achievementAlerts: localSettings.achievementAlerts,
            focusEndSound: localSettings.focusEndSound,
          },
          session: {
            autoStartTimer: localSettings.autoStartTimer,
            showTimeRemaining: localSettings.showTimeRemaining,
            pauseOnInactivity: localSettings.pauseOnInactivity,
          },
        },
        profile: {
          conditions: localSettings.conditions,
        },
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleExportSettings = async () => {
    try {
      const response = await fetch("/api/users/me/settings/export", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `neurolearn-settings-${
        new Date().toISOString().split("T")[0]
      }.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const handleImportSettings = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const response = await fetch("/api/users/me/settings/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Import failed:", error);
    }
  };

  const handleResetSettings = async () => {
    if (
      !confirm(
        "Are you sure you want to reset all settings to defaults? This cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch("/api/users/me/settings/reset", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Reset failed:", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Simply change the active section - no scrolling
  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
  };

  // Render only the active section
  const renderSection = () => {
    switch (activeSection) {
      case "profile":
        return renderProfileSection();
      case "appearance":
        return renderAppearanceSection();
      case "accessibility":
        return renderAccessibilitySection();
      case "focus":
        return renderFocusSection();
      case "notifications":
        return renderNotificationsSection();
      case "privacy":
        return renderPrivacySection();
      case "shortcuts":
        return renderShortcutsSection();
      case "account":
        return renderAccountSection();
      default:
        return renderProfileSection();
    }
  };

  return (
    <div
      className="settings-page"
      style={{ display: "flex", gap: "2rem", maxWidth: "1200px" }}
    >
      {/* Sidebar */}
      <SettingsSidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <motion.div
          className="settings-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.5rem",
            position: "sticky",
            top: 0,
            zIndex: 50,
            padding: "1rem 0",
            background: "var(--bg-primary)",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "1.75rem",
                fontWeight: "700",
                color: "var(--text-primary)",
                marginBottom: "0.25rem",
              }}
            >
              Settings
            </h1>
            <p style={{ color: "var(--text-tertiary)" }}>
              Customize your NeuroLearn experience
            </p>
          </div>

          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            {/* Search Toggle */}
            <motion.button
              onClick={() => setShowSearch(!showSearch)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                border: "1px solid var(--border-medium)",
                background: "var(--bg-secondary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--text-secondary)",
              }}
            >
              {showSearch ? (
                <X className="w-5 h-5" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </motion.button>

            {/* Save Button */}
            <motion.button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1.25rem",
                borderRadius: "12px",
                fontWeight: "600",
                background: saved
                  ? "linear-gradient(135deg, #22c55e, #16a34a)"
                  : "linear-gradient(135deg, var(--primary-500), var(--primary-600))",
                color: "white",
                border: "none",
                cursor: saving ? "not-allowed" : "pointer",
                boxShadow: "0 4px 12px rgba(0, 132, 255, 0.3)",
              }}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saved ? (
                <Check className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saved ? "Saved!" : "Save"}
            </motion.button>
          </div>
        </motion.div>

        {/* Search Bar */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ marginBottom: "1.5rem", overflow: "hidden" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem 1rem",
                  borderRadius: "12px",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-medium)",
                }}
              >
                <Search
                  className="w-5 h-5"
                  style={{ color: "var(--text-tertiary)" }}
                />
                <input
                  type="text"
                  placeholder="Search settings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  style={{
                    flex: 1,
                    border: "none",
                    background: "transparent",
                    color: "var(--text-primary)",
                    fontSize: "1rem",
                    outline: "none",
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profile Section */}
        {activeSection === "profile" && (
          <SettingsSection
            id="profile"
            icon={User}
            title="Profile"
            description="Manage your personal information"
            delay={0.1}
          >
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  color: "var(--text-secondary)",
                  marginBottom: "0.5rem",
                  fontWeight: "500",
                }}
              >
                Display Name
              </label>
              <input
                type="text"
                value={localSettings.name}
                onChange={(e) => handleChange("name", e.target.value)}
                style={{
                  width: "100%",
                  maxWidth: "300px",
                  padding: "0.75rem 1rem",
                  borderRadius: "12px",
                  border: "1px solid var(--border-medium)",
                  background: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                  fontSize: "1rem",
                  outline: "none",
                  transition: "border-color 0.2s ease",
                }}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  color: "var(--text-secondary)",
                  marginBottom: "0.75rem",
                  fontWeight: "500",
                }}
              >
                Choose Avatar
              </label>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {AVATARS.map((emoji) => (
                  <motion.button
                    key={emoji}
                    onClick={() => handleChange("avatar", emoji)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    style={{
                      width: "48px",
                      height: "48px",
                      fontSize: "1.5rem",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border:
                        localSettings.avatar === emoji
                          ? "2px solid var(--primary-500)"
                          : "1px solid var(--border-light)",
                      background:
                        localSettings.avatar === emoji
                          ? "var(--primary-50)"
                          : "var(--bg-secondary)",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  color: "var(--text-secondary)",
                  marginBottom: "0.75rem",
                  fontWeight: "500",
                }}
              >
                Your Neurodivergent Profile
              </label>
              <p
                style={{
                  color: "var(--text-tertiary)",
                  fontSize: "0.875rem",
                  marginBottom: "1rem",
                }}
              >
                Select any that apply to personalize your experience
              </p>
              <div style={{ display: "grid", gap: "0.75rem" }}>
                {CONDITIONS.map((condition) => (
                  <motion.button
                    key={condition.id}
                    onClick={() => handleConditionToggle(condition.id)}
                    whileHover={{ scale: 1.01 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "1rem",
                      borderRadius: "12px",
                      border: localSettings.conditions.includes(condition.id)
                        ? "2px solid var(--primary-500)"
                        : "1px solid var(--border-light)",
                      background: localSettings.conditions.includes(
                        condition.id
                      )
                        ? "rgba(0, 132, 255, 0.05)"
                        : "transparent",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                      }}
                    >
                      <span style={{ fontSize: "1.5rem" }}>
                        {condition.icon}
                      </span>
                      <div>
                        <p
                          style={{
                            color: "var(--text-primary)",
                            fontWeight: "500",
                          }}
                        >
                          {condition.name}
                        </p>
                        <p
                          style={{
                            color: "var(--text-tertiary)",
                            fontSize: "0.875rem",
                          }}
                        >
                          {condition.description}
                        </p>
                      </div>
                    </div>
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "12px",
                        border: localSettings.conditions.includes(condition.id)
                          ? "none"
                          : "2px solid var(--border-medium)",
                        background: localSettings.conditions.includes(
                          condition.id
                        )
                          ? "var(--primary-500)"
                          : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {localSettings.conditions.includes(condition.id) && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            <div
              style={{
                marginTop: "1rem",
                padding: "0.75rem",
                background: "var(--bg-tertiary)",
                borderRadius: "8px",
              }}
            >
              <p
                style={{ color: "var(--text-tertiary)", fontSize: "0.875rem" }}
              >
                Email:{" "}
                <span style={{ color: "var(--text-secondary)" }}>
                  {user?.email}
                </span>
              </p>
            </div>
          </SettingsSection>
        )}

        {/* Appearance Section */}
        {activeSection === "appearance" && (
          <SettingsSection
            id="appearance"
            icon={Palette}
            title="Appearance"
            description="Customize the look and feel"
            delay={0.15}
          >
            <div>
              <label
                style={{
                  display: "block",
                  color: "var(--text-secondary)",
                  marginBottom: "0.75rem",
                  fontWeight: "500",
                }}
              >
                Theme
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
                  gap: "0.75rem",
                }}
              >
                {Object.values(THEMES).map((t) => (
                  <motion.button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      padding: "1rem",
                      borderRadius: "16px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "0.5rem",
                      border:
                        theme === t.id
                          ? "2px solid var(--primary-500)"
                          : "1px solid var(--border-light)",
                      background: t.colors.surface,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      boxShadow:
                        theme === t.id
                          ? "0 4px 12px rgba(0, 132, 255, 0.2)"
                          : "none",
                    }}
                  >
                    <span style={{ fontSize: "1.5rem" }}>{t.icon}</span>
                    <span
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: "500",
                        color: t.colors.text,
                      }}
                    >
                      {t.name}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          </SettingsSection>
        )}

        {/* Accessibility Section */}
        {activeSection === "accessibility" && (
          <SettingsSection
            id="accessibility"
            icon={Accessibility}
            title="Accessibility"
            description="Make NeuroLearn work for you"
            delay={0.2}
          >
            <SettingsSelect
              label="Font Size"
              description="Adjust the text size throughout the app"
              value={localSettings.fontSize}
              onChange={(val) => handleChange("fontSize", val)}
              options={FONT_SIZE_OPTIONS}
            />
            <SettingsToggle
              label="Dyslexia-Friendly Font"
              description="Use OpenDyslexic font for better readability"
              checked={localSettings.dyslexiaFont}
              onChange={(val) => handleChange("dyslexiaFont", val)}
            />
            <SettingsToggle
              label="High Contrast Mode"
              description="Increase contrast for better visibility"
              checked={localSettings.highContrast}
              onChange={(val) => handleChange("highContrast", val)}
            />
            <SettingsToggle
              label="Reduced Motion"
              description="Minimize animations and transitions"
              checked={localSettings.reducedMotion}
              onChange={(val) => handleChange("reducedMotion", val)}
            />
            <SettingsToggle
              label="Screen Reader Optimized"
              description="Improve compatibility with screen readers"
              checked={localSettings.screenReader}
              onChange={(val) => handleChange("screenReader", val)}
            />
            <SettingsSelect
              label="Color Blind Mode"
              description="Adjust colors for color vision deficiency"
              value={localSettings.colorBlindMode}
              onChange={(val) => handleChange("colorBlindMode", val)}
              options={COLORBLIND_OPTIONS}
            />
          </SettingsSection>
        )}

        {/* Focus & Learning Section */}
        {activeSection === "focus" && (
          <SettingsSection
            id="focus"
            icon={Brain}
            title="Focus & Learning"
            description="Optimize your learning sessions"
            delay={0.25}
          >
            <div style={{ marginBottom: "1rem" }}>
              <FocusMonitorToggle />
              <p
                style={{
                  color: "var(--text-tertiary)",
                  fontSize: "0.75rem",
                  marginTop: "0.5rem",
                  marginLeft: "3.25rem",
                }}
              >
                Uses your webcam to detect focus level and suggest breaks when
                distracted
              </p>
            </div>

            <SettingsSlider
              label="Focus Duration"
              description="How long you want to focus before a break"
              value={localSettings.breakInterval}
              onChange={(val) => handleChange("breakInterval", val)}
              min={5}
              max={60}
              step={5}
              unit=" min"
            />
            <SettingsSlider
              label="Break Duration"
              description="How long your breaks should be"
              value={localSettings.breakDuration}
              onChange={(val) => handleChange("breakDuration", val)}
              min={1}
              max={15}
              step={1}
              unit=" min"
            />

            <div
              style={{
                padding: "1rem 0",
                borderBottom: "1px solid var(--border-light)",
              }}
            >
              <label
                style={{
                  display: "block",
                  color: "var(--text-primary)",
                  fontWeight: "500",
                  marginBottom: "0.75rem",
                }}
              >
                Focus Intensity
              </label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {["low", "medium", "high"].map((level) => (
                  <motion.button
                    key={level}
                    onClick={() => handleChange("focusIntensity", level)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      flex: 1,
                      padding: "0.75rem",
                      borderRadius: "12px",
                      border: "none",
                      cursor: "pointer",
                      textTransform: "capitalize",
                      fontWeight: "500",
                      background:
                        localSettings.focusIntensity === level
                          ? "linear-gradient(135deg, var(--primary-500), var(--primary-600))"
                          : "var(--bg-tertiary)",
                      color:
                        localSettings.focusIntensity === level
                          ? "white"
                          : "var(--text-secondary)",
                      boxShadow:
                        localSettings.focusIntensity === level
                          ? "0 4px 12px rgba(0, 132, 255, 0.3)"
                          : "none",
                    }}
                  >
                    {level}
                  </motion.button>
                ))}
              </div>
            </div>

            <SettingsSelect
              label="Learning Style"
              description="How you prefer to consume content"
              value={localSettings.learningStyle}
              onChange={(val) => handleChange("learningStyle", val)}
              options={LEARNING_STYLE_OPTIONS}
            />

            <SettingsToggle
              label="Auto-Start Timer"
              description="Automatically start focus timer when entering a session"
              checked={localSettings.autoStartTimer}
              onChange={(val) => handleChange("autoStartTimer", val)}
            />
            <SettingsToggle
              label="Show Time Remaining"
              description="Display countdown during focus sessions"
              checked={localSettings.showTimeRemaining}
              onChange={(val) => handleChange("showTimeRemaining", val)}
            />
            <SettingsToggle
              label="Pause on Inactivity"
              description="Automatically pause timer when inactive"
              checked={localSettings.pauseOnInactivity}
              onChange={(val) => handleChange("pauseOnInactivity", val)}
            />
          </SettingsSection>
        )}

        {/* Notifications Section */}
        {activeSection === "notifications" && (
          <SettingsSection
            id="notifications"
            icon={Bell}
            title="Notifications"
            description="Control how NeuroLearn notifies you"
            delay={0.3}
          >
            <SettingsToggle
              label="Break Reminders"
              description="Get notified when it's time for a break"
              checked={localSettings.notifications}
              onChange={(val) => handleChange("notifications", val)}
            />
            <SettingsToggle
              label="Sound Effects"
              description="Play sounds for completions and alerts"
              checked={localSettings.soundEnabled}
              onChange={(val) => handleChange("soundEnabled", val)}
            />
            <SettingsToggle
              label="Daily Reminder"
              description="Receive a daily reminder to study"
              checked={localSettings.dailyReminder}
              onChange={(val) => handleChange("dailyReminder", val)}
            />

            {localSettings.dailyReminder && (
              <div
                style={{
                  padding: "1rem 0",
                  borderBottom: "1px solid var(--border-light)",
                }}
              >
                <label
                  style={{
                    display: "block",
                    color: "var(--text-primary)",
                    fontWeight: "500",
                    marginBottom: "0.5rem",
                  }}
                >
                  Reminder Time
                </label>
                <input
                  type="time"
                  value={localSettings.dailyReminderTime}
                  onChange={(e) =>
                    handleChange("dailyReminderTime", e.target.value)
                  }
                  style={{
                    padding: "0.75rem 1rem",
                    borderRadius: "12px",
                    border: "1px solid var(--border-medium)",
                    background: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    fontSize: "1rem",
                  }}
                />
              </div>
            )}

            <SettingsToggle
              label="Weekly Progress Report"
              description="Receive a weekly summary of your progress"
              checked={localSettings.weeklyReport}
              onChange={(val) => handleChange("weeklyReport", val)}
            />
            <SettingsToggle
              label="Achievement Alerts"
              description="Get notified when you earn badges"
              checked={localSettings.achievementAlerts}
              onChange={(val) => handleChange("achievementAlerts", val)}
            />
            <SettingsSelect
              label="Focus End Sound"
              description="Sound to play when focus session ends"
              value={localSettings.focusEndSound}
              onChange={(val) => handleChange("focusEndSound", val)}
              options={FOCUS_SOUND_OPTIONS}
            />
          </SettingsSection>
        )}

        {/* Privacy Section */}
        {activeSection === "privacy" && (
          <SettingsSection
            id="privacy"
            icon={Lock}
            title="Privacy & Data"
            description="Control your data and privacy"
            delay={0.35}
          >
            <SettingsToggle
              label="Analytics"
              description="Help improve NeuroLearn by sharing anonymous usage data"
              checked={localSettings.analyticsEnabled}
              onChange={(val) => handleChange("analyticsEnabled", val)}
            />
            <SettingsToggle
              label="Share Progress"
              description="Allow your progress to be visible to others"
              checked={localSettings.shareProgress}
              onChange={(val) => handleChange("shareProgress", val)}
            />
            <SettingsToggle
              label="Show Streak Publicly"
              description="Display your streak on your profile"
              checked={localSettings.showStreak}
              onChange={(val) => handleChange("showStreak", val)}
            />

            <div
              style={{
                padding: "1.5rem 0",
                borderTop: "1px solid var(--border-light)",
                marginTop: "0.5rem",
              }}
            >
              <h4
                style={{
                  color: "var(--text-primary)",
                  fontWeight: "600",
                  marginBottom: "1rem",
                }}
              >
                Data Management
              </h4>
              <div
                style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}
              >
                <motion.button
                  onClick={handleExportSettings}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.75rem 1.25rem",
                    borderRadius: "12px",
                    border: "1px solid var(--border-medium)",
                    background: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  <Download className="w-4 h-4" />
                  Export Settings
                </motion.button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportSettings}
                  style={{ display: "none" }}
                />
                <motion.button
                  onClick={() => fileInputRef.current?.click()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.75rem 1.25rem",
                    borderRadius: "12px",
                    border: "1px solid var(--border-medium)",
                    background: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  <Upload className="w-4 h-4" />
                  Import Settings
                </motion.button>

                <motion.button
                  onClick={handleResetSettings}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.75rem 1.25rem",
                    borderRadius: "12px",
                    border: "1px solid var(--error)",
                    background: "transparent",
                    color: "var(--error)",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset to Defaults
                </motion.button>
              </div>
            </div>
          </SettingsSection>
        )}

        {/* Keyboard Shortcuts Section */}
        {activeSection === "shortcuts" && (
          <SettingsSection
            id="shortcuts"
            icon={Keyboard}
            title="Keyboard Shortcuts"
            description="Quick access with your keyboard"
            delay={0.4}
          >
            <SettingsToggle
              label="Enable Keyboard Shortcuts"
              description="Use keyboard shortcuts throughout the app"
              checked={localSettings.keyboardShortcutsEnabled}
              onChange={(val) => handleChange("keyboardShortcutsEnabled", val)}
            />

            {localSettings.keyboardShortcutsEnabled && (
              <div style={{ marginTop: "1rem" }}>
                <h4
                  style={{
                    color: "var(--text-secondary)",
                    fontWeight: "500",
                    marginBottom: "0.75rem",
                    fontSize: "0.875rem",
                  }}
                >
                  Available Shortcuts
                </h4>
                <div style={{ display: "grid", gap: "0.5rem" }}>
                  {Object.entries(DEFAULT_SHORTCUTS).map(
                    ([action, shortcut]) => (
                      <div
                        key={action}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "0.75rem 1rem",
                          borderRadius: "8px",
                          background: "var(--bg-tertiary)",
                        }}
                      >
                        <span
                          style={{
                            color: "var(--text-primary)",
                            textTransform: "capitalize",
                          }}
                        >
                          {action.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                        <kbd
                          style={{
                            padding: "0.25rem 0.5rem",
                            borderRadius: "6px",
                            background: "var(--bg-secondary)",
                            border: "1px solid var(--border-medium)",
                            color: "var(--text-secondary)",
                            fontSize: "0.8125rem",
                            fontFamily: "monospace",
                          }}
                        >
                          {shortcut}
                        </kbd>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </SettingsSection>
        )}

        {/* Account Section */}
        {activeSection === "account" && (
          <SettingsSection
            id="account"
            icon={Settings}
            title="Account"
            description="Manage your account settings"
            delay={0.45}
          >
            <div style={{ padding: "1.5rem 0" }}>
              <div
                style={{
                  padding: "1.25rem",
                  borderRadius: "12px",
                  border: "1px solid var(--error)",
                  background: "rgba(239, 68, 68, 0.05)",
                }}
              >
                <h4
                  style={{
                    color: "var(--error)",
                    fontWeight: "600",
                    marginBottom: "0.5rem",
                  }}
                >
                  Danger Zone
                </h4>
                <p
                  style={{
                    color: "var(--text-tertiary)",
                    fontSize: "0.875rem",
                    marginBottom: "1rem",
                  }}
                >
                  Once you delete your account, there is no going back. Please
                  be certain.
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    padding: "0.75rem 1.25rem",
                    borderRadius: "12px",
                    background: "var(--error)",
                    color: "white",
                    border: "none",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Delete Account
                </motion.button>
              </div>
            </div>
          </SettingsSection>
        )}
      </div>
    </div>
  );
}
