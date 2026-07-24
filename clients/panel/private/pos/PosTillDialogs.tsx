import {Check, CircleHelp, Minus, Plus, Printer, Trash2, Undo2} from "lucide-react";
import Loader from "@coreModule/components/custom/loader.tsx";
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
import PosNumpadField from "@eCommerceModule/clients/panel/private/pos/PosNumpad.tsx";
import PosPinDialog from "@eCommerceModule/clients/panel/private/pos/PosPinDialog.tsx";
import PosVariantDialog from "@eCommerceModule/clients/panel/private/pos/PosVariantDialog.tsx";
import PosRefundDialog from "@eCommerceModule/clients/panel/private/pos/PosRefundDialog.tsx";
import type {CatalogProduct, ReceiptPayload} from "@eCommerceModule/clients/panel/private/pos/posTypes.ts";
import type {PosOrder} from "armonia/src/modules/eCommerce/api/eCommerce/private/posOrder/posOrder.dto.ts";
import type {PosSession} from "armonia/src/modules/eCommerce/api/eCommerce/private/posSession/posSession.dto.ts";

type Recon = {
    expectedCash: number;
    openingBalance: number;
    totalSales: number;
    totalCash: number;
    totalCard: number;
    orderCount: number;
    heldDraftCount: number;
    salesByTender: Record<string, number>;
    cashMoves: {type: string; amount: number; reason?: string}[];
};

type Props = {
    rk: (key: string) => string;
    money: (n: number) => string;
    session: PosSession;

    splitOpen: boolean;
    onSplitOpenChange: (open: boolean) => void;
    splitMode: "equal" | "items";
    onSplitModeChange: (mode: "equal" | "items") => void;
    splitGuests: number;
    onSplitGuestsChange: (n: number) => void;
    equalPerPerson: number;
    total: number;
    onApplyEqualSplit: () => void;
    onStartItemsSplit: () => void;

    cashMoveOpen: "in" | "out" | null;
    onCashMoveOpenChange: (open: boolean) => void;
    cashMoveAmount: string;
    onCashMoveAmountChange: (value: string) => void;
    cashMoveReason: string;
    onCashMoveReasonChange: (value: string) => void;
    cashMoveBusy: boolean;
    onSubmitCashMove: () => void;
    onCancelCashMove: () => void;

    closeOpen: boolean;
    onCloseOpenChange: (open: boolean) => void;
    closingBalance: string;
    onClosingBalanceChange: (value: string) => void;
    closingNotes: string;
    onClosingNotesChange: (value: string) => void;
    differenceReason: string;
    onDifferenceReasonChange: (value: string) => void;
    closeBusy: boolean;
    recon: Recon | null;
    onLoadReconciliation: (closingBalance: number) => void;
    onCloseSession: () => void;

    infoOpen: boolean;
    onInfoOpenChange: (open: boolean) => void;

    heldOpen: boolean;
    onHeldOpenChange: (open: boolean) => void;
    heldBusy: boolean;
    heldOrders: PosOrder[];
    onResumeHeld: (order: PosOrder) => void;
    onDiscardHeld: (orderId: string) => void;

    ordersOpen: boolean;
    onOrdersOpenChange: (open: boolean) => void;
    ordersBusy: boolean;
    sessionOrders: PosOrder[];
    onRefundOrder: (order: PosOrder) => void;
    onReprintOrder: (orderId: string) => void;

    receiptOpen: boolean;
    onReceiptOpenChange: (open: boolean) => void;
    receipt: ReceiptPayload | null;
    onReceiptNewOrder: () => void;
    onPrintReceipt: () => void;

    pinOpen: boolean;
    pinBusy: boolean;
    pinTitle: string;
    onPinOpenChange: (open: boolean) => void;
    onPinConfirm: (pin: string) => void;

    variantProduct: CatalogProduct | null;
    onVariantClose: () => void;
    onVariantPick: (
        variantId: string,
        price: number,
        label: string,
        stockQty?: number,
        trackInventory?: boolean,
    ) => void;
    allowOversell: boolean;

    refundOrder: PosOrder | null;
    requireRefundPin: boolean;
    onRefundOpenChange: (open: boolean) => void;
    onRefunded: () => void;
};

export default function PosTillDialogs({
    rk,
    money,
    session,
    splitOpen,
    onSplitOpenChange,
    splitMode,
    onSplitModeChange,
    splitGuests,
    onSplitGuestsChange,
    equalPerPerson,
    total,
    onApplyEqualSplit,
    onStartItemsSplit,
    cashMoveOpen,
    onCashMoveOpenChange,
    cashMoveAmount,
    onCashMoveAmountChange,
    cashMoveReason,
    onCashMoveReasonChange,
    cashMoveBusy,
    onSubmitCashMove,
    onCancelCashMove,
    closeOpen,
    onCloseOpenChange,
    closingBalance,
    onClosingBalanceChange,
    closingNotes,
    onClosingNotesChange,
    differenceReason,
    onDifferenceReasonChange,
    closeBusy,
    recon,
    onLoadReconciliation,
    onCloseSession,
    infoOpen,
    onInfoOpenChange,
    heldOpen,
    onHeldOpenChange,
    heldBusy,
    heldOrders,
    onResumeHeld,
    onDiscardHeld,
    ordersOpen,
    onOrdersOpenChange,
    ordersBusy,
    sessionOrders,
    onRefundOrder,
    onReprintOrder,
    receiptOpen,
    onReceiptOpenChange,
    receipt,
    onReceiptNewOrder,
    onPrintReceipt,
    pinOpen,
    pinBusy,
    pinTitle,
    onPinOpenChange,
    onPinConfirm,
    variantProduct,
    onVariantClose,
    onVariantPick,
    allowOversell,
    refundOrder,
    requireRefundPin,
    onRefundOpenChange,
    onRefunded,
}: Props) {
    return (
        <>
            <PosPinDialog
                open={pinOpen}
                onOpenChange={onPinOpenChange}
                title={pinTitle || rk("pin.title")}
                description={rk("pin.description")}
                rk={rk}
                busy={pinBusy}
                onConfirm={onPinConfirm}
            />

            <PosVariantDialog
                product={variantProduct}
                open={!!variantProduct}
                onClose={onVariantClose}
                money={money}
                rk={rk}
                allowOversell={allowOversell}
                onPick={onVariantPick}
            />

            <PosRefundDialog
                order={refundOrder}
                open={!!refundOrder}
                requirePin={requireRefundPin}
                money={money}
                rk={rk}
                onOpenChange={onRefundOpenChange}
                onRefunded={onRefunded}
            />
            <Dialog open={splitOpen} onOpenChange={onSplitOpenChange}>
                <DialogContent className="print:hidden sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{rk("split.title")}</DialogTitle>
                        <DialogDescription>{rk("split.description")}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-1">
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => onSplitModeChange("equal")}
                                className={cn(
                                    "rounded-xl border px-3 py-3 text-left transition-colors",
                                    splitMode === "equal"
                                        ? "border-emerald-500 bg-emerald-500/10"
                                        : "border-border bg-card hover:bg-muted",
                                )}
                            >
                                <div className="text-sm font-semibold">{rk("split.equal")}</div>
                                <div className="mt-1 text-[11px] text-muted-foreground">{rk("split.equalHint")}</div>
                            </button>
                            <button
                                type="button"
                                onClick={() => onSplitModeChange("items")}
                                className={cn(
                                    "rounded-xl border px-3 py-3 text-left transition-colors",
                                    splitMode === "items"
                                        ? "border-emerald-500 bg-emerald-500/10"
                                        : "border-border bg-card hover:bg-muted",
                                )}
                            >
                                <div className="text-sm font-semibold">{rk("split.items")}</div>
                                <div className="mt-1 text-[11px] text-muted-foreground">{rk("split.itemsHint")}</div>
                            </button>
                        </div>

                        {splitMode === "equal" && (
                            <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-3">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-sm font-medium">{rk("split.guests")}</span>
                                    <div className="flex items-center overflow-hidden rounded-md border border-border bg-card">
                                        <button
                                            type="button"
                                            className="flex size-8 items-center justify-center hover:bg-muted"
                                            onClick={() => onSplitGuestsChange(Math.max(2, splitGuests - 1))}
                                        >
                                            <Minus className="size-3.5" />
                                        </button>
                                        <PosNumpadField
                                            value={splitGuests}
                                            onValueChange={(n) =>
                                                onSplitGuestsChange(Math.max(2, Math.min(20, Math.trunc(n) || 2)))
                                            }
                                            min={2}
                                            max={20}
                                            decimals={0}
                                            title={rk("split.guests")}
                                            okLabel={rk("confirm")}
                                            cancelLabel={rk("cancel")}
                                            clearLabel={rk("numpad.clear")}
                                            buttonClassName="flex h-8 w-12 items-center justify-center text-sm font-semibold"
                                        />
                                        <button
                                            type="button"
                                            className="flex size-8 items-center justify-center hover:bg-muted"
                                            onClick={() => onSplitGuestsChange(Math.min(20, splitGuests + 1))}
                                        >
                                            <Plus className="size-3.5" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm tabular-nums">
                                    <span className="text-muted-foreground">{rk("split.perPerson")}</span>
                                    <span className="font-semibold">{money(equalPerPerson)}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs tabular-nums text-muted-foreground">
                                    <span>{rk("total")}</span>
                                    <span>{money(total)}</span>
                                </div>
                            </div>
                        )}

                        {splitMode === "items" && (
                            <div className="rounded-xl border border-border bg-muted/30 p-3 text-[12px] text-muted-foreground">
                                {rk("split.itemsHint")}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => onSplitOpenChange(false)}>
                            {rk("cancel")}
                        </Button>
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-500"
                            onClick={() => {
                                if (splitMode === "equal") onApplyEqualSplit();
                                else onStartItemsSplit();
                            }}
                        >
                            {splitMode === "equal" ? rk("split.apply") : rk("split.startItems")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!cashMoveOpen} onOpenChange={(open) => !open && onCashMoveOpenChange(false)}>
                <DialogContent className="print:hidden sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{cashMoveOpen === "in" ? rk("cashIn") : rk("cashOut")}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">{rk("amount")}</label>
                            <PosNumpadField
                                value={Number(cashMoveAmount) || 0}
                                onValueChange={(n) => onCashMoveAmountChange(String(n))}
                                min={0}
                                decimals={2}
                                title={rk("amount")}
                                okLabel={rk("confirm")}
                                cancelLabel={rk("cancel")}
                                clearLabel={rk("numpad.clear")}
                                align="right"
                                buttonClassName="flex h-11 w-full items-center rounded-md border border-input bg-background px-3 text-base font-semibold"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">{rk("reason")}</label>
                            <Input value={cashMoveReason} onChange={(e) => onCashMoveReasonChange(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={onCancelCashMove}>
                            {rk("cancel")}
                        </Button>
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-500"
                            onClick={onSubmitCashMove}
                            disabled={cashMoveBusy}
                        >
                            {cashMoveBusy ? rk("busy") : rk("confirm")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={closeOpen} onOpenChange={onCloseOpenChange}>
                <DialogContent className="print:hidden sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{rk("closeSession")}</DialogTitle>
                        <DialogDescription>{rk("closeSessionDescription")}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <div className="space-y-1.5 rounded-xl border bg-muted/40 p-3 text-sm tabular-nums">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{rk("recon.opening")}</span>
                                <span className="font-medium">{money(recon?.openingBalance ?? session.openingBalance ?? 0)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{rk("expectedCash")}</span>
                                <span className="font-medium">{money(recon?.expectedCash ?? session.expectedCash ?? 0)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{rk("sessionSales")}</span>
                                <span className="font-semibold">{money(recon?.totalSales ?? session.totalSales ?? 0)}</span>
                            </div>
                            <div className="flex justify-between text-[11px] text-muted-foreground">
                                <span>
                                    {rk("orders")}: {recon?.orderCount ?? session.orderCount ?? 0}
                                </span>
                                <span>
                                    {rk("cash")}: {money(recon?.totalCash ?? session.totalCash ?? 0)} ·{" "}
                                    {rk("recon.card")}: {money(recon?.totalCard ?? session.totalCard ?? 0)}
                                </span>
                            </div>
                            {(recon?.heldDraftCount ?? 0) > 0 && (
                                <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-1.5 text-[11px] text-amber-800 dark:text-amber-300">
                                    {rk("recon.heldWarning").replace("{count}", String(recon?.heldDraftCount ?? 0))}
                                </div>
                            )}
                            {Object.keys(recon?.salesByTender ?? {}).length > 0 && (
                                <div className="border-t pt-1.5 space-y-0.5">
                                    {Object.entries(recon!.salesByTender).map(([type, amount]) => (
                                        <div key={type} className="flex justify-between text-[11px]">
                                            <span className="capitalize text-muted-foreground">{type}</span>
                                            <span>{money(amount)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">{rk("closingBalance")}</label>
                            <PosNumpadField
                                value={Number(closingBalance) || 0}
                                onValueChange={(n) => {
                                    onClosingBalanceChange(String(n));
                                    onLoadReconciliation(n);
                                }}
                                min={0}
                                decimals={2}
                                title={rk("closingBalance")}
                                okLabel={rk("confirm")}
                                cancelLabel={rk("cancel")}
                                clearLabel={rk("numpad.clear")}
                                align="right"
                                buttonClassName="flex h-11 w-full items-center rounded-md border border-input bg-background px-3 text-base font-semibold"
                            />
                        </div>
                        {(() => {
                            const counted = Number(closingBalance) || 0;
                            const expected = recon?.expectedCash ?? session.expectedCash ?? 0;
                            const diff = Math.round((counted - expected) * 100) / 100;
                            return (
                                <div
                                    className={cn(
                                        "flex justify-between rounded-lg border px-3 py-2 text-sm tabular-nums",
                                        Math.abs(diff) >= 0.01
                                            ? "border-amber-500/40 bg-amber-500/10"
                                            : "border-border bg-muted/30",
                                    )}
                                >
                                    <span className="text-muted-foreground">{rk("recon.difference")}</span>
                                    <span className="font-bold">{money(diff)}</span>
                                </div>
                            );
                        })()}
                        {Math.abs(
                            (Number(closingBalance) || 0) - (recon?.expectedCash ?? session.expectedCash ?? 0),
                        ) >= 0.01 && (
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">{rk("recon.differenceReason")}</label>
                                <Input
                                    value={differenceReason}
                                    onChange={(e) => onDifferenceReasonChange(e.target.value)}
                                    placeholder={rk("recon.differenceReasonPlaceholder")}
                                />
                            </div>
                        )}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">{rk("notes")}</label>
                            <Input value={closingNotes} onChange={(e) => onClosingNotesChange(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => onCloseOpenChange(false)}>
                            {rk("cancel")}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={onCloseSession}
                            disabled={closeBusy || (recon?.heldDraftCount ?? 0) > 0}
                        >
                            {closeBusy ? rk("busy") : rk("closeSession")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={infoOpen} onOpenChange={onInfoOpenChange}>
                <DialogContent className="print:hidden sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CircleHelp className="size-5 text-emerald-600 dark:text-emerald-400" />
                            {rk("info.title")}
                        </DialogTitle>
                        <DialogDescription>{rk("info.description")}</DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[60vh] space-y-4 overflow-y-auto py-1 text-sm">
                        <section className="space-y-2">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                {rk("info.shortcutsTitle")}
                            </h3>
                            <div className="overflow-hidden rounded-xl border border-border">
                                {(
                                    [
                                        ["F1", "info.keys.f1"],
                                        ["F2 / Ctrl+Enter", "info.keys.f2"],
                                        ["F3", "info.keys.f3"],
                                        ["F4", "info.keys.f4"],
                                        ["F6", "info.keys.f6"],
                                        ["F8", "info.keys.f8"],
                                        ["F9", "info.keys.f9"],
                                        ["Esc", "info.keys.esc"],
                                        ["+ / −", "info.keys.qty"],
                                        ["Delete", "info.keys.delete"],
                                    ] as const
                                ).map(([key, labelKey]) => (
                                    <div
                                        key={key}
                                        className="flex items-center justify-between gap-3 border-b border-border px-3 py-2 last:border-b-0"
                                    >
                                        <kbd className="shrink-0 rounded-md border border-border bg-muted px-2 py-0.5 font-mono text-[11px] font-semibold">
                                            {key}
                                        </kbd>
                                        <span className="text-right text-muted-foreground">{rk(labelKey)}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="space-y-2">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                {rk("info.featuresTitle")}
                            </h3>
                            <ul className="space-y-2.5 rounded-xl border border-border bg-muted/30 p-3 text-muted-foreground">
                                <li>
                                    <span className="font-medium text-foreground">{rk("info.features.holdTitle")}</span>
                                    <div className="mt-0.5 text-[13px] leading-snug">{rk("info.features.holdBody")}</div>
                                </li>
                                <li>
                                    <span className="font-medium text-foreground">{rk("info.features.ordersTitle")}</span>
                                    <div className="mt-0.5 text-[13px] leading-snug">{rk("info.features.ordersBody")}</div>
                                </li>
                                <li>
                                    <span className="font-medium text-foreground">{rk("info.features.reconTitle")}</span>
                                    <div className="mt-0.5 text-[13px] leading-snug">{rk("info.features.reconBody")}</div>
                                </li>
                                <li>
                                    <span className="font-medium text-foreground">{rk("info.features.payTitle")}</span>
                                    <div className="mt-0.5 text-[13px] leading-snug">{rk("info.features.payBody")}</div>
                                </li>
                                <li>
                                    <span className="font-medium text-foreground">{rk("info.features.splitTitle")}</span>
                                    <div className="mt-0.5 text-[13px] leading-snug">{rk("info.features.splitBody")}</div>
                                </li>
                                <li>
                                    <span className="font-medium text-foreground">{rk("info.features.customerTitle")}</span>
                                    <div className="mt-0.5 text-[13px] leading-snug">{rk("info.features.customerBody")}</div>
                                </li>
                                <li>
                                    <span className="font-medium text-foreground">{rk("info.features.refundTitle")}</span>
                                    <div className="mt-0.5 text-[13px] leading-snug">{rk("info.features.refundBody")}</div>
                                </li>
                                <li>
                                    <span className="font-medium text-foreground">{rk("info.features.stockTitle")}</span>
                                    <div className="mt-0.5 text-[13px] leading-snug">{rk("info.features.stockBody")}</div>
                                </li>
                                <li>
                                    <span className="font-medium text-foreground">{rk("info.features.pinTitle")}</span>
                                    <div className="mt-0.5 text-[13px] leading-snug">{rk("info.features.pinBody")}</div>
                                </li>
                            </ul>
                        </section>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => onInfoOpenChange(false)}>{rk("confirm")}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={heldOpen} onOpenChange={onHeldOpenChange}>
                <DialogContent className="print:hidden sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{rk("held.title")}</DialogTitle>
                        <DialogDescription>{rk("held.description")}</DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[50vh] space-y-2 overflow-y-auto py-1">
                        {heldBusy ? (
                            <div className="flex justify-center py-8">
                                <Loader />
                            </div>
                        ) : !heldOrders.length ? (
                            <div className="py-8 text-center text-sm text-muted-foreground">{rk("held.empty")}</div>
                        ) : (
                            heldOrders.map((order) => (
                                <div
                                    key={order._id}
                                    className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2"
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate text-sm font-semibold">{order.name}</div>
                                        <div className="text-[11px] text-muted-foreground tabular-nums">
                                            {order.lines?.length ?? 0} {rk("items")} · {money(order.amountTotal ?? 0)}
                                            {order.customerName ? ` · ${order.customerName}` : ""}
                                        </div>
                                    </div>
                                    <Button size="sm" variant="outline" className="h-8" onClick={() => onResumeHeld(order)}>
                                        {rk("held.resume")}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 text-destructive"
                                        onClick={() => onDiscardHeld(order._id)}
                                    >
                                        <Trash2 className="size-3.5" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={ordersOpen} onOpenChange={onOrdersOpenChange}>
                <DialogContent className="print:hidden sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{rk("sessionOrders.title")}</DialogTitle>
                        <DialogDescription>{rk("sessionOrders.description")}</DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[50vh] space-y-2 overflow-y-auto py-1">
                        {ordersBusy ? (
                            <div className="flex justify-center py-8">
                                <Loader />
                            </div>
                        ) : !sessionOrders.length ? (
                            <div className="py-8 text-center text-sm text-muted-foreground">{rk("sessionOrders.empty")}</div>
                        ) : (
                            sessionOrders.map((order) => (
                                <div
                                    key={order._id}
                                    className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2"
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate text-sm font-semibold">{order.name}</div>
                                        <div className="text-[11px] text-muted-foreground tabular-nums">
                                            {order.state} · {money(order.amountTotal ?? 0)}
                                            {Number(order.amountRefunded ?? 0) > 0
                                                ? ` · −${money(order.amountRefunded ?? 0)}`
                                                : ""}
                                            {order.customerName ? ` · ${order.customerName}` : ""}
                                        </div>
                                    </div>
                                    {order.state === "paid" &&
                                        !order.isRefund &&
                                        (order.lines ?? []).some(
                                            (l) => Number(l.quantity) - Number(l.quantityRefunded ?? 0) > 0.0001,
                                        ) && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-8"
                                            onClick={() => onRefundOrder(order)}
                                            title={rk("refund.title")}
                                        >
                                            <Undo2 className="size-3.5" />
                                            {rk("sessionOrders.refund")}
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8"
                                        onClick={() => onReprintOrder(order._id)}
                                    >
                                        <Printer className="size-3.5" />
                                        {rk("sessionOrders.reprint")}
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={receiptOpen} onOpenChange={onReceiptOpenChange}>
                <DialogContent className="max-w-[22rem] print:hidden">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Check className="size-5 text-emerald-600" />
                            {rk("receipt.title")}
                        </DialogTitle>
                    </DialogHeader>
                    {receipt && (
                        <div className="mx-auto w-[80mm] max-w-full overflow-hidden rounded-md border border-border bg-white text-black shadow-sm">
                            <div id="pos-receipt" className="pos-receipt-ticket px-3 py-3 font-mono text-[11px] leading-snug">
                                <div className="pos-receipt-header space-y-1 text-center">
                                    <div className="text-[15px] font-bold uppercase tracking-wide">
                                        {receipt.companyName || receipt.shopName || rk("title")}
                                    </div>
                                    {receipt.header ? (
                                        <div className="whitespace-pre-wrap text-[10px] text-neutral-700">{receipt.header}</div>
                                    ) : null}
                                    {receipt.shopName && receipt.companyName && receipt.shopName !== receipt.companyName ? (
                                        <div className="text-[10px] font-semibold">{receipt.shopName}</div>
                                    ) : null}
                                </div>

                                <div className="my-2 border-t border-dashed border-neutral-400" />

                                <div className="space-y-0.5 text-[10px]">
                                    <div className="flex justify-between gap-2">
                                        <span>{rk("receipt.order")}</span>
                                        <span className="tabular-nums">{receipt.orderName}</span>
                                    </div>
                                    {receipt.productOrderNumber ? (
                                        <div className="flex justify-between gap-2">
                                            <span>{rk("receipt.ref")}</span>
                                            <span className="tabular-nums">{receipt.productOrderNumber}</span>
                                        </div>
                                    ) : null}
                                    <div className="flex justify-between gap-2">
                                        <span>{rk("receipt.date")}</span>
                                        <span className="tabular-nums">
                                            {receipt.paidAt
                                                ? new Date(receipt.paidAt).toLocaleString()
                                                : new Date().toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <span>{rk("customerName")}</span>
                                        <span className="truncate text-right">{receipt.customerName || rk("walkIn")}</span>
                                    </div>
                                </div>

                                <div className="my-2 border-t border-dashed border-neutral-400" />

                                <div className="space-y-1">
                                    {receipt.lines.map((line, idx) => (
                                        <div key={idx}>
                                            <div className="flex justify-between gap-2">
                                                <span className="min-w-0 flex-1 break-words">
                                                    {line.quantity}× {line.productName}
                                                    {line.discountPercent > 0 ? ` (-${line.discountPercent}%)` : ""}
                                                </span>
                                                <span className="shrink-0 tabular-nums">{money(line.priceTotal)}</span>
                                            </div>
                                            <div className="text-[9px] tabular-nums text-neutral-600">
                                                {money(line.unitPrice)} × {line.quantity}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="my-2 border-t border-dashed border-neutral-400" />

                                <div className="space-y-0.5 tabular-nums">
                                    {receipt.discountTotal > 0 && (
                                        <div className="flex justify-between gap-2">
                                            <span>{rk("discount")}</span>
                                            <span>-{money(receipt.discountTotal)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between gap-2 text-[13px] font-bold">
                                        <span>{rk("total")}</span>
                                        <span>{money(receipt.amountTotal)}</span>
                                    </div>
                                    {receipt.payments.map((p, idx) => (
                                        <div key={idx} className="flex justify-between gap-2 text-[10px]">
                                            <span className="min-w-0 flex-1 truncate">
                                                {p.method}
                                                {p.terminalAuthCode ? ` · ${p.terminalAuthCode}` : ""}
                                            </span>
                                            <span className="shrink-0">{money(p.amount)}</span>
                                        </div>
                                    ))}
                                    {receipt.amountReturn > 0 && (
                                        <div className="flex justify-between gap-2 font-semibold">
                                            <span>{rk("change")}</span>
                                            <span>{money(receipt.amountReturn)}</span>
                                        </div>
                                    )}
                                </div>

                                {(receipt.qrCodeDataUrl || receipt.qrVerifyUrl) && (
                                    <div className="pos-receipt-fiscal mt-2 space-y-1 text-center">
                                        <div className="border-t border-dashed border-neutral-400 pt-2" />
                                        <img
                                            src={
                                                receipt.qrCodeDataUrl ||
                                                `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(receipt.qrVerifyUrl!)}`
                                            }
                                            alt={rk("receipt.fiscalQr")}
                                            className="mx-auto h-[120px] w-[120px] bg-white"
                                        />
                                        {receipt.nslf ? (
                                            <div className="break-all text-[9px] tabular-nums text-neutral-700">
                                                {rk("receipt.nslf")}: {receipt.nslf}
                                            </div>
                                        ) : null}
                                        {receipt.nivf ? (
                                            <div className="break-all text-[9px] tabular-nums text-neutral-700">
                                                {rk("receipt.nivf")}: {receipt.nivf}
                                            </div>
                                        ) : (
                                            <div className="text-[9px] text-neutral-500">{rk("receipt.fiscalDemo")}</div>
                                        )}
                                    </div>
                                )}

                                <div className="my-2 border-t border-dashed border-neutral-400" />

                                <div className="pos-receipt-footer space-y-1 text-center text-[10px]">
                                    {receipt.footer ? (
                                        <div className="whitespace-pre-wrap text-neutral-700">{receipt.footer}</div>
                                    ) : (
                                        <div className="text-neutral-600">{rk("receipt.defaultFooter")}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={onReceiptNewOrder}>
                            {rk("newOrder")}
                        </Button>
                        <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={onPrintReceipt}>
                            <Printer className="size-4" />
                            {rk("receipt.print")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {receipt && (
                <div id="pos-receipt-print-root" aria-hidden className="hidden">
                    <div id="pos-receipt-print" className="pos-receipt-ticket">
                        <div className="pos-receipt-header">
                            <div className="company">{receipt.companyName || receipt.shopName || rk("title")}</div>
                            {receipt.header ? <div className="header-text">{receipt.header}</div> : null}
                            {receipt.shopName && receipt.companyName && receipt.shopName !== receipt.companyName ? (
                                <div className="shop">{receipt.shopName}</div>
                            ) : null}
                        </div>
                        <div className="rule" />
                        <div className="meta">
                            <div>
                                <span>{rk("receipt.order")}</span>
                                <span>{receipt.orderName}</span>
                            </div>
                            {receipt.productOrderNumber ? (
                                <div>
                                    <span>{rk("receipt.ref")}</span>
                                    <span>{receipt.productOrderNumber}</span>
                                </div>
                            ) : null}
                            <div>
                                <span>{rk("receipt.date")}</span>
                                <span>
                                    {receipt.paidAt
                                        ? new Date(receipt.paidAt).toLocaleString()
                                        : new Date().toLocaleString()}
                                </span>
                            </div>
                            <div>
                                <span>{rk("customerName")}</span>
                                <span>{receipt.customerName || rk("walkIn")}</span>
                            </div>
                        </div>
                        <div className="rule" />
                        <div className="lines">
                            {receipt.lines.map((line, idx) => (
                                <div key={idx} className="line">
                                    <div className="row">
                                        <span>
                                            {line.quantity}× {line.productName}
                                            {line.discountPercent > 0 ? ` (-${line.discountPercent}%)` : ""}
                                        </span>
                                        <span>{money(line.priceTotal)}</span>
                                    </div>
                                    <div className="unit">
                                        {money(line.unitPrice)} × {line.quantity}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="rule" />
                        <div className="totals">
                            {receipt.discountTotal > 0 && (
                                <div className="row">
                                    <span>{rk("discount")}</span>
                                    <span>-{money(receipt.discountTotal)}</span>
                                </div>
                            )}
                            <div className="row total">
                                <span>{rk("total")}</span>
                                <span>{money(receipt.amountTotal)}</span>
                            </div>
                            {receipt.payments.map((p, idx) => (
                                <div key={idx} className="row pay">
                                    <span>
                                        {p.method}
                                        {p.terminalAuthCode ? ` · ${p.terminalAuthCode}` : ""}
                                    </span>
                                    <span>{money(p.amount)}</span>
                                </div>
                            ))}
                            {receipt.amountReturn > 0 && (
                                <div className="row">
                                    <span>{rk("change")}</span>
                                    <span>{money(receipt.amountReturn)}</span>
                                </div>
                            )}
                        </div>
                        {(receipt.qrCodeDataUrl || receipt.qrVerifyUrl) && (
                            <div className="pos-receipt-fiscal">
                                <div className="rule" />
                                <img
                                    src={
                                        receipt.qrCodeDataUrl ||
                                        `https://api.qrserver.com/v1/create-qr-code/?size=168x168&data=${encodeURIComponent(receipt.qrVerifyUrl!)}`
                                    }
                                    alt={rk("receipt.fiscalQr")}
                                    className="qr"
                                />
                                {receipt.nslf ? (
                                    <div className="fiscal-id">
                                        {rk("receipt.nslf")}: {receipt.nslf}
                                    </div>
                                ) : null}
                                {receipt.nivf ? (
                                    <div className="fiscal-id">
                                        {rk("receipt.nivf")}: {receipt.nivf}
                                    </div>
                                ) : (
                                    <div className="fiscal-demo">{rk("receipt.fiscalDemo")}</div>
                                )}
                            </div>
                        )}
                        <div className="rule" />
                        <div className="pos-receipt-footer">
                            {receipt.footer || rk("receipt.defaultFooter")}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @media print {
                    @page {
                        size: 80mm auto;
                        margin: 0;
                    }
                    html, body {
                        width: 80mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #fff !important;
                    }
                    body * {
                        visibility: hidden !important;
                    }
                    #pos-receipt-print-root,
                    #pos-receipt-print-root * {
                        visibility: visible !important;
                    }
                    #pos-receipt-print-root {
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
                    #pos-receipt-print {
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
                    #pos-receipt-print .company {
                        font-size: 15px !important;
                        font-weight: 700 !important;
                        text-align: center !important;
                        text-transform: uppercase !important;
                        letter-spacing: 0.04em !important;
                    }
                    #pos-receipt-print .header-text,
                    #pos-receipt-print .shop,
                    #pos-receipt-print .pos-receipt-footer {
                        text-align: center !important;
                        white-space: pre-wrap !important;
                        font-size: 10px !important;
                    }
                    #pos-receipt-print .shop {
                        font-weight: 600 !important;
                        margin-top: 2px !important;
                    }
                    #pos-receipt-print .rule {
                        border-top: 1px dashed #000 !important;
                        margin: 6px 0 !important;
                    }
                    #pos-receipt-print .meta > div,
                    #pos-receipt-print .row {
                        display: flex !important;
                        justify-content: space-between !important;
                        gap: 6px !important;
                    }
                    #pos-receipt-print .meta {
                        font-size: 10px !important;
                    }
                    #pos-receipt-print .unit {
                        font-size: 9px !important;
                    }
                    #pos-receipt-print .line {
                        margin-bottom: 4px !important;
                    }
                    #pos-receipt-print .total {
                        font-size: 13px !important;
                        font-weight: 700 !important;
                    }
                    #pos-receipt-print .pay {
                        font-size: 10px !important;
                    }
                    #pos-receipt-print .pos-receipt-fiscal {
                        text-align: center !important;
                        margin-top: 2px !important;
                    }
                    #pos-receipt-print .pos-receipt-fiscal .qr {
                        display: block !important;
                        width: 32mm !important;
                        height: 32mm !important;
                        margin: 2mm auto 1mm !important;
                        image-rendering: pixelated !important;
                    }
                    #pos-receipt-print .pos-receipt-fiscal .fiscal-id,
                    #pos-receipt-print .pos-receipt-fiscal .fiscal-demo {
                        font-size: 8px !important;
                        word-break: break-all !important;
                        margin-top: 1px !important;
                    }
                }
            `}</style>
        </>
    );
}
