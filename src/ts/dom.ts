/**
 * Gibt das Haupt-Mount-Element zurück, in das alle Screens gerendert werden.
 * Wirft einen Fehler, falls index.html verändert wurde und #app fehlt.
 */
export function getAppRoot(): HTMLElement {
  const root = document.getElementById("app");
  if (!root) {
    throw new Error("Mount-Element #app nicht gefunden. Prüfe index.html.");
  }
  return root;
}
