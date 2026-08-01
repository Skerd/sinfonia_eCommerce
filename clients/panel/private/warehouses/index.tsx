import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage, {type EntityListRefs} from "@coreModule/components/entityPage/EntityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {Warehouse} from "armonia/src/modules/eCommerce/api/eCommerce/private/warehouse/warehouse.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import WarehouseCard from "./center/cardView/warehouseCard.tsx";
import WarehouseSheetView from "./center/sheetView/warehouseSheetView.tsx";
import ActivateWarehouse from "./center/actions/activateWarehouse.tsx";
import DeactivateWarehouse from "./center/actions/deactivateWarehouse.tsx";
import SetDefaultWarehouse from "./center/actions/setDefaultWarehouse.tsx";
import ActivateWarehouseDialog from "./center/dialogs/activateWarehouseDialog.tsx";
import DeactivateWarehouseDialog from "./center/dialogs/deactivateWarehouseDialog.tsx";
import SetDefaultWarehouseDialog from "./center/dialogs/setDefaultWarehouseDialog.tsx";

export function warehouseEditPath(w: {_id: string; name?: string}) {
    const params = new URLSearchParams();
    params.set("warehouseId", w._id);
    if (w.name) params.set("warehouseName", encodeURIComponent(w.name));
    return `/tenancy/systemSettings/warehouses/edit?${params.toString()}`;
}

function applySetDefaultToList(
    listRef: EntityListRefs<Warehouse> | null | undefined,
    defaultWarehouseId: string,
) {
    listRef?.current?.mapRows?.((row) => {
        if (row._id === defaultWarehouseId) return {isDefault: true};
        if (row.isDefault) return {isDefault: false};
    });
}

function AllWarehouses({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<Warehouse>
            apiUrl="/api/eCommerce/warehouse"
            collectionName="warehouses"
            accessModel="warehouses"
            tableConfigKey="warehouses"
            rowActionMenu={{allowMenuForCustomChildren: true}}
            createPath="/tenancy/systemSettings/warehouses/create"
            createIcon={<IconPlus />}
            createLanguageKey="createWarehouse"
            buildEditPath={warehouseEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerce/clients/panel/private/warehouses/center/sheetView/warehouseSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderActionMenuChildren={(_entity, bindRowAction) => (
                <>
                    <SetDefaultWarehouse entity={_entity} onAction={bindRowAction} />
                    <ActivateWarehouse entity={_entity} onAction={bindRowAction} />
                    <DeactivateWarehouse entity={_entity} onAction={bindRowAction} />
                </>
            )}
            renderSheetActionMenuChildren={(_entity, bindRowAction) => (
                <>
                    <SetDefaultWarehouse entity={_entity} onAction={bindRowAction} />
                    <ActivateWarehouse entity={_entity} onAction={bindRowAction} />
                    <DeactivateWarehouse entity={_entity} onAction={bindRowAction} />
                </>
            )}
            renderFloatingModals={({action, entity, resetAction, listRef}) => {
                if (action === "setDefaultWarehouse") {
                    return (
                        <SetDefaultWarehouseDialog
                            open={true}
                            onClose={resetAction}
                            entity={entity}
                            onSuccess={() => applySetDefaultToList(listRef, entity._id)}
                        />
                    );
                }
                if (action === "activateWarehouse") {
                    return (
                        <ActivateWarehouseDialog
                            open={true}
                            onClose={resetAction}
                            entity={entity}
                            onSuccess={() => listRef.current?.updateRow?.(entity._id, {isActive: true})}
                        />
                    );
                }
                if (action === "deactivateWarehouse") {
                    return (
                        <DeactivateWarehouseDialog
                            open={true}
                            onClose={resetAction}
                            entity={entity}
                            onSuccess={() => listRef.current?.updateRow?.(entity._id, {isActive: false})}
                        />
                    );
                }
                return null;
            }}
            renderCard={(warehouse, onDelete, onRestore, listRef) => (
                <WarehouseCard
                    warehouse={warehouse}
                    onDelete={(row: Warehouse | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(warehouse)}
                    onDefaultChanged={(warehouseId) => applySetDefaultToList(listRef, warehouseId)}
                    onActiveChanged={(isActive) => listRef.current?.updateRow?.(warehouse._id, {isActive})}
                />
            )}
            renderSheet={({entity, open, onOpenChange, onDelete, onRestore, listRef}) => (
                <WarehouseSheetView
                    open={open}
                    onOpenChange={(opened: boolean) => { if (!opened) onOpenChange(); }}
                    warehouse={entity}
                    onDelete={onDelete}
                    onRestore={onRestore}
                    onDefaultChanged={(warehouseId) => applySetDefaultToList(listRef, warehouseId)}
                    onSheetRowPatched={(row: Record<string, unknown>) => {
                        listRef.current?.updateRow?.(entity._id, row as Partial<Warehouse>);
                    }}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/warehouses/index.tsx"),
    withDebug(true, true),
)(AllWarehouses);
