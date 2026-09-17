import gradio as gr
from transformers import pipeline

# Load your custom model
print("Loading model...")
classifier = pipeline("image-classification", model="rishit0311/agricrate_disease_model")
print("Model loaded successfully!")

def predict(image):
    if image is None:
        return None
    # Run inference
    results = classifier(image)
    # Format for Gradio Label output (dictionary of label -> confidence)
    return {result['label']: result['score'] for result in results}

# Create a simple web interface (which automatically creates an API!)
iface = gr.Interface(
    fn=predict, 
    inputs=gr.Image(type="pil"), 
    outputs=gr.Label(num_top_classes=3),
    title="AgriCrate Disease Diagnostic AI"
)

iface.launch()
