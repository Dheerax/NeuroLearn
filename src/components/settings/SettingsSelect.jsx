import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";

export default function SettingsSelect({
  label,
  description,
  value,
  onChange,
  options = [],
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  const selectedOption =
    options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className="settings-select-row"
      style={{
        padding: "1rem 0",
        borderBottom: "1px solid var(--border-light)",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
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
        <div ref={ref} style={{ position: "relative" }}>
          <button
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              borderRadius: "12px",
              border: "1px solid var(--border-medium)",
              background: "var(--bg-secondary)",
              color: "var(--text-primary)",
              cursor: disabled ? "not-allowed" : "pointer",
              minWidth: "150px",
              justifyContent: "space-between",
              transition: "all 0.2s ease",
            }}
          >
            <span
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              {selectedOption?.icon && <span>{selectedOption.icon}</span>}
              {selectedOption?.label}
            </span>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown
                className="w-4 h-4"
                style={{ color: "var(--text-tertiary)" }}
              />
            </motion.div>
          </button>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  minWidth: "180px",
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border-medium)",
                  borderRadius: "12px",
                  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
                  overflow: "hidden",
                  zIndex: 100,
                }}
              >
                {options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      padding: "0.75rem 1rem",
                      border: "none",
                      background:
                        value === option.value
                          ? "var(--primary-50)"
                          : "transparent",
                      color:
                        value === option.value
                          ? "var(--primary-600)"
                          : "var(--text-primary)",
                      cursor: "pointer",
                      transition: "background 0.2s ease",
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) => {
                      if (value !== option.value) {
                        e.target.style.background = "var(--bg-secondary)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background =
                        value === option.value
                          ? "var(--primary-50)"
                          : "transparent";
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      {option.icon && <span>{option.icon}</span>}
                      {option.label}
                    </span>
                    {value === option.value && (
                      <Check
                        className="w-4 h-4"
                        style={{ color: "var(--primary-500)" }}
                      />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
