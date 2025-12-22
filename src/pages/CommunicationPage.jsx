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
  Plus,
  Briefcase,
  UserPlus,
  HelpCircle,
  HandMetal,
  MessageCircle,
  HeartHandshake,
  Trash2,
  Palette,
  Check,
  BookOpen,
} from "lucide-react";
import { useGamification } from "../context/GamificationContext";
import { useAuth } from "../context/AuthContext";
import geminiAI from "../services/geminiAI";

// Preset scenarios with lucide icons
const SCENARIOS = [
  {
    id: "job-interview",
    title: "Job Interview",
    desc: "Ace your next interview",
    icon: "Briefcase",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  {
    id: "making-friends",
    title: "Making Friends",
    desc: "Connect with new people",
    icon: "UserPlus",
    gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
  },
  {
    id: "asking-help",
    title: "Asking for Help",
    desc: "Request assistance confidently",
    icon: "HelpCircle",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  },
  {
    id: "boundaries",
    title: "Setting Boundaries",
    desc: "Say no respectfully",
    icon: "HandMetal",
    gradient: "linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)",
  },
  {
    id: "small-talk",
    title: "Small Talk",
    desc: "Master casual conversation",
    icon: "MessageCircle",
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  },
  {
    id: "apologizing",
    title: "Apologizing",
    desc: "Make genuine apologies",
    icon: "HeartHandshake",
    gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  },
];

// Icon map for dynamic rendering
const ICON_MAP = {
  Briefcase,
  UserPlus,
  HelpCircle,
  HandMetal,
  MessageCircle,
  HeartHandshake,
  Users,
  Star,
  Sparkles,
  BookOpen,
  Play,
  Mic,
  Eye,
};

// Gradient options for custom scenarios
const GRADIENT_OPTIONS = [
  {
    id: "purple",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  {
    id: "green",
    gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
  },
  { id: "pink", gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
  {
    id: "orange",
    gradient: "linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)",
  },
  { id: "blue", gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
  {
    id: "yellow",
    gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  },
  { id: "teal", gradient: "linear-gradient(135deg, #2af598 0%, #009efd 100%)" },
  { id: "red", gradient: "linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)" },
];

// Icon options for custom scenarios
const ICON_OPTIONS = [
  "MessageCircle",
  "Users",
  "Star",
  "Sparkles",
  "BookOpen",
  "Play",
  "Mic",
  "Eye",
  "Briefcase",
  "UserPlus",
  "HelpCircle",
  "HeartHandshake",
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
  const { token } = useAuth();
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

  // Custom scenarios state
  const [customScenarios, setCustomScenarios] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newScenario, setNewScenario] = useState({
    title: "",
    desc: "",
    icon: "MessageCircle",
    gradient: GRADIENT_OPTIONS[0].gradient,
  });
  const [hoveredScenario, setHoveredScenario] = useState(null);

  // Fetch custom scenarios on mount
  useEffect(() => {
    fetchCustomScenarios();
  }, []);

  const fetchCustomScenarios = async () => {
    try {
      const res = await fetch("/api/users/me/scenarios", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setCustomScenarios(data);
      }
    } catch (error) {
      console.error("Failed to fetch scenarios:", error);
    }
  };

  const createScenario = async () => {
    if (!newScenario.title.trim()) return;

    try {
      const res = await fetch("/api/users/me/scenarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(newScenario),
      });

      if (res.ok) {
        const created = await res.json();
        setCustomScenarios((prev) => [...prev, created]);
        setShowCreateModal(false);
        setNewScenario({
          title: "",
          desc: "",
          icon: "MessageCircle",
          gradient: GRADIENT_OPTIONS[0].gradient,
        });
      }
    } catch (error) {
      console.error("Failed to create scenario:", error);
    }
  };

  const deleteScenario = async (id) => {
    try {
      const res = await fetch(`/api/users/me/scenarios/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        setCustomScenarios((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete scenario:", error);
    }
  };

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
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    } else {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      setInput("");

      setTimeout(() => {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
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

  // Helper to get Icon component
  const getIcon = (iconName) => ICON_MAP[iconName] || MessageCircle;

  // Practice mode view (unchanged)
  if (mode === "practice" && selectedScenario) {
    const ScenarioIcon = getIcon(selectedScenario.icon);
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
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: selectedScenario.gradient }}
            >
              <ScenarioIcon className="w-4 h-4 text-white" />
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

  // Emotion quiz view (unchanged)
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

  // HOME VIEW - NEW CIRCULAR LAYOUT
  return (
    <div
      className="min-h-full pb-8"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1
              className="text-xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Social Skills Lab
            </h1>
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
              Practice with AI scenarios
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Mode Toggle */}
          <div
            className="flex gap-1 p-1 rounded-xl"
            style={{ background: "var(--bg-tertiary)" }}
          >
            <button
              onClick={() => setConversationMode("voice")}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sm font-medium transition-all ${
                conversationMode === "voice" ? "bg-white shadow-sm" : ""
              }`}
              style={{
                color:
                  conversationMode === "voice"
                    ? "var(--primary-500)"
                    : "var(--text-tertiary)",
              }}
            >
              <Radio className="w-4 h-4" />
              Voice
            </button>
            <button
              onClick={() => setConversationMode("text")}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sm font-medium transition-all ${
                conversationMode === "text" ? "bg-white shadow-sm" : ""
              }`}
              style={{
                color:
                  conversationMode === "text"
                    ? "var(--primary-500)"
                    : "var(--text-tertiary)",
              }}
            >
              <MessageSquare className="w-4 h-4" />
              Text
            </button>
          </div>
        </div>
      </div>

      {/* CIRCULAR HUB LAYOUT */}
      <div
        className="relative flex items-center justify-center mb-8"
        style={{ height: "420px" }}
      >
        {/* Central Hub - Create Custom Scenario */}
        <motion.button
          onClick={() => setShowCreateModal(true)}
          className="absolute z-10 w-32 h-32 rounded-full flex flex-col items-center justify-center cursor-pointer"
          style={{
            background:
              "linear-gradient(135deg, var(--primary-500) 0%, var(--accent-color) 100%)",
            boxShadow: "0 8px 32px rgba(102, 126, 234, 0.4)",
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-8 h-8 text-white mb-1" />
          <span className="text-white text-xs font-medium text-center px-2">
            Create Scenario
          </span>
        </motion.button>

        {/* Orbiting Scenarios */}
        {SCENARIOS.map((scenario, index) => {
          const angle = (index * 60 - 90) * (Math.PI / 180); // Distribute evenly in circle, starting from top
          const radius = 150; // Distance from center
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const IconComponent = getIcon(scenario.icon);
          const isHovered = hoveredScenario === scenario.id;

          return (
            <motion.button
              key={scenario.id}
              onClick={() => startScenario(scenario)}
              onMouseEnter={() => setHoveredScenario(scenario.id)}
              onMouseLeave={() => setHoveredScenario(null)}
              className="absolute cursor-pointer"
              style={{
                left: `calc(50% + ${x}px - 48px)`,
                top: `calc(50% + ${y}px - 48px)`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.15, zIndex: 20 }}
              whileTap={{ scale: 0.95 }}
            >
              <div
                className="w-24 h-24 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden"
                style={{
                  background: scenario.gradient,
                  boxShadow: isHovered
                    ? "0 12px 40px rgba(0,0,0,0.3)"
                    : "0 4px 16px rgba(0,0,0,0.15)",
                }}
              >
                <IconComponent className="w-8 h-8 text-white mb-1" />
                <span className="text-white text-[10px] font-medium text-center px-1 leading-tight">
                  {scenario.title}
                </span>
              </div>
            </motion.button>
          );
        })}

        {/* Connecting lines (decorative) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 0 }}
        >
          <circle
            cx="50%"
            cy="50%"
            r="150"
            fill="none"
            stroke="var(--border-light)"
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity="0.5"
          />
        </svg>
      </div>

      {/* Saved Custom Scenarios */}
      {customScenarios.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6"
        >
          <h2
            className="font-semibold mb-3 flex items-center gap-2"
            style={{ color: "var(--text-primary)" }}
          >
            <Sparkles
              className="w-5 h-5"
              style={{ color: "var(--accent-color)" }}
            />
            Your Scenarios
          </h2>
          <div
            className="flex gap-3 overflow-x-auto pb-2"
            style={{ scrollbarWidth: "none" }}
          >
            {customScenarios.map((scenario) => {
              const IconComponent = getIcon(scenario.icon);
              return (
                <motion.div
                  key={scenario.id}
                  className="relative shrink-0 group"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <button
                    onClick={() => startScenario(scenario)}
                    className="w-28 h-28 rounded-xl flex flex-col items-center justify-center cursor-pointer overflow-hidden"
                    style={{ background: scenario.gradient }}
                  >
                    <IconComponent className="w-6 h-6 text-white mb-1" />
                    <span className="text-white text-xs font-medium text-center px-2 line-clamp-2">
                      {scenario.title}
                    </span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteScenario(scenario.id);
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: "var(--error)", color: "white" }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

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

      {/* Emotion Quiz Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
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
        transition={{ delay: 0.3 }}
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

      {/* Create Scenario Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.6)" }}
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl p-6"
              style={{ background: "var(--surface)" }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2
                  className="text-xl font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Create Scenario
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "var(--bg-tertiary)" }}
                >
                  <X
                    className="w-4 h-4"
                    style={{ color: "var(--text-secondary)" }}
                  />
                </button>
              </div>

              {/* Preview */}
              <div className="flex justify-center mb-6">
                <div
                  className="w-24 h-24 rounded-2xl flex flex-col items-center justify-center"
                  style={{ background: newScenario.gradient }}
                >
                  {(() => {
                    const PreviewIcon = getIcon(newScenario.icon);
                    return <PreviewIcon className="w-8 h-8 text-white mb-1" />;
                  })()}
                  <span className="text-white text-[10px] font-medium text-center px-1 line-clamp-2">
                    {newScenario.title || "Title"}
                  </span>
                </div>
              </div>

              {/* Title Input */}
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Title
                </label>
                <input
                  type="text"
                  value={newScenario.title}
                  onChange={(e) =>
                    setNewScenario({ ...newScenario, title: e.target.value })
                  }
                  placeholder="e.g., First Date"
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={{
                    background: "var(--bg-tertiary)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-light)",
                  }}
                />
              </div>

              {/* Description Input */}
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={newScenario.desc}
                  onChange={(e) =>
                    setNewScenario({ ...newScenario, desc: e.target.value })
                  }
                  placeholder="e.g., Practice conversation starters"
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={{
                    background: "var(--bg-tertiary)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-light)",
                  }}
                />
              </div>

              {/* Icon Picker */}
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Icon
                </label>
                <div className="flex gap-2 flex-wrap">
                  {ICON_OPTIONS.map((iconName) => {
                    const IconComp = getIcon(iconName);
                    const isSelected = newScenario.icon === iconName;
                    return (
                      <button
                        key={iconName}
                        onClick={() =>
                          setNewScenario({ ...newScenario, icon: iconName })
                        }
                        className="w-10 h-10 rounded-lg flex items-center justify-center transition-all"
                        style={{
                          background: isSelected
                            ? "var(--primary-500)"
                            : "var(--bg-tertiary)",
                          border: isSelected
                            ? "none"
                            : "1px solid var(--border-light)",
                        }}
                      >
                        <IconComp
                          className="w-5 h-5"
                          style={{
                            color: isSelected
                              ? "white"
                              : "var(--text-secondary)",
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Picker */}
              <div className="mb-6">
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Color
                </label>
                <div className="flex gap-2">
                  {GRADIENT_OPTIONS.map((opt) => {
                    const isSelected = newScenario.gradient === opt.gradient;
                    return (
                      <button
                        key={opt.id}
                        onClick={() =>
                          setNewScenario({
                            ...newScenario,
                            gradient: opt.gradient,
                          })
                        }
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: opt.gradient }}
                      >
                        {isSelected && <Check className="w-5 h-5 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Create Button */}
              <button
                onClick={createScenario}
                disabled={!newScenario.title.trim()}
                className="w-full py-3 rounded-xl font-semibold disabled:opacity-50 transition-all"
                style={{
                  background: "var(--gradient-primary)",
                  color: "white",
                }}
              >
                Create Scenario
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
