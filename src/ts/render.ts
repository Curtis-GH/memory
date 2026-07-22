// Phase 1: renderHome() implemented.
// TODO Phase 2: renderSettings(), Phase 3/4: renderBoard(), Phase 5: renderGameOver()

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
