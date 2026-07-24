import type { BoardState, BoardSize, GameTheme, PlayerColor, Card, Outcome } from "./types";

/** All 18 available icon ids per theme, in the exact filename order shipped in /public/board/. */
const ICON_SETS: Record<GameTheme, string[]> = {
  codeVibes: [
    "git", "typescript", "javascript", "html5", "vscode", "css3", "django", "angular",
    "terminal", "python", "github", "nodejs", "bootstrap", "vue", "react", "sass",
    "database", "firebase",
  ],
  gaming: [
    "squidgame-circle", "squidgame-square", "squidgame-triangle", "maze", "creeper", "mushroom",
    "dice", "banana", "controller", "pacman-ghost", "star-coin", "snake", "level-up", "pacman",
    "gameboy", "puzzle", "ace-diamond", "play-button",
  ],
};

/** Returns the public asset path for a card's front icon. */
export function iconPath(theme: GameTheme, iconId: string): string {
  return `/board/${theme === "codeVibes" ? "codevibes" : "gaming"}/icon-${iconId}.png`;
}

/** Returns the public asset path for a theme's card back (shown while hidden). */
export function cardBackPath(theme: GameTheme): string {
  return `/board/${theme === "codeVibes" ? "codevibes" : "gaming"}/card-back.png`;
}

/** Fisher-Yates shuffle, returns a new array (does not mutate input). */
function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Builds the shuffled deck of cards for a given theme + board size. Icon subset choice is arbitrary. */
function createDeck(theme: GameTheme, boardSize: BoardSize): Card[] {
  const pairCount = boardSize / 2;
  const iconIds = ICON_SETS[theme].slice(0, pairCount);
  const doubled = [...iconIds, ...iconIds];
  return shuffle(doubled).map((iconId, index) => ({
    id: index,
    iconId,
    status: "hidden" as const,
  }));
}

/** Creates a fresh board state for a new round. */
export function createBoardState(theme: GameTheme, boardSize: BoardSize, startingPlayer: PlayerColor): BoardState {
  return {
    theme,
    boardSize,
    cards: createDeck(theme, boardSize),
    currentPlayer: startingPlayer,
    scores: { blue: 0, orange: 0 },
    revealedIds: [],
  };
}

/** True once every card has been matched (round over). */
export function isBoardComplete(state: BoardState): boolean {
  return state.cards.every((card) => card.status === "matched");
}

/**
 * Reveals a card the player clicked. Ignores clicks on already-revealed/matched
 * cards or while 2 cards are already face-up (waiting for resolveTurn()).
 */
export function revealCard(state: BoardState, cardId: number): BoardState {
  const card = state.cards.find((c) => c.id === cardId);
  if (!card || card.status !== "hidden" || state.revealedIds.length >= 2) {
    return state;
  }
  const cards = state.cards.map((c) => (c.id === cardId ? { ...c, status: "revealed" as const } : c));
  return { ...state, cards, revealedIds: [...state.revealedIds, cardId] };
}

/** True once 2 cards are face-up and ready to be checked. */
export function hasPendingPair(state: BoardState): boolean {
  return state.revealedIds.length === 2;
}

/**
 * Resolves the 2 currently revealed cards: marks them matched + scores a point
 * on match (same player continues), or flips them back + switches player on a miss.
 */
export function resolveTurn(state: BoardState): BoardState {
  const [firstId, secondId] = state.revealedIds;
  const first = state.cards.find((c) => c.id === firstId);
  const second = state.cards.find((c) => c.id === secondId);
  if (!first || !second) return state;

  const isMatch = first.iconId === second.iconId;
  return {
    ...state,
    cards: applyPairResult(state.cards, firstId, secondId, isMatch),
    revealedIds: [],
    scores: isMatch ? bumpScore(state.scores, state.currentPlayer) : state.scores,
    currentPlayer: isMatch ? state.currentPlayer : switchPlayer(state.currentPlayer),
  };
}

/** Sets the 2 resolved cards to "matched" (hit) or back to "hidden" (miss). */
function applyPairResult(cards: Card[], firstId: number, secondId: number, isMatch: boolean): Card[] {
  const nextStatus: Card["status"] = isMatch ? "matched" : "hidden";
  return cards.map((c) => (c.id === firstId || c.id === secondId ? { ...c, status: nextStatus } : c));
}

/** Returns a new scores object with the given player's count increased by 1. */
function bumpScore(scores: BoardState["scores"], player: PlayerColor): BoardState["scores"] {
  return { ...scores, [player]: scores[player] + 1 };
}

/** Compares final scores to determine the round's outcome. Call once isBoardComplete() is true. */
export function determineOutcome(state: BoardState): Outcome {
  if (state.scores.blue === state.scores.orange) return { kind: "draw" };
  return { kind: "winner", player: state.scores.blue > state.scores.orange ? "blue" : "orange" };
}

/** Returns the other player's color. */
function switchPlayer(player: PlayerColor): PlayerColor {
  return player === "blue" ? "orange" : "blue";
}
