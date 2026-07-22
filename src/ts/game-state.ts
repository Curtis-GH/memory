import type { GameSettings } from "./types";

/**
 * Erzeugt den initialen, leeren Settings-Zustand.
 * Wird in Phase 2 (Settings-Page) an die UI gebunden.
 */
export function createInitialSettings(): GameSettings {
  return {
    theme: null,
    player: null,
    boardSize: null,
  };
}

/**
 * Prüft, ob alle 3 Pflicht-Settings gesetzt sind (Start-Button-Bedingung, US2).
 */
export function isSettingsComplete(settings: GameSettings): boolean {
  return settings.theme !== null && settings.player !== null && settings.boardSize !== null;
}
