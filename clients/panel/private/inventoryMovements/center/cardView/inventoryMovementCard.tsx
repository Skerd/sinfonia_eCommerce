import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {InventoryMovement} from "armonia/src/modules/eCommerce/api/eCommerce/private/inventoryMovement/inventoryMovement.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {IconBuildingWarehouse, IconPackage} from "@tabler/icons-react";
import InventoryMovementSheetView from "@eCommerceModule/clients/panel/private/inventoryMovements/center/sheetView/inventoryMovementSheetView.tsx";
import DisplayValue from "@coreModule/components/custom/displayValue/displayValue.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

type InventoryMovementCardProps = WithLanguageType & {
    movement: InventoryMovement;
    fetchId?: string;
    onDelete?: (deleted?: InventoryMovement, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<InventoryMovement> | null>;
};

function InventoryMovementCard({
    movement,
    resolveLanguageKey,
    fetchId,
    onDelete,
    onRestore,
    hideActions = false,
    sheetOnly = false,
    innerRef,
}: InventoryMovementCardProps) {
    return (
        <EntityCard
            resource="inventoryMovements"
            entity={movement}
            fetchId={fetchId}
            singleUrl="/api/eCommerce/inventoryMovement/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            hideEdit
            hideDelete
            hideRestore
            sheetOnly={sheetOnly}
            editPath={() => ""}
            Sheet={InventoryMovementSheetView}
            sheetEntityProp="movement"
            deleteUrl=""
            restoreUrl=""
            failedTitle=""
            failedDescription=""
            titlePath="reason"
            innerRef={innerRef}
            sheetProps={() => ({fetchId})}
        >
            {({entity: row}) => {
                const qty = row.quantity ?? 0;
                const isPositive = qty > 0;
                return (
                    <>
                        <EntityCard.Header
                            titlePath="reason"
                            title={
                                <DisplayValue
                                    path="reason"
                                    type="enum"
                                    languageKeyCategory="reasons"
                                    value={row.reason}
                                />
                            }
                        />
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <IconPackage className="h-3.5 w-3.5 shrink-0" />
                                <DisplayValue path="product.title" value={row.product?.title} />
                            </div>
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
                                        {resolveLanguageKey("quantity")}
                                    </div>
                                    <div className={cn("text-sm font-bold", isPositive ? "text-success" : "text-warning")}>
                                        <DisplayValue path="quantity" value={isPositive ? `+${qty}` : qty} />
                                    </div>
                                </div>
                                <div>
                                    <div className="text-3xs uppercase tracking-wide text-muted-foreground">
                                        {resolveLanguageKey("beforeAfter")}
                                    </div>
                                    <div className="inline-flex w-full items-center justify-center gap-0.5 text-sm font-bold tabular-nums">
                                        <DisplayValue path="quantityBefore" type="number" value={row.quantityBefore ?? 0} />
                                        <span aria-hidden>→</span>
                                        <DisplayValue path="quantityAfter" type="number" value={row.quantityAfter ?? 0} />
                                    </div>
                                </div>
                                <div>
                                    <div className="text-3xs uppercase tracking-wide text-muted-foreground">
                                        {resolveLanguageKey("receipt")}
                                    </div>
                                    <div className="truncate text-sm font-bold">
                                        <DisplayValue path="receiptNumber" value={row.receiptNumber || "—"} />
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 truncate text-2xs text-muted-foreground">
                                <DisplayValue path="manufacturer" value={row.manufacturer} />
                                {row.manufacturer && row.occurredAt ? <span aria-hidden>·</span> : null}
                                <DisplayValue path="occurredAt" type="dateTime" value={row.occurredAt} />
                            </div>
                        </div>
                    </>
                );
            }}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/inventoryMovements/center/cardView/inventoryMovementCard.tsx"),
    withDebug(true, true),
)(InventoryMovementCard);
