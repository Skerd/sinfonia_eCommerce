import type {RefObject} from "react";
import {
    CreditCard,
    Minus,
    Pause,
    Percent,
    Plus,
    Scissors,
    ShoppingBag,
    Trash2,
    UserRound,
} from "lucide-react";
import {Button} from "@coreModule/components/ui/button.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import PosNumpadField from "@eCommerceModule/clients/panel/private/pos/PosNumpad.tsx";
import PosCustomerSearch from "@eCommerceModule/clients/panel/private/pos/PosCustomerSearch.tsx";
import {
    type CartLine,
    type PaymentLine,
    type PosCustomerHit,
    formatQuickAmount,
    lineTotal,
} from "@eCommerceModule/clients/panel/private/pos/posTypes.ts";

type PaymentMethodOption = {
    _id: string;
    name: string;
    type?: string;
    cashQuickAmounts?: string;
    terminalEnabled?: boolean;
    terminalProvider?: string;
    terminalHost?: string;
    terminalPort?: number;
    terminalId?: string;
    terminalPath?: string;
};

type Props = {
    cart: CartLine[];
    cartScrollRef: RefObject<HTMLDivElement | null>;
    heldOrderId: string | null;
    itemCount: number;
    total: number;
    subtotal: number;
    orderDiscountPercent: number;
    orderDiscountAmount: number;
    shareTotal: number;
    itemsSplitActive: boolean;
    splitSelection: Record<string, number>;
    selectedLineKey: string | null;
    showLineDiscount: boolean;
    showCustomer: boolean;
    showPayment: boolean;
    customerName: string;
    customerId: string | null;
    payments: PaymentLine[];
    paymentMethods: PaymentMethodOption[];
    activePaymentId: string | null;
    activePayment: PaymentLine | null;
    cashQuickAmounts: number[];
    remaining: number;
    change: number;
    canPay: boolean;
    paying: boolean;
    payArmed: boolean;
    payArmSecondsLeft: number;
    usesTerminal: boolean;
    payableTotal: number;
    holdBusy: boolean;
    allowDiscount: boolean;
    allowQuantityChange: boolean;
    money: (n: number) => string;
    rk: (key: string) => string;
    onToggleLineDiscount: () => void;
    onToggleCustomer: () => void;
    onTogglePayment: () => void;
    onOpenSplit: () => void;
    onHold: () => void;
    onClearOrder: () => void;
    onCancelItemsSplit: () => void;
    onSelectLine: (key: string) => void;
    onBumpSplitQty: (key: string, delta: number, max: number) => void;
    onUpdateLineQty: (key: string, delta: number) => void;
    onSetLineQty: (key: string, qty: number) => void;
    onSetLineDiscount: (key: string, percent: number) => void;
    onRemoveLine: (key: string) => void;
    onCustomerLabelChange: (label: string) => void;
    onCustomerSelect: (hit: PosCustomerHit | null) => void;
    onOrderDiscountChange: (percent: number) => void;
    onAddPaymentMethod: (methodId: string) => void;
    onActivePaymentIdChange: (id: string) => void;
    onUpdatePaymentAmount: (id: string, amount: number) => void;
    onRemovePayment: (id: string) => void;
    onBumpPaymentAmount: (amount: number) => void;
    onSetExactPayment: () => void;
    onRequestPay: () => void;
};

export default function PosCartPanel({
    cart,
    cartScrollRef,
    heldOrderId,
    itemCount,
    total,
    subtotal,
    orderDiscountPercent,
    orderDiscountAmount,
    shareTotal,
    itemsSplitActive,
    splitSelection,
    selectedLineKey,
    showLineDiscount,
    showCustomer,
    showPayment,
    customerName,
    customerId,
    payments,
    paymentMethods,
    activePaymentId,
    activePayment,
    cashQuickAmounts,
    remaining,
    change,
    canPay,
    paying,
    payArmed,
    payArmSecondsLeft,
    usesTerminal,
    payableTotal,
    holdBusy,
    allowDiscount,
    allowQuantityChange,
    money,
    rk,
    onToggleLineDiscount,
    onToggleCustomer,
    onTogglePayment,
    onOpenSplit,
    onHold,
    onClearOrder,
    onCancelItemsSplit,
    onSelectLine,
    onBumpSplitQty,
    onUpdateLineQty,
    onSetLineQty,
    onSetLineDiscount,
    onRemoveLine,
    onCustomerLabelChange,
    onCustomerSelect,
    onOrderDiscountChange,
    onAddPaymentMethod,
    onActivePaymentIdChange,
    onUpdatePaymentAmount,
    onRemovePayment,
    onBumpPaymentAmount,
    onSetExactPayment,
    onRequestPay,
}: Props) {
    return (
        <aside className="flex min-h-0 w-full shrink-0 flex-col bg-card lg:w-[28rem] xl:w-[32rem]">
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-3">
                <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        <ShoppingBag className="size-4" />
                    </div>
                    <div>
                        <div className="text-sm font-semibold leading-none">
                            {rk("cart")}
                            {heldOrderId ? (
                                <span className="ml-2 text-[10px] font-medium uppercase tracking-wide text-amber-600 dark:text-amber-400">
                                    {rk("held.resume")}
                                </span>
                            ) : null}
                        </div>
                        <div className="mt-1 text-[11px] text-muted-foreground">
                            {itemCount} {rk("items")} · {money(total)}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    {allowDiscount && (
                        <Button
                            size="sm"
                            variant={showLineDiscount ? "secondary" : "ghost"}
                            className="h-8 px-2 text-xs"
                            onClick={onToggleLineDiscount}
                            title={rk("lineDiscount")}
                        >
                            <Percent className="size-3.5" />
                        </Button>
                    )}
                    <Button
                        size="sm"
                        variant={showCustomer ? "secondary" : "ghost"}
                        className="h-8 px-2 text-xs"
                        onClick={onToggleCustomer}
                        title={rk("customerName")}
                    >
                        <UserRound className="size-3.5" />
                    </Button>
                    <Button
                        size="sm"
                        variant={showPayment ? "secondary" : "ghost"}
                        className="h-8 px-2 text-xs"
                        onClick={onTogglePayment}
                        title={rk("paymentMethods")}
                    >
                        <CreditCard className="size-3.5" />
                    </Button>
                    <Button
                        size="sm"
                        variant={itemsSplitActive ? "secondary" : "ghost"}
                        className="h-8 px-2 text-xs"
                        onClick={onOpenSplit}
                        disabled={!cart.length || total <= 0}
                        title={rk("split.title")}
                    >
                        <Scissors className="size-3.5" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2 text-xs"
                        onClick={onHold}
                        disabled={!cart.length || holdBusy}
                        title={`${rk("hold")} (F4)`}
                    >
                        <Pause className="size-3.5" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                        onClick={onClearOrder}
                        disabled={!cart.length && !payments.length}
                        title={`${rk("newOrder")} (Esc)`}
                    >
                        {rk("newOrder")}
                    </Button>
                </div>
            </div>

            {itemsSplitActive && (
                <div className="flex shrink-0 items-center justify-between gap-2 border-b border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px]">
                    <div className="min-w-0">
                        <div className="font-semibold text-amber-800 dark:text-amber-300">{rk("split.selectItems")}</div>
                        <div className="tabular-nums text-muted-foreground">
                            {rk("split.shareTotal")}: {money(shareTotal)}
                        </div>
                    </div>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={onCancelItemsSplit}>
                        {rk("split.cancel")}
                    </Button>
                </div>
            )}

            <div ref={cartScrollRef} className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 py-2">
                {!cart.length && (
                    <div className="flex h-full min-h-[8rem] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background/50 px-4 text-center text-sm text-muted-foreground">
                        <ShoppingBag className="size-7 opacity-40" />
                        {rk("cartEmpty")}
                    </div>
                )}
                {cart.map((line) => {
                    const shareQty = splitSelection[line.key] ?? 0;
                    const inShare = itemsSplitActive && shareQty > 0;
                    return (
                        <div
                            key={line.key}
                            onClick={() => {
                                onSelectLine(line.key);
                                if (itemsSplitActive && shareQty <= 0) onBumpSplitQty(line.key, 1, line.quantity);
                            }}
                            className={cn(
                                "flex items-center gap-1.5 rounded-lg border px-2 py-1.5 transition-colors",
                                inShare
                                    ? "border-amber-500/50 bg-amber-500/10"
                                    : selectedLineKey === line.key
                                      ? "border-emerald-500/50 bg-emerald-500/5"
                                      : "border-transparent bg-background/60 hover:border-border",
                            )}
                        >
                            <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-medium leading-tight text-foreground">{line.title}</div>
                                <div className="truncate text-[10px] tabular-nums text-muted-foreground">
                                    {money(line.unitPrice)}
                                    {line.sku ? ` · ${line.sku}` : ""}
                                    {!showLineDiscount && line.discountPercent > 0 ? ` · -${line.discountPercent}%` : ""}
                                    {itemsSplitActive ? ` · ${line.quantity}×` : ""}
                                </div>
                            </div>
                            {itemsSplitActive ? (
                                <div className="flex shrink-0 items-center overflow-hidden rounded-md border border-amber-500/40 bg-card">
                                    <button
                                        type="button"
                                        tabIndex={-1}
                                        className="flex size-7 items-center justify-center hover:bg-muted"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onBumpSplitQty(line.key, -1, line.quantity);
                                        }}
                                    >
                                        <Minus className="size-3" />
                                    </button>
                                    <div className="flex h-7 w-10 items-center justify-center text-xs font-semibold tabular-nums">
                                        {shareQty}/{line.quantity}
                                    </div>
                                    <button
                                        type="button"
                                        tabIndex={-1}
                                        className="flex size-7 items-center justify-center hover:bg-muted"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onBumpSplitQty(line.key, 1, line.quantity);
                                        }}
                                    >
                                        <Plus className="size-3" />
                                    </button>
                                </div>
                            ) : (
                                <div className="relative flex shrink-0 items-center overflow-hidden rounded-md border border-border bg-card">
                                    <button
                                        type="button"
                                        tabIndex={-1}
                                        className="flex size-7 items-center justify-center hover:bg-muted disabled:opacity-40"
                                        disabled={!allowQuantityChange}
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onUpdateLineQty(line.key, -1);
                                        }}
                                    >
                                        <Minus className="size-3" />
                                    </button>
                                    <PosNumpadField
                                        value={line.quantity}
                                        onValueChange={(n) => onSetLineQty(line.key, n)}
                                        min={0}
                                        decimals={3}
                                        disabled={!allowQuantityChange}
                                        title={rk("numpad.quantity")}
                                        okLabel={rk("confirm")}
                                        cancelLabel={rk("cancel")}
                                        clearLabel={rk("numpad.clear")}
                                        buttonClassName="flex h-7 w-9 items-center justify-center text-xs font-semibold"
                                    />
                                    <button
                                        type="button"
                                        tabIndex={-1}
                                        className="flex size-7 items-center justify-center hover:bg-muted disabled:opacity-40"
                                        disabled={!allowQuantityChange}
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onUpdateLineQty(line.key, 1);
                                        }}
                                    >
                                        <Plus className="size-3" />
                                    </button>
                                </div>
                            )}
                            {allowDiscount && showLineDiscount && (
                                <div className="flex shrink-0 items-center rounded-md border border-border bg-card px-1">
                                    <PosNumpadField
                                        value={line.discountPercent}
                                        onValueChange={(n) => onSetLineDiscount(line.key, n)}
                                        min={0}
                                        max={100}
                                        decimals={0}
                                        title={rk("discount")}
                                        okLabel={rk("confirm")}
                                        cancelLabel={rk("cancel")}
                                        clearLabel={rk("numpad.clear")}
                                        buttonClassName="flex h-7 w-9 items-center justify-center text-[11px] font-semibold"
                                    />
                                    <span className="pr-0.5 text-[10px] text-muted-foreground">%</span>
                                </div>
                            )}
                            <div className="w-16 shrink-0 text-right text-sm font-semibold tabular-nums text-foreground">
                                {money(lineTotal(line))}
                            </div>
                            <button
                                type="button"
                                className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveLine(line.key);
                                }}
                                aria-label={rk("remove")}
                                disabled={itemsSplitActive}
                            >
                                <Trash2 className="size-3.5" />
                            </button>
                        </div>
                    );
                })}
            </div>

            <div className="shrink-0 border-t border-border bg-background">
                <div className="max-h-[48vh] space-y-1.5 overflow-y-auto px-2.5 py-2 lg:max-h-none">
                    {showCustomer && (
                        <PosCustomerSearch
                            valueLabel={customerName}
                            customerId={customerId}
                            rk={rk}
                            onLabelChange={onCustomerLabelChange}
                            onSelect={onCustomerSelect}
                        />
                    )}

                    <div className="rounded-lg border border-border bg-card px-2.5 py-1.5">
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>{rk("subtotal")}</span>
                            <span className="tabular-nums">{money(subtotal)}</span>
                        </div>
                        {allowDiscount && (
                            <div className="mt-0.5 flex items-center justify-between gap-2 text-[11px] text-amber-600 dark:text-amber-400">
                                <span className="shrink-0">{rk("orderDiscount")}</span>
                                <div className="flex items-center gap-1">
                                    <PosNumpadField
                                        value={orderDiscountPercent}
                                        onValueChange={onOrderDiscountChange}
                                        min={0}
                                        max={100}
                                        decimals={0}
                                        title={rk("orderDiscount")}
                                        okLabel={rk("confirm")}
                                        cancelLabel={rk("cancel")}
                                        clearLabel={rk("numpad.clear")}
                                        buttonClassName="flex h-6 w-11 items-center justify-center rounded border border-amber-500/30 bg-background/60 text-[11px] font-semibold text-foreground"
                                    />
                                    <span className="text-muted-foreground">%</span>
                                    <span className="min-w-[3.5rem] text-right tabular-nums">
                                        -{money(orderDiscountAmount)}
                                    </span>
                                </div>
                            </div>
                        )}
                        <div className="mt-1 flex items-center justify-between border-t border-border pt-1">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                {rk("total")}
                            </span>
                            <span className="text-xl font-bold leading-none tracking-tight tabular-nums text-foreground">
                                {money(total)}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        {showPayment && (
                            <>
                                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                    {rk("paymentMethods")}
                                </div>
                                <div className="grid grid-cols-2 gap-1">
                                    {paymentMethods.map((m) => (
                                        <button
                                            key={m._id}
                                            type="button"
                                            disabled={!cart.length}
                                            onClick={() => onAddPaymentMethod(m._id)}
                                            className={cn(
                                                "flex h-8 items-center justify-center rounded-lg border text-xs font-semibold transition-colors",
                                                "border-border bg-card text-foreground hover:border-emerald-500/40 hover:bg-muted",
                                                "disabled:cursor-not-allowed disabled:opacity-40",
                                            )}
                                        >
                                            + {m.name}
                                        </button>
                                    ))}
                                    {!paymentMethods.length && (
                                        <span className="col-span-2 text-[11px] text-muted-foreground">
                                            {rk("noPaymentMethods")}
                                        </span>
                                    )}
                                </div>

                                {payments.length > 0 && (
                                    <div className="space-y-1">
                                        {payments.map((p) => {
                                            const active = activePaymentId === p.id || (!activePaymentId && p.id === activePayment?.id);
                                            const isCash = p.type === "cash";
                                            const isCard = p.type === "card" || p.type === "bank";
                                            return (
                                                <div
                                                    key={p.id}
                                                    onClick={() => onActivePaymentIdChange(p.id)}
                                                    className={cn(
                                                        "rounded-md border px-2 py-1.5 transition-colors",
                                                        active
                                                            ? "border-emerald-500/50 bg-emerald-500/5"
                                                            : "border-border bg-card",
                                                    )}
                                                >
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-foreground">
                                                            {p.label ? `${p.label} · ` : ""}
                                                            {p.name}
                                                            {isCard && p.terminalEnabled ? (
                                                                <span className="ml-1 text-muted-foreground">· POS</span>
                                                            ) : null}
                                                        </span>
                                                        <PosNumpadField
                                                            value={p.amount}
                                                            onValueChange={(n) => onUpdatePaymentAmount(p.id, n)}
                                                            min={0}
                                                            decimals={2}
                                                            title={p.label ? `${p.label} · ${p.name}` : p.name}
                                                            okLabel={rk("confirm")}
                                                            cancelLabel={rk("cancel")}
                                                            clearLabel={rk("numpad.clear")}
                                                            align="right"
                                                            buttonClassName="flex h-7 w-20 items-center justify-end rounded-md border border-input bg-background px-2 text-sm font-semibold"
                                                        />
                                                        <button
                                                            type="button"
                                                            className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onRemovePayment(p.id);
                                                            }}
                                                            aria-label={rk("remove")}
                                                        >
                                                            <Trash2 className="size-3.5" />
                                                        </button>
                                                    </div>
                                                    {isCard && p.terminalEnabled && (
                                                        <div className="mt-1 text-[10px] text-muted-foreground">
                                                            {p.terminalProvider === "local_http"
                                                                ? rk("terminal.localHttpHint")
                                                                : rk("terminal.manualHint")}
                                                            {p.terminalHost
                                                                ? ` · ${p.terminalHost}${p.terminalPort ? `:${p.terminalPort}` : ""}`
                                                                : ""}
                                                        </div>
                                                    )}
                                                    {isCash && active && (
                                                        <div className="mt-1 flex flex-wrap gap-1">
                                                            {cashQuickAmounts.map((amt) => (
                                                                <button
                                                                    key={amt}
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onBumpPaymentAmount(amt);
                                                                    }}
                                                                    className="rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-foreground/80 hover:border-emerald-500/40 hover:text-emerald-600 dark:hover:text-emerald-400"
                                                                >
                                                                    {formatQuickAmount(amt)}
                                                                </button>
                                                            ))}
                                                            {remaining > 0.001 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onSetExactPayment();
                                                                    }}
                                                                    className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                                                                >
                                                                    {rk("exact")}
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}

                        {!showPayment && (
                            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                <span>{rk("paymentMethods")}</span>
                                <span className="font-medium text-foreground">
                                    {payments.length
                                        ? payments.length === 1
                                            ? payments[0].name
                                            : `${payments.length} ${rk("splitPayments")}`
                                        : paymentMethods[0]?.name ?? "—"}
                                </span>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-1 text-[11px] tabular-nums">
                            <div className="flex items-center justify-between rounded-md border border-border bg-muted/40 px-2 py-1">
                                <span className="text-muted-foreground">{rk("remaining")}</span>
                                <span
                                    className={cn(
                                        "font-bold",
                                        remaining > 0.001
                                            ? "text-amber-600 dark:text-amber-400"
                                            : "text-emerald-600 dark:text-emerald-400",
                                    )}
                                >
                                    {money(remaining)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between rounded-md border border-border bg-muted/40 px-2 py-1">
                                <span className="text-muted-foreground">{rk("change")}</span>
                                <span
                                    className={cn(
                                        "font-bold",
                                        change > 0.001
                                            ? "text-emerald-600 dark:text-emerald-400"
                                            : "text-muted-foreground",
                                    )}
                                >
                                    {money(change)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <Button
                        className={cn(
                            "h-10 w-full text-sm font-bold tracking-wide transition-colors",
                            !canPay
                                ? "bg-muted text-muted-foreground"
                                : payArmed
                                  ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20 hover:bg-amber-400"
                                  : "bg-emerald-600 text-white shadow-md shadow-emerald-600/15 hover:bg-emerald-500 dark:bg-emerald-500 dark:text-zinc-950 dark:shadow-emerald-500/15 dark:hover:bg-emerald-400",
                        )}
                        onClick={onRequestPay}
                        disabled={!canPay}
                        title="F2"
                    >
                        {paying
                            ? usesTerminal
                                ? rk("terminal.charging")
                                : rk("busy")
                            : payArmed
                              ? `${rk("payConfirm")}  ${money(payableTotal)}  (${payArmSecondsLeft})`
                              : usesTerminal
                                ? `${rk("terminal.charge")}  ${money(payableTotal)}`
                                : itemsSplitActive
                                  ? `${rk("split.payShare")}  ${money(payableTotal)}`
                                  : `${rk("pay")}  ${money(payableTotal)}`}
                    </Button>
                    <div className="text-center text-[10px] text-muted-foreground">
                        {payArmed
                            ? rk("payConfirmHint").replace("{n}", String(payArmSecondsLeft))
                            : rk("shortcuts.hint")}
                    </div>
                </div>
            </div>
        </aside>
    );
}
