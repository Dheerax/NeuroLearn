import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  Circle,
  Clock,
  Trash2,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Play,
  Pause,
  GripVertical,
  Edit3,
  Tag,
  Zap,
  Volume2,
  VolumeX,
  Battery,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  AlertTriangle,
} from "lucide-react";

const PRIORITIES = [
  { id: "low", label: "Low", color: "#94a3b8", emoji: "🟢" },
  { id: "medium", label: "Medium", color: "#3b82f6", emoji: "🔵" },
  { id: "high", label: "High", color: "#f59e0b", emoji: "🟡" },
  { id: "urgent", label: "Urgent", color: "#ef4444", emoji: "🔴" },
];

const ENERGY_ICONS = {
  low: BatteryLow,
  medium: BatteryMedium,
  high: BatteryFull,
};

const SENSORY_TAGS = [
  { id: "quiet", label: "Quiet", emoji: "🤫", color: "#22c55e" },
  { id: "loud", label: "May be loud", emoji: "🔊", color: "#f59e0b" },
  { id: "social", label: "Social", emoji: "👥", color: "#8b5cf6" },
  { id: "solo", label: "Solo", emoji: "🧘", color: "#06b6d4" },
  { id: "screen", label: "Screen time", emoji: "💻", color: "#3b82f6" },
  { id: "movement", label: "Movement", emoji: "🏃", color: "#22c55e" },
];

export default function EnhancedTaskCard({
  task,
  onUpdate,
  onDelete,
  onComplete,
  onStartTimer,
  isTimerActive = false,
  dragHandleProps = {},
}) {
  const [expanded, setExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);

  const priorityConfig =
    PRIORITIES.find((p) => p.id === task.priority) || PRIORITIES[1];
  const EnergyIcon = ENERGY_ICONS[task.energyLevel] || Battery;
  const completedSubtasks =
    task.subtasks?.filter((s) => s.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "completed";

  const handleToggleComplete = (e) => {
    e.stopPropagation();
    if (task.status !== "completed") {
      onComplete(task.id);
    }
  };

  const handleSaveEdit = () => {
    if (editTitle.trim() && editTitle !== task.title) {
      onUpdate(task.id, { title: editTitle.trim() });
    }
    setIsEditing(false);
  };

  const handleSubtaskToggle = (subtaskIndex) => {
    const newSubtasks = [...task.subtasks];
    newSubtasks[subtaskIndex] = {
      ...newSubtasks[subtaskIndex],
      completed: !newSubtasks[subtaskIndex].completed,
    };
    onUpdate(task.id, { subtasks: newSubtasks });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ y: -2 }}
      className={`group cursor-pointer rounded-xl p-4 transition-all ${
        isTimerActive ? "ring-2 ring-offset-2" : ""
      }`}
      style={{
        background:
          task.status === "completed"
            ? "var(--bg-tertiary)"
            : "var(--bg-secondary)",
        border: isOverdue
          ? "2px solid var(--error)"
          : "1px solid var(--border-light)",
        ringColor: "var(--primary-500)",
      }}
      onClick={() => !isEditing && setExpanded(!expanded)}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <div
          {...dragHandleProps}
          className="opacity-0 group-hover:opacity-50 transition-opacity cursor-grab mt-1"
        >
          <GripVertical
            className="w-4 h-4"
            style={{ color: "var(--text-tertiary)" }}
          />
        </div>

        {/* Complete Toggle */}
        <motion.button
          onClick={handleToggleComplete}
          className="flex-shrink-0 mt-0.5 cursor-pointer"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {task.status === "completed" ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500 }}
            >
              <CheckCircle
                className="w-6 h-6"
                style={{ color: "var(--success)" }}
              />
            </motion.div>
          ) : (
            <Circle
              className="w-6 h-6 transition-colors"
              style={{
                color: isOverdue ? "var(--error)" : "var(--text-tertiary)",
              }}
            />
          )}
        </motion.button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            {/* Title */}
            {isEditing ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleSaveEdit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveEdit();
                  if (e.key === "Escape") setIsEditing(false);
                }}
                className="flex-1 px-2 py-1 rounded text-base font-medium"
                style={{
                  background: "var(--bg-tertiary)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--primary-500)",
                }}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            ) : (
              <h3
                className={`font-medium ${
                  task.status === "completed" ? "line-through" : ""
                }`}
                style={{
                  color:
                    task.status === "completed"
                      ? "var(--text-tertiary)"
                      : "var(--text-primary)",
                }}
              >
                {task.title}
              </h3>
            )}

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Timer button */}
              {task.status !== "completed" && (
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartTimer?.(task);
                  }}
                  className={`p-1.5 rounded-lg transition-all ${
                    isTimerActive
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  }`}
                  style={{
                    background: isTimerActive
                      ? "var(--primary-500)"
                      : "var(--bg-tertiary)",
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {isTimerActive ? (
                    <Pause className="w-4 h-4 text-white" />
                  ) : (
                    <Play
                      className="w-4 h-4"
                      style={{ color: "var(--text-tertiary)" }}
                    />
                  )}
                </motion.button>
              )}

              {/* Menu */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  style={{ background: "var(--bg-tertiary)" }}
                >
                  <MoreHorizontal
                    className="w-4 h-4"
                    style={{ color: "var(--text-tertiary)" }}
                  />
                </button>

                <AnimatePresence>
                  {showMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowMenu(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute right-0 top-full mt-1 z-20 min-w-[140px] py-1 rounded-lg"
                        style={{
                          background: "var(--surface)",
                          border: "1px solid var(--border-light)",
                        }}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsEditing(true);
                            setShowMenu(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 cursor-pointer hover:opacity-80"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(task.id);
                            setShowMenu(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 cursor-pointer"
                          style={{ color: "var(--error)" }}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Tags row */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {/* Priority */}
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
              style={{
                background: `${priorityConfig.color}20`,
                color: priorityConfig.color,
              }}
            >
              {priorityConfig.emoji} {priorityConfig.label}
            </span>

            {/* Energy level */}
            {task.energyLevel && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                style={{
                  background: "var(--bg-tertiary)",
                  color: "var(--text-secondary)",
                }}
              >
                <EnergyIcon className="w-3 h-3" />
                {task.energyLevel}
              </span>
            )}

            {/* Time estimate */}
            {task.estimatedTime && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                style={{
                  background: "var(--bg-tertiary)",
                  color: "var(--text-secondary)",
                }}
              >
                <Clock className="w-3 h-3" />
                {task.estimatedTime}m
              </span>
            )}

            {/* Overdue warning */}
            {isOverdue && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs animate-pulse"
                style={{
                  background: "var(--error)20",
                  color: "var(--error)",
                }}
              >
                <AlertTriangle className="w-3 h-3" />
                Overdue
              </span>
            )}

            {/* Sensory tags */}
            {task.sensoryTags?.map((tagId) => {
              const tag = SENSORY_TAGS.find((t) => t.id === tagId);
              if (!tag) return null;
              return (
                <span
                  key={tagId}
                  className="px-2 py-0.5 rounded-full text-xs"
                  style={{
                    background: `${tag.color}20`,
                    color: tag.color,
                  }}
                  title={tag.label}
                >
                  {tag.emoji}
                </span>
              );
            })}
          </div>

          {/* Subtasks progress */}
          {totalSubtasks > 0 && (
            <div className="mt-3">
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="flex-1 h-1.5 rounded-full overflow-hidden"
                  style={{ background: "var(--border-light)" }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: "var(--success)" }}
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(completedSubtasks / totalSubtasks) * 100}%`,
                    }}
                  />
                </div>
                <span
                  className="text-xs"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {completedSubtasks}/{totalSubtasks}
                </span>
              </div>
            </div>
          )}

          {/* Expandable subtasks */}
          <AnimatePresence>
            {expanded && task.subtasks && task.subtasks.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-3 space-y-2 overflow-hidden"
              >
                {task.subtasks.map((subtask, index) => (
                  <motion.div
                    key={subtask._id || index}
                    className="flex items-center gap-2 text-sm pl-2 py-1 rounded-lg cursor-pointer hover:opacity-80"
                    style={{ background: "var(--bg-tertiary)" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSubtaskToggle(index);
                    }}
                    whileHover={{ x: 4 }}
                  >
                    {subtask.completed ? (
                      <CheckCircle
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: "var(--success)" }}
                      />
                    ) : (
                      <Circle
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: "var(--text-tertiary)" }}
                      />
                    )}
                    <span
                      className={subtask.completed ? "line-through" : ""}
                      style={{
                        color: subtask.completed
                          ? "var(--text-tertiary)"
                          : "var(--text-secondary)",
                      }}
                    >
                      {subtask.title}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Expand toggle */}
          {task.subtasks && task.subtasks.length > 0 && (
            <button
              className="flex items-center gap-1 mt-2 text-xs cursor-pointer"
              style={{ color: "var(--text-tertiary)" }}
            >
              {expanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
              {task.subtasks.length} subtask
              {task.subtasks.length > 1 ? "s" : ""}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export { PRIORITIES, SENSORY_TAGS };
