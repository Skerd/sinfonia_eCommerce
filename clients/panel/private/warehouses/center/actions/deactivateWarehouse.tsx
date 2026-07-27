import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {PowerOff} from "lucide-react";
import type {Warehouse} from "armonia/src/modules/eCommerce/api/eCommerce/private/warehouse/warehouse.dto.ts";

type DeactivateWarehouseProps = WithLanguageType & {
    entity: Pick<Warehouse, "_id" | "isActive">;
    onAction: (action: string) => void;
};

function DeactivateWarehouse({entity, resolveLanguageKey, onAction}: DeactivateWarehouseProps) {
    const {write} = useAccess("warehouses");

    if (!write?.isActive) return null;
    if (!entity.isActive) return null;

    return (
        <DropdownMenuItem onClick={() => onAction("deactivateWarehouse")}>
            <PowerOff className="text-destructive" size={16} />
            {resolveLanguageKey("title")}
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/warehouses/center/actions/deactivateWarehouse.tsx"),
    withDebug(true, true),
)(DeactivateWarehouse);
