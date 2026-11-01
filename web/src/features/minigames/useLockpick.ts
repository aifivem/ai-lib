import { useEffect, useRef, useState } from "react";
import type { LockpickResult } from "@aicore-fivem/shared";
import { answer } from "../../lib/dialogAnswer";

const MOVE_SPEED = 90;
const TURN_SPEED = 140;
const RETURN_SPEED = 220;
/** Degrees past the sweet spot's edge where the lock stops turning at all. */
const FALLOFF = 40;
/** Seconds of forcing a stuck lock before the pick breaks. */
const PICK_LIFE = 0.9;

/** The lockpick game: pin, picks left and the flash for React, the pick and cylinder moved per frame through refs. */
export function useLockpick(pins: number, area: number, picks: number) {
  const [pin, setPin] = useState(0);
  const [left, setLeft] = useState(picks);
  const [flash, setFlash] = useState<"open" | "broke" | null>(null);
  const pick = useRef<SVGGElement>(null);
  const cylinder = useRef<SVGGElement>(null);
  const state = useRef({
    angle: 90,
    turn: 0,
    life: 1,
    sweet: 20 + Math.random() * 140,
    pin: 0,
    left: picks,
    done: false,
  });
  const held = useRef(new Set<string>());

  useEffect(() => {
    const s = state.current;
    const finish = (result: LockpickResult) => {
      s.done = true;
      setFlash(result === "opened" ? "open" : "broke");
      setTimeout(() => answer(result), result === "cancelled" ? 0 : 400);
    };
    const down = (e: KeyboardEvent) => held.current.add(e.key.toLowerCase());
    const up = (e: KeyboardEvent) => {
      held.current.delete(e.key.toLowerCase());
      if (e.key === "Escape" && !s.done) finish("cancelled");
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    let last = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (s.done) return;
      const keys = held.current;
      const turning = keys.has("w") || keys.has("arrowup") || keys.has(" ");
      let shake = 0;
      if (turning) {
        const off = Math.max(0, Math.abs(s.angle - s.sweet) - area / 2);
        const max = 90 * Math.max(0, 1 - off / FALLOFF);
        s.turn = Math.min(max, s.turn + TURN_SPEED * dt);
        if (s.turn >= 90) {
          s.pin += 1;
          s.turn = 0;
          s.sweet = 20 + Math.random() * 140;
          setPin(s.pin);
          if (s.pin >= pins) return finish("opened");
        } else if (s.turn >= max) {
          s.life -= dt / PICK_LIFE;
          shake = (Math.random() - 0.5) * 6;
          if (s.life <= 0) {
            s.left -= 1;
            s.life = 1;
            s.turn = 0;
            setLeft(s.left);
            setFlash("broke");
            setTimeout(() => setFlash(null), 300);
            if (s.left <= 0) return finish("broken");
          }
        }
      } else {
        s.turn = Math.max(0, s.turn - RETURN_SPEED * dt);
        const dir =
          (keys.has("d") || keys.has("arrowright") ? 1 : 0) -
          (keys.has("a") || keys.has("arrowleft") ? 1 : 0);
        s.angle = Math.min(180, Math.max(0, s.angle + dir * MOVE_SPEED * dt));
      }
      if (cylinder.current)
        cylinder.current.style.transform = `rotate(${s.turn}deg)`;
      if (pick.current)
        pick.current.style.transform = `rotate(${s.angle - 90 + s.turn + shake}deg)`;
      frame = requestAnimationFrame(tick);
    });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [area, pins]);

  return { pin, left, flash, pick, cylinder };
}
