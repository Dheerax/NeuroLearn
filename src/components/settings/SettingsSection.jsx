import { motion } from "framer-motion";

export default function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
  delay = 0,
  id,
}) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="settings-section"
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid var(--glass-border)",
        borderRadius: "20px",
        padding: "1.5rem",
        marginBottom: "1.5rem",
      }}
    >
      <div className="section-header" style={{ marginBottom: "1.25rem" }}>
        <h2
          className="flex items-center gap-3"
          style={{
            color: "var(--text-primary)",
            fontSize: "1.25rem",
            fontWeight: "600",
            marginBottom: description ? "0.5rem" : 0,
          }}
        >
          {Icon && (
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background:
                  "linear-gradient(135deg, var(--primary-500), var(--primary-600))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(0, 132, 255, 0.3)",
              }}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
          )}
          {title}
        </h2>
        {description && (
          <p
            style={{
              color: "var(--text-tertiary)",
              fontSize: "0.875rem",
              marginLeft: Icon ? "52px" : 0,
            }}
          >
            {description}
          </p>
        )}
      </div>
      <div className="section-content">{children}</div>
    </motion.section>
  );
}
