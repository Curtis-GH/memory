import "./styles/main.scss";
import { getAppRoot } from "./ts/dom";

/**
 * Einstiegspunkt. Aktuell nur Grundgerüst (Phase 0).
 * Phase 1 ersetzt dies durch renderHome(getAppRoot()).
 */
function init(): void {
  const app = getAppRoot();
  app.textContent = "Grundgerüst steht. Phase 1 folgt.";
}

init();
