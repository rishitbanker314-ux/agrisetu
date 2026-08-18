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
    // 1. Authenticate user
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
    const { field_id, storage_path } = await req.json()
    if (!field_id || !storage_path) {
      throw new Error('Missing required parameters: field_id, storage_path')
    }

    // 3. Download image from Supabase Storage
    const { data: imageBlob, error: downloadError } = await supabaseClient
      .storage
      .from('crop_photos') // We assume a storage bucket named 'crop_photos' exists
      .download(storage_path)

    if (downloadError || !imageBlob) {
      throw new Error(`Failed to download image: ${downloadError?.message}`)
    }

    // 4. Convert Blob to base64 for Gemini
    const buffer = await imageBlob.arrayBuffer()
    const base64Data = btoa(String.fromCharCode(...new Uint8Array(buffer)))
    const mimeType = imageBlob.type || 'image/jpeg'

    // 5. Setup Gemini Multimodal
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) throw new Error('GEMINI_API_KEY is missing from Edge Function secrets')

    const genAI = new GoogleGenerativeAI(geminiApiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // 6. Generate Prompt
    const prompt = `
      You are an expert plant pathologist. Analyze this image of a crop.
      Identify any diseases, pests, or nutrient deficiencies.
      Respond strictly in JSON format with the following keys:
      - "disease_label": A short name of the disease or issue (e.g., "Tomato Early Blight", "Healthy").
      - "confidence": A float between 0.0 and 1.0 representing your confidence.
      - "treatment_advice": A short, actionable paragraph on how to treat or manage the issue.
    `

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType
      }
    }

    // 7. Call Gemini API
    const result = await model.generateContent([prompt, imagePart])
    const textResponse = result.response.text()
    
    // Strip markdown formatting if Gemini returns it
    const cleanJson = textResponse.replace(/```json\n?|\n?```/g, '').trim()
    const parsedData = JSON.parse(cleanJson)

    // 8. Insert into diagnoses table
    const { data: { publicUrl } } = supabaseClient
      .storage
      .from('crop_photos')
      .getPublicUrl(storage_path)

    const { data: diagnosis, error: insertError } = await supabaseClient
      .from('diagnoses')
      .insert({
        field_id,
        image_url: publicUrl,
        disease_label: parsedData.disease_label,
        confidence: parsedData.confidence,
        treatment_advice: parsedData.treatment_advice
      })
      .select()
      .single()

    if (insertError) throw insertError

    // 9. Return result
    return new Response(
      JSON.stringify(diagnosis),
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
