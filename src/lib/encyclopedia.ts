export type DiseaseName = string;

export const diseaseEncyclopedia: Record<DiseaseName, string> = {
  "defective": `
### 🚨 Damaged or Rotting Crop Detected

**What is happening?**
The system has detected that your crop has physical damage, severe bruising, or is rotting. This often happens because of rough handling during harvest, or because fungi have started attacking the fruit in storage. In the field, it can be caused by extreme weather or pests physically damaging the crop.

**Detected Symptoms:**
*   Visible bruising or cuts on the crop surface.
*   Soft, mushy areas indicating active rot.
*   Possible secondary fungal growth (mold) on damaged areas.

**Environmental Factors:**
High humidity and warm temperatures rapidly accelerate rotting in damaged crops. Poor ventilation in storage areas is a primary contributor.

**Comprehensive Action Plan:**
*   **Immediate Action:** Sort and remove the damaged crops immediately to prevent the spread of rot to healthy produce.
*   **Storage Management:** Ensure your storage room is well-ventilated, cool, and dry.
*   **Preventative Measures:** Handle crops with care during the next harvest to avoid physical damage. Use clean, sanitized crates and storage bins.
  `,
  "healthy": `
### ✅ Healthy Crop!

**What is happening?**
Great news! The image shows a completely healthy crop. There are no signs of diseases, fungal spots, or pest damage on the surface. Your plant is growing well.

**Detected Symptoms:**
*   None. Leaves are green, intact, and showing vigorous growth.

**Environmental Factors:**
Your current watering and environmental conditions appear to be optimal for this crop.

**Comprehensive Action Plan:**
*   **Keep it up:** Continue your regular watering and fertilizer schedule.
*   **Airflow:** Maintain adequate spacing between plants to ensure good airflow, which keeps leaves dry and prevents future fungal issues.
*   **Monitoring:** Continue to inspect your crops weekly to catch any early signs of pests or diseases.
  `,
  "bean_rust": `
### 🍂 Bean Rust (Uromyces appendiculatus)

**What is happening?**
Your plant has Bean Rust. This is a very common fungal disease. You will see small, rust-colored or brown powdery spots on the leaves. These spots are actually millions of tiny fungal spores that can blow in the wind and infect your whole field very quickly, especially in humid weather.

**Detected Symptoms:**
*   Small, reddish-brown pustules on the upper and lower leaf surfaces.
*   Yellowing (chlorosis) around the pustules.
*   In severe cases, leaves may dry up and drop prematurely.

**Environmental Factors:**
This disease thrives in highly humid conditions (above 95%) and moderate temperatures (20-25°C). Extended periods of leaf wetness from dew or rain are critical for infection.

**Comprehensive Action Plan:**
*   **Immediate Action:** Apply a recommended fungicide spray immediately to halt the spread.
*   **Cultural Controls:** Avoid using overhead sprinklers; water at the base of the plant instead. Do not work in the field when plants are wet.
*   **Chemical/Biological Controls:** Use fungicides containing Chlorothalonil or Propiconazole. For organic options, consider sulfur or copper-based sprays (check local regulations).
*   **Preventative Measures:** Practice crop rotation (do not plant beans in the same spot next year). Use rust-resistant bean varieties for future plantings.
  `,
  "angular_leaf_spot": `
### 🦠 Angular Leaf Spot (Pseudomonas syringae)

**What is happening?**
Your plant is suffering from Angular Leaf Spot. This is caused by bacteria, not a fungus. You will notice small, square-shaped brown spots on the leaves. Because it is a bacteria, regular fungal sprays will not work.

**Detected Symptoms:**
*   Small, water-soaked spots on leaves that turn brown or grayish.
*   The spots are restricted by leaf veins, giving them an angular, square-like appearance.
*   Spots may be surrounded by a yellow halo.

**Environmental Factors:**
The bacteria spread rapidly during periods of heavy rainfall, high humidity, and warm temperatures. Wind-driven rain is the primary method of spread.

**Comprehensive Action Plan:**
*   **Immediate Action:** Spray a copper-based bactericide immediately.
*   **Cultural Controls:** Do not walk through the field or touch the plants when they are wet to avoid spreading the bacteria manually.
*   **Chemical/Biological Controls:** Copper Hydroxide or agricultural antibiotics (where permitted).
*   **Preventative Measures:** Ensure you buy certified, disease-free seeds. Plow under crop debris after harvest, as the bacteria can survive on dead plant material.
  `
};

export const cureRecommendations: Record<DiseaseName, string[]> = {
  "defective": ["Copper Oxychloride WP", "Mancozeb Fungicide"],
  "healthy": ["Seaweed Extract Bio-Stimulant", "NPK 19-19-19 Water Soluble Fertilizer"],
  "bean_rust": ["Chlorothalonil Fungicide", "Propiconazole EC", "Tebuconazole Fungicide"],
  "angular_leaf_spot": ["Copper Hydroxide Bactericide", "Streptomycin Sulfate Agricultural Antibiotic"]
};

/**
 * Gets a highly detailed agronomic report for a specific disease label.
 * @param diseaseLabel The raw label output from the ML model
 * @returns Markdown formatted report
 */
export function getTreatmentReport(diseaseLabel: string): string {
  const normalizedLabel = diseaseLabel.toLowerCase().trim();
  
  if (diseaseEncyclopedia[normalizedLabel]) {
    return diseaseEncyclopedia[normalizedLabel];
  }

  // Fallback for an unknown disease the user might train later
  const formattedLabel = diseaseLabel
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return `
### ⚠️ ${formattedLabel} Detected

**What is happening?**
Our system has detected symptoms that match **${formattedLabel}**. 

**What you should do:**
*   **Ask a Local Expert:** Please show this diagnosis to a local agricultural expert or shop owner to get the exact medicine needed for your area.
*   **Remove Bad Leaves:** Pluck off and burn the heavily infected leaves so the disease doesn't spread.
*   **Check Moisture:** Make sure your plants are getting sunlight and the leaves are not staying wet overnight.
  `;
}
