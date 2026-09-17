import withLanguage, {WithLanguageType} from "@baseModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@baseModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {IconHistory} from "@tabler/icons-react";
import {useAccess} from "@baseModule/helpers/hooks/useAccess.ts";
import type {Inventory} from "armonia/src/modules/eCommerce/api/eCommerce/private/inventory/inventory.dto.ts";

type Props = WithLanguageType & {
    inventory: Inventory;
    onAction: (action: string) => void;
};

function ViewInventoryMovementsMenuItem({inventory, onAction, resolveLanguageKey}: Props) {
    const {read} = useAccess("inventoryMovements");
    if (!read || !inventory?._id) return null;

    return (
        <DropdownMenuItem onClick={() => onAction("viewInventoryMovements")}>
            <IconHistory size={16} />
            <p>{resolveLanguageKey("title")}</p>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage(
        "src/modules/eCommerce/clients/panel/private/inventories/center/actions/viewInventoryMovements.tsx",
    ),
    withDebug(true, true, "inventoryMovements"),
)(ViewInventoryMovementsMenuItem);
