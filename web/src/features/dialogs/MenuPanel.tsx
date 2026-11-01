import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { fetchNui } from "fivem-nui-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { MenuRequest } from "@aicore-fivem/shared";
import { NuiCallback } from "../../../../resource/common/nui";
import { answer } from "../../lib/dialogAnswer";
import { iconOf } from "../../lib/icons";
import { HOLD_MS } from "./useMenuKeys";

const hover = (id: string) =>
  void fetchNui(NuiCallback.dialogHover, { id }, { mockData: true });
const toggle = (id: string, checked: boolean) =>
  void fetchNui(NuiCallback.dialogToggle, { id, checked }, { mockData: true });

/** On / off pill of a switch row. */
function SwitchPill({ on }: { on: boolean }) {
  return (
    <span
      className={`relative ml-auto h-[2vh] w-[3.6vh] shrink-0 rounded-full transition-colors duration-150 ${on ? "bg-tgi-green group-enabled:group-focus:bg-black/25" : "bg-white/15 group-enabled:group-focus:bg-black/15"}`}
    >
      <span
        className="absolute top-[0.25vh] left-[0.25vh] size-[1.5vh] rounded-full bg-white transition-transform duration-150"
        style={{ transform: on ? "translateX(1.6vh)" : "translateX(0)" }}
      />
    </span>
  );
}

/**
 * A resource's menu (tgiann-core menu): title pill and a list on the right; the row under the pointer or keyboard
 * focus fills green (one highlight: the pointer moves the focus); click picks, a switch row flips in place, Escape
 * closes (answers null).
 */
export function MenuPanel({ menu, holding }: { menu: MenuRequest; holding: boolean }) {
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  // The first item takes the focus, so arrows and Enter work at once; switch rows start from the request.
  useEffect(() => {
    setChecks(
      Object.fromEntries(
        menu.items.flatMap((i) =>
          i.checked === undefined ? [] : [[i.id, i.checked]],
        ),
      ),
    );
    document
      .querySelector<HTMLButtonElement>('[role^="menuitem"]:not(:disabled)')
      ?.focus();
  }, [menu]);
  return (
    <motion.section
      initial={{ opacity: 0, x: "2vh" }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        type: "spring",
        duration: 0.3,
        bounce: 0,
        opacity: { type: "tween", duration: 0.25, ease: "easeOut" },
      }}
      className="fixed inset-y-0 right-[3vh] my-auto flex h-fit w-[38vh] flex-col gap-[0.6vh]"
      role="menu"
      aria-label={menu.title}
    >
      <header className="flex h-[4.4vh] items-center justify-between gap-[1vh] rounded-full bg-panel pr-[0.6vh] pl-[1.8vh]">
        <span className="truncate font-display text-[1.5vh] leading-none font-extrabold tracking-[-0.01em] uppercase">
          {menu.title}
        </span>
        <span className="relative flex h-[3.2vh] items-center overflow-hidden rounded-full bg-control px-[1.2vh] text-[1.1vh] font-bold text-text-3">
          {/* Fills while Escape is held: full = the whole menu closes. */}
          <span
            className="absolute inset-y-0 left-0 bg-tgi-green-30"
            style={{
              width: holding ? "100%" : "0%",
              transition: holding ? `width ${HOLD_MS}ms linear` : "none",
            }}
          />
          <span className="relative">{menu.back ? "ESC ←" : "ESC"}</span>
        </span>
      </header>
      <div className="flex max-h-[60vh] flex-col gap-[0.4vh] overflow-y-auto rounded-[1.4vh] bg-panel p-[0.6vh]">
        {menu.items.map((item) => {
          const icon = item.icon ? iconOf(item.icon) : null;
          const checked = checks[item.id];
          return (
            <button
              key={item.id}
              type="button"
              role={checked === undefined ? "menuitem" : "menuitemcheckbox"}
              aria-checked={checked}
              disabled={item.disabled}
              onClick={() => {
                if (checked === undefined) return answer(item.id);
                setChecks((c) => ({ ...c, [item.id]: !checked }));
                toggle(item.id, !checked);
              }}
              onMouseEnter={(e) => e.currentTarget.focus()}
              onFocus={() => hover(item.id)}
              className="group flex min-h-[5vh] items-center gap-[1.2vh] rounded-[0.9vh] px-[0.8vh] py-[0.7vh] text-left transition-colors duration-150 outline-none enabled:focus:bg-tgi-green disabled:cursor-not-allowed disabled:opacity-40"
            >
              {icon && (
                <span className="flex size-[3.4vh] shrink-0 items-center justify-center rounded-full bg-tgi-green-10 text-[1.4vh] text-tgi-green transition-colors duration-150 group-enabled:group-focus:bg-black/10 group-enabled:group-focus:text-tgi-green-text">
                  <FontAwesomeIcon icon={icon} />
                </span>
              )}
              <span className="flex min-w-0 flex-col gap-[0.2vh]">
                <span className="truncate text-[1.45vh] font-semibold uppercase transition-colors duration-150 group-enabled:group-focus:text-tgi-green-text">
                  {item.label}
                </span>
                {item.description && (
                  <span className="truncate text-[1.25vh] text-text-3 transition-colors duration-150 group-enabled:group-focus:text-tgi-green-text">
                    {item.description}
                  </span>
                )}
              </span>
              {checked !== undefined && <SwitchPill on={checked} />}
            </button>
          );
        })}
      </div>
    </motion.section>
  );
}
