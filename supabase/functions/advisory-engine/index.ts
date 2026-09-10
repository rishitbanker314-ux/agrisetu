import "https://deno.land/x/xhr@0.3.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

const cropGuides: Record<string, string> = {
  wheat: "### Wheat Cultivation Guide\n\n**1. Soil & Sowing:** Thrives in well-drained loamy to clay-loam soils. Best sown in mid-November (temperature around 20-25°C). Use 100 kg seed per hectare. Maintain a row spacing of 20-22 cm.\n\n**2. Irrigation:** Requires 4-6 irrigations. Critical stages: Crown Root Initiation (21 days after sowing), Tillering, Booting, Flowering, and Dough stage.\n\n**3. Nutrients:** Target NPK ratio is roughly 120:60:40 kg/ha. Apply half nitrogen and full P&K at sowing; remaining nitrogen in two splits during early irrigations.\n\n**4. Harvest:** Harvest when grains harden and moisture falls below 14% (late March to April).",
  rice: "### Rice Cultivation Guide\n\n**1. Soil & Sowing:** Needs heavy clay soils with high water-holding capacity. Puddling is essential before transplanting. Transplant 25-30 day old seedlings with 2-3 seedlings per hill.\n\n**2. Irrigation:** Requires continuous submergence (2-5 cm water) from transplanting to the dough stage. Drain water 15 days before harvest.\n\n**3. Nutrients:** Apply NPK at 100:50:50 kg/ha. Zinc sulfate (25 kg/ha) is often necessary. Split nitrogen into 3 doses (basal, tillering, panicle initiation).\n\n**4. Harvest:** Harvest when 80% of panicles turn golden yellow.",
  corn: "### Corn (Maize) Cultivation Guide\n\n**1. Soil & Sowing:** Requires deep, well-drained loamy soil. Sensitive to waterlogging. Seed rate is 20 kg/ha. Sowing depth should be 3-5 cm.\n\n**2. Irrigation:** Critical stages are tasseling and silking. Moisture stress at this stage severely reduces yield. Provide 5-6 irrigations based on rainfall.\n\n**3. Nutrients:** Heavy feeder. NPK recommendation is 120:60:40 kg/ha. Weed control is crucial in the first 45 days.\n\n**4. Harvest:** Harvest when husks turn dry and grain moisture is around 20-25%.",
  cotton: "### Cotton Cultivation Guide\n\n**1. Soil & Sowing:** Best suited for deep black soils (regur) with good drainage. Sensitive to frost. Maintain plant spacing of 90x60 cm or 120x60 cm for Bt cotton.\n\n**2. Irrigation:** Deep rooted crop; withstands mild drought but needs irrigation during flowering and boll formation (squaring to boll development).\n\n**3. Nutrients:** NPK required is 150:60:60 kg/ha. Magnesium and Boron foliar sprays often boost boll retention.\n\n**4. Harvest:** Picking should be done when bolls are fully open and dry. Avoid picking wet cotton.",
  sugarcane: "### Sugarcane Cultivation Guide\n\n**1. Soil & Sowing:** Prefers deep, well-drained loams. Plant setts (cuttings) with 2-3 buds in trenches. Row spacing of 90-120 cm. Treat setts with fungicide before planting.\n\n**2. Irrigation:** High water requirement. Irrigate every 10-15 days during summer and 20-25 days during winter. Formative phase is most critical.\n\n**3. Nutrients:** Very heavy feeder. NPK requirement is 250:100:100 kg/ha. Earthing up is required to prevent lodging.\n\n**4. Harvest:** Harvest after 10-14 months when Brix (sugar content) reaches 18-20%.",
  soybean: "### Soybean Cultivation Guide\n\n**1. Soil & Sowing:** Prefers well-drained loam. Seed treatment with Rhizobium culture is essential. Sowing depth 3-4 cm. Seed rate 70-80 kg/ha.\n\n**2. Irrigation:** Generally rainfed but requires life-saving irrigation during pod filling if there's a dry spell.\n\n**3. Nutrients:** NPK 20:60:40 kg/ha. Since it fixes its own nitrogen, basal N requirement is low. Needs Sulphur (20 kg/ha).\n\n**4. Harvest:** Harvest when leaves drop and pods turn brown/yellow. Grain moisture should be 13-14%.",
  potato: "### Potato Cultivation Guide\n\n**1. Soil & Sowing:** Light, well-drained sandy loam is best for tuber development. Plant disease-free tubers at a depth of 5-7 cm. Row spacing 60 cm.\n\n**2. Irrigation:** Requires frequent, light irrigations (every 7-10 days). Tuber initiation and development are critical stages.\n\n**3. Nutrients:** High requirement. NPK 150:100:100 kg/ha. Earthing up must be done 25-30 days after planting to prevent tuber greening.\n\n**4. Harvest:** Dehaulm (cut vines) 10-12 days before harvest to toughen the tuber skin.",
  tomato: "### Tomato Cultivation Guide\n\n**1. Soil & Sowing:** Well-drained sandy loam. Start seeds in a nursery and transplant 25-30 day old seedlings. Staking is required for indeterminate varieties.\n\n**2. Irrigation:** Needs consistent moisture. Irregular watering causes fruit cracking and blossom end rot. Drip irrigation is highly recommended.\n\n**3. Nutrients:** NPK 120:60:60 kg/ha. Calcium and Boron are critical to prevent blossom end rot.\n\n**4. Harvest:** Harvest at breaker stage for transport, or red-ripe stage for processing.",
  onion: "### Onion Cultivation Guide\n\n**1. Soil & Sowing:** Friable, well-drained soil rich in humus. Seeds are usually sown in a nursery, transplanted after 40-45 days. Shallow root system.\n\n**2. Irrigation:** Requires frequent, light irrigation. Withhold irrigation 10-15 days before harvest to improve keeping quality.\n\n**3. Nutrients:** NPK 100:50:50 kg/ha. Sulphur (30 kg/ha) is vital for pungency and storage life.\n\n**4. Harvest:** Harvest when 50% of tops fall over (neck fall). Cure the bulbs in shade for a few days before storage.",
  apple: "### Apple Cultivation Guide\n\n**1. Soil & Planting:** Needs deep, well-drained loams. Requires chilling hours (<7°C) for dormancy. Plant grafted saplings in winter. Maintain proper pollinizer ratios (e.g., 1:9).\n\n**2. Irrigation:** Critical during fruit set and development. Drip irrigation is ideal to maintain uniform soil moisture.\n\n**3. Nutrients:** Apply farmyard manure in winter. Split NPK applications; heavy pruning required every winter to maintain fruit-bearing spurs.\n\n**4. Harvest:** Harvest based on color development and starch-iodine test. Handle carefully to avoid bruising.",
  grapes: "### Grape Cultivation Guide\n\n**1. Soil & Planting:** Adapts to various soils but prefers well-drained sandy loams. Needs a robust trellis system (e.g., bower or Y-trellis). Vines start yielding well in the 3rd year.\n\n**2. Irrigation:** Highly sensitive to waterlogging. Needs precise irrigation. Withhold water before pruning and during ripening to increase sugar (Brix).\n\n**3. Nutrients:** Pruning is done twice a year (foundation pruning and fruit pruning). Fertilize heavily based on soil tests.\n\n**4. Harvest:** Harvest only when fully ripe as grapes do not ripen off the vine.",
  coffee: "### Coffee Cultivation Guide\n\n**1. Soil & Planting:** Grown in hilly areas under shade. Prefers deep, friable, organic-rich soil. Arabica needs higher elevation than Robusta.\n\n**2. Irrigation:** Usually rainfed, but sprinkler irrigation (blossom showers) in Feb-March is critical for uniform flowering and fruit set.\n\n**3. Nutrients:** Requires regular liming to counteract soil acidity. NPK requirements vary heavily by yield.\n\n**4. Harvest:** Selective picking of only ripe red cherries ensures the best quality."
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { crop, language, fieldData, voice_query } = await req.json()
    
    if (!crop || !language || !fieldData) {
      throw new Error('Missing required parameters: crop, language, fieldData')
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) throw new Error('GEMINI_API_KEY is missing from Edge Function secrets')

    const genAI = new GoogleGenerativeAI(geminiApiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    let prompt = ''
    if (voice_query) {
      prompt = `
        You are a highly experienced Agriculture Engineer with over 10 years of field experience in agronomy, precision farming, and crop science.
        You are providing a spoken, highly curated expert response to a farmer's voice query.
        The farmer asked: "${voice_query}"
        
        CRITICAL LOCATION CHECK:
        The field is located at Latitude: ${fieldData.coordinates.lat}, Longitude: ${fieldData.coordinates.lng}.
        Before providing ANY advice, you MUST use your geographic knowledge to verify this exact location.
        If this location is an ocean, a dense concrete city center, a mountain peak, a desert, or any strictly non-arable area where growing crops is technically impossible:
        You MUST strictly return a short error message stating that crops cannot be grown in this area, and provide no further advice.
        
        Respond strictly in the following language: ${language}.
        Write your response as plain, conversational text that is meant to be spoken out loud by a text-to-speech engine. 
        DO NOT use any markdown, bullet points, asterisks, or complex formatting. Just natural, conversational sentences.
        Keep it brief, under 3 sentences.
        
        Here is the real-time data for the farmer's field (use only if relevant to their question, and only if the area is arable):
        Crop: ${crop}
        Satellite NDVI: ${fieldData.ndvi}
        Soil pH: ${fieldData.soil.pH}
        Soil Moisture: ${fieldData.soil.moisture}%
        Current Temperature: ${fieldData.weather.temperature}°C
        Current Humidity: ${fieldData.weather.humidity}%
      `
    } else {
      prompt = `
        You are a highly experienced Certified Crop Advisor (CCA) and Agronomy Engineer with over 15 years of field experience in precision farming.
        You are providing a deeply curated, expert-level agronomic prescription to a commercial farmer.

        CRITICAL LOCATION CHECK:
        The field is located at Latitude: ${fieldData.coordinates.lat}, Longitude: ${fieldData.coordinates.lng}.
        Before providing ANY advice, you MUST use your geographic knowledge to verify this exact location.
        If this location is an ocean, a dense concrete city center, a mountain peak, a desert, or any strictly non-arable area where growing crops is technically impossible:
        You MUST strictly return an error message stating that crops cannot be grown in this area, and DO NOT provide the agronomic report.
        
        Respond strictly in the following language: ${language}.
        
        Here is the real-time data for the farmer's field (use only if the area is arable):
        Crop: ${crop}
        Satellite NDVI (Crop Health, 0 to 1): ${fieldData.ndvi}
        Soil pH: ${fieldData.soil.pH}
        Soil Moisture: ${fieldData.soil.moisture}%
        Weather: ${fieldData.weather.temperature}°C, ${fieldData.weather.humidity}% humidity
        
        Please provide a highly detailed, comprehensive agronomic report AND a complete cultivation guide for ${crop}. Use Markdown to structure your response cleanly with headings.
        
        CRITICAL RULES FOR HIGH ACCURACY:
        - NEVER give generic advice like "apply fertilizer" or "water the crop".
        - ALWAYS provide EXACT chemical names, NPK ratios, and precise dosage rates in metric units (e.g., "Apply 50 kg/ha of Urea (46-0-0)", "Spray Mancozeb at 2.5 g/L").
        - ALWAYS specify exact irrigation volumes or intervals based on the current ${fieldData.soil.moisture}% moisture and ${fieldData.weather.temperature}°C temperature.
        - Act as a strict scientific agronomist.

        Include the following sections:
        1. **${crop.charAt(0).toUpperCase() + crop.slice(1)} Cultivation Guide**: A detailed step-by-step guide on how to successfully grow this specific crop from seed to harvest. Include ideal conditions, planting techniques, and lifecycle stages.
        2. **Current Field Health Assessment**: Deep dive into the NDVI (${fieldData.ndvi}) and current growth stage implications for ${crop}.
        3. **Precision Irrigation & Nutrient Management**: Exact fertilizer recommendations (with quantities/hectare) based on the pH (${fieldData.soil.pH}), and exact irrigation schedules based on the moisture levels.
        4. **Disease & Pest Forecasting**: Potential risks and exact pathogen threats given the current humidity (${fieldData.weather.humidity}%) and temperature (${fieldData.weather.temperature}°C). Specify the exact chemical controls to prepare.
        5. **Yield Optimization**: Long term yield projections and immediate corrective actions to take.
        
        Write in a highly professional, scientific, and quantitative tone. Do not mention the words "real-time data" or "provided metrics".
      `
    }

    let recommendation = '';
    try {
      const result = await model.generateContent(prompt)
      recommendation = result.response.text()
    } catch (apiError) {
      console.warn("Gemini API failed, using fallback:", apiError);
      
      const moisture = fieldData.soil.moisture;
      const ph = fieldData.soil.pH;
      const temp = fieldData.weather.temperature;
      const ndvi = fieldData.ndvi;
      
      if (voice_query) {
        const q = voice_query.toLowerCase();
        if (q.includes("water") || q.includes("irrigation") || q.includes("moisture") || q.includes("dry")) {
          if (moisture < 40) {
            recommendation = `The soil moisture for your ${crop} is quite low at ${moisture}%. I recommend starting an irrigation cycle soon.`;
          } else if (moisture > 70) {
            recommendation = `The moisture level is high at ${moisture}%. You can hold off on watering for now.`;
          } else {
            recommendation = `Your soil moisture is perfectly balanced at ${moisture}%. Keep up your current schedule.`;
          }
        } else if (q.includes("health") || q.includes("ndvi") || q.includes("growth") || q.includes("doing")) {
          if (ndvi > 0.6) {
            recommendation = `Your ${crop} is showing excellent health with an NDVI of ${ndvi}. The canopy is dense and growing vigorously.`;
          } else if (ndvi < 0.4) {
            recommendation = `The NDVI for your ${crop} is slightly low at ${ndvi}. You should inspect the field for potential issues.`;
          } else {
            recommendation = `The crop health is average, with an NDVI of ${ndvi}. Consistent monitoring is advised.`;
          }
        } else if (q.includes("fertilizer") || q.includes("ph") || q.includes("soil") || q.includes("nutrient")) {
          if (ph < 6.0) {
            recommendation = `Your soil is somewhat acidic with a pH of ${ph}. Consider applying lime to optimize nutrient uptake.`;
          } else if (ph > 7.5) {
            recommendation = `The soil pH is slightly high at ${ph}. Applying sulfur might help lower it for better yield.`;
          } else {
            recommendation = `Your soil pH is excellent at ${ph}. No immediate pH correction is needed.`;
          }
        } else if (q.includes("weather") || q.includes("temperature") || q.includes("hot") || q.includes("cold")) {
          recommendation = `It's currently ${temp}°C with ${fieldData.weather.humidity}% humidity in the field. These are generally favorable conditions.`;
        } else {
          recommendation = `Overall, your ${crop} is doing well. The NDVI is ${ndvi} and moisture is at ${moisture}%. Is there a specific metric you'd like me to analyze?`;
        }
      } else {
        const defaultGuide = cropGuides[crop.toLowerCase()] || `### ${crop.charAt(0).toUpperCase() + crop.slice(1)} Cultivation Guide\n\nEnsure proper soil preparation, adequate irrigation, and timely nutrient management for optimal yield. Consult local agronomic guides for specific ${crop} seed rates and harvesting times.`;
        
        recommendation = `${defaultGuide}

---

### Real-Time Field Assessment for ${crop.charAt(0).toUpperCase() + crop.slice(1)}

Based on the latest satellite and ground sensor readings, here is a detailed breakdown of your field's status and recommended actions.

#### 1. Crop Health & Vigor
Your current **NDVI is ${ndvi}**, which indicates ${ndvi > 0.6 ? 'robust and dense vegetative growth' : ndvi > 0.4 ? 'moderate growth with some areas needing attention' : 'sparse vegetation or early growth stages'}. 
* **Observation**: The canopy development is proceeding as expected for the current temperature profile (${temp}°C). 
* **Action**: Continue standard scouting protocols. If the NDVI drops below 0.4 during peak vegetative stages, consider a targeted foliar nutrient application.

#### 2. Precision Soil & Nutrient Management
The soil profile shows a **moisture level of ${moisture}%** and a **pH of ${ph}**.
* **Irrigation**: ${moisture < 40 ? 'Moisture is nearing the wilting point. Initiate a deep irrigation cycle within 24 hours.' : moisture > 70 ? 'Moisture is ample. Hold irrigation for the next 48 hours to promote deep root growth.' : 'Moisture is optimal. Maintain current irrigation scheduling.'}
* **Nutrient Uptake**: A pH of ${ph} is ${ph >= 6.0 && ph <= 7.5 ? 'ideal for maximizing macronutrient availability (N, P, K).' : 'sub-optimal. Nutrient lockout may occur. Plan a soil amendment strategy post-harvest.'} 

#### 3. Disease & Pest Forecasting
With current humidity at **${fieldData.weather.humidity}%** and temperatures at **${temp}°C**:
* **Fungal Risk**: ${fieldData.weather.humidity > 70 ? 'High humidity creates a favorable environment for fungal pathogens. Apply preventative fungicides if canopy density is high.' : 'Low to moderate risk of fungal infections at these humidity levels.'}
* **Pest Pressure**: Warm temperatures can accelerate the lifecycle of common pests for ${crop}. Deploy sticky traps for early detection.

#### 4. Yield Optimization Strategy
To maximize your harvest potential:
1. Optimize water-use efficiency by irrigating during early morning hours.
2. Maintain strict weed control to prevent resource competition.
3. Keep monitoring the NDVI timeline—any sudden dips should trigger an immediate physical field inspection.
`;
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
