import {
  ByResource,
  caller,
  registerExport,
  ZoneEngine,
} from "@aicore-fivem/lib/client";
import { readFinite, readZoneShape } from "@aicore-fivem/lib/shared";
import { LIB_UI } from "@aicore-fivem/shared";

/**
 * Every resource's zones in one checker (lib `Zones` hands them over): FiveM enters a resource's JS every frame while
 * it has any timer, so one checker here replaces one per resource. Enter / exit go back as a local event to the owner;
 * a stopping resource's zones go with it.
 */
const engine = new ZoneEngine();
const owned = new ByResource<string, true>({
  onDrop: (_resource, key) => engine.remove(key, true),
});

registerExport(
  "AddZone",
  (key: unknown, shape: unknown, interval: unknown, inside: unknown) => {
    const owner = caller();
    const zone = readZoneShape(shape);
    if (typeof key !== "string" || !zone) return;
    const id = `${owner}|${key}`;
    owned.set(id, true, owner);
    engine.add(
      id,
      {
        shape: zone,
        interval: readFinite(interval) ?? 500,
        onEnter: () => emit(LIB_UI.zoneEvent, owner, key, true),
        onExit: () => emit(LIB_UI.zoneEvent, owner, key, false),
      },
      inside === true,
    );
  },
);

registerExport("RemoveZone", (key: unknown) => {
  if (typeof key !== "string") return;
  const id = `${caller()}|${key}`;
  owned.delete(id);
  engine.remove(id, true);
});
