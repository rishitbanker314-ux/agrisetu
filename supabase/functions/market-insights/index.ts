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
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const prompt = `
      You are an agricultural commodities expert and a predictive risk analyst.
      Based on the exact coordinates (Lat: ${lat}, Lng: ${lng}) and the crop (${crop}), generate a hyper-realistic "Market Intelligence Report".
      
      Return strictly a JSON object with this exact structure (no markdown fences, just pure JSON):
      {
        "current_market": {
          "currentPrice": 245, // A realistic current price number
          "unit": "/ quintal",
          "currency": "$",
          "trend": "up", // "up", "down", or "stable"
          "percentageChange": "2.4%", // percentage string
          "insight": "A 2-3 sentence highly realistic market insight based on current global/regional conditions."
        },
        "scenarios": [
          {
            "id": "scenario-1",
            "title": "A short, punchy title (Must mention ${crop})",
            "probability": 45, 
            "trend": "up", // "up", "down", or "stable"
            "impact": "A 1-2 sentence real-world explanation of this scenario.",
            "recommendation": "SELL (Secure Peak)",
            "recColor": "bg-red-800 border-red-950 text-white hover:bg-red-900", // red for sell, green for hold
            "prices": [45, 48, 55, 62, 58, 65, 70, 75, 72, 80] // Array of 10 realistic price points
          },
          ... (2 more scenarios)
        ]
      }
    `

    let parsedJson;
    try {
      const result = await model.generateContent(prompt)
      let jsonString = result.response.text().trim()
      
      if (jsonString.startsWith('\`\`\`')) {
        jsonString = jsonString.replace(/^\`\`\`(json)?/, '').replace(/\`\`\`$/, '').trim()
      }
      parsedJson = JSON.parse(jsonString)
    } catch (apiError) {
      console.warn("Gemini API failed, using fallback:", apiError);
      
      const seed = ((lat * 12.3) + (lng * 45.6)) % 10;
      const fallbackPrice = Math.round(245 + seed);

      parsedJson = {
        "current_market": {
          "currentPrice": fallbackPrice,
          "unit": "/ quintal",
          "currency": "$",
          "trend": "up",
          "percentageChange": "3.2%",
          "insight": `Global demand for ${crop} is slightly elevated due to recent weather anomalies in key producing regions. Consider locking in current rates for a portion of your inventory.`
        },
        "scenarios": [
          {
            "id": "scenario-1",
            "title": `${crop} Supply Shock`,
            "probability": 45, 
            "trend": "up",
            "impact": `Unexpected weather disruptions in major exporting regions could reduce ${crop} yields globally.`,
            "recommendation": "SELL (Secure Peak)",
            "recColor": "bg-red-800 border-red-950 text-white hover:bg-red-900",
            "prices": [45, 48, 55, 62, 58, 65, 70, 75, 72, 80]
          },
          {
            "id": "scenario-2",
            "title": "Stable Harvest Cycle",
            "probability": 65, 
            "trend": "stable",
            "impact": `Regional harvests are progressing as expected, stabilizing local ${crop} inventories.`,
            "recommendation": "HOLD",
            "recColor": "bg-moss/20 border-moss/50 text-moss hover:bg-moss/30",
            "prices": [50, 52, 51, 50, 49, 50, 51, 52, 50, 51]
          },
          {
            "id": "scenario-3",
            "title": "Export Surplus",
            "probability": 25, 
            "trend": "down",
            "impact": `An unexpected surplus from neighboring markets might flood the domestic supply chain.`,
            "recommendation": "SELL (Minimize Loss)",
            "recColor": "bg-terracotta border-terracotta text-white hover:bg-orange-800",
            "prices": [60, 58, 55, 50, 45, 42, 40, 38, 35, 30]
          }
        ]
      };
    }

    return new Response(
      JSON.stringify(parsedJson),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error("Market Error:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
