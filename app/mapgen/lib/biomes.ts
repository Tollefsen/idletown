/**
 * Biome definitions with 3-color palettes for visual depth
 */

export type BiomeType =
  | "deepOcean"
  | "shallowOcean"
  | "beach"
  | "tropicalRainforest"
  | "tropicalSavanna"
  | "desert"
  | "temperateForest"
  | "temperateGrassland"
  | "borealForest"
  | "tundra"
  | "snow"
  | "mountain"
  | "snowyMountain"
  | "river";

export type BiomePalette = {
  primary: string; // Base color (~45% coverage)
  secondary: string; // Variation color (~40% coverage)
  details: string; // Accent specks (~15% coverage)
};

export type Biome = {
  type: BiomeType;
  name: string;
  palette: BiomePalette;
};

// Realistic earth tone palettes with 3 colors each
export const BIOMES: Record<BiomeType, Biome> = {
  deepOcean: {
    type: "deepOcean",
    name: "Deep Ocean",
    palette: {
      primary: "#1a5276",
      secondary: "#154360",
      details: "#1b4f72",
    },
  },
  shallowOcean: {
    type: "shallowOcean",
    name: "Shallow Ocean",
    palette: {
      primary: "#2980b9",
      secondary: "#3498db",
      details: "#2471a3",
    },
  },
  beach: {
    type: "beach",
    name: "Beach",
    palette: {
      primary: "#f4d03f",
      secondary: "#f7dc6f",
      details: "#d4ac0d",
    },
  },
  tropicalRainforest: {
    type: "tropicalRainforest",
    name: "Tropical Rainforest",
    palette: {
      primary: "#1e8449",
      secondary: "#239b56",
      details: "#145a32",
    },
  },
  tropicalSavanna: {
    type: "tropicalSavanna",
    name: "Tropical Savanna",
    palette: {
      primary: "#b7950b",
      secondary: "#d4ac0d",
      details: "#9a7d0a",
    },
  },
  desert: {
    type: "desert",
    name: "Desert",
    palette: {
      primary: "#d4ac6e",
      secondary: "#e6c88a",
      details: "#b8860b",
    },
  },
  temperateForest: {
    type: "temperateForest",
    name: "Temperate Forest",
    palette: {
      primary: "#2e7d32",
      secondary: "#388e3c",
      details: "#1b5e20",
    },
  },
  temperateGrassland: {
    type: "temperateGrassland",
    name: "Temperate Grassland",
    palette: {
      primary: "#8bc34a",
      secondary: "#9ccc65",
      details: "#7cb342",
    },
  },
  borealForest: {
    type: "borealForest",
    name: "Boreal Forest",
    palette: {
      primary: "#4a6741",
      secondary: "#5d7a54",
      details: "#3d5636",
    },
  },
  tundra: {
    type: "tundra",
    name: "Tundra",
    palette: {
      primary: "#a8b5a0",
      secondary: "#b8c4b0",
      details: "#8a9a82",
    },
  },
  snow: {
    type: "snow",
    name: "Snow",
    palette: {
      primary: "#f5f5f5",
      secondary: "#e8e8e8",
      details: "#ffffff",
    },
  },
  mountain: {
    type: "mountain",
    name: "Mountain",
    palette: {
      primary: "#6b6b6b",
      secondary: "#7a7a7a",
      details: "#5a5a5a",
    },
  },
  snowyMountain: {
    type: "snowyMountain",
    name: "Snowy Mountain",
    palette: {
      primary: "#d0d0d0",
      secondary: "#e0e0e0",
      details: "#b8b8b8",
    },
  },
  river: {
    type: "river",
    name: "River",
    palette: {
      primary: "#4a90b8",
      secondary: "#5a9fc7",
      details: "#3a80a8",
    },
  },
};

// Thresholds
const SEA_LEVEL = 0.4;
const MOUNTAIN_LEVEL = 0.75;
const HIGH_MOUNTAIN_LEVEL = 0.85;

// Temperature thresholds (0 = cold, 1 = hot)
const COLD = 0.25;
const TEMPERATE = 0.5;
const HOT = 0.75;

// Moisture thresholds (0 = dry, 1 = wet)
const DRY = 0.3;
const MODERATE = 0.5;

/**
 * Determine biome based on elevation, temperature, and moisture
 */
export function getBiome(
  elevation: number,
  temperature: number,
  moisture: number,
  seaLevel: number = SEA_LEVEL,
): Biome {
  // Adjust thresholds based on sea level
  const beachLevel = seaLevel + 0.02;
  const mountainLevel = MOUNTAIN_LEVEL;
  const highMountainLevel = HIGH_MOUNTAIN_LEVEL;

  // Water biomes
  if (elevation < seaLevel * 0.7) {
    return BIOMES.deepOcean;
  }
  if (elevation < seaLevel) {
    return BIOMES.shallowOcean;
  }

  // Beach (narrow strip near water)
  if (elevation < beachLevel) {
    return BIOMES.beach;
  }

  // High elevation biomes
  if (elevation > highMountainLevel) {
    return BIOMES.snowyMountain;
  }
  if (elevation > mountainLevel) {
    // Mountains can have snow if cold enough
    if (temperature < COLD) {
      return BIOMES.snowyMountain;
    }
    return BIOMES.mountain;
  }

  // Land biomes based on temperature and moisture
  // Very cold regions
  if (temperature < COLD) {
    if (moisture > MODERATE) {
      return BIOMES.snow;
    }
    return BIOMES.tundra;
  }

  // Cold regions (boreal)
  if (temperature < TEMPERATE) {
    if (moisture > MODERATE) {
      return BIOMES.borealForest;
    }
    if (moisture > DRY) {
      return BIOMES.tundra;
    }
    return BIOMES.tundra;
  }

  // Temperate regions
  if (temperature < HOT) {
    if (moisture > MODERATE) {
      return BIOMES.temperateForest;
    }
    if (moisture > DRY) {
      return BIOMES.temperateGrassland;
    }
    return BIOMES.desert;
  }

  // Hot regions (tropical)
  if (moisture > MODERATE) {
    return BIOMES.tropicalRainforest;
  }
  if (moisture > DRY) {
    return BIOMES.tropicalSavanna;
  }
  return BIOMES.desert;
}

/**
 * Select which palette color to use based on detail noise value
 * @param detailNoise - noise value from 0 to 1
 * @returns "primary" | "secondary" | "details"
 */
export function selectPaletteColor(detailNoise: number): keyof BiomePalette {
  if (detailNoise > 0.7) {
    return "details"; // ~15% of pixels (rare specks)
  }
  if (detailNoise > 0.3) {
    return "secondary"; // ~40% of pixels
  }
  return "primary"; // ~45% of pixels
}

/**
 * Get all biome colors as an array for legend display
 * Uses primary color for the legend
 */
export function getBiomeLegend(): { name: string; color: string }[] {
  return Object.values(BIOMES).map((biome) => ({
    name: biome.name,
    color: biome.palette.primary,
  }));
}
