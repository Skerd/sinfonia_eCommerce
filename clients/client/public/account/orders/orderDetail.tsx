import {useEffect, useState} from "react";
import {Link, useParams, useSearchParams} from "react-router-dom";
import {compose} from "redux";
import {ArrowLeft, CircleCheck, Download} from "lucide-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {DATE_FORMATS, formatDate} from "@coreModule/helpers/general/dateTime.ts";
import {useShopConfig} from "@eCommerceModule/clients/client/public/shared/shopConfigContext.tsx";
import {resolveShopMediaUrl} from "@eCommerceModule/clients/client/public/shared/shopMedia.ts";
import ShopOrderStatus from "@eCommerceModule/clients/client/public/shared/shopOrderStatus.tsx";
import {SHOP_BUTTON_SECONDARY_CLASS, SHOP_LINK_CLASS} from "@eCommerceModule/clients/client/public/shared/shopAuthChrome.tsx";
import type {BuyerProductOrder} from "armonia/src/modules/eCommerce/api/eCommerce/private/productOrder/productOrder.dto.ts";
import type {DigitalDelivery} from "armonia/src/modules/eCommerce/api/eCommerce/private/digitalDelivery/digitalDelivery.dto.ts";

const LANGUAGE_PATH = "src/modules/eCommerce/clients/client/public/account/orders/orderDetail.tsx";

function OrderDetailPage({resolveLanguageKey}: WithLanguageType) {
    const {orderId = ""} = useParams();
    const [searchParams] = useSearchParams();
    const justPlaced = searchParams.get("placed") === "1";
    const siblingCount = (searchParams.get("siblings") ?? "").split(",").filter(Boolean).length;
    const {formatMoney} = useShopConfig();

    const [order, setOrder] = useState<BuyerProductOrder | null>(null);
    const [deliveries, setDeliveries] = useState<DigitalDelivery[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        (async () => {
            try {
                const [orderRes, deliveriesRes] = await Promise.all([
                    apiClient.post<{data: BuyerProductOrder}>("/api/eCommerce/productOrder/mySingle", {_id: orderId}),
                    apiClient.post<{data: DigitalDelivery[]}>("/api/eCommerce/digitalDelivery/my", {orderId}),
                ]);
                if (cancelled) return;
                setOrder(orderRes.data.data);
                setDeliveries(deliveriesRes.data.data ?? []);
            } catch {
                if (!cancelled) setOrder(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [orderId]);

    if (loading) {
        return <div className="h-96 animate-pulse rounded-2xl bg-shop-cream" aria-busy="true" aria-label={resolveLanguageKey("loading")} />;
    }

    if (!order) {
        return (
            <div className="flex flex-col items-start gap-4">
                <h1 className="font-shop-display text-3xl font-bold tracking-tight">{resolveLanguageKey("notFound")}</h1>
                <Link to="/account/orders" className={SHOP_LINK_CLASS}>{resolveLanguageKey("backToOrders")}</Link>
            </div>
        );
    }

    const address = order.shippingAddress;
    const paidLater = order.paymentStatus === "unpaid";

    return (
        <div className="flex flex-col gap-8">
            <Link to="/account/orders" className="inline-flex items-center gap-1.5 self-start text-sm text-shop-ink-muted hover:text-shop-ink">
                <ArrowLeft className="h-4 w-4" aria-hidden />
                {resolveLanguageKey("backToOrders")}
            </Link>

            {justPlaced && (
                <div className="flex gap-4 rounded-2xl bg-shop-cream p-6" role="status">
                    <CircleCheck className="h-7 w-7 shrink-0 text-shop-success" aria-hidden />
                    <div className="flex flex-col gap-1">
                        <p className="font-shop-display text-xl font-semibold">{resolveLanguageKey("placedTitle")}</p>
                        <p className="text-shop-ink-muted">
                            {resolveLanguageKey(paidLater ? "placedPayLater" : "placedPaid")}
                        </p>
                        {siblingCount > 0 && (
                            <p className="text-shop-ink-muted">
                                {resolveLanguageKey("siblingsNotice").replace("{count}", String(siblingCount))}{" "}
                                <Link to="/account/orders" className={SHOP_LINK_CLASS}>{resolveLanguageKey("viewAllOrders")}</Link>
                            </p>
                        )}
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-3">
                <h1 className="font-shop-display text-3xl font-bold tracking-tight">
                    {resolveLanguageKey("title").replace("{number}", order.orderNumber)}
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-sm text-shop-ink-muted">
                    <span>{resolveLanguageKey("placedOn").replace("{date}", formatDate(order.createdAt, {format: DATE_FORMATS.date}))}</span>
                    <ShopOrderStatus kind="status" value={order.status} />
                    <ShopOrderStatus kind="paymentStatus" value={order.paymentStatus} />
                    <ShopOrderStatus kind="fulfillmentStatus" value={order.fulfillmentStatus} />
                </div>
            </div>

            <div className="grid items-start gap-8 lg:grid-cols-[1fr_340px]">
                <div className="flex flex-col gap-8">
                    <section aria-labelledby="shop-order-items">
                        <h2 id="shop-order-items" className="mb-2 font-semibold">{resolveLanguageKey("itemsTitle")}</h2>
                        <ul className="divide-y divide-shop-border border-y border-shop-border">
                            {(order.items ?? []).map(item => {
                                const imageUrl = resolveShopMediaUrl(item.snapshot?.imageUrl);
                                return (
                                    <li key={item._id} className="flex items-center gap-4 py-4">
                                        <div className="h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-shop-cream">
                                            {imageUrl && <img src={imageUrl} alt="" className="h-full w-full object-cover" />}
                                        </div>
                                        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                                            <p className="font-medium">{item.snapshot?.title}</p>
                                            {item.snapshot?.variantLabel && <p className="text-sm text-shop-ink-muted">{item.snapshot.variantLabel}</p>}
                                            <p className="text-sm text-shop-ink-muted tabular-nums">
                                                {resolveLanguageKey("quantityTimes")
                                                    .replace("{quantity}", String(item.quantity))
                                                    .replace("{price}", formatMoney(item.unitPrice, order.currency))}
                                            </p>
                                        </div>
                                        <span className="font-medium tabular-nums">{formatMoney(item.totalPrice, order.currency)}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    </section>

                    {deliveries.length > 0 && (
                        <section aria-labelledby="shop-order-downloads" className="flex flex-col gap-3">
                            <h2 id="shop-order-downloads" className="font-semibold">{resolveLanguageKey("downloadsTitle")}</h2>
                            {deliveries.map(delivery => (
                                <div key={delivery._id} className="flex flex-col gap-2 rounded-2xl border border-shop-border p-4">
                                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                                        <p className="font-medium">{delivery.product?.title ?? resolveLanguageKey("digitalProduct")}</p>
                                        <p className="text-sm text-shop-ink-muted">
                                            {resolveLanguageKey("downloadsLeft").replace("{count}", String(delivery.remainingDownloads))}
                                            {delivery.expiresAt ? ` · ${resolveLanguageKey("expires").replace("{date}", formatDate(delivery.expiresAt, {format: DATE_FORMATS.date}))}` : ""}
                                        </p>
                                    </div>
                                    <ul className="flex flex-wrap gap-2">
                                        {delivery.files.map(file => (
                                            <li key={file._id}>
                                                <a
                                                    href={`/api/eCommerce/digitalDownload/${delivery.token}/${file._id}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className={SHOP_BUTTON_SECONDARY_CLASS}
                                                >
                                                    <Download className="h-4 w-4" aria-hidden />
                                                    {file.fileName ?? resolveLanguageKey("download")}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </section>
                    )}

                    {(order.timeline?.length ?? 0) > 0 && (
                        <section aria-labelledby="shop-order-history">
                            <h2 id="shop-order-history" className="mb-4 font-semibold">{resolveLanguageKey("historyTitle")}</h2>
                            <ol className="relative flex flex-col gap-5 border-l border-shop-border pl-6">
                                {[...(order.timeline ?? [])].reverse().map((entry, index) => (
                                    <li key={`${entry.event}-${entry.timestamp}-${index}`} className="relative">
                                        <span className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full bg-shop-ink ring-4 ring-white" aria-hidden />
                                        <p className="font-medium">
                                            {resolveLanguageKey(`events.${entry.event}`, true) ?? entry.event.replaceAll("_", " ")}
                                        </p>
                                        <p className="text-sm text-shop-ink-muted">{formatDate(entry.timestamp, {format: DATE_FORMATS.dateTime})}</p>
                                    </li>
                                ))}
                            </ol>
                        </section>
                    )}
                </div>

                <aside className="flex flex-col gap-6 rounded-2xl bg-shop-cream p-6 lg:sticky lg:top-28">
                    <section className="flex flex-col gap-1 text-sm">
                        <h2 className="mb-1 font-semibold">{resolveLanguageKey("shippingTo")}</h2>
                        <p>{address.firstName} {address.lastName}</p>
                        <p className="text-shop-ink-muted">{address.street}</p>
                        <p className="text-shop-ink-muted">{[address.postalCode, address.city, address.country?.name].filter(Boolean).join(", ")}</p>
                        {address.phone && <p className="text-shop-ink-muted">{address.phone}</p>}
                        {order.shippingRate && (
                            <p className="mt-2 text-shop-ink-muted">
                                {order.shippingRate.name}{order.shippingRate.carrier ? ` · ${order.shippingRate.carrier}` : ""}
                            </p>
                        )}
                    </section>
                    <dl className="flex flex-col gap-2.5 border-t border-shop-border pt-5 text-[15px]">
                        <div className="flex justify-between"><dt className="text-shop-ink-muted">{resolveLanguageKey("subtotal")}</dt><dd className="tabular-nums">{formatMoney(order.subtotal, order.currency)}</dd></div>
                        {order.discountTotal > 0 && (
                            <div className="flex justify-between text-shop-success"><dt>{resolveLanguageKey("discount")}</dt><dd className="tabular-nums">−{formatMoney(order.discountTotal, order.currency)}</dd></div>
                        )}
                        <div className="flex justify-between"><dt className="text-shop-ink-muted">{resolveLanguageKey("shipping")}</dt><dd className="tabular-nums">{formatMoney(order.shippingTotal, order.currency)}</dd></div>
                        <div className="flex justify-between"><dt className="text-shop-ink-muted">{resolveLanguageKey("tax")}</dt><dd className="tabular-nums">{formatMoney(order.taxTotal, order.currency)}</dd></div>
                        {(order.giftCard?.amount ?? 0) > 0 && (
                            <div className="flex justify-between text-shop-success"><dt>{resolveLanguageKey("giftCard")}</dt><dd className="tabular-nums">−{formatMoney(order.giftCard?.amount, order.currency)}</dd></div>
                        )}
                        <div className="flex items-baseline justify-between border-t border-shop-border pt-3">
                            <dt className="font-semibold">{resolveLanguageKey("total")}</dt>
                            <dd className="font-shop-display text-2xl font-semibold tabular-nums">{formatMoney(order.grandTotal, order.currency)}</dd>
                        </div>
                    </dl>
                </aside>
            </div>
        </div>
    );
}

export default compose(
    withLanguage(LANGUAGE_PATH),
    withDebug(true, true),
)(OrderDetailPage);
