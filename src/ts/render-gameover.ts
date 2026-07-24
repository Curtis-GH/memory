import type { BoardState, GameTheme, Outcome, PlayerColor } from "./types";
import { determineOutcome } from "./board";
import { themeClass, playerIcon, scoreLabel } from "./render-board";

/** How long the plain "Game over" score screen stays up before auto-advancing (confirmed with the user). */
const SCORE_SCREEN_DURATION_MS = 3000;

/**
 * Renders the full end-of-round sequence: "Game over" + final score first,
 * then automatically swaps to the Winner/Draw screen after SCORE_SCREEN_DURATION_MS.
 * @param root - Mount element (#app)
 * @param state - The completed board state (all pairs matched)
 * @param onBackToStart - Callback fired when the user clicks "Back to start" / "Home"
 */
export function renderGameOver(root: HTMLElement, state: BoardState, onBackToStart: () => void): void {
  root.innerHTML = scoreScreenTemplate(state);
  setTimeout(() => {
    const outcome = determineOutcome(state);
    root.innerHTML = outcomeScreenTemplate(state.theme, outcome);
    root.querySelector(".outcome__button")?.addEventListener("click", onBackToStart);
  }, SCORE_SCREEN_DURATION_MS);
}

/** First screen: "Game over" title + final score, no button (auto-advances). */
function scoreScreenTemplate(state: BoardState): string {
  const cls = themeClass(state.theme);
  return `
    <section class="gameover gameover--${cls}">
      <div class="gameover__wrapper">
        <h1 class="gameover__title">Game over</h1>
        <p class="gameover__label">Final score</p>
        <div class="badges badges--${cls} gameover__score">
          <span class="player-chip player-chip--blue"><img src="${playerIcon(state.theme, "blue")}" alt="" aria-hidden="true" />${scoreLabel(state.theme, "Blue", state.scores.blue)}</span>
          <span class="player-chip player-chip--orange"><img src="${playerIcon(state.theme, "orange")}" alt="" aria-hidden="true" />${scoreLabel(state.theme, "Orange", state.scores.orange)}</span>
        </div>
      </div>
    </section>
  `;
}

/** Second screen: Winner (with theme-specific icon) or Draw, plus the "back to start" button. */
function outcomeScreenTemplate(theme: GameTheme, outcome: Outcome): string {
  const cls = themeClass(theme);
  const buttonLabel = theme === "codeVibes" ? "Back to start" : "Home";
  const body = outcome.kind === "draw" ? drawBody() : winnerBody(theme, outcome.player);
  return `
    <section class="gameover gameover--${cls} outcome outcome--${outcome.kind}">
      <div class="gameover__wrapper">
        ${body}
        <button class="outcome__button" type="button">${buttonLabel}</button>
      </div>
    </section>
  `;
}

/** Winner body: Code vibes shows a big pawn token + confetti, Gaming shows a trophy. */
function winnerBody(theme: GameTheme, player: PlayerColor): string {
  return theme === "codeVibes" ? winnerBodyCodeVibes(player) : winnerBodyGaming(player);
}

/** Code vibes winner: confetti banner + pawn token icon in the winner's color. */
function winnerBodyCodeVibes(player: PlayerColor): string {
  const token = player === "blue" ? "/player/player-token-alt.png" : "/player/player-token.png";
  const name = player === "blue" ? "Blue" : "Orange";
  return `
    <img class="outcome__confetti" src="/gameover/gameover-confetti-wide.png" alt="" aria-hidden="true" />
    <p class="outcome__label">The winner is</p>
    <h1 class="outcome__title outcome__title--${player}">${name} player</h1>
    <img class="outcome__icon" src="${token}" alt="" />
  `;
}

/** Gaming winner: same gold trophy for both colors, only the headline text changes color. */
function winnerBodyGaming(player: PlayerColor): string {
  const name = player === "blue" ? "Blue" : "Orange";
  return `
    <p class="outcome__label">The winner is</p>
    <h1 class="outcome__title outcome__title--${player}">${name} Player</h1>
    <img class="outcome__icon outcome__icon--trophy" src="/gameover/gameover-trophy.png" alt="" />
  `;
}

/** Draw body: same "scales" icon for both themes, recolored per theme via CSS mask (see _gameover.scss). */
function drawBody(): string {
  return `
    <p class="outcome__label">It's a</p>
    <h1 class="outcome__title outcome__title--draw">DRAW</h1>
    <span class="outcome__scale" aria-hidden="true"></span>
  `;
}
