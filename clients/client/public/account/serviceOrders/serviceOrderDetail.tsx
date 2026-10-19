import {useCallback, useEffect, useState, type FormEvent} from "react";
import {Link, useParams, useSearchParams} from "react-router-dom";
import {compose} from "redux";
import {toast} from "sonner";
import {ArrowLeft, CalendarDays, Check, CircleCheck, Download, Star} from "lucide-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {handleError} from "@coreModule/helpers/general/errors.ts";
import {DATE_FORMATS, formatDate} from "@coreModule/helpers/general/dateTime.ts";
import {resolveShopMediaUrl} from "@eCommerceModule/clients/client/public/shared/shopMedia.ts";
import {ShopProviderAvatar, useMarketplaceMoney} from "@eCommerceModule/clients/client/public/shared/shopMarketplace.tsx";
import ShopOrderStatus from "@eCommerceModule/clients/client/public/shared/shopOrderStatus.tsx";
import {
    SHOP_BUTTON_CLASS,
    SHOP_BUTTON_SECONDARY_CLASS,
    SHOP_FIELD_INPUT_CLASS,
    SHOP_FIELD_LABEL_CLASS,
    SHOP_LINK_CLASS,
} from "@eCommerceModule/clients/client/public/shared/shopAuthChrome.tsx";
import {serviceOrderTitle} from "./index.tsx";
import type {BuyerServiceOrder} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/order/order.dto.ts";
import type {Media} from "armonia/src/modules/core/types/index.ts";

const LANGUAGE_PATH = "src/modules/eCommerce/clients/client/public/account/serviceOrders/serviceOrderDetail.tsx";

/** The happy path an order walks; cancelled orders show their own banner instead. */
const STEPS = ["pending", "accepted", "in_progress", "completed"] as const;

const REVISION_REASON_MIN = 10;

type Panel = "cancel" | "revision" | "dispute" | "review" | null;

/** Delivery files are tenant media: fetched with the session token, then opened from memory. */
async function downloadMedia(media: Media) {
    const res = await apiClient.get<Blob>(`/api/auxiliary/media/${media._id}`, {responseType: "blob"});
    const url = URL.createObjectURL(res.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = media.name || media._id;
    link.click();
    URL.revokeObjectURL(url);
}

function ServiceOrderDetailPage({resolveLanguageKey}: WithLanguageType) {
    const {orderId = ""} = useParams();
    const [searchParams] = useSearchParams();
    const justPlaced = searchParams.get("placed") === "1";
    const formatMoney = useMarketplaceMoney();

    const [order, setOrder] = useState<BuyerServiceOrder | null>(null);
    const [loading, setLoading] = useState(true);
    const [panel, setPanel] = useState<Panel>(null);
    const [text, setText] = useState("");
    const [rating, setRating] = useState(5);
    const [busy, setBusy] = useState(false);

    const load = useCallback(async () => {
        try {
            const res = await apiClient.post<{data: BuyerServiceOrder}>("/api/eCommerceMarketplace/order/mySingle", {_id: orderId});
            setOrder(res.data.data);
        } catch {
            setOrder(null);
        }
    }, [orderId]);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        load().finally(() => {
            if (!cancelled) setLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, [load]);

    function openPanel(next: Panel) {
        setPanel(next);
        setText("");
        setRating(5);
    }

    /** Runs one buyer action, then reloads the order so every block reflects the new state. */
    async function run(request: () => Promise<unknown>, successKey: string) {
        setBusy(true);
        try {
            await request();
            toast.success(resolveLanguageKey(successKey));
            setPanel(null);
            await load();
        } catch (err) {
            handleError(err, {context: "ServiceOrder", showToast: true, fallbackMessage: resolveLanguageKey("actionError")});
        } finally {
            setBusy(false);
        }
    }

    if (loading) {
        return <div className="h-96 animate-pulse rounded-2xl bg-shop-cream" aria-busy="true" aria-label={resolveLanguageKey("loading")} />;
    }

    if (!order) {
        return (
            <div className="flex flex-col items-start gap-4">
                <h1 className="font-shop-display text-3xl font-bold tracking-tight">{resolveLanguageKey("notFound")}</h1>
                <Link to="/account/services" className={SHOP_LINK_CLASS}>{resolveLanguageKey("backToOrders")}</Link>
            </div>
        );
    }

    const status = order.status ?? "pending";
    const isFinal = status === "completed" || status === "cancelled";
    const canCancel = (status === "pending" || status === "accepted") && !order.hasActiveDispute;
    const canAnswerDelivery = status === "in_progress" && Boolean(order.deliverySubmitted);
    const canDispute = !isFinal && !order.hasActiveDispute;
    const canReview = status === "completed" && !order.reviewed;
    const stepIndex = STEPS.indexOf(status as (typeof STEPS)[number]);
    const providerName = [order.provider?.name, order.provider?.surname].filter(Boolean).join(" ");
    const imageUrl = resolveShopMediaUrl(order.listingImage);
    const deliveries = order.deliveries ?? [];
    const revisions = order.revisions ?? [];
    const milestones = order.milestones ?? [];
    const bookings = order.bookings ?? [];

    function submitPanel(event: FormEvent) {
        event.preventDefault();
        if (!order) return;
        if (panel === "revision") {
            void run(() => apiClient.post("/api/eCommerceMarketplace/order/requestRevision", {_id: order._id, reason: text.trim()}), "revisionSent");
        } else if (panel === "dispute") {
            void run(() => apiClient.put("/api/eCommerceMarketplace/dispute/createMine", {order: order._id, reason: text.trim()}), "disputeOpened");
        } else if (panel === "review") {
            void run(() => apiClient.put("/api/eCommerceMarketplace/review/createMine", {order: order._id, rating, comment: text.trim() || undefined}), "reviewThanks");
        } else if (panel === "cancel") {
            void run(() => apiClient.post("/api/eCommerceMarketplace/order/cancel", {_id: order._id}), "cancelled");
        }
    }

    return (
        <div className="flex flex-col gap-8">
            <Link to="/account/services" className="inline-flex items-center gap-1.5 self-start text-sm text-shop-ink-muted hover:text-shop-ink">
                <ArrowLeft className="h-4 w-4" aria-hidden />
                {resolveLanguageKey("backToOrders")}
            </Link>

            {justPlaced && (
                <div className="flex gap-4 rounded-2xl bg-shop-cream p-6" role="status">
                    <CircleCheck className="h-7 w-7 shrink-0 text-shop-success" aria-hidden />
                    <div className="flex flex-col gap-1">
                        <p className="font-shop-display text-xl font-semibold">{resolveLanguageKey("placedTitle")}</p>
                        <p className="text-shop-ink-muted">{resolveLanguageKey("placedMessage")}</p>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                {imageUrl && (
                    <div className="h-20 w-28 shrink-0 overflow-hidden rounded-2xl bg-shop-cream">
                        <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                    </div>
                )}
                <div className="flex min-w-0 flex-col gap-2">
                    <h1 className="font-shop-display text-3xl font-bold tracking-tight">{serviceOrderTitle(order)}</h1>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-shop-ink-muted">
                        <span>{order.name}</span>
                        {order.createdAt && <span>· {resolveLanguageKey("placedOn").replace("{date}", formatDate(order.createdAt, {format: DATE_FORMATS.date}))}</span>}
                        <ShopOrderStatus kind="serviceStatus" value={status} />
                        {order.hasActiveDispute && (
                            <span className="inline-flex rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-200">
                                {resolveLanguageKey("disputeOpen")}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {status === "cancelled" ? (
                <p className="rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-700">{resolveLanguageKey("cancelledBanner")}</p>
            ) : (
                <ol className="grid grid-cols-4 gap-2" aria-label={resolveLanguageKey("progressLabel")}>
                    {STEPS.map((step, index) => {
                        const done = index <= stepIndex;
                        return (
                            <li key={step} className="flex flex-col gap-2" aria-current={index === stepIndex ? "step" : undefined}>
                                <span className={cn("h-1.5 rounded-full", done ? "bg-shop-ink" : "bg-shop-sand")} aria-hidden />
                                <span className={cn("text-xs font-medium sm:text-sm", done ? "text-shop-ink" : "text-shop-ink-faded")}>
                                    {resolveLanguageKey(`steps.${step}`)}
                                </span>
                            </li>
                        );
                    })}
                </ol>
            )}

            <div className="grid items-start gap-8 lg:grid-cols-[1fr_340px]">
                <div className="flex flex-col gap-8">
                    {canAnswerDelivery && panel === null && (
                        <div className="flex flex-col gap-4 rounded-2xl border border-shop-accent/30 bg-shop-accent/5 p-5">
                            <div className="flex flex-col gap-1">
                                <p className="font-semibold">{resolveLanguageKey("deliveryReadyTitle")}</p>
                                <p className="text-sm text-shop-ink-muted">{resolveLanguageKey("deliveryReadyMessage")}</p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    disabled={busy || order.hasActiveDispute}
                                    onClick={() => run(() => apiClient.post("/api/eCommerceMarketplace/order/acceptDelivery", {_id: order._id}), "deliveryAccepted")}
                                    className={SHOP_BUTTON_CLASS}
                                >
                                    <Check className="h-4 w-4" aria-hidden />
                                    {resolveLanguageKey("acceptDelivery")}
                                </button>
                                <button type="button" disabled={busy} onClick={() => openPanel("revision")} className={SHOP_BUTTON_SECONDARY_CLASS}>
                                    {resolveLanguageKey("requestRevision")}
                                </button>
                            </div>
                        </div>
                    )}

                    {panel && (
                        <form onSubmit={submitPanel} className="flex flex-col gap-4 rounded-2xl bg-shop-cream p-5">
                            <p className="font-semibold">{resolveLanguageKey(`panel.${panel}.title`)}</p>
                            <p className="text-sm text-shop-ink-muted">{resolveLanguageKey(`panel.${panel}.message`)}</p>
                            {panel === "review" && (
                                <fieldset>
                                    <legend className="mb-2 text-sm font-medium">{resolveLanguageKey("ratingLabel")}</legend>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map(n => (
                                            <button
                                                key={n}
                                                type="button"
                                                onClick={() => setRating(n)}
                                                aria-label={resolveLanguageKey("starsOption").replace("{count}", String(n))}
                                                aria-pressed={n === rating}
                                                className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white"
                                            >
                                                <Star className={cn("h-6 w-6", n <= rating ? "fill-shop-ink text-shop-ink" : "text-shop-ink/25")} />
                                            </button>
                                        ))}
                                    </div>
                                </fieldset>
                            )}
                            {panel !== "cancel" && (
                                <label className={SHOP_FIELD_LABEL_CLASS}>
                                    {resolveLanguageKey(`panel.${panel}.field`)}
                                    <textarea
                                        value={text}
                                        onChange={event => setText(event.target.value)}
                                        rows={4}
                                        maxLength={2000}
                                        required={panel !== "review"}
                                        minLength={panel === "revision" ? REVISION_REASON_MIN : undefined}
                                        className={cn(SHOP_FIELD_INPUT_CLASS, "h-auto bg-white py-2.5")}
                                    />
                                </label>
                            )}
                            <div className="flex flex-wrap gap-3">
                                <button type="submit" disabled={busy} className={cn(SHOP_BUTTON_CLASS, panel === "cancel" && "bg-shop-danger hover:bg-shop-danger/90")}>
                                    {resolveLanguageKey(busy ? "working" : `panel.${panel}.submit`)}
                                </button>
                                <button type="button" disabled={busy} onClick={() => setPanel(null)} className={SHOP_BUTTON_SECONDARY_CLASS}>
                                    {resolveLanguageKey("back")}
                                </button>
                            </div>
                        </form>
                    )}

                    {order.note && (
                        <section className="flex flex-col gap-2" aria-labelledby="shop-service-note">
                            <h2 id="shop-service-note" className="font-semibold">{resolveLanguageKey("noteTitle")}</h2>
                            <p className="whitespace-pre-line rounded-2xl border border-shop-border p-4 text-[15px] text-shop-ink-muted">{order.note}</p>
                        </section>
                    )}

                    <section className="flex flex-col gap-3" aria-labelledby="shop-service-deliveries">
                        <h2 id="shop-service-deliveries" className="font-semibold">{resolveLanguageKey("deliveriesTitle")}</h2>
                        {deliveries.length === 0 ? (
                            <p className="text-sm text-shop-ink-muted">{resolveLanguageKey("noDeliveries")}</p>
                        ) : (
                            <ul className="flex flex-col gap-3">
                                {deliveries.map(delivery => (
                                    <li key={delivery._id} className="flex flex-col gap-3 rounded-2xl border border-shop-border p-4">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <ShopOrderStatus kind="deliveryStatus" value={delivery.status} />
                                            {delivery.createdAt && <span className="text-xs text-shop-ink-faded">{formatDate(delivery.createdAt, {format: DATE_FORMATS.dateTime})}</span>}
                                        </div>
                                        {delivery.message && <p className="whitespace-pre-line text-[15px] text-shop-ink-muted">{delivery.message}</p>}
                                        {delivery.attachments.length > 0 && (
                                            <ul className="flex flex-wrap gap-2">
                                                {delivery.attachments.map(file => (
                                                    <li key={file._id}>
                                                        <button
                                                            type="button"
                                                            onClick={() => downloadMedia(file).catch(() => toast.error(resolveLanguageKey("downloadError")))}
                                                            className={cn(SHOP_BUTTON_SECONDARY_CLASS, "h-9 px-4")}
                                                        >
                                                            <Download className="h-4 w-4" aria-hidden />
                                                            {file.name || resolveLanguageKey("attachment")}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    {revisions.length > 0 && (
                        <section className="flex flex-col gap-3" aria-labelledby="shop-service-revisions">
                            <h2 id="shop-service-revisions" className="font-semibold">{resolveLanguageKey("revisionsTitle")}</h2>
                            <ul className="flex flex-col gap-2">
                                {revisions.map(revision => (
                                    <li key={revision._id} className="flex flex-col gap-1 rounded-2xl bg-shop-cream/60 p-4">
                                        <span className="text-xs text-shop-ink-faded">
                                            {formatDate(revision.createdAt, {format: DATE_FORMATS.dateTime})} · {resolveLanguageKey(`revisionStatus.${revision.status}`)}
                                        </span>
                                        <p className="whitespace-pre-line text-[15px]">{revision.reason}</p>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {milestones.length > 0 && (
                        <section className="flex flex-col gap-3" aria-labelledby="shop-service-milestones">
                            <h2 id="shop-service-milestones" className="font-semibold">{resolveLanguageKey("milestonesTitle")}</h2>
                            <ul className="divide-y divide-shop-border border-y border-shop-border">
                                {milestones.map(milestone => (
                                    <li key={milestone._id} className="flex flex-wrap items-center gap-3 py-3">
                                        <span className="flex-1 font-medium">{milestone.name}</span>
                                        <span className="tabular-nums">{formatMoney(milestone.amount, milestone.currency)}</span>
                                        <ShopOrderStatus kind="milestoneStatus" value={milestone.status} />
                                        {milestone.status === "pending" && status === "in_progress" && (
                                            <button
                                                type="button"
                                                disabled={busy}
                                                onClick={() => run(() => apiClient.post("/api/eCommerceMarketplace/order/releaseMilestone", {milestone: milestone._id}), "milestoneReleased")}
                                                className={cn(SHOP_BUTTON_SECONDARY_CLASS, "h-9 px-4")}
                                            >
                                                {resolveLanguageKey("releaseMilestone")}
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {bookings.length > 0 && (
                        <section className="flex flex-col gap-3" aria-labelledby="shop-service-bookings">
                            <h2 id="shop-service-bookings" className="font-semibold">{resolveLanguageKey("bookingsTitle")}</h2>
                            <ul className="flex flex-col gap-2">
                                {bookings.map(booking => (
                                    <li key={booking._id} className="flex items-center gap-3 rounded-2xl border border-shop-border p-4 text-sm">
                                        <CalendarDays className="h-5 w-5 shrink-0 text-shop-accent" aria-hidden />
                                        <span>
                                            {formatDate(booking.startAt, {format: DATE_FORMATS.dateTime, timeZone: booking.timezone})}
                                            {" – "}
                                            {formatDate(booking.endAt, {format: DATE_FORMATS.time, timeZone: booking.timezone})}
                                        </span>
                                        <span className="text-shop-ink-faded">{booking.timezone}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>

                <aside className="flex flex-col gap-6 rounded-2xl bg-shop-cream p-6 lg:sticky lg:top-28">
                    {order.provider && (
                        <section className="flex items-center gap-3">
                            <ShopProviderAvatar name={providerName} />
                            <div className="flex min-w-0 flex-col">
                                <span className="text-xs text-shop-ink-faded">{resolveLanguageKey("provider")}</span>
                                <Link to={`/provider?id=${encodeURIComponent(order.provider._id)}`} className="truncate font-semibold hover:underline underline-offset-4">
                                    {providerName}
                                </Link>
                            </div>
                        </section>
                    )}
                    <dl className="flex flex-col gap-2.5 border-t border-shop-border pt-5 text-[15px]">
                        {order.deliveryDueDate && (
                            <div className="flex justify-between gap-4">
                                <dt className="text-shop-ink-muted">{resolveLanguageKey("dueDate")}</dt>
                                <dd>{formatDate(order.deliveryDueDate, {format: DATE_FORMATS.date})}</dd>
                            </div>
                        )}
                        <div className="flex items-baseline justify-between border-t border-shop-border pt-3">
                            <dt className="font-semibold">{resolveLanguageKey("total")}</dt>
                            <dd className="font-shop-display text-2xl font-semibold tabular-nums">{formatMoney(order.amount, order.currency)}</dd>
                        </div>
                    </dl>
                    {order.listing && (
                        <Link to={`/service?id=${encodeURIComponent(order.listing._id)}`} className={cn(SHOP_LINK_CLASS, "text-sm")}>
                            {resolveLanguageKey("viewService")}
                        </Link>
                    )}
                    {(canCancel || canDispute || canReview) && panel === null && (
                        <div className="flex flex-col gap-2 border-t border-shop-border pt-5">
                            {canReview && (
                                <button type="button" onClick={() => openPanel("review")} className={SHOP_BUTTON_CLASS}>
                                    {resolveLanguageKey("leaveReview")}
                                </button>
                            )}
                            {canDispute && (
                                <button type="button" onClick={() => openPanel("dispute")} className={cn(SHOP_BUTTON_SECONDARY_CLASS, "bg-transparent")}>
                                    {resolveLanguageKey("reportProblem")}
                                </button>
                            )}
                            {canCancel && (
                                <button type="button" onClick={() => openPanel("cancel")} className="h-11 text-sm font-semibold text-shop-danger hover:underline underline-offset-4">
                                    {resolveLanguageKey("cancelOrder")}
                                </button>
                            )}
                        </div>
                    )}
                    {order.reviewed && <p className="text-sm text-shop-ink-muted">{resolveLanguageKey("reviewedNote")}</p>}
                </aside>
            </div>
        </div>
    );
}

export default compose(
    withLanguage(LANGUAGE_PATH),
    withDebug(true, true),
)(ServiceOrderDetailPage);
