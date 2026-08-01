import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {Star} from "lucide-react";
import type {Warehouse} from "armonia/src/modules/eCommerce/api/eCommerce/private/warehouse/warehouse.dto.ts";

type SetDefaultWarehouseProps = WithLanguageType & {
    entity: Pick<Warehouse, "_id" | "isDefault" | "deletedAt">;
    onAction: (action: string) => void;
};

function SetDefaultWarehouse({entity, resolveLanguageKey, onAction}: SetDefaultWarehouseProps) {
    const {write} = useAccess("warehouses");

    if (!write?.isDefault) return null;
    if (entity.deletedAt) return null;
    if (entity.isDefault) return null;

    return (
        <DropdownMenuItem onClick={() => onAction("setDefaultWarehouse")}>
            <Star className="text-amber-500" size={16} />
            {resolveLanguageKey("title")}
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage(
        "src/modules/eCommerce/clients/panel/private/warehouses/center/actions/setDefaultWarehouse.tsx",
    ),
    withDebug(true, true),
)(SetDefaultWarehouse);
