import type { GameSettings, GameTheme, PlayerColor, BoardSize } from "./types";
import { setTheme, setPlayer, setBoardSize, isSettingsComplete } from "./game-state";

// Phase 1: renderHome() implemented.
// Phase 2: renderSettings() implemented.
// TODO Phase 3/4: renderBoard(), Phase 5: renderGameOver()

/**
 * Renders the homescreen and wires up the play button.
 * @param root - Mount element (#app)
 * @param onPlay - Callback fired when the user clicks "Play"
 */
export function renderHome(root: HTMLElement, onPlay: () => void): void {
  root.innerHTML = homeTemplate();
  const playButton = root.querySelector<HTMLButtonElement>(".btn--play");
  playButton?.addEventListener("click", onPlay);
}

/** HTML template for the homescreen, kept outside inline code. */
function homeTemplate(): string {
  return `
    <section class="home">
      <img class="home__controller-icon" src="/home/home-controller.png" alt="" aria-hidden="true" />
      <div class="home__content">
        <p class="home__eyebrow">It's play time.</p>
        <h1 class="home__title">Ready to play?</h1>
        <button class="btn btn--play" type="button">
          <img class="btn__icon" src="/home/home-play-icon.svg" alt="" aria-hidden="true" />
          Play →
        </button>
      </div>
    </section>
  `;
}

const THEME_OPTIONS: { value: GameTheme; label: string }[] = [
  { value: "codeVibes", label: "Code vibes theme" },
  { value: "gaming", label: "Gaming theme" },
  { value: "daProjects", label: "DA Projects theme" },
  { value: "foods", label: "Foods theme" },
];

const PLAYER_OPTIONS: { value: PlayerColor; label: string }[] = [
  { value: "blue", label: "Blue" },
  { value: "orange", label: "Orange" },
];

const BOARD_SIZE_OPTIONS: { value: BoardSize; label: string }[] = [
  { value: 16, label: "16 cards" },
  { value: 24, label: "24 cards" },
  { value: 36, label: "36 cards" },
];

/**
 * Renders the settings page and wires up all option groups + start button.
 * @param root - Mount element (#app)
 * @param settings - Current settings state
 * @param onStart - Callback fired with the final settings when "Start" is clicked
 */
export function renderSettings(
  root: HTMLElement,
  settings: GameSettings,
  onStart: (settings: GameSettings) => void
): void {
  root.innerHTML = settingsTemplate(settings);
  attachSettingsListeners(root, settings, onStart);
}

/** Full settings page markup, split into small template helpers below. */
function settingsTemplate(settings: GameSettings): string {
  return `
    <section class="settings">
      <h1 class="settings__title">Settings</h1>
      <div class="settings__body">
        ${optionsColumnTemplate(settings)}
        ${previewTemplate(settings.theme)}
      </div>
      ${breadcrumbTemplate(settings)}
    </section>
  `;
}

/** Left column: the 3 option groups (theme, player, board size). */
function optionsColumnTemplate(settings: GameSettings): string {
  return `
    <div class="settings__options">
      ${optionGroupTemplate("theme", "Game themes", "/settings/settings-icon-theme.png", THEME_OPTIONS, settings.theme)}
      ${optionGroupTemplate("player", "Choose player", "/player/player-token.png", PLAYER_OPTIONS, settings.player)}
      ${optionGroupTemplate("boardSize", "Board size", "/settings/settings-icon-board-size.png", BOARD_SIZE_OPTIONS, settings.boardSize)}
    </div>
  `;
}

/** Right column: live preview image based on the selected theme. */
function previewTemplate(theme: GameSettings["theme"]): string {
  return `
    <div class="settings__preview">
      <img src="${previewImage(theme)}" alt="" aria-hidden="true" style="max-width: 100%;" />
    </div>
  `;
}

/** Maps a theme to its preview asset. Falls back to a generic card if none selected. */
function previewImage(theme: GameSettings["theme"]): string {
  switch (theme) {
    case "codeVibes":
      return "/theme/card-back-codevibes.png";
    case "gaming":
      return "/theme/card-front-gaming.png";
    case "daProjects":
      return "/theme/theme-icon-daprojects.png";
    case "foods":
      return "/theme/card-front-generic.png";
    default:
      return "/theme/card-front-generic.png";
  }
}

/** Bottom bar: breadcrumb labels + Start button (disabled until settings complete). */
function breadcrumbTemplate(settings: GameSettings): string {
  const disabled = isSettingsComplete(settings) ? "" : "disabled";
  return `
    <div class="settings__breadcrumb">
      <span>Game theme</span> / <span>Player</span> / <span>Board size</span>
      <button class="btn btn--start" type="button" ${disabled}>Start</button>
    </div>
  `;
}

/** One option group (label + icon + radio list). Generic over string/number values. */
function optionGroupTemplate<T extends string | number>(
  name: string,
  label: string,
  icon: string,
  options: { value: T; label: string }[],
  selected: T | null
): string {
  const items = options.map((opt) => optionItemTemplate(name, opt, selected)).join("");
  return `
    <div class="option-group" data-group="${name}">
      <p class="option-group__label"><img class="option-group__icon" src="${icon}" alt="" aria-hidden="true" /> ${label}</p>
      <div class="option-group__list">${items}</div>
    </div>
  `;
}

/** One radio option within a group. */
function optionItemTemplate<T extends string | number>(
  name: string,
  opt: { value: T; label: string },
  selected: T | null
): string {
  const isActive = selected === opt.value;
  return `
    <label class="option ${isActive ? "option--active" : ""}">
      <input type="radio" name="${name}" value="${opt.value}" ${isActive ? "checked" : ""} />
      ${opt.label}
    </label>
  `;
}

/** Wires up change events for all 3 radio groups plus the start button. */
function attachSettingsListeners(
  root: HTMLElement,
  settings: GameSettings,
  onStart: (settings: GameSettings) => void
): void {
  let current = settings;
  const rerender = (next: GameSettings): void => {
    current = next;
    renderSettings(root, current, onStart);
  };
  bindRadioGroup(root, "theme", (v) => rerender(setTheme(current, v as GameTheme)));
  bindRadioGroup(root, "player", (v) => rerender(setPlayer(current, v as PlayerColor)));
  bindRadioGroup(root, "boardSize", (v) => rerender(setBoardSize(current, Number(v) as BoardSize)));
  root.querySelector<HTMLButtonElement>(".btn--start")?.addEventListener("click", () => onStart(current));
}

/** Attaches a change listener to every radio input within a named group. */
function bindRadioGroup(root: HTMLElement, name: string, onChange: (value: string) => void): void {
  root.querySelectorAll<HTMLInputElement>(`input[name="${name}"]`).forEach((el) =>
    el.addEventListener("change", () => onChange(el.value))
  );
}
