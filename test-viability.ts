import { checkCropViability } from './src/lib/cropViability.js';

console.log(checkCropViability('apple', { coordinates: { lat: 22, lng: 71 }, weather: { temperature: 35 } }));
console.log(checkCropViability('sugarcane', { coordinates: { lat: 22, lng: 71 }, weather: { temperature: 35 } }));
console.log(checkCropViability('Wheat', { coordinates: { lat: 22, lng: 71 }, weather: { temperature: 35 } }));
console.log(checkCropViability('Cotton', { coordinates: { lat: 22, lng: 71 }, weather: { temperature: 35 } }));
