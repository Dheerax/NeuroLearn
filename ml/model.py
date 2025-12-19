"""Neural network architecture for focus detection."""

import torch
import torch.nn as nn


class FocusCNN(nn.Module):
    """
    Convolutional Neural Network for focus/distraction detection.
    
    Architecture:
        Input: 48x48 grayscale image
        Conv blocks: 32 → 64 → 128 channels
        FC layers: 4608 → 256 → 2
        Output: 2 classes (focused, distracted)
    """
    
    def __init__(self, num_classes: int = 2, dropout: float = 0.5):
        super().__init__()
        
        self.features = nn.Sequential(
            # Block 1: 48x48 → 24x24
            nn.Conv2d(1, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.Conv2d(32, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),
            nn.Dropout2d(0.25),
            
            # Block 2: 24x24 → 12x12
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.Conv2d(64, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),
            nn.Dropout2d(0.25),
            
            # Block 3: 12x12 → 6x6
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.Conv2d(128, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),
            nn.Dropout2d(0.25),
        )
        
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(128 * 6 * 6, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(inplace=True),
            nn.Dropout(dropout),
            nn.Linear(256, num_classes),
        )
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.features(x)
        x = self.classifier(x)
        return x


def get_model(num_classes: int = 2, pretrained_path: str = None) -> FocusCNN:
    """
    Create model instance, optionally loading pretrained weights.
    
    Args:
        num_classes: Number of output classes
        pretrained_path: Path to pretrained weights (.pth file)
    
    Returns:
        FocusCNN model instance
    """
    model = FocusCNN(num_classes=num_classes)
    
    if pretrained_path:
        checkpoint = torch.load(pretrained_path, map_location="cpu")
        model.load_state_dict(checkpoint["model_state_dict"])
    
    return model
