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

/** Visual state of a single card on the board. */
export type CardStatus = "hidden" | "revealed" | "matched";

/** One card on the board. Two cards share the same iconId (a matching pair). */
export interface Card {
  id: number;
  iconId: string;
  status: CardStatus;
}

/** Score per player color. */
export type Scores = Record<PlayerColor, number>;

/**
 * Full state of an in-progress game. Kept immutable - every action in
 * board.ts returns a new BoardState instead of mutating this one.
 */
export interface BoardState {
  theme: GameTheme;
  boardSize: BoardSize;
  cards: Card[];
  currentPlayer: PlayerColor;
  scores: Scores;
  /** IDs of the currently revealed (but not yet matched) cards, max 2. */
  revealedIds: number[];
}
