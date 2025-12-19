"""
Focus Detection API Server
Runs on port 5001, provides inference endpoint for the web app.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import numpy as np
import base64
from io import BytesIO
from PIL import Image
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ml.model import get_model
from ml.config import MODEL_PATH, CLASS_NAMES

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

# Load model once at startup
print("Loading focus detection model...")
try:
    model = get_model(pretrained_path=str(MODEL_PATH))
    model.eval()
    print(f"Model loaded successfully from {MODEL_PATH}")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None


def preprocess_image(image_data):
    """Convert base64 image to model input tensor."""
    # Decode base64
    image_bytes = base64.b64decode(image_data.split(',')[1] if ',' in image_data else image_data)
    image = Image.open(BytesIO(image_bytes))
    
    # Convert to grayscale
    image = image.convert('L')
    
    # Resize to 48x48
    image = image.resize((48, 48))
    
    # Convert to numpy and normalize
    img_array = np.array(image, dtype=np.float32) / 255.0
    
    # Add batch and channel dimensions [1, 1, 48, 48]
    tensor = torch.from_numpy(img_array).unsqueeze(0).unsqueeze(0)
    
    return tensor


@app.route('/api/focus/check', methods=['POST'])
def check_focus():
    """
    Endpoint to check focus level from webcam image.
    Expects: { "image": "base64_encoded_image" }
    Returns: { "prediction": "focused"|"distracted", "confidence": 0.0-1.0 }
    """
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    try:
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({'error': 'No image provided'}), 400
        
        # Preprocess image
        tensor = preprocess_image(data['image'])
        
        # Run inference
        with torch.no_grad():
            output = model(tensor)
            probabilities = torch.softmax(output, dim=1)
            
            focused_prob = probabilities[0][0].item()
            distracted_prob = probabilities[0][1].item()
            
            prediction = 'focused' if focused_prob > distracted_prob else 'distracted'
            confidence = max(focused_prob, distracted_prob)
        
        return jsonify({
            'prediction': prediction,
            'confidence': round(confidence, 3),
            'focused_prob': round(focused_prob, 3),
            'distracted_prob': round(distracted_prob, 3),
        })
        
    except Exception as e:
        print(f"Error during inference: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/focus/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'ok',
        'model_loaded': model is not None,
    })


if __name__ == '__main__':
    print("Starting Focus Detection API on port 5001...")
    app.run(host='0.0.0.0', port=5001, debug=True)
