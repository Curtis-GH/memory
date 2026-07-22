import "./styles/main.scss";
import { getAppRoot } from "./ts/dom";
import { renderHome } from "./ts/render";

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
  renderHome(app, () => showSettingsPlaceholder(app));
}

/** Placeholder until Phase 2 delivers the real settings page. */
function showSettingsPlaceholder(app: HTMLElement): void {
  app.innerHTML = `<p style="color: white; padding: 2rem;">Settings – coming in Phase 2</p>`;
}

init();
