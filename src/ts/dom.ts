/**
 * Returns the main mount element into which all screens are rendered.
 * Throws an error if index.html was changed and #app is missing.
 */
export function getAppRoot(): HTMLElement {
  const root = document.getElementById("app");
  if (!root) {
    throw new Error("Mount element #app not found. Check index.html.");
  }
  return root;
}
