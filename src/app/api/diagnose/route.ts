import { NextResponse } from 'next/server';
import { Client } from '@gradio/client';

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

    // 2. Connect to the User's Dedicated Hugging Face Space!
    // Since the free shared API dropped support for custom large models, 
    // we route the traffic to the user's dedicated free Gradio container.
    const client = await Client.connect("rishit0311/agricrate-api");

    // 3. Run inference via the Gradio API
    const result = await client.predict("/predict_disease", {
        image: blob,
    });

    if (!result || !result.data || !result.data[0]) {
      throw new Error("Invalid response from Hugging Face Space.");
    }

    const topPrediction = result.data[0];
    const diseaseName = topPrediction.label;
    const confidence = topPrediction.confidences[0].confidence;

    // 4. Return the ML prediction
    const formattedLabel = diseaseName
      .split('_')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return NextResponse.json({
      disease_label: formattedLabel,
      confidence: confidence,
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
