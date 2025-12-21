import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Sparkles,
  Layers,
  Target,
  Send,
  ArrowRight,
  Volume2,
  VolumeX,
  Copy,
  Check,
  BookOpen,
  ChevronDown,
  MessageCircle,
  ListChecks,
  Loader2,
  Trash2,
} from "lucide-react";
import { useGamification } from "../context/GamificationContext";
import geminiAI from "../services/geminiAI";
import ReactMarkdown from "react-markdown";

// Markdown renderer component
const MarkdownRenderer = ({ content }) => {
  return (
    <ReactMarkdown
      components={{
        h1: ({ children }) => (
          <h1
            className="text-xl font-bold mt-4 mb-2"
            style={{ color: "var(--accent-color, var(--primary-500))" }}
          >
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2
            className="text-lg font-bold mt-4 mb-2"
            style={{ color: "var(--accent-color, var(--primary-500))" }}
          >
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3
            className="text-base font-semibold mt-3 mb-1"
            style={{ color: "var(--text-primary)" }}
          >
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p
            className="mb-2 leading-relaxed text-sm"
            style={{ color: "var(--text-primary)" }}
          >
            {children}
          </p>
        ),
        ul: ({ children }) => (
          <ul
            className="list-disc list-inside mb-3 space-y-1 ml-2 text-sm"
            style={{ color: "var(--text-primary)" }}
          >
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol
            className="list-decimal list-inside mb-3 space-y-1 ml-2 text-sm"
            style={{ color: "var(--text-primary)" }}
          >
            {children}
          </ol>
        ),
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        strong: ({ children }) => (
          <strong
            className="font-bold"
            style={{ color: "var(--accent-color, var(--primary-400))" }}
          >
            {children}
          </strong>
        ),
        em: ({ children }) => (
          <em className="italic" style={{ color: "var(--text-secondary)" }}>
            {children}
          </em>
        ),
        code: ({ children, inline }) =>
          inline ? (
            <code
              className="px-1 py-0.5 rounded text-xs"
              style={{
                background: "var(--bg-tertiary)",
                color: "var(--accent-color, var(--primary-400))",
              }}
            >
              {children}
            </code>
          ) : (
            <code
              className="block p-3 rounded-lg text-xs overflow-x-auto my-2"
              style={{
                background: "var(--bg-primary)",
                color: "var(--text-primary)",
              }}
            >
              {children}
            </code>
          ),
        pre: ({ children }) => (
          <pre className="rounded-lg overflow-hidden my-2">{children}</pre>
        ),
        blockquote: ({ children }) => (
          <blockquote
            className="border-l-3 pl-3 my-3 italic text-sm"
            style={{
              borderColor: "var(--accent-color, var(--primary-500))",
              color: "var(--text-secondary)",
            }}
          >
            {children}
          </blockquote>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto my-3">
            <table
              className="w-full border-collapse text-sm rounded-lg overflow-hidden"
              style={{ background: "var(--bg-tertiary)" }}
            >
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead style={{ background: "var(--surface-active)" }}>
            {children}
          </thead>
        ),
        th: ({ children }) => (
          <th
            className="px-3 py-2 text-left text-xs font-semibold"
            style={{
              color: "var(--text-primary)",
              borderBottom: "1px solid var(--border-medium)",
            }}
          >
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td
            className="px-3 py-2 text-xs"
            style={{
              color: "var(--text-primary)",
              borderBottom: "1px solid var(--border-light)",
            }}
          >
            {children}
          </td>
        ),
        hr: () => (
          <hr className="my-4" style={{ borderColor: "var(--border-light)" }} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

// Response depth options
const DEPTH_OPTIONS = [
  { id: "minimal", label: "Quick", icon: "⚡", description: "Brief overview" },
  { id: "medium", label: "Balanced", icon: "📚", description: "Good detail" },
  {
    id: "extensive",
    label: "Deep Dive",
    icon: "🔬",
    description: "Full breakdown",
  },
];

export default function LearningPage() {
  const { stats, addXP } = useGamification();

  // States
  const [activeTab, setActiveTab] = useState("explore");
  const [topic, setTopic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [responseDepth, setResponseDepth] = useState("medium");
  const [showDepthDropdown, setShowDepthDropdown] = useState(false);

  // Chat states
  const [messages, setMessages] = useState([]);
  const [conversationHistory, setConversationHistory] = useState([]);

  // Flashcard states
  const [flashcards, setFlashcards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quiz states
  const [quiz, setQuiz] = useState([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizTopic, setQuizTopic] = useState("");

  // UI states
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  const inputRef = useRef(null);
  const chatEndRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDepthDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDepthPrompt = (depth) => {
    switch (depth) {
      case "minimal":
        return "Give a BRIEF explanation in 3-4 sentences. Essential facts only.";
      case "medium":
        return "Give a balanced explanation with key points, one analogy, and one example.";
      case "extensive":
        return "Give a COMPREHENSIVE deep-dive with:\n- Detailed key points with headers\n- Multiple examples\n- Tables where helpful\n- Real-world applications\n- Step-by-step breakdowns";
      default:
        return "";
    }
  };

  const handleSendMessage = async () => {
    if (!topic.trim() || isLoading) return;

    const userMessage = topic.trim();
    setTopic("");
    setIsLoading(true);

    const newUserMessage = { role: "user", content: userMessage };
    setMessages((prev) => [...prev, newUserMessage]);

    try {
      const depthInstruction = getDepthPrompt(responseDepth);
      const fullPrompt = `${depthInstruction}\n\nUser question: ${userMessage}`;

      const response = await geminiAI.chat(
        fullPrompt,
        "learning",
        conversationHistory
      );

      const aiMessage = {
        role: "assistant",
        content: response.message,
        topic: userMessage,
        depth: responseDepth,
      };
      setMessages((prev) => [...prev, aiMessage]);
      setConversationHistory((prev) => [
        ...prev,
        newUserMessage,
        { role: "assistant", content: response.message },
      ]);
      addXP(15, "topic_explored");
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Oops! Something went wrong. Please try again. 💙",
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQuizFromTopic = async (topicToQuiz) => {
    setActiveTab("quiz");
    setIsLoading(true);
    setQuiz([]);
    setQuizIndex(0);
    setQuizScore(0);
    setSelectedAnswer(null);
    setQuizTopic(topicToQuiz);

    try {
      const questions = await geminiAI.generateQuiz(topicToQuiz);
      setQuiz(questions);
      addXP(25, "quiz_started");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateFlashcards = async (topicForCards) => {
    const t = topicForCards || topic;
    if (!t.trim() || isLoading) return;
    setActiveTab("flashcards");
    setIsLoading(true);
    setFlashcards([]);
    setCurrentCardIndex(0);
    setIsFlipped(false);

    try {
      const cards = await geminiAI.generateFlashcards(t);
      setFlashcards(cards);
      addXP(20, "flashcards_generated");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = (text) => {
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text.replace(/[#*_`]/g, ""));
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearChat = () => {
    setMessages([]);
    setConversationHistory([]);
  };

  const tabs = [
    { id: "explore", label: "Chat", icon: Brain },
    { id: "flashcards", label: "Cards", icon: Layers },
    { id: "quiz", label: "Quiz", icon: Target },
  ];

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Animated Background Orbs - Theme Based */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-[-15%] right-[-5%] w-[500px] h-[500px] rounded-full blur-3xl"
          style={{
            background:
              "var(--gradient-orb-1, radial-gradient(circle, rgba(93,156,236,0.15) 0%, transparent 70%))",
          }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full blur-3xl"
          style={{
            background:
              "var(--gradient-orb-2, radial-gradient(circle, rgba(58,123,213,0.12) 0%, transparent 70%))",
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      {/* Compact Header */}
      <div className="relative z-10 shrink-0 px-4 pt-3 pb-2">
        <div className="flex items-center justify-between">
          {/* Left: Title */}
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Brain className="w-4 h-4 text-white" />
            </div>
            <h1
              className="text-lg font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Learning Hub
            </h1>
          </div>

          {/* Center: Tabs */}
          <div
            className="flex p-0.5 rounded-full"
            style={{
              background: "var(--bg-tertiary)",
              border: "1px solid var(--border-light)",
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative px-4 py-1.5 rounded-full flex items-center gap-1.5 text-sm transition-all cursor-pointer"
                style={{
                  color:
                    activeTab === tab.id ? "white" : "var(--text-secondary)",
                  background:
                    activeTab === tab.id
                      ? "var(--gradient-primary)"
                      : "transparent",
                }}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Right: XP */}
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full"
            style={{ background: "var(--bg-tertiary)" }}
          >
            <Sparkles
              className="w-3.5 h-3.5"
              style={{ color: "var(--accent-color, var(--primary-500))" }}
            />
            <span
              className="text-sm font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {stats?.totalXP || 0} XP
            </span>
          </div>
        </div>
      </div>

      {/* Main Content - Full Height */}
      <div className="relative z-10 flex-1 flex flex-col overflow-hidden px-4">
        <AnimatePresence mode="wait">
          {/* EXPLORE TAB - Chat Interface */}
          {activeTab === "explore" && (
            <motion.div
              key="explore"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              {/* Chat Messages - Scrollable */}
              <div className="flex-1 overflow-y-auto py-3 space-y-3">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center">
                    <div
                      className="w-16 h-16 rounded-2xl mb-4 flex items-center justify-center"
                      style={{
                        background:
                          "var(--gradient-accent, rgba(93,156,236,0.2))",
                      }}
                    >
                      <MessageCircle
                        className="w-8 h-8"
                        style={{
                          color: "var(--accent-color, var(--primary-500))",
                        }}
                      />
                    </div>
                    <h3
                      className="text-lg font-semibold mb-1"
                      style={{ color: "var(--text-primary)" }}
                    >
                      What do you want to learn?
                    </h3>
                    <p
                      className="text-sm mb-4"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Ask anything - I'll explain it your way
                    </p>

                    {/* Quick suggestions */}
                    <div className="flex flex-wrap gap-2 justify-center max-w-md">
                      {[
                        "What is JavaScript?",
                        "Explain Photosynthesis",
                        "ADHD learning tips",
                        "Python basics",
                      ].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => setTopic(suggestion)}
                          className="px-3 py-1.5 rounded-full text-xs cursor-pointer transition-all"
                          style={{
                            background: "var(--bg-tertiary)",
                            color: "var(--text-secondary)",
                            border: "1px solid var(--border-light)",
                          }}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${
                          msg.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        {msg.role === "user" ? (
                          <div
                            className="max-w-[75%] px-3 py-2 rounded-2xl rounded-br-sm text-sm"
                            style={{
                              background: "var(--gradient-primary)",
                              color: "white",
                            }}
                          >
                            {msg.content}
                          </div>
                        ) : (
                          <div
                            className="max-w-[90%] rounded-2xl rounded-bl-sm overflow-hidden"
                            style={{
                              background: "var(--surface)",
                              border: "1px solid var(--border-light)",
                            }}
                          >
                            {/* Header */}
                            <div
                              className="flex items-center justify-between px-3 py-2"
                              style={{
                                borderBottom: "1px solid var(--border-light)",
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <Sparkles
                                  className="w-4 h-4"
                                  style={{
                                    color:
                                      "var(--accent-color, var(--primary-500))",
                                  }}
                                />
                                <span
                                  className="text-xs font-medium"
                                  style={{ color: "var(--text-primary)" }}
                                >
                                  AI Tutor
                                </span>
                                {msg.depth && (
                                  <span
                                    className="text-xs px-1.5 py-0.5 rounded"
                                    style={{
                                      background: "var(--bg-tertiary)",
                                      color: "var(--text-tertiary)",
                                    }}
                                  >
                                    {
                                      DEPTH_OPTIONS.find(
                                        (d) => d.id === msg.depth
                                      )?.icon
                                    }
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => copyText(msg.content)}
                                  className="p-1 rounded cursor-pointer hover:bg-white/10"
                                >
                                  {copied ? (
                                    <Check
                                      className="w-3 h-3"
                                      style={{ color: "var(--success)" }}
                                    />
                                  ) : (
                                    <Copy
                                      className="w-3 h-3"
                                      style={{ color: "var(--text-tertiary)" }}
                                    />
                                  )}
                                </button>
                                <button
                                  onClick={() => speakText(msg.content)}
                                  className="p-1 rounded cursor-pointer hover:bg-white/10"
                                >
                                  {isSpeaking ? (
                                    <VolumeX
                                      className="w-3 h-3"
                                      style={{ color: "var(--accent-color)" }}
                                    />
                                  ) : (
                                    <Volume2
                                      className="w-3 h-3"
                                      style={{ color: "var(--text-tertiary)" }}
                                    />
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Content */}
                            <div className="px-3 py-2 max-h-[50vh] overflow-y-auto">
                              <MarkdownRenderer content={msg.content} />
                            </div>

                            {/* Action buttons */}
                            {msg.topic && !msg.isError && (
                              <div
                                className="px-3 py-2 flex gap-2"
                                style={{
                                  borderTop: "1px solid var(--border-light)",
                                }}
                              >
                                <button
                                  onClick={() =>
                                    handleGenerateQuizFromTopic(msg.topic)
                                  }
                                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs cursor-pointer"
                                  style={{
                                    background: "var(--success-bg)",
                                    color: "var(--success)",
                                    border: "1px solid rgba(16,185,129,0.2)",
                                  }}
                                >
                                  <ListChecks className="w-3.5 h-3.5" />
                                  Quiz
                                </button>
                                <button
                                  onClick={() =>
                                    handleGenerateFlashcards(msg.topic)
                                  }
                                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs cursor-pointer"
                                  style={{
                                    background: "var(--info-bg)",
                                    color: "var(--info)",
                                    border: "1px solid rgba(59,130,246,0.2)",
                                  }}
                                >
                                  <Layers className="w-3.5 h-3.5" />
                                  Cards
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    ))}

                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                      >
                        <div
                          className="px-3 py-2 rounded-2xl flex items-center gap-2"
                          style={{
                            background: "var(--surface)",
                            border: "1px solid var(--border-light)",
                          }}
                        >
                          <Loader2
                            className="w-4 h-4 animate-spin"
                            style={{ color: "var(--accent-color)" }}
                          />
                          <span
                            className="text-sm"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            Thinking...
                          </span>
                        </div>
                      </motion.div>
                    )}

                    <div ref={chatEndRef} />
                  </>
                )}
              </div>

              {/* Input Area - Fixed at Bottom */}
              <div className="shrink-0 pb-4 pt-2">
                {messages.length > 0 && (
                  <div className="flex justify-end mb-2">
                    <button
                      onClick={clearChat}
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded cursor-pointer"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      <Trash2 className="w-3 h-3" /> Clear
                    </button>
                  </div>
                )}

                <div
                  className="flex items-center gap-2 p-2 rounded-xl"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border-medium)",
                  }}
                >
                  {/* Depth Selector */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setShowDepthDropdown(!showDepthDropdown)}
                      className="flex items-center gap-1 px-2 py-1.5 rounded-lg cursor-pointer"
                      style={{
                        background: "var(--bg-tertiary)",
                        border: "1px solid var(--border-light)",
                      }}
                    >
                      <span className="text-sm">
                        {
                          DEPTH_OPTIONS.find((d) => d.id === responseDepth)
                            ?.icon
                        }
                      </span>
                      <ChevronDown
                        className="w-3 h-3"
                        style={{ color: "var(--text-tertiary)" }}
                      />
                    </button>

                    <AnimatePresence>
                      {showDepthDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="absolute bottom-full left-0 mb-2 w-40 rounded-lg overflow-hidden z-50"
                          style={{
                            background: "var(--bg-elevated)",
                            border: "1px solid var(--border-medium)",
                            boxShadow: "var(--shadow-lg)",
                          }}
                        >
                          {DEPTH_OPTIONS.map((option) => (
                            <button
                              key={option.id}
                              onClick={() => {
                                setResponseDepth(option.id);
                                setShowDepthDropdown(false);
                              }}
                              className="w-full px-3 py-2 flex items-center gap-2 cursor-pointer text-left"
                              style={{
                                background:
                                  responseDepth === option.id
                                    ? "var(--bg-tertiary)"
                                    : "transparent",
                              }}
                            >
                              <span>{option.icon}</span>
                              <div>
                                <p
                                  className="text-xs font-medium"
                                  style={{ color: "var(--text-primary)" }}
                                >
                                  {option.label}
                                </p>
                                <p
                                  className="text-xs"
                                  style={{ color: "var(--text-tertiary)" }}
                                >
                                  {option.description}
                                </p>
                              </div>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Input */}
                  <input
                    ref={inputRef}
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && !isLoading && handleSendMessage()
                    }
                    placeholder="Ask anything..."
                    className="flex-1 bg-transparent text-sm outline-none"
                    style={{ color: "var(--text-primary)" }}
                    disabled={isLoading}
                  />

                  {/* Send Button */}
                  <button
                    onClick={handleSendMessage}
                    disabled={!topic.trim() || isLoading}
                    className="p-2 rounded-lg cursor-pointer disabled:opacity-50"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 text-white" />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* FLASHCARDS TAB */}
          {activeTab === "flashcards" && (
            <motion.div
              key="flashcards"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col py-4"
            >
              {/* Topic Input */}
              <div
                className="flex items-center gap-2 p-2 rounded-xl mb-4"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border-medium)",
                }}
              >
                <Layers className="w-4 h-4" style={{ color: "var(--info)" }} />
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleGenerateFlashcards()
                  }
                  placeholder="Topic for flashcards..."
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: "var(--text-primary)" }}
                />
                <button
                  onClick={() => handleGenerateFlashcards()}
                  disabled={!topic.trim() || isLoading}
                  className="px-3 py-1.5 rounded-lg text-sm cursor-pointer disabled:opacity-50"
                  style={{
                    background: "var(--gradient-primary)",
                    color: "white",
                  }}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Generate"
                  )}
                </button>
              </div>

              {flashcards.length > 0 ? (
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-3">
                    <span
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Card {currentCardIndex + 1}/{flashcards.length}
                    </span>
                    <div className="flex gap-1">
                      {flashcards.map((_, i) => (
                        <div
                          key={i}
                          className="w-2 h-2 rounded-full"
                          style={{
                            background:
                              i === currentCardIndex
                                ? "var(--accent-color)"
                                : i < currentCardIndex
                                ? "var(--success)"
                                : "var(--border-medium)",
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div
                    className="flex-1 flex items-center justify-center cursor-pointer"
                    onClick={() => setIsFlipped(!isFlipped)}
                    style={{ perspective: "1000px" }}
                  >
                    <motion.div
                      className="w-full max-w-md aspect-[4/3] rounded-2xl p-6 flex flex-col items-center justify-center text-center"
                      animate={{ rotateY: isFlipped ? 180 : 0 }}
                      transition={{ duration: 0.5 }}
                      style={{
                        transformStyle: "preserve-3d",
                        background: isFlipped
                          ? "var(--success-bg)"
                          : "var(--gradient-accent)",
                        border: `1px solid ${
                          isFlipped ? "var(--success)" : "var(--border-medium)"
                        }`,
                      }}
                    >
                      <div
                        style={{ backfaceVisibility: "hidden" }}
                        className={
                          isFlipped ? "hidden" : "flex flex-col items-center"
                        }
                      >
                        <span
                          className="text-xs uppercase mb-3"
                          style={{ color: "var(--text-tertiary)" }}
                        >
                          Question
                        </span>
                        <h3
                          className="text-lg font-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {flashcards[currentCardIndex]?.front}
                        </h3>
                        {flashcards[currentCardIndex]?.hint && (
                          <p
                            className="mt-3 text-xs px-3 py-1 rounded-full"
                            style={{
                              background: "var(--warning-bg)",
                              color: "var(--warning)",
                            }}
                          >
                            💡 {flashcards[currentCardIndex]?.hint}
                          </p>
                        )}
                        <p
                          className="mt-4 text-xs"
                          style={{ color: "var(--text-tertiary)" }}
                        >
                          Click to reveal
                        </p>
                      </div>
                      <div
                        style={{
                          backfaceVisibility: "hidden",
                          transform: "rotateY(180deg)",
                        }}
                        className={
                          !isFlipped ? "hidden" : "flex flex-col items-center"
                        }
                      >
                        <span
                          className="text-xs uppercase mb-3"
                          style={{ color: "var(--text-tertiary)" }}
                        >
                          Answer
                        </span>
                        <p
                          className="text-base"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {flashcards[currentCardIndex]?.back}
                        </p>
                      </div>
                    </motion.div>
                  </div>

                  <div className="flex justify-center gap-3 mt-4">
                    <button
                      onClick={() => {
                        setCurrentCardIndex(Math.max(0, currentCardIndex - 1));
                        setIsFlipped(false);
                      }}
                      disabled={currentCardIndex === 0}
                      className="px-4 py-2 rounded-lg text-sm cursor-pointer disabled:opacity-30"
                      style={{
                        background: "var(--bg-tertiary)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => {
                        setCurrentCardIndex(
                          Math.min(flashcards.length - 1, currentCardIndex + 1)
                        );
                        setIsFlipped(false);
                      }}
                      disabled={currentCardIndex === flashcards.length - 1}
                      className="px-4 py-2 rounded-lg text-sm cursor-pointer disabled:opacity-30 flex items-center gap-1"
                      style={{
                        background: "var(--gradient-primary)",
                        color: "white",
                      }}
                    >
                      Next <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                !isLoading && (
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div
                      className="w-16 h-16 rounded-2xl mb-4 flex items-center justify-center"
                      style={{ background: "var(--info-bg)" }}
                    >
                      <Layers
                        className="w-8 h-8"
                        style={{ color: "var(--info)" }}
                      />
                    </div>
                    <h3
                      className="text-lg font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Generate Flashcards
                    </h3>
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Enter a topic above
                    </p>
                  </div>
                )
              )}
            </motion.div>
          )}

          {/* QUIZ TAB */}
          {activeTab === "quiz" && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col py-4 overflow-y-auto"
            >
              {quiz.length === 0 && !isLoading && (
                <div
                  className="flex items-center gap-2 p-2 rounded-xl mb-4"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border-medium)",
                  }}
                >
                  <Target
                    className="w-4 h-4"
                    style={{ color: "var(--success)" }}
                  />
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleGenerateQuizFromTopic(topic)
                    }
                    placeholder="Topic for quiz..."
                    className="flex-1 bg-transparent text-sm outline-none"
                    style={{ color: "var(--text-primary)" }}
                  />
                  <button
                    onClick={() => handleGenerateQuizFromTopic(topic)}
                    disabled={!topic.trim() || isLoading}
                    className="px-3 py-1.5 rounded-lg text-sm cursor-pointer disabled:opacity-50"
                    style={{ background: "var(--success)", color: "white" }}
                  >
                    Start Quiz
                  </button>
                </div>
              )}

              {quiz.length > 0 && quizIndex < quiz.length ? (
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-2 text-sm">
                    <span style={{ color: "var(--text-secondary)" }}>
                      Q{quizIndex + 1}/{quiz.length}
                    </span>
                    <span style={{ color: "var(--success)" }}>
                      Score: {quizScore}
                    </span>
                  </div>
                  <div
                    className="h-1 rounded-full mb-4"
                    style={{ background: "var(--bg-tertiary)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${((quizIndex + 1) / quiz.length) * 100}%`,
                        background: "var(--success)",
                      }}
                    />
                  </div>

                  <div
                    className="p-4 rounded-xl mb-4"
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border-medium)",
                    }}
                  >
                    <h3
                      className="text-base font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {quiz[quizIndex]?.question}
                    </h3>
                  </div>

                  <div className="space-y-2 flex-1">
                    {quiz[quizIndex]?.options.map((option, i) => {
                      const isSelected = selectedAnswer === i;
                      const isCorrect = i === quiz[quizIndex]?.correctIndex;
                      const showResult = selectedAnswer !== null;
                      return (
                        <button
                          key={i}
                          onClick={() => {
                            if (selectedAnswer === null) {
                              setSelectedAnswer(i);
                              if (isCorrect) setQuizScore((prev) => prev + 1);
                            }
                          }}
                          className="w-full p-3 rounded-xl text-left text-sm cursor-pointer transition-all"
                          style={{
                            background: showResult
                              ? isCorrect
                                ? "var(--success-bg)"
                                : isSelected
                                ? "var(--error-bg)"
                                : "var(--bg-tertiary)"
                              : "var(--bg-tertiary)",
                            border: `1px solid ${
                              showResult
                                ? isCorrect
                                  ? "var(--success)"
                                  : isSelected
                                  ? "var(--error)"
                                  : "var(--border-light)"
                                : "var(--border-light)"
                            }`,
                            color: "var(--text-primary)",
                          }}
                          disabled={showResult}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>

                  {selectedAnswer !== null && (
                    <>
                      {quiz[quizIndex]?.explanation && (
                        <div
                          className="p-3 rounded-xl mt-3 text-sm"
                          style={{
                            background: "var(--info-bg)",
                            border: "1px solid var(--info)",
                          }}
                        >
                          <strong style={{ color: "var(--info)" }}>
                            Explanation:
                          </strong>{" "}
                          <span style={{ color: "var(--text-primary)" }}>
                            {quiz[quizIndex].explanation}
                          </span>
                        </div>
                      )}
                      <button
                        onClick={() => {
                          setQuizIndex((prev) => prev + 1);
                          setSelectedAnswer(null);
                        }}
                        className="mt-4 py-2 rounded-xl text-sm cursor-pointer flex items-center justify-center gap-1"
                        style={{
                          background: "var(--gradient-primary)",
                          color: "white",
                        }}
                      >
                        {quizIndex < quiz.length - 1 ? (
                          <>
                            Next <ArrowRight className="w-3 h-3" />
                          </>
                        ) : (
                          "See Results"
                        )}
                      </button>
                    </>
                  )}
                </div>
              ) : quiz.length > 0 && quizIndex >= quiz.length ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div
                    className="w-16 h-16 rounded-full mb-4 flex items-center justify-center"
                    style={{ background: "var(--success-bg)" }}
                  >
                    <Target
                      className="w-8 h-8"
                      style={{ color: "var(--success)" }}
                    />
                  </div>
                  <h2
                    className="text-2xl font-bold mb-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Quiz Complete! 🎉
                  </h2>
                  <p
                    className="text-lg mb-4"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Score:{" "}
                    <span style={{ color: "var(--success)" }}>
                      {quizScore}/{quiz.length}
                    </span>
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setQuiz([]);
                        setQuizIndex(0);
                        setQuizScore(0);
                      }}
                      className="px-4 py-2 rounded-lg text-sm cursor-pointer"
                      style={{
                        background: "var(--bg-tertiary)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      New Quiz
                    </button>
                    <button
                      onClick={() => setActiveTab("explore")}
                      className="px-4 py-2 rounded-lg text-sm cursor-pointer"
                      style={{
                        background: "var(--gradient-primary)",
                        color: "white",
                      }}
                    >
                      Keep Learning
                    </button>
                  </div>
                </div>
              ) : (
                !isLoading && (
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div
                      className="w-16 h-16 rounded-2xl mb-4 flex items-center justify-center"
                      style={{ background: "var(--success-bg)" }}
                    >
                      <Target
                        className="w-8 h-8"
                        style={{ color: "var(--success)" }}
                      />
                    </div>
                    <h3
                      className="text-lg font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Test Your Knowledge
                    </h3>
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Enter a topic to generate a quiz
                    </p>
                  </div>
                )
              )}

              {isLoading && (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2
                    className="w-8 h-8 animate-spin"
                    style={{ color: "var(--accent-color)" }}
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
