/** Verfügbare Spielthemes (siehe Settings-Page, 4 Stück). */
export type GameTheme = "codeVibes" | "gaming" | "daProjects" | "foods";

/** Spielerfarbe, aktuell 2 Optionen laut Checkliste US2. */
export type PlayerColor = "blue" | "orange";

/** Kartenanzahl pro Boardgröße. 16 = 4x4, 24 = 6x4, 36 = 6x6 (gemessen aus Figma-Export). */
export type BoardSize = 16 | 24 | 36;

/** Einstellungen, die der Nutzer auf der Settings-Page trifft, bevor "Start" aktiv wird. */
export interface GameSettings {
  theme: GameTheme | null;
  player: PlayerColor | null;
  boardSize: BoardSize | null;
}
