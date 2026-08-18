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
    // 1. Parse payload (bypassing Auth/DB for prototype)
    const { crop, language, fieldData } = await req.json()
    
    if (!crop || !language || !fieldData) {
      throw new Error('Missing required parameters: crop, language, fieldData')
    }

    // 2. Setup Gemini
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) throw new Error('GEMINI_API_KEY is missing from Edge Function secrets')

    const genAI = new GoogleGenerativeAI(geminiApiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" })

    // 3. Generate Prompt
    const prompt = `
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
      1. Current crop health assessment based on the provided metrics.
      2. Immediate actions to take based on soil and weather.
      3. Any potential risks given the current moisture/temperature for the specified crop.
      
      Do not mention the words "real-time data" or "provided metrics", just give the advice as if you analyzed it yourself.
    `

    // 4. Call Gemini API
    const result = await model.generateContent(prompt)
    const recommendation = result.response.text()

    // 5. Return result without requiring DB insert
    return new Response(
      JSON.stringify({ recommendation_text: recommendation }),
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
