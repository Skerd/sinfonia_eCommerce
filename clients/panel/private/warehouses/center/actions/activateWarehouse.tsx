import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {Power} from "lucide-react";
import type {Warehouse} from "armonia/src/modules/eCommerce/api/eCommerce/private/warehouse/warehouse.dto.ts";

type ActivateWarehouseProps = WithLanguageType & {
    entity: Pick<Warehouse, "_id" | "isActive">;
    onAction: (action: string) => void;
};

function ActivateWarehouse({entity, resolveLanguageKey, onAction}: ActivateWarehouseProps) {
    const {write} = useAccess("warehouses");

    if (!write?.isActive) return null;
    if (entity.isActive) return null;

    return (
        <DropdownMenuItem onClick={() => onAction("activateWarehouse")}>
            <Power className="text-success" size={16} />
            {resolveLanguageKey("title")}
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/warehouses/center/actions/activateWarehouse.tsx"),
    withDebug(true, true),
)(ActivateWarehouse);
