import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gamepad2,
  Brain,
  Heart,
  Target,
  Puzzle,
  Type,
  Palette,
  Leaf,
  Calculator,
  Zap,
  Trophy,
  Star,
  Sparkles,
} from "lucide-react";

import {
  MemoryGame,
  BreathingGame,
  FocusTargets,
  PatternGame,
  WordScramble,
  ColorMatch,
  ZenGarden,
  NumberRush,
  ReactionTime,
} from "../components/games";

const games = [
  {
    id: "memory",
    name: "Memory Match",
    description: "Match pairs of cards to test your memory",
    icon: Brain,
    image: "/games/memory_game.png",
    gradient: "from-purple-500 via-pink-500 to-rose-500",
    category: "focus",
    component: MemoryGame,
  },
  {
    id: "breathing",
    name: "Calm Breathing",
    description: "Guided 4-4-4 breathing for relaxation",
    icon: Heart,
    image: "/games/breathing_game.png",
    gradient: "from-blue-400 via-cyan-500 to-teal-500",
    category: "calm",
    component: BreathingGame,
  },
  {
    id: "targets",
    name: "Focus Targets",
    description: "Click moving targets to build your score",
    icon: Target,
    image: "/games/targets_game.png",
    gradient: "from-orange-500 via-red-500 to-pink-500",
    category: "focus",
    component: FocusTargets,
  },
  {
    id: "pattern",
    name: "Pattern Memory",
    description: "Remember and repeat color sequences",
    icon: Puzzle,
    image: "/games/pattern_game.png",
    gradient: "from-green-500 via-emerald-500 to-teal-500",
    category: "memory",
    component: PatternGame,
  },
  {
    id: "words",
    name: "Word Scramble",
    description: "Unscramble letters to form words",
    icon: Type,
    image: "/games/word_puzzle.png",
    gradient: "from-amber-500 via-yellow-500 to-lime-500",
    category: "brain",
    component: WordScramble,
  },
  {
    id: "colors",
    name: "Color Match",
    description: "Match colors quickly - Stroop challenge",
    icon: Palette,
    image: "/games/color_match.png",
    gradient: "from-pink-500 via-fuchsia-500 to-purple-500",
    category: "brain",
    component: ColorMatch,
  },
  {
    id: "zen",
    name: "Zen Garden",
    description: "Draw peaceful patterns in the sand",
    icon: Leaf,
    image: "/games/zen_garden.png",
    gradient: "from-lime-500 via-green-500 to-emerald-500",
    category: "calm",
    component: ZenGarden,
  },
  {
    id: "numbers",
    name: "Number Rush",
    description: "Solve math problems as fast as you can",
    icon: Calculator,
    image: "/games/number_rush.png",
    gradient: "from-indigo-500 via-blue-500 to-cyan-500",
    category: "brain",
    component: NumberRush,
  },
  {
    id: "reaction",
    name: "Reaction Time",
    description: "Test your reflexes with quick clicks",
    icon: Zap,
    image: null, // No custom image yet
    gradient: "from-yellow-400 via-orange-500 to-red-500",
    category: "focus",
    component: ReactionTime,
  },
];

const categories = [
  { id: "all", label: "All Games", icon: Gamepad2 },
  { id: "focus", label: "Focus", icon: Target },
  { id: "memory", label: "Memory", icon: Brain },
  { id: "brain", label: "Brain Training", icon: Sparkles },
  { id: "calm", label: "Relaxation", icon: Heart },
];

export default function GamesPage() {
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [completedToday, setCompletedToday] = useState(() => {
    const saved = localStorage.getItem("games_completed_today");
    const data = saved ? JSON.parse(saved) : { date: null, games: [] };
    const today = new Date().toDateString();
    if (data.date !== today) {
      return [];
    }
    return data.games;
  });

  const handleGameComplete = (gameId, score) => {
    if (!completedToday.includes(gameId)) {
      const newCompleted = [...completedToday, gameId];
      setCompletedToday(newCompleted);
      localStorage.setItem(
        "games_completed_today",
        JSON.stringify({
          date: new Date().toDateString(),
          games: newCompleted,
        })
      );
    }
  };

  const handleBack = () => {
    setSelectedGame(null);
  };

  const filteredGames =
    selectedCategory === "all"
      ? games
      : games.filter((g) => g.category === selectedCategory);

  return (
    <div className="max-w-6xl mx-auto">
      <AnimatePresence mode="wait">
        {selectedGame ? (
          <motion.div
            key="game"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="min-h-[calc(100vh-120px)]"
          >
            {(() => {
              const game = games.find((g) => g.id === selectedGame);
              if (!game) return null;
              const GameComponent = game.component;
              return (
                <GameComponent
                  onComplete={(score) =>
                    handleGameComplete(selectedGame, score)
                  }
                  onBack={handleBack}
                />
              );
            })()}
          </motion.div>
        ) : (
          <motion.div
            key="selection"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Header */}
            <motion.div
              className="text-center mb-8"
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <h1 className="text-4xl font-black bg-gradient-to-r from-primary via-accent to-pink-500 bg-clip-text text-transparent mb-2">
                Focus Games
              </h1>
              <p className="text-text-secondary">
                Take a break and boost your focus with fun brain games
              </p>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              className="grid grid-cols-3 gap-4 mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="card p-4 text-center bg-gradient-to-br from-warning/10 to-orange-500/5 border-warning/20">
                <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-warning to-orange-500 flex items-center justify-center shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-black text-text-primary">
                  {completedToday.length}
                </p>
                <p className="text-xs text-text-secondary">Played Today</p>
              </div>
              <div className="card p-4 text-center bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20">
                <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                  <Gamepad2 className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-black text-text-primary">
                  {games.length}
                </p>
                <p className="text-xs text-text-secondary">Games Available</p>
              </div>
              <div className="card p-4 text-center bg-gradient-to-br from-success/10 to-emerald-500/5 border-success/20">
                <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-success to-emerald-500 flex items-center justify-center shadow-lg">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-black text-text-primary">
                  {Math.round((completedToday.length / games.length) * 100)}%
                </p>
                <p className="text-xs text-text-secondary">Completion</p>
              </div>
            </motion.div>

            {/* Category Filter */}
            <motion.div
              className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              {categories.map((cat) => (
                <motion.button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/30"
                      : "bg-surface-elevated text-text-secondary hover:text-text-primary hover:bg-primary/10"
                  }`}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <cat.icon size={16} />
                  {cat.label}
                </motion.button>
              ))}
            </motion.div>

            {/* Games Grid */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              layout
            >
              <AnimatePresence mode="popLayout">
                {filteredGames.map((game, index) => (
                  <motion.button
                    key={game.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    onClick={() => setSelectedGame(game.id)}
                    className="group relative overflow-hidden rounded-2xl border border-border bg-surface hover:border-primary/50 transition-all text-left"
                  >
                    {/* Game Image or Gradient Background */}
                    <div className="relative h-40 overflow-hidden">
                      {game.image ? (
                        <img
                          src={game.image}
                          alt={game.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div
                          className={`w-full h-full bg-gradient-to-br ${game.gradient} flex items-center justify-center`}
                        >
                          <game.icon className="w-16 h-16 text-white/80" />
                        </div>
                      )}

                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />

                      {/* Completed badge */}
                      {completedToday.includes(game.id) && (
                        <div className="absolute top-3 right-3">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-8 h-8 rounded-full bg-success flex items-center justify-center shadow-lg shadow-success/30"
                          >
                            <Star className="w-4 h-4 text-white" />
                          </motion.div>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors">
                            {game.name}
                          </h3>
                          <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                            {game.description}
                          </p>
                        </div>

                        {/* Play arrow */}
                        <motion.div
                          className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          whileHover={{ scale: 1.1 }}
                        >
                          <motion.span
                            className="text-primary font-bold text-xl"
                            animate={{ x: [0, 4, 0] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                          >
                            →
                          </motion.span>
                        </motion.div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Tips Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8 card p-5 bg-gradient-to-r from-primary/5 via-accent/5 to-pink-500/5 border-primary/10"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent text-white flex-shrink-0">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-text-primary mb-1">Pro Tip</h4>
                  <p className="text-sm text-text-secondary">
                    Playing focused games for 5-10 minutes when you feel
                    distracted can help reset your attention and improve
                    concentration. Try the{" "}
                    <span className="text-primary font-medium">Breathing</span>{" "}
                    or{" "}
                    <span className="text-primary font-medium">Zen Garden</span>{" "}
                    games when feeling overwhelmed!
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
