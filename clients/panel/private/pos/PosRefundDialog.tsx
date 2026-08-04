import {useEffect, useMemo, useState} from "react";
import {Minus, Plus} from "lucide-react";
import {toast} from "sonner";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@coreModule/components/ui/dialog.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {PosOrder, PosOrderLine} from "armonia/src/modules/eCommerce/api/eCommerce/private/posOrder/posOrder.dto.ts";

type Props = {
    open: boolean;
    order: PosOrder | null;
    onOpenChange: (open: boolean) => void;
    onRefunded: () => void;
    money: (n: number) => string;
    rk: (key: string) => string;
    requirePin: boolean;
    /** Shared manager-picker + PIN flow from the till host. */
    requestManagerAuth?: () => Promise<{managerPin: string; managerId: string} | null>;
};

function remainingQty(line: PosOrderLine): number {
    return Math.max(0, Number(line.quantity) - Number(line.quantityRefunded ?? 0));
}

export default function PosRefundDialog({
    open,
    order,
    onOpenChange,
    onRefunded,
    money,
    rk,
    requirePin,
    requestManagerAuth,
}: Props) {
    const [qtyByLine, setQtyByLine] = useState<Record<string, number>>({});
    const [reason, setReason] = useState("");
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (open) {
            setQtyByLine({});
            setReason("");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when dialog opens for a given order
    }, [open, order?._id]);

    const lines = useMemo(() => order?.lines ?? [], [order?.lines]);
    const refundableLines = useMemo(() => lines.filter((l) => remainingQty(l) > 0.0001), [lines]);
    const hasSelection = Object.values(qtyByLine).some((q) => q > 0);
    const refundTotal = refundableLines.reduce((sum, line) => {
        const lineId = line._id ?? "";
        const qty = qtyByLine[lineId] ?? 0;
        if (qty <= 0) return sum;
        const unit = line.quantity > 0 ? line.priceTotal / line.quantity : 0;
        return sum + unit * qty;
    }, 0);

    const bump = (lineId: string, delta: number, max: number) => {
        setQtyByLine((prev) => ({...prev, [lineId]: Math.max(0, Math.min(max, (prev[lineId] ?? 0) + delta))}));
    };

    const submit = async () => {
        if (!order || !hasSelection || busy) return;
        let managerPin: string | undefined;
        let managerId: string | undefined;
        if (requirePin) {
            if (!requestManagerAuth) {
                toast.error(rk("refundDialog.pinRequired"));
                return;
            }
            const auth = await requestManagerAuth();
            if (!auth) return;
            managerPin = auth.managerPin;
            managerId = auth.managerId;
        }
        setBusy(true);
        try {
            await apiClient.post("/api/eCommerce/pos/refund", {
                _id: order._id,
                reason: reason.trim() || undefined,
                managerPin,
                managerId,
                lines: refundableLines
                    .filter((line) => (qtyByLine[line._id ?? ""] ?? 0) > 0)
                    .map((line) => ({lineId: line._id, quantity: qtyByLine[line._id ?? ""]})),
            });
            toast.success(rk("refundDialog.success"));
            onOpenChange(false);
            onRefunded();
        } catch {
            toast.error(rk("refundDialog.failed"));
        } finally {
            setBusy(false);
        }
    };

    const selectAll = () => {
        const next: Record<string, number> = {};
        for (const line of refundableLines) {
            if (line._id) next[line._id] = remainingQty(line);
        }
        setQtyByLine(next);
    };

    return (
        <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{rk("refundDialog.title")}</DialogTitle>
                    <DialogDescription>
                        {order?.name
                            ? `${rk("refundDialog.description")} — ${order.name}`
                            : rk("refundDialog.description")}
                    </DialogDescription>
                </DialogHeader>
                {refundableLines.length > 0 && (
                    <div className="flex justify-end">
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={selectAll}>
                            {rk("refundDialog.selectAll")}
                        </Button>
                    </div>
                )}
                <div className="flex flex-col max-h-[42vh] gap-y-1.5 overflow-y-auto py-1">
                    {lines.map((line) => {
                        const lineId = line._id ?? "";
                        const remaining = remainingQty(line);
                        const qty = qtyByLine[lineId] ?? 0;
                        const fullyRefunded = remaining <= 0.0001;
                        return (
                            <div
                                key={lineId}
                                className={cn(
                                    "flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2",
                                    fullyRefunded && "opacity-50",
                                )}
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="truncate text-sm font-medium text-foreground">{line.productName}</div>
                                    <div className="text-2xs tabular-nums text-muted-foreground">
                                        {money(line.unitPrice)} × {line.quantity}
                                        {Number(line.quantityRefunded ?? 0) > 0
                                            ? ` · ${rk("refundDialog.alreadyRefunded")}: ${line.quantityRefunded}`
                                            : ""}
                                        {!fullyRefunded ? ` · ${rk("refundDialog.remaining")}: ${remaining}` : ""}
                                    </div>
                                </div>
                                {fullyRefunded ? (
                                    <span className="shrink-0 text-2xs font-medium text-muted-foreground">
                                        {rk("refundDialog.fullyRefunded")}
                                    </span>
                                ) : (
                                    <div className="flex shrink-0 items-center overflow-hidden rounded-md border border-border bg-background">
                                        <button
                                            type="button"
                                            className="flex size-7 items-center justify-center hover:bg-muted disabled:opacity-40"
                                            disabled={qty <= 0}
                                            onClick={() => bump(lineId, -1, remaining)}
                                        >
                                            <Minus className="size-3" />
                                        </button>
                                        <div className="flex h-7 w-11 items-center justify-center text-xs font-semibold tabular-nums">
                                            {qty}/{remaining}
                                        </div>
                                        <button
                                            type="button"
                                            className="flex size-7 items-center justify-center hover:bg-muted disabled:opacity-40"
                                            disabled={qty >= remaining}
                                            onClick={() => bump(lineId, 1, remaining)}
                                        >
                                            <Plus className="size-3" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {!lines.length && (
                        <div className="py-6 text-center text-sm text-muted-foreground">{rk("refundDialog.empty")}</div>
                    )}
                    {!!lines.length && !refundableLines.length && (
                        <div className="py-4 text-center text-sm text-muted-foreground">
                            {rk("refundDialog.nothingLeft")}
                        </div>
                    )}
                </div>
                <div className="flex flex-col gap-y-2 border-t border-border pt-2">
                    <div className="flex flex-col gap-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{rk("reason")}</label>
                        <Input value={reason} onChange={(e) => setReason(e.target.value)} />
                    </div>
                    {requirePin ? (
                        <p className="text-2xs text-muted-foreground">{rk("refundDialog.pinHint")}</p>
                    ) : null}
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{rk("refundDialog.total")}</span>
                        <span className="font-semibold tabular-nums">{money(refundTotal)}</span>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
                        {rk("cancel")}
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => void submit()}
                        disabled={busy || !hasSelection}
                    >
                        {busy ? rk("busy") : rk("refundDialog.submit")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
