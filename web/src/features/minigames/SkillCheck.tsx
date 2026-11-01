import { useEffect, useRef, useState } from "react";
import type { SkillStage } from "@aicore-fivem/shared";
import { answer } from "../../lib/dialogAnswer";
import { Hint } from "./KeyHint";
import type { MinigameTexts } from "./types";
import { useEscape } from "./useEscape";

/** How long the hit / miss colour shows before the answer closes the dialog. */
const FLASH_MS = 220;
const R = 42;
const CIRCUMFERENCE = 2 * Math.PI * R;

const FALLBACK_STAGE: SkillStage = { area: 50, speed: 0.6 };
/** Where a stage's green arc starts: never in the first quarter, so there is time to react. */
const zoneStart = (area: number) => 100 + Math.random() * (240 - area);

/**
 * A needle runs once around the ring per stage; the shown key pressed while it is on the green arc passes the stage.
 * The needle moves in a ref (no render per frame); a miss, a wrong key, the needle leaving the arc or Escape fails.
 */
export function SkillCheck({
  stages,
  keys,
  texts,
}: {
  stages: SkillStage[];
  keys: string[];
  texts: MinigameTexts;
}) {
  const [index, setIndex] = useState(0);
  const [flash, setFlash] = useState<"hit" | "miss" | null>(null);
  const stage = stages[index] ?? FALLBACK_STAGE;
  const [round, setRound] = useState(() => ({
    start: zoneStart(stage.area),
    key: keys[Math.floor(Math.random() * keys.length)] ?? "e",
  }));
  const needle = useRef<SVGGElement>(null);
  const angle = useRef(0);
  const done = useRef(false);

  const finish = (ok: boolean) => {
    if (done.current) return;
    done.current = true;
    setFlash(ok ? "hit" : "miss");
    setTimeout(() => answer(ok), FLASH_MS);
  };
  const pass = () => {
    if (index + 1 >= stages.length) return finish(true);
    const next = stages[index + 1] ?? FALLBACK_STAGE;
    setFlash("hit");
    setTimeout(() => setFlash(null), FLASH_MS);
    setIndex(index + 1);
    setRound({
      start: zoneStart(next.area),
      key: keys[Math.floor(Math.random() * keys.length)] ?? "e",
    });
  };

  useEffect(() => {
    angle.current = 0;
    let last = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      // A frame hitch never jumps the needle over the arc.
      angle.current += Math.min(0.05, (now - last) / 1000) * stage.speed * 360;
      last = now;
      if (needle.current)
        needle.current.style.transform = `rotate(${angle.current}deg)`;
      if (angle.current > round.start + stage.area + 4) return finish(false);
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
    // finish only reads refs and setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, stage]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.repeat || done.current || !/^[a-z0-9]$/i.test(e.key)) return;
      const a = angle.current;
      const inside = a >= round.start - 2 && a <= round.start + stage.area + 2;
      if (inside && e.key.toLowerCase() === round.key) pass();
      else finish(false);
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  });
  useEscape(() => finish(false));

  const arc = flash === "miss" ? "#ff5c5c" : "var(--color-tgi-green)";
  return (
    <div className="flex flex-col items-center gap-[2vh]">
      <div className="relative size-[18vh]">
        <svg viewBox="0 0 100 100" className="size-full">
          <circle
            cx="50"
            cy="50"
            r={R}
            fill="rgba(0,0,0,0.7)"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="6"
          />
          <circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            stroke={arc}
            strokeWidth="6"
            strokeDasharray={`${(CIRCUMFERENCE * stage.area) / 360} ${CIRCUMFERENCE}`}
            transform={`rotate(${round.start - 90} 50 50)`}
          />
          <g
            ref={needle}
            style={{ transformOrigin: "50px 50px", transform: "rotate(0deg)" }}
          >
            <line
              x1="50"
              y1="2"
              x2="50"
              y2="16"
              stroke="white"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
          </g>
        </svg>
        <span
          className={`absolute inset-0 m-auto flex size-[6vh] items-center justify-center rounded-full text-[2.6vh] font-extrabold uppercase transition-colors duration-150 ${flash === "hit" ? "bg-tgi-green text-tgi-green-text" : flash === "miss" ? "bg-[#ff5c5c] text-black" : "bg-white/10"}`}
        >
          {round.key}
        </span>
      </div>
      <div className="flex items-center gap-[0.6vh]">
        {stages.map((_, i) => (
          <span
            key={i}
            className={`size-[0.9vh] rounded-full ${i < index ? "bg-tgi-green" : i === index ? "bg-white" : "bg-white/20"}`}
          />
        ))}
      </div>
      <div className="flex items-center gap-[1.6vh] rounded-full bg-black/70 px-[1.6vh] py-[0.8vh]">
        <Hint keys={[round.key]} label={texts.press} />
        <Hint keys={["esc"]} label={texts.cancel} />
      </div>
    </div>
  );
}
