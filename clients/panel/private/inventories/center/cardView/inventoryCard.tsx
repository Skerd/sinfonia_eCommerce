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
import {IconAlertTriangle, IconBuildingWarehouse} from "@tabler/icons-react";
import InventorySheetView from "@eCommerceModule/clients/panel/private/inventories/center/sheetView/inventorySheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {inventoryEditPath} from "@eCommerceModule/clients/panel/private/inventories/index.tsx";

type InventoryCardProps = WithLanguageType & {
    inventory: Inventory;
    onDelete?: (deleted?: Inventory, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
};

function InventoryCard({
    inventory: inventoryProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
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
                        "group p-0 h-full relative transition-all duration-300 hover:shadow-md hover:cursor-pointer",
                        isLowStock && "border-amber-400/60",
                    )}
                    onClick={() => setAction("view")}
                >
                    <div className="w-full min-w-0 py-3 px-4">
                        <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0 flex-1">
                                <HiddenElement showLock randomLength={0}>
                                    {read?.product && (
                                        <div className="font-semibold text-sm leading-tight line-clamp-2">
                                            {inventory.product?.title || <ValueNotSet />}
                                        </div>
                                    )}
                                </HiddenElement>
                                {read?.warehouse && inventory.warehouse && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                        <IconBuildingWarehouse className="w-3.5 h-3.5 shrink-0" />
                                        <span className="truncate">
                                            {inventory.warehouse.name} ({inventory.warehouse.code})
                                        </span>
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
                                    />
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                            <div>
                                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                    {resolveLanguageKey("onHand")}
                                </div>
                                <div className="font-bold text-sm">{inventory.quantityOnHand ?? 0}</div>
                            </div>
                            <div>
                                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                    {resolveLanguageKey("reserved")}
                                </div>
                                <div className="font-bold text-sm">{inventory.quantityReserved ?? 0}</div>
                            </div>
                            <div>
                                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                    {resolveLanguageKey("available")}
                                </div>
                                <div className={cn("font-bold text-sm", isLowStock ? "text-amber-600" : "text-emerald-600")}>
                                    {available}
                                </div>
                            </div>
                        </div>

                        {isLowStock && (
                            <div className="flex items-center gap-1 text-[11px] font-medium text-amber-600 mt-2">
                                <IconAlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                {resolveLanguageKey("lowStock")}
                            </div>
                        )}
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
                        />
                    )}
                    {action === "delete" && (
                        <DeleteAction
                            accessModel={"inventories"}
                            deleteId={inventory._id}
                            openAlert={action === "delete"}
                            name={read?.product && inventory.product?.title}
                            confirmName={read?.product && inventory.product?.title}
                            onSuccess={onDelete}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/inventory"
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
