import {useCallback, useEffect, useRef, useState} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import {toast} from "sonner";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import type {PosManagerAuth} from "@eCommerceModule/clients/panel/private/pos/usePosManagerPin.ts";
import type {PosConfigChoice, SessionBundle} from "@eCommerceModule/clients/panel/private/pos/posTypes.ts";
import type {PosConfig} from "armonia/src/modules/eCommerce/api/eCommerce/private/posConfig/posConfig.dto.ts";
import type {PosOrder} from "armonia/src/modules/eCommerce/api/eCommerce/private/posOrder/posOrder.dto.ts";
import type {PosSession} from "armonia/src/modules/eCommerce/api/eCommerce/private/posSession/posSession.dto.ts";
import {posFiscalizationActive, type ReceiptPayload} from "@eCommerceModule/clients/panel/private/pos/posTypes.ts";
import {bindPosKillSwitchSocket, subscribePosKillSwitch} from "@eCommerceModule/clients/panel/private/pos/posKillSwitchEvents.ts";
import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";

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

const CONFIG_SELECT_REQUEST: HttpRequest = {method: "POST", url: "/api/eCommerce/posConfig/select"};
const CONFIG_LIST_REQUEST: HttpRequest = {method: "POST", url: "/api/eCommerce/posConfig"};
const CONFIG_SINGLE_REQUEST: HttpRequest = {method: "POST", url: "/api/eCommerce/posConfig/single"};
const CURRENT_SESSION_REQUEST: HttpRequest = {method: "POST", url: "/api/eCommerce/pos/currentSession"};
const OPEN_SESSION_REQUEST: HttpRequest = {method: "POST", url: "/api/eCommerce/posSession/open"};
const CASH_MOVE_REQUEST: HttpRequest = {method: "POST", url: "/api/eCommerce/posSession/cashMove"};
const RECONCILIATION_REQUEST: HttpRequest = {method: "POST", url: "/api/eCommerce/posSession/reconciliation"};
const CLOSE_SESSION_REQUEST: HttpRequest = {method: "POST", url: "/api/eCommerce/posSession/close"};
const SESSION_ORDERS_REQUEST: HttpRequest = {method: "POST", url: "/api/eCommerce/pos/orders"};
const REPRINT_REQUEST: HttpRequest = {method: "POST", url: "/api/eCommerce/posOrder/reprint"};
const SELECT_BODY = {page: 1, limit: 100};
const LIST_BODY = {page: 1, limit: 100, offset: 0};

type ConfigSelectRow = {_id?: string; value?: string; label?: string; name?: string};

/** One request per call: the payload is sent when `count` goes up. */
type Call<T> = {payload: T; count: number};
const call = <T>(payload: T) => (current: Call<T>): Call<T> => ({payload, count: current.count + 1});

type ResolveManagerPin = (
    needed: boolean,
    titleKey: string,
) => Promise<PosManagerAuth | null | undefined>;

type Args = {
    resolveLanguageKey: ResolveLanguageKey;
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

    const [configs, setConfigs] = useState<PosConfigChoice[]>([]);
    const [session, setSession] = useState<PosSession | null>(null);
    const [config, setConfig] = useState<PosConfig | null>(null);
    const [tillLocked, setTillLocked] = useState(false);
    const hadSessionRef = useRef(false);

    const [openSessionOpen, setOpenSessionOpen] = useState(false);
    const [openingBalance, setOpeningBalance] = useState("0");
    const [openingNotes, setOpeningNotes] = useState("");

    const [cashMoveOpen, setCashMoveOpen] = useState<"in" | "out" | null>(null);
    const [cashMoveAmount, setCashMoveAmount] = useState("");
    const [cashMoveReason, setCashMoveReason] = useState("");

    const [closeOpen, setCloseOpen] = useState(false);
    const [closingBalance, setClosingBalance] = useState("");
    const [closingNotes, setClosingNotes] = useState("");
    const [differenceReason, setDifferenceReason] = useState("");
    const [recon, setRecon] = useState<PosReconciliation | null>(null);

    const [infoOpen, setInfoOpen] = useState(false);
    const [ordersOpen, setOrdersOpen] = useState(false);
    const [sessionOrders, setSessionOrders] = useState<PosOrder[]>([]);
    const [refundOrder, setRefundOrder] = useState<PosOrder | null>(null);

    const [receipt, setReceipt] = useState<ReceiptPayload | null>(null);
    const [receiptOpen, setReceiptOpen] = useState(false);

    // True from a configId change until its last boot request settled (one request may lead to another).
    const [bootLoading, setBootLoading] = useState(true);

    // Till picker: the select list, or the full list when select is not allowed.
    const [configsCount, setConfigsCount] = useState(0);
    const [configListCount, setConfigListCount] = useState(0);
    useHttpRequest<{data?: ConfigSelectRow[]}>(CONFIG_SELECT_REQUEST, SELECT_BODY, configsCount, true, {
        success: (response) => {
            setConfigs((response.data ?? []).map((row) => ({_id: String(row.value ?? row._id ?? ""), name: String(row.label ?? row.name ?? ""), warehouses: []})));
            setBootLoading(false);
        },
        error: () => setConfigListCount((count) => count + 1),
    });
    useHttpRequest<{data?: PosConfig[]}>(CONFIG_LIST_REQUEST, LIST_BODY, configListCount, true, {
        success: (response) => {
            setConfigs((response.data ?? []).filter((c) => c.isActive !== false && !c.isPaused));
            setBootLoading(false);
        },
        error: () => {
            toast.error(String(resolveLanguageKey("errors.configsFailed") ?? "errors.configsFailed"));
            setBootLoading(false);
        },
    });

    // Opening a till: its current session, else its settings for the open-session dialog.
    const [bootCount, setBootCount] = useState(0);
    const [configSingleCount, setConfigSingleCount] = useState(0);
    useHttpRequest<{data: SessionBundle | null}>(CURRENT_SESSION_REQUEST, {configId}, bootCount, true, {
        success: (response) => {
            const bundle = response.data;
            if (bundle?.session && bundle?.config) {
                setSession(bundle.session);
                hadSessionRef.current = true;
                setConfig(bundle.config);
                if (bundle.config.isPaused) setTillLocked(true);
                setOpenSessionOpen(false);
                if (!posFiscalizationActive(bundle.config)) {
                    toast.warning(rk("fiscalization.inactive"));
                }
                setBootLoading(false);
            } else {
                setSession(null);
                setConfigSingleCount((count) => count + 1);
            }
        },
        error: () => {
            toast.error(String(resolveLanguageKey("errors.sessionFailed") ?? "errors.sessionFailed"));
            setBootLoading(false);
        },
    });
    useHttpRequest<PosConfig>(CONFIG_SINGLE_REQUEST, {_id: configId}, configSingleCount, true, {
        success: (cfg) => {
            if (cfg?._id) {
                setConfig(cfg);
                if (cfg.isPaused || !cfg.isActive) setTillLocked(true);
            }
            setOpenSessionOpen(true);
            setBootLoading(false);
        },
        // Unreadable settings: keep this till's last known config, else open without one.
        error: () => {
            setConfig((prev) => (prev?._id === configIdRef.current ? prev : null));
            setOpenSessionOpen(true);
            setBootLoading(false);
        },
    });

    useEffect(() => {
        setTillLocked(false);
        setBootLoading(true);
        if (!configId) setConfigsCount((count) => count + 1);
        else setBootCount((count) => count + 1);
    }, [configId]);

    const applyPausedConfig = useCallback((cfg: PosConfig | undefined | null) => {
        if (!cfg) return;
        setConfig(cfg);
        if (cfg.isPaused) setTillLocked(true);
    }, []);

    // Polled while a till is open; poll errors are ignored.
    const [refreshCount, setRefreshCount] = useState(0);
    useHttpRequest<{data: SessionBundle | null}>(CURRENT_SESSION_REQUEST, {configId}, refreshCount, true, {
        success: (response) => {
            const bundle = response.data;
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
        },
    });
    const refreshCurrentSession = useCallback(() => {
        if (configIdRef.current) setRefreshCount((count) => count + 1);
    }, []);

    useEffect(() => {
        const unbindSocket = bindPosKillSwitchSocket();
        const unsubscribe = subscribePosKillSwitch((_kind, payload) => {
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
            refreshCurrentSession();
        });
        return () => {
            unbindSocket();
            unsubscribe();
        };
    }, [refreshCurrentSession, rk]);

    useEffect(() => {
        if (!configId) return;
        const onFocus = () => refreshCurrentSession();
        window.addEventListener("focus", onFocus);
        const timer = window.setInterval(refreshCurrentSession, 20_000);
        return () => {
            window.removeEventListener("focus", onFocus);
            window.clearInterval(timer);
        };
    }, [configId, refreshCurrentSession]);

    const selectConfig = (id: string) => {
        setSearchParams({configId: id});
    };

    const [openCall, setOpenCall] = useState<Call<Record<string, unknown>>>({payload: {}, count: 0});
    const {loading: openingBusy} = useHttpRequest<{data: SessionBundle}>(OPEN_SESSION_REQUEST, openCall.payload, openCall.count, true, {
        success: (response) => {
            setSession(response.data.session);
            hadSessionRef.current = true;
            setConfig(response.data.config);
            setOpenSessionOpen(false);
            resetManagerPinRef.current();
            toast.success(rk("toast.sessionOpened"));
            if (!posFiscalizationActive(response.data.config)) {
                toast.warning(rk("fiscalization.inactive"));
            }
        },
        error: () => toast.error(rk("errors.openSessionFailed")),
    });
    const openSession = () => {
        if (!configId) return;
        setOpenCall(call({configId, openingBalance: Number(openingBalance) || 0, notes: openingNotes || undefined}));
    };

    const [cashMoveCall, setCashMoveCall] = useState<Call<{type: "in" | "out" | null; body: Record<string, unknown>}>>({payload: {type: null, body: {}}, count: 0});
    const {loading: cashMoveBusy} = useHttpRequest<{data: PosSession}>(CASH_MOVE_REQUEST, cashMoveCall.payload.body, cashMoveCall.count, true, {
        success: (response) => {
            setSession(response.data);
            setCashMoveOpen(null);
            setCashMoveAmount("");
            setCashMoveReason("");
            toast.success(rk(cashMoveCall.payload.type === "in" ? "toast.cashIn" : "toast.cashOut"));
        },
        error: () => toast.error(rk("errors.cashMoveFailed")),
    });
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
        setCashMoveCall(call({
            type: cashMoveOpen,
            body: {_id: session._id, type: cashMoveOpen, amount, reason: cashMoveReason || undefined, managerPin, managerId},
        }));
    };

    const [reconCall, setReconCall] = useState<Call<Record<string, unknown>>>({payload: {}, count: 0});
    useHttpRequest<{data: PosReconciliation}>(RECONCILIATION_REQUEST, reconCall.payload, reconCall.count, true, {
        success: (response) => setRecon(response.data),
        error: () => setRecon(null),
    });
    const loadReconciliation = (counted?: number) => {
        if (!session) return;
        setReconCall(call({sessionId: session._id, countedCash: counted}));
    };

    const [closeCall, setCloseCall] = useState<Call<Record<string, unknown>>>({payload: {}, count: 0});
    const {loading: closeBusy} = useHttpRequest(CLOSE_SESSION_REQUEST, closeCall.payload, closeCall.count, true, {
        success: () => {
            toast.success(rk("toast.sessionClosed"));
            setCloseOpen(false);
            onSessionClosedRef.current?.();
            navigate("/tenancy/systemSettings/posconfigs");
        },
        error: () => toast.error(rk("errors.closeSessionFailed")),
    });
    const closeSession = () => {
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
        setCloseCall(call({
            _id: session._id,
            closingBalance: balance,
            notes: closingNotes || undefined,
            differenceReason: differenceReason.trim() || undefined,
        }));
    };

    const openCloseSession = () => {
        if (!session) return;
        setClosingBalance(String(session.cashRegisterBalance ?? 0));
        setDifferenceReason("");
        setClosingNotes("");
        setCloseOpen(true);
        loadReconciliation(session.cashRegisterBalance ?? 0);
    };

    const [ordersCall, setOrdersCall] = useState<Call<Record<string, unknown>>>({payload: {}, count: 0});
    const {loading: ordersBusy} = useHttpRequest<{data: PosOrder[]}>(SESSION_ORDERS_REQUEST, ordersCall.payload, ordersCall.count, true, {
        success: (response) => setSessionOrders(response.data ?? []),
        error: () => {
            toast.error(rk("errors.ordersLoadFailed"));
            setSessionOrders([]);
        },
    });
    const openSessionOrders = () => {
        if (!session) return;
        setOrdersOpen(true);
        setOrdersCall(call({sessionId: session._id}));
    };

    const [reprintCall, setReprintCall] = useState<Call<Record<string, unknown>>>({payload: {}, count: 0});
    useHttpRequest<{data: {receipt: ReceiptPayload}}>(REPRINT_REQUEST, reprintCall.payload, reprintCall.count, true, {
        success: (response) => {
            setReceipt(response.data.receipt);
            setReceiptOpen(true);
            setOrdersOpen(false);
        },
        error: () => toast.error(rk("errors.reprintFailed")),
    });
    const reprintOrder = (id: string) => setReprintCall(call({_id: id}));

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
