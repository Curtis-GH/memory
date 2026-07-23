import type { BoardState, Card, GameTheme, PlayerColor } from "./types";
import { revealCard, resolveTurn, hasPendingPair, isBoardComplete, iconPath, cardBackPath } from "./board";

/** Delay (ms) a non-matching pair stays face-up before flipping back. Gives the player time to see it. */
const MISMATCH_DELAY_MS = 900;

/** Grid column count per board size, per the confirmed 4x4 / 6x4 / 6x6 layout (same for both themes). */
const GRID_COLUMNS: Record<BoardState["boardSize"], number> = { 16: 4, 24: 6, 36: 6 };

/** Card width/height + grid gap per theme and board size, in rem (see _variables.scss for sourcing notes). */
const BOARD_METRICS: Record<GameTheme, { width: string; height: string; gap: Record<BoardState["boardSize"], string> }> = {
  codeVibes: {
    width: "7.5rem",
    height: "7.5rem",
    gap: { 16: "1rem", 24: "0.375rem", 36: "0.375rem" },
  },
  gaming: {
    width: "8.0625rem",
    height: "9rem",
    gap: { 16: "0.5rem", 24: "0.1875rem", 36: "0.1875rem" },
  },
};

/** CSS class suffix used for theme-scoped selectors ("codeVibes" | "gaming"). */
function themeClass(theme: GameTheme): string {
  return theme === "codeVibes" ? "codeVibes" : "gaming";
}

/** Icon path for the header's player chips/current-player marker, per theme. */
function playerIcon(theme: GameTheme, color: PlayerColor): string {
  const prefix = theme === "codeVibes" ? "codevibes" : "gaming";
  return `/theme/${prefix}-icon-player-${color}.png`;
}

/** Icon path for the exit button, per theme (gaming uses the white variant for contrast). */
function exitIcon(theme: GameTheme): string {
  return theme === "codeVibes" ? "/theme/codevibes-icon-exit.png" : "/theme/gaming-icon-exit-white.png";
}

/**
 * Renders the game board screen once, then owns all further updates via direct
 * DOM mutation (see attachCardListeners). This is deliberate: replacing the grid's
 * innerHTML on every click would recreate the card elements from scratch, which
 * skips the CSS flip transition entirely (a browser can only animate a property
 * change on an element that already exists - not a freshly created one).
 * @param root - Mount element (#app)
 * @param initialState - Starting board state
 * @param onExit - Callback fired when the user confirms "Exit game"
 * @param onComplete - Callback fired once all pairs are matched (round over)
 */
export function renderBoard(
  root: HTMLElement,
  initialState: BoardState,
  onExit: () => void,
  onComplete: (state: BoardState) => void
): void {
  let state = initialState;
  root.innerHTML = boardTemplate(state);

  const getState = (): BoardState => state;
  const setState = (next: BoardState): void => {
    state = next;
  };

  attachCardListeners(root, getState, setState, onComplete);
  attachExitListener(root, getState, onExit);
}

/** Full board markup: header + grid, both constrained to the same content wrapper. Built once per round. */
function boardTemplate(state: BoardState): string {
  const metrics = BOARD_METRICS[state.theme];
  const gridStyle = `--columns: ${GRID_COLUMNS[state.boardSize]}; --gap: ${metrics.gap[state.boardSize]}; --card-width: ${metrics.width}; --card-height: ${metrics.height}`;
  return `
    <section class="board board--${themeClass(state.theme)}">
      <div class="board__wrapper">
        ${headerTemplate(state)}
        <div class="board__grid" style="${gridStyle}">
          ${state.cards.map((card) => cardTemplate(state, card)).join("")}
        </div>
      </div>
    </section>
  `;
}

/** Header row: score badges (left), current player (center), exit button (right). Markup differs slightly per theme. */
function headerTemplate(state: BoardState): string {
  const { theme, scores, currentPlayer } = state;
  return `
    <div class="game-header game-header--${themeClass(theme)}">
      <div class="badges">
        <span class="player-chip player-chip--blue"><img src="${playerIcon(theme, "blue")}" alt="" aria-hidden="true" /><span data-score="blue">${scoreLabel(theme, "Blue", scores.blue)}</span></span>
        <span class="player-chip player-chip--orange"><img src="${playerIcon(theme, "orange")}" alt="" aria-hidden="true" /><span data-score="orange">${scoreLabel(theme, "Orange", scores.orange)}</span></span>
      </div>
      <span class="current-player">Current player: <img data-current-player-icon src="${playerIcon(theme, currentPlayer)}" alt="" aria-hidden="true" /></span>
      <button class="exit" type="button">
        <img src="${exitIcon(theme)}" alt="" aria-hidden="true" /> Exit game
      </button>
    </div>
  `;
}

/** Score label text: Code vibes shows "Blue 0", Gaming shows just the number (icon carries the color). */
function scoreLabel(theme: GameTheme, name: string, score: number): string {
  return theme === "codeVibes" ? `${name} ${score}` : `${score}`;
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

/**
 * Wires up card clicks. On reveal, mutates the clicked button's own classes
 * directly (so the flip transition plays), instead of re-rendering the grid.
 */
function attachCardListeners(
  root: HTMLElement,
  getState: () => BoardState,
  setState: (next: BoardState) => void,
  onComplete: (state: BoardState) => void
): void {
  root.querySelectorAll<HTMLButtonElement>(".card").forEach((el) => {
    el.addEventListener("click", () => {
      const cardId = Number(el.dataset.cardId);
      const next = revealCard(getState(), cardId);
      if (next === getState()) return; // click was ignored (already 2 face-up, or invalid)
      setState(next);
      flipElement(el, "flipped");
      if (hasPendingPair(next)) scheduleResolution(root, getState, setState, onComplete);
    });
  });
}

/** After a short delay, resolves the pending pair and updates only the 2 affected cards + header. */
function scheduleResolution(
  root: HTMLElement,
  getState: () => BoardState,
  setState: (next: BoardState) => void,
  onComplete: (state: BoardState) => void
): void {
  const { revealedIds } = getState();
  setTimeout(() => {
    const resolved = resolveTurn(getState());
    setState(resolved);
    applyResolution(root, resolved, revealedIds);
    updateHeader(root, resolved);
    if (isBoardComplete(resolved)) onComplete(resolved);
  }, MISMATCH_DELAY_MS);
}

/** Applies the match/mismatch result to exactly the 2 cards that were revealed - no full re-render. */
function applyResolution(root: HTMLElement, state: BoardState, revealedIds: number[]): void {
  revealedIds.forEach((id) => {
    const card = state.cards.find((c) => c.id === id);
    const el = root.querySelector<HTMLButtonElement>(`.card[data-card-id="${id}"]`);
    if (!card || !el) return;
    if (card.status === "matched") {
      el.classList.add("card--matched");
    } else {
      flipElement(el, "unflipped");
    }
  });
}

/** Toggles the flip class + disabled state on a single card button. */
function flipElement(el: HTMLButtonElement, direction: "flipped" | "unflipped"): void {
  el.classList.toggle("card--flipped", direction === "flipped");
  el.disabled = direction === "flipped";
}

/** Updates the score numbers and current-player icon in place, without touching the card grid. */
function updateHeader(root: HTMLElement, state: BoardState): void {
  const blueEl = root.querySelector('[data-score="blue"]');
  const orangeEl = root.querySelector('[data-score="orange"]');
  if (blueEl) blueEl.textContent = scoreLabel(state.theme, "Blue", state.scores.blue);
  if (orangeEl) orangeEl.textContent = scoreLabel(state.theme, "Orange", state.scores.orange);
  const currentIcon = root.querySelector<HTMLImageElement>("[data-current-player-icon]");
  if (currentIcon) currentIcon.src = playerIcon(state.theme, state.currentPlayer);
}

/** Wires up the exit button to show the confirmation popup. */
function attachExitListener(root: HTMLElement, getState: () => BoardState, onExit: () => void): void {
  root.querySelector<HTMLButtonElement>(".exit")?.addEventListener("click", () => {
    showExitPopup(root, getState().theme, onExit);
  });
}

/** Renders the "Are you sure?" overlay on top of the current board. */
function showExitPopup(root: HTMLElement, theme: GameTheme, onExit: () => void): void {
  const overlay = document.createElement("div");
  overlay.className = "popup-overlay";
  overlay.innerHTML = popupTemplate(theme);
  root.appendChild(overlay);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });
  overlay.querySelector(".popup__back")?.addEventListener("click", () => overlay.remove());
  overlay.querySelector(".popup__exit")?.addEventListener("click", onExit);
}

/** Exit-confirmation dialog markup. Button labels differ per theme, per the Figma exports. */
function popupTemplate(theme: GameTheme): string {
  const backLabel = theme === "codeVibes" ? "Back to game" : "No, back to game";
  const exitLabel = theme === "codeVibes" ? "Exit game" : "Yes, quit game";
  return `
    <div class="popup popup--${themeClass(theme)}">
      <p class="popup__text">Are you sure you want to quit the game?</p>
      <div class="popup__actions">
        <button class="popup__back" type="button">${backLabel}</button>
        <button class="popup__exit" type="button">${exitLabel}</button>
      </div>
    </div>
  `;
}
