import { useState } from "react";
import type { InputRequest } from "@aicore-fivem/shared";
import { Button } from "../../components/ui/button";
import { Dialog } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { answer } from "../../lib/dialogAnswer";

export function InputPanel({ input }: { input: InputRequest }) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      input.fields.flatMap((f) =>
        f.type === "text" && f.value !== undefined ? [[f.name, f.value]] : [],
      ),
    ),
  );
  const parsed = Object.fromEntries(
    input.fields.map((f) => [
      f.name,
      f.type === "number"
        ? Number(values[f.name] ?? "")
        : (values[f.name] ?? "").trim(),
    ]),
  );
  const valid = input.fields.every((f) =>
    f.type === "number"
      ? Number.isFinite(parsed[f.name]) &&
        values[f.name] !== undefined &&
        values[f.name] !== ""
      : f.readOnly === true || String(parsed[f.name] ?? "") !== "",
  );
  return (
    <Dialog
      open
      onOpenChange={(open) => !open && answer(null)}
      title={input.title}
    >
      <form
        className="flex flex-col gap-[1.4vh]"
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) answer(parsed);
        }}
      >
        {input.fields.map((f, i) => (
          <label key={f.name} className="flex flex-col gap-[0.5vh]">
            <span className="px-[0.4vh] text-[1.2vh] font-semibold text-text-3 uppercase">
              {f.label}
            </span>
            {f.type === "text" && f.multiline ? (
              <textarea
                autoFocus={i === 0 && !f.readOnly}
                readOnly={f.readOnly}
                maxLength={f.maxLength}
                placeholder={f.placeholder}
                value={values[f.name] ?? ""}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [f.name]: e.target.value }))
                }
                className="h-[18vh] w-full resize-none rounded-[1.2vh] border border-white/8 bg-[#2222224D] px-[1.4vh] py-[1vh] text-[1.35vh] leading-[1.45] text-text [color-scheme:dark] transition-[border-color] duration-150 outline-none placeholder:text-text-4 hover:border-white/14 read-only:hover:border-white/8 focus:border-tgi-green-40"
              />
            ) : (
              <Input
                autoFocus={i === 0 && !(f.type === "text" && f.readOnly)}
                type={f.type}
                readOnly={f.type === "text" ? f.readOnly : undefined}
                min={f.type === "number" ? f.min : undefined}
                max={f.type === "number" ? f.max : undefined}
                maxLength={f.type === "text" ? f.maxLength : undefined}
                placeholder={f.placeholder}
                value={values[f.name] ?? ""}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [f.name]: e.target.value }))
                }
              />
            )}
          </label>
        ))}
        <Button type="submit" variant="primary" disabled={!valid}>
          {input.confirm}
        </Button>
      </form>
    </Dialog>
  );
}
