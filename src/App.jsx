import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { UserProvider } from "./context/UserContext";
import { TaskProvider } from "./context/TaskContext";
import { GamificationProvider } from "./context/GamificationContext";
import { FocusMonitorProvider } from "./context/FocusMonitorContext";
import { FocusProvider } from "./context/FocusContext";
import Layout from "./components/Layout/Layout";
import DistractionAlert from "./components/DistractionAlert";
import AICompanion from "./components/AICompanion";
import Dashboard from "./pages/Dashboard";
import TasksPage from "./pages/TasksPage";
import LearningPage from "./pages/LearningPage";
import CommunicationPage from "./pages/CommunicationPage";
import FocusMode from "./pages/FocusMode";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import GamesPage from "./pages/GamesPage";

// Protected Route component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-calm-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-calm-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Public Route (redirect to home if already logged in)
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-calm-50">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="learning" element={<LearningPage />} />
        <Route path="communication" element={<CommunicationPage />} />
        <Route path="focus" element={<FocusMode />} />
        <Route path="games" element={<GamesPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <UserProvider>
            <TaskProvider>
              <GamificationProvider>
                <FocusMonitorProvider>
                  <FocusProvider>
                    <AppRoutes />
                    <DistractionAlert />
                    <AICompanion />
                  </FocusProvider>
                </FocusMonitorProvider>
              </GamificationProvider>
            </TaskProvider>
          </UserProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
