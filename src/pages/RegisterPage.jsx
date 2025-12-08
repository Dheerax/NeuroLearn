import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Brain,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  Check,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const CONDITIONS = [
  {
    id: "adhd",
    name: "ADHD",
    icon: "⚡",
    description: "Focus & organization support",
  },
  {
    id: "autism",
    name: "Autism",
    icon: "🧩",
    description: "Social skills & communication",
  },
  {
    id: "dyslexia",
    name: "Dyslexia",
    icon: "📖",
    description: "Reading & text support",
  },
  {
    id: "anxiety",
    name: "Anxiety",
    icon: "🌿",
    description: "Calming & break reminders",
  },
];

const AVATARS = ["🧠", "🌟", "🚀", "🎯", "💡", "🦋", "🌈", "🔥", "💪", "🎨"];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, updateProfile } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Account
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Step 2: Profile
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [avatar, setAvatar] = useState("🧠");

  const handleStep1 = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await register(name, email, password);

    setLoading(false);

    if (result.success) {
      setStep(2);
    } else {
      setError(result.error);
    }
  };

  const handleStep2 = async () => {
    setLoading(true);

    await updateProfile({
      avatar,
      profile: { conditions: selectedConditions },
      onboardingComplete: true,
    });

    setLoading(false);
    navigate("/");
  };

  const toggleCondition = (id) => {
    setSelectedConditions((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-1/2 -right-1/2 w-full h-full rounded-full blur-3xl opacity-20"
          style={{ background: "var(--primary-500)" }}
        />
        <div
          className="absolute -bottom-1/2 -left-1/2 w-full h-full rounded-full blur-3xl opacity-10"
          style={{ background: "var(--primary-500)" }}
        />
      </div>

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Logo */}
        <motion.div
          className="text-center mb-8"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1
            className="text-3xl font-display font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {step === 1 ? "Create Account" : "Personalize"}
          </h1>
          <p style={{ color: "var(--text-secondary)" }} className="mt-2">
            {step === 1
              ? "Start your accessible learning journey"
              : "Help us customize your experience"}
          </p>
        </motion.div>

        {/* Progress */}
        <div className="flex gap-2 mb-6">
          <motion.div
            className="flex-1 h-1.5 rounded-full"
            style={{ background: "var(--primary-500)" }}
          />
          <motion.div
            className="flex-1 h-1.5 rounded-full transition-colors"
            style={{
              background:
                step >= 2 ? "var(--primary-500)" : "var(--border-light)",
            }}
          />
        </div>

        {/* Step 1: Account Info */}
        {step === 1 && (
          <motion.div
            className="card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <form onSubmit={handleStep1} className="space-y-5">
              {error && (
                <motion.div
                  className="p-3 rounded-xl text-sm"
                  style={{
                    background: "var(--error-bg)",
                    color: "var(--error)",
                  }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  {error}
                </motion.div>
              )}

              {/* Name */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Name
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                    style={{ color: "var(--text-tertiary)" }}
                  />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Email
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                    style={{ color: "var(--text-tertiary)" }}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                    style={{ color: "var(--text-tertiary)" }}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="input-field pl-10 pr-10"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <p style={{ color: "var(--text-secondary)" }}>
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium"
                  style={{ color: "var(--primary-500)" }}
                >
                  Sign in
                </Link>
              </p>
            </div>
          </motion.div>
        )}

        {/* Step 2: Profile Setup */}
        {step === 2 && (
          <motion.div
            className="card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="space-y-6">
              {/* Avatar Selection */}
              <div>
                <label
                  className="block text-sm font-medium mb-3"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Choose Your Avatar
                </label>
                <div className="flex flex-wrap gap-2 justify-center">
                  {AVATARS.map((emoji) => (
                    <motion.button
                      key={emoji}
                      onClick={() => setAvatar(emoji)}
                      className={`w-12 h-12 text-2xl rounded-xl flex items-center justify-center transition-all`}
                      style={{
                        background:
                          avatar === emoji
                            ? "var(--primary-500)"
                            : "var(--bg-tertiary)",
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Conditions */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  What would you like support with?{" "}
                  <span style={{ color: "var(--text-tertiary)" }}>
                    (optional)
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {CONDITIONS.map((condition) => (
                    <motion.button
                      key={condition.id}
                      onClick={() => toggleCondition(condition.id)}
                      className={`p-3 rounded-xl border-2 text-left transition-all`}
                      style={{
                        borderColor: selectedConditions.includes(condition.id)
                          ? "var(--primary-500)"
                          : "var(--border-light)",
                        background: selectedConditions.includes(condition.id)
                          ? "rgba(0, 132, 255, 0.05)"
                          : "transparent",
                      }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{condition.icon}</span>
                        <span
                          className="font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {condition.name}
                        </span>
                        {selectedConditions.includes(condition.id) && (
                          <Check
                            className="w-4 h-4 ml-auto"
                            style={{ color: "var(--primary-500)" }}
                          />
                        )}
                      </div>
                      <p
                        className="text-xs mt-1"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        {condition.description}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Continue */}
              <motion.button
                onClick={handleStep2}
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Start Learning
                  </>
                )}
              </motion.button>

              <button
                onClick={() => {
                  updateProfile({ onboardingComplete: true });
                  navigate("/");
                }}
                className="w-full text-sm"
                style={{ color: "var(--text-tertiary)" }}
              >
                Skip for now
              </button>
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <p
          className="text-center text-sm mt-6"
          style={{ color: "var(--text-tertiary)" }}
        >
          NeuroLearn - Learning made accessible for everyone
        </p>
      </motion.div>
    </div>
  );
}
