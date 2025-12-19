"""Real-time inference for focus detection using webcam."""

import cv2
import numpy as np
import torch
import torch.nn.functional as F
from collections import deque

from config import DEVICE, MODEL_PATH, CLASS_NAMES
from model import get_model


class FocusDetector:
    """Real-time focus detection from webcam."""
    
    def __init__(self, model_path: str = None, smoothing_window: int = 10):
        self.device = DEVICE
        self.smoothing_window = smoothing_window
        self.predictions = deque(maxlen=smoothing_window)
        
        # Load model
        path = model_path or str(MODEL_PATH)
        self.model = get_model(pretrained_path=path).to(self.device)
        self.model.eval()
        
        # Face detector
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )
    
    def preprocess(self, face_img: np.ndarray) -> torch.Tensor:
        """Preprocess face image for model input."""
        gray = cv2.cvtColor(face_img, cv2.COLOR_BGR2GRAY) if len(face_img.shape) == 3 else face_img
        resized = cv2.resize(gray, (48, 48))
        normalized = resized.astype(np.float32) / 255.0
        tensor = torch.FloatTensor(normalized).unsqueeze(0).unsqueeze(0)
        return tensor.to(self.device)
    
    def predict(self, face_img: np.ndarray) -> tuple:
        """
        Predict focus state from face image.
        
        Returns:
            (class_name, confidence, smoothed_class)
        """
        input_tensor = self.preprocess(face_img)
        
        with torch.no_grad():
            output = self.model(input_tensor)
            probs = F.softmax(output, dim=1)
            confidence, predicted = probs.max(1)
        
        self.predictions.append(predicted.item())
        
        # Smoothed prediction (majority vote)
        if len(self.predictions) > 0:
            smoothed = round(sum(self.predictions) / len(self.predictions))
        else:
            smoothed = predicted.item()
        
        return (
            CLASS_NAMES[predicted.item()],
            confidence.item() * 100,
            CLASS_NAMES[smoothed]
        )
    
    def detect_face(self, frame: np.ndarray) -> list:
        """Detect faces in frame."""
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(
            gray, scaleFactor=1.1, minNeighbors=5, minSize=(80, 80)
        )
        return faces


def run_webcam(model_path: str = None):
    """Run real-time detection on webcam."""
    print("=" * 50)
    print("Focus Detection - Real-time Inference")
    print("=" * 50)
    print("Press 'Q' to quit\n")
    
    detector = FocusDetector(model_path)
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("Error: Could not open webcam")
        return
    
    # Stats
    focused_count = 0
    distracted_count = 0
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        frame = cv2.flip(frame, 1)
        h, w = frame.shape[:2]
        
        # Detect faces
        faces = detector.detect_face(frame)
        
        status = None
        
        for (x, y, fw, fh) in faces:
            # Draw face box
            cv2.rectangle(frame, (x, y), (x+fw, y+fh), (0, 255, 0), 2)
            
            # Get prediction
            face_roi = frame[y:y+fh, x:x+fw]
            raw_pred, confidence, smoothed_pred = detector.predict(face_roi)
            
            status = smoothed_pred
            
            # Track stats
            if smoothed_pred == "Focused":
                focused_count += 1
            else:
                distracted_count += 1
            
            # Draw confidence
            cv2.putText(frame, f"{confidence:.0f}%", (x, y-10),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
        
        # Draw status bar
        color = (0, 180, 0) if status == "Focused" else (0, 0, 180) if status else (100, 100, 100)
        cv2.rectangle(frame, (0, 0), (w, 60), color, -1)
        
        text = status.upper() if status else "NO FACE"
        cv2.putText(frame, text, (20, 42), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (255, 255, 255), 2)
        
        # Focus rate
        total = focused_count + distracted_count
        if total > 0:
            rate = 100 * focused_count / total
            cv2.putText(frame, f"Focus Rate: {rate:.1f}%", (10, h-20),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        
        cv2.imshow("Focus Detection", frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()
    
    # Summary
    print("\n" + "=" * 50)
    print("Session Summary")
    print("=" * 50)
    total = focused_count + distracted_count
    if total > 0:
        print(f"Focused: {focused_count} ({100*focused_count/total:.1f}%)")
        print(f"Distracted: {distracted_count} ({100*distracted_count/total:.1f}%)")


if __name__ == "__main__":
    run_webcam()
