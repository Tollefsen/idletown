import type { Tile } from "../types";

type TilePickerProps = {
  tiles: Tile[];
  selectedTileIds: string[];
  tileSize: number;
  onTileToggle: (tileId: string) => void;
};

export function TilePicker({
  tiles,
  selectedTileIds,
  tileSize,
  onTileToggle,
}: TilePickerProps) {
  // Filter tiles by matching size
  const compatibleTiles = tiles.filter((t) => t.size === tileSize);
  const incompatibleTiles = tiles.filter((t) => t.size !== tileSize);

  if (tiles.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 italic p-4 text-center">
        No tiles available. Create some tiles in the Tile Editor first.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {compatibleTiles.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Compatible Tiles ({tileSize}x{tileSize})
          </h4>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {compatibleTiles.map((tile) => (
              <TilePickerItem
                key={tile.id}
                tile={tile}
                isSelected={selectedTileIds.includes(tile.id)}
                onToggle={() => onTileToggle(tile.id)}
              />
            ))}
          </div>
        </div>
      )}

      {incompatibleTiles.length > 0 && (
        <div className="opacity-50">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Incompatible Sizes
          </h4>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {incompatibleTiles.map((tile) => (
              <TilePickerItem
                key={tile.id}
                tile={tile}
                isSelected={false}
                onToggle={() => {}}
                disabled
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

type TilePickerItemProps = {
  tile: Tile;
  isSelected: boolean;
  onToggle: () => void;
  disabled?: boolean;
};

function TilePickerItem({
  tile,
  isSelected,
  onToggle,
  disabled = false,
}: TilePickerItemProps) {
  const previewSize = 48;
  const pixelSize = previewSize / tile.size;

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`relative rounded border-2 transition-all ${
        isSelected
          ? "border-blue-500 ring-2 ring-blue-300 dark:ring-blue-700"
          : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
      } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
      title={`${tile.name} (${tile.size}x${tile.size})`}
    >
      <div
        className="bg-white dark:bg-gray-800"
        style={{
          width: previewSize,
          height: previewSize,
          display: "grid",
          gridTemplateColumns: `repeat(${tile.size}, ${pixelSize}px)`,
          gridTemplateRows: `repeat(${tile.size}, ${pixelSize}px)`,
          imageRendering: "pixelated",
        }}
      >
        {tile.pixels.flat().map((color, i) => {
          const x = i % tile.size;
          const y = Math.floor(i / tile.size);
          return (
            <div
              key={`${x}-${y}`}
              style={{
                backgroundColor: color || "transparent",
                width: pixelSize,
                height: pixelSize,
              }}
            />
          );
        })}
      </div>
      {isSelected && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">✓</span>
        </div>
      )}
    </button>
  );
}
