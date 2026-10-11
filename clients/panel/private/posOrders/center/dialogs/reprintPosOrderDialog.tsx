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
import {
    PosReceiptPreview,
    PosReceiptPrintRoot,
} from "@eCommerceModule/clients/panel/private/pos/PosReceiptTicket.tsx";

type PostPayload = {_id: string};
type ReprintResponse = {order: PosOrder; receipt: ReceiptPayload};
/** Maestro wraps the handler return as `{ data: ReprintResponse }`. */
type ReprintAxiosBody = {data: ReprintResponse};

type Props = WithLanguageType &
    WithAxiosType<ReprintAxiosBody, PostPayload> & {
        open: boolean;
        onClose: () => void;
        entity: Pick<PosOrder, "_id" | "name">;
    };

function money(n: number | undefined | null): string {
    return formatMoney(Number(n) || 0);
}

function normalizeReceipt(raw: ReceiptPayload | undefined | null): ReceiptPayload | null {
    if (!raw || typeof raw !== "object") return null;
    return {
        ...raw,
        lines: Array.isArray(raw.lines) ? raw.lines : [],
        payments: Array.isArray(raw.payments) ? raw.payments : [],
    };
}

function receiptFromAxiosBody(payload: unknown): ReceiptPayload | null {
    if (!payload || typeof payload !== "object") return null;
    const root = payload as {receipt?: ReceiptPayload; data?: {receipt?: ReceiptPayload}};
    return normalizeReceipt(root.receipt ?? root.data?.receipt);
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
        success: (response: ReprintAxiosBody) => {
            setReceipt(receiptFromAxiosBody(response));
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
        const next = receiptFromAxiosBody(data);
        if (!next) return;
        setReceipt(next);
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

                        {displayReceipt ? (
                            <PosReceiptPreview
                                receipt={displayReceipt}
                                money={money}
                                rk={rk}
                                shopFallback={rk("fallbackShop")}
                            />
                        ) : null}
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

            {displayReceipt ? (
                <PosReceiptPrintRoot
                    receipt={displayReceipt}
                    money={money}
                    rk={rk}
                    shopFallback={rk("fallbackShop")}
                    rootId="pos-order-receipt-print-root"
                    innerId="pos-order-receipt-print"
                />
            ) : null}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/posOrders/center/dialogs/reprintPosOrderDialog.tsx"),
    withAxios<ReprintAxiosBody, PostPayload>(
        {url: "/api/eCommerce/posOrder/reprint", method: "POST", data: {}},
        true,
    ),
    withDebug(true, true, "posOrders"),
)(ReprintPosOrderDialog);
