import { createContext, useContext, useState, useEffect } from "react";

const GamificationContext = createContext();

const BADGES = [
  {
    id: "first_task",
    name: "First Step",
    icon: "🎯",
    description: "Complete your first task",
    requirement: { tasksCompleted: 1 },
  },
  {
    id: "streak_3",
    name: "On Fire",
    icon: "🔥",
    description: "3-day streak",
    requirement: { streak: 3 },
  },
  {
    id: "streak_7",
    name: "Unstoppable",
    icon: "⚡",
    description: "7-day streak",
    requirement: { streak: 7 },
  },
  {
    id: "focus_master",
    name: "Focus Master",
    icon: "🧘",
    description: "Complete 5 focus sessions",
    requirement: { focusSessions: 5 },
  },
  {
    id: "task_crusher",
    name: "Task Crusher",
    icon: "💪",
    description: "Complete 10 tasks",
    requirement: { tasksCompleted: 10 },
  },
  {
    id: "xp_100",
    name: "Rising Star",
    icon: "⭐",
    description: "Earn 100 XP",
    requirement: { xp: 100 },
  },
  {
    id: "xp_500",
    name: "Superstar",
    icon: "🌟",
    description: "Earn 500 XP",
    requirement: { xp: 500 },
  },
  {
    id: "early_bird",
    name: "Early Bird",
    icon: "🐦",
    description: "Complete a task before 9 AM",
    requirement: { special: "early_bird" },
  },
  {
    id: "night_owl",
    name: "Night Owl",
    icon: "🦉",
    description: "Complete a task after 9 PM",
    requirement: { special: "night_owl" },
  },
  {
    id: "breakdown_pro",
    name: "Breakdown Pro",
    icon: "📋",
    description: "Break down 5 tasks into subtasks",
    requirement: { breakdowns: 5 },
  },
];

const XP_VALUES = {
  taskComplete: 10,
  subtaskComplete: 3,
  focusSessionComplete: 15,
  streakBonus: 5,
  breakdownTask: 5,
};

export function GamificationProvider({ children }) {
  const [gamification, setGamification] = useState(() => {
    const saved = localStorage.getItem("neurolearn_gamification");
    return saved
      ? JSON.parse(saved)
      : {
          xp: 0,
          level: 1,
          earnedBadges: [],
          tasksCompleted: 0,
          focusSessions: 0,
          breakdowns: 0,
          currentStreak: 0,
          lastActiveDate: null,
          recentRewards: [],
        };
  });

  useEffect(() => {
    localStorage.setItem(
      "neurolearn_gamification",
      JSON.stringify(gamification)
    );
  }, [gamification]);

  const addXP = (amount, reason) => {
    setGamification((prev) => {
      const newXP = prev.xp + amount;
      const newLevel = Math.floor(newXP / 100) + 1;
      const reward = { amount, reason, timestamp: Date.now() };

      return {
        ...prev,
        xp: newXP,
        level: newLevel,
        recentRewards: [reward, ...prev.recentRewards.slice(0, 4)],
      };
    });
  };

  const onTaskComplete = () => {
    const newCount = gamification.tasksCompleted + 1;
    setGamification((prev) => ({ ...prev, tasksCompleted: newCount }));
    addXP(XP_VALUES.taskComplete, "Task completed!");
    checkBadges({ tasksCompleted: newCount });
  };

  const onSubtaskComplete = () => {
    addXP(XP_VALUES.subtaskComplete, "Subtask done!");
  };

  const onFocusSessionComplete = () => {
    const newCount = gamification.focusSessions + 1;
    setGamification((prev) => ({ ...prev, focusSessions: newCount }));
    addXP(XP_VALUES.focusSessionComplete, "Focus session complete!");
    checkBadges({ focusSessions: newCount });
  };

  const onTaskBreakdown = () => {
    const newCount = gamification.breakdowns + 1;
    setGamification((prev) => ({ ...prev, breakdowns: newCount }));
    addXP(XP_VALUES.breakdownTask, "Task broken down!");
    checkBadges({ breakdowns: newCount });
  };

  const updateStreak = () => {
    const today = new Date().toDateString();
    const lastActive = gamification.lastActiveDate;

    if (lastActive === today) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    let newStreak = 1;
    if (lastActive === yesterday.toDateString()) {
      newStreak = gamification.currentStreak + 1;
      addXP(
        XP_VALUES.streakBonus * newStreak,
        `${newStreak}-day streak bonus!`
      );
    }

    setGamification((prev) => ({
      ...prev,
      currentStreak: newStreak,
      lastActiveDate: today,
    }));
    checkBadges({ streak: newStreak });
  };

  const checkBadges = (stats) => {
    const earnedIds = gamification.earnedBadges.map((b) => b.id);

    BADGES.forEach((badge) => {
      if (earnedIds.includes(badge.id)) return;

      const req = badge.requirement;
      let earned = false;

      if (req.tasksCompleted && stats.tasksCompleted >= req.tasksCompleted)
        earned = true;
      if (req.streak && stats.streak >= req.streak) earned = true;
      if (req.focusSessions && stats.focusSessions >= req.focusSessions)
        earned = true;
      if (req.xp && gamification.xp >= req.xp) earned = true;
      if (req.breakdowns && stats.breakdowns >= req.breakdowns) earned = true;

      if (earned) {
        setGamification((prev) => ({
          ...prev,
          earnedBadges: [
            ...prev.earnedBadges,
            { ...badge, earnedAt: Date.now() },
          ],
        }));
      }
    });
  };

  const getXPForNextLevel = () => {
    return gamification.level * 100 - gamification.xp;
  };

  const getLevelProgress = () => {
    const xpInCurrentLevel = gamification.xp % 100;
    return (xpInCurrentLevel / 100) * 100;
  };

  return (
    <GamificationContext.Provider
      value={{
        ...gamification,
        allBadges: BADGES,
        addXP,
        onTaskComplete,
        onSubtaskComplete,
        onFocusSessionComplete,
        onTaskBreakdown,
        updateStreak,
        getXPForNextLevel,
        getLevelProgress,
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error(
      "useGamification must be used within a GamificationProvider"
    );
  }
  return context;
}
