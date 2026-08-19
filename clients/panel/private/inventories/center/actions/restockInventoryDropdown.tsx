import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useKeyboardShortcuts} from "@coreModule/helpers/hooks/useKeyboardShortcut.ts";
import {DropdownMenuItem, DropdownMenuShortcut} from "@coreModule/components/ui/dropdown-menu.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {Inventory} from "armonia/src/modules/eCommerce/api/eCommerce/private/inventory/inventory.dto.ts";
import {PackagePlus} from "lucide-react";

type RestockInventoryDropdownProps = WithLanguageType & {
    inventory: Inventory;
    onAction: (action: string) => void;
};

function RestockInventoryDropdown({inventory, onAction, resolveLanguageKey}: RestockInventoryDropdownProps) {
    const actionKey = "restock";
    const shortcut = "1";
    const {write} = useAccess("inventories");
    const canRun = !!write && !!inventory?._id;

    const triggerAction = () => {
        if (!canRun) return;
        onAction(actionKey);
    };
    useKeyboardShortcuts(shortcut, triggerAction);

    if (!canRun) return null;

    return (
        <DropdownMenuItem onClick={() => triggerAction()}>
            <PackagePlus size={16} className="text-success" />
            <span className="text-success">{resolveLanguageKey("title")}</span>
            <DropdownMenuShortcut>⌘{shortcut}</DropdownMenuShortcut>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/inventories/center/actions/restockInventoryDropdown.tsx"),
    withDebug(true, true, "inventories"),
)(RestockInventoryDropdown);
