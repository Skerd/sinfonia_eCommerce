import {useCallback, useEffect, useRef, useState} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import {toast} from "sonner";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import type {PosManagerAuth} from "@eCommerceModule/clients/panel/private/pos/usePosManagerPin.ts";
import type {SessionBundle} from "@eCommerceModule/clients/panel/private/pos/posTypes.ts";
import type {PosConfig} from "armonia/src/modules/eCommerce/api/eCommerce/private/posConfig/posConfig.dto.ts";
import type {PosOrder} from "armonia/src/modules/eCommerce/api/eCommerce/private/posOrder/posOrder.dto.ts";
import type {PosSession} from "armonia/src/modules/eCommerce/api/eCommerce/private/posSession/posSession.dto.ts";
import type {ReceiptPayload} from "@eCommerceModule/clients/panel/private/pos/posTypes.ts";
import {subscribePosKillSwitch} from "@eCommerceModule/clients/panel/private/pos/posKillSwitchEvents.ts";

export type PosReconciliation = {
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

type ResolveManagerPin = (
    needed: boolean,
    titleKey: string,
) => Promise<PosManagerAuth | null | undefined>;

type Args = {
    resolveLanguageKey: (key: string) => unknown;
    resolveManagerPin: ResolveManagerPin;
    resetManagerPin: () => void;
    onSessionClosed?: () => void;
    onKillSwitch?: () => void;
};

export function usePosSession({
    resolveLanguageKey,
    resolveManagerPin,
    resetManagerPin,
    onSessionClosed,
    onKillSwitch,
}: Args) {
    const resolveManagerPinRef = useRef(resolveManagerPin);
    const resetManagerPinRef = useRef(resetManagerPin);
    const onSessionClosedRef = useRef(onSessionClosed);
    const onKillSwitchRef = useRef(onKillSwitch);
    resolveManagerPinRef.current = resolveManagerPin;
    resetManagerPinRef.current = resetManagerPin;
    onSessionClosedRef.current = onSessionClosed;
    onKillSwitchRef.current = onKillSwitch;
    const rk = (key: string) => String(resolveLanguageKey(key) ?? key);
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const configId = searchParams.get("configId") || undefined;
    const configIdRef = useRef(configId);
    configIdRef.current = configId;

    const [bootLoading, setBootLoading] = useState(true);
    const [configs, setConfigs] = useState<PosConfig[]>([]);
    const [session, setSession] = useState<PosSession | null>(null);
    const [config, setConfig] = useState<PosConfig | null>(null);
    const [tillLocked, setTillLocked] = useState(false);
    const hadSessionRef = useRef(false);

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
    const [differenceReason, setDifferenceReason] = useState("");
    const [recon, setRecon] = useState<PosReconciliation | null>(null);

    const [infoOpen, setInfoOpen] = useState(false);
    const [ordersOpen, setOrdersOpen] = useState(false);
    const [sessionOrders, setSessionOrders] = useState<PosOrder[]>([]);
    const [ordersBusy, setOrdersBusy] = useState(false);
    const [refundOrder, setRefundOrder] = useState<PosOrder | null>(null);

    const [receipt, setReceipt] = useState<ReceiptPayload | null>(null);
    const [receiptOpen, setReceiptOpen] = useState(false);

    const loadConfigs = useCallback(async () => {
        try {
            const res = await apiClient.post<{
                data?: {_id?: string; value?: string; label?: string; name?: string}[];
                total?: number;
            }>("/api/eCommerce/posConfig/select", {page: 1, limit: 100});
            const rows = res.data.data ?? [];
            setConfigs(
                rows.map(
                    (r) =>
                        ({
                            _id: String(r.value ?? r._id ?? ""),
                            name: String(r.label ?? r.name ?? ""),
                            ifaceBarcodeScanner: true,
                            ifaceCashControl: true,
                            allowDiscount: true,
                            allowQuantityChange: true,
                            isActive: true,
                            warehouses: [],
                        }) as unknown as PosConfig,
                ),
            );
        } catch {
            const res = await apiClient.post<{data?: PosConfig[]; total?: number}>("/api/eCommerce/posConfig", {
                page: 1,
                limit: 100,
                offset: 0,
            });
            const rows = res.data.data ?? [];
            setConfigs(rows.filter((c) => c.isActive !== false && !c.isPaused));
        }
    }, []);

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
                    hadSessionRef.current = true;
                    setConfig(bundle.config);
                    if (bundle.config.isPaused) setTillLocked(true);
                    setOpenSessionOpen(false);
                } else {
                    setSession(null);
                    try {
                        const cfgRes = await apiClient.post<PosConfig>("/api/eCommerce/posConfig/single", {_id: id});
                        const cfg = cfgRes.data;
                        if (cfg?._id) {
                            setConfig(cfg);
                            if (cfg.isPaused || !cfg.isActive) setTillLocked(true);
                        }
                    } catch {
                        setConfig((prev) =>
                            prev?._id === id
                                ? prev
                                : ({
                                      _id: id,
                                      name: id,
                                      warehouses: [],
                                      ifaceBarcodeScanner: true,
                                      ifaceCashControl: true,
                                      allowDiscount: true,
                                      allowQuantityChange: true,
                                      isActive: true,
                                  } as unknown as PosConfig),
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
        [resolveLanguageKey],
    );

    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (!configId) {
                setBootLoading(true);
                setTillLocked(false);
                try {
                    await loadConfigs();
                } catch {
                    toast.error(String(resolveLanguageKey("errors.configsFailed") ?? "errors.configsFailed"));
                } finally {
                    if (!cancelled) setBootLoading(false);
                }
                return;
            }
            setTillLocked(false);
            await bootstrapSession(configId);
        })();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- bootstrap once per configId
    }, [configId]);

    const applyPausedConfig = useCallback((cfg: PosConfig | undefined | null) => {
        if (!cfg) return;
        setConfig(cfg);
        if (cfg.isPaused) setTillLocked(true);
    }, []);

    const refreshCurrentSession = useCallback(async () => {
        const id = configIdRef.current;
        if (!id) return;
        try {
            const res = await apiClient.post<{data: SessionBundle | null}>("/api/eCommerce/pos/currentSession", {
                configId: id,
            });
            const bundle = res.data.data;
            if (bundle?.config) applyPausedConfig(bundle.config);
            if (bundle?.session) {
                setSession(bundle.session);
                hadSessionRef.current = true;
            } else if (hadSessionRef.current) {
                // Force-close: session gone — kick to picker.
                hadSessionRef.current = false;
                setSession(null);
                setTillLocked(!!bundle?.config?.isPaused);
                onSessionClosedRef.current?.();
                setSearchParams({});
                toast.message(rk("paused.forceClosedToast"));
            }
        } catch {
            // ignore poll errors
        }
    }, [applyPausedConfig, rk, setSearchParams]);

    useEffect(() => {
        return subscribePosKillSwitch((_kind, payload) => {
            const id = configIdRef.current;
            const hitsConfig =
                payload.companyWide ||
                !payload.configIds?.length ||
                (id && payload.configIds.includes(id));
            if (!hitsConfig) return;
            onKillSwitchRef.current?.();
            setTillLocked(true);
            setConfig((prev) =>
                prev
                    ? {
                          ...prev,
                          isPaused: true,
                          isCompanyPaused: payload.companyWide ? true : prev.isCompanyPaused,
                          companyPauseReason: payload.companyWide
                              ? (payload.pauseReason ?? prev.companyPauseReason)
                              : prev.companyPauseReason,
                          pauseReason: payload.companyWide
                              ? prev.pauseReason
                              : (payload.pauseReason ?? prev.pauseReason),
                      }
                    : prev,
            );
            toast.error(payload.companyWide ? rk("paused.companyBanner") : rk("paused.banner"));
            // After force-close, session is gone — refresh to converge.
            void refreshCurrentSession();
        });
    }, [refreshCurrentSession, rk]);

    useEffect(() => {
        if (!configId) return;
        const onFocus = () => void refreshCurrentSession();
        window.addEventListener("focus", onFocus);
        const timer = window.setInterval(() => void refreshCurrentSession(), 20_000);
        return () => {
            window.removeEventListener("focus", onFocus);
            window.clearInterval(timer);
        };
    }, [configId, refreshCurrentSession]);

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
            hadSessionRef.current = true;
            setConfig(res.data.data.config);
            setOpenSessionOpen(false);
            resetManagerPinRef.current();
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
        let managerId: string | undefined;
        if (cashMoveOpen === "out" && config?.pinForCashOut && config?.hasManagerPin) {
            const auth = await resolveManagerPinRef.current(true, "pin.cashOut");
            if (auth === null) return;
            managerPin = auth?.pin;
            managerId = auth?.managerId;
        }
        setCashMoveBusy(true);
        try {
            const res = await apiClient.post<{data: PosSession}>("/api/eCommerce/pos/cashMove", {
                _id: session._id,
                type: cashMoveOpen,
                amount,
                reason: cashMoveReason || undefined,
                managerPin,
                managerId,
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

    const loadReconciliation = async (counted?: number) => {
        if (!session) return;
        try {
            const res = await apiClient.post<{data: PosReconciliation}>("/api/eCommerce/pos/reconciliation", {
                sessionId: session._id,
                countedCash: counted,
            });
            setRecon(res.data.data);
        } catch {
            setRecon(null);
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
            onSessionClosedRef.current?.();
            navigate("/tenancy/systemSettings/posconfigs");
        } catch {
            toast.error(rk("errors.closeSessionFailed"));
        } finally {
            setCloseBusy(false);
        }
    };

    const openCloseSession = () => {
        if (!session) return;
        setClosingBalance(String(session.cashRegisterBalance ?? 0));
        setDifferenceReason("");
        setClosingNotes("");
        setCloseOpen(true);
        void loadReconciliation(session.cashRegisterBalance ?? 0);
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

    const showReceipt = (payload: ReceiptPayload) => {
        setReceipt(payload);
        setReceiptOpen(true);
    };

    const printReceipt = () => {
        window.print();
    };

    return {
        configId,
        bootLoading,
        configs,
        session,
        setSession,
        config,
        tillLocked,
        isPaused: !!(tillLocked || config?.isPaused),
        selectConfig,
        openSessionOpen,
        openingBalance,
        setOpeningBalance,
        openingNotes,
        setOpeningNotes,
        openingBusy,
        openSession,
        cashMoveOpen,
        setCashMoveOpen,
        cashMoveAmount,
        setCashMoveAmount,
        cashMoveReason,
        setCashMoveReason,
        cashMoveBusy,
        submitCashMove,
        closeOpen,
        setCloseOpen,
        closingBalance,
        setClosingBalance,
        closingNotes,
        setClosingNotes,
        differenceReason,
        setDifferenceReason,
        closeBusy,
        recon,
        loadReconciliation,
        closeSession,
        openCloseSession,
        infoOpen,
        setInfoOpen,
        ordersOpen,
        setOrdersOpen,
        sessionOrders,
        ordersBusy,
        openSessionOrders,
        reprintOrder,
        refundOrder,
        setRefundOrder,
        receipt,
        receiptOpen,
        setReceiptOpen,
        showReceipt,
        printReceipt,
        navigate,
    };
}
