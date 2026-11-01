import { isRecord, logSafe } from "@aicore-fivem/lib/shared";
import type {
  InputField,
  InputRequest,
  MenuItem,
  MenuRequest,
} from "@aicore-fivem/shared";

export function toMenu(v: unknown): MenuRequest | null {
  if (!isRecord(v) || typeof v.title !== "string" || !Array.isArray(v.items))
    return null;
  const items: MenuItem[] = v.items.flatMap((i) =>
    isRecord(i) && typeof i.id === "string" && typeof i.label === "string"
      ? [
          {
            id: i.id,
            label: logSafe(i.label, 80),
            icon: typeof i.icon === "string" ? i.icon : undefined,
            description:
              typeof i.description === "string"
                ? logSafe(i.description, 160)
                : undefined,
            disabled: i.disabled === true,
            checked: typeof i.checked === "boolean" ? i.checked : undefined,
          },
        ]
      : [],
  );
  return {
    title: logSafe(v.title, 60),
    items: items.slice(0, 40),
    back: v.back === true,
  };
}

export function toInput(v: unknown): InputRequest | null {
  if (!isRecord(v) || typeof v.title !== "string" || !Array.isArray(v.fields))
    return null;
  const fields: InputField[] = v.fields.flatMap((f): InputField[] => {
    if (
      !isRecord(f) ||
      typeof f.name !== "string" ||
      typeof f.label !== "string"
    )
      return [];
    const placeholder =
      typeof f.placeholder === "string" ? f.placeholder : undefined;
    if (f.type === "number")
      return [
        {
          name: f.name,
          label: f.label,
          type: "number",
          min: typeof f.min === "number" ? f.min : undefined,
          max: typeof f.max === "number" ? f.max : undefined,
          placeholder,
        },
      ];
    return [
      {
        name: f.name,
        label: f.label,
        type: "text",
        maxLength: typeof f.maxLength === "number" ? f.maxLength : 120,
        placeholder,
        multiline: f.multiline === true,
        value: typeof f.value === "string" ? f.value : undefined,
        readOnly: f.readOnly === true,
      },
    ];
  });
  return {
    title: logSafe(v.title, 60),
    fields: fields.slice(0, 8),
    confirm: typeof v.confirm === "string" ? logSafe(v.confirm, 30) : "OK",
  };
}
