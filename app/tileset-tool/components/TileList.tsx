import type { Tile } from "../types";

type TileListProps = {
  tiles: Tile[];
  selectedTileId: string | null;
  onTileSelect: (tile: Tile) => void;
  onTileDelete: (id: string) => void;
  onTileRename: (id: string, name: string) => void;
};

export function TileList({
  tiles,
  selectedTileId,
  onTileSelect,
  onTileDelete,
  onTileRename,
}: TileListProps) {
  if (tiles.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 italic">
        No saved tiles yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Saved Tiles ({tiles.length})
      </h3>
      <div className="space-y-1 max-h-64 overflow-y-auto">
        {tiles.map((tile) => (
          <TileListItem
            key={tile.id}
            tile={tile}
            isSelected={tile.id === selectedTileId}
            onSelect={() => onTileSelect(tile)}
            onDelete={() => onTileDelete(tile.id)}
            onRename={(name) => onTileRename(tile.id, name)}
          />
        ))}
      </div>
    </div>
  );
}

type TileListItemProps = {
  tile: Tile;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (name: string) => void;
};

function TileListItem({
  tile,
  isSelected,
  onSelect,
  onDelete,
  onRename,
}: TileListItemProps) {
  const handleRename = () => {
    const newName = prompt("Enter new name:", tile.name);
    if (newName && newName !== tile.name) {
      onRename(newName);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete "${tile.name}"?`)) {
      onDelete();
    }
  };

  return (
    <div
      className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
        isSelected
          ? "bg-blue-100 dark:bg-blue-900 border border-blue-500"
          : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent"
      }`}
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
    >
      <TilePreview tile={tile} />
      <div className="flex-1 min-w-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleRename();
          }}
          className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate block text-left hover:underline"
          title="Click to rename"
        >
          {tile.name}
        </button>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {tile.size}x{tile.size}
        </span>
      </div>
      <button
        type="button"
        onClick={handleDelete}
        className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400"
        title="Delete tile"
      >
        X
      </button>
    </div>
  );
}

function TilePreview({ tile }: { tile: Tile }) {
  const previewSize = 32;
  const pixelSize = previewSize / tile.size;

  return (
    <div
      className="border border-gray-300 dark:border-gray-600 flex-shrink-0"
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
  );
}
