# Agent Guidelines for Idletown

## Commands
- **Build**: `pnpm run build`
- **Dev server**: `pnpm run dev`
- **Lint**: `pnpm run lint`
- **Lint fix**: `pnpm run lint:fix`
- **Start**: `pnpm run start`
- **Test**: No test script configured

## Code Style
- **Language**: TypeScript with strict mode enabled
- **Imports**: Type imports first, then value imports. Use relative paths for local files
- **Naming**: PascalCase for types/components, camelCase for variables/functions
- **Types**: Use explicit typing, prefer type guards over type assertions
- **Formatting**: Use Biome (configured in biome.json with 2-space indentation)
- **Error handling**: Use try/catch for async operations, validate inputs
- **Components**: Follow Kaplay patterns for games, use composition over inheritance
- **File structure**: Group by feature (entity/, comp/, system/, scene/ for games)

## Project Context
- Next.js 15 with React 19
- Biome for linting and formatting
- Tailwind CSS for styling
- Multiple projects:
  - **Zombies**: Kaplay-based 2D survival game with player, enemies, bullets, and scoring
  - **Calendar Diary**: Custom calendar app with diary entries, localStorage backend with swappable adapter