import type { DrawTool } from "../types";

type ToolPaletteProps = {
  selectedTool: DrawTool;
  onToolSelect: (tool: DrawTool) => void;
};

const TOOLS: { id: DrawTool; name: string; icon: string; shortcut: string }[] =
  [
    { id: "pencil", name: "Pencil", icon: "P", shortcut: "P" },
    { id: "eraser", name: "Eraser", icon: "E", shortcut: "E" },
    { id: "fill", name: "Fill Bucket", icon: "F", shortcut: "F" },
    { id: "eyedropper", name: "Eyedropper", icon: "I", shortcut: "I" },
  ];

export function ToolPalette({ selectedTool, onToolSelect }: ToolPaletteProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Tools
      </h3>
      <div className="flex flex-wrap gap-1">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            type="button"
            title={`${tool.name} (${tool.shortcut})`}
            onClick={() => onToolSelect(tool.id)}
            className={`w-10 h-10 rounded flex items-center justify-center text-sm font-bold transition-all ${
              selectedTool === tool.id
                ? "bg-blue-500 text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
            aria-label={tool.name}
            aria-pressed={selectedTool === tool.id}
          >
            {tool.icon}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Shortcuts: P, E, F, I
      </p>
    </div>
  );
}
