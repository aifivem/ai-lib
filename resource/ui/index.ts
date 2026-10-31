// ai-lib's own client script: the shared player UI (prompts, notifications, the progress bar, menus, inputs,
// minigames) every resource draws through the lib. Runs without ai-core.
import "./notify";
import "./prompts";
import "./dialogs";
import "./minigame";
import "./progressFor";
import "./zoneHost";

// Above the other NUI pages (a menu over the character screen, a notification over an inventory).
SetNuiZindex(100);
