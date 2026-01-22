/**
 * World generation orchestration
 * Uses a two-pass system: shape heightmap + fractal noise, blended together
 */

import { BIOMES, type Biome, getBiome, selectPaletteColor } from "./biomes";
import {
  calculateDistanceToWater,
  calculateMoisture,
  calculateTemperature,
} from "./climate";
import {
  DEFAULT_NOISE_PARAMS,
  fractalNoise,
  initNoise,
  type NoiseParams,
  simplex2,
} from "./noise";
import { createSeededRandom, stringToSeed } from "./seededRandom";

export type MapSize = 512 | 768 | 1024;

export type WorldShape =
  | "archipelago"
  | "continent"
  | "pangaea"
  | "multiContinent"
  | "random";

export type FeatureDensity = {
  lakes: number; // 0-10
  inlandSeas: number; // 0-3
  mountains: number; // 0-5
  rivers: number; // 0-15
};

export type WorldParams = {
  size: MapSize;
  seed: string;
  seaLevel: number;
  islandFactor: number;
  noiseParams: NoiseParams;
  shape: WorldShape;
  featureDensity: FeatureDensity;
};

export type WorldData = {
  width: number;
  height: number;
  elevation: Float32Array;
  temperature: Float32Array;
  moisture: Float32Array;
  biomes: Biome[];
  detailNoise: Float32Array;
  imageData: ImageData;
  rivers: Set<number>; // pixel indices that are rivers
};

export const DEFAULT_FEATURE_DENSITY: FeatureDensity = {
  lakes: 5,
  inlandSeas: 1,
  mountains: 2,
  rivers: 8,
};

export const DEFAULT_WORLD_PARAMS: WorldParams = {
  size: 512,
  seed: "ISLAND01",
  seaLevel: 0.4,
  islandFactor: 0.7,
  noiseParams: DEFAULT_NOISE_PARAMS,
  shape: "archipelago",
  featureDensity: DEFAULT_FEATURE_DENSITY,
};

// ============================================================================
// Helper Functions
// ============================================================================

// Water body (lake or inland sea)
type WaterBody = {
  x: number; // 0-1 normalized
  y: number;
  radiusX: number;
  radiusY: number;
  depth: number; // how far below sea level (0.05-0.15)
};

// Mountain ridge (linear chain)
type MountainRidge = {
  points: Array<{ x: number; y: number }>; // 2+ control points
  width: number; // falloff width from ridge
  peakHeight: number; // max elevation boost
};

// Volcanic peak (isolated mountain)
type VolcanicPeak = {
  x: number;
  y: number;
  radius: number;
  height: number;
};

/**
 * Attempt to find valid spacing, with fallback to random placement if impossible
 */
function tryGenerateSpacedCenters(
  random: () => number,
  count: number,
  minSpacing: number,
  margin: number,
  minRadius: number,
  maxRadius: number,
  maxAttempts = 100,
): Array<{ x: number; y: number; radius: number }> {
  const centers: Array<{ x: number; y: number; radius: number }> = [];
  const availableRange = 1 - 2 * margin;

  for (let i = 0; i < count; i++) {
    let placed = false;

    for (let attempt = 0; attempt < maxAttempts && !placed; attempt++) {
      const x = margin + random() * availableRange;
      const y = margin + random() * availableRange;

      // Check distance from all existing centers
      let tooClose = false;
      for (const existing of centers) {
        const dx = x - existing.x;
        const dy = y - existing.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minSpacing) {
          tooClose = true;
          break;
        }
      }

      if (!tooClose) {
        centers.push({
          x,
          y,
          radius: minRadius + random() * (maxRadius - minRadius),
        });
        placed = true;
      }
    }

    // Fallback: if we couldn't place with spacing, just place randomly
    if (!placed) {
      centers.push({
        x: margin + random() * availableRange,
        y: margin + random() * availableRange,
        radius: minRadius + random() * (maxRadius - minRadius),
      });
    }
  }

  return centers;
}

/**
 * Smooth interpolation function (avoid harsh transitions)
 */
function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * Warp coordinates using noise for organic shapes
 */
function warpCoordinates(
  x: number,
  y: number,
  _size: number,
  warpScale: number,
  warpStrength: number,
): { x: number; y: number } {
  const warpX = x + simplex2(x * warpScale, y * warpScale) * warpStrength;
  const warpY =
    y + simplex2(x * warpScale + 100, y * warpScale + 100) * warpStrength;
  return { x: warpX, y: warpY };
}

/**
 * Calculate edge fade factor to avoid hard map borders
 */
function calculateEdgeFade(
  x: number,
  y: number,
  size: number,
  fadeWidth: number,
): number {
  const fadePixels = size * fadeWidth;
  const edgeX = Math.min(x, size - 1 - x) / fadePixels;
  const edgeY = Math.min(y, size - 1 - y) / fadePixels;
  return Math.min(1, Math.min(edgeX, edgeY));
}

/**
 * Get blend factor for shape (how much noise vs shape heightmap)
 * Higher = more noise influence
 */
function getBlendFactor(shape: WorldShape): number {
  switch (shape) {
    case "archipelago":
      return 0.55; // Islands defined by shape, noise adds variety
    case "continent":
      return 0.45; // Balance between defined landmass and terrain detail
    case "pangaea":
      return 0.4; // Shape ensures mostly land, noise creates inland features
    case "multiContinent":
      return 0.45; // Clear continent separation, detailed terrain
    case "random":
      return 1.0; // Pure procedural chaos
  }
}

/**
 * Get feature density multiplier based on world shape
 * Returns multipliers for each feature type
 */
function getFeatureMultipliers(shape: WorldShape): {
  lakes: number;
  inlandSeas: number;
  mountains: number;
  rivers: number;
} {
  switch (shape) {
    case "pangaea":
      return { lakes: 1.0, inlandSeas: 1.0, mountains: 1.0, rivers: 1.0 };
    case "continent":
      return { lakes: 0.8, inlandSeas: 0.5, mountains: 0.8, rivers: 0.8 };
    case "multiContinent":
      return { lakes: 0.6, inlandSeas: 0.2, mountains: 0.7, rivers: 0.6 };
    case "archipelago":
      return { lakes: 0.2, inlandSeas: 0, mountains: 0.5, rivers: 0.1 };
    case "random":
      return { lakes: 0.5, inlandSeas: 0.3, mountains: 0.5, rivers: 0.5 };
  }
}

/**
 * Generate lakes - placed near mountains or in lowlands
 */
function generateLakes(
  random: () => number,
  count: number,
  ridges: MountainRidge[],
  margin = 0.15,
): WaterBody[] {
  const lakes: WaterBody[] = [];

  for (let i = 0; i < count; i++) {
    let x: number;
    let y: number;

    // 50% chance near mountains (if we have ridges), 50% random lowland
    if (random() < 0.5 && ridges.length > 0) {
      // Place near a random ridge point
      const ridge = ridges[Math.floor(random() * ridges.length)];
      const point = ridge.points[Math.floor(random() * ridge.points.length)];
      // Offset from ridge (glacial lake style)
      x = point.x + (random() - 0.5) * 0.15;
      y = point.y + (random() - 0.5) * 0.15;
    } else {
      // Random placement in interior
      x = margin + random() * (1 - 2 * margin);
      y = margin + random() * (1 - 2 * margin);
    }

    // Clamp to valid range
    x = Math.max(margin, Math.min(1 - margin, x));
    y = Math.max(margin, Math.min(1 - margin, y));

    // Random elliptical shape
    const baseRadius = 0.02 + random() * 0.03;
    lakes.push({
      x,
      y,
      radiusX: baseRadius * (0.8 + random() * 0.4),
      radiusY: baseRadius * (0.8 + random() * 0.4),
      depth: 0.06 + random() * 0.04, // How far below sea level
    });
  }

  return lakes;
}

/**
 * Generate inland seas - larger water bodies in continental interiors
 */
function generateInlandSeas(
  random: () => number,
  count: number,
  margin = 0.2,
): WaterBody[] {
  const seas: WaterBody[] = [];

  for (let i = 0; i < count; i++) {
    // Place in interior, away from edges
    const x = margin + random() * (1 - 2 * margin);
    const y = margin + random() * (1 - 2 * margin);

    // Larger than lakes
    const baseRadius = 0.08 + random() * 0.08;
    seas.push({
      x,
      y,
      radiusX: baseRadius * (0.7 + random() * 0.6),
      radiusY: baseRadius * (0.7 + random() * 0.6),
      depth: 0.1 + random() * 0.05,
    });
  }

  return seas;
}

/**
 * Generate mountain ridges that follow continent shape
 */
function generateMountainRidges(
  random: () => number,
  count: number,
  continentCenter?: ContinentCenter,
  continents?: ContinentCenter[],
): MountainRidge[] {
  const ridges: MountainRidge[] = [];

  for (let i = 0; i < count; i++) {
    let points: Array<{ x: number; y: number }>;
    let width: number;
    let peakHeight: number;

    if (continentCenter) {
      // Single continent: create ridge along edge (like coastal mountains)
      const angle = random() * Math.PI * 2;
      const edgeDist = 0.5 + random() * 0.3; // 50-80% from center to edge
      const arcLength = 0.4 + random() * 0.4; // How much of the arc to cover

      const startAngle = angle - arcLength / 2;
      const midAngle = angle;
      const endAngle = angle + arcLength / 2;

      points = [
        {
          x:
            continentCenter.x +
            Math.cos(startAngle) * continentCenter.radiusX * edgeDist,
          y:
            continentCenter.y +
            Math.sin(startAngle) * continentCenter.radiusY * edgeDist,
        },
        {
          x:
            continentCenter.x +
            Math.cos(midAngle) * continentCenter.radiusX * edgeDist * 0.95,
          y:
            continentCenter.y +
            Math.sin(midAngle) * continentCenter.radiusY * edgeDist * 0.95,
        },
        {
          x:
            continentCenter.x +
            Math.cos(endAngle) * continentCenter.radiusX * edgeDist,
          y:
            continentCenter.y +
            Math.sin(endAngle) * continentCenter.radiusY * edgeDist,
        },
      ];
      width = 0.04 + random() * 0.03;
      peakHeight = 0.25 + random() * 0.15;
    } else if (continents && continents.length > 0) {
      // Multi-continent: add ridge to a random continent
      const continent = continents[Math.floor(random() * continents.length)];
      const angle = random() * Math.PI * 2;
      const edgeDist = 0.4 + random() * 0.3;
      const arcLength = 0.3 + random() * 0.3;

      const startAngle = angle - arcLength / 2;
      const endAngle = angle + arcLength / 2;

      points = [
        {
          x: continent.x + Math.cos(startAngle) * continent.radiusX * edgeDist,
          y: continent.y + Math.sin(startAngle) * continent.radiusY * edgeDist,
        },
        {
          x: continent.x + Math.cos(endAngle) * continent.radiusX * edgeDist,
          y: continent.y + Math.sin(endAngle) * continent.radiusY * edgeDist,
        },
      ];
      width = 0.03 + random() * 0.03;
      peakHeight = 0.2 + random() * 0.15;
    } else {
      // Pangaea or random: create long ridges across the map
      const vertical = random() > 0.5;
      const offset = 0.2 + random() * 0.6;

      if (vertical) {
        points = [
          { x: offset, y: 0.1 + random() * 0.2 },
          { x: offset + (random() - 0.5) * 0.2, y: 0.5 },
          { x: offset + (random() - 0.5) * 0.1, y: 0.7 + random() * 0.2 },
        ];
      } else {
        points = [
          { x: 0.1 + random() * 0.2, y: offset },
          { x: 0.5, y: offset + (random() - 0.5) * 0.2 },
          { x: 0.7 + random() * 0.2, y: offset + (random() - 0.5) * 0.1 },
        ];
      }
      width = 0.05 + random() * 0.04;
      peakHeight = 0.3 + random() * 0.15;
    }

    ridges.push({ points, width, peakHeight });
  }

  return ridges;
}

/**
 * Generate volcanic peaks (isolated mountains)
 */
function generateVolcanicPeaks(
  random: () => number,
  count: number,
  islands?: IslandCenter[],
  margin = 0.15,
): VolcanicPeak[] {
  const peaks: VolcanicPeak[] = [];

  for (let i = 0; i < count; i++) {
    let x: number;
    let y: number;

    if (islands && islands.length > 0) {
      // Place on islands (volcanic island chain)
      const island = islands[Math.floor(random() * islands.length)];
      x = island.x + (random() - 0.5) * island.radius * 0.5;
      y = island.y + (random() - 0.5) * island.radius * 0.5;
    } else {
      // Random placement
      x = margin + random() * (1 - 2 * margin);
      y = margin + random() * (1 - 2 * margin);
    }

    peaks.push({
      x,
      y,
      radius: 0.02 + random() * 0.03,
      height: 0.3 + random() * 0.2,
    });
  }

  return peaks;
}

/**
 * Sample water bodies at a given position
 * Returns negative value if inside water body (depth below sea level)
 */
function sampleWaterBodies(
  nx: number,
  ny: number,
  lakes: WaterBody[],
  inlandSeas: WaterBody[],
): number {
  // Check all water bodies
  const allWater = [...lakes, ...inlandSeas];

  for (const water of allWater) {
    const dx = (nx - water.x) / water.radiusX;
    const dy = (ny - water.y) / water.radiusY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 1) {
      // Inside water body - return depth below sea level
      const depthFactor = 1 - smoothstep(0, 1, dist);
      return -water.depth * depthFactor;
    }
  }

  return 0; // Not in any water body
}

/**
 * Sample mountain elevation at a given position
 * Returns elevation boost
 */
function sampleMountains(
  nx: number,
  ny: number,
  ridges: MountainRidge[],
  peaks: VolcanicPeak[],
): number {
  let elevation = 0;

  // Sample ridges
  for (const ridge of ridges) {
    // Find minimum distance to ridge line segments
    let minDist = Number.POSITIVE_INFINITY;

    for (let i = 0; i < ridge.points.length - 1; i++) {
      const p1 = ridge.points[i];
      const p2 = ridge.points[i + 1];

      // Distance from point to line segment
      const dist = pointToSegmentDistance(nx, ny, p1.x, p1.y, p2.x, p2.y);
      minDist = Math.min(minDist, dist);
    }

    // Apply ridge elevation based on distance
    if (minDist < ridge.width) {
      const ridgeFactor = 1 - smoothstep(0, ridge.width, minDist);
      // Add some noise variation along the ridge for peaks
      const peakNoise = simplex2(nx * 30, ny * 30) * 0.3 + 0.7;
      elevation = Math.max(
        elevation,
        ridge.peakHeight * ridgeFactor * peakNoise,
      );
    }
  }

  // Sample volcanic peaks
  for (const peak of peaks) {
    const dx = nx - peak.x;
    const dy = ny - peak.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < peak.radius) {
      const peakFactor = 1 - smoothstep(0, peak.radius, dist);
      elevation = Math.max(elevation, peak.height * peakFactor);
    }
  }

  return elevation;
}

/**
 * Calculate distance from point to line segment
 */
function pointToSegmentDistance(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSq = dx * dx + dy * dy;

  if (lengthSq === 0) {
    // Segment is a point
    return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
  }

  // Project point onto line, clamped to segment
  let t = ((px - x1) * dx + (py - y1) * dy) / lengthSq;
  t = Math.max(0, Math.min(1, t));

  const projX = x1 + t * dx;
  const projY = y1 + t * dy;

  return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2);
}

// ============================================================================
// Shape Configuration (Pre-computed per generation)
// ============================================================================

type IslandCenter = { x: number; y: number; radius: number };
type ContinentCenter = {
  x: number;
  y: number;
  radiusX: number;
  radiusY: number;
};

type ShapeConfig = {
  shape: WorldShape;
  islands?: IslandCenter[];
  continentCenter?: ContinentCenter;
  continents?: ContinentCenter[];
  warpScale: number;
  warpStrength: number;
  // Terrain features
  lakes?: WaterBody[];
  inlandSeas?: WaterBody[];
  ridges?: MountainRidge[];
  peaks?: VolcanicPeak[];
};

/**
 * Pre-compute shape parameters based on seed
 * Called once before pixel loops
 */
function generateShapeConfig(
  shape: WorldShape,
  size: number,
  numericSeed: number,
  landSpread: number,
  featureDensity: FeatureDensity,
): ShapeConfig {
  const random = createSeededRandom(numericSeed + 3000);
  const featureRandom = createSeededRandom(numericSeed + 4000);

  // Warp parameters - make coastlines organic
  const warpScale = 0.008;
  const warpStrength = size * 0.12;

  // Get feature multipliers for this shape
  const multipliers = getFeatureMultipliers(shape);

  // Calculate actual feature counts
  const lakeCount = Math.round(featureDensity.lakes * multipliers.lakes);
  const seaCount = Math.round(
    featureDensity.inlandSeas * multipliers.inlandSeas,
  );
  const mountainCount = Math.round(
    featureDensity.mountains * multipliers.mountains,
  );

  // Build base config based on shape
  let baseConfig: ShapeConfig;

  switch (shape) {
    case "archipelago": {
      // Number of islands influenced by landSpread (inverted: low spread = more islands)
      const baseCount = Math.floor(18 - landSpread * 8);
      const islandCount = Math.max(5, baseCount + Math.floor(random() * 5));

      const minSpacing = 0.15;
      const margin = 0.1;
      const minRadius = 0.08 + (1 - landSpread) * 0.04;
      const maxRadius = 0.18 + (1 - landSpread) * 0.08;

      const islands = tryGenerateSpacedCenters(
        random,
        islandCount,
        minSpacing,
        margin,
        minRadius,
        maxRadius,
      );

      baseConfig = { shape, islands, warpScale, warpStrength };
      break;
    }

    case "continent": {
      const offsetX = (random() - 0.5) * 0.15;
      const offsetY = (random() - 0.5) * 0.15;

      const continentCenter: ContinentCenter = {
        x: 0.5 + offsetX,
        y: 0.5 + offsetY,
        radiusX: 0.4 + random() * 0.1,
        radiusY: 0.35 + random() * 0.1,
      };

      baseConfig = {
        shape,
        continentCenter,
        warpScale,
        warpStrength: warpStrength * 1.2,
      };
      break;
    }

    case "pangaea": {
      baseConfig = {
        shape,
        warpScale: warpScale * 0.5,
        warpStrength: warpStrength * 0.5,
      };
      break;
    }

    case "multiContinent": {
      const numContinents = 2 + Math.floor(random() * 3);

      const minSpacing = 0.35;
      const margin = 0.15;

      const continentCenters = tryGenerateSpacedCenters(
        random,
        numContinents,
        minSpacing,
        margin,
        0.2,
        0.3,
      );

      const continents: ContinentCenter[] = continentCenters.map((c) => ({
        x: c.x,
        y: c.y,
        radiusX: c.radius + random() * 0.05,
        radiusY: c.radius * (0.8 + random() * 0.4),
      }));

      baseConfig = { shape, continents, warpScale, warpStrength };
      break;
    }

    case "random": {
      baseConfig = { shape, warpScale: 0, warpStrength: 0 };
      break;
    }
  }

  // Generate terrain features (mountains first, then lakes near them)
  const ridges = generateMountainRidges(
    featureRandom,
    mountainCount,
    baseConfig.continentCenter,
    baseConfig.continents,
  );

  const peaks = generateVolcanicPeaks(
    featureRandom,
    Math.ceil(mountainCount * 0.5), // Fewer peaks than ridges
    baseConfig.islands,
  );

  const inlandSeas = generateInlandSeas(featureRandom, seaCount);

  // Lakes are generated after ridges so they can be placed near mountains
  const lakes = generateLakes(featureRandom, lakeCount, ridges);

  return {
    ...baseConfig,
    ridges,
    peaks,
    lakes,
    inlandSeas,
  };
}

// ============================================================================
// Shape Heightmap Generators
// ============================================================================

/**
 * Generate archipelago heightmap - multiple scattered islands
 */
function sampleArchipelagoHeightmap(
  x: number,
  y: number,
  size: number,
  config: ShapeConfig,
): number {
  if (!config.islands) return 0.5;

  // Warp coordinates for organic island shapes
  const warped = warpCoordinates(
    x,
    y,
    size,
    config.warpScale,
    config.warpStrength,
  );

  // Normalize to 0-1 range
  const nx = warped.x / size;
  const ny = warped.y / size;

  // Find maximum contribution from all islands
  let maxHeight = 0;

  for (const island of config.islands) {
    const dx = nx - island.x;
    const dy = ny - island.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Smooth radial falloff per island
    const contribution = 1 - smoothstep(0, island.radius, dist);
    maxHeight = Math.max(maxHeight, contribution);
  }

  // Apply edge fade to avoid islands at map borders
  const edgeFade = calculateEdgeFade(x, y, size, 0.08);

  return maxHeight * edgeFade;
}

/**
 * Generate continent heightmap - single large landmass
 */
function sampleContinentHeightmap(
  x: number,
  y: number,
  size: number,
  config: ShapeConfig,
): number {
  if (!config.continentCenter) return 0.5;

  // Warp coordinates for organic coastline
  const warped = warpCoordinates(
    x,
    y,
    size,
    config.warpScale,
    config.warpStrength,
  );

  // Normalize to 0-1 range
  const nx = warped.x / size;
  const ny = warped.y / size;

  const center = config.continentCenter;

  // Elliptical distance from center
  const dx = (nx - center.x) / center.radiusX;
  const dy = (ny - center.y) / center.radiusY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Smooth falloff - land in center, ocean at edges
  const height = 1 - smoothstep(0.3, 1.0, dist);

  // Apply edge fade
  const edgeFade = calculateEdgeFade(x, y, size, 0.05);

  return height * edgeFade;
}

/**
 * Generate pangaea heightmap - land almost everywhere
 */
function samplePangaeaHeightmap(
  x: number,
  y: number,
  size: number,
  _config: ShapeConfig,
): number {
  // High base elevation (will be above sea level)
  const baseHeight = 0.7;

  // Subtle variation using low-frequency noise
  const variation = simplex2(x * 0.003, y * 0.003) * 0.08;

  // Edge fade to create some ocean at borders
  const edgeFade = calculateEdgeFade(x, y, size, 0.12);

  // Combine: high base with variation, fading at edges
  const height = (baseHeight + variation) * (0.5 + edgeFade * 0.5);

  return Math.max(0, Math.min(1, height));
}

/**
 * Generate multi-continent heightmap - 2-4 distinct landmasses
 */
function sampleMultiContinentHeightmap(
  x: number,
  y: number,
  size: number,
  config: ShapeConfig,
): number {
  if (!config.continents) return 0.5;

  // Warp coordinates for organic coastlines
  const warped = warpCoordinates(
    x,
    y,
    size,
    config.warpScale,
    config.warpStrength,
  );

  // Normalize to 0-1 range
  const nx = warped.x / size;
  const ny = warped.y / size;

  // Find maximum contribution from all continents
  let maxHeight = 0;

  for (const continent of config.continents) {
    const dx = (nx - continent.x) / continent.radiusX;
    const dy = (ny - continent.y) / continent.radiusY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Smooth radial falloff per continent
    const contribution = 1 - smoothstep(0.2, 1.0, dist);
    maxHeight = Math.max(maxHeight, contribution);
  }

  // Apply edge fade
  const edgeFade = calculateEdgeFade(x, y, size, 0.06);

  return maxHeight * edgeFade;
}

/**
 * Generate random heightmap - neutral value, noise will dominate
 */
function sampleRandomHeightmap(): number {
  // Return neutral value - fractal noise will completely determine terrain
  return 0.5;
}

/**
 * Sample shape heightmap at given coordinates
 * Includes water bodies and mountains
 */
function sampleShapeHeightmap(
  x: number,
  y: number,
  size: number,
  config: ShapeConfig,
): number {
  // Get base heightmap from shape
  let baseHeight: number;
  switch (config.shape) {
    case "archipelago":
      baseHeight = sampleArchipelagoHeightmap(x, y, size, config);
      break;
    case "continent":
      baseHeight = sampleContinentHeightmap(x, y, size, config);
      break;
    case "pangaea":
      baseHeight = samplePangaeaHeightmap(x, y, size, config);
      break;
    case "multiContinent":
      baseHeight = sampleMultiContinentHeightmap(x, y, size, config);
      break;
    case "random":
      baseHeight = sampleRandomHeightmap();
      break;
  }

  // Normalize coordinates for feature sampling
  const nx = x / size;
  const ny = y / size;

  // Apply water bodies (lakes and inland seas)
  const waterDepth = sampleWaterBodies(
    nx,
    ny,
    config.lakes || [],
    config.inlandSeas || [],
  );
  if (waterDepth < 0) {
    // Inside a water body - carve out the terrain
    baseHeight = Math.max(0, baseHeight + waterDepth);
  }

  // Apply mountains (ridges and peaks)
  const mountainBoost = sampleMountains(
    nx,
    ny,
    config.ridges || [],
    config.peaks || [],
  );
  baseHeight = Math.min(1, baseHeight + mountainBoost);

  return baseHeight;
}

// ============================================================================
// River Generation
// ============================================================================

/**
 * Find good river source points (high elevation, inland)
 */
function findRiverSources(
  elevation: Float32Array,
  width: number,
  height: number,
  seaLevel: number,
  count: number,
  random: () => number,
): number[] {
  const candidates: Array<{ idx: number; score: number }> = [];

  // Sample points to find good candidates
  const sampleStep = Math.max(4, Math.floor(width / 50));

  for (let y = sampleStep; y < height - sampleStep; y += sampleStep) {
    for (let x = sampleStep; x < width - sampleStep; x += sampleStep) {
      const idx = y * width + x;
      const elev = elevation[idx];

      // Must be land and reasonably high
      if (elev > seaLevel + 0.15) {
        // Score based on elevation (higher = better source)
        const score = elev + random() * 0.1;
        candidates.push({ idx, score });
      }
    }
  }

  // Sort by score and pick top candidates with spacing
  candidates.sort((a, b) => b.score - a.score);

  const sources: number[] = [];
  const minSpacing = width * 0.1;

  for (const candidate of candidates) {
    if (sources.length >= count) break;

    const cx = candidate.idx % width;
    const cy = Math.floor(candidate.idx / width);

    // Check spacing from existing sources
    let tooClose = false;
    for (const existing of sources) {
      const ex = existing % width;
      const ey = Math.floor(existing / width);
      const dist = Math.sqrt((cx - ex) ** 2 + (cy - ey) ** 2);
      if (dist < minSpacing) {
        tooClose = true;
        break;
      }
    }

    if (!tooClose) {
      sources.push(candidate.idx);
    }
  }

  return sources;
}

/**
 * Trace a river from source to water, following elevation gradient
 */
function traceRiver(
  start: number,
  elevation: Float32Array,
  width: number,
  height: number,
  seaLevel: number,
): number[] {
  const path: number[] = [start];
  let current = start;
  const maxLength = Math.max(width, height);
  const visited = new Set<number>();
  visited.add(start);

  // 8-directional neighbors
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ];

  for (let step = 0; step < maxLength; step++) {
    const x = current % width;
    const y = Math.floor(current / width);

    // Stop if we reached water
    if (elevation[current] <= seaLevel) break;

    // Find lowest unvisited neighbor
    let lowestIdx = -1;
    let lowestElev = elevation[current];

    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;

      if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;

      const ni = ny * width + nx;
      if (visited.has(ni)) continue;

      if (elevation[ni] < lowestElev) {
        lowestIdx = ni;
        lowestElev = elevation[ni];
      }
    }

    // If no lower neighbor found, we're stuck - try to find any unvisited neighbor
    if (lowestIdx === -1) {
      // Try to find any path that continues
      for (const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        const ni = ny * width + nx;
        if (!visited.has(ni) && elevation[ni] <= seaLevel) {
          // Found water nearby
          path.push(ni);
          return path;
        }
      }
      // Truly stuck, end river here
      break;
    }

    path.push(lowestIdx);
    visited.add(lowestIdx);
    current = lowestIdx;
  }

  return path;
}

/**
 * Generate all rivers
 */
function generateRivers(
  elevation: Float32Array,
  width: number,
  height: number,
  seaLevel: number,
  count: number,
  numericSeed: number,
): Set<number> {
  const rivers = new Set<number>();

  if (count === 0) return rivers;

  const random = createSeededRandom(numericSeed + 5000);

  // Find river sources
  const sources = findRiverSources(
    elevation,
    width,
    height,
    seaLevel,
    count,
    random,
  );

  // Trace each river
  for (const source of sources) {
    const riverPath = traceRiver(source, elevation, width, height, seaLevel);

    // Add all river pixels
    for (const idx of riverPath) {
      rivers.add(idx);
      // Make rivers slightly wider (add adjacent pixels on x-axis)
      const x = idx % width;
      if (x > 0) rivers.add(idx - 1);
      if (x < width - 1) rivers.add(idx + 1);
    }
  }

  return rivers;
}

// ============================================================================
// World Generation
// ============================================================================

/**
 * Generate the world map using two-pass blend system
 */
export function generateWorld(params: WorldParams): WorldData {
  const {
    size,
    seed,
    seaLevel,
    islandFactor,
    noiseParams,
    shape,
    featureDensity,
  } = params;
  const width = size;
  const height = size;

  // Initialize random and noise
  const numericSeed = stringToSeed(seed);

  // ====== PRE-COMPUTE PHASE ======
  // Generate shape configuration once before pixel loops
  const shapeConfig = generateShapeConfig(
    shape,
    size,
    numericSeed,
    islandFactor,
    featureDensity,
  );

  // ====== HEIGHTMAP PHASE ======
  const shapeHeightmap = new Float32Array(size * size);
  const noiseHeightmap = new Float32Array(size * size);

  // Initialize noise for fractal terrain
  const terrainRandom = createSeededRandom(numericSeed);
  initNoise(terrainRandom);

  // Generate both heightmaps
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      shapeHeightmap[idx] = sampleShapeHeightmap(x, y, size, shapeConfig);
      noiseHeightmap[idx] = fractalNoise(x, y, noiseParams);
    }
  }

  // ====== BLEND PHASE ======
  const blendFactor = getBlendFactor(shape);
  const shapeWeight = 1 - blendFactor;
  const noiseWeight = blendFactor;

  const totalPixels = width * height;
  const elevation = new Float32Array(totalPixels);

  for (let i = 0; i < totalPixels; i++) {
    // Blend shape heightmap with noise
    elevation[i] =
      shapeHeightmap[i] * shapeWeight + noiseHeightmap[i] * noiseWeight;
  }

  // ====== RIVER GENERATION PHASE ======
  // Generate rivers after elevation is known (they follow terrain)
  const multipliers = getFeatureMultipliers(shape);
  const riverCount = Math.round(featureDensity.rivers * multipliers.rivers);
  const rivers = generateRivers(
    elevation,
    width,
    height,
    seaLevel,
    riverCount,
    numericSeed,
  );

  // ====== CLIMATE PHASE ======
  const temperature = new Float32Array(totalPixels);
  const moisture = new Float32Array(totalPixels);
  const detailNoise = new Float32Array(totalPixels);
  const biomes: Biome[] = new Array(totalPixels);

  // Calculate distance to water for moisture (include rivers as water sources)
  const distanceToWater = calculateDistanceToWater(
    elevation,
    width,
    height,
    seaLevel,
    rivers,
  );

  // Find max distance for normalization
  let maxDistance = 0;
  for (let i = 0; i < distanceToWater.length; i++) {
    if (distanceToWater[i] > maxDistance) {
      maxDistance = distanceToWater[i];
    }
  }
  // Clamp max distance to a reasonable value
  maxDistance = Math.min(maxDistance, Math.max(width, height) * 0.3);

  // Reinitialize noise with offset for temperature/moisture variation
  const tempRandom = createSeededRandom(numericSeed + 1000);
  initNoise(tempRandom);

  // Calculate temperature and moisture
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;

      // Temperature noise for variation
      const tempNoise = simplex2(x * 0.01, y * 0.01);
      temperature[idx] = calculateTemperature(
        y,
        height,
        elevation[idx],
        tempNoise,
      );

      // Moisture from distance to water + noise
      const moistNoise = simplex2(x * 0.015 + 500, y * 0.015 + 500);
      moisture[idx] = calculateMoisture(
        distanceToWater[idx],
        maxDistance,
        moistNoise,
      );
    }
  }

  // Reinitialize noise for detail texture
  const detailRandom = createSeededRandom(numericSeed + 2000);
  initNoise(detailRandom);

  // Generate detail noise for palette color selection
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      detailNoise[idx] = simplex2(x * 0.1, y * 0.1);
    }
  }

  // Determine biomes
  for (let i = 0; i < totalPixels; i++) {
    biomes[i] = getBiome(elevation[i], temperature[i], moisture[i], seaLevel);
  }

  // Create image data with palette colors (including rivers)
  const imageData = createImageData(width, height, biomes, detailNoise, rivers);

  return {
    width,
    height,
    elevation,
    temperature,
    moisture,
    biomes,
    detailNoise,
    imageData,
    rivers,
  };
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return { r: 0, g: 0, b: 0 };
  }
  return {
    r: Number.parseInt(result[1], 16),
    g: Number.parseInt(result[2], 16),
    b: Number.parseInt(result[3], 16),
  };
}

/**
 * Create ImageData from biomes using palette colors based on detail noise
 * Rivers are rendered with a distinct color
 */
function createImageData(
  width: number,
  height: number,
  biomes: Biome[],
  detailNoise: Float32Array,
  rivers: Set<number>,
): ImageData {
  const data = new Uint8ClampedArray(width * height * 4);
  const riverBiome = BIOMES.river;

  for (let i = 0; i < biomes.length; i++) {
    // Check if this pixel is a river
    const isRiver = rivers.has(i);
    const biome = isRiver ? riverBiome : biomes[i];

    const paletteKey = selectPaletteColor(detailNoise[i]);
    const color = biome.palette[paletteKey];
    const rgb = hexToRgb(color);

    const pixelIdx = i * 4;
    data[pixelIdx] = rgb.r;
    data[pixelIdx + 1] = rgb.g;
    data[pixelIdx + 2] = rgb.b;
    data[pixelIdx + 3] = 255; // Alpha
  }

  return new ImageData(data, width, height);
}
