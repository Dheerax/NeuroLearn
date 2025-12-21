import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Eye,
  Send,
  Sparkles,
  Bot,
  Lightbulb,
  Loader2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Trophy,
  MessageSquare,
  Radio,
  X,
  Play,
  Zap,
  Star,
  Award,
  ChevronRight,
} from "lucide-react";
import { useGamification } from "../context/GamificationContext";
import geminiAI from "../services/geminiAI";

const SCENARIOS = [
  {
    id: "job-interview",
    title: "Job Interview",
    desc: "Ace your next interview",
    emoji: "💼",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  {
    id: "making-friends",
    title: "Making Friends",
    desc: "Connect with new people",
    emoji: "👋",
    gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
  },
  {
    id: "asking-help",
    title: "Asking for Help",
    desc: "Request assistance confidently",
    emoji: "🙋",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  },
  {
    id: "boundaries",
    title: "Setting Boundaries",
    desc: "Say no respectfully",
    emoji: "🛑",
    gradient: "linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)",
  },
  {
    id: "small-talk",
    title: "Small Talk",
    desc: "Master casual conversation",
    emoji: "💬",
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  },
  {
    id: "apologizing",
    title: "Apologizing",
    desc: "Make genuine apologies",
    emoji: "🙏",
    gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  },
];

const EMOTIONS = [
  {
    context: "Your friend just got promoted - smiling widely, talking fast.",
    answer: "Excited",
    options: ["Nervous", "Excited", "Confused", "Angry"],
  },
  {
    context: "Someone's pet is sick - speaking quietly, avoiding eye contact.",
    answer: "Sad",
    options: ["Sad", "Tired", "Bored", "Calm"],
  },
  {
    context: "Coworker promised time off but has to work - clenched jaw.",
    answer: "Angry",
    options: ["Surprised", "Anxious", "Angry", "Disappointed"],
  },
  {
    context: "About to give first presentation - fidgeting, checking notes.",
    answer: "Anxious",
    options: ["Excited", "Anxious", "Proud", "Bored"],
  },
  {
    context: "Got unexpected A on test - wide eyes, saying 'really?!'",
    answer: "Surprised",
    options: ["Confused", "Happy", "Surprised", "Relieved"],
  },
];

export default function CommunicationPage() {
  const { addXP, stats } = useGamification();
  const [mode, setMode] = useState("home");
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tips, setTips] = useState([]);
  const [conversationMode, setConversationMode] = useState("voice");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const [emotionIdx, setEmotionIdx] = useState(0);
  const [emotionChoice, setEmotionChoice] = useState(null);
  const [emotionScore, setEmotionScore] = useState(0);
  const [showEmotionResults, setShowEmotionResults] = useState(false);
  const [challenge, setChallenge] = useState({
    title: "Start a Conversation",
    description: "Say hi to someone new today",
    xpReward: 25,
  });
  const [challengeDone, setChallengeDone] = useState(false);
  const chatRef = useRef(null);
  const isListeningRef = useRef(false);

  // Keep ref in sync with state
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SR();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";
      let ft = "";

      recognitionRef.current.onresult = (e) => {
        // Stop TTS when user starts speaking
        if (speechSynthesis.speaking) {
          speechSynthesis.cancel();
          setIsSpeaking(false);
        }

        let it = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) ft += e.results[i][0].transcript + " ";
          else it += e.results[i][0].transcript;
        }
        setInput(ft + it);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        if (e.results[e.results.length - 1].isFinal && ft.trim()) {
          silenceTimerRef.current = setTimeout(() => {
            if (ft.trim()) {
              handleVoiceSend(ft.trim());
              ft = "";
              setInput("");
            }
          }, 1500);
        }
      };

      recognitionRef.current.onerror = (e) => {
        console.log("Speech recognition error:", e.error);
        if (e.error !== "no-speech") {
          setIsListening(false);
        }
      };

      recognitionRef.current.onend = () => {
        // Only auto-restart if still supposed to be listening and in practice mode
        if (
          isListeningRef.current &&
          conversationMode === "voice" &&
          mode === "practice"
        ) {
          setTimeout(() => {
            if (isListeningRef.current) {
              try {
                recognitionRef.current.start();
              } catch (e) {}
            }
          }, 100);
        }
      };
    }
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, [conversationMode, mode]);

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    const today = new Date().toDateString();
    if (localStorage.getItem("social_challenge_date") === today) {
      setChallengeDone(true);
      try {
        setChallenge(
          JSON.parse(localStorage.getItem("current_challenge") || "{}")
        );
      } catch (e) {}
    } else {
      geminiAI
        .getDailySocialChallenge("beginner")
        .then((c) => {
          setChallenge(c);
          localStorage.setItem("current_challenge", JSON.stringify(c));
        })
        .catch(() => {});
    }
  }, []);

  const speak = (text, cb) => {
    if (!voiceEnabled || !text) {
      cb?.();
      return;
    }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/[*#_`]/g, ""));
    u.rate = 0.95;
    const voices = speechSynthesis.getVoices();
    u.voice = voices.find((v) => v.name.includes("Google")) || voices[0];
    u.onstart = () => setIsSpeaking(true);
    u.onend = () => {
      setIsSpeaking(false);
      cb?.();
    };
    u.onerror = () => {
      setIsSpeaking(false);
      cb?.();
    };
    speechSynthesis.speak(u);
  };

  const toggleVoice = () => {
    if (!recognitionRef.current)
      return alert("Please use Chrome for voice features.");

    if (isListening) {
      // Stop listening
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    } else {
      // Start listening - first stop any TTS that's playing
      speechSynthesis.cancel();
      setIsSpeaking(false);
      setInput("");

      // Small delay to ensure TTS is stopped before starting recognition
      setTimeout(() => {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          // If already started, stop and restart
          try {
            recognitionRef.current.stop();
            setTimeout(() => {
              try {
                recognitionRef.current.start();
                setIsListening(true);
              } catch (e2) {}
            }, 100);
          } catch (e2) {}
        }
      }, 50);
    }
  };

  const handleVoiceSend = async (text) => {
    if (!text.trim() || isLoading) return;
    setMessages((p) => [...p, { role: "user", content: text }]);
    setIsLoading(true);
    if (recognitionRef.current) recognitionRef.current.stop();
    try {
      const r = await geminiAI.practiceConversation(
        selectedScenario.title,
        text,
        messages.filter((m) => m.role !== "system")
      );
      setMessages((p) => [...p, { role: "assistant", content: r.response }]);
      if (r.coachTip) setTips((p) => [...p, r.coachTip]);
      speak(r.response, () => {
        if (conversationMode === "voice" && mode === "practice")
          setTimeout(() => {
            try {
              recognitionRef.current?.start();
              setIsListening(true);
            } catch (e) {}
          }, 500);
      });
    } catch {
      setMessages((p) => [
        ...p,
        { role: "assistant", content: "Connection error. Try again!" },
      ]);
    }
    setIsLoading(false);
  };

  const sendText = async () => {
    if (!input.trim() || isLoading) return;
    const msg = input.trim();
    setInput("");
    setMessages((p) => [...p, { role: "user", content: msg }]);
    setIsLoading(true);
    try {
      const r = await geminiAI.practiceConversation(
        selectedScenario.title,
        msg,
        messages.filter((m) => m.role !== "system")
      );
      setMessages((p) => [...p, { role: "assistant", content: r.response }]);
      if (r.coachTip) setTips((p) => [...p, r.coachTip]);
      if (voiceEnabled) speak(r.response);
    } catch {
      setMessages((p) => [
        ...p,
        { role: "assistant", content: "Connection error. Try again!" },
      ]);
    }
    setIsLoading(false);
  };

  const startScenario = (s) => {
    setSelectedScenario(s);
    setMode("practice");
    const intro = `Let's practice ${s.title}. I'll play the other person - start whenever you're ready!`;
    setMessages([{ role: "system", content: intro }]);
    setTips([]);
    speak(intro, () => {
      if (conversationMode === "voice")
        setTimeout(() => {
          try {
            recognitionRef.current?.start();
            setIsListening(true);
          } catch (e) {}
        }, 500);
    });
  };

  const exitPractice = () => {
    setMode("home");
    setSelectedScenario(null);
    speechSynthesis.cancel();
    if (recognitionRef.current)
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    setIsListening(false);
  };
  const handleEmotionPick = (opt) => {
    setEmotionChoice(opt);
    if (opt === EMOTIONS[emotionIdx].answer) setEmotionScore((p) => p + 1);
  };
  const nextEmotion = () => {
    if (emotionIdx < EMOTIONS.length - 1) {
      setEmotionIdx((p) => p + 1);
      setEmotionChoice(null);
    } else {
      setShowEmotionResults(true);
      addXP(emotionScore * 15, "emotion_quiz");
    }
  };
  const resetEmotion = () => {
    setEmotionIdx(0);
    setEmotionChoice(null);
    setEmotionScore(0);
    setShowEmotionResults(false);
  };
  const markChallengeDone = () => {
    setChallengeDone(true);
    localStorage.setItem("social_challenge_date", new Date().toDateString());
    addXP(challenge?.xpReward || 25, "social_challenge");
  };

  if (mode === "practice" && selectedScenario) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col"
        style={{ background: "var(--bg-primary)" }}
      >
        <div
          className="shrink-0 p-3 flex items-center justify-between"
          style={{ borderBottom: "1px solid var(--border-light)" }}
        >
          <button
            onClick={exitPractice}
            className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
            style={{ background: "var(--bg-tertiary)" }}
          >
            <X className="w-5 h-5" style={{ color: "var(--text-secondary)" }} />
          </button>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
              style={{ background: selectedScenario.gradient }}
            >
              {selectedScenario.emoji}
            </div>
            <span
              className="font-medium text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              {selectedScenario.title}
            </span>
          </div>
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
            style={{ background: "var(--bg-tertiary)" }}
          >
            {voiceEnabled ? (
              <Volume2
                className="w-5 h-5"
                style={{ color: "var(--success)" }}
              />
            ) : (
              <VolumeX
                className="w-5 h-5"
                style={{ color: "var(--text-tertiary)" }}
              />
            )}
          </button>
        </div>
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
                  className="w-full p-4 rounded-xl text-center text-sm"
                  style={{
                    background: "var(--gradient-accent)",
                    color: "var(--text-primary)",
                  }}
                >
                  {m.content}
                </div>
              ) : m.role === "user" ? (
                <div
                  className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-br-sm text-sm"
                  style={{
                    background: "var(--gradient-primary)",
                    color: "white",
                  }}
                >
                  {m.content}
                </div>
              ) : (
                <div className="flex gap-2 max-w-[85%]">
                  <div
                    className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center"
                    style={{ background: selectedScenario.gradient }}
                  >
                    {isSpeaking ? (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 0.5 }}
                      >
                        <Volume2 className="w-4 h-4 text-white" />
                      </motion.div>
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
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
                style={{ background: selectedScenario.gradient }}
              >
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              </div>
            </div>
          )}
        </div>
        {tips.length > 0 && (
          <div
            className="shrink-0 mx-4 mb-2 p-3 rounded-xl"
            style={{
              background: "var(--warning-bg)",
              border: "1px solid var(--warning)",
            }}
          >
            <div className="flex items-start gap-2">
              <Lightbulb
                className="w-4 h-4 shrink-0 mt-0.5"
                style={{ color: "var(--warning)" }}
              />
              <p className="text-xs" style={{ color: "var(--text-primary)" }}>
                <strong>Coach:</strong> {tips[tips.length - 1]}
              </p>
            </div>
          </div>
        )}
        <div
          className="shrink-0 p-4"
          style={{ background: "var(--bg-secondary)" }}
        >
          {conversationMode === "voice" ? (
            <div className="flex items-center gap-4">
              <motion.button
                onClick={toggleVoice}
                className="w-14 h-14 rounded-full flex items-center justify-center cursor-pointer shrink-0"
                style={{
                  background: isListening
                    ? "var(--error)"
                    : selectedScenario.gradient,
                  boxShadow: isListening
                    ? "0 0 25px rgba(239,68,68,0.4)"
                    : "0 0 20px rgba(102,126,234,0.3)",
                }}
                animate={isListening ? { scale: [1, 1.08, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                {isListening ? (
                  <MicOff className="w-6 h-6 text-white" />
                ) : (
                  <Mic className="w-6 h-6 text-white" />
                )}
              </motion.button>
              <div className="flex-1">
                {isListening ? (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <motion.div
                        className="w-2 h-2 rounded-full"
                        style={{ background: "var(--error)" }}
                        animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                      />
                      <span
                        className="text-sm font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Listening...
                      </span>
                    </div>
                    {input && (
                      <p
                        className="text-xs truncate"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        "{input}"
                      </p>
                    )}
                  </div>
                ) : (
                  <p
                    className="text-sm"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Tap the mic to start speaking
                  </p>
                )}
              </div>
            </div>
          ) : (
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
                onKeyDown={(e) => e.key === "Enter" && sendText()}
                placeholder="Type your message..."
                className="flex-1 bg-transparent text-sm outline-none px-2"
                style={{ color: "var(--text-primary)" }}
              />
              <button
                onClick={sendText}
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer disabled:opacity-50"
                style={{ background: selectedScenario.gradient }}
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (mode === "emotion") {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col p-4"
        style={{ background: "var(--bg-primary)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              setMode("home");
              resetEmotion();
            }}
            className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
            style={{ background: "var(--bg-tertiary)" }}
          >
            <X className="w-5 h-5" style={{ color: "var(--text-secondary)" }} />
          </button>
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5" style={{ color: "var(--accent-color)" }} />
            <span
              className="font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              Emotion Reading
            </span>
          </div>
          <div
            className="px-3 py-1 rounded-full font-bold text-sm"
            style={{ background: "var(--success-bg)", color: "var(--success)" }}
          >
            {emotionScore}/{EMOTIONS.length}
          </div>
        </div>
        {showEmotionResults ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div
              className="w-24 h-24 rounded-full mb-4 flex items-center justify-center"
              style={{
                background:
                  emotionScore >= 4 ? "var(--success-bg)" : "var(--warning-bg)",
              }}
            >
              <Trophy
                className="w-12 h-12"
                style={{
                  color:
                    emotionScore >= 4 ? "var(--success)" : "var(--warning)",
                }}
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
              className="text-4xl font-bold mb-4"
              style={{ color: "var(--accent-color)" }}
            >
              {emotionScore}/{EMOTIONS.length}
            </p>
            <p
              className="text-sm mb-6"
              style={{ color: "var(--text-secondary)" }}
            >
              You earned +{emotionScore * 15} XP!
            </p>
            <button
              onClick={resetEmotion}
              className="px-6 py-3 rounded-xl font-medium cursor-pointer"
              style={{ background: "var(--gradient-primary)", color: "white" }}
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <div className="mb-4">
              <div
                className="text-xs mb-1"
                style={{ color: "var(--text-tertiary)" }}
              >
                Question {emotionIdx + 1} of {EMOTIONS.length}
              </div>
              <div
                className="h-2 rounded-full"
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
            <div
              className="p-5 rounded-xl mb-4"
              style={{
                background:
                  "linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)",
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
                className="text-sm leading-relaxed"
                style={{ color: "var(--text-primary)" }}
              >
                "{EMOTIONS[emotionIdx].context}"
              </p>
            </div>
            <p
              className="text-center font-medium mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              How is this person feeling?
            </p>
            <div className="grid grid-cols-2 gap-3 flex-1">
              {EMOTIONS[emotionIdx].options.map((opt) => {
                const isSelected = emotionChoice === opt,
                  isCorrect = opt === EMOTIONS[emotionIdx].answer,
                  showResult = emotionChoice !== null;
                return (
                  <button
                    key={opt}
                    onClick={() => !showResult && handleEmotionPick(opt)}
                    disabled={showResult}
                    className="p-4 rounded-xl text-center font-medium cursor-pointer"
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
            {emotionChoice && (
              <button
                onClick={nextEmotion}
                className="mt-4 py-3 rounded-xl font-medium cursor-pointer flex items-center justify-center gap-2"
                style={{
                  background: "var(--gradient-primary)",
                  color: "white",
                }}
              >
                {emotionIdx < EMOTIONS.length - 1
                  ? "Next Question"
                  : "See Results"}
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-full" style={{ background: "var(--bg-primary)" }}>
      {/* Hero Section */}
      <div
        className="relative overflow-hidden rounded-2xl mb-6"
        style={{
          background:
            "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
        }}
      >
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-white/20 blur-2xl" />
          <div className="absolute bottom-4 left-4 w-24 h-24 rounded-full bg-white/10 blur-xl" />
        </div>
        <div className="relative p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Social Skills Lab
                </h1>
                <p className="text-white/70 text-sm">
                  AI-powered practice & coaching
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur">
              <Zap className="w-4 h-4 text-yellow-300" />
              <span className="font-bold text-white text-sm">
                {stats?.totalXP || 0} XP
              </span>
            </div>
          </div>
          <div className="flex gap-2 p-1 rounded-xl bg-white/10 backdrop-blur">
            <button
              onClick={() => setConversationMode("voice")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all cursor-pointer ${
                conversationMode === "voice"
                  ? "bg-white text-purple-600 shadow-lg"
                  : "text-white/80 hover:bg-white/10"
              }`}
            >
              <Radio className="w-4 h-4" />
              <span className="font-medium text-sm">Voice Mode</span>
            </button>
            <button
              onClick={() => setConversationMode("text")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all cursor-pointer ${
                conversationMode === "text"
                  ? "bg-white text-purple-600 shadow-lg"
                  : "text-white/80 hover:bg-white/10"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="font-medium text-sm">Text Mode</span>
            </button>
          </div>
        </div>
      </div>

      {/* Daily Challenge */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-3">
          <h2
            className="font-semibold flex items-center gap-2"
            style={{ color: "var(--text-primary)" }}
          >
            <Star className="w-5 h-5 text-amber-500" />
            Today's Challenge
          </h2>
          {challengeDone && (
            <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-500 font-medium">
              ✓ Completed
            </span>
          )}
        </div>
        <div
          className="p-4 rounded-xl"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-light)",
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3
                className="font-semibold mb-1"
                style={{ color: "var(--text-primary)" }}
              >
                {challenge?.title}
              </h3>
              <p
                className="text-sm mb-3"
                style={{ color: "var(--text-secondary)" }}
              >
                {challenge?.description}
              </p>
              {!challengeDone ? (
                <button
                  onClick={markChallengeDone}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm cursor-pointer"
                  style={{
                    background: "var(--gradient-primary)",
                    color: "white",
                  }}
                >
                  <Trophy className="w-4 h-4" />
                  Complete (+{challenge?.xpReward || 25} XP)
                </button>
              ) : (
                <div className="flex items-center gap-2 text-green-500 text-sm font-medium">
                  <Award className="w-4 h-4" />+{challenge?.xpReward || 25} XP
                  Earned!
                </div>
              )}
            </div>
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
              style={{ background: "var(--gradient-accent)" }}
            >
              🎯
            </div>
          </div>
        </div>
      </motion.div>

      {/* Scenarios Grid */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <h2
          className="font-semibold mb-3 flex items-center gap-2"
          style={{ color: "var(--text-primary)" }}
        >
          <Play className="w-5 h-5" style={{ color: "var(--accent-color)" }} />
          Practice Scenarios
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {SCENARIOS.map((s, i) => (
            <motion.button
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              onClick={() => startScenario(s)}
              className="relative overflow-hidden rounded-xl p-4 text-left cursor-pointer group"
              style={{ background: s.gradient }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              <div className="relative z-10">
                <span className="text-3xl mb-2 block">{s.emoji}</span>
                <h3 className="font-semibold text-white text-sm mb-0.5">
                  {s.title}
                </h3>
                <p className="text-white/70 text-xs">{s.desc}</p>
                <div className="flex items-center gap-1 mt-2 text-white/60 text-xs">
                  {conversationMode === "voice" ? (
                    <Mic className="w-3 h-3" />
                  ) : (
                    <MessageSquare className="w-3 h-3" />
                  )}
                  <span>{conversationMode === "voice" ? "Voice" : "Text"}</span>
                  <ChevronRight className="w-3 h-3 ml-auto group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Emotion Quiz Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-6"
      >
        <button
          onClick={() => setMode("emotion")}
          className="w-full p-4 rounded-xl flex items-center gap-4 cursor-pointer group transition-all hover:shadow-lg"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-light)",
          }}
        >
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            }}
          >
            <Eye className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 text-left">
            <h3
              className="font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Read Emotions Quiz
            </h3>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Learn to recognize feelings in others
            </p>
          </div>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center group-hover:bg-white/10 transition-colors"
            style={{ background: "var(--bg-tertiary)" }}
          >
            <ChevronRight
              className="w-5 h-5 group-hover:translate-x-1 transition-transform"
              style={{ color: "var(--text-secondary)" }}
            />
          </div>
        </button>
      </motion.div>

      {/* Quick Tips */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h2
          className="font-semibold mb-3 flex items-center gap-2"
          style={{ color: "var(--text-primary)" }}
        >
          <Lightbulb className="w-5 h-5 text-amber-500" />
          Quick Tips
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {[
            { icon: "👁️", tip: "Make eye contact for 3-5 seconds" },
            { icon: "🔄", tip: "Mirror the other person's energy" },
            { icon: "👂", tip: "Nod to show you're listening" },
          ].map((t, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border-light)",
              }}
            >
              <span className="text-xl">{t.icon}</span>
              <span
                className="text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                {t.tip}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
