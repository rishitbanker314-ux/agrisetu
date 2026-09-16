import { Client } from "npm:@gradio/client";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple lookup for treatments based on predicted label
const TREATMENT_DB: Record<string, string> = {
  "angular_leaf_spot": "**Angular Leaf Spot Detected**\n- Apply copper-based fungicides early in the morning.\n- Remove and destroy severely infected leaves.\n- Avoid overhead watering to reduce leaf moisture.",
  "bean_rust": "**Bean Rust Detected**\n- Use sulfur or chlorothalonil fungicides.\n- Ensure proper plant spacing for air circulation.\n- Rotate crops and avoid planting beans in the same spot next season.",
  "healthy": "**Healthy Leaf!**\n- No disease detected. Keep up the good work!\n- Maintain regular watering and nutrient schedules.",
};

// @ts-ignore
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { image_base64 } = await req.json()
    
    if (!image_base64) {
      throw new Error("No image data provided.");
    }

    // Process base64 correctly
    let base64Data = image_base64;
    let mimeType = 'image/jpeg'; // Default MIME type

    if (image_base64.startsWith('data:')) {
      const match = image_base64.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        base64Data = match[2];
      }
    }

    // Convert to Uint8Array safely
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Create Blob for Gradio Client
    const blob = new Blob([bytes], { type: mimeType });

    // Connect to the Hugging Face Space (Gradio)
    const client = await Client.connect("rishit0311/agricrate-api");
    
    // Call the /predict_disease endpoint with the image
    const result = await client.predict("/predict_disease", [blob]);
    
    // Gradio output format: result.data[0] is { label: string, confidences: [{label, confidence}] }
    const gradioOutput = result.data[0];
    
    if (!gradioOutput || !gradioOutput.confidences) {
        throw new Error("Invalid format received from AI model.");
    }

    // Map Gradio output to match the format expected by the frontend
    const predictions = gradioOutput.confidences.map((item: any) => ({
        label: item.label,
        score: item.confidence
    }));
    
    // Hugging Face returns an array sorted by score: [{label: 'healthy', score: 0.99}, ...]
    if (!predictions || predictions.length === 0) {
      throw new Error("No predictions returned from the model.");
    }

    const topPrediction = predictions[0];
    const diseaseLabelRaw = topPrediction.label.toLowerCase();
    const confidence = topPrediction.score;

    // 3. Format the response
    // Convert 'bean_rust' to 'Bean Rust'
    const formattedLabel = diseaseLabelRaw.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    
    // Get treatment advice or a fallback
    const advice = TREATMENT_DB[diseaseLabelRaw] || `**${formattedLabel} Detected**\n- Please consult an agronomist for specific treatment.\n- Isolate the plant if possible.`;

    const responseData = {
      disease_label: formattedLabel,
      confidence: confidence,
      treatment_advice: advice
    };

    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error("Diagnostic Error:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  }
})
