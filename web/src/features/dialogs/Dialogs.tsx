import { useState } from "react";
import { useNuiEvent } from "fivem-nui-react";
import type { InputRequest, MenuRequest } from "@aicore-fivem/shared";
import { NuiMessage } from "../../../../resource/common/nui";
import { MENU_MOCK } from "../../dev/dialogMock";
import { InputPanel } from "./InputPanel";
import { MenuPanel } from "./MenuPanel";
import { useMenuKeys } from "./useMenuKeys";

const MENU_OPTIONS = { mockData: MENU_MOCK, mockDelay: 200 };

/** The menu and input dialog other resources open (lib `menu` / `input`). */
export function Dialogs() {
  const [menu, setMenu] = useState<MenuRequest | null>(null);
  const [input, setInput] = useState<InputRequest | null>(null);
  const [holding, setHolding] = useState(false);

  // The client checked both shapes (resource/client/menu.ts).
  useNuiEvent<MenuRequest>(
    NuiMessage.menuOpen,
    (m) => setMenu(m),
    MENU_OPTIONS,
  );
  useNuiEvent<InputRequest>(NuiMessage.inputOpen, (m) => setInput(m));
  useNuiEvent(NuiMessage.dialogClose, () => {
    setMenu(null);
    setInput(null);
  });

  useMenuKeys(menu, setHolding);

  return (
    <>
      {menu && <MenuPanel menu={menu} holding={holding} />}
      {input && <InputPanel input={input} />}
    </>
  );
}
