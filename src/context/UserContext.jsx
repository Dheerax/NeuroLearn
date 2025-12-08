import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("neurolearn_user");
    return saved
      ? JSON.parse(saved)
      : {
          name: "Student",
          avatar: "🧠",
          preferences: {
            learningStyle: "visual", // visual, audio, text, mixed
            breakInterval: 25, // minutes
            breakDuration: 5, // minutes
            theme: "light",
            notifications: true,
            soundEnabled: true,
            focusIntensity: "medium", // low, medium, high
          },
          profile: {
            conditions: [], // autism, adhd, dyslexia, etc.
            strengths: [],
            challenges: [],
          },
          stats: {
            totalFocusTime: 0,
            tasksCompleted: 0,
            currentStreak: 0,
            longestStreak: 0,
            lastActiveDate: null,
          },
        };
  });

  useEffect(() => {
    localStorage.setItem("neurolearn_user", JSON.stringify(user));
  }, [user]);

  const updatePreferences = (newPrefs) => {
    setUser((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, ...newPrefs },
    }));
  };

  const updateProfile = (newProfile) => {
    setUser((prev) => ({
      ...prev,
      profile: { ...prev.profile, ...newProfile },
    }));
  };

  const updateStats = (newStats) => {
    setUser((prev) => ({
      ...prev,
      stats: { ...prev.stats, ...newStats },
    }));
  };

  const updateUser = (updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        updatePreferences,
        updateProfile,
        updateStats,
        updateUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
