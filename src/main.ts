import "./styles/main.scss";
import { getAppRoot } from "./ts/dom";
import { renderHome, renderSettings } from "./ts/render";
import { renderBoard } from "./ts/render-board";
import { createInitialSettings } from "./ts/game-state";
import { createBoardState } from "./ts/board";
import type { GameSettings, BoardState } from "./ts/types";

/**
 * App entry point. Controls simple show/hide between screens
 * (no router, per project decision - 4 screens, no back-button need).
 */
function init(): void {
  const app = getAppRoot();
  showHome(app);
}

/** Shows the homescreen and wires up navigation to settings. */
function showHome(app: HTMLElement): void {
  renderHome(app, () => showSettings(app, createInitialSettings()));
}

/** Shows the settings page and wires up navigation to the board. */
function showSettings(app: HTMLElement, settings: GameSettings): void {
  renderSettings(app, settings, (finalSettings) => showBoard(app, finalSettings));
}

/**
 * Starts a new round and shows the board. Non-null assertions are safe here:
 * the Start button in renderSettings only fires onStart once isSettingsComplete() is true.
 */
function showBoard(app: HTMLElement, settings: GameSettings): void {
  const state = createBoardState(settings.theme!, settings.boardSize!, settings.player!);
  renderBoard(app, state, () => showHome(app), (finalState) => showGameOverPlaceholder(app, finalState));
}

/** Placeholder until Phase 4 delivers the real Game Over screen. */
function showGameOverPlaceholder(app: HTMLElement, state: BoardState): void {
  app.innerHTML = `<p style="color: white; padding: 2rem;">Game over – Blue ${state.scores.blue} / Orange ${state.scores.orange} – Phase 4</p>`;
}

init();
