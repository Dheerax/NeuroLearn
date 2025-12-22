import { motion } from "framer-motion";
import {
  User,
  Palette,
  Accessibility,
  Brain,
  Bell,
  Lock,
  Keyboard,
  Settings,
  LogOut,
} from "lucide-react";

const SECTIONS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "accessibility", label: "Accessibility", icon: Accessibility },
  { id: "focus", label: "Focus & Learning", icon: Brain },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy & Data", icon: Lock },
  { id: "shortcuts", label: "Shortcuts", icon: Keyboard },
  { id: "account", label: "Account", icon: Settings },
];

export default function SettingsSidebar({
  activeSection,
  onSectionChange,
  onLogout,
}) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="settings-sidebar"
      style={{
        width: "240px",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        height: "fit-content",
        position: "sticky",
        top: "1.5rem",
      }}
    >
      <div
        style={{
          background: "var(--glass-bg)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid var(--glass-border)",
          borderRadius: "20px",
          padding: "1rem",
          marginBottom: "1rem",
        }}
      >
        <nav
          style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
        >
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <motion.button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem 1rem",
                  borderRadius: "12px",
                  border: "none",
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                  transition: "all 0.2s ease",
                  background: isActive
                    ? "linear-gradient(135deg, var(--primary-500), var(--primary-600))"
                    : "transparent",
                  color: isActive ? "white" : "var(--text-secondary)",
                  boxShadow: isActive
                    ? "0 4px 12px rgba(0, 132, 255, 0.3)"
                    : "none",
                }}
              >
                <Icon
                  className="w-5 h-5"
                  style={{
                    opacity: isActive ? 1 : 0.7,
                  }}
                />
                <span
                  style={{
                    fontSize: "0.9375rem",
                    fontWeight: isActive ? "600" : "500",
                  }}
                >
                  {section.label}
                </span>
              </motion.button>
            );
          })}
        </nav>
      </div>

      {/* Logout Button */}
      <motion.button
        onClick={onLogout}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          padding: "0.875rem",
          borderRadius: "12px",
          border: "1px solid var(--error)",
          cursor: "pointer",
          width: "100%",
          background: "transparent",
          color: "var(--error)",
          fontWeight: "500",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.target.style.background = "var(--error)";
          e.target.style.color = "white";
        }}
        onMouseLeave={(e) => {
          e.target.style.background = "transparent";
          e.target.style.color = "var(--error)";
        }}
      >
        <LogOut className="w-5 h-5" />
        Sign Out
      </motion.button>
    </motion.aside>
  );
}

export { SECTIONS };
