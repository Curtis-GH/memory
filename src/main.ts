import "./styles/main.scss";
import { getAppRoot } from "./ts/dom";
import { renderHome, renderSettings } from "./ts/render";
import { createInitialSettings } from "./ts/game-state";
import type { GameSettings } from "./ts/types";

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
  renderSettings(app, settings, (finalSettings) => showBoardPlaceholder(app, finalSettings));
}

/** Placeholder until Phase 3 delivers the real board. */
function showBoardPlaceholder(app: HTMLElement, settings: GameSettings): void {
  app.innerHTML = `<p style="color: white; padding: 2rem;">Board (${settings.theme}, ${settings.player}, ${settings.boardSize}) – coming in Phase 3</p>`;
}

init();
