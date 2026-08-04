import {useEffect, useImperativeHandle, useState} from "react";
import {compose} from "redux";
import {LoaderCircle, Printer} from "lucide-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@coreModule/components/ui/dialog.tsx";
import type {PosOrder} from "armonia/src/modules/eCommerce/api/eCommerce/private/posOrder/posOrder.dto.ts";
import type {ReceiptPayload} from "@eCommerceModule/clients/panel/private/pos/posTypes.ts";
import {formatMoney} from "@eCommerceModule/clients/panel/private/pos/posTypes.ts";

type PostPayload = {_id: string};
type ReprintResponse = {order: PosOrder; receipt: ReceiptPayload};

type Props = WithLanguageType &
    WithAxiosType<ReprintResponse, PostPayload> & {
        open: boolean;
        onClose: () => void;
        entity: Pick<PosOrder, "_id" | "name">;
    };

function money(n: number | undefined | null): string {
    return formatMoney(Number(n) || 0);
}

function ReprintPosOrderDialog({
    open,
    onClose,
    entity,
    resolveLanguageKey,
    onFilterChange,
    innerRef,
    loading,
    data,
    error,
}: Props) {
    const [receipt, setReceipt] = useState<ReceiptPayload | null>(null);

    useImperativeHandle(innerRef, () => ({
        success: (response: ReprintResponse) => {
            const next = response?.receipt ?? null;
            setReceipt(
                next
                    ? {
                          ...next,
                          lines: Array.isArray(next.lines) ? next.lines : [],
                          payments: Array.isArray(next.payments) ? next.payments : [],
                      }
                    : null,
            );
        },
        error: () => {
            setReceipt(null);
        },
    }));

    useEffect(() => {
        if (!open) {
            setReceipt(null);
            return;
        }
        onFilterChange({_id: entity._id});
        // eslint-disable-next-line react-hooks/exhaustive-deps -- load once when dialog opens
    }, [open, entity._id]);

    useEffect(() => {
        if (!data?.receipt) return;
        setReceipt({
            ...data.receipt,
            lines: Array.isArray(data.receipt.lines) ? data.receipt.lines : [],
            payments: Array.isArray(data.receipt.payments) ? data.receipt.payments : [],
        });
    }, [data]);

    const rk = (key: string) => String(resolveLanguageKey(key) ?? key);
    const displayReceipt = receipt;
    const loadFailed = !!error && !loading && !displayReceipt;

    return (
        <>
            <Dialog open={open} onOpenChange={(next) => !loading && !next && onClose()}>
                <DialogContent className="sm:max-w-md print:hidden" onOpenAutoFocus={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>
                            {rk("title")}
                            {entity.name ? ` — ${entity.name}` : ""}
                        </DialogTitle>
                        <DialogDescription>{rk("description")}</DialogDescription>
                    </DialogHeader>

                    <div className="max-h-[60vh] overflow-y-auto px-1 py-2">
                        {loading && !displayReceipt && (
                            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                                <LoaderCircle className="size-4 animate-spin" />
                                {rk("loading")}
                            </div>
                        )}

                        {loadFailed && (
                            <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-3 text-sm text-destructive">
                                {rk("errors.loadFailed")}
                            </div>
                        )}

                        {displayReceipt && (
                            <div className="mx-auto w-full max-w-[80mm] overflow-hidden rounded-md border border-border bg-white text-black shadow-sm">
                                <div className="px-3 py-3 font-mono text-2xs leading-snug">
                                    <div className="flex flex-col gap-y-1 text-center">
                                        <div className="text-base font-bold uppercase tracking-wide">
                                            {displayReceipt.companyName ||
                                                displayReceipt.shopName ||
                                                rk("fallbackShop")}
                                        </div>
                                        {displayReceipt.header ? (
                                            <div className="whitespace-pre-wrap text-3xs text-foreground">
                                                {displayReceipt.header}
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="my-2 border-t border-dashed border-border" />

                                    <div className="flex flex-col gap-y-0.5 text-3xs">
                                        <div className="flex justify-between gap-2">
                                            <span>{rk("order")}</span>
                                            <span className="tabular-nums">{displayReceipt.orderName}</span>
                                        </div>
                                        {displayReceipt.productOrderNumber ? (
                                            <div className="flex justify-between gap-2">
                                                <span>{rk("ref")}</span>
                                                <span className="tabular-nums">
                                                    {displayReceipt.productOrderNumber}
                                                </span>
                                            </div>
                                        ) : null}
                                        <div className="flex justify-between gap-2">
                                            <span>{rk("date")}</span>
                                            <span className="tabular-nums">
                                                {displayReceipt.paidAt
                                                    ? new Date(displayReceipt.paidAt).toLocaleString()
                                                    : new Date().toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between gap-2">
                                            <span>{rk("customer")}</span>
                                            <span className="truncate text-right">
                                                {displayReceipt.customerName || rk("walkIn")}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="my-2 border-t border-dashed border-border" />

                                    <div className="flex flex-col gap-y-1">
                                        {displayReceipt.lines.map((line, idx) => (
                                            <div key={idx} className="flex justify-between gap-2">
                                                <span className="min-w-0 flex-1 break-words">
                                                    {line.quantity}× {line.productName}
                                                    {line.discountPercent > 0
                                                        ? ` (-${line.discountPercent}%)`
                                                        : ""}
                                                </span>
                                                <span className="shrink-0 tabular-nums">
                                                    {money(line.priceTotal)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="my-2 border-t border-dashed border-border" />

                                    <div className="flex flex-col gap-y-0.5 tabular-nums">
                                        {(displayReceipt.discountTotal ?? 0) > 0 && (
                                            <div className="flex justify-between gap-2">
                                                <span>{rk("discount")}</span>
                                                <span>-{money(displayReceipt.discountTotal)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between gap-2 text-sm font-bold">
                                            <span>{rk("total")}</span>
                                            <span>{money(displayReceipt.amountTotal)}</span>
                                        </div>
                                        {displayReceipt.payments.map((p, idx) => (
                                            <div key={idx} className="flex justify-between gap-2 text-3xs">
                                                <span className="min-w-0 flex-1 truncate">{p.method}</span>
                                                <span className="shrink-0">{money(p.amount)}</span>
                                            </div>
                                        ))}
                                        {(displayReceipt.amountReturn ?? 0) > 0 && (
                                            <div className="flex justify-between gap-2 font-semibold">
                                                <span>{rk("change")}</span>
                                                <span>{money(displayReceipt.amountReturn)}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="my-2 border-t border-dashed border-border" />
                                    <div className="text-center text-3xs text-muted-foreground">
                                        {displayReceipt.footer || rk("defaultFooter")}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2 px-4 py-4 sm:gap-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            {rk("cancel")}
                        </Button>
                        <Button
                            type="button"
                            disabled={loading || !displayReceipt}
                            onClick={() => window.print()}
                        >
                            {loading ? (
                                <LoaderCircle className="size-4 animate-spin" />
                            ) : (
                                <Printer className="size-4" />
                            )}
                            {rk("confirm")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {displayReceipt && (
                <div id="pos-order-receipt-print-root" aria-hidden className="hidden">
                    <div id="pos-order-receipt-print" className="pos-receipt-ticket">
                        <div className="pos-receipt-header">
                            <div className="company">
                                {displayReceipt.companyName || displayReceipt.shopName || rk("fallbackShop")}
                            </div>
                            {displayReceipt.header ? (
                                <div className="header-text">{displayReceipt.header}</div>
                            ) : null}
                        </div>
                        <div className="rule" />
                        <div className="meta">
                            <div>
                                <span>{rk("order")}</span>
                                <span>{displayReceipt.orderName}</span>
                            </div>
                            {displayReceipt.productOrderNumber ? (
                                <div>
                                    <span>{rk("ref")}</span>
                                    <span>{displayReceipt.productOrderNumber}</span>
                                </div>
                            ) : null}
                            <div>
                                <span>{rk("date")}</span>
                                <span>
                                    {displayReceipt.paidAt
                                        ? new Date(displayReceipt.paidAt).toLocaleString()
                                        : new Date().toLocaleString()}
                                </span>
                            </div>
                            <div>
                                <span>{rk("customer")}</span>
                                <span>{displayReceipt.customerName || rk("walkIn")}</span>
                            </div>
                        </div>
                        <div className="rule" />
                        <div className="lines">
                            {displayReceipt.lines.map((line, idx) => (
                                <div key={idx} className="line">
                                    <div className="row">
                                        <span>
                                            {line.quantity}× {line.productName}
                                            {line.discountPercent > 0 ? ` (-${line.discountPercent}%)` : ""}
                                        </span>
                                        <span>{money(line.priceTotal)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="rule" />
                        <div className="totals">
                            {(displayReceipt.discountTotal ?? 0) > 0 && (
                                <div className="row">
                                    <span>{rk("discount")}</span>
                                    <span>-{money(displayReceipt.discountTotal)}</span>
                                </div>
                            )}
                            <div className="row total">
                                <span>{rk("total")}</span>
                                <span>{money(displayReceipt.amountTotal)}</span>
                            </div>
                            {displayReceipt.payments.map((p, idx) => (
                                <div key={idx} className="row pay">
                                    <span>{p.method}</span>
                                    <span>{money(p.amount)}</span>
                                </div>
                            ))}
                            {(displayReceipt.amountReturn ?? 0) > 0 && (
                                <div className="row">
                                    <span>{rk("change")}</span>
                                    <span>{money(displayReceipt.amountReturn)}</span>
                                </div>
                            )}
                        </div>
                        <div className="rule" />
                        <div className="pos-receipt-footer">
                            {displayReceipt.footer || rk("defaultFooter")}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @media print {
                    @page { size: 80mm auto; margin: 0; }
                    html, body {
                        width: 80mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #fff !important;
                    }
                    body * { visibility: hidden !important; }
                    #pos-order-receipt-print-root,
                    #pos-order-receipt-print-root * { visibility: visible !important; }
                    #pos-order-receipt-print-root {
                        display: block !important;
                        position: fixed !important;
                        inset: 0 auto auto 0 !important;
                        width: 80mm !important;
                        max-width: 80mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #fff !important;
                        color: #000 !important;
                        z-index: 99999 !important;
                    }
                    #pos-order-receipt-print {
                        width: 76mm !important;
                        max-width: 76mm !important;
                        margin: 0 auto !important;
                        padding: 2mm 2mm 4mm !important;
                        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
                        font-size: 11px !important;
                        line-height: 1.3 !important;
                        color: #000 !important;
                        background: #fff !important;
                    }
                    #pos-order-receipt-print .company {
                        font-size: 15px !important;
                        font-weight: 700 !important;
                        text-align: center !important;
                        text-transform: uppercase !important;
                    }
                    #pos-order-receipt-print .header-text,
                    #pos-order-receipt-print .pos-receipt-footer {
                        text-align: center !important;
                        white-space: pre-wrap !important;
                        font-size: 10px !important;
                    }
                    #pos-order-receipt-print .rule {
                        border-top: 1px dashed #000 !important;
                        margin: 6px 0 !important;
                    }
                    #pos-order-receipt-print .meta > div,
                    #pos-order-receipt-print .row {
                        display: flex !important;
                        justify-content: space-between !important;
                        gap: 6px !important;
                    }
                    #pos-order-receipt-print .meta { font-size: 10px !important; }
                    #pos-order-receipt-print .line { margin-bottom: 4px !important; }
                    #pos-order-receipt-print .total { font-size: 13px !important; font-weight: 700 !important; }
                    #pos-order-receipt-print .pay { font-size: 10px !important; }
                }
            `}</style>
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/posOrders/center/dialogs/reprintPosOrderDialog.tsx"),
    withAxios<ReprintResponse, PostPayload>(
        {url: "/api/eCommerce/pos/reprint", method: "POST", data: {}},
        true,
    ),
    withDebug(true, true),
)(ReprintPosOrderDialog);
