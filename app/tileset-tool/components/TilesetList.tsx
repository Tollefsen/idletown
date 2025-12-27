import type { Tileset } from "../types";

type TilesetListProps = {
  tilesets: Tileset[];
  selectedTilesetId: string | null;
  onTilesetSelect: (tileset: Tileset) => void;
  onTilesetDelete: (id: string) => void;
  onTilesetRename: (id: string, name: string) => void;
};

export function TilesetList({
  tilesets,
  selectedTilesetId,
  onTilesetSelect,
  onTilesetDelete,
  onTilesetRename,
}: TilesetListProps) {
  if (tilesets.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 italic p-4">
        No tilesets yet. Create one to get started.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {tilesets.map((tileset) => (
        <TilesetListItem
          key={tileset.id}
          tileset={tileset}
          isSelected={tileset.id === selectedTilesetId}
          onSelect={() => onTilesetSelect(tileset)}
          onDelete={() => onTilesetDelete(tileset.id)}
          onRename={(name) => onTilesetRename(tileset.id, name)}
        />
      ))}
    </div>
  );
}

type TilesetListItemProps = {
  tileset: Tileset;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (name: string) => void;
};

function TilesetListItem({
  tileset,
  isSelected,
  onSelect,
  onDelete,
  onRename,
}: TilesetListItemProps) {
  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newName = prompt("Enter new name:", tileset.name);
    if (newName && newName !== tileset.name) {
      onRename(newName);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete "${tileset.name}"? This cannot be undone.`)) {
      onDelete();
    }
  };

  return (
    <div
      className={`flex items-center gap-2 p-3 rounded cursor-pointer transition-colors ${
        isSelected
          ? "bg-blue-100 dark:bg-blue-900 border border-blue-500"
          : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent"
      }`}
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {tileset.name}
          </span>
          <button
            type="button"
            onClick={handleRename}
            className="text-xs text-blue-500 hover:text-blue-700 dark:hover:text-blue-400"
            title="Rename"
          >
            Edit
          </button>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {tileset.tileSize}x{tileset.tileSize} | {tileset.tileIds.length} tiles
        </div>
      </div>
      <button
        type="button"
        onClick={handleDelete}
        className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400"
        title="Delete tileset"
      >
        X
      </button>
    </div>
  );
}
