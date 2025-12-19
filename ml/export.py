"""Export trained model to ONNX format for web deployment."""

import torch
from pathlib import Path

from config import MODEL_DIR, MODEL_PATH, CLASS_NAMES
from model import get_model


def export_to_onnx(model_path: str = None, output_path: str = None):
    """
    Export PyTorch model to ONNX format.
    
    Args:
        model_path: Path to trained .pth model
        output_path: Output path for .onnx file
    """
    model_path = model_path or str(MODEL_PATH)
    output_path = output_path or str(MODEL_DIR / "focus_detector.onnx")
    
    print("=" * 50)
    print("Exporting Model to ONNX")
    print("=" * 50)
    
    # Load model
    print(f"Loading model from: {model_path}")
    model = get_model(pretrained_path=model_path)
    model.eval()
    
    # Create dummy input (batch_size=1, channels=1, height=48, width=48)
    dummy_input = torch.randn(1, 1, 48, 48)
    
    # Export
    print(f"Exporting to: {output_path}")
    torch.onnx.export(
        model,
        dummy_input,
        output_path,
        export_params=True,
        opset_version=12,
        do_constant_folding=True,
        input_names=['input'],
        output_names=['output'],
        dynamic_axes={
            'input': {0: 'batch_size'},
            'output': {0: 'batch_size'}
        }
    )
    
    print("Export complete!")
    
    # Verify
    try:
        import onnx
        import onnxruntime as ort
        
        # Check ONNX model
        onnx_model = onnx.load(output_path)
        onnx.checker.check_model(onnx_model)
        print("ONNX model validation: PASSED")
        
        # Test inference
        session = ort.InferenceSession(output_path)
        input_name = session.get_inputs()[0].name
        result = session.run(None, {input_name: dummy_input.numpy()})
        print(f"Test inference output shape: {result[0].shape}")
        print("ONNX runtime test: PASSED")
        
    except ImportError:
        print("Install onnx and onnxruntime to verify the exported model")
    
    print(f"\nModel exported successfully!")
    print(f"Use this file with ONNX.js in your web app.")


if __name__ == "__main__":
    export_to_onnx()
