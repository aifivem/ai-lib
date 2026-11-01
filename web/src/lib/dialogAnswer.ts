import { fetchNui } from "fivem-nui-react";
import { NuiCallback } from "../../../resource/common/nui";

/** Answers the open menu, input dialog or minigame (null: closed). */
export const answer = (value: unknown) =>
  void fetchNui(NuiCallback.dialogAnswer, { value }, { mockData: true });
