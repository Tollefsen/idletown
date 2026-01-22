/**
 * Climate calculations for temperature and moisture
 */

/**
 * Calculate temperature based on latitude (y position)
 * Returns value 0-1 where 0 = cold (poles), 1 = hot (equator)
 */
export function calculateTemperature(
  y: number,
  height: number,
  elevation: number,
  noiseValue: number = 0,
): number {
  // Base temperature from latitude (hottest at equator, coldest at poles)
  const normalizedY = y / height;
  const latitudeTemp = 1 - Math.abs(normalizedY - 0.5) * 2;

  // Higher elevation = colder (lapse rate effect)
  const elevationPenalty = Math.max(0, elevation - 0.5) * 0.5;

  // Add some noise variation for realism
  const noiseFactor = noiseValue * 0.15;

  return Math.max(
    0,
    Math.min(1, latitudeTemp - elevationPenalty + noiseFactor),
  );
}

/**
 * Calculate distance from each point to nearest water
 * Uses a simple flood-fill approach
 * Rivers can optionally be included as water sources
 */
export function calculateDistanceToWater(
  elevationMap: Float32Array,
  width: number,
  height: number,
  seaLevel: number,
  rivers?: Set<number>,
): Float32Array {
  const distances = new Float32Array(width * height);
  const maxDistance = Math.sqrt(width * width + height * height);

  // Initialize: water = 0, rivers = 0, land = max distance
  for (let i = 0; i < elevationMap.length; i++) {
    const isWater = elevationMap[i] < seaLevel;
    const isRiver = rivers?.has(i) ?? false;
    distances[i] = isWater || isRiver ? 0 : maxDistance;
  }

  // Simple distance propagation (multiple passes for better accuracy)
  const passes = 3;
  for (let pass = 0; pass < passes; pass++) {
    // Forward pass
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (distances[idx] === 0) continue;

        let minDist = distances[idx];

        // Check neighbors
        if (x > 0) minDist = Math.min(minDist, distances[idx - 1] + 1);
        if (y > 0) minDist = Math.min(minDist, distances[idx - width] + 1);
        if (x > 0 && y > 0)
          minDist = Math.min(minDist, distances[idx - width - 1] + Math.SQRT2);
        if (x < width - 1 && y > 0)
          minDist = Math.min(minDist, distances[idx - width + 1] + Math.SQRT2);

        distances[idx] = minDist;
      }
    }

    // Backward pass
    for (let y = height - 1; y >= 0; y--) {
      for (let x = width - 1; x >= 0; x--) {
        const idx = y * width + x;
        if (distances[idx] === 0) continue;

        let minDist = distances[idx];

        // Check neighbors
        if (x < width - 1) minDist = Math.min(minDist, distances[idx + 1] + 1);
        if (y < height - 1)
          minDist = Math.min(minDist, distances[idx + width] + 1);
        if (x < width - 1 && y < height - 1)
          minDist = Math.min(minDist, distances[idx + width + 1] + Math.SQRT2);
        if (x > 0 && y < height - 1)
          minDist = Math.min(minDist, distances[idx + width - 1] + Math.SQRT2);

        distances[idx] = minDist;
      }
    }
  }

  return distances;
}

/**
 * Calculate moisture based on distance from water
 * Returns value 0-1 where 1 = wet (near water), 0 = dry (far from water)
 */
export function calculateMoisture(
  distanceToWater: number,
  maxDistance: number,
  noiseValue: number = 0,
): number {
  // Normalize distance and invert (closer = wetter)
  const normalizedDistance = Math.min(1, distanceToWater / maxDistance);

  // Use exponential falloff for more realistic moisture distribution
  const baseMoisture = Math.exp(-normalizedDistance * 3);

  // Add noise variation
  const noiseFactor = noiseValue * 0.2;

  return Math.max(0, Math.min(1, baseMoisture + noiseFactor));
}
