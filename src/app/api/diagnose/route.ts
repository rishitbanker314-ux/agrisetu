import { NextResponse } from 'next/server';
import { Client } from '@gradio/client';
import { getTreatmentReport, cureRecommendations } from '@/lib/encyclopedia';

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

    // 2. Get API Key to bypass ZeroGPU rate limits
    const hfToken = process.env.HF_API_KEY;
    
    if (!hfToken) {
      return NextResponse.json({ error: "HF_API_KEY is missing in environment variables." }, { status: 500 });
    }

    // 3. Connect to the User's Dedicated Hugging Face Space!
    const client = await Client.connect("rishit0311/agricrate-api", { hf_token: hfToken as any });

    // 4. Run inference via the Gradio API
    const result = await client.predict("/predict_disease", {
        image: blob,
    });

    if (!result || !result.data || !(result.data as any)[0]) {
      throw new Error("Invalid response from Hugging Face Space.");
    }

    const topPrediction = (result.data as any)[0];
    const diseaseName = topPrediction.label;
    const confidence = topPrediction.confidences[0].confidence;

    // Format all top predictions for the UI
    const alternatives = topPrediction.confidences.map((c: any) => ({
      label: c.label.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      confidence: c.confidence
    }));

    // 4. Return the ML prediction
    const formattedLabel = diseaseName
      .split('_')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const detailedAdvice = getTreatmentReport(diseaseName);
    const normalizedLabel = diseaseName.toLowerCase().trim();
    const cures = cureRecommendations[normalizedLabel] || [];

    return NextResponse.json({
      disease_label: formattedLabel,
      confidence: confidence,
      alternatives: alternatives,
      treatment_advice: detailedAdvice,
      cures: cures
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
