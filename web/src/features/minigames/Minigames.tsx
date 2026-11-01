import { useState } from "react";
import { motion } from "motion/react";
import { useNuiEvent } from "fivem-nui-react";
import { NuiMessage } from "../../../../resource/common/nui";
import { MINIGAME_MOCK } from "../../dev/dialogMock";
import { Lockpick } from "./Lockpick";
import { SkillCheck } from "./SkillCheck";
import type { MinigameMessage } from "./types";

/** Skill checks and lockpicks other resources start (lib `skillCheck` / `lockpick`), centred over the game. */
export function Minigames() {
  const [game, setGame] = useState<(MinigameMessage & { key: number }) | null>(
    null,
  );
  // The client checked the shape (resource/client/minigame.ts).
  useNuiEvent<MinigameMessage>(
    NuiMessage.minigameOpen,
    (m) => setGame({ ...m, key: performance.now() }),
    { mockData: MINIGAME_MOCK, mockDelay: 200 },
  );
  useNuiEvent(NuiMessage.dialogClose, () => setGame(null));
  if (!game) return null;
  return (
    <motion.div
      key={game.key}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", duration: 0.3, bounce: 0 }}
      className="fixed inset-0 m-auto flex h-fit w-fit"
    >
      {game.kind === "skillCheck" ? (
        <SkillCheck stages={game.stages} keys={game.keys} texts={game.texts} />
      ) : (
        <Lockpick
          pins={game.pins}
          area={game.area}
          picks={game.picks}
          texts={game.texts}
        />
      )}
    </motion.div>
  );
}
