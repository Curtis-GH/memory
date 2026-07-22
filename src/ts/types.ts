/** Available game themes (see settings page). Reduced to 2 per project decision. */
export type GameTheme = "codeVibes" | "gaming";

/** Player color, currently 2 options per checklist US2. */
export type PlayerColor = "blue" | "orange";

/** Card count per board size. 16 = 4x4, 24 = 6x4, 36 = 6x6 (measured from Figma export). */
export type BoardSize = 16 | 24 | 36;

/** Settings the user picks on the settings page before "Start" becomes active. */
export interface GameSettings {
  theme: GameTheme | null;
  player: PlayerColor | null;
  boardSize: BoardSize | null;
}

/**
 * The app's 4 screens. Navigation uses simple show/hide, no router
 * (decision: no back-button support needed for a game).
 */
export type Screen = "home" | "settings" | "board" | "gameOver";
