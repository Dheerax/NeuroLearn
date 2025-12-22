import { useState, useEffect, useRef } from "react";

export default function SettingsSlider({
  label,
  description,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = "",
  showValue = true,
}) {
  const [localValue, setLocalValue] = useState(value);
  const sliderRef = useRef(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const percentage = ((localValue - min) / (max - min)) * 100;

  const handleChange = (e) => {
    const newValue = parseInt(e.target.value, 10);
    setLocalValue(newValue);
    onChange(newValue);
  };

  return (
    <div
      className="settings-slider-row"
      style={{
        padding: "1rem 0",
        borderBottom: "1px solid var(--border-light)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.75rem",
        }}
      >
        <div>
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
        {showValue && (
          <div
            style={{
              background:
                "linear-gradient(135deg, var(--primary-500), var(--primary-600))",
              padding: "0.375rem 0.75rem",
              borderRadius: "8px",
              color: "white",
              fontWeight: "600",
              fontSize: "0.875rem",
              minWidth: "60px",
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0, 132, 255, 0.3)",
            }}
          >
            {localValue}
            {unit}
          </div>
        )}
      </div>
      <div style={{ position: "relative" }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: "8px",
            background: "var(--bg-tertiary)",
            borderRadius: "4px",
            top: "50%",
            transform: "translateY(-50%)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${percentage}%`,
              background:
                "linear-gradient(90deg, var(--primary-500), var(--primary-400))",
              borderRadius: "4px",
              transition: "width 0.1s ease",
            }}
          />
        </div>
        <input
          ref={sliderRef}
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue}
          onChange={handleChange}
          style={{
            width: "100%",
            height: "8px",
            appearance: "none",
            WebkitAppearance: "none",
            background: "transparent",
            cursor: "pointer",
            position: "relative",
            zIndex: 1,
          }}
          aria-label={label}
        />
      </div>
      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2), 0 0 0 3px var(--primary-500);
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 3px 12px rgba(0, 0, 0, 0.3),
            0 0 0 4px var(--primary-500);
        }
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          border: 3px solid var(--primary-500);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
