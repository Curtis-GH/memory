import "./styles/main.scss";
import { getAppRoot } from "./ts/dom";
import { renderHome } from "./ts/render";

/**
 * Einstiegspunkt der App. Steuert simples Show/Hide zwischen Screens
 * (kein Router, siehe Projekt-Entscheidung - 4 Screens, kein Back-Button-Bedarf).
 */
function init(): void {
  const app = getAppRoot();
  showHome(app);
}

/** Zeigt den Homescreen und verdrahtet die Navigation zu Settings. */
function showHome(app: HTMLElement): void {
  renderHome(app, () => showSettingsPlaceholder(app));
}

/** Platzhalter bis Phase 2 die echte Settings-Page liefert. */
function showSettingsPlaceholder(app: HTMLElement): void {
  app.innerHTML = `<p style="color: white; padding: 2rem;">Settings – kommt in Phase 2</p>`;
}

init();
