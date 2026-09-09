import { findCropProfile, CropProfile } from './cropKnowledgeBase';

export interface ViabilityReport {
  isViable: boolean;
  reason: string;
  type: 'success' | 'warning' | 'error';
}

export function evaluateCropSuitability(
  cropName: string,
  temperature: number,
  elevation?: number
): ViabilityReport {
  const profile = findCropProfile(cropName);

  if (!profile) {
    // If crop is not in database, we can't be strictly accurate, so we assume it might be fine,
    // but maybe warn the user that we lack specific data for it.
    return {
      isViable: true,
      reason: `No detailed climatic data found for '${cropName}'. Please ensure local conditions are suitable.`,
      type: 'warning'
    };
  }

  const reasons: string[] = [];
  let isError = false;
  let isWarning = false;

  // Temperature Checks
  if (temperature > profile.tempMax) {
    isError = true;
    reasons.push(`The current/average temperature (${temperature}°C) exceeds the absolute maximum threshold (${profile.tempMax}°C) for ${profile.name}.`);
  } else if (temperature < profile.tempMin) {
    isError = true;
    reasons.push(`The current/average temperature (${temperature}°C) is below the minimum survival threshold (${profile.tempMin}°C) for ${profile.name}.`);
  } else if (temperature > profile.tempOptimalMax) {
    isWarning = true;
    reasons.push(`The temperature (${temperature}°C) is above the optimal range (${profile.tempOptimalMin}-${profile.tempOptimalMax}°C), which may reduce yield.`);
  } else if (temperature < profile.tempOptimalMin) {
    isWarning = true;
    reasons.push(`The temperature (${temperature}°C) is below the optimal range (${profile.tempOptimalMin}-${profile.tempOptimalMax}°C), which may slow growth.`);
  }

  // Elevation Checks
  if (elevation !== undefined) {
    if (profile.altitudeMax && elevation > profile.altitudeMax) {
      isError = true;
      reasons.push(`Elevation (${Math.round(elevation)}m) exceeds the maximum altitude limit (${profile.altitudeMax}m) for ${profile.name}.`);
    } else if (profile.altitudeMin && elevation < profile.altitudeMin) {
      isError = true;
      reasons.push(`Elevation (${Math.round(elevation)}m) is below the minimum required altitude (${profile.altitudeMin}m) for ${profile.name}.`);
    }
  }

  if (isError) {
    return {
      isViable: false,
      reason: reasons.join(' ') + ' ' + profile.description,
      type: 'error'
    };
  }

  if (isWarning) {
    return {
      isViable: true,
      reason: reasons.join(' ') + ' ' + profile.description,
      type: 'warning'
    };
  }

  return {
    isViable: true,
    reason: `Optimal conditions. ${profile.description}`,
    type: 'success'
  };
}

// Keep backward compatibility for DrawerTabs
export function checkCropViability(crop: string, fieldData: any): { isViable: boolean; reason: string } {
  if (!fieldData || !fieldData.coordinates) {
    return { isViable: true, reason: '' };
  }
  const temp = fieldData.weather?.temperature || 25;
  const elevation = fieldData.coordinates.elevation || undefined; // Assuming we might add elevation later

  const result = evaluateCropSuitability(crop, temp, elevation);
  return {
    isViable: result.isViable,
    reason: result.reason
  };
}
