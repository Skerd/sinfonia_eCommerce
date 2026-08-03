import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useEffect, useState} from "react";
import {Card} from "@coreModule/components/ui/card.tsx";
import ValueNotSet from "@coreModule/components/custom/valueNotSet.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {Inventory} from "armonia/src/modules/eCommerce/api/eCommerce/private/inventory/inventory.dto.ts";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import {IconAlertTriangle, IconBuildingWarehouse} from "@tabler/icons-react";
import InventorySheetView from "@eCommerceModule/clients/panel/private/inventories/center/sheetView/inventorySheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {inventoryEditPath} from "@eCommerceModule/clients/panel/private/inventories/index.tsx";
import RestockInventoryDropdown from "@eCommerceModule/clients/panel/private/inventories/center/actions/restockInventoryDropdown.tsx";
import DeductInventoryDropdown from "@eCommerceModule/clients/panel/private/inventories/center/actions/deductInventoryDropdown.tsx";
import ViewInventoryMovementsMenuItem from "@eCommerceModule/clients/panel/private/inventories/center/actions/viewInventoryMovements.tsx";
import InventoryStockMoveAction from "@eCommerceModule/components/custom/inventories/inventoryStockMoveAction.tsx";
import ViewInventoryMovementsDialog from "@eCommerceModule/clients/panel/private/inventories/center/dialogs/viewInventoryMovementsDialog.tsx";

type InventoryCardProps = WithLanguageType & {
    inventory: Inventory;
    onDelete?: (deleted?: Inventory, response?: DeletedData) => void;
    onRestore?: () => void;
    onInventoryUpdated?: (updated?: Inventory) => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
};

function InventoryCard({
    inventory: inventoryProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onInventoryUpdated,
    hideActions = false,
    sheetOnly = false,
}: InventoryCardProps) {
    const [action, setAction] = useState<string>("");
    const [inventory, setInventory] = useState<Inventory>(inventoryProp);
    const [hideAfterDeletion, setHideAfterDeletion] = useState(false);

    const onDelete = (data: DeletedData) => {
        if (onDeleteProp) {
            onDeleteProp(inventory, data);
        } else {
            setHideAfterDeletion(true);
        }
    };

    const {read} = useAccess("inventories");

    useEffect(() => {
        setInventory(inventoryProp);
    }, [inventoryProp]);

    if (hideAfterDeletion) {
        return <></>;
    }
    if (!read || !Object.keys(read).length) {
        return <HiddenElement />;
    }

    const available = inventory.quantityAvailable ?? 0;
    const isLowStock = inventory.reorderPoint != null && available <= inventory.reorderPoint;

    return (
        <>
            {!sheetOnly && (
                <Card
                    className={cn(
                        "group p-0 h-full relative transition-[box-shadow,--tw-ring-color] duration-200 hover:cursor-pointer hover:shadow-md hover:ring-primary/40",
                        isLowStock && "border-warning/60",
                    )}
                    onClick={() => setAction("view")}
                >
                    <div className="flex w-full items-stretch">
                        {(read.deletedBy || read.deletedAt) && (
                            <DeletedInfo deletedAt={inventory.deletedAt} deletedBy={inventory.deletedBy} />
                        )}
                        <div className="w-full min-w-0 py-3 px-4">
                        <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0 flex-1">
                                <HiddenElement randomLength={read?.product?.keys?.title ? 0 : 10}>
                                    {!!read?.product?.keys?.title ? (
                                        <div className="font-semibold text-sm leading-tight line-clamp-2">
                                            {inventory.product?.title || <ValueNotSet />}
                                        </div>
                                    ) : null}
                                </HiddenElement>
                                {(!!inventory.warehouse || !read?.warehouse) && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                        <IconBuildingWarehouse className="w-3.5 h-3.5 shrink-0" />
                                        <HiddenElement randomLength={read?.warehouse ? 0 : 8}>
                                            {!!read?.warehouse ? (
                                                <span className="truncate">
                                                    {read?.warehouse?.keys?.name ? inventory.warehouse?.name ?? "" : ""}
                                                    {read?.warehouse?.keys?.code && inventory.warehouse?.code
                                                        ? ` (${inventory.warehouse.code})`
                                                        : ""}
                                                </span>
                                            ) : null}
                                        </HiddenElement>
                                    </div>
                                )}
                            </div>
                            {!hideActions && (
                                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                                    <ActionMenu
                                        accessModel={"inventories"}
                                        deletedData={inventory}
                                        onAction={(a: string) => setAction(a)}
                                        editPath={inventoryEditPath(inventory)}
                                    >
                                        <ViewInventoryMovementsMenuItem inventory={inventory} onAction={setAction} />
                                        <RestockInventoryDropdown inventory={inventory} onAction={setAction} />
                                        <DeductInventoryDropdown inventory={inventory} onAction={setAction} />
                                    </ActionMenu>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                            <div>
                                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                    {resolveLanguageKey("onHand")}
                                </div>
                                <HiddenElement randomLength={read?.quantityOnHand ? 0 : 4}>
                                    {!!read?.quantityOnHand ? (
                                        <div className="font-bold text-sm">{inventory.quantityOnHand ?? 0}</div>
                                    ) : null}
                                </HiddenElement>
                            </div>
                            <div>
                                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                    {resolveLanguageKey("reserved")}
                                </div>
                                <HiddenElement randomLength={read?.quantityReserved ? 0 : 4}>
                                    {!!read?.quantityReserved ? (
                                        <div className="font-bold text-sm">{inventory.quantityReserved ?? 0}</div>
                                    ) : null}
                                </HiddenElement>
                            </div>
                            <div>
                                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                    {resolveLanguageKey("available")}
                                </div>
                                <HiddenElement randomLength={read?.quantityAvailable ? 0 : 4}>
                                    {!!read?.quantityAvailable ? (
                                        <div className={cn("font-bold text-sm", isLowStock ? "text-warning" : "text-success")}>
                                            {available}
                                        </div>
                                    ) : null}
                                </HiddenElement>
                            </div>
                        </div>

                        <HiddenElement randomLength={read?.quantityAvailable && read?.reorderPoint ? 0 : 8}>
                            {!!(read?.quantityAvailable && read?.reorderPoint) && isLowStock ? (
                                <div className="flex items-center gap-1 text-[11px] font-medium text-warning mt-2">
                                    <IconAlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                    {resolveLanguageKey("lowStock")}
                                </div>
                            ) : null}
                        </HiddenElement>
                    </div>
                    </div>
                </Card>
            )}

            {!!action && (
                <>
                    {action === "view" && (
                        <InventorySheetView
                            open={action === "view"}
                            onOpenChange={() => setAction("")}
                            inventory={inventory}
                            fetchId={inventory._id}
                            onDelete={onDelete}
                            onInventoryUpdated={(updated: Inventory | undefined) => {
                                if (updated) setInventory(updated);
                                onInventoryUpdated?.(updated);
                            }}
                        />
                    )}
                    {action === "delete" && (
                        <DeleteAction
                            accessModel={"inventories"}
                            deleteId={inventory._id}
                            openAlert={action === "delete"}
                            name={read?.product?.keys?.title && inventory.product?.title}
                            confirmName={read?.product?.keys?.title && inventory.product?.title}
                            onSuccess={onDelete}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/inventory"
                        />
                    )}
                    {action === "viewInventoryMovements" && (
                        <ViewInventoryMovementsDialog
                            open
                            onClose={() => setAction("")}
                            inventory={inventory}
                        />
                    )}
                    {(action === "restock" || action === "deduct") && (
                        <InventoryStockMoveAction
                            inventoryId={inventory._id}
                            displayName={inventory.product?.title}
                            mode={action}
                            openAlert
                            url={`/api/eCommerce/inventory/${action}`}
                            onSuccess={(updated: Inventory | undefined) => {
                                if (updated) setInventory(updated);
                                onInventoryUpdated?.(updated);
                                setAction("");
                            }}
                            onCancel={() => setAction("")}
                        />
                    )}
                </>
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/inventories/center/cardView/inventoryCard.tsx"),
    withDebug(true, true),
)(InventoryCard);
