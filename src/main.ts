import "./styles/main.scss";
import { getAppRoot } from "./ts/dom";
import { renderHome, renderSettings } from "./ts/render";
import { renderBoard } from "./ts/render-board";
import { renderGameOver } from "./ts/render-gameover";
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
  renderBoard(app, state, () => showHome(app), (finalState) => showGameOver(app, finalState));
}

/** Shows the Game over -> Winner/Draw sequence. "Back to start"/"Home" returns to the homescreen. */
function showGameOver(app: HTMLElement, state: BoardState): void {
  renderGameOver(app, state, () => showHome(app));
}

init();
