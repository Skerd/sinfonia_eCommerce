import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useKeyboardShortcuts} from "@coreModule/helpers/hooks/useKeyboardShortcut.ts";
import {DropdownMenuItem, DropdownMenuShortcut} from "@coreModule/components/ui/dropdown-menu.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {Inventory} from "armonia/src/modules/eCommerce/api/eCommerce/private/inventory/inventory.dto.ts";
import {PackageMinus} from "lucide-react";

type DeductInventoryDropdownProps = WithLanguageType & {
    inventory: Inventory;
    onAction: (action: string) => void;
};

function DeductInventoryDropdown({inventory, onAction, resolveLanguageKey}: DeductInventoryDropdownProps) {
    const actionKey = "deduct";
    const shortcut = "2";
    const {write} = useAccess("inventories");
    const canRun = !!write && !!inventory?._id && (inventory.quantityOnHand ?? 0) > 0;

    const triggerAction = () => {
        if (!canRun) return;
        onAction(actionKey);
    };
    useKeyboardShortcuts(shortcut, triggerAction);

    if (!canRun) return null;

    return (
        <DropdownMenuItem onClick={() => triggerAction()}>
            <PackageMinus size={16} className="text-amber-700" />
            <span className="text-amber-700">{resolveLanguageKey("title")}</span>
            <DropdownMenuShortcut>⌘{shortcut}</DropdownMenuShortcut>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/inventories/center/actions/deductInventoryDropdown.tsx"),
    withDebug(true, true),
)(DeductInventoryDropdown);
