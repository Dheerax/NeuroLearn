import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";

const FocusMonitorContext = createContext(null);

// Check interval in minutes (every 1 minute for testing)
const CHECK_INTERVAL_MINUTES = 1;

// API endpoint for ML inference
const API_URL = "http://localhost:5001/api/focus/check";

export function FocusMonitorProvider({ children }) {
  const [isEnabled, setIsEnabled] = useState(() => {
    const saved = localStorage.getItem("focus_monitor_enabled");
    return saved === "true";
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [distractionCount, setDistractionCount] = useState(0);
  const [consecutiveDistractions, setConsecutiveDistractions] = useState(0);
  const [sessionStats, setSessionStats] = useState({
    checks: 0,
    focused: 0,
    distracted: 0,
  });
  const [hasPermission, setHasPermission] = useState(null);
  const [apiAvailable, setApiAvailable] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);

  // Check if ML API is available
  const checkApiHealth = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:5001/api/focus/health");
      const data = await response.json();
      setApiAvailable(data.model_loaded);
      return data.model_loaded;
    } catch (error) {
      console.log("ML API not available:", error.message);
      setApiAvailable(false);
      return false;
    }
  }, []);

  // Request webcam permission
  const requestWebcamPermission = useCallback(async () => {
    try {
      console.log("Requesting webcam permission...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: "user" },
      });

      // Stop immediately after getting permission
      stream.getTracks().forEach((track) => track.stop());
      setHasPermission(true);
      console.log("Webcam permission granted!");
      return true;
    } catch (error) {
      console.error("Webcam permission denied:", error);
      setHasPermission(false);
      return false;
    }
  }, []);

  // Start webcam for capture
  const startWebcam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: "user" },
      });

      streamRef.current = stream;

      if (!videoRef.current) {
        videoRef.current = document.createElement("video");
        videoRef.current.setAttribute("playsinline", "");
        videoRef.current.setAttribute("autoplay", "");
        videoRef.current.muted = true;
      }

      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      if (!canvasRef.current) {
        canvasRef.current = document.createElement("canvas");
        canvasRef.current.width = 48;
        canvasRef.current.height = 48;
      }

      return true;
    } catch (error) {
      console.error("Failed to start webcam:", error);
      return false;
    }
  }, []);

  // Stop webcam
  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Capture frame as base64
  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, 48, 48);

    // Get base64 image
    return canvas.toDataURL("image/jpeg", 0.8);
  }, []);

  // Send frame to ML API for analysis
  const analyzeWithAPI = useCallback(async (imageBase64) => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageBase64 }),
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const result = await response.json();
      return {
        prediction: result.prediction,
        confidence: result.confidence,
        focusedProb: result.focused_prob,
        distractedProb: result.distracted_prob,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error("ML API error:", error);
      return null;
    }
  }, []);

  // Perform focus check
  const checkFocus = useCallback(async () => {
    if (isLoading || !isEnabled) return;

    setIsLoading(true);
    console.log("Running focus check...");

    try {
      // Start webcam
      const started = await startWebcam();
      if (!started) {
        console.error("Could not start webcam");
        setIsLoading(false);
        return;
      }

      // Wait for camera to stabilize
      await new Promise((r) => setTimeout(r, 500));

      // Capture frame
      const imageBase64 = captureFrame();

      // Stop webcam immediately after capture
      stopWebcam();

      if (!imageBase64) {
        setIsLoading(false);
        return;
      }

      // Analyze with ML API
      const result = await analyzeWithAPI(imageBase64);

      if (result) {
        console.log("Focus check result:", result);
        setLastCheck(new Date());
        setLastResult(result);

        // Update stats
        setSessionStats((prev) => ({
          checks: prev.checks + 1,
          focused: prev.focused + (result.prediction === "focused" ? 1 : 0),
          distracted:
            prev.distracted + (result.prediction === "distracted" ? 1 : 0),
        }));

        // Track consecutive distractions to avoid annoying user
        if (result.prediction === "distracted" && result.confidence > 0.65) {
          setConsecutiveDistractions((prev) => prev + 1);
          setDistractionCount((prev) => prev + 1);

          // Only show alert after 2+ consecutive distractions (not every single time)
          if (consecutiveDistractions >= 1) {
            setShowAlert(true);
            setConsecutiveDistractions(0); // Reset after showing alert
          }
        } else {
          // Reset consecutive count if focused
          setConsecutiveDistractions(0);
        }
      }
    } catch (error) {
      console.error("Focus check error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    isLoading,
    isEnabled,
    startWebcam,
    captureFrame,
    stopWebcam,
    analyzeWithAPI,
    consecutiveDistractions,
  ]);

  // Toggle monitoring
  const toggleMonitoring = useCallback(
    async (enabled) => {
      console.log("Toggling monitoring:", enabled);

      if (enabled) {
        // Check API health first
        const apiOk = await checkApiHealth();
        if (!apiOk) {
          alert(
            "ML server is not running. Please start it with:\n\ncd ml && python api_server.py"
          );
          return;
        }

        // Request webcam permission
        const hasAccess = await requestWebcamPermission();
        if (!hasAccess) {
          alert("Webcam permission is required. Please allow camera access.");
          return;
        }

        setIsEnabled(true);
        localStorage.setItem("focus_monitor_enabled", "true");

        // Do initial check after delay
        setTimeout(() => checkFocus(), 1000);
      } else {
        setIsEnabled(false);
        localStorage.setItem("focus_monitor_enabled", "false");
        stopWebcam();
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    },
    [checkApiHealth, requestWebcamPermission, checkFocus, stopWebcam]
  );

  // Set up periodic check interval
  useEffect(() => {
    if (isEnabled && hasPermission && apiAvailable) {
      intervalRef.current = setInterval(() => {
        checkFocus();
      }, CHECK_INTERVAL_MINUTES * 60 * 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [isEnabled, hasPermission, apiAvailable, checkFocus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWebcam();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [stopWebcam]);

  const dismissAlert = useCallback(() => {
    setShowAlert(false);
  }, []);

  const value = {
    isEnabled,
    isLoading,
    lastCheck,
    lastResult,
    showAlert,
    distractionCount,
    sessionStats,
    hasPermission,
    apiAvailable,
    toggleMonitoring,
    checkFocus,
    dismissAlert,
  };

  return (
    <FocusMonitorContext.Provider value={value}>
      {children}
    </FocusMonitorContext.Provider>
  );
}

export function useFocusMonitor() {
  const context = useContext(FocusMonitorContext);
  if (!context) {
    throw new Error(
      "useFocusMonitor must be used within a FocusMonitorProvider"
    );
  }
  return context;
}

export default FocusMonitorContext;
