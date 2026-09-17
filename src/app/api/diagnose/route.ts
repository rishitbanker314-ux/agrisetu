import { NextResponse } from 'next/server';

export const maxDuration = 60; // 60 seconds for hobby tier

export async function POST(req: Request) {
  try {
    const { image_base64 } = await req.json();

    if (!image_base64) {
      return NextResponse.json({ error: "No image provided." }, { status: 400 });
    }

    // 1. Clean the base64 string (remove data:image/jpeg;base64, prefix)
    const base64Data = image_base64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // 2. Get API Key
    const hfToken = process.env.HF_API_KEY;
    
    if (!hfToken) {
      return NextResponse.json({ error: "HF_API_KEY is missing in environment variables." }, { status: 500 });
    }

    // 3. Call Hugging Face Serverless Inference API directly on your model
    const response = await fetch(
      "https://api-inference.huggingface.co/models/rishit0311/agricrate_disease_model",
      {
        headers: {
          "Authorization": `Bearer ${hfToken}`,
          "Content-Type": "application/octet-stream"
        },
        method: "POST",
        body: buffer,
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("HF API Error:", result);
      // Handle model loading state specifically
      if (result.error && result.error.includes("is currently loading")) {
         return NextResponse.json({ 
           error: "Model is waking up. Please try again in 20 seconds." 
         }, { status: 503 });
      }
      throw new Error(result.error || "Failed to analyze image with Hugging Face");
    }

    // result is an array of predictions, e.g., [{"label": "tomato_early_blight", "score": 0.99}, ...]
    if (!Array.isArray(result) || result.length === 0) {
      throw new Error("Invalid response from Hugging Face model.");
    }

    const topPrediction = result[0];

    // 4. Return just the ML prediction (NO Gemini)
    // We format the label slightly to make it readable (e.g., tomato_early_blight -> Tomato Early Blight)
    const formattedLabel = topPrediction.label
      .split('_')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return NextResponse.json({
      disease_label: formattedLabel,
      confidence: topPrediction.score,
      treatment_advice: `**Agronomic Note:** The deep-learning model has identified symptoms consistent with ${formattedLabel}. Please refer to standard agricultural guidelines for the appropriate fungicide or pesticide treatment for this specific issue.`
    });

  } catch (error: any) {
    console.error("Diagnose API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process image" }, { status: 500 });
  }
}
