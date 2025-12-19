"""Dataset loading and preprocessing for FER2013 (image folder format)."""

import os
from pathlib import Path
from typing import Tuple, List

import numpy as np
import torch
from torch.utils.data import Dataset, DataLoader
from PIL import Image
from tqdm import tqdm

from config import DATA_DIR, EMOTION_TO_FOCUS, BATCH_SIZE


class FER2013Dataset(Dataset):
    """FER2013 dataset from image folders."""
    
    def __init__(self, images: np.ndarray, labels: np.ndarray, augment: bool = False):
        self.images = torch.FloatTensor(images).unsqueeze(1)  # Add channel dim
        self.labels = torch.LongTensor(labels)
        self.augment = augment
    
    def __len__(self) -> int:
        return len(self.labels)
    
    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, torch.Tensor]:
        image = self.images[idx]
        label = self.labels[idx]
        
        if self.augment:
            # Random horizontal flip
            if torch.rand(1) > 0.5:
                image = torch.flip(image, dims=[2])
        
        return image, label


# Emotion folder names to index mapping
EMOTION_FOLDERS = {
    'angry': 0,
    'disgust': 1,
    'fear': 2,
    'happy': 3,
    'sad': 4,
    'surprise': 5,
    'neutral': 6,
}


def load_images_from_folder(folder_path: Path, max_per_class: int = None) -> Tuple[List, List]:
    """
    Load images from a folder structure like:
    folder_path/
        angry/
        disgust/
        fear/
        happy/
        sad/
        surprise/
        neutral/
    
    Returns:
        images: list of numpy arrays (48x48)
        labels: list of focus labels (0=Focused, 1=Distracted)
    """
    images = []
    labels = []
    
    for emotion_name, emotion_idx in EMOTION_FOLDERS.items():
        emotion_folder = folder_path / emotion_name
        
        if not emotion_folder.exists():
            print(f"  Warning: Folder not found: {emotion_folder}")
            continue
        
        # Get focus label from emotion
        focus_label = EMOTION_TO_FOCUS.get(emotion_idx, 1)
        
        # Get all image files
        image_files = list(emotion_folder.glob('*.jpg')) + list(emotion_folder.glob('*.png'))
        
        if max_per_class:
            image_files = image_files[:max_per_class]
        
        for img_path in image_files:
            try:
                # Load image as grayscale
                img = Image.open(img_path).convert('L')
                
                # Resize to 48x48 if needed
                if img.size != (48, 48):
                    img = img.resize((48, 48), Image.Resampling.LANCZOS)
                
                # Convert to numpy and normalize
                img_array = np.array(img, dtype=np.float32) / 255.0
                
                images.append(img_array)
                labels.append(focus_label)
                
            except Exception as e:
                print(f"  Error loading {img_path}: {e}")
                continue
        
        loaded_count = len(image_files)
        print(f"  {emotion_name}: {loaded_count} images -> {'Focused' if focus_label == 0 else 'Distracted'}")
    
    return images, labels


def load_fer2013_images(max_per_class: int = None) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """
    Load FER2013 dataset from image folder structure.
    
    Expected structure:
    data/
        train/
            angry/, disgust/, fear/, happy/, sad/, surprise/, neutral/
        test/
            angry/, disgust/, fear/, happy/, sad/, surprise/, neutral/
    
    Returns:
        train_images, train_labels, test_images, test_labels
    """
    train_dir = DATA_DIR / "train"
    test_dir = DATA_DIR / "test"
    
    if not train_dir.exists():
        raise FileNotFoundError(f"Training folder not found: {train_dir}")
    
    print("Loading training images...")
    train_images, train_labels = load_images_from_folder(train_dir, max_per_class)
    
    print("\nLoading test images...")
    if test_dir.exists():
        test_images, test_labels = load_images_from_folder(test_dir, max_per_class)
    else:
        # If no test folder, split training data
        print("  No test folder found, splitting training data (80/20)...")
        split_idx = int(len(train_images) * 0.8)
        
        # Shuffle first
        indices = np.random.permutation(len(train_images))
        train_images = [train_images[i] for i in indices]
        train_labels = [train_labels[i] for i in indices]
        
        test_images = train_images[split_idx:]
        test_labels = train_labels[split_idx:]
        train_images = train_images[:split_idx]
        train_labels = train_labels[:split_idx]
    
    return (
        np.array(train_images),
        np.array(train_labels),
        np.array(test_images),
        np.array(test_labels)
    )


def get_dataloaders(max_per_class: int = None) -> Tuple[DataLoader, DataLoader]:
    """
    Create train and test dataloaders from image folders.
    
    Args:
        max_per_class: Limit images per emotion class (for faster testing)
    
    Returns:
        train_loader, test_loader
    """
    train_imgs, train_lbls, test_imgs, test_lbls = load_fer2013_images(max_per_class)
    
    print(f"\n=== Dataset Summary ===")
    print(f"Training samples: {len(train_imgs)}")
    print(f"  - Focused: {sum(train_lbls == 0)}")
    print(f"  - Distracted: {sum(train_lbls == 1)}")
    print(f"Testing samples: {len(test_imgs)}")
    print(f"  - Focused: {sum(test_lbls == 0)}")
    print(f"  - Distracted: {sum(test_lbls == 1)}")
    
    train_dataset = FER2013Dataset(train_imgs, train_lbls, augment=True)
    test_dataset = FER2013Dataset(test_imgs, test_lbls, augment=False)
    
    train_loader = DataLoader(
        train_dataset, 
        batch_size=BATCH_SIZE, 
        shuffle=True,
        num_workers=0,
        pin_memory=True
    )
    
    test_loader = DataLoader(
        test_dataset, 
        batch_size=BATCH_SIZE, 
        shuffle=False,
        num_workers=0,
        pin_memory=True
    )
    
    return train_loader, test_loader


if __name__ == "__main__":
    # Test loading
    print("Testing dataset loading...")
    train_loader, test_loader = get_dataloaders(max_per_class=100)
    print(f"\nTrain batches: {len(train_loader)}")
    print(f"Test batches: {len(test_loader)}")
    
    # Test one batch
    images, labels = next(iter(train_loader))
    print(f"\nBatch shape: {images.shape}")
    print(f"Labels shape: {labels.shape}")
