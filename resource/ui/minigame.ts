import { onServerCallback, registerExport } from "@aicore-fivem/lib/client";
import { isRecord } from "@aicore-fivem/lib/shared";
import {
  LIB_UI,
  type MinigameRequest,
  type SkillStage,
} from "@aicore-fivem/shared";
import Locale from "common/locale";
import { dialogs } from "./dialogs";

const ResourceName = GetCurrentResourceName();

const clamp = (v: unknown, min: number, max: number, fallback: number) =>
  typeof v === "number" && Number.isFinite(v)
    ? Math.min(max, Math.max(min, v))
    : fallback;

function toRequest(v: unknown): MinigameRequest | null {
  if (!isRecord(v)) return null;
  if (v.kind === "skillCheck" && Array.isArray(v.stages)) {
    const stages: SkillStage[] = v.stages
      .slice(0, 20)
      .flatMap((s) =>
        isRecord(s)
          ? [
              {
                area: clamp(s.area, 5, 180, 50),
                speed: clamp(s.speed, 0.1, 3, 0.6),
              },
            ]
          : [],
      );
    const keys = Array.isArray(v.keys)
      ? v.keys.filter(
          (k): k is string => typeof k === "string" && /^[a-z0-9]$/.test(k),
        )
      : [];
    return stages.length
      ? { kind: "skillCheck", stages, keys: keys.length ? keys : ["e"] }
      : null;
  }
  if (v.kind === "lockpick")
    return {
      kind: "lockpick",
      pins: Math.floor(clamp(v.pins, 1, 6, 1)),
      area: clamp(v.area, 3, 60, 11),
      picks: Math.floor(clamp(v.picks, 1, 10, 1)),
    };
  return null;
}

const texts = () => ({
  move: Locale("MINIGAME_MOVE"),
  turn: Locale("MINIGAME_TURN"),
  press: Locale("MINIGAME_PRESS"),
  cancel: Locale("MINIGAME_CANCEL"),
  picks: Locale("MINIGAME_PICKS"),
});

/** Skill checks and lockpicks of every resource (lib `skillCheck` / `lockpick`), drawn as a dialog. */
registerExport("OpenMinigame", (id: unknown, request: unknown) => {
  const game = toRequest(request);
  if (typeof id !== "number" || !game) return;
  dialogs.open("minigame", GetInvokingResource() || ResourceName, id, {
    ...game,
    texts: texts(),
  });
});

/** A server flow's minigame (lib `minigameFor`): the result goes straight back to the server. */
let localId = 0;
onServerCallback(LIB_UI.minigameForCallback, (request) => {
  const game = toRequest(request);
  if (!game) return null;
  return new Promise((resolve) =>
    dialogs.open(
      "minigame",
      ResourceName,
      ++localId,
      { ...game, texts: texts() },
      resolve,
    ),
  );
});
