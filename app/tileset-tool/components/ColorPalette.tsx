import { COLOR_PALETTE } from "../constants";

type ColorPaletteProps = {
  selectedColor: string;
  onColorSelect: (color: string) => void;
};

export function ColorPalette({
  selectedColor,
  onColorSelect,
}: ColorPaletteProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Colors
      </h3>
      <div className="grid grid-cols-4 gap-1">
        {COLOR_PALETTE.map((color) => (
          <button
            key={color.hex}
            type="button"
            title={color.name}
            onClick={() => onColorSelect(color.hex)}
            className={`w-8 h-8 rounded border-2 transition-all ${
              selectedColor === color.hex
                ? "border-blue-500 scale-110 shadow-md"
                : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
            }`}
            style={{ backgroundColor: color.hex }}
            aria-label={`Select ${color.name}`}
            aria-pressed={selectedColor === color.hex}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Selected:
        </span>
        <div
          className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
          style={{ backgroundColor: selectedColor }}
        />
        <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
          {selectedColor}
        </span>
      </div>
    </div>
  );
}
