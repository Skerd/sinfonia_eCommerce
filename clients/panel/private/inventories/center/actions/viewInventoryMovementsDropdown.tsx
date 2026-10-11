import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useKeyboardShortcuts} from "@coreModule/helpers/hooks/useKeyboardShortcut.ts";
import {DropdownMenuItem, DropdownMenuShortcut} from "@coreModule/components/ui/dropdown-menu.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import type {Inventory} from "armonia/src/modules/eCommerce/api/eCommerce/private/inventory/inventory.dto.ts";
import {History} from "lucide-react";

type ViewInventoryMovementsDropdownProps = WithLanguageType & {
    inventory: Inventory;
    onAction: (action: string) => void;
};

function ViewInventoryMovementsDropdown({
    inventory,
    onAction,
    resolveLanguageKey,
}: ViewInventoryMovementsDropdownProps) {
    const actionKey = "viewMovements";
    const shortcut = "3";
    const {read: readInventory} = useAccess("inventories");
    const {read: readMovements} = useAccess("inventoryMovements");
    const canRun = !!readInventory && !!readMovements && !!inventory?._id;

    const triggerAction = () => {
        if (!canRun) return;
        onAction(actionKey);
    };
    useKeyboardShortcuts(shortcut, triggerAction);

    if (!canRun) return null;

    return (
        <DropdownMenuItem onClick={() => triggerAction()}>
            <History size={16} />
            {resolveLanguageKey("title")}
            <DropdownMenuShortcut>⌘{shortcut}</DropdownMenuShortcut>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage(
        "src/modules/eCommerce/clients/panel/private/inventories/center/actions/viewInventoryMovementsDropdown.tsx",
    ),
    withDebug(true, true, ["inventories", "inventoryMovements"]),
)(ViewInventoryMovementsDropdown);
