import {compose} from "redux";
import {useMemo} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage, {type QuickFilterDef} from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {COLUMN_TYPE} from "armonia/src/modules/core/database/filter/typeOperators.ts";
import {IconPlus} from "@tabler/icons-react";
import type {Inventory} from "armonia/src/modules/eCommerce/api/eCommerce/private/inventory/inventory.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import InventoryCard from "./center/cardView/inventoryCard.tsx";
import InventorySheetView from "./center/sheetView/inventorySheetView.tsx";
import RestockInventoryDropdown from "./center/actions/restockInventoryDropdown.tsx";
import DeductInventoryDropdown from "./center/actions/deductInventoryDropdown.tsx";
import ViewInventoryMovementsDropdown from "./center/actions/viewInventoryMovementsDropdown.tsx";
import ViewInventoryMovementsDialog from "./center/dialogs/viewInventoryMovementsDialog.tsx";
import InventoryStockMoveAction from "@eCommerceModule/components/custom/inventories/inventoryStockMoveAction.tsx";

export function inventoryEditPath(inventory: {_id: string; product: {title: string}}) {
    const params = new URLSearchParams();
    params.set("inventoryId", inventory._id);
    params.set("inventoryTitle", encodeURIComponent(inventory.product.title));
    return `/eCommerce/inventories/edit?${params.toString()}`;
}

function AllInventories({resolveLanguageKey}: WithLanguageType) {
    const quickFilters = useMemo<QuickFilterDef[]>(() => [
        {
            field: "product",
            label: resolveLanguageKey("fields.product"),
            type: COLUMN_TYPE.OBJECT_ID,
            apiUrl: "/api/eCommerce/product/select",
        },
        {
            field: "warehouse",
            label: resolveLanguageKey("fields.warehouse"),
            type: COLUMN_TYPE.OBJECT_ID,
            apiUrl: "/api/eCommerce/warehouse/select",
        },
    ], [resolveLanguageKey]);

    return (
        <EntityListPage<Inventory>
            apiUrl="/api/eCommerce/inventory"
            collectionName="inventories"
            accessModel="inventories"
            tableConfigKey="inventories"
            createPath="/eCommerce/inventories/create"
            createIcon={<IconPlus />}
            createLanguageKey="createInventory"
            buildEditPath={inventoryEditPath}
            rowActionMenu={{allowMenuForCustomChildren: true}}
            quickFilters={quickFilters}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerce/clients/panel/private/inventories/center/sheetView/inventorySheetView.tsx"
            renderSheet={({entity, open, onOpenChange, onDelete, onRestore, listRef}) => (
                <InventorySheetView
                    open={open}
                    onOpenChange={() => onOpenChange()}
                    inventory={entity}
                    fetchId={entity._id}
                    onDelete={onDelete}
                    onRestore={onRestore}
                    onInventoryUpdated={() => listRef.current?.refetch?.()}
                />
            )}
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderActionMenuChildren={(inventory, bindRowAction) => (
                <>
                    <RestockInventoryDropdown inventory={inventory} onAction={bindRowAction} />
                    <DeductInventoryDropdown inventory={inventory} onAction={bindRowAction} />
                    <ViewInventoryMovementsDropdown inventory={inventory} onAction={bindRowAction} />
                </>
            )}
            renderFloatingModals={({action, entity, resetAction, listRef}) => {
                if (action === "restock" || action === "deduct") {
                    return (
                        <InventoryStockMoveAction
                            inventoryId={entity._id}
                            displayName={entity.product.title}
                            mode={action}
                            openAlert
                            url={`/api/eCommerce/inventory/${action}`}
                            onSuccess={() => {
                                listRef.current?.refetch?.();
                                resetAction();
                            }}
                            onCancel={resetAction}
                        />
                    );
                }
                if (action === "viewMovements") {
                    return (
                        <ViewInventoryMovementsDialog
                            open
                            inventory={entity}
                            onClose={resetAction}
                        />
                    );
                }
                return null;
            }}
            renderCard={(inventory, onDelete, onRestore, listRef) => (
                <InventoryCard
                    inventory={inventory}
                    onDelete={(row: Inventory | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(inventory)}
                    onInventoryUpdated={() => listRef.current?.refetch?.()}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/inventories/index.tsx"),
    withDebug(true, true, "inventories"),
)(AllInventories);
