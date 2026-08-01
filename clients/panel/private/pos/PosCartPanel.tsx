import type {RefObject} from "react";
import {
    CreditCard,
    Pause,
    Percent,
    Scissors,
    ShoppingBag,
    UserRound,
} from "lucide-react";
import {Button} from "@coreModule/components/ui/button.tsx";
import PosNumpadField from "@eCommerceModule/clients/panel/private/pos/PosNumpad.tsx";
import PosCustomerSearch from "@eCommerceModule/clients/panel/private/pos/PosCustomerSearch.tsx";
import PosCartLine from "@eCommerceModule/clients/panel/private/pos/PosCartLine.tsx";
import PosPaymentSection from "@eCommerceModule/clients/panel/private/pos/PosPaymentSection.tsx";
import {
    type CartLine,
    type PaymentLine,
    type PosCustomerHit,
} from "@eCommerceModule/clients/panel/private/pos/posTypes.ts";

type PaymentMethodOption = {
    _id: string;
    name: string;
    type?: string;
    cashQuickAmounts?: string;
    terminalEnabled?: boolean;
    terminalProvider?: string;
    terminalProtocol?: string;
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
                {cart.map((line) => (
                    <PosCartLine
                        key={line.key}
                        line={line}
                        selected={selectedLineKey === line.key}
                        itemsSplitActive={itemsSplitActive}
                        shareQty={splitSelection[line.key] ?? 0}
                        showLineDiscount={showLineDiscount}
                        allowDiscount={allowDiscount}
                        allowQuantityChange={allowQuantityChange}
                        money={money}
                        rk={rk}
                        onSelect={() => onSelectLine(line.key)}
                        onBumpSplitQty={(delta) => onBumpSplitQty(line.key, delta, line.quantity)}
                        onUpdateLineQty={(delta) => onUpdateLineQty(line.key, delta)}
                        onSetLineQty={(qty) => onSetLineQty(line.key, qty)}
                        onSetLineDiscount={(percent) => onSetLineDiscount(line.key, percent)}
                        onRemove={() => onRemoveLine(line.key)}
                    />
                ))}
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

                    <PosPaymentSection
                        cartHasItems={cart.length > 0}
                        showPayment={showPayment}
                        payments={payments}
                        paymentMethods={paymentMethods}
                        activePaymentId={activePaymentId}
                        activePayment={activePayment}
                        cashQuickAmounts={cashQuickAmounts}
                        remaining={remaining}
                        change={change}
                        canPay={canPay}
                        paying={paying}
                        payArmed={payArmed}
                        payArmSecondsLeft={payArmSecondsLeft}
                        usesTerminal={usesTerminal}
                        payableTotal={payableTotal}
                        itemsSplitActive={itemsSplitActive}
                        money={money}
                        rk={rk}
                        onAddPaymentMethod={onAddPaymentMethod}
                        onActivePaymentIdChange={onActivePaymentIdChange}
                        onUpdatePaymentAmount={onUpdatePaymentAmount}
                        onRemovePayment={onRemovePayment}
                        onBumpPaymentAmount={onBumpPaymentAmount}
                        onSetExactPayment={onSetExactPayment}
                        onRequestPay={onRequestPay}
                    />
                </div>
            </div>
        </aside>
    );
}
