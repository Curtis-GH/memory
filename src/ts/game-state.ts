import type { GameSettings } from "./types";

/**
 * Creates the initial, empty settings state.
 * Gets bound to the UI in Phase 2 (Settings page).
 */
export function createInitialSettings(): GameSettings {
  return {
    theme: null,
    player: null,
    boardSize: null,
  };
}

/**
 * Checks whether all 3 required settings are set (start-button condition, US2).
 */
export function isSettingsComplete(settings: GameSettings): boolean {
  return settings.theme !== null && settings.player !== null && settings.boardSize !== null;
}

/** Returns a copy of settings with the theme updated. */
export function setTheme(settings: GameSettings, theme: GameSettings["theme"]): GameSettings {
  return { ...settings, theme };
}

/** Returns a copy of settings with the player color updated. */
export function setPlayer(settings: GameSettings, player: GameSettings["player"]): GameSettings {
  return { ...settings, player };
}

/** Returns a copy of settings with the board size updated. */
export function setBoardSize(settings: GameSettings, boardSize: GameSettings["boardSize"]): GameSettings {
  return { ...settings, boardSize };
}
