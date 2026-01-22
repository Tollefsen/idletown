/**
 * Biome definitions with 3-color palettes for visual depth
 */

export type BiomeType =
  // Structural biomes (always enabled)
  | "deepOcean"
  | "shallowOcean"
  | "river"
  | "endorheicLake"
  // Land biomes (toggleable, default ON)
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
  // Fantasy biomes (toggleable, default OFF)
  | "crystalForest"
  | "enchantedGrove"
  | "corruptedLands"
  | "volcanicWasteland"
  | "faerieMarsh"
  // Alien biomes (toggleable, default OFF)
  | "bioluminescentMarsh"
  | "fungalJungle"
  | "acidicPlains"
  | "crystallineDesert"
  | "xenoFlora";

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
  endorheicLake: {
    type: "endorheicLake",
    name: "Endorheic Lake",
    palette: {
      primary: "#5a8a7a", // Brackish teal-green (salt lake appearance)
      secondary: "#4a7a6a",
      details: "#6a9a8a",
    },
  },
  // ============================================================================
  // Fantasy Biomes
  // ============================================================================
  crystalForest: {
    type: "crystalForest",
    name: "Crystal Forest",
    palette: {
      primary: "#9b59b6", // Purple
      secondary: "#8e44ad",
      details: "#d4a5ff", // Light purple
    },
  },
  enchantedGrove: {
    type: "enchantedGrove",
    name: "Enchanted Grove",
    palette: {
      primary: "#f4d03f", // Gold
      secondary: "#27ae60", // Emerald
      details: "#fffacd", // Light golden
    },
  },
  corruptedLands: {
    type: "corruptedLands",
    name: "Corrupted Lands",
    palette: {
      primary: "#2c1a4d", // Dark purple
      secondary: "#1a1a2e", // Near black
      details: "#6b8e23", // Sickly green
    },
  },
  volcanicWasteland: {
    type: "volcanicWasteland",
    name: "Volcanic Wasteland",
    palette: {
      primary: "#e74c3c", // Red
      secondary: "#c0392b", // Dark red
      details: "#2c2c2c", // Ash black
    },
  },
  faerieMarsh: {
    type: "faerieMarsh",
    name: "Faerie Marsh",
    palette: {
      primary: "#48d1cc", // Teal
      secondary: "#ff69b4", // Pink
      details: "#e0ffff", // Pale blue
    },
  },
  // ============================================================================
  // Alien Biomes
  // ============================================================================
  bioluminescentMarsh: {
    type: "bioluminescentMarsh",
    name: "Bioluminescent Marsh",
    palette: {
      primary: "#00ffff", // Cyan
      secondary: "#39ff14", // Neon green
      details: "#000080", // Deep blue
    },
  },
  fungalJungle: {
    type: "fungalJungle",
    name: "Fungal Jungle",
    palette: {
      primary: "#8b4513", // Brown
      secondary: "#ff6600", // Orange
      details: "#9932cc", // Purple
    },
  },
  acidicPlains: {
    type: "acidicPlains",
    name: "Acidic Plains",
    palette: {
      primary: "#adff2f", // Yellow-green
      secondary: "#ffff00", // Toxic yellow
      details: "#556b2f", // Olive
    },
  },
  crystallineDesert: {
    type: "crystallineDesert",
    name: "Crystalline Desert",
    palette: {
      primary: "#ffb6c1", // Pink
      secondary: "#f5f5f5", // White
      details: "#dda0dd", // Violet
    },
  },
  xenoFlora: {
    type: "xenoFlora",
    name: "Xeno Flora",
    palette: {
      primary: "#ff4500", // Orange-red
      secondary: "#ff00ff", // Magenta
      details: "#00ced1", // Dark cyan
    },
  },
};

// ============================================================================
// Biome Categories and Metadata
// ============================================================================

export type BiomeCategory = "structural" | "land" | "fantasy" | "alien";

/**
 * Metadata for each biome including category, fallbacks, and source biomes for fictional
 */
export type BiomeMetadata = {
  category: BiomeCategory;
  fallbacks: BiomeType[]; // Ordered list of fallback biomes when this is disabled
  replacesSource: BiomeType[]; // For fictional biomes: which natural biomes they can replace
  defaultEnabled: boolean;
};

/**
 * Metadata registry for all biomes
 */
export const BIOME_METADATA: Record<BiomeType, BiomeMetadata> = {
  // Structural biomes (always enabled, not toggleable)
  deepOcean: {
    category: "structural",
    fallbacks: [],
    replacesSource: [],
    defaultEnabled: true,
  },
  shallowOcean: {
    category: "structural",
    fallbacks: [],
    replacesSource: [],
    defaultEnabled: true,
  },
  river: {
    category: "structural",
    fallbacks: [],
    replacesSource: [],
    defaultEnabled: true,
  },
  endorheicLake: {
    category: "structural",
    fallbacks: [],
    replacesSource: [],
    defaultEnabled: true,
  },

  // Land biomes (toggleable, default ON)
  beach: {
    category: "land",
    fallbacks: ["temperateGrassland", "desert"],
    replacesSource: [],
    defaultEnabled: true,
  },
  tropicalRainforest: {
    category: "land",
    fallbacks: ["temperateForest", "borealForest", "temperateGrassland"],
    replacesSource: [],
    defaultEnabled: true,
  },
  tropicalSavanna: {
    category: "land",
    fallbacks: ["temperateGrassland", "desert", "tundra"],
    replacesSource: [],
    defaultEnabled: true,
  },
  desert: {
    category: "land",
    fallbacks: ["temperateGrassland", "tropicalSavanna", "tundra"],
    replacesSource: [],
    defaultEnabled: true,
  },
  temperateForest: {
    category: "land",
    fallbacks: ["borealForest", "tropicalRainforest", "temperateGrassland"],
    replacesSource: [],
    defaultEnabled: true,
  },
  temperateGrassland: {
    category: "land",
    fallbacks: ["tundra", "tropicalSavanna", "desert"],
    replacesSource: [],
    defaultEnabled: true,
  },
  borealForest: {
    category: "land",
    fallbacks: ["temperateForest", "tundra", "snow"],
    replacesSource: [],
    defaultEnabled: true,
  },
  tundra: {
    category: "land",
    fallbacks: ["snow", "temperateGrassland", "borealForest"],
    replacesSource: [],
    defaultEnabled: true,
  },
  snow: {
    category: "land",
    fallbacks: ["tundra", "snowyMountain"],
    replacesSource: [],
    defaultEnabled: true,
  },
  mountain: {
    category: "land",
    fallbacks: ["snowyMountain", "tundra"],
    replacesSource: [],
    defaultEnabled: true,
  },
  snowyMountain: {
    category: "land",
    fallbacks: ["mountain", "snow", "tundra"],
    replacesSource: [],
    defaultEnabled: true,
  },

  // Fantasy biomes (toggleable, default OFF)
  crystalForest: {
    category: "fantasy",
    fallbacks: ["borealForest", "temperateForest"],
    replacesSource: ["borealForest", "temperateForest"],
    defaultEnabled: false,
  },
  enchantedGrove: {
    category: "fantasy",
    fallbacks: ["tropicalRainforest", "temperateForest"],
    replacesSource: ["tropicalRainforest"],
    defaultEnabled: false,
  },
  corruptedLands: {
    category: "fantasy",
    fallbacks: ["desert", "tundra"],
    replacesSource: ["desert", "tundra"],
    defaultEnabled: false,
  },
  volcanicWasteland: {
    category: "fantasy",
    fallbacks: ["mountain", "desert"],
    replacesSource: ["mountain", "desert"],
    defaultEnabled: false,
  },
  faerieMarsh: {
    category: "fantasy",
    fallbacks: ["temperateGrassland", "tropicalSavanna"],
    replacesSource: ["temperateGrassland"],
    defaultEnabled: false,
  },

  // Alien biomes (toggleable, default OFF)
  bioluminescentMarsh: {
    category: "alien",
    fallbacks: ["temperateGrassland", "tropicalSavanna"],
    replacesSource: ["temperateGrassland", "tropicalSavanna"],
    defaultEnabled: false,
  },
  fungalJungle: {
    category: "alien",
    fallbacks: ["tropicalRainforest", "temperateForest"],
    replacesSource: ["tropicalRainforest", "temperateForest"],
    defaultEnabled: false,
  },
  acidicPlains: {
    category: "alien",
    fallbacks: ["desert", "tundra"],
    replacesSource: ["desert", "tundra"],
    defaultEnabled: false,
  },
  crystallineDesert: {
    category: "alien",
    fallbacks: ["desert"],
    replacesSource: ["desert"],
    defaultEnabled: false,
  },
  xenoFlora: {
    category: "alien",
    fallbacks: ["tropicalRainforest", "temperateForest"],
    replacesSource: ["tropicalRainforest", "temperateForest"],
    defaultEnabled: false,
  },
};

// ============================================================================
// Biome Configuration
// ============================================================================

/**
 * Configuration for which biomes are enabled
 * Only includes toggleable biomes (land, fantasy, alien)
 * Structural biomes are always enabled
 */
export type BiomeConfig = Partial<Record<BiomeType, boolean>>;

/**
 * Default biome configuration
 * Land biomes: enabled
 * Fictional biomes: disabled
 */
export const DEFAULT_BIOME_CONFIG: BiomeConfig = {
  // Land biomes - default ON
  beach: true,
  tropicalRainforest: true,
  tropicalSavanna: true,
  desert: true,
  temperateForest: true,
  temperateGrassland: true,
  borealForest: true,
  tundra: true,
  snow: true,
  mountain: true,
  snowyMountain: true,
  // Fantasy biomes - default OFF
  crystalForest: false,
  enchantedGrove: false,
  corruptedLands: false,
  volcanicWasteland: false,
  faerieMarsh: false,
  // Alien biomes - default OFF
  bioluminescentMarsh: false,
  fungalJungle: false,
  acidicPlains: false,
  crystallineDesert: false,
  xenoFlora: false,
};

/**
 * Check if a biome is enabled in the config
 * Structural biomes are always enabled
 */
export function isBiomeEnabled(
  biomeType: BiomeType,
  config: BiomeConfig,
): boolean {
  const metadata = BIOME_METADATA[biomeType];
  if (metadata.category === "structural") {
    return true; // Structural biomes are always enabled
  }
  return config[biomeType] ?? metadata.defaultEnabled;
}

/**
 * Get list of all biomes in a category
 */
export function getBiomesByCategory(category: BiomeCategory): BiomeType[] {
  return (Object.keys(BIOME_METADATA) as BiomeType[]).filter(
    (biomeType) => BIOME_METADATA[biomeType].category === category,
  );
}

/**
 * Get list of enabled fictional biomes that can replace a given source biome
 */
export function getEnabledFictionalReplacements(
  sourceBiome: BiomeType,
  config: BiomeConfig,
): BiomeType[] {
  const fictionalBiomes = [
    ...getBiomesByCategory("fantasy"),
    ...getBiomesByCategory("alien"),
  ];

  return fictionalBiomes.filter((fictional) => {
    const metadata = BIOME_METADATA[fictional];
    return (
      isBiomeEnabled(fictional, config) &&
      metadata.replacesSource.includes(sourceBiome)
    );
  });
}

/**
 * Resolve fallback biome when the requested biome is disabled
 * Returns the first enabled fallback, or emergency fallback if all disabled
 */
export function resolveBiomeFallback(
  biomeType: BiomeType,
  config: BiomeConfig,
): BiomeType {
  // If biome is enabled, return it
  if (isBiomeEnabled(biomeType, config)) {
    return biomeType;
  }

  // Try fallbacks in order
  const metadata = BIOME_METADATA[biomeType];
  for (const fallback of metadata.fallbacks) {
    if (isBiomeEnabled(fallback, config)) {
      return fallback;
    }
  }

  // Emergency fallback: find any enabled land biome
  const landBiomes = getBiomesByCategory("land");
  for (const land of landBiomes) {
    if (isBiomeEnabled(land, config)) {
      return land;
    }
  }

  // Ultimate fallback (should never happen if at least one land biome is enabled)
  return "temperateGrassland";
}

// ============================================================================
// Biome Presets
// ============================================================================

export type BiomePreset = "realistic" | "fantasy" | "alien" | "fullFantasy";

/**
 * Get biome config for a preset
 */
export function getBiomePreset(preset: BiomePreset): BiomeConfig {
  const config: BiomeConfig = { ...DEFAULT_BIOME_CONFIG };

  // Reset all fictional to false first
  const fictionalBiomes = [
    ...getBiomesByCategory("fantasy"),
    ...getBiomesByCategory("alien"),
  ];
  for (const biome of fictionalBiomes) {
    config[biome] = false;
  }

  switch (preset) {
    case "realistic":
      // All land ON, all fictional OFF (already set above)
      break;
    case "fantasy":
      // All land ON, fantasy ON, alien OFF
      for (const biome of getBiomesByCategory("fantasy")) {
        config[biome] = true;
      }
      break;
    case "alien":
      // All land ON, fantasy OFF, alien ON
      for (const biome of getBiomesByCategory("alien")) {
        config[biome] = true;
      }
      break;
    case "fullFantasy":
      // All land ON, all fictional ON
      for (const biome of fictionalBiomes) {
        config[biome] = true;
      }
      break;
  }

  return config;
}

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
 * Determine the natural biome based purely on climate (elevation, temperature, moisture)
 * This does not apply any config overrides or fictional replacements
 */
export function determineNaturalBiome(
  elevation: number,
  temperature: number,
  moisture: number,
  seaLevel: number = SEA_LEVEL,
): BiomeType {
  // Adjust thresholds based on sea level
  const beachLevel = seaLevel + 0.02;
  const mountainLevel = MOUNTAIN_LEVEL;
  const highMountainLevel = HIGH_MOUNTAIN_LEVEL;

  // Water biomes
  if (elevation < seaLevel * 0.7) {
    return "deepOcean";
  }
  if (elevation < seaLevel) {
    return "shallowOcean";
  }

  // Beach (narrow strip near water)
  if (elevation < beachLevel) {
    return "beach";
  }

  // High elevation biomes
  if (elevation > highMountainLevel) {
    return "snowyMountain";
  }
  if (elevation > mountainLevel) {
    // Mountains can have snow if cold enough
    if (temperature < COLD) {
      return "snowyMountain";
    }
    return "mountain";
  }

  // Land biomes based on temperature and moisture
  // Very cold regions
  if (temperature < COLD) {
    if (moisture > MODERATE) {
      return "snow";
    }
    return "tundra";
  }

  // Cold regions (boreal)
  if (temperature < TEMPERATE) {
    if (moisture > MODERATE) {
      return "borealForest";
    }
    if (moisture > DRY) {
      return "tundra";
    }
    return "tundra";
  }

  // Temperate regions
  if (temperature < HOT) {
    if (moisture > MODERATE) {
      return "temperateForest";
    }
    if (moisture > DRY) {
      return "temperateGrassland";
    }
    return "desert";
  }

  // Hot regions (tropical)
  if (moisture > MODERATE) {
    return "tropicalRainforest";
  }
  if (moisture > DRY) {
    return "tropicalSavanna";
  }
  return "desert";
}

/**
 * Determine biome based on elevation, temperature, and moisture
 * Applies biome config (disabled biomes fall back to alternatives)
 *
 * Note: This does NOT handle fictional biome replacement - that's done
 * in worldgen.ts using noise-based patches for natural-looking distribution
 */
export function getBiome(
  elevation: number,
  temperature: number,
  moisture: number,
  seaLevel: number = SEA_LEVEL,
  biomeConfig?: BiomeConfig,
): Biome {
  // Get the natural biome type based on climate
  const naturalBiomeType = determineNaturalBiome(
    elevation,
    temperature,
    moisture,
    seaLevel,
  );

  // If no config provided, return natural biome directly
  if (!biomeConfig) {
    return BIOMES[naturalBiomeType];
  }

  // Apply fallback resolution if biome is disabled
  const resolvedBiomeType = resolveBiomeFallback(naturalBiomeType, biomeConfig);

  return BIOMES[resolvedBiomeType];
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
 * If biomeConfig is provided, only shows enabled biomes
 */
export function getBiomeLegend(
  biomeConfig?: BiomeConfig,
): { name: string; color: string; type: BiomeType }[] {
  return (Object.keys(BIOMES) as BiomeType[])
    .filter((biomeType) => {
      // If no config, show all biomes
      if (!biomeConfig) return true;
      // Otherwise, only show enabled biomes
      return isBiomeEnabled(biomeType, biomeConfig);
    })
    .map((biomeType) => ({
      name: BIOMES[biomeType].name,
      color: BIOMES[biomeType].palette.primary,
      type: biomeType,
    }));
}
