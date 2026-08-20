import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { lat, lng, crop } = await req.json()
    
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) throw new Error('GEMINI_API_KEY is missing')

    const genAI = new GoogleGenerativeAI(geminiApiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-robotics-er-2-preview" })

    const prompt = `
      You are an agricultural commodities expert providing a real-time market report.
      Based on the exact coordinates (Lat: ${lat}, Lng: ${lng}) and the crop (${crop}), use your knowledge of current global and regional macroeconomic conditions to generate a hyper-realistic, localized market insights JSON object.
      Do not output random mock data. Estimate the exact current real-world trading price for this commodity in this specific region's local currency (e.g., INR for India, BRL for Brazil, ZAR for South Africa).

      Return strictly a JSON object with this exact structure (no markdown fences, just pure JSON):
      {
        "currency": "The local currency symbol (e.g., ₹, R$, ₽, R)",
        "currentPrice": "Numeric value (e.g., 2450.50)",
        "unit": "Unit (e.g., per Quintal, per Tonne)",
        "trend": "up" or "down",
        "percentageChange": "Numeric value (e.g., +2.4%)",
        "insight": "A 1-2 sentence real-world financial advisory about whether to sell now or wait, based on actual seasonal trends, current weather phenomena, or global supply chain issues for this crop in this specific region."
      }
    `

    const result = await model.generateContent(prompt)
    let jsonString = result.response.text().trim()
    
    // Clean up markdown fences if Gemini added them
    if (jsonString.startsWith('\`\`\`')) {
      jsonString = jsonString.replace(/^\`\`\`(json)?/, '').replace(/\`\`\`$/, '').trim()
    }

    const parsedJson = JSON.parse(jsonString)

    return new Response(
      JSON.stringify(parsedJson),
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
