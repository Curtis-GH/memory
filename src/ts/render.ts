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
      <div class="home__wrapper">
        <img class="home__controller-icon" src="/home/home-controller.png" alt="" aria-hidden="true" />
        <div class="home__content">
          <p class="home__eyebrow">It's play time.</p>
          <h1 class="home__title">Ready to play?</h1>
          <div class="home__button-wrap">
            <button class="btn btn--play" type="button">
              <img class="btn__icon" src="/home/home-icon-controller.png" alt="" aria-hidden="true" />
              Play
              <img class="btn__icon" src="/home/home-icon-arrow.png" alt="" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  `;
}

/**
 * Per-theme preview assets. "foreground"/"background" describe screen depth in the
 * mockup (which card sits in front), independent of which file is visually the
 * card-back vs card-front design - the two themes use opposite mappings here.
 */
const THEME_PREVIEW: Record<
  GameTheme,
  { foreground: string; background: string; previewClass: string; headerClass: string }
> = {
  codeVibes: {
    foreground: "/theme/codevibes-card-front.png",
    background: "/theme/codevibes-card-back.png",
    previewClass: "settings__preview--codeVibes",
    headerClass: "preview-header--codeVibes",
  },
  gaming: {
    foreground: "/theme/gaming-card-back.png",
    background: "/theme/gaming-card-front.png",
    previewClass: "settings__preview--gaming",
    headerClass: "preview-header--gaming",
  },
};

const THEME_OPTIONS: { value: GameTheme; label: string }[] = [
  { value: "codeVibes", label: "Code vibes theme" },
  { value: "gaming", label: "Gaming theme" },
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
  attachThemeHoverPreview(root, settings);
  showThemePreview(root.querySelector(".settings__preview")!, settings);
}

/** Full settings page markup, split into small template helpers below. */
function settingsTemplate(settings: GameSettings): string {
  return `
    <div class="settings__wrapper">
      <div class="settings__title-row">
        <h1 class="settings__title">Settings</h1>
        <img class="settings__title-divider" src="/settings/settings-divider.png" alt="" aria-hidden="true" />
      </div>
      <div class="settings__body">
        ${optionsColumnTemplate(settings)}
        <div class="settings__preview-column">
          <div class="settings__preview"></div>
          ${breadcrumbTemplate(settings)}
        </div>
      </div>
    </div>
  `;
}

/** Left column: the 3 option groups (theme, player, board size). */
function optionsColumnTemplate(settings: GameSettings): string {
  return `
    <div class="settings__options">
      ${optionGroupTemplate("theme", "Game themes", "/settings/settings-icon-theme.png", THEME_OPTIONS, settings.theme)}
      ${optionGroupTemplate("player", "Choose player", "/settings/settings-icon-player.png", PLAYER_OPTIONS, settings.player)}
      ${optionGroupTemplate("boardSize", "Board size", "/settings/settings-icon-board-size.png", BOARD_SIZE_OPTIONS, settings.boardSize)}
    </div>
  `;
}

/** Bottom bar: live breadcrumb of the current selection + Start button. */
function breadcrumbTemplate(settings: GameSettings): string {
  const disabled = isSettingsComplete(settings) ? "" : "disabled";
  const divider = `<img class="settings__breadcrumb__divider" src="/settings/settings-breadcrumb-divider.png" alt="" aria-hidden="true" />`;
  return `
    <div class="settings__breadcrumb">
      <span>Game theme: ${settings.theme ?? "—"}</span>
      ${divider}
      <span>Player: ${settings.player ?? "—"}</span>
      ${divider}
      <span>Board size: ${settings.boardSize ?? "—"}</span>
      <span class="settings__breadcrumb__spacer"></span>
      <button class="btn btn--start" type="button" ${disabled}>
        <img class="btn__icon" src="/settings/settings-icon-start.png" alt="" aria-hidden="true" />
        Start
      </button>
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
  const indicator = isActive
    ? '<img class="option__indicator" src="/settings/settings-active-indicator.png" alt="" aria-hidden="true" />'
    : "";
  return `
    <label class="option ${isActive ? "option--active" : ""}">
      <input type="radio" name="${name}" value="${opt.value}" ${isActive ? "checked" : ""} />
      ${opt.label}
      ${indicator}
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

/** Shows a theme's mini board preview on hover too, in addition to on selection. */
function attachThemeHoverPreview(root: HTMLElement, settings: GameSettings): void {
  const previewEl = root.querySelector<HTMLElement>(".settings__preview");
  if (!previewEl) return;
  root.querySelectorAll<HTMLLabelElement>('[data-group="theme"] .option').forEach((label) => {
    const input = label.querySelector<HTMLInputElement>("input");
    if (!input) return;
    label.addEventListener("mouseenter", () =>
      showThemePreview(previewEl, { ...settings, theme: input.value as GameTheme })
    );
  });
}

/** Fills the preview box with the mini header + example card pair for a theme. */
function showThemePreview(previewEl: HTMLElement, settings: GameSettings): void {
  const theme = settings.theme;
  if (!theme) return;
  const { foreground, background, previewClass, headerClass } = THEME_PREVIEW[theme];
  previewEl.className = `settings__preview ${previewClass}`;
  previewEl.innerHTML = `
    ${headerTemplate(theme, headerClass, settings.player ?? "blue")}
    <div class="preview-cards">
      <img class="preview-cards__card preview-cards__card--background" src="${background}" alt="" aria-hidden="true" />
      <img class="preview-cards__card preview-cards__card--foreground" src="${foreground}" alt="" aria-hidden="true" />
    </div>
  `;
}

/** Icon paths for player chips/current-player marker, per theme + color. */
function playerIcon(theme: GameTheme, color: PlayerColor): string {
  if (theme === "gaming") {
    return color === "blue" ? "/theme/gaming-icon-player-blue.png" : "/theme/gaming-icon-player-orange.png";
  }
  return color === "blue" ? "/theme/codevibes-icon-player-blue.png" : "/theme/codevibes-icon-player-orange.png";
}

/** Mini mock header, structurally different per theme (rectangular vs pill). */
function headerTemplate(theme: GameTheme, headerClass: string, activePlayer: PlayerColor): string {
  const exitIcon = '<img src="/theme/gaming-icon-exit.png" alt="" aria-hidden="true" />';
  return `
    <div class="${headerClass}">
      <span class="badges">
        <span class="player-chip player-chip--blue"><img src="${playerIcon(theme, "blue")}" alt="" aria-hidden="true" />Blue 0</span>
        <span class="player-chip player-chip--orange"><img src="${playerIcon(theme, "orange")}" alt="" aria-hidden="true" />Orange 0</span>
      </span>
      <span class="current-player">Current player: <img src="${playerIcon(theme, activePlayer)}" alt="" aria-hidden="true" /></span>
      <span class="exit">${exitIcon} Exit game</span>
    </div>
  `;
}
