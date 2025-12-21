import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  MessageCircle,
  Eye,
  Send,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  Bot,
  User,
  Lightbulb,
  Heart,
  Star,
  Loader2,
  Play,
  Target,
  ArrowRight,
  Mic,
  Trophy,
} from "lucide-react";
import { useGamification } from "../context/GamificationContext";
import geminiAI from "../services/geminiAI";

const SCENARIOS = [
  {
    id: "job-interview",
    title: "Job Interview",
    emoji: "💼",
    bg: "from-blue-600 to-indigo-700",
  },
  {
    id: "making-friends",
    title: "Making Friends",
    emoji: "👋",
    bg: "from-green-500 to-teal-600",
  },
  {
    id: "asking-help",
    title: "Asking for Help",
    emoji: "🙋",
    bg: "from-amber-500 to-orange-600",
  },
  {
    id: "boundaries",
    title: "Setting Boundaries",
    emoji: "🛑",
    bg: "from-red-500 to-rose-600",
  },
  {
    id: "small-talk",
    title: "Small Talk",
    emoji: "💬",
    bg: "from-purple-500 to-violet-600",
  },
  {
    id: "apologizing",
    title: "Apologizing",
    emoji: "🙏",
    bg: "from-pink-500 to-fuchsia-600",
  },
];

const EMOTIONS = [
  {
    context:
      "Your friend got promoted. They're smiling widely, talking fast about new responsibilities.",
    answer: "Excited",
    options: ["Nervous", "Excited", "Confused", "Angry"],
  },
  {
    context:
      "Someone's pet is sick. They're speaking quietly, avoiding eye contact.",
    answer: "Sad",
    options: ["Sad", "Tired", "Bored", "Calm"],
  },
  {
    context:
      "Coworker was promised time off but now has to work. Clenched jaw, short sentences.",
    answer: "Angry",
    options: ["Surprised", "Anxious", "Angry", "Disappointed"],
  },
  {
    context:
      "Someone about to give their first presentation. Fidgeting, constantly checking notes.",
    answer: "Anxious",
    options: ["Excited", "Anxious", "Proud", "Bored"],
  },
  {
    context:
      "Student got an unexpected A on a test they thought they failed. Wide eyes, saying 'really?!'",
    answer: "Surprised",
    options: ["Confused", "Happy", "Surprised", "Relieved"],
  },
];

export default function CommunicationPage() {
  const { addXP, stats } = useGamification();

  // Main state
  const [mode, setMode] = useState("home"); // home, practice, emotion, challenge
  const [selectedScenario, setSelectedScenario] = useState(null);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tips, setTips] = useState([]);

  // Emotion quiz
  const [emotionIdx, setEmotionIdx] = useState(0);
  const [emotionChoice, setEmotionChoice] = useState(null);
  const [emotionScore, setEmotionScore] = useState(0);

  // Challenge
  const [challenge, setChallenge] = useState(null);
  const [challengeDone, setChallengeDone] = useState(false);

  const chatRef = useRef(null);
  const scenarioRef = useRef(null);

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    const today = new Date().toDateString();
    const saved = localStorage.getItem("social_challenge_date");
    if (saved === today) {
      setChallengeDone(true);
      setChallenge(JSON.parse(localStorage.getItem("current_challenge")));
    } else {
      geminiAI
        .getDailySocialChallenge("beginner")
        .then((c) => {
          setChallenge(c);
          localStorage.setItem("current_challenge", JSON.stringify(c));
        })
        .catch(() =>
          setChallenge({
            title: "Say Hello",
            description: "Greet someone warmly today",
            xpReward: 20,
          })
        );
    }
  }, []);

  const startScenario = (s) => {
    setSelectedScenario(s);
    setMode("practice");
    setMessages([
      {
        role: "system",
        content: `You're practicing: **${s.title}**\n\nStart the conversation naturally. I'll play the other person.`,
      },
    ]);
    setTips([]);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const msg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setIsLoading(true);

    try {
      const res = await geminiAI.practiceConversation(
        selectedScenario.title,
        msg,
        messages.filter((m) => m.role !== "system")
      );
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.response },
      ]);
      if (res.coachTip) setTips((prev) => [...prev, res.coachTip]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Try again!" },
      ]);
    }
    setIsLoading(false);
  };

  const handleEmotionPick = (opt) => {
    setEmotionChoice(opt);
    if (opt === EMOTIONS[emotionIdx].answer)
      setEmotionScore((prev) => prev + 1);
  };

  const nextEmotion = () => {
    if (emotionIdx < EMOTIONS.length - 1) {
      setEmotionIdx((prev) => prev + 1);
      setEmotionChoice(null);
    } else {
      addXP(emotionScore * 15, "emotion_quiz");
    }
  };

  const resetEmotion = () => {
    setEmotionIdx(0);
    setEmotionChoice(null);
    setEmotionScore(0);
  };

  const markChallengeDone = () => {
    setChallengeDone(true);
    localStorage.setItem("social_challenge_date", new Date().toDateString());
    addXP(challenge?.xpReward || 25, "social_challenge");
  };

  const scrollScenarios = (dir) => {
    if (scenarioRef.current) {
      scenarioRef.current.scrollBy({ left: dir * 200, behavior: "smooth" });
    }
  };

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ background: "var(--gradient-orb-1)" }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-[-15%] left-[-10%] w-[400px] h-[400px] rounded-full blur-3xl"
          style={{ background: "var(--gradient-orb-2)" }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, delay: 2 }}
        />
      </div>

      <AnimatePresence mode="wait">
        {/* HOME VIEW */}
        {mode === "home" && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col relative z-10 overflow-y-auto"
          >
            {/* Hero Section */}
            <div className="relative pt-8 pb-6 px-6">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex items-center justify-between mb-6"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1
                      className="text-xl font-bold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Social Skills
                    </h1>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      AI-powered practice
                    </p>
                  </div>
                </div>
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                  style={{ background: "var(--bg-tertiary)" }}
                >
                  <Sparkles
                    className="w-4 h-4"
                    style={{ color: "var(--accent-color)" }}
                  />
                  <span
                    className="font-bold text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {stats?.totalXP || 0}
                  </span>
                </div>
              </motion.div>

              {/* Daily Challenge Card - Floating */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="relative rounded-3xl p-5 mb-6 overflow-hidden"
                style={{ background: "var(--gradient-primary)" }}
              >
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20"
                  style={{ background: "white", filter: "blur(40px)" }}
                />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-yellow-300" />
                    <span className="text-xs font-medium text-white/80">
                      Daily Challenge
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    {challenge?.title || "Loading..."}
                  </h3>
                  <p className="text-sm text-white/70 mb-3">
                    {challenge?.description || ""}
                  </p>
                  {!challengeDone ? (
                    <button
                      onClick={markChallengeDone}
                      className="px-4 py-2 rounded-full text-sm font-medium cursor-pointer flex items-center gap-2"
                      style={{
                        background: "white",
                        color: "var(--primary-700)",
                      }}
                    >
                      <Trophy className="w-4 h-4" />
                      Complete (+{challenge?.xpReward || 25} XP)
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 text-white/80 text-sm">
                      <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                        ✓
                      </div>
                      Completed today!
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Practice Scenarios - Horizontal Scroll Cards */}
            <div className="px-6 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2
                  className="font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Practice Conversations
                </h2>
                <div className="flex gap-1">
                  <button
                    onClick={() => scrollScenarios(-1)}
                    className="p-1.5 rounded-full cursor-pointer"
                    style={{ background: "var(--bg-tertiary)" }}
                  >
                    <ChevronLeft
                      className="w-4 h-4"
                      style={{ color: "var(--text-secondary)" }}
                    />
                  </button>
                  <button
                    onClick={() => scrollScenarios(1)}
                    className="p-1.5 rounded-full cursor-pointer"
                    style={{ background: "var(--bg-tertiary)" }}
                  >
                    <ChevronRight
                      className="w-4 h-4"
                      style={{ color: "var(--text-secondary)" }}
                    />
                  </button>
                </div>
              </div>
              <div
                ref={scenarioRef}
                className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
                style={{ scrollbarWidth: "none" }}
              >
                {SCENARIOS.map((s, i) => (
                  <motion.button
                    key={s.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => startScenario(s)}
                    className={`shrink-0 w-36 h-44 rounded-2xl p-4 flex flex-col justify-between cursor-pointer group bg-gradient-to-br ${s.bg}`}
                    whileHover={{ scale: 1.03, y: -4 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <span className="text-4xl">{s.emoji}</span>
                    <div>
                      <p className="text-white font-medium text-sm leading-tight">
                        {s.title}
                      </p>
                      <div className="flex items-center gap-1 mt-2 text-white/60 text-xs group-hover:text-white/80">
                        <Play className="w-3 h-3" /> Start
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Emotion Reading Section - Big CTA */}
            <div className="px-6 mb-6">
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={() => setMode("emotion")}
                className="w-full p-5 rounded-2xl flex items-center justify-between cursor-pointer group"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border-light)",
                }}
                whileHover={{ y: -2, borderColor: "var(--accent-color)" }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: "var(--gradient-accent)" }}
                  >
                    <Eye
                      className="w-7 h-7"
                      style={{ color: "var(--accent-color)" }}
                    />
                  </div>
                  <div className="text-left">
                    <h3
                      className="font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Read Emotions Quiz
                    </h3>
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      Learn to recognize how others feel
                    </p>
                  </div>
                </div>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center group-hover:bg-white/10 transition-colors"
                  style={{ background: "var(--bg-tertiary)" }}
                >
                  <ArrowRight
                    className="w-5 h-5"
                    style={{ color: "var(--text-secondary)" }}
                  />
                </div>
              </motion.button>
            </div>

            {/* Tips Section */}
            <div className="px-6 pb-8">
              <h2
                className="font-semibold mb-3"
                style={{ color: "var(--text-primary)" }}
              >
                Quick Tips
              </h2>
              <div className="space-y-2">
                {[
                  "Make eye contact for 3-5 seconds",
                  "Nod to show you're listening",
                  "Mirror the other person's energy",
                ].map((tip, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: "var(--bg-tertiary)" }}
                  >
                    <Lightbulb
                      className="w-4 h-4 shrink-0"
                      style={{ color: "var(--warning)" }}
                    />
                    <span
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {tip}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* PRACTICE MODE */}
        {mode === "practice" && selectedScenario && (
          <motion.div
            key="practice"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 flex flex-col relative z-10"
          >
            {/* Header */}
            <div
              className="shrink-0 p-4 flex items-center justify-between"
              style={{ borderBottom: "1px solid var(--border-light)" }}
            >
              <button
                onClick={() => {
                  setMode("home");
                  setSelectedScenario(null);
                }}
                className="p-2 rounded-full cursor-pointer"
                style={{ background: "var(--bg-tertiary)" }}
              >
                <ChevronLeft
                  className="w-5 h-5"
                  style={{ color: "var(--text-secondary)" }}
                />
              </button>
              <div className="text-center">
                <span className="text-2xl">{selectedScenario.emoji}</span>
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {selectedScenario.title}
                </p>
              </div>
              <div className="w-9" /> {/* Spacer */}
            </div>

            {/* Messages */}
            <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {m.role === "system" ? (
                    <div
                      className="w-full p-4 rounded-2xl text-center"
                      style={{ background: "var(--gradient-accent)" }}
                    >
                      <p
                        className="text-sm"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {m.content.replace(/\*\*/g, "")}
                      </p>
                    </div>
                  ) : m.role === "user" ? (
                    <div
                      className="max-w-[75%] px-4 py-2.5 rounded-2xl rounded-br-sm text-sm"
                      style={{
                        background: "var(--gradient-primary)",
                        color: "white",
                      }}
                    >
                      {m.content}
                    </div>
                  ) : (
                    <div className="flex gap-2 max-w-[80%]">
                      <div
                        className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center"
                        style={{ background: "var(--bg-tertiary)" }}
                      >
                        <Bot
                          className="w-4 h-4"
                          style={{ color: "var(--text-secondary)" }}
                        />
                      </div>
                      <div
                        className="px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm"
                        style={{
                          background: "var(--surface)",
                          color: "var(--text-primary)",
                        }}
                      >
                        {m.content}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: "var(--bg-tertiary)" }}
                  >
                    <Loader2
                      className="w-4 h-4 animate-spin"
                      style={{ color: "var(--text-secondary)" }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Tips Bar */}
            {tips.length > 0 && (
              <div
                className="shrink-0 px-4 py-2"
                style={{
                  background: "var(--warning-bg)",
                  borderTop: "1px solid var(--warning)",
                }}
              >
                <div className="flex items-center gap-2">
                  <Lightbulb
                    className="w-4 h-4 shrink-0"
                    style={{ color: "var(--warning)" }}
                  />
                  <p
                    className="text-xs"
                    style={{ color: "var(--text-primary)" }}
                  >
                    <strong>Tip:</strong> {tips[tips.length - 1]}
                  </p>
                </div>
              </div>
            )}

            {/* Input */}
            <div
              className="shrink-0 p-4"
              style={{ background: "var(--bg-secondary)" }}
            >
              <div
                className="flex items-center gap-2 p-2 rounded-xl"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border-medium)",
                }}
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type your response..."
                  className="flex-1 bg-transparent text-sm outline-none px-2"
                  style={{ color: "var(--text-primary)" }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="p-2 rounded-lg cursor-pointer disabled:opacity-50"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* EMOTION QUIZ MODE */}
        {mode === "emotion" && (
          <motion.div
            key="emotion"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 flex flex-col relative z-10 p-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => {
                  setMode("home");
                  resetEmotion();
                }}
                className="p-2 rounded-full cursor-pointer"
                style={{ background: "var(--bg-tertiary)" }}
              >
                <ChevronLeft
                  className="w-5 h-5"
                  style={{ color: "var(--text-secondary)" }}
                />
              </button>
              <div className="text-center">
                <Eye
                  className="w-6 h-6 mx-auto mb-1"
                  style={{ color: "var(--accent-color)" }}
                />
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  Emotion Reading
                </p>
              </div>
              <div
                className="px-3 py-1 rounded-full text-sm font-bold"
                style={{
                  background: "var(--success-bg)",
                  color: "var(--success)",
                }}
              >
                {emotionScore}/{EMOTIONS.length}
              </div>
            </div>

            {emotionIdx >= EMOTIONS.length ? (
              /* Results */
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center"
              >
                <div
                  className="w-20 h-20 rounded-full mb-4 flex items-center justify-center"
                  style={{ background: "var(--success-bg)" }}
                >
                  <Trophy
                    className="w-10 h-10"
                    style={{ color: "var(--success)" }}
                  />
                </div>
                <h2
                  className="text-2xl font-bold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  {emotionScore >= 4
                    ? "Excellent!"
                    : emotionScore >= 3
                    ? "Good Job!"
                    : "Keep Practicing!"}
                </h2>
                <p
                  className="text-4xl font-bold mb-6"
                  style={{ color: "var(--accent-color)" }}
                >
                  {emotionScore}/{EMOTIONS.length}
                </p>
                <button
                  onClick={resetEmotion}
                  className="px-6 py-2.5 rounded-xl font-medium cursor-pointer"
                  style={{
                    background: "var(--gradient-primary)",
                    color: "white",
                  }}
                >
                  Try Again
                </button>
              </motion.div>
            ) : (
              /* Question */
              <div className="flex-1 flex flex-col">
                {/* Progress */}
                <div className="mb-4">
                  <div
                    className="flex justify-between text-xs mb-1"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    <span>
                      Question {emotionIdx + 1} of {EMOTIONS.length}
                    </span>
                  </div>
                  <div
                    className="h-1 rounded-full"
                    style={{ background: "var(--bg-tertiary)" }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: "var(--gradient-primary)" }}
                      animate={{
                        width: `${((emotionIdx + 1) / EMOTIONS.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Scenario */}
                <div
                  className="p-5 rounded-2xl mb-6"
                  style={{
                    background: "var(--gradient-accent)",
                    border: "1px solid var(--border-light)",
                  }}
                >
                  <p
                    className="text-xs uppercase tracking-wide mb-2"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Scenario
                  </p>
                  <p
                    className="text-base leading-relaxed"
                    style={{ color: "var(--text-primary)" }}
                  >
                    "{EMOTIONS[emotionIdx].context}"
                  </p>
                </div>

                {/* Question */}
                <p
                  className="text-center font-medium mb-4"
                  style={{ color: "var(--text-primary)" }}
                >
                  How is this person feeling?
                </p>

                {/* Options - 2x2 Grid */}
                <div className="grid grid-cols-2 gap-3 flex-1">
                  {EMOTIONS[emotionIdx].options.map((opt) => {
                    const isSelected = emotionChoice === opt;
                    const isCorrect = opt === EMOTIONS[emotionIdx].answer;
                    const showResult = emotionChoice !== null;
                    return (
                      <button
                        key={opt}
                        onClick={() => !showResult && handleEmotionPick(opt)}
                        disabled={showResult}
                        className="p-4 rounded-2xl text-center font-medium cursor-pointer transition-all"
                        style={{
                          background: showResult
                            ? isCorrect
                              ? "var(--success-bg)"
                              : isSelected
                              ? "var(--error-bg)"
                              : "var(--bg-tertiary)"
                            : "var(--bg-tertiary)",
                          border: `2px solid ${
                            showResult
                              ? isCorrect
                                ? "var(--success)"
                                : isSelected
                                ? "var(--error)"
                                : "transparent"
                              : isSelected
                              ? "var(--accent-color)"
                              : "transparent"
                          }`,
                          color: "var(--text-primary)",
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                {emotionChoice && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={nextEmotion}
                    className="mt-4 py-3 rounded-xl font-medium cursor-pointer flex items-center justify-center gap-2"
                    style={{
                      background: "var(--gradient-primary)",
                      color: "white",
                    }}
                  >
                    {emotionIdx < EMOTIONS.length - 1 ? (
                      <>
                        Next <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      "See Results"
                    )}
                  </motion.button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
