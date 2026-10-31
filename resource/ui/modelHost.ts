import {
  ByResource,
  caller,
  ModelScanner,
  readModelScanDef,
  registerExport,
} from "@aicore-fivem/lib/client";
import { LIB_UI } from "@aicore-fivem/shared";

/**
 * Every resource's prompt-mode model points in one scan (lib `Points.addModel` hands them over): FiveM enters a
 * resource's JS every frame while it has any timer, so one scan here replaces one per resource. The nearest object
 * goes back to the owner as a local event when it changes; a stopping resource's points go with it.
 */
const scanner = new ModelScanner();
const owned = new ByResource<string, true>({
  onDrop: (_resource, id) => scanner.remove(id),
});

registerExport(
  "AddModelPoint",
  (key: unknown, def: unknown, entity: unknown) => {
    const owner = caller();
    const parsed = readModelScanDef(def);
    if (typeof key !== "string" || !parsed) return;
    const id = `${owner}|${key}`;
    owned.set(id, true, owner);
    scanner.add(
      id,
      parsed,
      (nearest) => emit(LIB_UI.modelPointEvent, owner, key, nearest),
      Number.isInteger(entity) ? (entity as number) : 0,
    );
  },
);

registerExport("RemoveModelPoint", (key: unknown) => {
  if (typeof key !== "string") return;
  const id = `${caller()}|${key}`;
  owned.delete(id);
  scanner.remove(id);
});
