import { createContext, useContext, useState, useEffect } from "react";
import { tasksAPI } from "../utils/api";

const TaskContext = createContext();

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load tasks from MongoDB on mount
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await tasksAPI.getAll();
      // Transform MongoDB _id to id for frontend compatibility
      const transformedTasks = data.map((task) => ({
        ...task,
        id: task._id,
        subtasks: task.subtasks?.map((st) => ({ ...st, id: st._id })) || [],
      }));
      setTasks(transformedTasks);
      setError(null);
    } catch (err) {
      console.error("Failed to load tasks:", err);
      setError(err.message);
      // Fall back to localStorage if API fails
      const saved = localStorage.getItem("neurolearn_tasks");
      if (saved) setTasks(JSON.parse(saved));
    } finally {
      setLoading(false);
    }
  };

  // Also save to localStorage as backup
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem("neurolearn_tasks", JSON.stringify(tasks));
    }
  }, [tasks]);

  const addTask = async (task) => {
    try {
      const newTask = await tasksAPI.create({
        title: task.title,
        priority: task.priority || "medium",
        status: "pending",
        subtasks: [],
      });

      const transformedTask = {
        ...newTask,
        id: newTask._id,
        subtasks: [],
      };

      setTasks((prev) => [transformedTask, ...prev]);
      return transformedTask;
    } catch (err) {
      console.error("Failed to add task:", err);
      // Fallback to local-only
      const localTask = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        status: "pending",
        priority: task.priority || "medium",
        subtasks: [],
        ...task,
      };
      setTasks((prev) => [localTask, ...prev]);
      return localTask;
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, ...updates } : task
        )
      );

      // Get the actual MongoDB _id
      const task = tasks.find((t) => t.id === taskId);
      const mongoId = task?._id || taskId;

      await tasksAPI.update(mongoId, updates);
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      const mongoId = task?._id || taskId;

      await tasksAPI.delete(mongoId);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));

      if (activeTask?.id === taskId) {
        setActiveTask(null);
      }
    } catch (err) {
      console.error("Failed to delete task:", err);
      // Still remove locally
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    }
  };

  const addSubtask = async (taskId, subtask) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      const mongoId = task?._id || taskId;

      const updatedTask = await tasksAPI.addSubtask(mongoId, {
        title: subtask.title,
      });

      const transformedSubtasks = updatedTask.subtasks.map((st) => ({
        ...st,
        id: st._id,
      }));

      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, subtasks: transformedSubtasks } : t
        )
      );

      return transformedSubtasks[transformedSubtasks.length - 1];
    } catch (err) {
      console.error("Failed to add subtask:", err);
      // Fallback to local
      const newSubtask = {
        id: Date.now().toString(),
        completed: false,
        ...subtask,
      };
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? { ...task, subtasks: [...task.subtasks, newSubtask] }
            : task
        )
      );
      return newSubtask;
    }
  };

  const toggleSubtask = async (taskId, subtaskId) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      const mongoTaskId = task?._id || taskId;
      const subtask = task?.subtasks?.find((st) => st.id === subtaskId);
      const mongoSubtaskId = subtask?._id || subtaskId;

      // Optimistic update
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? {
                ...task,
                subtasks: task.subtasks.map((st) =>
                  st.id === subtaskId ? { ...st, completed: !st.completed } : st
                ),
              }
            : task
        )
      );

      await tasksAPI.toggleSubtask(mongoTaskId, mongoSubtaskId);
    } catch (err) {
      console.error("Failed to toggle subtask:", err);
    }
  };

  const getTasksByStatus = (status) => {
    return tasks.filter((task) => task.status === status);
  };

  const getTasksByPriority = (priority) => {
    return tasks.filter((task) => task.priority === priority);
  };

  const completeTask = async (taskId) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      const mongoId = task?._id || taskId;

      await tasksAPI.complete(mongoId);

      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? {
                ...task,
                status: "completed",
                completedAt: new Date().toISOString(),
              }
            : task
        )
      );
    } catch (err) {
      console.error("Failed to complete task:", err);
      // Still update locally
      updateTask(taskId, {
        status: "completed",
        completedAt: new Date().toISOString(),
      });
    }
  };

  const startTask = (task) => {
    setActiveTask({
      ...task,
      startedAt: new Date().toISOString(),
    });
    updateTask(task.id, { status: "in-progress" });
  };

  const pauseTask = () => {
    if (activeTask) {
      updateTask(activeTask.id, { status: "paused" });
      setActiveTask(null);
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        activeTask,
        loading,
        error,
        addTask,
        updateTask,
        deleteTask,
        addSubtask,
        toggleSubtask,
        getTasksByStatus,
        getTasksByPriority,
        completeTask,
        startTask,
        pauseTask,
        setActiveTask,
        refreshTasks: loadTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
}
