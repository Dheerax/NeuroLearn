# NeuroLearn ML - Focus Detection Model

Production-ready machine learning pipeline for detecting user focus/distraction states.

## Quick Start

```bash
# Setup
cd ml
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt

# Train model
python train.py

# Test with webcam
python inference.py
```

## Project Structure

```
ml/
├── train.py          # Training pipeline
├── inference.py      # Real-time webcam detection
├── model.py          # Neural network architecture
├── dataset.py        # Data loading & preprocessing
├── config.py         # Hyperparameters & settings
├── requirements.txt  # Dependencies
├── data/             # Dataset storage (auto-downloaded)
└── models/           # Saved model weights
```

## Model Details

- **Architecture**: CNN (Convolutional Neural Network)
- **Input**: 48x48 grayscale face image
- **Output**: Focused / Distracted classification
- **Dataset**: FER2013 (35,000+ face images)
- **Training Time**: ~10 min on CPU, ~2 min on GPU
