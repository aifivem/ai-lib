import { MENU_EVENTS } from "@aicore-fivem/shared";
import { NuiMessage } from "common/nui";
import { pauseGuard } from "./pauseGuard";

const ResourceName = GetCurrentResourceName();

/**
 * The menu, input dialog and minigame every resource opens through lib `menu` / `input` / `skillCheck` / `lockpick`:
 * one at a time; opening a new one answers the previous request with null. The answer goes back to the asking resource
 * as a local event, or to `local` for ai-lib's own server flows (`minigameFor`).
 */
type DialogKind = "menu" | "input" | "minigame";
const OPEN_MESSAGE: Record<DialogKind, string> = {
  menu: NuiMessage.menuOpen,
  input: NuiMessage.inputOpen,
  minigame: NuiMessage.minigameOpen,
};

class Dialogs {
  private current: {
    kind: DialogKind;
    resource: string;
    id: number;
    local?: (value: unknown) => void;
  } | null = null;

  open(
    kind: DialogKind,
    resource: string,
    id: number,
    data: unknown,
    local?: (value: unknown) => void,
  ): void {
    this.answer(null);
    this.current = { kind, resource, id, local };
    // Minigames are played with the keyboard only: no cursor over the game.
    SetNuiFocus(true, kind !== "minigame");
    SendNUIMessage({ action: OPEN_MESSAGE[kind], data });
  }

  answer(value: unknown): void {
    const current = this.current;
    if (!current) return;
    this.current = null;
    SetNuiFocus(false, false);
    pauseGuard.set(true);
    SendNUIMessage({ action: NuiMessage.dialogClose });
    if (current.local) return current.local(value);
    emit(
      current.kind === "input"
        ? MENU_EVENTS.inputResult
        : MENU_EVENTS.menuResult,
      current.resource,
      current.id,
      value,
    );
  }

  toggle(item: unknown, checked: unknown): void {
    if (
      this.current?.kind === "menu" &&
      typeof item === "string" &&
      typeof checked === "boolean"
    )
      emit(
        MENU_EVENTS.menuToggle,
        this.current.resource,
        this.current.id,
        item,
        checked,
      );
  }

  hover(item: unknown): void {
    if (this.current?.kind === "menu" && typeof item === "string")
      emit(MENU_EVENTS.menuHover, this.current.resource, this.current.id, item);
  }

  /** A stopped resource's open dialog closes with it (also `CloseDialog`). */
  drop(resource: string): void {
    if (this.current?.resource === resource) this.answer(null);
  }
}

export const dialogs = new Dialogs();
