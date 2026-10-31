import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useNuiEvent } from "fivem-nui-react";
import { NuiMessage } from "../../../../resource/common/nui";
import { mockPrompts } from "../../dev/promptMock";

interface Prompt {
  key: string;
  text: string;
  button: string;
  /** Floats over a world point (positions come as `promptMove`). */
  world: boolean;
}

const toPrompt = (value: unknown): Prompt | null => {
  if (typeof value !== "object" || value === null) return null;
  const { key, text, button, world } = value as Record<string, unknown>;
  return typeof key === "string" &&
    typeof text === "string" &&
    typeof button === "string"
    ? { key, text, button, world: world === true }
    : null;
};

/** A world prompt follows the camera every frame: its element is moved directly (a compositor transform), not re-rendered. */
function placeAt(el: HTMLElement, x: number, y: number): void {
  el.style.visibility = x < 0 ? "hidden" : "visible";
  el.style.transform = `translate(${(x * 100).toFixed(2)}vw, ${(y * 100).toFixed(2)}vh)`;
}

// Stable mock reference: a new object per render would re-fire the browser mock.
const SHOW_OPTIONS = { mockData: mockPrompts(), mockDelay: 300 };

/**
 * Prompts on the right edge, middle height (tgiann-core draw text pill): the key in a round cap, the action next to it.
 * The last shown one is on top, has the green key cap and is the one the interaction key acts on.
 */
export function Prompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  useNuiEvent(
    NuiMessage.promptShow,
    (value: unknown) => {
      const list = Array.isArray(value) ? value : [value];
      for (const item of list) {
        const prompt = toPrompt(item);
        if (prompt)
          setPrompts((prev) => [
            ...prev.filter((p) => p.key !== prompt.key),
            prompt,
          ]);
      }
    },
    SHOW_OPTIONS,
  );
  useNuiEvent(NuiMessage.promptHide, (key: unknown) => {
    if (typeof key === "string") spots.current.delete(key);
    setPrompts((prev) => prev.filter((p) => p.key !== key));
  });
  const elements = useRef(new Map<string, HTMLDivElement>());
  const spots = useRef(new Map<string, [number, number]>());
  useNuiEvent(NuiMessage.promptMove, (value: unknown) => {
    if (!Array.isArray(value)) return;
    for (const item of value) {
      if (!Array.isArray(item)) continue;
      const [key, x, y] = item as unknown[];
      if (
        typeof key !== "string" ||
        typeof x !== "number" ||
        typeof y !== "number"
      )
        continue;
      spots.current.set(key, [x, y]);
      const el = elements.current.get(key);
      if (el) placeAt(el, x, y);
    }
  });
  const side = prompts.filter((p) => !p.world);
  const world = prompts.filter((p) => p.world);

  return (
    <>
      {world.map((prompt) => (
        <div
          key={prompt.key}
          ref={(el) => {
            if (!el) return void elements.current.delete(prompt.key);
            elements.current.set(prompt.key, el);
            const [x, y] = spots.current.get(prompt.key) ?? [-1, -1];
            placeAt(el, x, y);
          }}
          className="pointer-events-none absolute top-0 left-0"
        >
          <WorldPrompt prompt={prompt} />
        </div>
      ))}
      <div className="pointer-events-none absolute inset-y-0 right-[3vh] flex flex-col-reverse items-end justify-center gap-[0.8vh]">
        <AnimatePresence initial={false} mode="popLayout">
          {[...side].reverse().map((prompt, index) => (
            <motion.div
              key={prompt.key}
              initial={{ opacity: 0, x: "2vh" }}
              animate={{ opacity: index === 0 ? 1 : 0.6, x: 0 }}
              exit={{
                opacity: 0,
                x: "2vh",
                transition: { duration: 0.15, ease: "easeOut" },
              }}
              transition={{ type: "spring", duration: 0.3, bounce: 0 }}
              className="flex h-[4.4vh] items-center gap-[1.2vh] rounded-full bg-[rgba(19,19,19,0.75)] pr-[1.8vh] pl-[0.6vh]"
            >
              <span
                className={`flex h-[3.2vh] min-w-[3.2vh] items-center justify-center rounded-full px-[0.8vh] text-[1.4vh] font-bold ${index === 0 ? "bg-tgi-green text-tgi-green-text" : "text-text bg-white/10"}`}
              >
                {prompt.button}
              </span>
              <span className="max-w-[36vh] truncate text-[1.4vh] leading-[1.3] font-medium">
                {prompt.text}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}

/** tgiann-core's 3D draw text: the key in a green-edged cap with a bar under it, the action in a green-edged box. */
function WorldPrompt({ prompt }: { prompt: Prompt }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex [transform:translate(-50%,-50%)] items-center gap-[1vh] text-[#f7fffb] [text-shadow:0.1vh_0.1vh_#000]"
    >
      <span className="border-tgi-green bg-tgi-green-20 relative flex h-[3vh] min-w-[3vh] items-center justify-center rounded-[0.3vh] border-[0.1vh] px-[0.6vh] text-[1.6vh] font-semibold">
        {prompt.button}
        <span className="bg-tgi-green-hover absolute bottom-[-0.2vh] h-[0.4vh] w-[1.5vh]" />
      </span>
      <span className="border-tgi-green bg-tgi-green-20 flex h-[2.5vh] items-center rounded-[0.3vh] border-[0.1vh] px-[1vh] text-[1.55vh] whitespace-nowrap">
        {prompt.text}
      </span>
    </motion.div>
  );
}
