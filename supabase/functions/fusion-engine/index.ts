import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.0'
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
    // 1. Authenticate user
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    
    // Create client with the auth header from the request
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
    const { field_id, lat, lng, countryCode } = await req.json()
    
    if (!field_id || !lat || !lng || !countryCode) {
      throw new Error('Missing required parameters: field_id, lat, lng, countryCode')
    }

    // 3. Parallel fetching via country adapter
    const adapter = getAdapterForCountry(countryCode)
    
    const [satellite, soil, weather] = await Promise.all([
      adapter.getSatelliteData(lat, lng),
      adapter.getSoilData(lat, lng),
      adapter.getWeatherData(lat, lng)
    ])

    // 4. Insert into health_profiles
    const { data: healthProfile, error: insertError } = await supabaseClient
      .from('health_profiles')
      .insert({
        field_id,
        ndvi: satellite.ndvi,
        soil_properties: soil,
        weather_forecast: weather
      })
      .select()
      .single()

    if (insertError) throw insertError

    // 5. Return success
    return new Response(
      JSON.stringify(healthProfile),
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
