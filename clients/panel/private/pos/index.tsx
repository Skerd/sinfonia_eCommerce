import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {compose} from "redux";
import {useNavigate, useSearchParams} from "react-router-dom";
import {toast} from "sonner";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import Loader from "@coreModule/components/custom/loader.tsx";
import {usePosKeyboard} from "@eCommerceModule/clients/panel/private/pos/usePosKeyboard.ts";
import PosConfigPicker from "@eCommerceModule/clients/panel/private/pos/PosConfigPicker.tsx";
import PosOpenSessionDialog from "@eCommerceModule/clients/panel/private/pos/PosOpenSessionDialog.tsx";
import PosTillHeader from "@eCommerceModule/clients/panel/private/pos/PosTillHeader.tsx";
import PosCatalogPanel from "@eCommerceModule/clients/panel/private/pos/PosCatalogPanel.tsx";
import PosCartPanel from "@eCommerceModule/clients/panel/private/pos/PosCartPanel.tsx";
import PosTillDialogs from "@eCommerceModule/clients/panel/private/pos/PosTillDialogs.tsx";
import {usePosManagerPin} from "@eCommerceModule/clients/panel/private/pos/usePosManagerPin.ts";
import {
    type CatalogProduct,
    type CatalogCategory,
    type CartLine,
    type PaymentLine,
    type ReceiptPayload,
    type SessionBundle,
    type CatalogVariant,
    parseCashQuickAmounts,
    formatMoney,
    lineTotal,
} from "@eCommerceModule/clients/panel/private/pos/posTypes.ts";
import type {PosConfig} from "armonia/src/modules/eCommerce/api/eCommerce/private/posConfig/posConfig.dto.ts";
import type {PosSession} from "armonia/src/modules/eCommerce/api/eCommerce/private/posSession/posSession.dto.ts";
import type {PosOrder} from "armonia/src/modules/eCommerce/api/eCommerce/private/posOrder/posOrder.dto.ts";

function PosTill({resolveLanguageKey}: WithLanguageType) {
    const rk = (key: string) => String(resolveLanguageKey(key) ?? key);
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const configId = searchParams.get("configId") || undefined;

    const [bootLoading, setBootLoading] = useState(true);
    const [configs, setConfigs] = useState<PosConfig[]>([]);
    const [session, setSession] = useState<PosSession | null>(null);
    const [config, setConfig] = useState<PosConfig | null>(null);

    const [catalog, setCatalog] = useState<CatalogProduct[]>([]);
    const [catalogLoading, setCatalogLoading] = useState(false);
    const [categories, setCategories] = useState<CatalogCategory[]>([]);
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [barcode, setBarcode] = useState("");
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const barcodeRef = useRef<HTMLInputElement>(null);
    const cartScrollRef = useRef<HTMLDivElement>(null);

    const [cart, setCart] = useState<CartLine[]>([]);
    const [orderDiscountPercent, setOrderDiscountPercent] = useState(0);
    const [customerName, setCustomerName] = useState("");
    const [customerId, setCustomerId] = useState<string | null>(null);
    const [showCustomer, setShowCustomer] = useState(false);
    const [showLineDiscount, setShowLineDiscount] = useState(false);
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
    const [flashKey, setFlashKey] = useState<string | null>(null);
    const [selectedLineKey, setSelectedLineKey] = useState<string | null>(null);
    const prevCartLenRef = useRef(0);

    const [variantProduct, setVariantProduct] = useState<CatalogProduct | null>(null);
    const [refundOrder, setRefundOrder] = useState<PosOrder | null>(null);

    const {
        pinOpen,
        pinBusy,
        pinTitle,
        resolveManagerPin,
        resetManagerPin,
        markDiscountUnlocked,
        isDiscountUnlocked,
        onPinDialogOpenChange,
        onPinConfirm,
    } = usePosManagerPin(configId, resolveLanguageKey);

    const [openSessionOpen, setOpenSessionOpen] = useState(false);
    const [openingBalance, setOpeningBalance] = useState("0");
    const [openingNotes, setOpeningNotes] = useState("");
    const [openingBusy, setOpeningBusy] = useState(false);

    const [cashMoveOpen, setCashMoveOpen] = useState<"in" | "out" | null>(null);
    const [cashMoveAmount, setCashMoveAmount] = useState("");
    const [cashMoveReason, setCashMoveReason] = useState("");
    const [cashMoveBusy, setCashMoveBusy] = useState(false);

    const [closeOpen, setCloseOpen] = useState(false);
    const [closingBalance, setClosingBalance] = useState("");
    const [closingNotes, setClosingNotes] = useState("");
    const [closeBusy, setCloseBusy] = useState(false);

    const [receipt, setReceipt] = useState<ReceiptPayload | null>(null);
    const [receiptOpen, setReceiptOpen] = useState(false);

    const [heldOrderId, setHeldOrderId] = useState<string | null>(null);
    const [holdBusy, setHoldBusy] = useState(false);
    const [heldOpen, setHeldOpen] = useState(false);
    const [heldOrders, setHeldOrders] = useState<PosOrder[]>([]);
    const [heldBusy, setHeldBusy] = useState(false);
    const [ordersOpen, setOrdersOpen] = useState(false);
    const [sessionOrders, setSessionOrders] = useState<PosOrder[]>([]);
    const [ordersBusy, setOrdersBusy] = useState(false);
    const [infoOpen, setInfoOpen] = useState(false);
    const [differenceReason, setDifferenceReason] = useState("");
    const [recon, setRecon] = useState<{
        expectedCash: number;
        openingBalance: number;
        totalSales: number;
        totalCash: number;
        totalCard: number;
        orderCount: number;
        heldDraftCount: number;
        salesByTender: Record<string, number>;
        cashMoves: {type: string; amount: number; reason?: string}[];
    } | null>(null);
    const payRequestIdRef = useRef<string | null>(null);

    const currencyCode = config?.currencyLabel?.abbreviation || "EUR";
    const money = useCallback((n: number) => formatMoney(n, currencyCode), [currencyCode]);

    const paymentMethods = useMemo(
        () =>
            (config?.paymentMethodLabels ?? []).map((m) => ({
                _id: m._id,
                name: m.name,
                type: m.type as string | undefined,
                cashQuickAmounts: m.cashQuickAmounts,
                terminalEnabled: m.terminalEnabled,
                terminalProvider: m.terminalProvider,
                terminalHost: m.terminalHost,
                terminalPort: m.terminalPort,
                terminalId: m.terminalId,
                terminalPath: m.terminalPath,
            })),
        [config?.paymentMethodLabels],
    );

    const itemCount = useMemo(() => cart.reduce((sum, line) => sum + line.quantity, 0), [cart]);
    const subtotal = useMemo(() => cart.reduce((sum, line) => sum + lineTotal(line), 0), [cart]);
    const orderDiscountAmount = useMemo(
        () => subtotal * (Math.min(100, Math.max(0, orderDiscountPercent)) / 100),
        [subtotal, orderDiscountPercent],
    );
    const total = useMemo(() => Math.max(0, subtotal - orderDiscountAmount), [subtotal, orderDiscountAmount]);
    const paidAmount = useMemo(
        () => payments.reduce((sum, p) => sum + Math.max(0, Number(p.amount) || 0), 0),
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

    const shareSubtotal = useMemo(() => shareLines.reduce((sum, line) => sum + lineTotal(line), 0), [shareLines]);
    const shareDiscountAmount = useMemo(
        () => shareSubtotal * (Math.min(100, Math.max(0, orderDiscountPercent)) / 100),
        [shareSubtotal, orderDiscountPercent],
    );
    const shareTotal = useMemo(
        () => Math.max(0, shareSubtotal - shareDiscountAmount),
        [shareSubtotal, shareDiscountAmount],
    );
    const payableTotal = itemsSplitActive ? shareTotal : total;
    const remaining = useMemo(() => Math.max(0, payableTotal - paidAmount), [payableTotal, paidAmount]);
    const change = useMemo(() => Math.max(0, paidAmount - payableTotal), [paidAmount, payableTotal]);

    const equalPerPerson = useMemo(() => {
        const n = Math.max(2, Math.min(20, splitGuests || 2));
        return Number((total / n).toFixed(2));
    }, [total, splitGuests]);

    const loadConfigs = useCallback(async () => {
        try {
            const res = await apiClient.post<{data?: {_id?: string; value?: string; label?: string; name?: string}[]; total?: number}>(
                "/api/eCommerce/posConfig/select",
                {page: 1, limit: 100},
            );
            const rows = res.data.data ?? [];
            setConfigs(
                rows.map((r) => ({
                    _id: String(r.value ?? r._id ?? ""),
                    name: String(r.label ?? r.name ?? ""),
                    ifaceBarcodeScanner: true,
                    ifaceCashControl: true,
                    allowDiscount: true,
                    allowQuantityChange: true,
                    isActive: true,
                    warehouse: "",
                })),
            );
        } catch {
            const res = await apiClient.post<{data?: PosConfig[]; total?: number}>("/api/eCommerce/posConfig", {
                page: 1,
                limit: 100,
                offset: 0,
            });
            const rows = res.data.data ?? [];
            setConfigs(rows.filter((c) => c.isActive !== false));
        }
    }, []);

    const loadCategories = useCallback(async () => {
        try {
            const res = await apiClient.post<{data?: {_id?: string; value?: string; label?: string; name?: string}[]}>(
                "/api/eCommerce/category/select",
                {page: 1, limit: 200},
            );
            const rows = res.data.data ?? [];
            setCategories(
                rows
                    .map((r) => ({
                        _id: String(r.value ?? r._id ?? ""),
                        name: String(r.label ?? r.name ?? ""),
                    }))
                    .filter((c) => c._id && c.name),
            );
        } catch {
            setCategories([]);
        }
    }, []);

    const loadCatalog = useCallback(
        async (opts?: {search?: string; barcode?: string; categoryId?: string | null}) => {
            setCatalogLoading(true);
            try {
                const res = await apiClient.post<{data: CatalogProduct[]; page: number; limit: number; total: number}>(
                    "/api/eCommerce/pos/catalog",
                    {
                        search: opts?.search || undefined,
                        barcode: opts?.barcode || undefined,
                        categoryId: opts?.categoryId || undefined,
                        configId: configId || undefined,
                        page: 1,
                        limit: 60,
                    },
                );
                setCatalog(res.data.data ?? []);
            } catch {
                toast.error(String(resolveLanguageKey("errors.catalogFailed") ?? "errors.catalogFailed"));
                setCatalog([]);
            } finally {
                setCatalogLoading(false);
            }
        },
        [resolveLanguageKey, configId],
    );

    const bootstrapSession = useCallback(
        async (id: string) => {
            setBootLoading(true);
            try {
                const res = await apiClient.post<{data: SessionBundle | null}>("/api/eCommerce/pos/currentSession", {
                    configId: id,
                });
                const bundle = res.data.data;
                if (bundle?.session && bundle?.config) {
                    setSession(bundle.session);
                    setConfig(bundle.config);
                    setOpenSessionOpen(false);
                    await Promise.all([loadCategories(), loadCatalog({})]);
                } else {
                    setSession(null);
                    try {
                        const cfgRes = await apiClient.post<PosConfig>("/api/eCommerce/posConfig/single", {_id: id});
                        const cfg = cfgRes.data;
                        if (cfg?._id) setConfig(cfg);
                    } catch {
                        setConfig((prev) =>
                            prev?._id === id
                                ? prev
                                : {
                                      _id: id,
                                      name: id,
                                      warehouse: "",
                                      ifaceBarcodeScanner: true,
                                      ifaceCashControl: true,
                                      allowDiscount: true,
                                      allowQuantityChange: true,
                                      isActive: true,
                                  },
                        );
                    }
                    setOpenSessionOpen(true);
                }
            } catch {
                toast.error(String(resolveLanguageKey("errors.sessionFailed") ?? "errors.sessionFailed"));
            } finally {
                setBootLoading(false);
            }
        },
        [loadCatalog, loadCategories, resolveLanguageKey],
    );

    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (!configId) {
                setBootLoading(true);
                try {
                    await loadConfigs();
                } catch {
                    toast.error(String(resolveLanguageKey("errors.configsFailed") ?? "errors.configsFailed"));
                } finally {
                    if (!cancelled) setBootLoading(false);
                }
                return;
            }
            await bootstrapSession(configId);
        })();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- bootstrap once per configId
    }, [configId]);

    useEffect(() => {
        if (!session) return;
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            void loadCatalog({
                search: search.trim() || undefined,
                categoryId,
            });
        }, 250);
        return () => {
            if (searchTimer.current) clearTimeout(searchTimer.current);
        };
    }, [search, categoryId, session?._id, loadCatalog]);

    useEffect(() => {
        if (!session) return;
        const t = window.setTimeout(() => barcodeRef.current?.focus(), 120);
        return () => window.clearTimeout(t);
    }, [session?._id]);

    useEffect(() => {
        if (!flashKey) return;
        const t = window.setTimeout(() => setFlashKey(null), 450);
        return () => window.clearTimeout(t);
    }, [flashKey]);

    // Only scroll when a new line is added — not when quantity changes.
    useEffect(() => {
        if (cart.length > prevCartLenRef.current) {
            cartScrollRef.current?.scrollTo({top: cartScrollRef.current.scrollHeight, behavior: "smooth"});
        }
        prevCartLenRef.current = cart.length;
    }, [cart.length]);

    // Drop payment lines that reference removed methods.
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

    // Keep a single non-split tender in sync with payable total (cash overpay kept).
    useEffect(() => {
        if (!cart.length) {
            setPayments([]);
            setActivePaymentId(null);
            return;
        }
        setPayments((prev) => {
            if (prev.length !== 1) return prev;
            const only = prev[0];
            const target = Number(payableTotal.toFixed(2));
            if (only.type === "cash") {
                if (only.amount <= 0 || only.amount < target - 0.001) {
                    return [{...only, amount: target}];
                }
                return prev;
            }
            return [{...only, amount: target}];
        });
    }, [payableTotal, cart.length]);

    const selectConfig = (id: string) => {
        setSearchParams({configId: id});
    };

    const openSession = async () => {
        if (!configId) return;
        setOpeningBusy(true);
        try {
            const res = await apiClient.post<{data: SessionBundle}>("/api/eCommerce/pos/openSession", {
                configId,
                openingBalance: Number(openingBalance) || 0,
                notes: openingNotes || undefined,
            });
            setSession(res.data.data.session);
            setConfig(res.data.data.config);
            setOpenSessionOpen(false);
            resetManagerPin();
            await Promise.all([loadCategories(), loadCatalog({})]);
            toast.success(rk("toast.sessionOpened"));
        } catch {
            toast.error(rk("errors.openSessionFailed"));
        } finally {
            setOpeningBusy(false);
        }
    };

    const submitCashMove = async () => {
        if (!session || !cashMoveOpen) return;
        const amount = Number(cashMoveAmount);
        if (!(amount > 0)) {
            toast.error(rk("errors.invalidAmount"));
            return;
        }
        let managerPin: string | undefined;
        if (cashMoveOpen === "out" && config?.pinForCashOut && config?.hasManagerPin) {
            const pin = await resolveManagerPin(true, "pin.cashOut");
            if (pin === null) return;
            managerPin = pin || undefined;
        }
        setCashMoveBusy(true);
        try {
            const res = await apiClient.post<{data: PosSession}>("/api/eCommerce/pos/cashMove", {
                _id: session._id,
                type: cashMoveOpen,
                amount,
                reason: cashMoveReason || undefined,
                managerPin,
            });
            setSession(res.data.data);
            setCashMoveOpen(null);
            setCashMoveAmount("");
            setCashMoveReason("");
            toast.success(rk(cashMoveOpen === "in" ? "toast.cashIn" : "toast.cashOut"));
        } catch {
            toast.error(rk("errors.cashMoveFailed"));
        } finally {
            setCashMoveBusy(false);
        }
    };

    const closeSession = async () => {
        if (!session) return;
        const balance = Number(closingBalance);
        if (Number.isNaN(balance) || balance < 0) {
            toast.error(rk("errors.invalidAmount"));
            return;
        }
        const expected = recon?.expectedCash ?? session.expectedCash ?? 0;
        const diff = Math.round((balance - expected) * 100) / 100;
        if (Math.abs(diff) >= 0.01 && !differenceReason.trim() && !closingNotes.trim()) {
            toast.error(rk("errors.differenceReasonRequired"));
            return;
        }
        if ((recon?.heldDraftCount ?? 0) > 0) {
            toast.error(rk("errors.heldOrdersBlockClose"));
            return;
        }
        setCloseBusy(true);
        try {
            await apiClient.post("/api/eCommerce/pos/closeSession", {
                _id: session._id,
                closingBalance: balance,
                notes: closingNotes || undefined,
                differenceReason: differenceReason.trim() || undefined,
            });
            toast.success(rk("toast.sessionClosed"));
            setCloseOpen(false);
            setCart([]);
            setPayments([]);
            setActivePaymentId(null);
            setHeldOrderId(null);
            navigate("/eCommerce/posconfigs");
        } catch {
            toast.error(rk("errors.closeSessionFailed"));
        } finally {
            setCloseBusy(false);
        }
    };

    const loadReconciliation = async (counted?: number) => {
        if (!session) return;
        try {
            const res = await apiClient.post<{
                data: {
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
            }>("/api/eCommerce/pos/reconciliation", {
                sessionId: session._id,
                countedCash: counted,
            });
            setRecon(res.data.data);
        } catch {
            setRecon(null);
        }
    };

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
            (order.lines ?? []).map((line) => ({
                key: line.variant ? `${line.product}:${line.variant}` : line.product,
                productId: line.product,
                variantId: line.variant,
                title: line.productName,
                sku: line.productSku,
                unitPrice: line.unitPrice,
                quantity: line.quantity,
                discountPercent: line.discountPercent ?? 0,
            })),
        );
        setOrderDiscountPercent(order.orderDiscountPercent ?? 0);
        setCustomerName(order.customerName ?? order.customer?.name ?? "");
        setCustomerId(order.customer?._id ?? null);
        setShowCustomer(!!(order.customerName || order.customer?._id));
        setHeldOrderId(order._id);
        setPayments([]);
        setActivePaymentId(null);
        setItemsSplitActive(false);
        setSplitSelection({});
        setHeldOpen(false);
        toast.success(rk("toast.resumed"));
        barcodeRef.current?.focus();
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

    const openSessionOrders = async () => {
        if (!session) return;
        setOrdersOpen(true);
        setOrdersBusy(true);
        try {
            const res = await apiClient.post<{data: PosOrder[]}>("/api/eCommerce/pos/orders", {
                sessionId: session._id,
            });
            setSessionOrders(res.data.data ?? []);
        } catch {
            toast.error(rk("errors.ordersLoadFailed"));
            setSessionOrders([]);
        } finally {
            setOrdersBusy(false);
        }
    };

    const reprintOrder = async (id: string) => {
        try {
            const res = await apiClient.post<{data: {receipt: ReceiptPayload}}>("/api/eCommerce/pos/reprint", {_id: id});
            setReceipt(res.data.data.receipt);
            setReceiptOpen(true);
            setOrdersOpen(false);
        } catch {
            toast.error(rk("errors.reprintFailed"));
        }
    };

    const addCartLine = (
        product: CatalogProduct,
        qty: number,
        variant?: CatalogVariant,
    ) => {
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
        barcodeRef.current?.focus();
    };

    const pickProduct = (product: CatalogProduct, qty = 1) => {
        const variants = product.variants ?? [];
        if (product.matchedVariantId) {
            const matched = variants.find((v) => v._id === product.matchedVariantId);
            if (matched) {
                addCartLine(product, qty, matched);
                return;
            }
        }
        if (product.hasVariants && variants.length > 1) {
            setVariantProduct(product);
            return;
        }
        if (product.hasVariants && variants.length === 1) {
            addCartLine(product, qty, variants[0]);
            return;
        }
        const allowOversell = !!config?.allowOversell;
        if (
            product.trackInventory &&
            product.stockQty != null &&
            !allowOversell &&
            product.stockQty <= 0
        ) {
            toast.error(rk("errors.outOfStock"));
            return;
        }
        addCartLine(product, qty);
    };

    const handleBarcodeEnter = async () => {
        const code = barcode.trim();
        if (!code) return;
        try {
            const res = await apiClient.post<{data: CatalogProduct[]}>("/api/eCommerce/pos/catalog", {
                barcode: code,
                configId: configId || undefined,
                page: 1,
                limit: 5,
            });
            const rows = res.data.data ?? [];
            if (!rows.length) {
                toast.error(rk("errors.barcodeNotFound"));
            } else {
                pickProduct(rows[0], 1);
            }
        } catch {
            toast.error(rk("errors.barcodeNotFound"));
        } finally {
            setBarcode("");
            barcodeRef.current?.focus();
        }
    };

    const ensureDiscountUnlocked = async (): Promise<boolean> => {
        if (!config?.pinForDiscount || !config?.hasManagerPin) return true;
        if (isDiscountUnlocked()) return true;
        const pin = await resolveManagerPin(true, "pin.discount");
        if (pin === null) return false;
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
                    if (
                        l.trackInventory &&
                        l.stockQty != null &&
                        !allowOversell &&
                        q > l.stockQty + 0.0001
                    ) {
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

    const clearOrder = () => {
        setCart([]);
        setPayments([]);
        setActivePaymentId(null);
        setOrderDiscountPercent(0);
        setCustomerName("");
        setCustomerId(null);
        setShowCustomer(false);
        setSelectedLineKey(null);
        setItemsSplitActive(false);
        setSplitSelection({});
        setHeldOrderId(null);
        payRequestIdRef.current = null;
        payArmedRef.current = false;
        setPayArmed(false);
        setPayArmSecondsLeft(0);
        if (payArmTimerRef.current) {
            clearInterval(payArmTimerRef.current);
            payArmTimerRef.current = null;
        }
        barcodeRef.current?.focus();
    };

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

    const applyEqualSplit = () => {
        const n = Math.max(2, Math.min(20, Math.floor(splitGuests) || 2));
        const first = paymentMethods[0];
        if (!first || total <= 0) {
            toast.error(rk("errors.splitFailed"));
            return;
        }
        const cents = Math.round(total * 100);
        const base = Math.floor(cents / n);
        let leftover = cents - base * n;
        const amounts: number[] = [];
        for (let i = 0; i < n; i++) {
            const extra = leftover > 0 ? 1 : 0;
            if (leftover > 0) leftover -= 1;
            amounts.push((base + extra) / 100);
        }
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

    const makePaymentLine = (methodId: string, amount: number): PaymentLine | null => {
        const method = paymentMethods.find((m) => m._id === methodId);
        if (!method) return null;
        return {
            id: `${method._id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            paymentMethodId: method._id,
            name: method.name,
            type: method.type,
            amount: Number(Math.max(0, amount).toFixed(2)),
            terminalEnabled: method.terminalEnabled,
            terminalProvider: method.terminalProvider,
            terminalHost: method.terminalHost,
            terminalPort: method.terminalPort,
            terminalId: method.terminalId,
            terminalPath: method.terminalPath,
            cashQuickAmounts: method.cashQuickAmounts,
        };
    };

    const addPaymentMethod = (methodId: string) => {
        // Equal-split: retarget active guest share to another method (keep amount/label).
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
        const amount = remaining > 0.001 ? Number(remaining.toFixed(2)) : 0;
        const line = makePaymentLine(methodId, amount);
        if (!line) return;
        setPayments((prev) => [...prev, line]);
        setActivePaymentId(line.id);
        setShowPayment(true);
    };

    const updatePaymentAmount = (id: string, amount: number) => {
        setPayments((prev) =>
            prev.map((p) => (p.id === id ? {...p, amount: Number(Math.max(0, amount).toFixed(2))} : p)),
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
                p.id === targetId
                    ? {...p, amount: Number((Math.max(0, p.amount) + extra).toFixed(2))}
                    : p,
            ),
        );
        setActivePaymentId(targetId);
    };

    const setExactPayment = () => {
        const targetId = activePayment?.id ?? payments[payments.length - 1]?.id;
        if (!targetId) return;
        setPayments((prev) => {
            const others = prev.filter((p) => p.id !== targetId).reduce((s, p) => s + p.amount, 0);
            const exact = Number(Math.max(0, payableTotal - others).toFixed(2));
            return prev.map((p) => (p.id === targetId ? {...p, amount: exact} : p));
        });
    };

    const ensurePaymentsForPay = (targetTotal: number): PaymentLine[] => {
        if (payments.length) return payments.filter((p) => p.amount > 0);
        const first = paymentMethods[0];
        if (!first) return [];
        const line = makePaymentLine(first._id, Number(targetTotal.toFixed(2)));
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

    const disarmPay = useCallback(() => {
        payArmedRef.current = false;
        setPayArmed(false);
        setPayArmSecondsLeft(0);
        if (payArmTimerRef.current) {
            clearInterval(payArmTimerRef.current);
            payArmTimerRef.current = null;
        }
    }, []);

    // Reset confirm-arm only when the order/tender totals actually change — not on every payments[] identity change.
    useEffect(() => {
        disarmPay();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional narrow reset triggers
    }, [cart.length, payableTotal, paidAmount, itemsSplitActive, disarmPay]);

    useEffect(() => {
        return () => {
            if (payArmTimerRef.current) clearInterval(payArmTimerRef.current);
        };
    }, []);

    const pay = async () => {
        if (!session || !canPay) return;

        const payingShare = itemsSplitActive;
        const orderLines = payingShare ? shareLines : cart;
        const targetTotal = payingShare ? shareTotal : total;
        const tenderLines = ensurePaymentsForPay(targetTotal);
        const tenderTotal = tenderLines.reduce((s, p) => s + p.amount, 0);
        if (!tenderLines.length || tenderTotal + 0.001 < targetTotal) return;
        if (payments.length > 0 && paidAmount + 0.001 < targetTotal) return;

        const hasDiscount =
            orderDiscountPercent > 0 || orderLines.some((l) => l.discountPercent > 0);
        let managerPin: string | undefined;
        if (hasDiscount && config?.pinForDiscount && config?.hasManagerPin) {
            const pin = await resolveManagerPin(true, "pin.discount");
            if (pin === null) return;
            managerPin = pin || undefined;
        }

        setPaying(true);
        if (!payRequestIdRef.current) {
            payRequestIdRef.current =
                typeof crypto !== "undefined" && crypto.randomUUID
                    ? crypto.randomUUID()
                    : `pos-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        }
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
                    const termRes = await apiClient.post<{
                        data: {authCode?: string; reference?: string; terminalId?: string};
                    }>("/api/eCommerce/pos/chargeTerminal", {
                        sessionId: session._id,
                        paymentMethodId: line.paymentMethodId,
                        amount: Number(line.amount.toFixed(2)),
                        currency: currencyCode,
                    });
                    charged.push({
                        paymentMethodId: line.paymentMethodId,
                        amount: Number(line.amount.toFixed(2)),
                        terminalAuthCode: termRes.data.data.authCode,
                        terminalReference: termRes.data.data.reference,
                        terminalId: termRes.data.data.terminalId || line.terminalId,
                    });
                } else {
                    charged.push({
                        paymentMethodId: line.paymentMethodId,
                        amount: Number(line.amount.toFixed(2)),
                        terminalId: line.terminalId,
                    });
                }
            }

            const res = await apiClient.post<{
                data: {order: PosOrder; receipt: ReceiptPayload; session: PosSession};
            }>("/api/eCommerce/pos/pay", {
                sessionId: session._id,
                customerId: customerId || undefined,
                customerName: showCustomer && customerName.trim() ? customerName.trim() : undefined,
                discountPercent: orderDiscountPercent > 0 ? orderDiscountPercent : undefined,
                note: payingShare ? rk("split.shareNote") : undefined,
                heldOrderId: !payingShare && heldOrderId ? heldOrderId : undefined,
                clientRequestId: payRequestIdRef.current,
                managerPin,
                lines: orderLines.map((l) => ({
                    productId: l.productId,
                    variantId: l.variantId,
                    quantity: l.quantity,
                    unitPrice: l.unitPrice,
                    discountPercent: l.discountPercent > 0 ? l.discountPercent : undefined,
                })),
                payments: charged,
            });
            setSession(res.data.data.session);
            setReceipt(res.data.data.receipt);
            setReceiptOpen(true);
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
        } catch {
            toast.error(usesTerminal ? rk("errors.terminalFailed") : rk("errors.payFailed"));
        } finally {
            setPaying(false);
        }
    };

    const requestPay = () => {
        if (!session || paying) return;
        // Recompute readiness here so we don't rely on a stale canPay from an older keyboard closure.
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

    const printReceipt = () => {
        window.print();
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

    usePosKeyboard({
        enabled: !!session && !bootLoading,
        onPay: () => {
            if (!paying) requestPay();
        },
        onHold: () => {
            if (cart.length && !holdBusy) void holdCart();
        },
        onClear: clearOrder,
        onFocusBarcode: () => barcodeRef.current?.focus(),
        onOpenHeld: () => void openHeldList(),
        onOpenOrders: () => void openSessionOrders(),
        onOpenInfo: () => setInfoOpen(true),
        onQtyDelta: bumpSelectedQty,
        onRemoveSelected: () => {
            if (selectedLineKey) removeLine(selectedLineKey);
        },
        onTogglePayment: () => setShowPayment((v) => !v),
    });

    if (bootLoading) {
        return (
            <div className="flex h-full min-h-0 items-center justify-center bg-background">
                <Loader />
            </div>
        );
    }

    if (!configId) {
        return <PosConfigPicker configs={configs} rk={rk} onSelect={selectConfig} />;
    }

    if (!session) {
        return (
            <PosOpenSessionDialog
                open={openSessionOpen}
                configName={config?.name}
                openingBalance={openingBalance}
                openingNotes={openingNotes}
                openingBusy={openingBusy}
                rk={rk}
                onOpeningBalanceChange={setOpeningBalance}
                onOpeningNotesChange={setOpeningNotes}
                onSubmit={() => void openSession()}
                onCancel={() => navigate("/eCommerce/posconfigs")}
            />
        );
    }

    return (
        <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background text-foreground">
            <PosTillHeader
                config={config}
                session={session}
                money={money}
                rk={rk}
                ifaceCashControl={!!config?.ifaceCashControl}
                onInfo={() => setInfoOpen(true)}
                onHeld={() => void openHeldList()}
                onOrders={() => void openSessionOrders()}
                onCashIn={() => setCashMoveOpen("in")}
                onCashOut={() => setCashMoveOpen("out")}
                onCloseSession={() => {
                    setClosingBalance(String(session.cashRegisterBalance ?? 0));
                    setDifferenceReason("");
                    setClosingNotes("");
                    setCloseOpen(true);
                    void loadReconciliation(session.cashRegisterBalance ?? 0);
                }}
            />

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row print:hidden">
                <PosCatalogPanel
                    search={search}
                    barcode={barcode}
                    barcodeRef={barcodeRef}
                    categories={categories}
                    categoryId={categoryId}
                    catalog={catalog}
                    catalogLoading={catalogLoading}
                    cart={cart}
                    flashKey={flashKey}
                    config={config}
                    money={money}
                    rk={rk}
                    onSearchChange={setSearch}
                    onBarcodeChange={setBarcode}
                    onBarcodeEnter={() => void handleBarcodeEnter()}
                    onCategoryChange={setCategoryId}
                    onPickProduct={pickProduct}
                />

                <PosCartPanel
                    cart={cart}
                    cartScrollRef={cartScrollRef}
                    heldOrderId={heldOrderId}
                    itemCount={itemCount}
                    total={total}
                    subtotal={subtotal}
                    orderDiscountPercent={orderDiscountPercent}
                    orderDiscountAmount={orderDiscountAmount}
                    shareTotal={shareTotal}
                    itemsSplitActive={itemsSplitActive}
                    splitSelection={splitSelection}
                    selectedLineKey={selectedLineKey}
                    showLineDiscount={showLineDiscount}
                    showCustomer={showCustomer}
                    showPayment={showPayment}
                    customerName={customerName}
                    customerId={customerId}
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
                    holdBusy={holdBusy}
                    allowDiscount={!!config?.allowDiscount}
                    allowQuantityChange={config?.allowQuantityChange !== false}
                    money={money}
                    rk={rk}
                    onToggleLineDiscount={() => void toggleLineDiscount()}
                    onToggleCustomer={() => setShowCustomer((v) => !v)}
                    onTogglePayment={() => setShowPayment((v) => !v)}
                    onOpenSplit={() => setSplitOpen(true)}
                    onHold={() => void holdCart()}
                    onClearOrder={clearOrder}
                    onCancelItemsSplit={cancelItemsSplit}
                    onSelectLine={setSelectedLineKey}
                    onBumpSplitQty={bumpSplitQty}
                    onUpdateLineQty={updateLineQty}
                    onSetLineQty={setLineQty}
                    onSetLineDiscount={(key, n) => void setLineDiscount(key, n)}
                    onRemoveLine={removeLine}
                    onCustomerLabelChange={setCustomerName}
                    onCustomerSelect={(hit) => {
                        if (!hit) {
                            setCustomerId(null);
                            return;
                        }
                        setCustomerId(hit._id);
                        setCustomerName(hit.label);
                    }}
                    onOrderDiscountChange={(n) => void setOrderDiscount(n)}
                    onAddPaymentMethod={addPaymentMethod}
                    onActivePaymentIdChange={setActivePaymentId}
                    onUpdatePaymentAmount={updatePaymentAmount}
                    onRemovePayment={removePayment}
                    onBumpPaymentAmount={bumpPaymentAmount}
                    onSetExactPayment={setExactPayment}
                    onRequestPay={() => requestPay()}
                />
            </div>

            <PosTillDialogs
                rk={rk}
                money={money}
                session={session}
                splitOpen={splitOpen}
                onSplitOpenChange={setSplitOpen}
                splitMode={splitMode}
                onSplitModeChange={setSplitMode}
                splitGuests={splitGuests}
                onSplitGuestsChange={setSplitGuests}
                equalPerPerson={equalPerPerson}
                total={total}
                onApplyEqualSplit={applyEqualSplit}
                onStartItemsSplit={startItemsSplit}
                cashMoveOpen={cashMoveOpen}
                onCashMoveOpenChange={(open) => !open && setCashMoveOpen(null)}
                cashMoveAmount={cashMoveAmount}
                onCashMoveAmountChange={setCashMoveAmount}
                cashMoveReason={cashMoveReason}
                onCashMoveReasonChange={setCashMoveReason}
                cashMoveBusy={cashMoveBusy}
                onSubmitCashMove={() => void submitCashMove()}
                onCancelCashMove={() => setCashMoveOpen(null)}
                closeOpen={closeOpen}
                onCloseOpenChange={setCloseOpen}
                closingBalance={closingBalance}
                onClosingBalanceChange={setClosingBalance}
                closingNotes={closingNotes}
                onClosingNotesChange={setClosingNotes}
                differenceReason={differenceReason}
                onDifferenceReasonChange={setDifferenceReason}
                closeBusy={closeBusy}
                recon={recon}
                onLoadReconciliation={(n) => void loadReconciliation(n)}
                onCloseSession={() => void closeSession()}
                infoOpen={infoOpen}
                onInfoOpenChange={setInfoOpen}
                heldOpen={heldOpen}
                onHeldOpenChange={setHeldOpen}
                heldBusy={heldBusy}
                heldOrders={heldOrders}
                onResumeHeld={resumeHeld}
                onDiscardHeld={(id) => void discardHeld(id)}
                ordersOpen={ordersOpen}
                onOrdersOpenChange={setOrdersOpen}
                ordersBusy={ordersBusy}
                sessionOrders={sessionOrders}
                onRefundOrder={(order) => {
                    setRefundOrder(order);
                    setOrdersOpen(false);
                }}
                onReprintOrder={(id) => void reprintOrder(id)}
                receiptOpen={receiptOpen}
                onReceiptOpenChange={setReceiptOpen}
                receipt={receipt}
                onReceiptNewOrder={() => {
                    setReceiptOpen(false);
                    barcodeRef.current?.focus();
                }}
                onPrintReceipt={printReceipt}
                pinOpen={pinOpen}
                pinBusy={pinBusy}
                pinTitle={pinTitle}
                onPinOpenChange={onPinDialogOpenChange}
                onPinConfirm={onPinConfirm}
                variantProduct={variantProduct}
                onVariantClose={() => setVariantProduct(null)}
                allowOversell={!!config?.allowOversell}
                onVariantPick={(variantId, price, label, stockQty, trackInventory) => {
                    if (!variantProduct) return;
                    const variant = (variantProduct.variants ?? []).find((v) => v._id === variantId);
                    addCartLine(variantProduct, 1, {
                        _id: variantId,
                        label,
                        price,
                        sku: variant?.sku,
                        barcode: variant?.barcode,
                        stockQty: stockQty ?? variant?.stockQty,
                        trackInventory: trackInventory ?? variant?.trackInventory,
                    });
                    setVariantProduct(null);
                }}
                refundOrder={refundOrder}
                requireRefundPin={!!config?.pinForRefund && !!config?.hasManagerPin}
                onRefundOpenChange={(open) => {
                    if (!open) setRefundOrder(null);
                }}
                onRefunded={() => {
                    setRefundOrder(null);
                    void openSessionOrders();
                }}
            />
        </div>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/pos/index.tsx"),
    withDebug(true, true),
)(PosTill);
