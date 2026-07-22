// Phase 1: renderHome() implementiert.
// TODO Phase 2: renderSettings(), Phase 3/4: renderBoard(), Phase 5: renderGameOver()

/**
 * Rendert den Homescreen und verdrahtet den Play-Button.
 * @param root - Mount-Element (#app)
 * @param onPlay - Callback, wenn der Nutzer auf "Play" klickt
 */
export function renderHome(root: HTMLElement, onPlay: () => void): void {
  root.innerHTML = homeTemplate();
  const playButton = root.querySelector<HTMLButtonElement>(".btn--play");
  playButton?.addEventListener("click", onPlay);
}

/** HTML-Template für den Homescreen, ausgelagert statt inline im Code. */
function homeTemplate(): string {
  return `
    <section class="home">
      <img class="home__controller-icon" src="/controller-icon.svg" alt="" aria-hidden="true" />
      <div class="home__content">
        <p class="home__eyebrow">It's play time.</p>
        <h1 class="home__title">Ready to play?</h1>
        <button class="btn btn--play" type="button">Play →</button>
      </div>
    </section>
  `;
}
