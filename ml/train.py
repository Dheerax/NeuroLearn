"""Training pipeline for focus detection model."""

import torch
import torch.nn as nn
import torch.optim as optim
from pathlib import Path

from config import (
    DEVICE, MODEL_DIR, MODEL_PATH, CLASS_NAMES,
    LEARNING_RATE, WEIGHT_DECAY, NUM_EPOCHS, EARLY_STOPPING_PATIENCE
)
from model import FocusCNN
from dataset import get_dataloaders


def train_epoch(model, loader, criterion, optimizer, device):
    """Train for one epoch."""
    model.train()
    total_loss = 0.0
    correct = 0
    total = 0
    
    for images, labels in loader:
        images, labels = images.to(device), labels.to(device)
        
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        
        total_loss += loss.item()
        _, predicted = outputs.max(1)
        total += labels.size(0)
        correct += predicted.eq(labels).sum().item()
    
    return total_loss / len(loader), 100.0 * correct / total


def evaluate(model, loader, criterion, device):
    """Evaluate model on test set."""
    model.eval()
    total_loss = 0.0
    correct = 0
    total = 0
    
    with torch.no_grad():
        for images, labels in loader:
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            loss = criterion(outputs, labels)
            
            total_loss += loss.item()
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()
    
    return total_loss / len(loader), 100.0 * correct / total


def train():
    """Main training function."""
    print("=" * 60)
    print("Focus Detection Model Training")
    print("=" * 60)
    print(f"Device: {DEVICE}")
    
    # Create directories
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    
    # Load data
    print("\nLoading dataset...")
    train_loader, test_loader = get_dataloaders()
    
    # Create model
    print("\nInitializing model...")
    model = FocusCNN(num_classes=len(CLASS_NAMES)).to(DEVICE)
    
    total_params = sum(p.numel() for p in model.parameters())
    print(f"Total parameters: {total_params:,}")
    
    # Loss and optimizer
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(
        model.parameters(), 
        lr=LEARNING_RATE, 
        weight_decay=WEIGHT_DECAY
    )
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(
        optimizer, mode='max', factor=0.5, patience=3
    )
    
    # Training loop
    print("\nStarting training...")
    print("-" * 60)
    print(f"{'Epoch':<8}{'Train Loss':<14}{'Train Acc':<12}{'Test Loss':<14}{'Test Acc'}")
    print("-" * 60)
    
    best_acc = 0.0
    patience_counter = 0
    
    for epoch in range(NUM_EPOCHS):
        train_loss, train_acc = train_epoch(
            model, train_loader, criterion, optimizer, DEVICE
        )
        test_loss, test_acc = evaluate(
            model, test_loader, criterion, DEVICE
        )
        
        scheduler.step(test_acc)
        
        print(f"{epoch+1:<8}{train_loss:<14.4f}{train_acc:<12.2f}{test_loss:<14.4f}{test_acc:.2f}")
        
        # Save best model
        if test_acc > best_acc:
            best_acc = test_acc
            patience_counter = 0
            
            torch.save({
                'epoch': epoch,
                'model_state_dict': model.state_dict(),
                'optimizer_state_dict': optimizer.state_dict(),
                'train_acc': train_acc,
                'test_acc': test_acc,
                'class_names': CLASS_NAMES,
            }, MODEL_PATH)
        else:
            patience_counter += 1
        
        # Early stopping
        if patience_counter >= EARLY_STOPPING_PATIENCE:
            print(f"\nEarly stopping at epoch {epoch+1}")
            break
    
    print("-" * 60)
    print(f"\nTraining complete!")
    print(f"Best test accuracy: {best_acc:.2f}%")
    print(f"Model saved to: {MODEL_PATH}")


if __name__ == "__main__":
    train()
