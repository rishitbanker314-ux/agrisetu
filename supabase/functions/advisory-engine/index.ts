import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.0'
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.14.1'
import { getAdapterForCountry } from '../_shared/adapters/index.ts'

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
    // 1. Authenticate user & init Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    })

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // 2. Parse payload
    const { health_profile_id, crop, language } = await req.json()
    
    if (!health_profile_id || !crop || !language) {
      throw new Error('Missing required parameters: health_profile_id, crop, language')
    }

    // 3. Query health profile and field data
    // Edge Functions have service role keys available usually if configured, 
    // but here we use the user's RLS-scoped JWT context.
    const { data: healthProfile, error: hpError } = await supabaseClient
      .from('health_profiles')
      .select('*, fields(*)')
      .eq('id', health_profile_id)
      .single()

    if (hpError || !healthProfile) {
      throw new Error('Failed to find health profile')
    }

    const field = healthProfile.fields
    if (!field || field.owner_id !== user.id) {
       throw new Error('Unauthorized field access')
    }

    const countryCode = field.country

    // 4. Get historical data via FAOSTAT adapter
    const adapter = getAdapterForCountry(countryCode)
    const historicalData = await adapter.getHistoricalCropData(countryCode, crop)

    // 5. Setup Gemini
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) throw new Error('GEMINI_API_KEY is missing from Edge Function secrets')

    const genAI = new GoogleGenerativeAI(geminiApiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // 6. Generate Prompt
    const prompt = `
      You are an expert agronomist providing advice to a farmer.
      Respond strictly in the following language: ${language}.
      Use simple language, short sentences, and bullet points. Do not use complex jargon.
      
      Here is the data for the farmer's field:
      Crop: ${crop}
      Satellite NDVI (Crop Health, 0 to 1): ${healthProfile.ndvi}
      Soil pH: ${healthProfile.soil_properties.ph}
      Soil Nitrogen: ${healthProfile.soil_properties.nitrogen} mg/kg
      Soil Moisture: ${healthProfile.soil_properties.moisture}%
      Current Temperature: ${healthProfile.weather_forecast.temperature}°C
      Next 24h Rain: ${healthProfile.weather_forecast.forecast.next24hRainfallMm} mm
      
      Historical Context for ${crop} in ${countryCode}:
      ${historicalData.context}
      
      Please provide a concise, actionable advisory report covering:
      1. Current crop health assessment.
      2. Immediate actions to take based on soil and weather.
      3. Long-term considerations.
    `

    // 7. Call Gemini API
    const result = await model.generateContent(prompt)
    const recommendation = result.response.text()

    // 8. Insert into advisories table
    const { data: advisory, error: insertError } = await supabaseClient
      .from('advisories')
      .insert({
        field_id: field.id,
        profile_id: healthProfile.id,
        recommendation_text: recommendation,
        language: language
      })
      .select()
      .single()

    if (insertError) throw insertError

    // 9. Return result
    return new Response(
      JSON.stringify(advisory),
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
