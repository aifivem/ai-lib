import { useEffect } from "react";
import { MENU_BACK, type MenuRequest } from "@aicore-fivem/shared";
import { answer } from "../../lib/dialogAnswer";

/** Holding Escape this long closes the whole menu flow. */
export const HOLD_MS = 600;

/** Arrow keys move the focus over the menu items; Escape goes back or closes (`holding` while it is held down). */
export function useMenuKeys(
  menu: MenuRequest | null,
  setHolding: (holding: boolean) => void,
) {
  useEffect(() => {
    if (!menu) return;
    // Escape: a tap goes back in a sub menu (closes a top menu), holding it closes the whole flow. Both answer when the
    // key comes up: closing while it is still down hands the release to the game, which opens the pause menu.
    let timer: ReturnType<typeof setTimeout> | null = null;
    let held = false;
    const down = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const items = [
          ...document.querySelectorAll<HTMLButtonElement>(
            '[role^="menuitem"]:not(:disabled)',
          ),
        ];
        const at = items.indexOf(document.activeElement as HTMLButtonElement);
        const next =
          e.key === "ArrowDown"
            ? (at + 1) % items.length
            : (at - 1 + items.length) % items.length;
        items[at === -1 ? 0 : next]?.focus();
        return;
      }
      if (e.key !== "Escape" || e.repeat || timer || held) return;
      setHolding(true);
      timer = setTimeout(() => {
        timer = null;
        held = true;
      }, HOLD_MS);
    };
    const up = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || (!timer && !held)) return;
      if (timer) clearTimeout(timer);
      timer = null;
      setHolding(false);
      answer(held || !menu.back ? null : MENU_BACK);
      held = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [menu]);
}
