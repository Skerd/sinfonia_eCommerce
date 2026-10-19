import {useEffect, useState} from "react";
import {Link, useSearchParams} from "react-router-dom";
import {compose} from "redux";
import {CalendarClock, ChevronRight, Star} from "lucide-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {formatDate} from "@coreModule/helpers/general/dateTime.ts";
import {resolveShopMediaUrl} from "@eCommerceModule/clients/client/public/shared/shopMedia.ts";
import ShopListingCard from "@eCommerceModule/clients/client/public/shared/shopListingCard.tsx";
import ShopMarketplaceReviews from "@eCommerceModule/clients/client/public/shared/shopMarketplaceReviews.tsx";
import {ShopAvailability, ShopProviderAvatar} from "@eCommerceModule/clients/client/public/shared/shopMarketplace.tsx";
import {SHOP_LINK_CLASS} from "@eCommerceModule/clients/client/public/shared/shopAuthChrome.tsx";
import type {ShopProviderResponse} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/public/shopMarketplace/shopMarketplace.types.ts";

const LANGUAGE_PATH = "src/modules/eCommerce/clients/client/public/provider/index.tsx";

function ProviderPage({resolveLanguageKey, languageCode}: WithLanguageType) {
    const [searchParams] = useSearchParams();
    const id = searchParams.get("id") ?? "";
    const [data, setData] = useState<ShopProviderResponse["data"] | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        let cancelled = false;
        setLoading(true);
        (async () => {
            try {
                const res = await apiClient.post<ShopProviderResponse>("/api/eCommerceMarketplace/shopProvider", {id});
                if (!cancelled) setData(res.data.data);
            } catch {
                if (!cancelled) setData(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [id]);

    if (id && loading) {
        return (
            <div className="flex flex-col gap-8" aria-busy="true" aria-label={resolveLanguageKey("loading")}>
                <div className="h-56 animate-pulse rounded-3xl bg-shop-cream" />
                <div className="grid gap-6 sm:grid-cols-3">
                    {Array.from({length: 3}, (_, i) => <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-shop-cream" />)}
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
                <h1 className="font-shop-display text-3xl font-semibold">{resolveLanguageKey("notFound")}</h1>
                <p className="text-shop-ink-muted">{resolveLanguageKey("notFoundMessage")}</p>
                <Link to="/services" className={SHOP_LINK_CLASS}>{resolveLanguageKey("backToServices")}</Link>
            </div>
        );
    }

    const {provider, listings} = data;
    const portfolio = (provider.portfolio ?? []).map(resolveShopMediaUrl).filter((url): url is string => Boolean(url));

    return (
        <div className="flex flex-col gap-14 sm:gap-20">
            <div className="flex flex-col gap-6">
                <nav aria-label={resolveLanguageKey("breadcrumb")} className="text-sm text-shop-ink-muted">
                    <ol className="flex flex-wrap items-center gap-1.5">
                        <li><Link to="/services" className="hover:text-shop-ink">{resolveLanguageKey("services")}</Link></li>
                        <li aria-hidden><ChevronRight className="h-3.5 w-3.5" /></li>
                        <li aria-current="page" className="text-shop-ink">{provider.name}</li>
                    </ol>
                </nav>

                <section className="grid gap-8 rounded-3xl bg-shop-cream p-6 sm:p-10 lg:grid-cols-[1.4fr_1fr]">
                    <div className="flex flex-col gap-5">
                        <div className="flex items-center gap-5">
                            <ShopProviderAvatar name={provider.name} size="lg" />
                            <div className="flex min-w-0 flex-col gap-1.5">
                                <h1 className="font-shop-display text-3xl font-bold tracking-tight sm:text-4xl">{provider.name}</h1>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-shop-ink-muted">
                                    {provider.reviewCount ? (
                                        <a href="#shop-reviews" className="inline-flex items-center gap-1 hover:text-shop-ink">
                                            <Star className="h-4 w-4 fill-shop-ink text-shop-ink" aria-hidden />
                                            {resolveLanguageKey("ratingSummary")
                                                .replace("{average}", provider.averageRating?.toFixed(1) ?? "")
                                                .replace("{count}", String(provider.reviewCount))}
                                        </a>
                                    ) : null}
                                    {provider.completionRate != null && (
                                        <span>{resolveLanguageKey("completionRate").replace("{rate}", String(provider.completionRate))}</span>
                                    )}
                                    {provider.memberSince && (
                                        <span>{resolveLanguageKey("memberSince").replace("{date}", formatDate(provider.memberSince, {format: {year: "numeric", month: "long"}}))}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        {provider.bio && <p className="whitespace-pre-line text-[16px] leading-relaxed text-shop-ink-muted">{provider.bio}</p>}
                        {provider.skills?.length ? (
                            <ul className="flex flex-wrap gap-2" aria-label={resolveLanguageKey("skills")}>
                                {provider.skills.map(skill => (
                                    <li key={skill} className="rounded-full border border-shop-border bg-white px-3 py-1 text-xs font-medium">{skill}</li>
                                ))}
                            </ul>
                        ) : null}
                    </div>
                    {provider.availability?.length ? (
                        <div className="flex flex-col gap-3 rounded-2xl bg-white p-5">
                            <h2 className="inline-flex items-center gap-2 text-sm font-semibold">
                                <CalendarClock className="h-4 w-4" aria-hidden />
                                {resolveLanguageKey("availability")}
                            </h2>
                            <ShopAvailability slots={provider.availability} languageCode={languageCode} />
                        </div>
                    ) : null}
                </section>
            </div>

            <section className="flex flex-col gap-6" aria-labelledby="shop-provider-services">
                <h2 id="shop-provider-services" className="font-shop-display text-2xl font-semibold tracking-tight sm:text-3xl">
                    {resolveLanguageKey("servicesBy").replace("{name}", provider.name)}
                </h2>
                <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {listings.map(listing => (
                        <ShopListingCard key={listing._id} listing={listing} />
                    ))}
                </div>
            </section>

            {portfolio.length > 0 && (
                <section className="flex flex-col gap-6" aria-labelledby="shop-provider-portfolio">
                    <h2 id="shop-provider-portfolio" className="font-shop-display text-2xl font-semibold tracking-tight sm:text-3xl">{resolveLanguageKey("portfolio")}</h2>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {portfolio.map(url => (
                            <img key={url} src={url} alt="" loading="lazy" className="aspect-square w-full rounded-2xl bg-shop-cream object-cover" />
                        ))}
                    </div>
                </section>
            )}

            <ShopMarketplaceReviews providerId={provider._id} average={provider.averageRating} count={provider.reviewCount} />
        </div>
    );
}

export default compose(
    withLanguage(LANGUAGE_PATH),
    withDebug(true, true),
)(ProviderPage);
