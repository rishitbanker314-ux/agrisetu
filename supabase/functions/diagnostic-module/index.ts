import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.0'
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.14.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Parse payload
    const { field_id, image_base64, mime_type } = await req.json()
    if (!image_base64) {
      throw new Error('Missing required parameter: image_base64')
    }

    // 2. Setup Gemini Multimodal
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) throw new Error('GEMINI_API_KEY is missing from Edge Function secrets')

    const genAI = new GoogleGenerativeAI(geminiApiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // 3. Generate Prompt
    const prompt = `
      You are an expert plant pathologist. Analyze this image of a crop.
      Identify any diseases, pests, or nutrient deficiencies.
      Respond strictly in JSON format with the following keys:
      - "disease_label": A short name of the disease or issue (e.g., "Tomato Early Blight", "Healthy").
      - "confidence": A float between 0.0 and 1.0 representing your confidence.
      - "treatment_advice": A short, actionable paragraph on how to treat or manage the issue.
    `

    // Extract base64 part just in case it includes data uri prefix
    let cleanBase64 = image_base64;
    if (image_base64.includes(',')) {
      cleanBase64 = image_base64.split(',')[1];
    }

    const imagePart = {
      inlineData: {
        data: cleanBase64,
        mimeType: mime_type || 'image/jpeg'
      }
    }

    // 4. Call Gemini API
    const result = await model.generateContent([prompt, imagePart])
    const textResponse = result.response.text()
    
    // Strip markdown formatting if Gemini returns it
    const cleanJson = textResponse.replace(/```json\n?|\n?```/g, '').trim()
    const parsedData = JSON.parse(cleanJson)

    // 5. Return result without requiring DB insert
    return new Response(
      JSON.stringify(parsedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
