import { createLocale } from "@aicore-fivem/lib/fivem";

/** ai-lib's lang texts (its keybinds and minigame hints); keys typed from locales/en.json. */
const Locale = createLocale<typeof import("../../locales/en.json")>();

export default Locale;
