import {
  caller,
  every,
  Keybind,
  optionalExport,
  registerExport,
} from "@aicore-fivem/lib/client";
import { logSafe, readVec3, type Vec3 } from "@aicore-fivem/lib/shared";
import { LIB_UI } from "@aicore-fivem/shared";
import Locale from "common/locale";
import { NuiMessage } from "common/nui";

const ResourceName = GetCurrentResourceName();

interface Prompt {
  resource: string;
  id: string;
}

/** A prompt over a world point (a door) and where it was last sent on screen. */
interface WorldPrompt {
  at: Vec3;
  x: number;
  y: number;
}

/** Smaller moves than this (screen fraction) are not sent. */
const MOVE_STEP = 0.0005;

/**
 * The prompts on the right of the screen ("[E] Browse the clothing store"), or over a world point (a door), shown
 * and hidden by any resource. One
 * rebindable interaction key acts on a focused ai-target marker first, else on the prompt on top (the last one
 * shown) and tells its resource; nobody polls keys per frame.
 */
class Prompts {
  private readonly list = new Map<string, Prompt>();
  private readonly world = new Map<string, WorldPrompt>();
  /** World prompts follow the camera: their screen spot is worked out every frame, sent only when it moved. */
  private readonly follow = every(0, () => this.place(), {
    active: false,
    name: "worldPrompts",
  });
  private readonly key = new Keybind({
    name: "aicore_interact",
    description: Locale("KEYBIND_INTERACT"),
    defaultKey: "E",
    onPressed: () => this.press(),
  });

  show(resource: string, id: string, text: string, at: Vec3 | null): void {
    const key = `${resource}:${id}`;
    this.list.delete(key);
    this.list.set(key, { resource, id });
    if (at) this.world.set(key, { at, x: -2, y: -2 });
    else this.world.delete(key);
    this.follow.set(this.world.size > 0);
    // A key bound to a mouse button or pad comes back as an icon code; the letter is shown only for keyboard keys.
    const label = this.key.currentKey;
    SendNUIMessage({
      action: NuiMessage.promptShow,
      data: {
        key,
        text: logSafe(text, 120),
        button: /^[\w]{1,6}$/.test(label) ? label : "E",
        world: at !== null,
      },
    });
  }

  private place(): void {
    let moved: Array<[string, number, number]> | null = null;
    for (const [key, prompt] of this.world) {
      const { x: wx, y: wy, z: wz } = prompt.at;
      const [onScreen, sx = 0, sy = 0] = GetScreenCoordFromWorldCoord(
        wx,
        wy,
        wz,
      );
      const x = onScreen ? sx : -1;
      const y = onScreen ? sy : -1;
      if (
        Math.abs(x - prompt.x) < MOVE_STEP &&
        Math.abs(y - prompt.y) < MOVE_STEP
      )
        continue;
      prompt.x = x;
      prompt.y = y;
      (moved ??= []).push([key, x, y]);
    }
    if (moved) SendNUIMessage({ action: NuiMessage.promptMove, data: moved });
  }

  hide(resource: string, id: string): void {
    const key = `${resource}:${id}`;
    if (!this.list.delete(key)) return;
    if (this.world.delete(key)) this.follow.set(this.world.size > 0);
    SendNUIMessage({ action: NuiMessage.promptHide, data: key });
  }

  /** A stopped resource takes its prompts with it. */
  drop(resource: string): void {
    // Deleting the visited entry while walking a Map is safe.
    for (const prompt of this.list.values())
      if (prompt.resource === resource) this.hide(resource, prompt.id);
  }

  private press(): void {
    if (IsNuiFocused() || IsPauseMenuActive()) return;
    // A focused target marker goes first: one key for targets and prompts.
    if (optionalExport("ai-target")?.HandleInteract() === true) return;
    const top = [...this.list.values()].at(-1);
    if (top) emit(LIB_UI.promptPressedEvent, top.resource, top.id);
  }
}

const prompts = new Prompts();

registerExport("ShowPrompt", (id: unknown, text: unknown, at: unknown) => {
  if (typeof id === "string" && typeof text === "string")
    prompts.show(caller(), id, text, at == null ? null : readVec3(at));
});
registerExport("HidePrompt", (id: unknown) => {
  if (typeof id === "string") prompts.hide(caller(), id);
});
on("onClientResourceStop", (resource: string) => prompts.drop(resource));
