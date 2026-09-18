import { generateFieldIntelligence } from './src/lib/fieldIntelligence';
async function test() {
  try {
    const data = await generateFieldIntelligence(22.3, 71.4, [], 'Wheat', 10);
    console.log("Success:", !!data);
  } catch (e) {
    console.error(e);
  }
}
test();
