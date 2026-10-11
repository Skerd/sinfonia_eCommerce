import {useMemo, useState} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {Inventory} from "armonia/src/modules/eCommerce/api/eCommerce/private/inventory/inventory.dto.ts";
import type {InventoryMovement} from "armonia/src/modules/eCommerce/api/eCommerce/private/inventoryMovement/inventoryMovement.dto.ts";
import type {TableForm, TableResponse} from "armonia/src/modules/core/types/shared.types.ts";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@coreModule/components/ui/dialog.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import SimpleError from "@coreModule/components/custom/errors/errorViewWrapper.tsx";
import InfiniteList from "@coreModule/components/custom/infiniteList";
import {cn} from "@coreModule/components/lib/utils.ts";
import DisplayValue from "@coreModule/components/viewEngine/widgets/display/displayValue.tsx";
import InventoryMovementSheetView from "@eCommerceModule/clients/panel/private/inventoryMovements/center/sheetView/inventoryMovementSheetView.tsx";
import {IconHistory} from "@tabler/icons-react";

const PAGE_SIZE = 8;

type ListPayload = TableForm;

type Props = WithLanguageType &
    WithAxiosType<TableResponse<InventoryMovement>, ListPayload> & {
        open: boolean;
        onClose: () => void;
        inventory: Inventory;
    };

function ViewInventoryMovementsDialog({
    open,
    onClose,
    inventory,
    resolveLanguageKey,
    onFilterChange,
    data,
    loading,
    error,
}: Props) {
    const [selectedMovement, setSelectedMovement] = useState<InventoryMovement | null>(null);
    const displayName = [inventory.product?.title, inventory.warehouse?.name].filter(Boolean).join(" · ");

    const extraParams = useMemo(
        () => ({
            sortBy: "occurredAt",
            sortOrder: "desc" as const,
            filter: {
                id: `inv-movements-${inventory._id}`,
                operator: "and" as const,
                rules: [
                    {
                        id: `inv-movements-rule-${inventory._id}`,
                        field: "inventory",
                        operator: "equals" as const,
                        value: inventory._id,
                    },
                ],
                groups: [] as [],
            },
        }),
        [inventory._id],
    );

    return (
        <>
            <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
                <DialogContent className="sm:min-w-2xl sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{resolveLanguageKey("title")}</DialogTitle>
                        <DialogDescription>
                            {displayName
                                ? `${String(resolveLanguageKey("description"))} — ${displayName}`
                                : resolveLanguageKey("description")}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="px-4">
                        <InfiniteList<InventoryMovement>
                            data={data}
                            loading={loading}
                            error={error}
                            onFilterChange={onFilterChange}
                            limit={PAGE_SIZE}
                            extraParams={extraParams}
                            className="flex flex-col gap-y-2"
                            scrollRootClassName="max-h-[28rem] min-h-[12rem] overflow-y-auto"
                            renderItem={(movement) => {
                                const qty = movement.quantity ?? 0;
                                return (
                                    <button
                                        type="button"
                                        className="flex w-full min-w-0 items-start gap-3 rounded-md border px-3 py-2 text-left hover:bg-muted/40"
                                        onClick={() => setSelectedMovement(movement)}
                                    >
                                        <IconHistory
                                            size={18}
                                            className="mt-0.5 shrink-0 text-muted-foreground"
                                        />
                                        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                                            <div className="flex min-w-0 items-baseline justify-between gap-2">
                                                <span className="truncate text-sm font-medium">
                                                    <DisplayValue
                                                        resource="inventoryMovements"
                                                        path="reason"
                                                        type="enum"
                                                        languageKeyCategory="reasons"
                                                        value={movement.reason}
                                                    />
                                                </span>
                                                <span
                                                    className={cn(
                                                        "shrink-0 text-sm font-semibold tabular-nums",
                                                        qty > 0
                                                            ? "text-success"
                                                            : qty < 0
                                                              ? "text-destructive"
                                                              : "text-muted-foreground",
                                                    )}
                                                >
                                                    {qty > 0 ? `+${qty}` : String(qty)}
                                                </span>
                                            </div>
                                            <p className="truncate text-xs text-muted-foreground">
                                                <DisplayValue
                                                    resource="inventoryMovements"
                                                    path="occurredAt"
                                                    type="dateTime"
                                                    value={movement.occurredAt}
                                                />
                                                {" · "}
                                                {movement.quantityBefore} → {movement.quantityAfter}
                                                {movement.receiptNumber
                                                    ? ` · ${movement.receiptNumber}`
                                                    : null}
                                            </p>
                                        </div>
                                    </button>
                                );
                            }}
                            renderError={({onRetry}) => (
                                <SimpleError
                                    title={resolveLanguageKey("failTitle")}
                                    description={resolveLanguageKey("failDescription")}
                                    onClick={onRetry}
                                    error={error ?? undefined}
                                />
                            )}
                            renderNoData={() => (
                                <p className="py-8 text-center text-sm text-muted-foreground">
                                    {resolveLanguageKey("empty")}
                                </p>
                            )}
                        />
                    </div>

                    <DialogFooter className="gap-2 px-4 py-4 sm:gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            {resolveLanguageKey("close")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {selectedMovement ? (
                <InventoryMovementSheetView
                    open
                    onOpenChange={(next: boolean) => {
                        if (!next) setSelectedMovement(null);
                    }}
                    movement={selectedMovement}
                    fetchId={selectedMovement._id}
                    hideActions
                />
            ) : null}
        </>
    );
}

export default compose(
    withLanguage(
        "src/modules/eCommerce/clients/panel/private/inventories/center/dialogs/viewInventoryMovementsDialog.tsx",
    ),
    withAxios<TableResponse<InventoryMovement>, ListPayload>(
        {url: "/api/eCommerce/inventoryMovement", method: "POST", data: {}},
        true,
    ),
    withDebug(true, true, ["inventories", "inventoryMovements"]),
)(ViewInventoryMovementsDialog);
