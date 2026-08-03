import {Trash2} from "lucide-react";
import {Button} from "@coreModule/components/ui/button.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import PosNumpadField from "@eCommerceModule/clients/panel/private/pos/PosNumpad.tsx";
import {type PaymentLine, formatQuickAmount} from "@eCommerceModule/clients/panel/private/pos/posTypes.ts";

type PaymentMethodOption = {
    _id: string;
    name: string;
    type?: string;
};

type Props = {
    cartHasItems: boolean;
    showPayment: boolean;
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
    itemsSplitActive: boolean;
    money: (n: number) => string;
    rk: (key: string) => string;
    onAddPaymentMethod: (methodId: string) => void;
    onActivePaymentIdChange: (id: string) => void;
    onUpdatePaymentAmount: (id: string, amount: number) => void;
    onRemovePayment: (id: string) => void;
    onBumpPaymentAmount: (amount: number) => void;
    onSetExactPayment: () => void;
    onRequestPay: () => void;
};

export default function PosPaymentSection({
    cartHasItems,
    showPayment,
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
    itemsSplitActive,
    money,
    rk,
    onAddPaymentMethod,
    onActivePaymentIdChange,
    onUpdatePaymentAmount,
    onRemovePayment,
    onBumpPaymentAmount,
    onSetExactPayment,
    onRequestPay,
}: Props) {
    return (
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
                                disabled={!cartHasItems}
                                onClick={() => onAddPaymentMethod(m._id)}
                                className={cn(
                                    "flex h-8 items-center justify-center rounded-lg border text-xs font-semibold transition-colors",
                                    "border-border bg-card text-foreground hover:border-success/40 hover:bg-muted",
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
                                const active =
                                    activePaymentId === p.id || (!activePaymentId && p.id === activePayment?.id);
                                const isCash = p.type === "cash";
                                const isCard = p.type === "card" || p.type === "bank";
                                return (
                                    <div
                                        key={p.id}
                                        onClick={() => onActivePaymentIdChange(p.id)}
                                        className={cn(
                                            "rounded-md border px-2 py-1.5 transition-colors",
                                            active
                                                ? "border-success/50 bg-success/5"
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
                                                    ? ` · ${p.terminalProtocol === "https" ? "https://" : ""}${p.terminalHost}${p.terminalPort ? `:${p.terminalPort}` : ""}`
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
                                                        className="rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-foreground/80 hover:border-success/40 hover:text-success"
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
                                                        className="rounded-md border border-success/30 bg-success/10 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-success hover:bg-success/20"
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
                                ? "text-warning"
                                : "text-success",
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
                                ? "text-success"
                                : "text-muted-foreground",
                        )}
                    >
                        {money(change)}
                    </span>
                </div>
            </div>

            <Button
                className={cn(
                    "h-10 w-full text-sm font-bold tracking-wide transition-colors",
                    !canPay
                        ? "bg-muted text-muted-foreground"
                        : payArmed
                          ? "bg-warning text-foreground shadow-md shadow-warning/20 hover:bg-warning/20"
                          : "bg-success text-white shadow-md shadow-success/15 hover:bg-success dark:text-foreground dark:hover:bg-success/20",
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
    );
}
