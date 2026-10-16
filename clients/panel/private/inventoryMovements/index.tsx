import {compose} from "redux";
import {useMemo} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage, {type QuickFilterDef} from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {COLUMN_TYPE} from "armonia/src/modules/core/database/filter/typeOperators.ts";
import type {InventoryMovement} from "armonia/src/modules/eCommerce/api/eCommerce/private/inventoryMovement/inventoryMovement.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import InventoryMovementCard from "./center/cardView/inventoryMovementCard.tsx";

function AllInventoryMovements({resolveLanguageKey}: WithLanguageType) {
    const quickFilters = useMemo<QuickFilterDef[]>(() => [
        {
            field: "reason",
            label: String(resolveLanguageKey("fields.reason")),
            type: COLUMN_TYPE.ENUM,
            enumValues: [
                "restock", "sale", "return", "adjustment", "damage",
                "transfer_in", "transfer_out", "initial", "write_off",
            ].map((value) => ({
                value,
                label: String(resolveLanguageKey(`fields.!enums.reason.${value}`)),
            })),
        },
        {
            field: "product",
            label: String(resolveLanguageKey("fields.product")),
            type: COLUMN_TYPE.OBJECT_ID,
            apiUrl: "/api/eCommerce/product/select",
        },
        {
            field: "warehouse",
            label: String(resolveLanguageKey("fields.warehouse")),
            type: COLUMN_TYPE.OBJECT_ID,
            apiUrl: "/api/eCommerce/warehouse/select",
        },
    ], [resolveLanguageKey]);

    return (
        <EntityListPage<InventoryMovement>
            apiUrl="/api/eCommerce/inventoryMovement"
            collectionName="inventoryMovements"
            accessModel="inventoryMovements"
            tableConfigKey="inventoryMovements"
            hideCreate
            buildEditPath={() => ""}
            rowActionMenu={{hideEdit: true, hideDelete: true}}
            resolveLanguageKey={resolveLanguageKey}
            quickFilters={quickFilters}
            sheetLanguagePath="src/modules/eCommerce/clients/panel/private/inventoryMovements/center/sheetView/inventoryMovementSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-4 lg:grid-cols-3 xl:grid-cols-4"
            renderCard={(movement, onDelete, onRestore) => (
                <InventoryMovementCard
                    movement={movement}
                    onDelete={(row: InventoryMovement | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(movement)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/inventoryMovements/index.tsx"),
    withDebug(true, true, "inventoryMovements"),
)(AllInventoryMovements);
