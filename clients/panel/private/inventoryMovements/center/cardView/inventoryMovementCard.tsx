import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {InventoryMovement} from "armonia/src/modules/eCommerce/api/eCommerce/private/inventoryMovement/inventoryMovement.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {IconBuildingWarehouse, IconCalendarEvent} from "@tabler/icons-react";
import InventoryMovementSheetView from "@eCommerceModule/clients/panel/private/inventoryMovements/center/sheetView/inventoryMovementSheetView.tsx";
import {accessFieldPathExists} from "@coreModule/helpers/context/accessContext.tsx";
import DisplayValue from "@coreModule/components/viewEngine/widgets/display/displayValue.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
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
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
            titlePath="reason"
            innerRef={innerRef}
            sheetProps={() => ({fetchId})}
        >
            {({entity: row, read}) => {
                const canReadQty = accessFieldPathExists(read, "quantity");
                const qty = canReadQty ? row.quantity ?? 0 : 0;
                const isPositive = qty > 0;
                return (
                    <>
                        <EntityCard.Header
                            titlePath="product.title"
                            title={[row.product?.title, String(resolveLanguageKey(`reasons.${row.reason}`))].filter(Boolean).join(" · ")}
                        />
                        {/* Where → when → how many (UX-02); receipt, manufacturer and lot stay on the sheet. */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <IconBuildingWarehouse className="h-3.5 w-3.5 shrink-0" />
                                <DisplayValue path="warehouse.name" value={row.warehouse?.name} />
                            </div>
                            {row.occurredAt ? (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <IconCalendarEvent className="h-3.5 w-3.5 shrink-0" />
                                    <DisplayValue path="occurredAt" type="dateTime" value={row.occurredAt} />
                                </div>
                            ) : null}
                            <div className="mt-1 grid grid-cols-2 gap-2 text-center">
                                <div>
                                    <div className="text-3xs uppercase tracking-wide text-muted-foreground">
                                        {resolveLanguageKey("quantity")}
                                    </div>
                                    <div className={cn("text-sm font-bold", canReadQty && (isPositive ? "text-success" : "text-warning"))}>
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
    withDebug(true, true, "inventoryMovements"),
)(InventoryMovementCard);
