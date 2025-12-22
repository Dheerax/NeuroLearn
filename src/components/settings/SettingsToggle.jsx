import { motion } from "framer-motion";

export default function SettingsToggle({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}) {
  return (
    <div
      className="settings-toggle-row"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1rem 0",
        borderBottom: "1px solid var(--border-light)",
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? "none" : "auto",
      }}
    >
      <div style={{ flex: 1, marginRight: "1rem" }}>
        <p
          style={{
            color: "var(--text-primary)",
            fontWeight: "500",
            marginBottom: description ? "0.25rem" : 0,
          }}
        >
          {label}
        </p>
        {description && (
          <p
            style={{
              color: "var(--text-tertiary)",
              fontSize: "0.875rem",
            }}
          >
            {description}
          </p>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        disabled={disabled}
        className="toggle-switch"
        style={{
          width: "52px",
          height: "28px",
          borderRadius: "14px",
          padding: "2px",
          background: checked
            ? "linear-gradient(135deg, var(--primary-500), var(--primary-600))"
            : "var(--bg-tertiary)",
          border: "none",
          cursor: disabled ? "not-allowed" : "pointer",
          position: "relative",
          transition: "background 0.3s ease",
          boxShadow: checked
            ? "0 2px 8px rgba(0, 132, 255, 0.3)"
            : "inset 0 2px 4px rgba(0, 0, 0, 0.1)",
        }}
        aria-checked={checked}
        role="switch"
      >
        <motion.div
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "12px",
            background: "white",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
            position: "absolute",
            top: "2px",
          }}
          animate={{ left: checked ? "26px" : "2px" }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}
