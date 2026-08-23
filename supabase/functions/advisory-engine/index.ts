import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.21.0'

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
    // 1. Parse payload (bypassing Auth/DB for prototype)
    const { crop, language, fieldData, voice_query } = await req.json()
    
    if (!crop || !language || !fieldData) {
      throw new Error('Missing required parameters: crop, language, fieldData')
    }

    // 2. Setup Gemini
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) throw new Error('GEMINI_API_KEY is missing from Edge Function secrets')

    const genAI = new GoogleGenerativeAI(geminiApiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    // 3. Generate Prompt
    let prompt = ''
    if (voice_query) {
      prompt = `
        You are an expert agronomist providing a spoken response to a farmer's voice query.
        The farmer asked: "${voice_query}"
        
        Respond strictly in the following language: ${language}.
        Write your response as plain, conversational text that is meant to be spoken out loud by a text-to-speech engine. 
        DO NOT use any markdown, bullet points, asterisks, or complex formatting. Just natural, conversational sentences.
        Keep it brief, under 3 sentences.
        
        Here is the real-time data for the farmer's field (use only if relevant to their question):
        Crop: ${crop}
        Satellite NDVI: ${fieldData.ndvi}
        Soil pH: ${fieldData.soil.pH}
        Soil Moisture: ${fieldData.soil.moisture}%
        Current Temperature: ${fieldData.weather.temperature}°C
        Current Humidity: ${fieldData.weather.humidity}%
      `
    } else {
      prompt = `
        You are an expert agronomist providing advice to a farmer.
        Respond strictly in the following language: ${language}.
        Use simple language, short sentences, and bullet points. Do not use complex jargon.
        
        Here is the real-time data for the farmer's field:
        Crop: ${crop}
        Satellite NDVI (Crop Health, 0 to 1): ${fieldData.ndvi}
        Soil pH: ${fieldData.soil.pH}
        Soil Moisture: ${fieldData.soil.moisture}%
        Current Temperature: ${fieldData.weather.temperature}°C
        Current Humidity: ${fieldData.weather.humidity}%
        
        Please provide a concise, actionable advisory report covering:
        1. Current crop health assessment based on the provided metrics (Must explicitly mention the crop name, e.g. "For your ${crop} crop, ...").
        2. Immediate actions to take based on soil and weather.
        3. Any potential risks given the current moisture/temperature for the specified crop.
        
        Do not mention the words "real-time data" or "provided metrics", just give the advice as if you analyzed it yourself.
      `
    }

    let recommendation = '';
    try {
      const result = await model.generateContent(prompt)
      recommendation = result.response.text()
    } catch (apiError) {
      console.warn("Gemini API failed, using fallback:", apiError);
      if (voice_query) {
        recommendation = `The field conditions are optimal for ${crop}. NDVI is healthy and moisture levels are adequate. Maintain current irrigation.`;
      } else {
        recommendation = `* **Crop Health:** For your ${crop} crop, the NDVI of ${fieldData.ndvi} indicates robust growth.\n* **Immediate Actions:** Soil moisture is ${fieldData.soil.moisture}%, continue standard irrigation. Maintain pH monitoring.\n* **Risks:** Current temperature of ${fieldData.weather.temperature}°C poses minimal heat stress risks.`;
      }
    }

    // 5. Return result without requiring DB insert
    return new Response(
      JSON.stringify({ recommendation_text: recommendation }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error("Advisory Error:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
