# Memory

A browser-based Memory game built with Vite, TypeScript and SCSS, featuring two selectable visual themes, three board sizes, and a 2-player local mode.

## Setup

```bash
npm install
npm run dev
```

Opens a local dev server (Vite). The dev server does not persist between sessions — run `npm run dev` again each time you continue working.

## Other scripts

```bash
npm run build    # type-checks (tsc --noEmit) and creates a production build in dist/
npm run preview  # serves the production build locally
```

## Tech stack

- **Vite** + **TypeScript** (strict mode)
- **SCSS**, structured after the 7-1 pattern (`src/styles/abstracts`, `base`, `components`, `layout`, `pages`, `themes`)
- No framework, no router — screens are rendered by directly swapping `innerHTML` (see `src/main.ts`)

## Features

- Homescreen → Settings → Board → Game Over / Winner / Draw, no back-navigation needed for a game
- 2 selectable themes (**Code vibes**, **Gaming**), each with its own colors, fonts, card art, and header/popup shapes
- 3 board sizes (16 / 24 / 36 cards)
- 2-player local mode with score tracking and animated card flips
- Automatic Winner/Draw detection after the last pair is matched

## Notes

- The Gaming theme uses two Google Fonts (**Fredoka** for UI text, **Orbitron** for the Game Over/Winner/Draw headlines) loaded via `index.html`. No matching font files were provided in the original design, these are visual approximations.
- Some spacing/color values were derived from pixel-measuring exported design screenshots rather than exact design-tool values; where relevant this is noted directly in the SCSS source comments.
