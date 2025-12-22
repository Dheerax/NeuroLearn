import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const AccessibilityContext = createContext();

const FONT_SIZE_VALUES = {
  small: "14px",
  medium: "16px",
  large: "18px",
  "extra-large": "20px",
};

export function AccessibilityProvider({ children }) {
  const { user, updateProfile } = useAuth();

  const [settings, setSettings] = useState({
    fontSize: "medium",
    dyslexiaFont: false,
    highContrast: false,
    reducedMotion: false,
    screenReader: false,
    colorBlindMode: "none",
  });

  // Load settings from user preferences
  useEffect(() => {
    if (user?.preferences?.accessibility) {
      setSettings((prev) => ({
        ...prev,
        ...user.preferences.accessibility,
      }));
    }
  }, [user]);

  // Apply accessibility settings to document
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // Font size
    const fontSizeValue =
      FONT_SIZE_VALUES[settings.fontSize] || FONT_SIZE_VALUES.medium;
    root.style.setProperty("--base-font-size", fontSizeValue);

    // Dyslexia font
    if (settings.dyslexiaFont) {
      body.classList.add("dyslexia-font");
    } else {
      body.classList.remove("dyslexia-font");
    }

    // High contrast
    if (settings.highContrast) {
      body.classList.add("high-contrast");
    } else {
      body.classList.remove("high-contrast");
    }

    // Reduced motion
    if (settings.reducedMotion) {
      body.classList.add("reduced-motion");
    } else {
      body.classList.remove("reduced-motion");
    }

    // Color blind modes
    body.classList.remove(
      "colorblind-protanopia",
      "colorblind-deuteranopia",
      "colorblind-tritanopia"
    );
    if (settings.colorBlindMode !== "none") {
      body.classList.add(`colorblind-${settings.colorBlindMode}`);
    }
  }, [settings]);

  const updateAccessibility = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    // Persist to backend
    if (updateProfile) {
      await updateProfile({
        preferences: {
          accessibility: newSettings,
        },
      });
    }
  };

  const updateMultiple = async (updates) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);

    if (updateProfile) {
      await updateProfile({
        preferences: {
          accessibility: newSettings,
        },
      });
    }
  };

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        updateAccessibility,
        updateMultiple,
        fontSizeValues: FONT_SIZE_VALUES,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error(
      "useAccessibility must be used within an AccessibilityProvider"
    );
  }
  return context;
}

export default AccessibilityContext;
