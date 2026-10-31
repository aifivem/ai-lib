/** Browser preview only: a game-like backdrop (the page is transparent in game). */
export function applyPreview(): void {
  if ("invokeNative" in window) return;
  document.body.style.background =
    "linear-gradient(135deg, #2a2a2a 0%, #0e0e0e 100%)";
}
