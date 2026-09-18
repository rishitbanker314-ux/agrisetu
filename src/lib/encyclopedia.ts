export type DiseaseName = string;

export const diseaseEncyclopedia: Record<DiseaseName, string> = {
  "defective": `
### 🚨 Damaged or Rotting Crop Detected

**What is happening?**
The system has detected that your crop has physical damage, severe bruising, or is rotting. This often happens because of rough handling during harvest, or because fungi have started attacking the fruit in storage. In the field, it can be caused by extreme weather or pests physically damaging the crop.

**What you should do:**
*   **Separate Immediately:** Remove the damaged crops right away. If you leave rotting crops next to healthy ones, the rot will spread very quickly.
*   **Check Storage:** If these are stored crops, make sure your storage room is not too hot or too humid. High moisture causes fast rotting.
*   **Prevent Future Rot:** If the crop is still in the field, you can spray a basic copper fungicide to stop the rot from spreading to healthy fruits.
  `,
  "healthy": `
### ✅ Healthy Crop!

**What is happening?**
Great news! The image shows a completely healthy crop. There are no signs of diseases, fungal spots, or pest damage on the surface. Your plant is growing well.

**What you should do:**
*   **Keep it up:** Continue your regular watering and fertilizer schedule. Whatever you are doing is working!
*   **Give them space:** Make sure your plants have enough space between them so the wind can dry the leaves. Wet leaves invite fungus.
*   **Keep Checking:** Continue to take photos of random plants every week so you can catch any future diseases early.
  `,
  "bean_rust": `
### 🍂 Bean Rust

**What is happening?**
Your plant has Bean Rust. This is a very common fungal disease. You will see small, rust-colored or brown powdery spots on the leaves. These spots are actually millions of tiny fungal spores that can blow in the wind and infect your whole field very quickly, especially in humid weather.

**What you should do:**
*   **Spray Immediately:** You need to apply a fungicide spray right away to stop the fungus from growing. 
*   **Watering:** Stop using overhead sprinklers (like rain guns) if you can. Water the roots directly instead. The fungus needs wet leaves to grow.
*   **Next Season:** Do not plant beans in this exact same spot next year. The fungus can survive in the soil over winter.
  `,
  "angular_leaf_spot": `
### 🦠 Angular Leaf Spot

**What is happening?**
Your plant is suffering from Angular Leaf Spot. This is caused by bacteria, not a fungus. You will notice small, square-shaped brown spots on the leaves. Because it is a bacteria, regular fungal sprays will not work.

**What you should do:**
*   **Spray Copper:** You must spray a copper-based bactericide immediately. Copper kills bacteria effectively.
*   **Stay Out of the Field:** Do not walk through the field or touch the plants when they are wet (like after rain or morning dew). You will easily spread the bacteria from plant to plant on your clothes and hands.
*   **Clean Seeds:** For your next planting, make sure you only buy certified, disease-free seeds.
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
