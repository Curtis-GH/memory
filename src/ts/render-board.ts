import type { BoardState, Card, PlayerColor } from "./types";
import { revealCard, resolveTurn, hasPendingPair, isBoardComplete, iconPath, cardBackPath } from "./board";

/** Delay (ms) a non-matching pair stays face-up before flipping back. Gives the player time to see it. */
const MISMATCH_DELAY_MS = 900;

/** Grid column count per board size, per the confirmed 4x4 / 6x4 / 6x6 layout. */
const GRID_COLUMNS: Record<BoardState["boardSize"], number> = { 16: 4, 24: 6, 36: 6 };

/** Grid gap per board size, confirmed via Figma pixel measurement (16px / 6px). */
const GRID_GAP: Record<BoardState["boardSize"], string> = { 16: "1rem", 24: "0.375rem", 36: "0.375rem" };

/** Icon paths for the header's player chips/current-player marker (Code vibes only for now). */
function playerIcon(color: PlayerColor): string {
  return `/theme/codevibes-icon-player-${color}.png`;
}

/**
 * Renders the game board screen: header (score, current player, exit) + card grid.
 * Owns the turn/timeout logic internally and re-renders on every state change.
 * @param root - Mount element (#app)
 * @param state - Current board state
 * @param onExit - Callback fired when the user confirms "Exit game"
 * @param onComplete - Callback fired once all pairs are matched (round over)
 */
export function renderBoard(
  root: HTMLElement,
  state: BoardState,
  onExit: () => void,
  onComplete: (state: BoardState) => void
): void {
  root.innerHTML = boardTemplate(state);
  attachCardListeners(root, state, onExit, onComplete);
  attachExitListeners(root, state, onExit, onComplete);
}

/** Full board markup: header + grid. Popup is appended separately when open. */
function boardTemplate(state: BoardState): string {
  return `
    <section class="board">
      ${headerTemplate(state)}
      <div class="board__grid" style="--columns: ${GRID_COLUMNS[state.boardSize]}; --gap: ${GRID_GAP[state.boardSize]}">
        ${state.cards.map((card) => cardTemplate(state, card)).join("")}
      </div>
    </section>
  `;
}

/** Header row: score badges (left), current player (center), exit button (right). */
function headerTemplate(state: BoardState): string {
  return `
    <div class="board__header">
      <div class="badges">
        <span class="player-chip player-chip--blue"><img src="${playerIcon("blue")}" alt="" aria-hidden="true" />Blue ${state.scores.blue}</span>
        <span class="player-chip player-chip--orange"><img src="${playerIcon("orange")}" alt="" aria-hidden="true" />Orange ${state.scores.orange}</span>
      </div>
      <span class="current-player">Current player: <img src="${playerIcon(state.currentPlayer)}" alt="" aria-hidden="true" /></span>
      <button class="exit" type="button">
        <img src="/theme/codevibes-icon-exit.png" alt="" aria-hidden="true" /> Exit game
      </button>
    </div>
  `;
}

/** One card cell. Flip state + match state are driven by CSS classes only. */
function cardTemplate(state: BoardState, card: Card): string {
  const modifiers = cardModifierClasses(card);
  const disabled = card.status !== "hidden" ? "disabled" : "";
  const back = `<img class="card__face card__face--back" src="${cardBackPath(state.theme)}" alt="" aria-hidden="true" />`;
  const front = `<img class="card__face card__face--front" src="${iconPath(state.theme, card.iconId)}" alt="" aria-hidden="true" />`;
  return `
    <button class="card ${modifiers}" type="button" data-card-id="${card.id}" ${disabled} aria-label="Memory card">
      <span class="card__inner">${back}${front}</span>
    </button>
  `;
}

/** CSS modifier classes reflecting a card's flip/match state. */
function cardModifierClasses(card: Card): string {
  const flipped = card.status !== "hidden" ? "card--flipped" : "";
  const matched = card.status === "matched" ? "card--matched" : "";
  return `${flipped} ${matched}`.trim();
}

/** Wires up click handling for every hidden card, including the match/mismatch resolution timing. */
function attachCardListeners(
  root: HTMLElement,
  state: BoardState,
  onExit: () => void,
  onComplete: (state: BoardState) => void
): void {
  root.querySelectorAll<HTMLButtonElement>(".card:not([disabled])").forEach((el) => {
    el.addEventListener("click", () => {
      const cardId = Number(el.dataset.cardId);
      const next = revealCard(state, cardId);
      renderBoard(root, next, onExit, onComplete);
      if (hasPendingPair(next)) scheduleResolution(root, next, onExit, onComplete);
    });
  });
}

/** After a short delay, resolves the pending pair and re-renders (or fires onComplete). */
function scheduleResolution(
  root: HTMLElement,
  state: BoardState,
  onExit: () => void,
  onComplete: (state: BoardState) => void
): void {
  setTimeout(() => {
    const resolved = resolveTurn(state);
    if (isBoardComplete(resolved)) {
      onComplete(resolved);
      return;
    }
    renderBoard(root, resolved, onExit, onComplete);
  }, MISMATCH_DELAY_MS);
}

/** Wires up the exit button to show the confirmation popup. */
function attachExitListeners(
  root: HTMLElement,
  state: BoardState,
  onExit: () => void,
  onComplete: (state: BoardState) => void
): void {
  root.querySelector<HTMLButtonElement>(".exit")?.addEventListener("click", () => {
    showExitPopup(root, state, onExit, onComplete);
  });
}

/** Renders the "Are you sure?" overlay on top of the current board. */
function showExitPopup(
  root: HTMLElement,
  state: BoardState,
  onExit: () => void,
  onComplete: (state: BoardState) => void
): void {
  const overlay = document.createElement("div");
  overlay.className = "popup-overlay";
  overlay.innerHTML = popupTemplate();
  root.appendChild(overlay);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });
  overlay.querySelector(".popup__back")?.addEventListener("click", () => overlay.remove());
  overlay.querySelector(".popup__exit")?.addEventListener("click", onExit);
}

/** Exit-confirmation dialog markup. */
function popupTemplate(): string {
  return `
    <div class="popup">
      <p class="popup__text">Are you sure you want to quit the game?</p>
      <div class="popup__actions">
        <button class="popup__back" type="button">Back to game</button>
        <button class="popup__exit" type="button">Exit game</button>
      </div>
    </div>
  `;
}
