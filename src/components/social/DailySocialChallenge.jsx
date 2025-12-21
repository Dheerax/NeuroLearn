import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, Trophy, RefreshCw, CheckCircle, Star } from "lucide-react";
import geminiAI from "../../services/geminiAI";
import { useGamification } from "../../context/GamificationContext";

export default function DailySocialChallenge() {
  const [challenge, setChallenge] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const { addXP } = useGamification();

  useEffect(() => {
    loadChallenge();
  }, []);

  const loadChallenge = async () => {
    setIsLoading(true);
    try {
      // Check if challenge was already completed today
      const lastCompleted = localStorage.getItem("last_social_challenge");
      const today = new Date().toDateString();

      if (lastCompleted === today) {
        setIsCompleted(true);
        setChallenge(
          JSON.parse(localStorage.getItem("current_social_challenge"))
        );
      } else {
        const newChallenge = await geminiAI.getDailySocialChallenge("beginner");
        setChallenge(newChallenge);
        localStorage.setItem(
          "current_social_challenge",
          JSON.stringify(newChallenge)
        );
      }
    } catch (error) {
      console.error("Failed to load challenge:", error);
      setChallenge({
        title: "Say Hello",
        description: "Greet someone with a smile today",
        tips: ["Keep it simple", "A wave counts too!"],
        xpReward: 20,
        category: "greeting",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    setIsCompleted(true);
    localStorage.setItem("last_social_challenge", new Date().toDateString());
    addXP(challenge?.xpReward || 25, "social_challenge");
  };

  const getNewChallenge = async () => {
    setIsLoading(true);
    setIsCompleted(false);
    localStorage.removeItem("last_social_challenge");
    try {
      const newChallenge = await geminiAI.getDailySocialChallenge("beginner");
      setChallenge(newChallenge);
      localStorage.setItem(
        "current_social_challenge",
        JSON.stringify(newChallenge)
      );
    } catch (error) {
      console.error("Failed to get new challenge:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div
        className="p-6 rounded-2xl text-center"
        style={{ background: "linear-gradient(135deg, #f59e0b20, #f59e0b10)" }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Star className="w-8 h-8 mx-auto" style={{ color: "#f59e0b" }} />
        </motion.div>
        <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          Loading today's challenge...
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: isCompleted
          ? "linear-gradient(135deg, #22c55e20, #22c55e10)"
          : "linear-gradient(135deg, #f59e0b20, #f59e0b10)",
        border: `1px solid ${isCompleted ? "#22c55e40" : "#f59e0b40"}`,
      }}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <Trophy className="w-6 h-6" style={{ color: "#22c55e" }} />
            ) : (
              <Zap className="w-6 h-6" style={{ color: "#f59e0b" }} />
            )}
            <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>
              Daily Challenge
            </h3>
          </div>
          <span
            className="px-2 py-1 rounded-full text-xs font-medium"
            style={{
              background: isCompleted ? "#22c55e" : "#f59e0b",
              color: "white",
            }}
          >
            +{challenge?.xpReward || 25} XP
          </span>
        </div>

        <h4
          className="text-lg font-semibold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          {challenge?.title}
        </h4>

        <p className="mb-4" style={{ color: "var(--text-secondary)" }}>
          {challenge?.description}
        </p>

        {challenge?.tips && challenge.tips.length > 0 && (
          <div className="space-y-2 mb-4">
            {challenge.tips.map((tip, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm"
                style={{ color: "var(--text-tertiary)" }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "var(--primary-500)" }}
                />
                {tip}
              </div>
            ))}
          </div>
        )}

        {isCompleted ? (
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-2 text-sm"
              style={{ color: "#22c55e" }}
            >
              <CheckCircle className="w-5 h-5" />
              Challenge completed!
            </div>
            <button
              onClick={getNewChallenge}
              className="flex items-center gap-1 text-sm cursor-pointer hover:opacity-80"
              style={{ color: "var(--text-tertiary)" }}
            >
              <RefreshCw className="w-4 h-4" />
              New challenge
            </button>
          </div>
        ) : (
          <motion.button
            onClick={handleComplete}
            className="w-full py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2 cursor-pointer"
            style={{ background: "#f59e0b" }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <CheckCircle className="w-5 h-5" />
            Mark as Complete
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
