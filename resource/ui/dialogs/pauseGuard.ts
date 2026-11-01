import { controls } from "@aicore-fivem/lib/client";

/**
 * Escape closes the dialogs: the game must not open the pause menu with the same key press once the focus is gone.
 */
class PauseGuard {
  private timer: ReturnType<typeof setTimeout> | null = null;

  /** Blocks the pause controls (199, 200) for the next 500 ms. */
  set(on: boolean): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    if (!on) return controls.enable("pauseGuard");
    controls.disable("pauseGuard", [199, 200]);
    this.timer = setTimeout(() => {
      this.timer = null;
      controls.enable("pauseGuard");
    }, 500);
  }
}

export const pauseGuard = new PauseGuard();
