import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import {getToken} from "@coreModule/helpers/context/localStorage/authenticationStorage.ts";
import {useShopConfig} from "@eCommerceModule/clients/client/public/shared/shopConfigContext.tsx";

type MyOrderItem = {
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    snapshot?: {title?: string; sku?: string};
};

type MyOrder = {
    _id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    fulfillmentStatus: string;
    grandTotal: number;
    subtotal: number;
    shippingTotal: number;
    taxTotal: number;
    discountTotal: number;
    items: MyOrderItem[];
    createdAt?: string;
};

type MyDigitalDelivery = {
    _id: string;
    order?: string;
    product?: {title?: string};
    token: string;
    files: {_id: string; fileName?: string}[];
    remainingDownloads: number;
    expiresAt?: string;
};

const STATUS_STYLES: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    confirmed: "bg-blue-100 text-blue-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-indigo-100 text-indigo-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-700",
    refunded: "bg-gray-200 text-gray-700",
};

function StatusBadge({value}: {value: string}) {
    return (
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${STATUS_STYLES[value] ?? "bg-gray-100 text-gray-700"}`}>
            {value.replaceAll("_", " ")}
        </span>
    );
}

const PAGE_SIZE = 10;

function OrdersPage() {
    const {formatMoney} = useShopConfig();
    const signedIn = Boolean(getToken());

    const [orders, setOrders] = useState<MyOrder[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [deliveriesByOrder, setDeliveriesByOrder] = useState<Record<string, MyDigitalDelivery[]>>({});

    useEffect(() => {
        if (!signedIn) return;
        let cancelled = false;
        (async () => {
            try {
                const res = await apiClient.post<{data: MyDigitalDelivery[]}>("/api/eCommerce/digitalDelivery/my", {});
                if (cancelled) return;
                const grouped: Record<string, MyDigitalDelivery[]> = {};
                for (const delivery of res.data.data ?? []) {
                    if (!delivery.order) continue;
                    (grouped[delivery.order] ??= []).push(delivery);
                }
                setDeliveriesByOrder(grouped);
            } catch {
                if (!cancelled) setDeliveriesByOrder({});
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [signedIn]);

    useEffect(() => {
        if (!signedIn) {
            setLoading(false);
            return;
        }
        let cancelled = false;
        setLoading(true);
        (async () => {
            try {
                const res = await apiClient.post<{data: MyOrder[]; total: number}>("/api/eCommerce/productOrder/my", {page, limit: PAGE_SIZE});
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
    }, [signedIn, page]);

    if (!signedIn) {
        return (
            <div className="py-16 text-center">
                <h1 className="font-shop-display text-2xl font-semibold">My orders</h1>
                <p className="mt-2 text-shop-ink-muted">Sign in from the main app to see your orders.</p>
            </div>
        );
    }

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="font-shop-display text-3xl font-semibold">My orders</h1>
                <Link to="/account/giftcards" className="text-sm font-medium text-shop-accent hover:underline">
                    My gift cards →
                </Link>
            </div>

            {loading ? (
                <div className="h-48 animate-pulse rounded-xl bg-shop-cream" />
            ) : orders.length === 0 ? (
                <div className="rounded-xl border border-dashed border-shop-border py-16 text-center text-shop-ink-muted">
                    You have no orders yet.
                </div>
            ) : (
                <ul className="space-y-3">
                    {orders.map(order => {
                        const isOpen = expanded === order._id;
                        return (
                            <li key={order._id} className="rounded-xl border border-shop-border">
                                <button
                                    onClick={() => setExpanded(isOpen ? null : order._id)}
                                    className="flex w-full flex-wrap items-center justify-between gap-3 p-4 text-left"
                                >
                                    <span>
                                        <span className="block text-sm font-semibold">{order.orderNumber}</span>
                                        {order.createdAt && (
                                            <span className="text-xs text-shop-ink-faded">{new Date(order.createdAt).toLocaleDateString()}</span>
                                        )}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <StatusBadge value={order.status} />
                                        <StatusBadge value={order.paymentStatus} />
                                        <span className="text-sm font-semibold">{formatMoney(order.grandTotal)}</span>
                                    </span>
                                </button>
                                {isOpen && (
                                    <div className="border-t border-shop-border p-4 text-sm">
                                        <ul className="space-y-1">
                                            {order.items.map((item, index) => (
                                                <li key={index} className="flex justify-between gap-2">
                                                    <span className="text-shop-ink-muted">
                                                        {item.quantity}× {item.snapshot?.title ?? "Item"}
                                                        {item.snapshot?.sku ? ` (${item.snapshot.sku})` : ""}
                                                    </span>
                                                    <span>{formatMoney(item.totalPrice)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        {(deliveriesByOrder[order._id]?.length ?? 0) > 0 && (
                                            <div className="mt-3 border-t border-shop-border pt-2">
                                                <p className="mb-1 font-semibold">Downloads</p>
                                                <ul className="space-y-1">
                                                    {deliveriesByOrder[order._id].map(delivery => (
                                                        <li key={delivery._id}>
                                                            <span className="text-shop-ink-muted">{delivery.product?.title ?? "Digital product"}</span>
                                                            <span className="text-xs text-shop-ink-faded"> · {delivery.remainingDownloads} downloads left</span>
                                                            <span className="ml-2 inline-flex flex-wrap gap-2">
                                                                {delivery.files.map(file => (
                                                                    <a
                                                                        key={file._id}
                                                                        href={`/api/eCommerce/digitalDownload/${delivery.token}/${file._id}`}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="text-shop-accent underline"
                                                                    >
                                                                        {file.fileName ?? "Download"}
                                                                    </a>
                                                                ))}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        <div className="mt-3 space-y-1 border-t border-shop-border pt-2">
                                            <div className="flex justify-between"><span className="text-shop-ink-muted">Subtotal</span><span>{formatMoney(order.subtotal)}</span></div>
                                            {order.discountTotal > 0 && (
                                                <div className="flex justify-between text-green-700"><span>Discount</span><span>-{formatMoney(order.discountTotal)}</span></div>
                                            )}
                                            <div className="flex justify-between"><span className="text-shop-ink-muted">Shipping</span><span>{formatMoney(order.shippingTotal)}</span></div>
                                            <div className="flex justify-between"><span className="text-shop-ink-muted">Tax</span><span>{formatMoney(order.taxTotal)}</span></div>
                                            <div className="flex justify-between font-semibold"><span>Total</span><span>{formatMoney(order.grandTotal)}</span></div>
                                        </div>
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3">
                    <button
                        disabled={page <= 1}
                        onClick={() => setPage(p => p - 1)}
                        className="rounded-md border border-shop-border px-3 py-1.5 text-sm disabled:opacity-40"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-shop-ink-muted">Page {page} of {totalPages}</span>
                    <button
                        disabled={page >= totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="rounded-md border border-shop-border px-3 py-1.5 text-sm disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}

export default OrdersPage;
