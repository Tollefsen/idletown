/**
 * Simplex Noise implementation with multi-octave fractal noise support
 * Based on Stefan Gustavson's simplex noise algorithm
 */

// Permutation table
const perm = new Uint8Array(512);
const gradP: { x: number; y: number }[] = new Array(512);

// Gradient vectors for 2D
const grad2 = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
  { x: 1, y: 1 },
  { x: -1, y: 1 },
  { x: 1, y: -1 },
  { x: -1, y: -1 },
];

// Skewing factors for 2D
const F2 = 0.5 * (Math.sqrt(3) - 1);
const G2 = (3 - Math.sqrt(3)) / 6;

/**
 * Initialize the noise generator with a seed
 */
export function initNoise(random: () => number): void {
  // Create permutation table
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    p[i] = i;
  }

  // Shuffle using Fisher-Yates
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }

  // Duplicate for overflow
  for (let i = 0; i < 512; i++) {
    perm[i] = p[i & 255];
    gradP[i] = grad2[perm[i] % 8];
  }
}

/**
 * 2D Simplex noise
 */
export function simplex2(x: number, y: number): number {
  // Skew input space
  const s = (x + y) * F2;
  const i = Math.floor(x + s);
  const j = Math.floor(y + s);

  // Unskew back to get the cell origin
  const t = (i + j) * G2;
  const X0 = i - t;
  const Y0 = j - t;
  const x0 = x - X0;
  const y0 = y - Y0;

  // Determine which simplex we're in
  const i1 = x0 > y0 ? 1 : 0;
  const j1 = x0 > y0 ? 0 : 1;

  // Offsets for corners
  const x1 = x0 - i1 + G2;
  const y1 = y0 - j1 + G2;
  const x2 = x0 - 1 + 2 * G2;
  const y2 = y0 - 1 + 2 * G2;

  // Hash coordinates of corners
  const ii = i & 255;
  const jj = j & 255;

  // Calculate contributions from each corner
  let n0 = 0,
    n1 = 0,
    n2 = 0;

  let t0 = 0.5 - x0 * x0 - y0 * y0;
  if (t0 >= 0) {
    const g0 = gradP[ii + perm[jj]];
    t0 *= t0;
    n0 = t0 * t0 * (g0.x * x0 + g0.y * y0);
  }

  let t1 = 0.5 - x1 * x1 - y1 * y1;
  if (t1 >= 0) {
    const g1 = gradP[ii + i1 + perm[jj + j1]];
    t1 *= t1;
    n1 = t1 * t1 * (g1.x * x1 + g1.y * y1);
  }

  let t2 = 0.5 - x2 * x2 - y2 * y2;
  if (t2 >= 0) {
    const g2 = gradP[ii + 1 + perm[jj + 1]];
    t2 *= t2;
    n2 = t2 * t2 * (g2.x * x2 + g2.y * y2);
  }

  // Scale to [-1, 1] range, then normalize to [0, 1]
  return (70 * (n0 + n1 + n2) + 1) / 2;
}

/**
 * Multi-octave fractal noise (fBm - Fractional Brownian Motion)
 */
export function fractalNoise(
  x: number,
  y: number,
  options: {
    octaves: number;
    persistence: number;
    lacunarity: number;
    scale: number;
  },
): number {
  const { octaves, persistence, lacunarity, scale } = options;

  let value = 0;
  let amplitude = 1;
  let frequency = 1 / scale;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    value += amplitude * simplex2(x * frequency, y * frequency);
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }

  // Normalize to [0, 1]
  return value / maxValue;
}

export type NoiseParams = {
  octaves: number;
  persistence: number;
  lacunarity: number;
  scale: number;
};

export const DEFAULT_NOISE_PARAMS: NoiseParams = {
  octaves: 6,
  persistence: 0.5,
  lacunarity: 2.0,
  scale: 100,
};
