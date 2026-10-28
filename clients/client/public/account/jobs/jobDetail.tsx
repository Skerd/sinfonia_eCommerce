import {useCallback, useEffect, useState} from "react";
import {Link, useNavigate, useParams, useSearchParams} from "react-router-dom";
import {compose} from "redux";
import {toast} from "sonner";
import {ArrowLeft, CircleCheck, Clock, MapPin} from "lucide-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {handleError} from "@coreModule/helpers/general/errors.ts";
import {DATE_FORMATS, formatDate} from "@coreModule/helpers/general/dateTime.ts";
import {resolveShopMediaUrl} from "@eCommerceModule/clients/client/public/shared/shopMedia.ts";
import {ShopProviderAvatar} from "@eCommerceModule/clients/client/public/shared/shopMarketplace.tsx";
import {useShopConfig} from "@eCommerceModule/clients/client/public/shared/shopConfigContext.tsx";
import ShopOrderStatus from "@eCommerceModule/clients/client/public/shared/shopOrderStatus.tsx";
import type {BuyerTaskRequest} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/taskRequest/taskRequest.dto.ts";
import {useSectionBase} from "@coreModule/clients/portal/shared/sectionBase.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";

const LANGUAGE_PATH = "src/modules/eCommerce/clients/client/public/account/jobs/jobDetail.tsx";

function JobDetailPage({resolveLanguageKey}: WithLanguageType) {
    const base = useSectionBase();
    const {jobId = ""} = useParams();
    const [searchParams] = useSearchParams();
    const justPosted = searchParams.get("posted") === "1";
    const navigate = useNavigate();
    const {formatMoney} = useShopConfig();

    const [job, setJob] = useState<BuyerTaskRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [confirmBidId, setConfirmBidId] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const load = useCallback(async () => {
        try {
            const res = await apiClient.post<{data: BuyerTaskRequest}>("/api/eCommerceMarketplace/taskRequest/mySingle", {_id: jobId});
            setJob(res.data.data);
        } catch {
            setJob(null);
        }
    }, [jobId]);

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

    async function run(request: () => Promise<unknown>, successKey: string) {
        setBusy(true);
        try {
            await request();
            toast.success(resolveLanguageKey(successKey));
            setConfirmBidId(null);
            await load();
        } catch (err) {
            handleError(err, {context: "Job", showToast: true, fallbackMessage: resolveLanguageKey("actionError")});
        } finally {
            setBusy(false);
        }
    }

    /** Accepting a bid creates the order; send the buyer to it. */
    async function acceptBid(bidId: string) {
        setBusy(true);
        try {
            const res = await apiClient.post<{message: string; _id: string}>("/api/eCommerceMarketplace/bid/accept", {_id: bidId});
            toast.success(resolveLanguageKey("bidAccepted"));
            navigate(`${base}/account/services/${res.data._id}`);
        } catch (err) {
            handleError(err, {context: "Job", showToast: true, fallbackMessage: resolveLanguageKey("actionError")});
            setBusy(false);
        }
    }

    if (loading) {
        return <div className="h-96 animate-pulse rounded-2xl bg-muted" aria-busy="true" aria-label={resolveLanguageKey("loading")} />;
    }

    if (!job) {
        return (
            <div className="flex flex-col items-start gap-4">
                <h1 className="font-display text-3xl font-bold tracking-tight">{resolveLanguageKey("notFound")}</h1>
                <Button asChild variant="link" className="h-auto p-0"><Link to={`${base}/account/jobs`}>{resolveLanguageKey("backToJobs")}</Link></Button>
            </div>
        );
    }

    const bids = job.bids ?? [];
    const isOpen = job.status === "open";
    const image = resolveShopMediaUrl(job.mainImage?._id);
    const place = [job.address?.street, job.address?.postalCode, job.address?.city?.name, job.address?.country?.name].filter(Boolean).join(", ");

    return (
        <div className="flex flex-col gap-8">
            <Link to={`${base}/account/jobs`} className="inline-flex items-center gap-1.5 self-start text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" aria-hidden />
                {resolveLanguageKey("backToJobs")}
            </Link>

            {justPosted && (
                <div className="flex gap-4 rounded-2xl bg-muted p-6" role="status">
                    <CircleCheck className="h-7 w-7 shrink-0 text-success" aria-hidden />
                    <div className="flex flex-col gap-1">
                        <p className="font-display text-xl font-semibold">{resolveLanguageKey("postedTitle")}</p>
                        <p className="text-muted-foreground">{resolveLanguageKey("postedMessage")}</p>
                    </div>
                </div>
            )}

            <div className="grid items-start gap-8 lg:grid-cols-[1fr_340px]">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="font-display text-3xl font-bold tracking-tight">{job.title}</h1>
                            <ShopOrderStatus kind="jobStatus" value={job.status} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {[job.name, job.category?.name, job.createdAt ? formatDate(job.createdAt, {format: DATE_FORMATS.date}) : undefined].filter(Boolean).join(" · ")}
                        </p>
                        {job.description && <p className="whitespace-pre-line text-[15px] leading-relaxed text-muted-foreground">{job.description}</p>}
                    </div>

                    <section className="flex flex-col gap-4" aria-labelledby="shop-job-bids">
                        <h2 id="shop-job-bids" className="font-display text-2xl font-semibold tracking-tight">
                            {resolveLanguageKey(bids.length === 1 ? "bidsTitleOne" : "bidsTitle").replace("{count}", String(bids.length))}
                        </h2>
                        {bids.length === 0 ? (
                            <p className="rounded-2xl bg-muted px-5 py-6 text-muted-foreground">{resolveLanguageKey(isOpen ? "noBidsYet" : "noBids")}</p>
                        ) : (
                            <ul className="flex flex-col gap-3">
                                {bids.map(bid => {
                                    const bidderName = [bid.bidder?.name, bid.bidder?.surname].filter(Boolean).join(" ");
                                    const pending = bid.status === "pending";
                                    return (
                                        <li key={bid._id} className={cn("flex flex-col gap-4 rounded-2xl border p-5", bid.status === "accepted" ? "border-success" : "border-border")}>
                                            <div className="flex flex-wrap items-center gap-3">
                                                <ShopProviderAvatar name={bidderName} />
                                                <div className="flex min-w-0 flex-1 flex-col">
                                                    <span className="font-semibold">{bidderName}</span>
                                                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Clock className="h-3.5 w-3.5" aria-hidden />
                                                        {resolveLanguageKey(bid.deliveryDays === 1 ? "deliveryDay" : "deliveryDays").replace("{days}", String(bid.deliveryDays))}
                                                    </span>
                                                </div>
                                                <span className="font-display text-xl font-semibold tabular-nums">{formatMoney(bid.amount, bid.currency)}</span>
                                                <ShopOrderStatus kind="bidStatus" value={bid.status} />
                                            </div>
                                            {bid.proposal && <p className="whitespace-pre-line text-[15px] leading-relaxed text-muted-foreground">{bid.proposal}</p>}
                                            {pending && isOpen && (
                                                confirmBidId === bid._id ? (
                                                    <div className="flex flex-col gap-3 rounded-xl bg-muted p-4">
                                                        <p className="text-sm">{resolveLanguageKey("confirmAccept").replace("{name}", bidderName).replace("{amount}", formatMoney(bid.amount, bid.currency))}</p>
                                                        <div className="flex flex-wrap gap-3">
                                                            <Button size="lg" type="button" disabled={busy} onClick={() => acceptBid(bid._id)} >
                                                                {resolveLanguageKey(busy ? "working" : "confirmAcceptButton")}
                                                            </Button>
                                                            <Button variant="outline" size="lg" type="button" disabled={busy} onClick={() => setConfirmBidId(null)} >
                                                                {resolveLanguageKey("back")}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-wrap gap-3">
                                                        <Button size="lg" type="button" disabled={busy} onClick={() => setConfirmBidId(bid._id)} >
                                                            {resolveLanguageKey("acceptBid")}
                                                        </Button>
                                                        <Button variant="outline" size="lg"
                                                            type="button"
                                                            disabled={busy}
                                                            onClick={() => run(() => apiClient.post("/api/eCommerceMarketplace/bid/reject", {_id: bid._id}), "bidRejected")}
                                                            
                                                        >
                                                            {resolveLanguageKey("rejectBid")}
                                                        </Button>
                                                    </div>
                                                )
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </section>
                </div>

                <aside className="flex flex-col gap-5 rounded-2xl bg-muted p-6 lg:sticky lg:top-28">
                    {image && <img src={image} alt="" className="aspect-[4/3] w-full rounded-xl object-cover" />}
                    <dl className="flex flex-col gap-2.5 text-[15px]">
                        <div className="flex justify-between gap-4">
                            <dt className="text-muted-foreground">{resolveLanguageKey("budget")}</dt>
                            <dd className="text-right tabular-nums">{formatMoney(job.budgetMin, job.currency)} – {formatMoney(job.budgetMax, job.currency)}</dd>
                        </div>
                        {job.expiresAt && (
                            <div className="flex justify-between gap-4">
                                <dt className="text-muted-foreground">{resolveLanguageKey("expires")}</dt>
                                <dd>{formatDate(job.expiresAt, {format: DATE_FORMATS.date})}</dd>
                            </div>
                        )}
                    </dl>
                    {place && (
                        <p className="flex items-start gap-2 border-t border-border pt-4 text-sm text-muted-foreground">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                            {place}
                        </p>
                    )}
                    {(job.status === "open" || job.status === "closed") && (
                        <Button variant="outline" size="lg"
                            type="button"
                            disabled={busy}
                            onClick={() => run(
                                () => apiClient.post(`/api/eCommerceMarketplace/taskRequest/${isOpen ? "close" : "reopen"}`, {_id: job._id}),
                                isOpen ? "jobClosed" : "jobReopened",
                            )}
                            className="bg-transparent"
                        >
                            {resolveLanguageKey(isOpen ? "closeJob" : "reopenJob")}
                        </Button>
                    )}
                </aside>
            </div>
        </div>
    );
}

export default compose(
    withLanguage(LANGUAGE_PATH),
    withDebug(true, true),
)(JobDetailPage);
