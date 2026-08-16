import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {Inventory} from "armonia/src/modules/eCommerce/api/eCommerce/private/inventory/inventory.dto.ts";
import {IconAlertTriangle, IconBuildingWarehouse} from "@tabler/icons-react";
import InventorySheetView from "@eCommerceModule/clients/panel/private/inventories/center/sheetView/inventorySheetView.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {inventoryEditPath} from "@eCommerceModule/clients/panel/private/inventories/index.tsx";
import RestockInventoryDropdown from "@eCommerceModule/clients/panel/private/inventories/center/actions/restockInventoryDropdown.tsx";
import DeductInventoryDropdown from "@eCommerceModule/clients/panel/private/inventories/center/actions/deductInventoryDropdown.tsx";
import ViewInventoryMovementsMenuItem from "@eCommerceModule/clients/panel/private/inventories/center/actions/viewInventoryMovements.tsx";
import InventoryStockMoveAction from "@eCommerceModule/components/custom/inventories/inventoryStockMoveAction.tsx";
import ViewInventoryMovementsDialog from "@eCommerceModule/clients/panel/private/inventories/center/dialogs/viewInventoryMovementsDialog.tsx";
import DisplayValue from "@coreModule/components/custom/displayValue/displayValue.tsx";
import {accessFieldPathExists} from "@coreModule/helpers/hocs/withAccess.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

type InventoryCardProps = WithLanguageType & {
    inventory: Inventory;
    fetchId?: string;
    onDelete?: (deleted?: Inventory, response?: DeletedData) => void;
    onRestore?: () => void;
    onInventoryUpdated?: (updated?: Inventory) => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<Inventory> | null>;
};

function InventoryCard({
    inventory,
    resolveLanguageKey,
    fetchId,
    onDelete,
    onRestore,
    onInventoryUpdated,
    hideActions = false,
    sheetOnly = false,
    innerRef,
}: InventoryCardProps) {
    return (
        <EntityCard
            resource="inventories"
            entity={inventory}
            fetchId={fetchId}
            singleUrl="/api/eCommerce/inventory/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            hideRestore
            sheetOnly={sheetOnly}
            editPath={inventoryEditPath}
            Sheet={InventorySheetView}
            sheetEntityProp="inventory"
            deleteUrl="/api/eCommerce/inventory"
            restoreUrl=""
            failedTitle=""
            failedDescription=""
            titlePath="product.title"
            innerRef={innerRef}
            sheetProps={({entity: row, setEntity}) => ({
                fetchId,
                onInventoryUpdated: (updated?: Inventory) => {
                    if (updated) setEntity({...row, ...updated});
                    onInventoryUpdated?.(updated);
                },
            })}
            extraDialogs={({action, setAction, entity: row, setEntity}) => (
                <>
                    {action === "viewInventoryMovements" && (
                        <ViewInventoryMovementsDialog
                            open
                            onClose={() => setAction("")}
                            inventory={row}
                        />
                    )}
                    {(action === "restock" || action === "deduct") && (
                        <InventoryStockMoveAction
                            inventoryId={row._id}
                            displayName={row.product?.title}
                            mode={action}
                            openAlert
                            url={`/api/eCommerce/inventory/${action}`}
                            onSuccess={(updated: Inventory | undefined) => {
                                if (updated) setEntity({...row, ...updated});
                                onInventoryUpdated?.(updated);
                                setAction("");
                            }}
                            onCancel={() => setAction("")}
                        />
                    )}
                </>
            )}
        >
            {({entity: row, read, setAction}) => {
                const available = row.quantityAvailable ?? 0;
                const isLowStock = row.reorderPoint != null && available <= row.reorderPoint;
                const canReadAvailable = accessFieldPathExists(read, "quantityOnHand");
                return (
                    <>
                        <EntityCard.Header titlePath="product.title" title={row.product?.title}>
                            <ViewInventoryMovementsMenuItem inventory={row} onAction={setAction} />
                            <RestockInventoryDropdown inventory={row} onAction={setAction} />
                            <DeductInventoryDropdown inventory={row} onAction={setAction} />
                        </EntityCard.Header>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <IconBuildingWarehouse className="h-3.5 w-3.5 shrink-0" />
                                <DisplayValue path="warehouse.name" value={row.warehouse?.name} />
                                {row.warehouse?.code ? (
                                    <DisplayValue path="warehouse.code" value={`(${row.warehouse.code})`} />
                                ) : null}
                            </div>
                            <div className="mt-1 grid grid-cols-3 gap-2 text-center">
                                <div>
                                    <div className="text-3xs uppercase tracking-wide text-muted-foreground">
                                        {resolveLanguageKey("onHand")}
                                    </div>
                                    <div className="text-sm font-bold">
                                        <DisplayValue path="quantityOnHand" type="number" value={row.quantityOnHand ?? 0} />
                                    </div>
                                </div>
                                <div>
                                    <div className="text-3xs uppercase tracking-wide text-muted-foreground">
                                        {resolveLanguageKey("reserved")}
                                    </div>
                                    <div className="text-sm font-bold">
                                        <DisplayValue path="quantityReserved" type="number" value={row.quantityReserved ?? 0} />
                                    </div>
                                </div>
                                <div>
                                    <div className="text-3xs uppercase tracking-wide text-muted-foreground">
                                        {resolveLanguageKey("available")}
                                    </div>
                                    <div className={cn("text-sm font-bold", isLowStock ? "text-warning" : "text-success")}>
                                        <DisplayValue
                                            path="quantityAvailable"
                                            type="number"
                                            value={available}
                                            show={canReadAvailable}
                                        />
                                    </div>
                                </div>
                            </div>
                            {isLowStock ? (
                                <div className="mt-1 flex items-center gap-1 text-2xs font-medium text-warning">
                                    <IconAlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                    {resolveLanguageKey("lowStock")}
                                </div>
                            ) : null}
                        </div>
                    </>
                );
            }}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/inventories/center/cardView/inventoryCard.tsx"),
    withDebug(true, true),
)(InventoryCard);
