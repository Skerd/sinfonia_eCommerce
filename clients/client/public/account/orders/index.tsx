import {useEffect, useState} from "react";
import {Link, useSearchParams} from "react-router-dom";
import {compose} from "redux";
import {ChevronLeft, ChevronRight} from "lucide-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {DATE_FORMATS, formatDate} from "@coreModule/helpers/general/dateTime.ts";
import {useShopConfig} from "@eCommerceModule/clients/client/public/shared/shopConfigContext.tsx";
import {resolveShopMediaUrl} from "@eCommerceModule/clients/client/public/shared/shopMedia.ts";
import ShopOrderStatus from "@eCommerceModule/clients/client/public/shared/shopOrderStatus.tsx";
import {SHOP_BUTTON_CLASS} from "@eCommerceModule/clients/client/public/shared/shopAuthChrome.tsx";
import type {BuyerProductOrder} from "armonia/src/modules/eCommerce/api/eCommerce/private/productOrder/productOrder.dto.ts";

const LANGUAGE_PATH = "src/modules/eCommerce/clients/client/public/account/orders/index.tsx";

const PAGE_SIZE = 10;

function OrdersPage({resolveLanguageKey}: WithLanguageType) {
    const {formatMoney} = useShopConfig();
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Math.max(1, Number(searchParams.get("page")) || 1);

    const [orders, setOrders] = useState<BuyerProductOrder[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        (async () => {
            try {
                const res = await apiClient.post<{data: BuyerProductOrder[]; total: number}>("/api/eCommerce/productOrder/my", {page, limit: PAGE_SIZE});
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
    }, [page]);

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const goToPage = (next: number) => setSearchParams(next > 1 ? {page: String(next)} : {});

    return (
        <div className="flex flex-col gap-6">
            <h1 className="font-shop-display text-3xl font-bold tracking-tight">{resolveLanguageKey("title")}</h1>

            {loading ? (
                <div className="flex flex-col gap-3" aria-busy="true" aria-label={resolveLanguageKey("loading")}>
                    {Array.from({length: 3}, (_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-shop-cream" />)}
                </div>
            ) : orders.length === 0 ? (
                <div className="flex flex-col items-center gap-4 rounded-3xl bg-shop-cream px-6 py-16 text-center">
                    <p className="font-shop-display text-xl font-semibold">{resolveLanguageKey("emptyTitle")}</p>
                    <p className="text-shop-ink-muted">{resolveLanguageKey("emptyMessage")}</p>
                    <Link to="/products" className={SHOP_BUTTON_CLASS}>{resolveLanguageKey("browse")}</Link>
                </div>
            ) : (
                <ul className="flex flex-col gap-3">
                    {orders.map(order => {
                        const items = order.items ?? [];
                        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
                        return (
                            <li key={order._id}>
                                <Link
                                    to={`/account/orders/${order._id}`}
                                    className="group flex items-center gap-4 rounded-2xl border border-shop-border p-4 transition-colors hover:border-shop-ink sm:p-5"
                                >
                                    <div className="hidden shrink-0 -space-x-3 sm:flex" aria-hidden>
                                        {items.slice(0, 3).map((item, index) => {
                                            const imageUrl = resolveShopMediaUrl(item.snapshot?.imageUrl);
                                            return (
                                                <div key={index} className="h-14 w-12 overflow-hidden rounded-lg bg-shop-cream ring-2 ring-white">
                                                    {imageUrl && <img src={imageUrl} alt="" className="h-full w-full object-cover" />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                            <span className="font-semibold">{resolveLanguageKey("orderNumber").replace("{number}", order.orderNumber)}</span>
                                            <ShopOrderStatus kind="status" value={order.status} />
                                        </div>
                                        <span className="text-sm text-shop-ink-muted">
                                            {formatDate(order.createdAt, {format: DATE_FORMATS.date})}
                                            {" · "}
                                            {resolveLanguageKey(itemCount === 1 ? "itemCountOne" : "itemCount").replace("{count}", String(itemCount))}
                                        </span>
                                    </div>
                                    <span className="font-shop-display font-semibold tabular-nums">{formatMoney(order.grandTotal)}</span>
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
                        onClick={() => goToPage(page - 1)}
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
                        onClick={() => goToPage(page + 1)}
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
)(OrdersPage);
