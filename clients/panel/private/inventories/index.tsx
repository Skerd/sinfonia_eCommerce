import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {Inventory} from "armonia/src/modules/eCommerce/api/eCommerce/private/inventory/inventory.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import InventoryCard from "./center/cardView/inventoryCard.tsx";
import InventorySheetView from "./center/sheetView/inventorySheetView.tsx";
import RestockInventoryDropdown from "./center/actions/restockInventoryDropdown.tsx";
import DeductInventoryDropdown from "./center/actions/deductInventoryDropdown.tsx";
import InventoryStockMoveAction from "@eCommerceModule/components/custom/inventories/inventoryStockMoveAction.tsx";

export function inventoryEditPath(inventory: {_id: string; product?: {title?: string}}) {
    const params = new URLSearchParams();
    params.set("inventoryId", inventory._id);
    if (inventory.product?.title) params.set("inventoryTitle", encodeURIComponent(inventory.product.title));
    return `/eCommerce/inventories/edit?${params.toString()}`;
}

export function inventoryRestockPath(inventory: {_id: string; product?: {title?: string}}) {
    const params = new URLSearchParams();
    params.set("inventoryId", inventory._id);
    if (inventory.product?.title) params.set("inventoryTitle", encodeURIComponent(inventory.product.title));
    return `/eCommerce/inventories/restock?${params.toString()}`;
}

export function inventoryDeductPath(inventory: {_id: string; product?: {title?: string}}) {
    const params = new URLSearchParams();
    params.set("inventoryId", inventory._id);
    if (inventory.product?.title) params.set("inventoryTitle", encodeURIComponent(inventory.product.title));
    return `/eCommerce/inventories/deduct?${params.toString()}`;
}

function AllInventories({resolveLanguageKey}: WithLanguageType) {
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
                </>
            )}
            renderFloatingModals={({action, entity, resetAction, listRef}) => {
                if (action === "restock" || action === "deduct") {
                    return (
                        <InventoryStockMoveAction
                            inventoryId={entity._id}
                            displayName={entity.product?.title}
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
    withDebug(true, true),
)(AllInventories);
