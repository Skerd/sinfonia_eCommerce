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
                    className="group p-0 h-full relative transition-[box-shadow,--tw-ring-color] duration-200 hover:cursor-pointer hover:shadow-md hover:ring-primary/40"
                    onClick={() => setAction("view")}
                >
                    <div className="w-full min-w-0 py-3 px-4">
                        <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0 flex-1">
                                <HiddenElement randomLength={10}>
                                    {!!read?.reason ? (
                                        <div className="font-semibold text-sm leading-tight capitalize">
                                            {resolveLanguageKey(`reasons.${movement.reason}`, true) || movement.reason || (
                                                <ValueNotSet />
                                            )}
                                        </div>
                                    ) : null}
                                </HiddenElement>
                                {(!!movement.product || !read?.product) && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                        <IconPackage className="w-3.5 h-3.5 shrink-0" />
                                        <HiddenElement randomLength={read?.product?.keys?.title ? 0 : 8}>
                                            {!!read?.product?.keys?.title && movement.product?.title ? (
                                                <span className="truncate">{movement.product.title}</span>
                                            ) : null}
                                        </HiddenElement>
                                    </div>
                                )}
                                {(!!movement.warehouse || !read?.warehouse) && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                        <IconBuildingWarehouse className="w-3.5 h-3.5 shrink-0" />
                                        <HiddenElement randomLength={read?.warehouse ? 0 : 8}>
                                            {!!read?.warehouse ? (
                                                <span className="truncate">
                                                    {read?.warehouse?.keys?.name ? movement.warehouse?.name ?? "" : ""}
                                                    {read?.warehouse?.keys?.code && movement.warehouse?.code
                                                        ? ` (${movement.warehouse.code})`
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
                                <HiddenElement randomLength={read?.quantity ? 0 : 4}>
                                    {!!read?.quantity ? (
                                        <div className={cn("font-bold text-sm", isPositive ? "text-success" : "text-warning")}>
                                            {isPositive ? `+${qty}` : qty}
                                        </div>
                                    ) : null}
                                </HiddenElement>
                            </div>
                            <div>
                                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                    {resolveLanguageKey("beforeAfter")}
                                </div>
                                <div className="font-bold text-sm tabular-nums inline-flex items-center justify-center gap-0.5 w-full">
                                    <HiddenElement randomLength={read?.quantityBefore ? 0 : 4}>
                                        {!!read?.quantityBefore ? (movement.quantityBefore ?? 0) : null}
                                    </HiddenElement>
                                    <span aria-hidden>→</span>
                                    <HiddenElement randomLength={read?.quantityAfter ? 0 : 4}>
                                        {!!read?.quantityAfter ? (movement.quantityAfter ?? 0) : null}
                                    </HiddenElement>
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                    {resolveLanguageKey("receipt")}
                                </div>
                                <HiddenElement randomLength={read?.receiptNumber ? 0 : 6}>
                                    {!!read?.receiptNumber ? (
                                        <div className="font-bold text-sm truncate">
                                            {movement.receiptNumber || "—"}
                                        </div>
                                    ) : null}
                                </HiddenElement>
                            </div>
                        </div>

                        <div className="mt-2 text-[11px] text-muted-foreground truncate flex items-center gap-1">
                            <HiddenElement randomLength={read?.manufacturer ? 0 : 8}>
                                {!!read?.manufacturer && movement.manufacturer ? (
                                    <span>{movement.manufacturer}</span>
                                ) : null}
                            </HiddenElement>
                            {!!read?.manufacturer && movement.manufacturer && !!read?.occurredAt && movement.occurredAt ? (
                                <span aria-hidden>·</span>
                            ) : null}
                            <HiddenElement randomLength={read?.occurredAt ? 0 : 10}>
                                {!!read?.occurredAt && movement.occurredAt ? (
                                    <span>{new Date(movement.occurredAt).toLocaleString()}</span>
                                ) : null}
                            </HiddenElement>
                        </div>
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
