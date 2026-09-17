import { NextResponse } from 'next/server';
import { HfInference } from '@huggingface/inference';

export const maxDuration = 60; // 60 seconds for hobby tier

export async function POST(req: Request) {
  try {
    const { image_base64 } = await req.json();

    if (!image_base64) {
      return NextResponse.json({ error: "No image provided." }, { status: 400 });
    }

    // 1. Clean the base64 string
    const base64Data = image_base64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const blob = new Blob([new Uint8Array(buffer)]);

    // 2. Get API Key
    const hfToken = process.env.HF_API_KEY;
    
    if (!hfToken) {
      return NextResponse.json({ error: "HF_API_KEY is missing in environment variables." }, { status: 500 });
    }

    // 3. Initialize Hugging Face SDK
    const hf = new HfInference(hfToken);

    // Call the model using the SDK (handles URL routing automatically)
    const result = await hf.imageClassification({
      model: 'rishit0311/agricrate_disease_model',
      data: blob
    });

    if (!Array.isArray(result) || result.length === 0) {
      throw new Error("Invalid response from Hugging Face model.");
    }

    const topPrediction = result[0];

    // 4. Return the ML prediction
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
    
    // Check if it's a model loading error
    if (error.message && error.message.includes("is currently loading")) {
      return NextResponse.json({ 
        error: "Model is waking up. Please try again in 20 seconds." 
      }, { status: 503 });
    }
    
    return NextResponse.json({ error: error.message || "Failed to process image" }, { status: 500 });
  }
}
