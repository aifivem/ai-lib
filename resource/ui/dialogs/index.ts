import { caller, registerExport } from "@aicore-fivem/lib/client";
import { isRecord } from "@aicore-fivem/lib/shared";
import { NuiCallback } from "common/nui";
import { dialogs } from "./dialogs";
import { toInput, toMenu } from "./parse";

registerExport("OpenMenu", (id: unknown, request: unknown) => {
  const menu = toMenu(request);
  if (typeof id === "number" && menu) dialogs.open("menu", caller(), id, menu);
});
registerExport("OpenInput", (id: unknown, request: unknown) => {
  const input = toInput(request);
  if (typeof id === "number" && input)
    dialogs.open("input", caller(), id, input);
});

RegisterNuiCallback(
  NuiCallback.dialogAnswer,
  (data: unknown, cb: (r: unknown) => void) => {
    dialogs.answer(isRecord(data) ? data.value : null);
    cb(true);
  },
);
RegisterNuiCallback(
  NuiCallback.dialogHover,
  (data: unknown, cb: (r: unknown) => void) => {
    dialogs.hover(isRecord(data) ? data.id : null);
    cb(true);
  },
);
RegisterNuiCallback(
  NuiCallback.dialogToggle,
  (data: unknown, cb: (r: unknown) => void) => {
    if (isRecord(data)) dialogs.toggle(data.id, data.checked);
    cb(true);
  },
);
on("onClientResourceStop", (resource: string) => dialogs.drop(resource));

/**
 * Closes the calling resource's open menu or input dialog from code (the bridge's ESX `CloseContext` /
 * `menu.close()`, qb-menu `closeMenu`); the request is answered with null like a player close.
 */
registerExport("CloseDialog", () => dialogs.drop(caller()));
