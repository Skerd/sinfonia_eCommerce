import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useEffect, useState} from "react";
import {Card} from "@coreModule/components/ui/card.tsx";
import ValueNotSet from "@coreModule/components/custom/valueNotSet.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {InventoryMovement} from "armonia/src/modules/eCommerce/api/eCommerce/private/inventoryMovement/inventoryMovement.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {IconBuildingWarehouse, IconPackage} from "@tabler/icons-react";
import InventoryMovementSheetView from "@eCommerceModule/clients/panel/private/inventoryMovements/center/sheetView/inventoryMovementSheetView.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";

type InventoryMovementCardProps = WithLanguageType & {
    movement: InventoryMovement;
    onDelete?: (deleted?: InventoryMovement, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
};

function InventoryMovementCard({
    movement: movementProp,
    resolveLanguageKey,
    hideActions = false,
    sheetOnly = false,
}: InventoryMovementCardProps) {
    const [action, setAction] = useState<string>("");
    const [movement, setMovement] = useState<InventoryMovement>(movementProp);
    const {read} = useAccess("inventoryMovements");

    useEffect(() => {
        setMovement(movementProp);
    }, [movementProp]);

    if (!read || !Object.keys(read).length) {
        return <HiddenElement />;
    }

    const qty = movement.quantity ?? 0;
    const isPositive = qty > 0;

    return (
        <>
            {!sheetOnly && (
                <Card
                    className="group p-0 h-full relative transition-all duration-300 hover:shadow-md hover:cursor-pointer"
                    onClick={() => setAction("view")}
                >
                    <div className="w-full min-w-0 py-3 px-4">
                        <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0 flex-1">
                                <div className="font-semibold text-sm leading-tight capitalize">
                                    {resolveLanguageKey(`reasons.${movement.reason}`, true) || movement.reason || (
                                        <ValueNotSet />
                                    )}
                                </div>
                                {movement.product?.title && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                        <IconPackage className="w-3.5 h-3.5 shrink-0" />
                                        <span className="truncate">{movement.product.title}</span>
                                    </div>
                                )}
                                {movement.warehouse?.name && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                        <IconBuildingWarehouse className="w-3.5 h-3.5 shrink-0" />
                                        <span className="truncate">
                                            {movement.warehouse.name}
                                            {movement.warehouse.code ? ` (${movement.warehouse.code})` : ""}
                                        </span>
                                    </div>
                                )}
                            </div>
                            {!hideActions && (
                                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                                    <ActionMenu
                                        accessModel={"inventoryMovements"}
                                        deletedData={movement as any}
                                        onAction={(a: string) => setAction(a)}
                                        editPath=""
                                        hideEdit
                                        hideDelete
                                        allowMenuForCustomChildren
                                    />
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                            <div>
                                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                    {resolveLanguageKey("quantity")}
                                </div>
                                <div className={cn("font-bold text-sm", isPositive ? "text-emerald-600" : "text-amber-700")}>
                                    {isPositive ? `+${qty}` : qty}
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                    {resolveLanguageKey("beforeAfter")}
                                </div>
                                <div className="font-bold text-sm tabular-nums">
                                    {movement.quantityBefore ?? 0}→{movement.quantityAfter ?? 0}
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                    {resolveLanguageKey("receipt")}
                                </div>
                                <div className="font-bold text-sm truncate">
                                    {movement.receiptNumber || "—"}
                                </div>
                            </div>
                        </div>

                        {(movement.manufacturer || movement.occurredAt) && (
                            <div className="mt-2 text-[11px] text-muted-foreground truncate">
                                {[
                                    movement.manufacturer,
                                    movement.occurredAt
                                        ? new Date(movement.occurredAt).toLocaleString()
                                        : null,
                                ]
                                    .filter(Boolean)
                                    .join(" · ")}
                            </div>
                        )}
                    </div>
                </Card>
            )}

            {action === "view" && (
                <InventoryMovementSheetView
                    open
                    onOpenChange={() => setAction("")}
                    movement={movement}
                    fetchId={movement._id}
                />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/inventoryMovements/center/cardView/inventoryMovementCard.tsx"),
    withDebug(true, true),
)(InventoryMovementCard);
