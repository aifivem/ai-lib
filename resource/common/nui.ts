/** NUI contract of ai-lib's own page (client script <-> web): the shared player UI every resource uses. */

/** Client -> NUI messages: `{ action, data }`. */
export const NuiMessage = {
  /** data: { key, text, button }, a prompt appears (or its text changes) on the right. */
  promptShow: "promptShow",
  /** data: key */
  promptHide: "promptHide",
  /** data: Notification */
  notify: "notify",
  /** data: { label, duration }, the progress bar starts. */
  progressShow: "progressShow",
  progressHide: "progressHide",
  /** data: MenuRequest */
  menuOpen: "menuOpen",
  /** data: InputRequest */
  inputOpen: "inputOpen",
  /** data: MinigameRequest & { texts }, a skill check or lockpick starts (answered with `dialogAnswer`). */
  minigameOpen: "minigameOpen",
  dialogClose: "dialogClose",
} as const;

/** NUI -> client callbacks (fetch `https://ai-lib/<name>`). */
export const NuiCallback = {
  /** ({ value }) -> true, the menu pick (item id), input values or minigame result; null when closed. */
  dialogAnswer: "dialogAnswer",
  /** ({ id }) -> true, the pointer or focus moved onto a menu item. */
  dialogHover: "dialogHover",
  /** ({ id, checked }) -> true, a switch row of the menu was flipped (the menu stays open). */
  dialogToggle: "dialogToggle",
} as const;
