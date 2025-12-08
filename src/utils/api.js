// API utility for frontend to communicate with backend

const API_BASE = "/api";

function getToken() {
  return localStorage.getItem("neurolearn_token");
}

async function fetchAPI(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers,
    ...options,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Network error" }));
    throw new Error(error.error || "Something went wrong");
  }

  return response.json();
}

// User API
export const userAPI = {
  getMe: () => fetchAPI("/auth/me"),
  updateMe: (data) =>
    fetchAPI("/auth/me", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  updateGamification: (gamification) =>
    fetchAPI("/auth/me/gamification", {
      method: "PATCH",
      body: JSON.stringify(gamification),
    }),
};

// Tasks API
export const tasksAPI = {
  getAll: () => fetchAPI("/tasks"),
  create: (task) =>
    fetchAPI("/tasks", {
      method: "POST",
      body: JSON.stringify(task),
    }),
  update: (id, data) =>
    fetchAPI(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    fetchAPI(`/tasks/${id}`, {
      method: "DELETE",
    }),
  complete: (id) =>
    fetchAPI(`/tasks/${id}/complete`, {
      method: "PATCH",
    }),
  addSubtask: (taskId, subtask) =>
    fetchAPI(`/tasks/${taskId}/subtasks`, {
      method: "POST",
      body: JSON.stringify(subtask),
    }),
  toggleSubtask: (taskId, subtaskId) =>
    fetchAPI(`/tasks/${taskId}/subtasks/${subtaskId}`, {
      method: "PATCH",
    }),
};

// Health check
export const checkHealth = () => fetchAPI("/health");
