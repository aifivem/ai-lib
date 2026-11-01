import { Hint } from "./KeyHint";
import type { MinigameTexts } from "./types";
import { useLockpick } from "./useLockpick";

/**
 * The pick sits on a half circle (A / D or the arrows move it); W, the up arrow or Space turns the lock. The lock
 * turns all the way only with the pick in the sweet spot, less the further it is; forcing a stuck lock wears the pick.
 * Every frame works on refs and element styles; React only renders pin, pick and result changes.
 */
export function Lockpick({
  pins,
  area,
  picks,
  texts,
}: {
  pins: number;
  area: number;
  picks: number;
  texts: MinigameTexts;
}) {
  const { pin, left, flash, pick, cylinder } = useLockpick(pins, area, picks);

  const ring =
    flash === "open"
      ? "var(--color-tgi-green)"
      : flash === "broke"
        ? "#ff5c5c"
        : "rgba(255,255,255,0.12)";
  return (
    <div className="flex flex-col items-center gap-[2vh]">
      <div className="relative size-[24vh]">
        <svg viewBox="0 0 100 100" className="size-full overflow-visible">
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="rgba(0,0,0,0.7)"
            stroke={ring}
            strokeWidth="3"
            style={{ transition: "stroke 150ms" }}
          />
          <g
            ref={cylinder}
            style={{ transformOrigin: "50px 50px", transform: "rotate(0deg)" }}
          >
            <circle
              cx="50"
              cy="50"
              r="24"
              fill="rgba(255,255,255,0.06)"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="1.5"
            />
            <circle cx="50" cy="46" r="4" fill="rgba(0,0,0,0.8)" />
            <rect
              x="48"
              y="46"
              width="4"
              height="12"
              rx="1.5"
              fill="rgba(0,0,0,0.8)"
            />
          </g>
          <g
            ref={pick}
            style={{ transformOrigin: "50px 50px", transform: "rotate(0deg)" }}
          >
            <line
              x1="50"
              y1="48"
              x2="50"
              y2="6"
              stroke="#d9d9d9"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="50"
              y1="48"
              x2="47"
              y2="45"
              stroke="#d9d9d9"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        </svg>
      </div>
      <div className="flex items-center gap-[1.4vh]">
        {pins > 1 && (
          <div className="flex items-center gap-[0.6vh]">
            {Array.from({ length: pins }, (_, i) => (
              <span
                key={i}
                className={`size-[0.9vh] rounded-full ${i < pin ? "bg-tgi-green" : i === pin ? "bg-white" : "bg-white/20"}`}
              />
            ))}
          </div>
        )}
        <span className="text-[1.25vh] font-bold text-text-2 uppercase">
          {texts.picks}: {left}
        </span>
      </div>
      <div className="flex items-center gap-[1.6vh] rounded-full bg-black/70 px-[1.6vh] py-[0.8vh]">
        <Hint keys={["a", "d"]} label={texts.move} />
        <Hint keys={["w"]} label={texts.turn} />
        <Hint keys={["esc"]} label={texts.cancel} />
      </div>
    </div>
  );
}
