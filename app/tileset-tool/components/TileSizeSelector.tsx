import { TILE_SIZES } from "../constants";
import type { TileSize } from "../types";

type TileSizeSelectorProps = {
  size: TileSize;
  onSizeChange: (size: TileSize) => void;
  disabled?: boolean;
};

export function TileSizeSelector({
  size,
  onSizeChange,
  disabled = false,
}: TileSizeSelectorProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor="tile-size"
        className="text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Tile Size
      </label>
      <select
        id="tile-size"
        value={size}
        onChange={(e) => onSizeChange(Number(e.target.value) as TileSize)}
        disabled={disabled}
        className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {TILE_SIZES.map((s) => (
          <option key={s} value={s}>
            {s}x{s} pixels
          </option>
        ))}
      </select>
      {disabled && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Create a new tile to change size
        </p>
      )}
    </div>
  );
}
