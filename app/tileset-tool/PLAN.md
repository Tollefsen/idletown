# Tileset Tool - Project Plan

A comprehensive tool for creating pixel art tilesets with support for multiple resolutions, adjacency rules, and Wave Function Collapse generation.

## Project Overview

The tool consists of three main components:

1. **Tile Editor** - Draw individual pixel art tiles
2. **Tileset Manager** - Combine tiles into tilesets with adjacency rules
3. **Level Editor** - Sandbox environment to test tilesets

---

## Phase 1: Tile Editor (Foundation) - IN PROGRESS

### Features
- [x] Project structure and types
- [x] localStorage storage adapter
- [x] Canvas-based pixel art editor
- [x] Preset tile sizes: 8x8, 16x16, 32x32, 64x64
- [x] Drawing tools: Pencil, Eraser, Fill bucket, Eyedropper
- [x] Fixed 16-color palette
- [x] Grid overlay toggle
- [x] Zoom controls (adaptive based on tile size)
- [x] Undo/redo support
- [x] Save/load tiles to localStorage
- [x] Export tiles as PNG
- [x] Tab structure for future tools

### Technical Decisions
- **Tile storage**: 2D array of hex color strings (empty string = transparent)
- **Undo/redo**: Snapshot-based (entire pixel array per action)
- **Zoom levels**: Adaptive based on tile size for comfortable editing
- **Palette**: 16 colors inspired by classic pixel art (PICO-8 style)

### File Structure
```
app/tileset-tool/
├── PLAN.md                    # This file
├── page.tsx                   # Main page with tab navigation
├── layout.tsx                 # Layout with metadata
├── error.tsx                  # Error boundary
├── types.ts                   # Shared types
├── storage.ts                 # localStorage adapter
├── storage.test.ts            # Storage tests
├── constants.ts               # Tile sizes, palette, etc.
└── components/
    ├── TileEditor.tsx         # Main editor component
    ├── TileCanvas.tsx         # Pixel art canvas
    ├── ToolPalette.tsx        # Drawing tools
    ├── ColorPalette.tsx       # Color picker
    ├── TileList.tsx           # Saved tiles sidebar
    └── TileSizeSelector.tsx   # Size preset selector
```

---

## Phase 2: Tileset Manager (Planned)

### Features (Planned)
- [ ] Group tiles into named tilesets
- [ ] Visual grid arrangement
- [ ] Adjacency rules for Wave Function Collapse:
  - [ ] Socket-based edge matching system
  - [ ] Define which edges/corners can connect
  - [ ] Symmetry and rotation handling
  - [ ] Visual rule editor
- [ ] Export tileset as sprite sheet (PNG) + metadata (JSON)
- [ ] Import/export tilesets

### Technical Considerations
- Socket system: Each tile edge gets a socket ID
- Matching rules: Tiles can connect if their adjacent sockets match
- Rotation: Some tiles may be rotatable (symmetry flags)

---

## Phase 3: Level Editor / Sandbox (Planned)

### Features (Planned)
- [ ] Paint with tiles from tilesets
- [ ] Manual placement mode (click to place tiles)
- [ ] Auto-tile mode (smart tile selection based on neighbors)
- [ ] Wave Function Collapse generation:
  - [ ] Select area to generate
  - [ ] Constraint propagation algorithm
  - [ ] Backtracking for conflicts
  - [ ] Real-time visualization of generation
- [ ] Layer support (background, midground, foreground)
- [ ] Export levels as JSON
- [ ] Export as single image

---

## Data Structures

### Tile
```typescript
interface Tile {
  id: string;
  name: string;
  size: 8 | 16 | 32 | 64;
  pixels: string[][];  // 2D array of hex colors
  createdAt: number;
  updatedAt: number;
}
```

### Tileset (Phase 2)
```typescript
interface Tileset {
  id: string;
  name: string;
  tileSize: 8 | 16 | 32 | 64;
  tileIds: string[];
  adjacencyRules: AdjacencyRule[];
  createdAt: number;
  updatedAt: number;
}

interface AdjacencyRule {
  tileId: string;
  sockets: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
  rotatable: boolean;
  weight: number;  // Probability weight for WFC
}
```

### Level (Phase 3)
```typescript
interface Level {
  id: string;
  name: string;
  width: number;
  height: number;
  tilesetId: string;
  layers: LevelLayer[];
  createdAt: number;
  updatedAt: number;
}

interface LevelLayer {
  name: string;
  tiles: (string | null)[][];  // Tile IDs or null for empty
}
```

---

## Color Palette (Phase 1)

16-color palette inspired by PICO-8:

| Index | Name        | Hex     |
|-------|-------------|---------|
| 0     | Black       | #000000 |
| 1     | Dark Blue   | #1D2B53 |
| 2     | Dark Purple | #7E2553 |
| 3     | Dark Green  | #008751 |
| 4     | Brown       | #AB5236 |
| 5     | Dark Gray   | #5F574F |
| 6     | Light Gray  | #C2C3C7 |
| 7     | White       | #FFF1E8 |
| 8     | Red         | #FF004D |
| 9     | Orange      | #FFA300 |
| 10    | Yellow      | #FFEC27 |
| 11    | Green       | #00E436 |
| 12    | Blue        | #29ADFF |
| 13    | Indigo      | #83769C |
| 14    | Pink        | #FF77A8 |
| 15    | Peach       | #FFCCAA |

---

## Progress Log

### Session 1 (Initial Setup)
- Created project structure
- Implemented types.ts, constants.ts, storage.ts
- Built all Phase 1 components
- Tile Editor is functional with all planned features
