import {useEffect, useMemo, useState} from "react";
import {Link, useNavigate, useSearchParams} from "react-router-dom";
import {compose} from "redux";
import {Check, ChevronDown, ChevronRight, Clock, ImageOff, MapPin, Star} from "lucide-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {handleError} from "@coreModule/helpers/general/errors.ts";
import {formatDate} from "@coreModule/helpers/general/dateTime.ts";
import {resolveShopMediaUrl} from "@eCommerceModule/clients/client/public/shared/shopMedia.ts";
import {useShopAuth} from "@eCommerceModule/clients/client/public/shared/shopAuthContext.tsx";
import ShopListingCard, {listingPriceLabel} from "@eCommerceModule/clients/client/public/shared/shopListingCard.tsx";
import ShopMarketplaceReviews from "@eCommerceModule/clients/client/public/shared/shopMarketplaceReviews.tsx";
import {
    listingLocationLabel,
    ShopAvailability,
    ShopProviderAvatar,
    useMarketplaceMoney,
} from "@eCommerceModule/clients/client/public/shared/shopMarketplace.tsx";
import {
    ShopInlineSignIn,
    SHOP_BUTTON_CLASS,
    SHOP_FIELD_INPUT_CLASS,
    SHOP_FIELD_LABEL_CLASS,
    SHOP_LINK_CLASS,
} from "@eCommerceModule/clients/client/public/shared/shopAuthChrome.tsx";
import {ORDER_NOTE_MAX} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/order/order.schema-def.ts";
import type {
    ShopListingDetail,
    ShopListingResponse,
    ShopMarketplaceCurrency,
} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/public/shopMarketplace/shopMarketplace.types.ts";

const LANGUAGE_PATH = "src/modules/eCommerce/clients/client/public/service/index.tsx";

const DAY_MS = 24 * 60 * 60 * 1000;

/** One selectable offer: the listing's own price ("" id) or one of its packages. */
type ServiceOption = {
    id: string;
    name: string;
    description?: string;
    price: number;
    currency?: ShopMarketplaceCurrency;
    deliveryDays: number;
};

/** The base offer first (when the listing has a price), then its packages in their set order. */
function serviceOptions(listing: ShopListingDetail, standardName: string): ServiceOption[] {
    const base: ServiceOption[] = listing.price != null
        ? [{id: "", name: standardName, price: listing.price, currency: listing.currency, deliveryDays: listing.deliveryDays ?? 1}]
        : [];
    return [
        ...base,
        ...listing.packages.map(pkg => ({
            id: pkg._id,
            name: pkg.name,
            description: pkg.description,
            price: pkg.price,
            currency: pkg.currency,
            deliveryDays: pkg.deliveryDays,
        })),
    ];
}

function ServicePage({resolveLanguageKey, languageCode}: WithLanguageType) {
    const [searchParams] = useSearchParams();
    const id = searchParams.get("id") ?? "";
    const navigate = useNavigate();
    const formatMoney = useMarketplaceMoney();
    const {isAuthenticated, isHydrating, user} = useShopAuth();

    const [listing, setListing] = useState<ShopListingDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState<string | undefined>(undefined);
    const [optionId, setOptionId] = useState("");
    const [addOnIds, setAddOnIds] = useState<string[]>([]);
    const [note, setNote] = useState("");
    const [ordering, setOrdering] = useState(false);

    useEffect(() => {
        if (!id) return;
        let cancelled = false;
        setLoading(true);
        setListing(null);
        (async () => {
            try {
                const res = await apiClient.post<ShopListingResponse>("/api/eCommerceMarketplace/shopListing", {id});
                if (cancelled) return;
                const next = res.data.data;
                setListing(next);
                setActiveImage(next.mainImage);
                // Without a base price the first package is the default offer
                setOptionId(next.price != null ? "" : next.packages[0]?._id ?? "");
                setAddOnIds([]);
                setNote("");
            } catch {
                if (!cancelled) setListing(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [id]);

    const options = useMemo(
        () => (listing ? serviceOptions(listing, resolveLanguageKey("standardPackage")) : []),
        [listing, resolveLanguageKey],
    );
    const gallery = useMemo(
        () => [...new Set([listing?.mainImage, ...(listing?.gallery ?? [])].filter((value): value is string => Boolean(value)))],
        [listing],
    );

    if (!id) return <ServiceMissing resolveLanguageKey={resolveLanguageKey} />;

    if (loading) {
        return (
            <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]" aria-busy="true" aria-label={resolveLanguageKey("loading")}>
                <div className="aspect-[4/3] animate-pulse rounded-3xl bg-shop-cream" />
                <div className="flex flex-col gap-4 pt-4">
                    <div className="h-4 w-1/4 animate-pulse rounded bg-shop-cream" />
                    <div className="h-10 w-3/4 animate-pulse rounded bg-shop-cream" />
                    <div className="mt-6 h-40 w-full animate-pulse rounded-2xl bg-shop-cream" />
                </div>
            </div>
        );
    }

    if (!listing) return <ServiceMissing resolveLanguageKey={resolveLanguageKey} />;

    const selected = options.find(option => option.id === optionId) ?? options[0];
    // The server refuses add-ons priced in another currency than the chosen offer
    const addOns = listing.addOns.filter(addOn => !addOn.currency || !selected?.currency || addOn.currency._id === selected.currency._id);
    const chosenAddOns = addOns.filter(addOn => addOnIds.includes(addOn._id));
    const total = (selected?.price ?? 0) + chosenAddOns.reduce((sum, addOn) => sum + addOn.price, 0);
    const totalDays = (selected?.deliveryDays ?? 0) + chosenAddOns.reduce((sum, addOn) => sum + (addOn.deliveryDays ?? 0), 0);
    const location = listingLocationLabel(listing.location);
    const isOwnListing = Boolean(user.id) && user.id === listing.provider?._id;
    const provider = listing.provider;

    function toggleAddOn(addOnId: string) {
        setAddOnIds(current => current.includes(addOnId) ? current.filter(item => item !== addOnId) : [...current, addOnId]);
    }

    async function placeOrder() {
        if (!listing || !selected) return;
        setOrdering(true);
        try {
            const res = await apiClient.post<{message: string; _id: string}>("/api/eCommerceMarketplace/order/createFromListing", {
                listing: listing._id,
                ...(selected.id && {package: selected.id}),
                addOns: chosenAddOns.map(addOn => addOn._id),
                note: note.trim() || undefined,
            });
            navigate(`/account/services/${res.data._id}?placed=1`);
        } catch (err) {
            handleError(err, {context: "Service", showToast: true, fallbackMessage: resolveLanguageKey("orderError")});
            setOrdering(false);
        }
    }

    return (
        <div className="flex flex-col gap-16 sm:gap-20">
            <div className="flex flex-col gap-6">
                <nav aria-label={resolveLanguageKey("breadcrumb")} className="text-sm text-shop-ink-muted">
                    <ol className="flex flex-wrap items-center gap-1.5">
                        <li><Link to="/" className="hover:text-shop-ink">{resolveLanguageKey("home")}</Link></li>
                        <li aria-hidden><ChevronRight className="h-3.5 w-3.5" /></li>
                        <li><Link to="/services" className="hover:text-shop-ink">{resolveLanguageKey("services")}</Link></li>
                        {listing.category && (
                            <>
                                <li aria-hidden><ChevronRight className="h-3.5 w-3.5" /></li>
                                <li><Link to={`/services?category=${encodeURIComponent(listing.category.slug)}`} className="hover:text-shop-ink">{listing.category.name}</Link></li>
                            </>
                        )}
                        <li aria-hidden><ChevronRight className="h-3.5 w-3.5" /></li>
                        <li aria-current="page" className="max-w-[16rem] truncate text-shop-ink">{listing.title}</li>
                    </ol>
                </nav>

                {/* Phones stack gallery, then the order box, then the details; desktop keeps the order box in a sticky column */}
                <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-x-14">
                    <div className="lg:col-start-1 lg:row-start-1">
                        <div className="flex flex-col gap-3">
                            <div className="aspect-[4/3] w-full overflow-hidden rounded-3xl bg-shop-cream">
                                {activeImage ? (
                                    <img src={resolveShopMediaUrl(activeImage)} alt={listing.title} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-shop-ink-faded">
                                        <ImageOff className="h-8 w-8" aria-hidden />
                                        <span className="text-sm">{resolveLanguageKey("noImage")}</span>
                                    </div>
                                )}
                            </div>
                            {gallery.length > 1 && (
                                <ul className="flex gap-2 overflow-x-auto">
                                    {gallery.map((image, index) => (
                                        <li key={image} className="shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => setActiveImage(image)}
                                                aria-label={resolveLanguageKey("imageOf").replace("{number}", String(index + 1)).replace("{total}", String(gallery.length))}
                                                aria-pressed={activeImage === image}
                                                className={cn(
                                                    "block h-16 w-24 overflow-hidden rounded-xl border-2 transition-colors",
                                                    activeImage === image ? "border-shop-ink" : "border-transparent hover:border-shop-border",
                                                )}
                                            >
                                                <img src={resolveShopMediaUrl(image)} alt="" className="h-full w-full object-cover" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className="order-last flex flex-col gap-10 lg:order-none lg:col-start-1 lg:row-start-2">
                        {listing.description && (
                            <section className="flex flex-col gap-3" aria-labelledby="shop-service-about">
                                <h2 id="shop-service-about" className="font-shop-display text-2xl font-semibold tracking-tight">{resolveLanguageKey("about")}</h2>
                                <p className="whitespace-pre-line text-[16px] leading-relaxed text-shop-ink-muted">{listing.description}</p>
                                {listing.tags?.length ? (
                                    <ul className="mt-2 flex flex-wrap gap-2">
                                        {listing.tags.map(tag => (
                                            <li key={tag} className="rounded-full bg-shop-cream px-3 py-1 text-xs font-medium text-shop-ink-muted">#{tag}</li>
                                        ))}
                                    </ul>
                                ) : null}
                            </section>
                        )}

                        {listing.requirements?.length ? (
                            <section className="flex flex-col gap-3" aria-labelledby="shop-service-needs">
                                <h2 id="shop-service-needs" className="font-shop-display text-2xl font-semibold tracking-tight">{resolveLanguageKey("requirementsTitle")}</h2>
                                <ul className="flex flex-col gap-2">
                                    {listing.requirements.map(requirement => (
                                        <li key={requirement} className="flex gap-2.5 text-[15px] text-shop-ink-muted">
                                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-shop-success" aria-hidden />
                                            {requirement}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        ) : null}

                        {listing.faqs?.length ? (
                            <section className="flex flex-col gap-3" aria-labelledby="shop-service-faq">
                                <h2 id="shop-service-faq" className="font-shop-display text-2xl font-semibold tracking-tight">{resolveLanguageKey("faqTitle")}</h2>
                                <div className="divide-y divide-shop-border border-y border-shop-border">
                                    {listing.faqs.map(faq => (
                                        <details key={faq.question} className="group py-4">
                                            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
                                                {faq.question}
                                                <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden />
                                            </summary>
                                            <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-shop-ink-muted">{faq.answer}</p>
                                        </details>
                                    ))}
                                </div>
                            </section>
                        ) : null}

                        {provider && (
                            <section className="flex flex-col gap-5 rounded-3xl bg-shop-cream p-6 sm:p-8" aria-labelledby="shop-service-provider">
                                <h2 id="shop-service-provider" className="text-xs font-semibold uppercase tracking-[0.18em] text-shop-ink-faded">{resolveLanguageKey("aboutProvider")}</h2>
                                <div className="flex items-center gap-4">
                                    <ShopProviderAvatar name={provider.name} size="lg" />
                                    <div className="flex min-w-0 flex-col gap-1">
                                        <Link to={`/provider?id=${encodeURIComponent(provider._id)}`} className="font-shop-display text-xl font-semibold hover:underline underline-offset-4">
                                            {provider.name}
                                        </Link>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-shop-ink-muted">
                                            {provider.reviewCount ? (
                                                <span className="inline-flex items-center gap-1">
                                                    <Star className="h-4 w-4 fill-shop-ink text-shop-ink" aria-hidden />
                                                    {resolveLanguageKey("ratingSummary")
                                                        .replace("{average}", provider.averageRating?.toFixed(1) ?? "")
                                                        .replace("{count}", String(provider.reviewCount))}
                                                </span>
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
                                {provider.bio && <p className="line-clamp-4 whitespace-pre-line text-[15px] leading-relaxed text-shop-ink-muted">{provider.bio}</p>}
                                {provider.skills?.length ? (
                                    <ul className="flex flex-wrap gap-2">
                                        {provider.skills.map(skill => (
                                            <li key={skill} className="rounded-full border border-shop-border bg-white px-3 py-1 text-xs font-medium">{skill}</li>
                                        ))}
                                    </ul>
                                ) : null}
                                {provider.availability?.length ? (
                                    <div className="flex flex-col gap-2">
                                        <h3 className="text-sm font-semibold">{resolveLanguageKey("availability")}</h3>
                                        <ShopAvailability slots={provider.availability} languageCode={languageCode} />
                                    </div>
                                ) : null}
                                <Link to={`/provider?id=${encodeURIComponent(provider._id)}`} className={cn(SHOP_LINK_CLASS, "self-start text-sm")}>
                                    {resolveLanguageKey("viewProvider")}
                                </Link>
                            </section>
                        )}
                    </div>

                    <div className="flex flex-col gap-7 lg:sticky lg:top-28 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
                        <div className="flex flex-col gap-3">
                            {listing.category && <p className="text-xs font-semibold uppercase tracking-[0.18em] text-shop-ink-faded">{listing.category.name}</p>}
                            <h1 className="font-shop-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{listing.title}</h1>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-shop-ink-muted">
                                {provider && (
                                    <Link to={`/provider?id=${encodeURIComponent(provider._id)}`} className="inline-flex items-center gap-2 font-medium text-shop-ink hover:underline underline-offset-4">
                                        <ShopProviderAvatar name={provider.name} size="sm" />
                                        {provider.name}
                                    </Link>
                                )}
                                {listing.reviewCount ? (
                                    <a href="#shop-reviews" className="inline-flex items-center gap-1.5 hover:text-shop-ink">
                                        <Star className="h-4 w-4 fill-shop-ink text-shop-ink" aria-hidden />
                                        {resolveLanguageKey("ratingSummary")
                                            .replace("{average}", listing.avgRating?.toFixed(1) ?? "")
                                            .replace("{count}", String(listing.reviewCount))}
                                    </a>
                                ) : null}
                            </div>
                            {location && (
                                <p className="flex items-center gap-2 rounded-xl bg-shop-cream px-3.5 py-2.5 text-sm">
                                    <MapPin className="h-4 w-4 shrink-0 text-shop-accent" aria-hidden />
                                    <span>{resolveLanguageKey("availableIn").replace("{place}", location)}</span>
                                </p>
                            )}
                        </div>

                        {options.length > 0 ? (
                            <fieldset className="flex flex-col gap-3">
                                <legend className="mb-3 text-sm font-semibold">{resolveLanguageKey("choosePackage")}</legend>
                                <div className="flex flex-col gap-2.5">
                                    {options.map(option => {
                                        const active = option.id === selected?.id;
                                        return (
                                            <button
                                                key={option.id || "base"}
                                                type="button"
                                                onClick={() => setOptionId(option.id)}
                                                aria-pressed={active}
                                                className={cn(
                                                    "flex flex-col gap-1.5 rounded-2xl border p-4 text-left transition-colors",
                                                    active ? "border-shop-ink bg-shop-ink text-white" : "border-shop-border hover:border-shop-ink",
                                                )}
                                            >
                                                <span className="flex items-baseline justify-between gap-3">
                                                    <span className="font-semibold">{option.name}</span>
                                                    <span className="font-shop-display text-lg font-semibold tabular-nums">
                                                        {listingPriceLabel(resolveLanguageKey, formatMoney(option.price, option.currency), {pricingType: listing.pricingType})}
                                                    </span>
                                                </span>
                                                {option.description && (
                                                    <span className={cn("text-sm leading-relaxed", active ? "text-white/80" : "text-shop-ink-muted")}>{option.description}</span>
                                                )}
                                                <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", active ? "text-white/80" : "text-shop-ink-muted")}>
                                                    <Clock className="h-3.5 w-3.5" aria-hidden />
                                                    {resolveLanguageKey(option.deliveryDays === 1 ? "deliveryDay" : "deliveryDays").replace("{days}", String(option.deliveryDays))}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </fieldset>
                        ) : (
                            <p className="text-shop-ink-muted">{resolveLanguageKey("priceOnRequest")}</p>
                        )}

                        {addOns.length > 0 && (
                            <fieldset className="flex flex-col gap-3">
                                <legend className="mb-3 text-sm font-semibold">{resolveLanguageKey("addOnsTitle")}</legend>
                                <div className="flex flex-col divide-y divide-shop-border rounded-2xl border border-shop-border">
                                    {addOns.map(addOn => {
                                        const checked = addOnIds.includes(addOn._id);
                                        return (
                                            <label key={addOn._id} className="flex cursor-pointer items-center gap-3 px-4 py-3.5 hover:bg-shop-cream/60">
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() => toggleAddOn(addOn._id)}
                                                    className="h-4 w-4 shrink-0 accent-shop-ink"
                                                />
                                                <span className="flex-1 text-[15px]">{addOn.name}</span>
                                                <span className="text-right text-sm tabular-nums text-shop-ink-muted">
                                                    +{formatMoney(addOn.price, addOn.currency)}
                                                    {addOn.deliveryDays ? ` · ${resolveLanguageKey("plusDays").replace("{days}", String(addOn.deliveryDays))}` : ""}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </fieldset>
                        )}

                        {selected && (
                            <div className="flex flex-col gap-4 rounded-2xl bg-shop-cream p-5">
                                <dl className="flex flex-col gap-2 text-[15px]">
                                    <div className="flex justify-between gap-4">
                                        <dt className="text-shop-ink-muted">{selected.name}</dt>
                                        <dd className="tabular-nums">{formatMoney(selected.price, selected.currency)}</dd>
                                    </div>
                                    {chosenAddOns.map(addOn => (
                                        <div key={addOn._id} className="flex justify-between gap-4">
                                            <dt className="text-shop-ink-muted">{addOn.name}</dt>
                                            <dd className="tabular-nums">+{formatMoney(addOn.price, addOn.currency)}</dd>
                                        </div>
                                    ))}
                                    <div className="flex items-baseline justify-between gap-4 border-t border-shop-border pt-3">
                                        <dt className="font-semibold">{resolveLanguageKey("total")}</dt>
                                        <dd className="font-shop-display text-2xl font-semibold tabular-nums">{formatMoney(total, selected.currency)}</dd>
                                    </div>
                                </dl>
                                <p className="flex items-center gap-2 text-sm text-shop-ink-muted">
                                    <Clock className="h-4 w-4" aria-hidden />
                                    {resolveLanguageKey("estimatedDelivery").replace(
                                        "{date}",
                                        formatDate(new Date(Date.now() + totalDays * DAY_MS), {format: {weekday: "short", day: "numeric", month: "long"}}),
                                    )}
                                </p>
                                <label className={SHOP_FIELD_LABEL_CLASS}>
                                    {resolveLanguageKey("noteLabel")}
                                    <textarea
                                        value={note}
                                        onChange={event => setNote(event.target.value)}
                                        rows={3}
                                        maxLength={ORDER_NOTE_MAX}
                                        placeholder={resolveLanguageKey("notePlaceholder")}
                                        className={cn(SHOP_FIELD_INPUT_CLASS, "h-auto py-2.5")}
                                    />
                                </label>
                                <button
                                    type="button"
                                    onClick={placeOrder}
                                    disabled={ordering || !isAuthenticated || isOwnListing}
                                    className={cn(SHOP_BUTTON_CLASS, "w-full")}
                                >
                                    {ordering ? resolveLanguageKey("ordering") : resolveLanguageKey("orderNow")}
                                </button>
                                {isOwnListing && <p className="text-xs text-shop-ink-muted">{resolveLanguageKey("ownListing")}</p>}
                                {!isHydrating && !isAuthenticated && <ShopInlineSignIn next={`/service?id=${encodeURIComponent(id)}`} messageKey="inlineOrderMessage" />}
                                <p className="text-xs leading-relaxed text-shop-ink-faded">{resolveLanguageKey("orderHint")}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ShopMarketplaceReviews listingId={listing._id} average={listing.avgRating} count={listing.reviewCount} />

            {listing.related.length > 0 && (
                <section className="flex flex-col gap-6" aria-labelledby="shop-related">
                    <h2 id="shop-related" className="font-shop-display text-2xl font-semibold tracking-tight sm:text-3xl">{resolveLanguageKey("related")}</h2>
                    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
                        {listing.related.slice(0, 4).map(item => (
                            <ShopListingCard key={item._id} listing={item} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

function ServiceMissing({resolveLanguageKey}: Pick<WithLanguageType, "resolveLanguageKey">) {
    return (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
            <h1 className="font-shop-display text-3xl font-semibold">{resolveLanguageKey("notFound")}</h1>
            <p className="text-shop-ink-muted">{resolveLanguageKey("notFoundMessage")}</p>
            <Link to="/services" className={SHOP_LINK_CLASS}>{resolveLanguageKey("backToServices")}</Link>
        </div>
    );
}

export default compose(
    withLanguage(LANGUAGE_PATH),
    withDebug(true, true),
)(ServicePage);
