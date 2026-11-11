import {useCallback, useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction} from "react";
import {toast} from "sonner";
import {requestFromApi} from "@coreModule/helpers/apiClient/requestFromApi.ts";
import {isAbortError} from "@coreModule/helpers/general/errors.ts";
import {generateUUID} from "@coreModule/helpers/general/uuid.ts";
import type {PosManagerAuth} from "@eCommerceModule/clients/panel/private/pos/usePosManagerPin.ts";
import {
    type CartLine,
    type PaymentLine,
    type ReceiptPayload,
    parseCashQuickAmounts,
    lineTotal,
} from "@eCommerceModule/clients/panel/private/pos/posTypes.ts";
import type {PosConfig} from "armonia/src/modules/eCommerce/api/eCommerce/private/posConfig/posConfig.dto.ts";
import type {PosOrder} from "armonia/src/modules/eCommerce/api/eCommerce/private/posOrder/posOrder.dto.ts";
import type {PosSession} from "armonia/src/modules/eCommerce/api/eCommerce/private/posSession/posSession.dto.ts";
import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {addMoney, allocateMinor, minorToNumber, percentOfMoney, prorateMoney, roundToCurrency, subtractMoney, toMinor} from "armonia/src/modules/core/helpers/money.ts";

type ResolveManagerPin = (
    needed: boolean,
    titleKey: string,
) => Promise<PosManagerAuth | null | undefined>;

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

type Args = {
    session: PosSession | null;
    config: PosConfig | null;
    cart: CartLine[];
    setCart: Dispatch<SetStateAction<CartLine[]>>;
    orderDiscountPercent: number;
    customerId: string | null;
    customerName: string;
    showCustomer: boolean;
    heldOrderId: string | null;
    currencyCode?: string;
    resolveLanguageKey: ResolveLanguageKey;
    resolveManagerPin: ResolveManagerPin;
    clearOrder: () => void;
    showReceipt: (receipt: ReceiptPayload) => void;
    setSession: (session: PosSession) => void;
};

export function usePosPayments({
    session,
    config,
    cart,
    setCart,
    orderDiscountPercent,
    customerId,
    customerName,
    showCustomer,
    heldOrderId,
    currencyCode,
    resolveLanguageKey,
    resolveManagerPin,
    clearOrder,
    showReceipt,
    setSession,
}: Args) {
    const rk = (key: string) => String(resolveLanguageKey(key) ?? key);

    const [showPayment, setShowPayment] = useState(false);
    const [payments, setPayments] = useState<PaymentLine[]>([]);
    const [activePaymentId, setActivePaymentId] = useState<string | null>(null);
    const [splitOpen, setSplitOpen] = useState(false);
    const [splitMode, setSplitMode] = useState<"equal" | "items">("equal");
    const [splitGuests, setSplitGuests] = useState(2);
    const [itemsSplitActive, setItemsSplitActive] = useState(false);
    const [splitSelection, setSplitSelection] = useState<Record<string, number>>({});
    const [paying, setPaying] = useState(false);
    const [payArmed, setPayArmed] = useState(false);
    const [payArmSecondsLeft, setPayArmSecondsLeft] = useState(0);
    const payArmedRef = useRef(false);
    const payArmTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const payRequestIdRef = useRef<string | null>(null);
    const terminalAbortRef = useRef<AbortController | null>(null);

    const abortTerminalCharges = useCallback(() => {
        terminalAbortRef.current?.abort();
        terminalAbortRef.current = null;
        setPaying(false);
    }, []);

    const paymentMethods = useMemo<PaymentMethodOption[]>(
        () =>
            (config?.paymentMethods ?? [])
                .filter((m) => m.isActive !== false)
                .map((m) => ({
                    _id: m._id,
                    name: m.name,
                    type: m.type as string | undefined,
                    cashQuickAmounts: m.cashQuickAmounts,
                    terminalEnabled: m.terminalEnabled,
                    terminalProvider: m.terminalProvider,
                    terminalProtocol: m.terminalProtocol,
                    terminalHost: m.terminalHost,
                    terminalPort: m.terminalPort,
                    terminalId: m.terminalId,
                    terminalPath: m.terminalPath,
                })),
        [config?.paymentMethods],
    );

    const paidAmount = useMemo(
        () => addMoney(...payments.map((p) => Math.max(0, Number(p.amount) || 0))),
        [payments],
    );

    const activePayment = useMemo(
        () => payments.find((p) => p.id === activePaymentId) ?? payments[payments.length - 1] ?? null,
        [payments, activePaymentId],
    );
    const usesTerminal = payments.some(
        (p) => (p.type === "card" || p.type === "bank") && !!p.terminalEnabled && p.amount > 0,
    );
    const cashQuickAmounts = useMemo(
        () => parseCashQuickAmounts(activePayment?.type === "cash" ? activePayment.cashQuickAmounts : undefined),
        [activePayment],
    );

    const shareLines = useMemo(() => {
        if (!itemsSplitActive) return [] as CartLine[];
        return cart
            .map((line) => {
                const qty = Math.min(line.quantity, Math.max(0, splitSelection[line.key] ?? 0));
                if (qty <= 0) return null;
                return {...line, quantity: qty};
            })
            .filter(Boolean) as CartLine[];
    }, [cart, itemsSplitActive, splitSelection]);

    const shareSubtotal = useMemo(() => addMoney(...shareLines.map(lineTotal)), [shareLines]);
    const shareDiscountAmount = useMemo(
        () => percentOfMoney(shareSubtotal, Math.min(100, Math.max(0, orderDiscountPercent))),
        [shareSubtotal, orderDiscountPercent],
    );
    const shareTotal = useMemo(
        () => Math.max(0, subtractMoney(shareSubtotal, shareDiscountAmount)),
        [shareSubtotal, shareDiscountAmount],
    );

    const cartSubtotal = useMemo(() => addMoney(...cart.map(lineTotal)), [cart]);
    const cartDiscountAmount = useMemo(
        () => percentOfMoney(cartSubtotal, Math.min(100, Math.max(0, orderDiscountPercent))),
        [cartSubtotal, orderDiscountPercent],
    );
    const total = useMemo(
        () => Math.max(0, subtractMoney(cartSubtotal, cartDiscountAmount)),
        [cartSubtotal, cartDiscountAmount],
    );

    const payableTotal = itemsSplitActive ? shareTotal : total;
    const remaining = useMemo(() => Math.max(0, subtractMoney(payableTotal, paidAmount)), [payableTotal, paidAmount]);
    const change = useMemo(() => Math.max(0, subtractMoney(paidAmount, payableTotal)), [paidAmount, payableTotal]);

    const equalPerPerson = useMemo(() => {
        const n = Math.max(2, Math.min(20, splitGuests || 2));
        return prorateMoney(total, 1, n);
    }, [total, splitGuests]);

    useEffect(() => {
        if (!paymentMethods.length) {
            setPayments([]);
            setActivePaymentId(null);
            return;
        }
        setPayments((prev) => {
            const next = prev.filter((p) => paymentMethods.some((m) => m._id === p.paymentMethodId));
            return next.length === prev.length ? prev : next;
        });
    }, [paymentMethods]);

    useEffect(() => {
        if (!cart.length) {
            setPayments([]);
            setActivePaymentId(null);
            return;
        }
        setPayments((prev) => {
            if (prev.length !== 1) return prev;
            const only = prev[0];
            const target = roundToCurrency(payableTotal);
            if (only.type === "cash") {
                if (only.amount <= 0 || only.amount < target - 0.001) {
                    return [{...only, amount: target}];
                }
                return prev;
            }
            return [{...only, amount: target}];
        });
    }, [payableTotal, cart.length]);

    const disarmPay = useCallback(() => {
        payArmedRef.current = false;
        setPayArmed(false);
        setPayArmSecondsLeft(0);
        if (payArmTimerRef.current) {
            clearInterval(payArmTimerRef.current);
            payArmTimerRef.current = null;
        }
    }, []);

    useEffect(() => {
        disarmPay();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional narrow reset triggers
    }, [cart.length, payableTotal, paidAmount, itemsSplitActive, disarmPay]);

    useEffect(() => {
        return () => {
            if (payArmTimerRef.current) clearInterval(payArmTimerRef.current);
        };
    }, []);

    const clearPayments = useCallback(() => {
        setPayments([]);
        setActivePaymentId(null);
        setItemsSplitActive(false);
        setSplitSelection({});
        payRequestIdRef.current = null;
        disarmPay();
    }, [disarmPay]);

    const cancelItemsSplit = () => {
        setItemsSplitActive(false);
        setSplitSelection({});
    };

    const bumpSplitQty = (key: string, delta: number, maxQty: number) => {
        setSplitSelection((prev) => {
            const next = Math.max(0, Math.min(maxQty, (prev[key] ?? 0) + delta));
            if (next <= 0) {
                const {[key]: _removed, ...rest} = prev;
                return rest;
            }
            return {...prev, [key]: next};
        });
    };

    const makePaymentLine = (methodId: string, amount: number): PaymentLine | null => {
        const method = paymentMethods.find((m) => m._id === methodId);
        if (!method) return null;
        return {
            id: generateUUID(),
            paymentMethodId: method._id,
            name: method.name,
            type: method.type,
            amount: roundToCurrency(Math.max(0, amount)),
            terminalEnabled: method.terminalEnabled,
            terminalProvider: method.terminalProvider,
            terminalProtocol: method.terminalProtocol,
            terminalHost: method.terminalHost,
            terminalPort: method.terminalPort,
            terminalId: method.terminalId,
            terminalPath: method.terminalPath,
            cashQuickAmounts: method.cashQuickAmounts,
        };
    };

    const applyEqualSplit = () => {
        const n = Math.max(2, Math.min(20, Math.floor(splitGuests) || 2));
        const first = paymentMethods[0];
        if (!first || total <= 0) {
            toast.error(rk("errors.splitFailed"));
            return;
        }
        // Shares that add up to the total exactly; leftover cents go to the first guests (D35).
        const amounts = allocateMinor(toMinor(total), n).map((share) => minorToNumber(share));
        const lines = amounts
            .map((amt, idx) => {
                const line = makePaymentLine(first._id, amt);
                if (!line) return null;
                return {...line, label: `${rk("split.guest")} ${idx + 1}`};
            })
            .filter(Boolean) as PaymentLine[];
        setPayments(lines);
        setActivePaymentId(lines[0]?.id ?? null);
        setShowPayment(true);
        setItemsSplitActive(false);
        setSplitSelection({});
        setSplitOpen(false);
        toast.success(rk("toast.splitApplied"));
    };

    const startItemsSplit = () => {
        setItemsSplitActive(true);
        setSplitSelection({});
        setPayments([]);
        setActivePaymentId(null);
        setShowPayment(true);
        setSplitOpen(false);
    };

    const addPaymentMethod = (methodId: string) => {
        if (activePayment && payments.length > 1 && remaining < 0.001) {
            const replacement = makePaymentLine(methodId, activePayment.amount);
            if (!replacement) return;
            setPayments((prev) =>
                prev.map((p) =>
                    p.id === activePayment.id
                        ? {...replacement, id: p.id, label: p.label, amount: p.amount}
                        : p,
                ),
            );
            setShowPayment(true);
            return;
        }
        const amount = remaining > 0.001 ? roundToCurrency(remaining) : 0;
        const line = makePaymentLine(methodId, amount);
        if (!line) return;
        setPayments((prev) => [...prev, line]);
        setActivePaymentId(line.id);
        setShowPayment(true);
    };

    const updatePaymentAmount = (id: string, amount: number) => {
        setPayments((prev) =>
            prev.map((p) => (p.id === id ? {...p, amount: roundToCurrency(Math.max(0, amount))} : p)),
        );
    };

    const removePayment = (id: string) => {
        setPayments((prev) => {
            const next = prev.filter((p) => p.id !== id);
            if (activePaymentId === id) setActivePaymentId(next[next.length - 1]?.id ?? null);
            return next;
        });
    };

    const bumpPaymentAmount = (extra: number) => {
        const targetId = activePayment?.type === "cash" ? activePayment.id : payments.find((p) => p.type === "cash")?.id;
        if (!targetId) return;
        setPayments((prev) =>
            prev.map((p) =>
                p.id === targetId ? {...p, amount: addMoney(Math.max(0, p.amount), extra)} : p,
            ),
        );
        setActivePaymentId(targetId);
    };

    const setExactPayment = () => {
        const targetId = activePayment?.id ?? payments[payments.length - 1]?.id;
        if (!targetId) return;
        setPayments((prev) => {
            const others = addMoney(...prev.filter((p) => p.id !== targetId).map((p) => p.amount));
            const exact = Math.max(0, subtractMoney(payableTotal, others));
            return prev.map((p) => (p.id === targetId ? {...p, amount: exact} : p));
        });
    };

    const ensurePaymentsForPay = (targetTotal: number): PaymentLine[] => {
        if (payments.length) return payments.filter((p) => p.amount > 0);
        const first = paymentMethods[0];
        if (!first) return [];
        const line = makePaymentLine(first._id, roundToCurrency(targetTotal));
        return line ? [line] : [];
    };

    const canPayFull =
        !!session &&
        cart.length > 0 &&
        !itemsSplitActive &&
        (payments.length > 0 ? paidAmount + 0.001 >= total : !!paymentMethods.length) &&
        !paying;

    const canPayShare =
        !!session &&
        itemsSplitActive &&
        shareLines.length > 0 &&
        shareTotal > 0 &&
        (payments.length > 0 ? paidAmount + 0.001 >= shareTotal : !!paymentMethods.length) &&
        !paying;

    const canPay = itemsSplitActive ? canPayShare : canPayFull;

    const pay = async () => {
        if (!session || !canPay) return;

        const payingShare = itemsSplitActive;
        const orderLines = payingShare ? shareLines : cart;
        const targetTotal = payingShare ? shareTotal : total;
        const tenderLines = ensurePaymentsForPay(targetTotal);
        const tenderTotal = addMoney(...tenderLines.map((p) => p.amount));
        if (!tenderLines.length || tenderTotal + 0.001 < targetTotal) return;
        if (payments.length > 0 && paidAmount + 0.001 < targetTotal) return;

        const hasDiscount = orderDiscountPercent > 0 || orderLines.some((l) => l.discountPercent > 0);
        let managerPin: string | undefined;
        let managerId: string | undefined;
        if (hasDiscount && config?.pinForDiscount && config?.hasManagerPin) {
            const auth = await resolveManagerPin(true, "pin.discount");
            if (auth === null) return;
            managerPin = auth?.pin;
            managerId = auth?.managerId;
        }

        setPaying(true);
        if (!payRequestIdRef.current) {
            payRequestIdRef.current = generateUUID();
        }
        const abort = new AbortController();
        terminalAbortRef.current = abort;
        try {
            const charged: {
                paymentMethodId: string;
                amount: number;
                terminalAuthCode?: string;
                terminalReference?: string;
                terminalId?: string;
            }[] = [];

            for (const line of tenderLines) {
                const needsTerminal =
                    (line.type === "card" || line.type === "bank") && !!line.terminalEnabled && line.amount > 0;
                if (needsTerminal) {
                    // Awaited chain with the cashier's abort (the kill switch); errors are handled below, so silent.
                    const termRes = await requestFromApi<{
                        data: {authCode?: string; reference?: string; terminalId?: string};
                    }>({
                        method: "post",
                        url: "/api/eCommerce/pos/chargeTerminal",
                        data: {
                            sessionId: session._id,
                            paymentMethodId: line.paymentMethodId,
                            amount: roundToCurrency(line.amount),
                            currency: currencyCode,
                        },
                        signal: abort.signal,
                        silent: true,
                    });
                    charged.push({
                        paymentMethodId: line.paymentMethodId,
                        amount: roundToCurrency(line.amount),
                        terminalAuthCode: termRes.data.authCode,
                        terminalReference: termRes.data.reference,
                        terminalId: termRes.data.terminalId || line.terminalId,
                    });
                } else {
                    charged.push({
                        paymentMethodId: line.paymentMethodId,
                        amount: roundToCurrency(line.amount),
                        terminalId: line.terminalId,
                    });
                }
            }

            const res = await requestFromApi<{
                data: {order: PosOrder; receipt: ReceiptPayload; session: PosSession};
            }>({method: "post", url: "/api/eCommerce/posOrder/pay", silent: true, data: {
                sessionId: session._id,
                customerId: customerId || undefined,
                customerName: showCustomer && customerName.trim() ? customerName.trim() : undefined,
                discountPercent: orderDiscountPercent > 0 ? orderDiscountPercent : undefined,
                note: payingShare ? rk("split.shareNote") : undefined,
                heldOrderId: !payingShare && heldOrderId ? heldOrderId : undefined,
                clientRequestId: payRequestIdRef.current,
                managerPin,
                managerId,
                lines: orderLines.map((l) => ({
                    productId: l.productId,
                    variantId: l.variantId,
                    quantity: l.quantity,
                    unitPrice: l.unitPrice,
                    discountPercent: l.discountPercent > 0 ? l.discountPercent : undefined,
                })),
                payments: charged,
            }});
            setSession(res.data.session);
            showReceipt(res.data.receipt);
            payRequestIdRef.current = null;

            if (payingShare) {
                setCart((prev) => {
                    const next = prev
                        .map((line) => {
                            const taken = splitSelection[line.key] ?? 0;
                            if (taken <= 0) return line;
                            return {...line, quantity: line.quantity - taken};
                        })
                        .filter((line) => line.quantity > 0);
                    if (!next.length) {
                        setItemsSplitActive(false);
                    }
                    return next;
                });
                setPayments([]);
                setActivePaymentId(null);
                setSplitSelection({});
                toast.success(rk("toast.sharePaid"));
            } else {
                clearOrder();
                toast.success(rk("toast.paid"));
            }
        } catch (err) {
            if (isAbortError(err, abort.signal)) {
                toast.message(rk("paused.banner"));
            } else {
                toast.error(usesTerminal ? rk("errors.terminalFailed") : rk("errors.payFailed"));
            }
        } finally {
            if (terminalAbortRef.current === abort) terminalAbortRef.current = null;
            setPaying(false);
        }
    };

    const requestPay = () => {
        if (!session || paying) return;
        const ready = itemsSplitActive
            ? shareLines.length > 0 &&
              shareTotal > 0 &&
              (payments.length > 0 ? paidAmount + 0.001 >= shareTotal : !!paymentMethods.length)
            : cart.length > 0 &&
              (payments.length > 0 ? paidAmount + 0.001 >= total : !!paymentMethods.length);
        if (!ready) return;

        if (!payArmedRef.current) {
            const ARM_SECONDS = 4;
            payArmedRef.current = true;
            setPayArmed(true);
            setPayArmSecondsLeft(ARM_SECONDS);
            if (payArmTimerRef.current) clearInterval(payArmTimerRef.current);
            payArmTimerRef.current = setInterval(() => {
                setPayArmSecondsLeft((prev) => {
                    const next = prev - 1;
                    if (next <= 0) {
                        payArmedRef.current = false;
                        setPayArmed(false);
                        if (payArmTimerRef.current) {
                            clearInterval(payArmTimerRef.current);
                            payArmTimerRef.current = null;
                        }
                        return 0;
                    }
                    return next;
                });
            }, 1000);
            return;
        }

        payArmedRef.current = false;
        setPayArmed(false);
        setPayArmSecondsLeft(0);
        if (payArmTimerRef.current) {
            clearInterval(payArmTimerRef.current);
            payArmTimerRef.current = null;
        }
        void pay();
    };

    return {
        showPayment,
        setShowPayment,
        payments,
        activePaymentId,
        setActivePaymentId,
        splitOpen,
        setSplitOpen,
        splitMode,
        setSplitMode,
        splitGuests,
        setSplitGuests,
        itemsSplitActive,
        splitSelection,
        paying,
        payArmed,
        payArmSecondsLeft,
        paymentMethods,
        paidAmount,
        activePayment,
        usesTerminal,
        cashQuickAmounts,
        shareTotal,
        payableTotal,
        remaining,
        change,
        equalPerPerson,
        canPay,
        clearPayments,
        disarmPay,
        abortTerminalCharges,
        cancelItemsSplit,
        bumpSplitQty,
        applyEqualSplit,
        startItemsSplit,
        addPaymentMethod,
        updatePaymentAmount,
        removePayment,
        bumpPaymentAmount,
        setExactPayment,
        requestPay,
        // expose cancel items split reset for resumeHeld
        resetSplitOnResume: () => {
            setItemsSplitActive(false);
            setSplitSelection({});
        },
    };
}
