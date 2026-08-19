import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {compose} from "redux";
import {toast} from "sonner";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {Inventory} from "armonia/src/modules/eCommerce/api/eCommerce/private/inventory/inventory.dto.ts";
import type {InventoryMovement} from "armonia/src/modules/eCommerce/api/eCommerce/private/inventoryMovement/inventoryMovement.dto.ts";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@coreModule/components/ui/dialog.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import Loader from "@coreModule/components/custom/loader.tsx";
import {SheetListPaginationFooter} from "@coreModule/components/viewEngine/sheetListPagination.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import {buildFilterGroup, buildFilterRule} from "@coreModule/helpers/filter/filterUrl.ts";
import TooltipDisplayer from "@coreModule/components/custom/tooltipDisplayer.tsx";
import {IconInfoCircle} from "@tabler/icons-react";

const PAGE_SIZE = 10;

type Props = WithLanguageType & {
    open: boolean;
    onClose: () => void;
    inventory: Inventory;
};

function formatWhen(value?: string | Date): string {
    if (!value) return "";
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString();
}

function formatDate(value?: string | Date): string {
    if (!value) return "";
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString();
}

function performerName(movement: InventoryMovement): string {
    const p = movement.performedBy;
    if (!p) return "";
    return [p.name, p.surname].filter(Boolean).join(" ");
}

function variantLabel(movement: InventoryMovement): string {
    const v = movement.variant;
    if (!v) return "";
    const attrs = v.attributeCombination
        ?.map((a) => {
            const name = a.attribute?.name;
            return name ? `${name}: ${a.value}` : a.value;
        })
        .filter(Boolean)
        .join(", ");
    return [v.sku, attrs].filter(Boolean).join(" · ");
}

function DetailCell({label, value}: {label: string; value?: string | number | null}) {
    if (value === undefined || value === null || value === "") return null;
    return (
        <div className="min-w-0">
            <dt className="text-3xs uppercase tracking-wide text-muted-foreground">{label}</dt>
            <dd className="truncate text-xs leading-snug text-foreground">{value}</dd>
        </div>
    );
}

function ReferenceCell({
    label,
    referenceType,
    referenceId,
}: {
    label: string;
    referenceType?: string;
    referenceId?: string;
}) {
    if (!referenceType && !referenceId) return null;
    return (
        <div className="min-w-0">
            <dt className="text-3xs uppercase tracking-wide text-muted-foreground">{label}</dt>
            <dd className="flex min-w-0 items-center gap-1 text-xs leading-snug text-foreground">
                {referenceType ? <span className="truncate">{referenceType}</span> : null}
                {referenceId ? (
                    <TooltipDisplayer tooltip={referenceId} side="top">
                        <button
                            type="button"
                            className="inline-flex shrink-0 rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            aria-label={referenceId}
                            onClick={(e) => e.preventDefault()}
                        >
                            <IconInfoCircle className="size-3.5" />
                        </button>
                    </TooltipDisplayer>
                ) : null}
            </dd>
        </div>
    );
}

function ViewInventoryMovementsDialog({
    open,
    onClose,
    inventory,
    resolveLanguageKey,
}: Props) {
    const rk = (key: string) => String(resolveLanguageKey(key) ?? key);
    const resolveLanguageKeyRef = useRef(resolveLanguageKey);
    resolveLanguageKeyRef.current = resolveLanguageKey;

    const [movements, setMovements] = useState<InventoryMovement[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const hasLoadedOnce = useRef(false);

    const totalPages = total === 0 ? 0 : Math.ceil(total / PAGE_SIZE);
    const rangeLabel =
        total === 0
            ? ""
            : (() => {
                  const start = (page - 1) * PAGE_SIZE + 1;
                  const end = Math.min(page * PAGE_SIZE, total);
                  return start === end ? `${start} / ${total}` : `${start}–${end} / ${total}`;
              })();

    const loadMovements = useCallback(
        async (pageNum: number, signal?: AbortSignal) => {
            setLoading(true);
            try {
                const res = await apiClient.post<{data: InventoryMovement[]; total: number}>(
                    "/api/eCommerce/inventoryMovement",
                    {
                        offset: (pageNum - 1) * PAGE_SIZE,
                        limit: PAGE_SIZE,
                        filter: buildFilterGroup([
                            buildFilterRule("inventory", "equals", inventory._id),
                        ]),
                    },
                    signal ? {signal} : undefined,
                );
                setMovements(res.data.data ?? []);
                setTotal(res.data.total ?? 0);
                hasLoadedOnce.current = true;
            } catch (error) {
                const isCanceled =
                    signal?.aborted || (error as {code?: string})?.code === "ERR_CANCELED";
                if (isCanceled) return;
                toast.error(String(resolveLanguageKeyRef.current("loadError") ?? "loadError"));
                if (!hasLoadedOnce.current) {
                    setMovements([]);
                    setTotal(0);
                }
            } finally {
                setLoading(false);
            }
        },
        [inventory._id],
    );

    useEffect(() => {
        if (!open) {
            setPage(1);
            setMovements([]);
            setTotal(0);
            hasLoadedOnce.current = false;
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;
        setPage(1);
    }, [inventory._id, open]);

    useEffect(() => {
        if (!open) return;
        const controller = new AbortController();
        void loadMovements(page, controller.signal);
        return () => controller.abort();
    }, [open, inventory._id, page, loadMovements]);

    const productTitle = inventory.product?.title;
    const warehouseLabel = inventory.warehouse
        ? `${inventory.warehouse.name}${inventory.warehouse.code ? ` (${inventory.warehouse.code})` : ""}`
        : "";

    const showInitialLoader = loading && !hasLoadedOnce.current;
    const showEmpty = !loading && movements.length === 0;

    const inventoryContext = useMemo(
        () => [productTitle, warehouseLabel].filter(Boolean).join(" · "),
        [productTitle, warehouseLabel],
    );

    return (
        <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
            <DialogContent className="sm:min-w-2xl sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{rk("title")}</DialogTitle>
                    <DialogDescription>
                        {inventoryContext || rk("description")}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-2">
                    <Label>{rk("movementsLabel")}</Label>
                    {showInitialLoader ? (
                        <Loader />
                    ) : showEmpty ? (
                        <p className="py-4 text-center text-sm text-muted-foreground">{rk("noMovements")}</p>
                    ) : (
                        <>
                            <ul
                                className={cn(
                                    "flex flex-col max-h-[28rem] gap-y-2 overflow-y-auto transition-opacity",
                                    loading && "pointer-events-none opacity-50",
                                )}
                            >
                                {movements.map((movement) => {
                                    const qty = Number(movement.quantity ?? 0);
                                    const qtyClass =
                                        qty > 0
                                            ? "text-success"
                                            : qty < 0
                                              ? "text-destructive"
                                              : "text-muted-foreground";
                                    const reasonLabel = String(
                                        resolveLanguageKey(`reasons.${movement.reason}`) ??
                                            movement.reason,
                                    );
                                    const when = formatWhen(
                                        movement.occurredAt ?? movement.createdAt,
                                    );
                                    const by = performerName(movement);
                                    const receiptCount = movement.receipts?.length ?? 0;
                                    const subtitle = [when, by].filter(Boolean).join(" · ");

                                    return (
                                        <li
                                            key={movement._id}
                                            className="rounded-md border px-3 py-2"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-medium capitalize">
                                                        {reasonLabel}
                                                    </p>
                                                    {subtitle && (
                                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                                            {subtitle}
                                                        </p>
                                                    )}
                                                </div>
                                                <span
                                                    className={cn(
                                                        "shrink-0 text-sm font-semibold tabular-nums",
                                                        qtyClass,
                                                    )}
                                                >
                                                    {qty > 0 ? `+${qty}` : qty}
                                                </span>
                                            </div>

                                            <dl className="mt-2 grid grid-cols-1 gap-x-3 gap-y-1.5 sm:grid-cols-3">
                                                <DetailCell
                                                    label={rk("beforeAfter")}
                                                    value={`${movement.quantityBefore} → ${movement.quantityAfter}`}
                                                />
                                                <ReferenceCell
                                                    label={rk("reference")}
                                                    referenceType={movement.referenceType}
                                                    referenceId={movement.referenceId}
                                                />
                                                <DetailCell
                                                    label={rk("createdAt")}
                                                    value={
                                                        movement.createdAt
                                                            ? formatWhen(movement.createdAt)
                                                            : undefined
                                                    }
                                                />
                                            </dl>

                                            <dl className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1.5">
                                                <DetailCell
                                                    label={rk("variant")}
                                                    value={variantLabel(movement)}
                                                />
                                                <DetailCell
                                                    label={rk("manufacturer")}
                                                    value={movement.manufacturer}
                                                />
                                                <DetailCell
                                                    label={rk("receiptNumber")}
                                                    value={movement.receiptNumber}
                                                />
                                                <DetailCell
                                                    label={rk("unitCost")}
                                                    value={
                                                        movement.unitCost != null
                                                            ? String(movement.unitCost)
                                                            : undefined
                                                    }
                                                />
                                                <DetailCell
                                                    label={rk("batchLot")}
                                                    value={movement.batchLot}
                                                />
                                                <DetailCell
                                                    label={rk("expiryDate")}
                                                    value={formatDate(movement.expiryDate)}
                                                />
                                                <DetailCell
                                                    label={rk("receipts")}
                                                    value={
                                                        receiptCount > 0
                                                            ? rk("receiptsCount").replace(
                                                                  "{count}",
                                                                  String(receiptCount),
                                                              )
                                                            : undefined
                                                    }
                                                />
                                            </dl>

                                            {movement.note && (
                                                <p className="mt-2 line-clamp-2 border-t border-border/60 pt-1.5 text-xs text-foreground/80">
                                                    <span className="text-muted-foreground">
                                                        {rk("note")}:{" "}
                                                    </span>
                                                    {movement.note}
                                                </p>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                            <SheetListPaginationFooter
                                rangeLabel={rangeLabel}
                                pageIndex={page - 1}
                                totalPages={totalPages}
                                onPrevious={() => setPage((p) => Math.max(1, p - 1))}
                                onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
                                resolveLanguageKey={resolveLanguageKey}
                            />
                        </>
                    )}
                </div>

                <DialogFooter className="gap-2 px-4 py-4 sm:gap-2">
                    <Button type="button" variant="outline" onClick={onClose}>
                        {rk("close")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default compose(
    withLanguage(
        "src/modules/eCommerce/clients/panel/private/inventories/center/dialogs/viewInventoryMovementsDialog.tsx",
    ),
    withDebug(true, true, "inventories"),
)(ViewInventoryMovementsDialog);
