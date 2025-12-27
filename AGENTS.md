# Agent Guidelines for Idletown

## Commands
- **Build**: `pnpm run build`
- **Dev server**: `pnpm run dev`
- **Lint**: `pnpm run lint`
- **Lint fix**: `pnpm run lint:fix`
- **Start**: `pnpm run start`
- **Test**: `pnpm run test` (watch mode)
- **Test run**: `pnpm run test:run` (single run)
- **Test UI**: `pnpm run test:ui` (UI mode)

## Code Style
- **Language**: TypeScript with strict mode enabled
- **Imports**: Type imports first, then value imports. Use relative paths for local files
- **Naming**: PascalCase for types/components, camelCase for variables/functions
- **Types**: Use explicit typing, prefer type guards over type assertions
- **Formatting**: Use Biome (configured in biome.json with 2-space indentation)
- **Error handling**: Use try/catch for async operations, validate inputs
- **Components**: Follow Kaplay patterns for games, use composition over inheritance
- **File structure**: Group by feature (entity/, comp/, system/, scene/ for games)
- **Testing**: Use Vitest with Arrange/Act/Assert pattern. Write tests alongside code with .test.ts suffix

## Project Context
- Next.js 15 with React 19
- Biome for linting and formatting
- Tailwind CSS for styling
- **Design System**: Reusable UI components in `app/components/` (Button, Card, Modal, Alert, etc.)
  - Import from `@/app/components` (barrel export)
  - Theme tokens in `app/config/theme.ts` for colors, spacing, variants
  - Preview at `/design-system`
  - Prefer design system components over custom implementations
- Vitest with happy-dom for testing
- Multiple projects:
  - **Zombies**: Kaplay-based 2D survival game with player, enemies, bullets, and scoring
  - **Calendar Diary**: Custom calendar app with diary entries, localStorage backend with swappable adapter
  - **Sketchbook**: Canvas-based drawing app with stroke encoding/decoding
  - **Music Quiz**: YouTube-based music quiz game
  - **Rock Paper Scissors**: WebRTC multiplayer game
  - **Coin Flipper**: Simple coin flip app