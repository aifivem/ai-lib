import type { MinigameRequest } from "@aifivem/shared";

export type MinigameTexts = Record<
  "move" | "turn" | "press" | "cancel" | "picks",
  string
>;
export type MinigameMessage = MinigameRequest & { texts: MinigameTexts };
