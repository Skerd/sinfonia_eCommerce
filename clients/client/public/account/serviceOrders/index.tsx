import {useEffect, useState} from "react";
import {Link, useSearchParams} from "react-router-dom";
import {compose} from "redux";
import {BellDot, ChevronLeft, ChevronRight, Clock} from "lucide-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {DATE_FORMATS, formatDate} from "@coreModule/helpers/general/dateTime.ts";
import {resolveShopMediaUrl} from "@eCommerceModule/clients/client/public/shared/shopMedia.ts";
import {useShopConfig} from "@eCommerceModule/clients/client/public/shared/shopConfigContext.tsx";
import ShopOrderStatus from "@eCommerceModule/clients/client/public/shared/shopOrderStatus.tsx";
import {SHOP_BUTTON_CLASS} from "@eCommerceModule/clients/client/public/shared/shopAuthChrome.tsx";
import {orderStatuses} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/order/order.schema-def.ts";
import type {BuyerServiceOrder} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/order/order.dto.ts";

const LANGUAGE_PATH = "src/modules/eCommerce/clients/client/public/account/serviceOrders/index.tsx";

const PAGE_SIZE = 10;

const CHIP_CLASS = "inline-flex h-9 shrink-0 items-center whitespace-nowrap rounded-full border px-3.5 text-sm font-medium transition-colors";

/** What the order is for: the listing, or the job a bid won. */
export function serviceOrderTitle(order: BuyerServiceOrder): string {
    return order.listing?.title ?? order.taskRequest?.title ?? order.name;
}

function ServiceOrdersPage({resolveLanguageKey}: WithLanguageType) {
    const {formatMoney} = useShopConfig();
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const requestedStatus = searchParams.get("status");
    const status = orderStatuses.find(value => value === requestedStatus);

    const [orders, setOrders] = useState<BuyerServiceOrder[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        (async () => {
            try {
                const res = await apiClient.post<{data: BuyerServiceOrder[]; total: number}>("/api/eCommerceMarketplace/order/my", {
                    page,
                    limit: PAGE_SIZE,
                    status,
                });
                if (cancelled) return;
                setOrders(res.data.data ?? []);
                setTotal(res.data.total ?? 0);
            } catch {
                if (!cancelled) setOrders([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [page, status]);

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const goTo = (next: {page?: number; status?: string}) => {
        const params: Record<string, string> = {};
        if (next.status) params.status = next.status;
        if (next.page && next.page > 1) params.page = String(next.page);
        setSearchParams(params);
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <h1 className="font-shop-display text-3xl font-bold tracking-tight">{resolveLanguageKey("title")}</h1>
                <Link to="/services" className="text-sm font-medium text-shop-accent hover:underline underline-offset-4">{resolveLanguageKey("browse")}</Link>
            </div>

            <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" aria-label={resolveLanguageKey("filterLabel")}>
                {[undefined, ...orderStatuses].map(value => (
                    <li key={value ?? "all"}>
                        <button
                            type="button"
                            onClick={() => goTo({status: value})}
                            aria-pressed={status === value}
                            className={cn(CHIP_CLASS, status === value ? "border-shop-ink bg-shop-ink text-white" : "border-shop-border hover:border-shop-ink")}
                        >
                            {value ? resolveLanguageKey(`statusFilter.${value}`) : resolveLanguageKey("allStatuses")}
                        </button>
                    </li>
                ))}
            </ul>

            {loading ? (
                <div className="flex flex-col gap-3" aria-busy="true" aria-label={resolveLanguageKey("loading")}>
                    {Array.from({length: 3}, (_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-shop-cream" />)}
                </div>
            ) : orders.length === 0 ? (
                <div className="flex flex-col items-center gap-4 rounded-3xl bg-shop-cream px-6 py-16 text-center">
                    <p className="font-shop-display text-xl font-semibold">{resolveLanguageKey("emptyTitle")}</p>
                    <p className="text-shop-ink-muted">{resolveLanguageKey(status ? "emptyFiltered" : "emptyMessage")}</p>
                    <Link to="/services" className={SHOP_BUTTON_CLASS}>{resolveLanguageKey("browse")}</Link>
                </div>
            ) : (
                <ul className="flex flex-col gap-3">
                    {orders.map(order => {
                        const imageUrl = resolveShopMediaUrl(order.listingImage);
                        const needsAction = order.deliverySubmitted && order.status === "in_progress";
                        return (
                            <li key={order._id}>
                                <Link
                                    to={`/account/services/${order._id}`}
                                    className="group flex items-center gap-4 rounded-2xl border border-shop-border p-4 transition-colors hover:border-shop-ink sm:p-5"
                                >
                                    <div className="hidden h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-shop-cream sm:block" aria-hidden>
                                        {imageUrl && <img src={imageUrl} alt="" className="h-full w-full object-cover" />}
                                    </div>
                                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                            <span className="truncate font-semibold">{serviceOrderTitle(order)}</span>
                                            {order.status && <ShopOrderStatus kind="serviceStatus" value={order.status} />}
                                        </div>
                                        <span className="flex flex-wrap items-center gap-x-2 text-sm text-shop-ink-muted">
                                            <span>{order.name}</span>
                                            {order.provider && <span>· {[order.provider.name, order.provider.surname].filter(Boolean).join(" ")}</span>}
                                            {order.deliveryDueDate && order.status !== "completed" && order.status !== "cancelled" && (
                                                <span className="inline-flex items-center gap-1">
                                                    · <Clock className="h-3.5 w-3.5" aria-hidden />
                                                    {resolveLanguageKey("dueOn").replace("{date}", formatDate(order.deliveryDueDate, {format: DATE_FORMATS.date}))}
                                                </span>
                                            )}
                                        </span>
                                        {needsAction && (
                                            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-shop-accent">
                                                <BellDot className="h-4 w-4" aria-hidden />
                                                {resolveLanguageKey("deliveryWaiting")}
                                            </span>
                                        )}
                                    </div>
                                    <span className="font-shop-display font-semibold tabular-nums">{formatMoney(order.amount, order.currency)}</span>
                                    <ChevronRight className="h-4 w-4 shrink-0 text-shop-ink-faded transition-transform group-hover:translate-x-0.5" aria-hidden />
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}

            {totalPages > 1 && (
                <nav className="flex items-center justify-center gap-3" aria-label={resolveLanguageKey("pagination")}>
                    <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() => goTo({page: page - 1, status})}
                        className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-shop-cream disabled:opacity-30"
                        aria-label={resolveLanguageKey("previousPage")}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm text-shop-ink-muted">
                        {resolveLanguageKey("pageOf").replace("{page}", String(page)).replace("{total}", String(totalPages))}
                    </span>
                    <button
                        type="button"
                        disabled={page >= totalPages}
                        onClick={() => goTo({page: page + 1, status})}
                        className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-shop-cream disabled:opacity-30"
                        aria-label={resolveLanguageKey("nextPage")}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </nav>
            )}
        </div>
    );
}

export default compose(
    withLanguage(LANGUAGE_PATH),
    withDebug(true, true),
)(ServiceOrdersPage);
