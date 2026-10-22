import {useEffect, useState} from "react";
import {Link, useSearchParams} from "react-router-dom";
import {compose} from "redux";
import {ChevronLeft, ChevronRight, Plus} from "lucide-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {DATE_FORMATS, formatDate} from "@coreModule/helpers/general/dateTime.ts";
import {useShopConfig} from "@eCommerceModule/clients/client/public/shared/shopConfigContext.tsx";
import ShopOrderStatus from "@eCommerceModule/clients/client/public/shared/shopOrderStatus.tsx";
import {SHOP_BUTTON_CLASS} from "@eCommerceModule/clients/client/public/shared/shopAuthChrome.tsx";
import type {BuyerTaskRequest} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/taskRequest/taskRequest.dto.ts";

const LANGUAGE_PATH = "src/modules/eCommerce/clients/client/public/account/jobs/index.tsx";

const PAGE_SIZE = 10;

function JobsPage({resolveLanguageKey}: WithLanguageType) {
    const {formatMoney} = useShopConfig();
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Math.max(1, Number(searchParams.get("page")) || 1);

    const [jobs, setJobs] = useState<BuyerTaskRequest[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        (async () => {
            try {
                const res = await apiClient.post<{data: BuyerTaskRequest[]; total: number}>("/api/eCommerceMarketplace/taskRequest/my", {page, limit: PAGE_SIZE});
                if (cancelled) return;
                setJobs(res.data.data ?? []);
                setTotal(res.data.total ?? 0);
            } catch {
                if (!cancelled) setJobs([]);
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
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="flex flex-col gap-1">
                    <h1 className="font-shop-display text-3xl font-bold tracking-tight">{resolveLanguageKey("title")}</h1>
                    <p className="text-sm text-shop-ink-muted">{resolveLanguageKey("lead")}</p>
                </div>
                <Link to="/account/jobs/new" className={SHOP_BUTTON_CLASS}>
                    <Plus className="h-4 w-4" aria-hidden />
                    {resolveLanguageKey("postJob")}
                </Link>
            </div>

            {loading ? (
                <div className="flex flex-col gap-3" aria-busy="true" aria-label={resolveLanguageKey("loading")}>
                    {Array.from({length: 3}, (_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-shop-cream" />)}
                </div>
            ) : jobs.length === 0 ? (
                <div className="flex flex-col items-center gap-4 rounded-3xl bg-shop-cream px-6 py-16 text-center">
                    <p className="font-shop-display text-xl font-semibold">{resolveLanguageKey("emptyTitle")}</p>
                    <p className="max-w-md text-shop-ink-muted">{resolveLanguageKey("emptyMessage")}</p>
                    <Link to="/account/jobs/new" className={SHOP_BUTTON_CLASS}>{resolveLanguageKey("postJob")}</Link>
                </div>
            ) : (
                <ul className="flex flex-col gap-3">
                    {jobs.map(job => (
                        <li key={job._id}>
                            <Link
                                to={`/account/jobs/${job._id}`}
                                className="group flex items-center gap-4 rounded-2xl border border-shop-border p-4 transition-colors hover:border-shop-ink sm:p-5"
                            >
                                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                        <span className="truncate font-semibold">{job.title}</span>
                                        <ShopOrderStatus kind="jobStatus" value={job.status} />
                                    </div>
                                    <span className="text-sm text-shop-ink-muted">
                                        {[
                                            job.category?.name,
                                            `${formatMoney(job.budgetMin, job.currency)} – ${formatMoney(job.budgetMax, job.currency)}`,
                                            job.expiresAt && job.status === "open"
                                                ? resolveLanguageKey("expiresOn").replace("{date}", formatDate(job.expiresAt, {format: DATE_FORMATS.date}))
                                                : undefined,
                                        ].filter(Boolean).join(" · ")}
                                    </span>
                                </div>
                                <span className="shrink-0 rounded-full bg-shop-cream px-3 py-1 text-sm font-medium tabular-nums">
                                    {resolveLanguageKey(job.bidCount === 1 ? "bidCountOne" : "bidCount").replace("{count}", String(job.bidCount ?? 0))}
                                </span>
                                <ChevronRight className="h-4 w-4 shrink-0 text-shop-ink-faded transition-transform group-hover:translate-x-0.5" aria-hidden />
                            </Link>
                        </li>
                    ))}
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
)(JobsPage);
