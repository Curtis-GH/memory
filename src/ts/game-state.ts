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
