import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { config } from "@fortawesome/fontawesome-svg-core";
import { applyPreview } from "./dev/preview";
import { Dialogs } from "./features/dialogs/Dialogs";
import { Minigames } from "./features/dialogs/Minigames";
import { Notifications } from "./features/notify/Notifications";
import { Prompts } from "./features/prompts/Prompts";
import "./index.css";

// FA's injected unlayered CSS would beat Tailwind's icon sizes; its styles come from index.css in @layer base.
config.autoAddCss = false;
applyPreview();

/** The shared player UI of every resource: prompts, notifications, the progress bar, menus, inputs, minigames. */
const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <Prompts />
      <Notifications />
      <Dialogs />
      <Minigames />
    </StrictMode>,
  );
}
