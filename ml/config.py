"""Training configuration and hyperparameters."""

import torch
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"
MODEL_DIR = BASE_DIR / "models"

# Dataset
DATASET_URL = "https://github.com/muxspace/facial_expressions/raw/master/data/fer2013.csv"
DATASET_PATH = DATA_DIR / "fer2013.csv"

# Model architecture
INPUT_SIZE = (1, 48, 48)  # (channels, height, width)
NUM_CLASSES = 2
CLASS_NAMES = ["Focused", "Distracted"]

# Emotion to focus mapping
# FER2013: 0=Angry, 1=Disgust, 2=Fear, 3=Happy, 4=Sad, 5=Surprise, 6=Neutral
EMOTION_TO_FOCUS = {
    0: 1,  # Angry → Distracted
    1: 1,  # Disgust → Distracted
    2: 1,  # Fear → Distracted
    3: 0,  # Happy → Focused
    4: 1,  # Sad → Distracted
    5: 0,  # Surprise → Focused
    6: 0,  # Neutral → Focused
}

# Training hyperparameters
BATCH_SIZE = 64
LEARNING_RATE = 0.001
WEIGHT_DECAY = 1e-4
NUM_EPOCHS = 25
EARLY_STOPPING_PATIENCE = 5

# Device
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Model save path
MODEL_PATH = MODEL_DIR / "focus_detector.pth"
