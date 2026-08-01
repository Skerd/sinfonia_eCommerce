import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {toast} from "sonner";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import type {PosManagerAuth} from "@eCommerceModule/clients/panel/private/pos/usePosManagerPin.ts";
import type {
    CartLine,
    CatalogProduct,
    CatalogVariant,
} from "@eCommerceModule/clients/panel/private/pos/posTypes.ts";
import {lineTotal} from "@eCommerceModule/clients/panel/private/pos/posTypes.ts";
import type {PosConfig} from "armonia/src/modules/eCommerce/api/eCommerce/private/posConfig/posConfig.dto.ts";
import type {PosOrder} from "armonia/src/modules/eCommerce/api/eCommerce/private/posOrder/posOrder.dto.ts";
import type {PosSession} from "armonia/src/modules/eCommerce/api/eCommerce/private/posSession/posSession.dto.ts";

type ResolveManagerPin = (
    needed: boolean,
    titleKey: string,
) => Promise<PosManagerAuth | null | undefined>;

type Args = {
    session: PosSession | null;
    config: PosConfig | null;
    resolveLanguageKey: (key: string) => unknown;
    resolveManagerPin: ResolveManagerPin;
    isDiscountUnlocked: () => boolean;
    markDiscountUnlocked: () => void;
    focusBarcode: () => void;
    onClearPayments: () => void;
    onDisarmPay: () => void;
};

export function usePosCart({
    session,
    config,
    resolveLanguageKey,
    resolveManagerPin,
    isDiscountUnlocked,
    markDiscountUnlocked,
    focusBarcode,
    onClearPayments,
    onDisarmPay,
}: Args) {
    const rk = (key: string) => String(resolveLanguageKey(key) ?? key);

    const [cart, setCart] = useState<CartLine[]>([]);
    const [orderDiscountPercent, setOrderDiscountPercent] = useState(0);
    const [customerName, setCustomerName] = useState("");
    const [customerId, setCustomerId] = useState<string | null>(null);
    const [showCustomer, setShowCustomer] = useState(false);
    const [showLineDiscount, setShowLineDiscount] = useState(false);
    const [flashKey, setFlashKey] = useState<string | null>(null);
    const [selectedLineKey, setSelectedLineKey] = useState<string | null>(null);
    const [heldOrderId, setHeldOrderId] = useState<string | null>(null);
    const [holdBusy, setHoldBusy] = useState(false);
    const [heldOpen, setHeldOpen] = useState(false);
    const [heldOrders, setHeldOrders] = useState<PosOrder[]>([]);
    const [heldBusy, setHeldBusy] = useState(false);
    const cartScrollRef = useRef<HTMLDivElement>(null);
    const prevCartLenRef = useRef(0);

    const itemCount = useMemo(() => cart.reduce((sum, line) => sum + line.quantity, 0), [cart]);
    const subtotal = useMemo(() => cart.reduce((sum, line) => sum + lineTotal(line), 0), [cart]);
    const orderDiscountAmount = useMemo(
        () => subtotal * (Math.min(100, Math.max(0, orderDiscountPercent)) / 100),
        [subtotal, orderDiscountPercent],
    );
    const total = useMemo(() => Math.max(0, subtotal - orderDiscountAmount), [subtotal, orderDiscountAmount]);

    useEffect(() => {
        if (!flashKey) return;
        const t = window.setTimeout(() => setFlashKey(null), 450);
        return () => window.clearTimeout(t);
    }, [flashKey]);

    useEffect(() => {
        if (cart.length > prevCartLenRef.current) {
            cartScrollRef.current?.scrollTo({top: cartScrollRef.current.scrollHeight, behavior: "smooth"});
        }
        prevCartLenRef.current = cart.length;
    }, [cart.length]);

    const clearOrder = useCallback(() => {
        setCart([]);
        onClearPayments();
        setOrderDiscountPercent(0);
        setCustomerName("");
        setCustomerId(null);
        setShowCustomer(false);
        setSelectedLineKey(null);
        setHeldOrderId(null);
        onDisarmPay();
        focusBarcode();
    }, [focusBarcode, onClearPayments, onDisarmPay]);

    const addCartLine = useCallback(
        (product: CatalogProduct, qty: number, variant?: CatalogVariant) => {
            const allowOversell = !!config?.allowOversell;
            const track = variant ? !!variant.trackInventory : !!product.trackInventory;
            const stock = variant?.stockQty ?? product.stockQty;
            const key = variant ? `${product._id}:${variant._id}` : product._id;
            const title = variant ? `${product.title} · ${variant.label}` : product.title;
            const unitPrice = Number(variant?.price ?? product.price) || 0;
            const sku = variant?.sku ?? product.sku;

            setCart((prev) => {
                const existing = prev.find((l) => l.key === key);
                const nextQty = (existing?.quantity ?? 0) + qty;
                if (track && stock != null && !allowOversell && nextQty > stock + 0.0001) {
                    toast.error(rk("errors.insufficientStock"));
                    return prev;
                }
                setFlashKey(key);
                setSelectedLineKey(key);
                if (existing) {
                    return prev.map((l) => (l.key === key ? {...l, quantity: nextQty} : l));
                }
                return [
                    ...prev,
                    {
                        key,
                        productId: product._id,
                        variantId: variant?._id,
                        title,
                        sku,
                        unitPrice,
                        quantity: qty,
                        discountPercent: 0,
                        trackInventory: track,
                        stockQty: stock,
                    },
                ];
            });
            focusBarcode();
        },
        [config?.allowOversell, focusBarcode, resolveLanguageKey],
    );

    const ensureDiscountUnlocked = async (): Promise<boolean> => {
        if (!config?.pinForDiscount || !config?.hasManagerPin) return true;
        if (isDiscountUnlocked()) return true;
        const auth = await resolveManagerPin(true, "pin.discount");
        if (auth === null) return false;
        markDiscountUnlocked();
        return true;
    };

    const setLineDiscount = async (key: string, discountPercent: number) => {
        if (discountPercent > 0) {
            const ok = await ensureDiscountUnlocked();
            if (!ok) return;
        }
        setCart((prev) =>
            prev.map((l) =>
                l.key === key ? {...l, discountPercent: Math.min(100, Math.max(0, discountPercent))} : l,
            ),
        );
    };

    const setOrderDiscount = async (n: number) => {
        const next = Math.min(100, Math.max(0, n));
        if (next > 0) {
            const ok = await ensureDiscountUnlocked();
            if (!ok) return;
        }
        setOrderDiscountPercent(next);
    };

    const toggleLineDiscount = async () => {
        if (!showLineDiscount) {
            const ok = await ensureDiscountUnlocked();
            if (!ok) return;
        }
        setShowLineDiscount((v) => !v);
    };

    const updateLineQty = (key: string, delta: number) => {
        setSelectedLineKey(key);
        setCart((prev) => {
            const allowOversell = !!config?.allowOversell;
            return prev
                .map((l) => {
                    if (l.key !== key) return l;
                    const nextQty = Math.max(0, l.quantity + delta);
                    if (
                        delta > 0 &&
                        l.trackInventory &&
                        l.stockQty != null &&
                        !allowOversell &&
                        nextQty > l.stockQty + 0.0001
                    ) {
                        toast.error(rk("errors.insufficientStock"));
                        return l;
                    }
                    return {...l, quantity: nextQty};
                })
                .filter((l) => l.quantity > 0);
        });
    };

    const setLineQty = (key: string, quantity: number) => {
        const q = Math.max(0, quantity);
        setSelectedLineKey(key);
        setCart((prev) => {
            const allowOversell = !!config?.allowOversell;
            return prev
                .map((l) => {
                    if (l.key !== key) return l;
                    if (l.trackInventory && l.stockQty != null && !allowOversell && q > l.stockQty + 0.0001) {
                        toast.error(rk("errors.insufficientStock"));
                        return l;
                    }
                    return {...l, quantity: q};
                })
                .filter((l) => l.quantity > 0);
        });
    };

    const removeLine = (key: string) => {
        setCart((prev) => prev.filter((l) => l.key !== key));
        if (selectedLineKey === key) setSelectedLineKey(null);
    };

    const bumpSelectedQty = useCallback(
        (delta: number) => {
            if (!selectedLineKey || !config?.allowQuantityChange) return;
            setCart((prev) =>
                prev
                    .map((l) => {
                        if (l.key !== selectedLineKey) return l;
                        return {...l, quantity: Math.max(0, Number((l.quantity + delta).toFixed(3)))};
                    })
                    .filter((l) => l.quantity > 0),
            );
        },
        [selectedLineKey, config?.allowQuantityChange],
    );

    const holdCart = async () => {
        if (!session || !cart.length) return;
        setHoldBusy(true);
        try {
            const res = await apiClient.post<{data: PosOrder}>("/api/eCommerce/pos/hold", {
                sessionId: session._id,
                _id: heldOrderId || undefined,
                customerId: customerId || undefined,
                customerName: showCustomer && customerName.trim() ? customerName.trim() : undefined,
                discountPercent: orderDiscountPercent > 0 ? orderDiscountPercent : undefined,
                note: heldOrderId ? undefined : undefined,
                lines: cart.map((l) => ({
                    productId: l.productId,
                    variantId: l.variantId,
                    quantity: l.quantity,
                    unitPrice: l.unitPrice,
                    discountPercent: l.discountPercent > 0 ? l.discountPercent : undefined,
                })),
            });
            setHeldOrderId(res.data.data._id);
            clearOrder();
            toast.success(rk("toast.held"));
        } catch {
            toast.error(rk("errors.holdFailed"));
        } finally {
            setHoldBusy(false);
        }
    };

    const openHeldList = async () => {
        if (!session) return;
        setHeldOpen(true);
        setHeldBusy(true);
        try {
            const res = await apiClient.post<{data: PosOrder[]}>("/api/eCommerce/pos/held", {
                sessionId: session._id,
            });
            setHeldOrders(res.data.data ?? []);
        } catch {
            toast.error(rk("errors.heldLoadFailed"));
            setHeldOrders([]);
        } finally {
            setHeldBusy(false);
        }
    };

    const resumeHeld = (order: PosOrder) => {
        setCart(
            (order.lines ?? []).map((line) => {
                const productId =
                    typeof line.product === "object" && line.product
                        ? line.product._id
                        : String(line.product ?? "");
                return {
                    key: line.variant ? `${productId}:${line.variant}` : productId,
                    productId,
                    variantId: line.variant,
                    title: line.productName,
                    sku: line.productSku,
                    unitPrice: line.unitPrice,
                    quantity: line.quantity,
                    discountPercent: line.discountPercent ?? 0,
                };
            }),
        );
        setOrderDiscountPercent(order.orderDiscountPercent ?? 0);
        setCustomerName(order.customerName ?? order.customer?.name ?? "");
        setCustomerId(order.customer?._id ?? null);
        setShowCustomer(!!(order.customerName || order.customer?._id));
        setHeldOrderId(order._id);
        onClearPayments();
        setHeldOpen(false);
        toast.success(rk("toast.resumed"));
        focusBarcode();
    };

    const discardHeld = async (id: string) => {
        try {
            await apiClient.post("/api/eCommerce/pos/held/delete", {_id: id});
            setHeldOrders((prev) => prev.filter((o) => o._id !== id));
            if (heldOrderId === id) setHeldOrderId(null);
            toast.success(rk("toast.heldDiscarded"));
        } catch {
            toast.error(rk("errors.heldDeleteFailed"));
        }
    };

    return {
        cart,
        setCart,
        cartScrollRef,
        orderDiscountPercent,
        customerName,
        setCustomerName,
        customerId,
        setCustomerId,
        showCustomer,
        setShowCustomer,
        showLineDiscount,
        flashKey,
        selectedLineKey,
        setSelectedLineKey,
        heldOrderId,
        setHeldOrderId,
        holdBusy,
        heldOpen,
        setHeldOpen,
        heldOrders,
        heldBusy,
        itemCount,
        subtotal,
        orderDiscountAmount,
        total,
        addCartLine,
        setLineDiscount,
        setOrderDiscount,
        toggleLineDiscount,
        updateLineQty,
        setLineQty,
        removeLine,
        bumpSelectedQty,
        clearOrder,
        holdCart,
        openHeldList,
        resumeHeld,
        discardHeld,
    };
}
