import {useCallback, useEffect, useMemo, useRef, useState, type FormEvent} from "react";
import {Link, useSearchParams} from "react-router-dom";
import {compose} from "redux";
import {ChevronLeft, ChevronRight, MapPin, Search, SlidersHorizontal, X} from "lucide-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import ShopListingCard from "@eCommerceModule/clients/client/public/shared/shopListingCard.tsx";
import {withListings} from "@eCommerceModule/clients/client/public/shared/shopNavMenus.tsx";
import {
    SHOP_BUTTON_CLASS,
    SHOP_BUTTON_SECONDARY_CLASS,
    SHOP_FIELD_INPUT_CLASS,
    SHOP_FIELD_LABEL_CLASS,
} from "@eCommerceModule/clients/client/public/shared/shopAuthChrome.tsx";
import type {
    ShopListingsResponse,
    ShopListingTaxonomyResponse,
    ShopPlace,
} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/public/shopMarketplace/shopMarketplace.types.ts";
import {SHOP_LISTING_SORTS} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/public/shopMarketplace/shopMarketplace.form.validator.ts";
import {listingPricingTypes} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/listing/listing.schema-def.ts";

const LANGUAGE_PATH = "src/modules/eCommerce/clients/client/public/services/index.tsx";

const PAGE_SIZE = 24;

const CHIP_CLASS = "inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-colors";

/** URL params that narrow the results (page and sort excluded). */
const FILTER_PARAMS = ["search", "category", "country", "state", "city", "type", "minPrice", "maxPrice", "rating"] as const;

/** Page numbers to show around the current page, with `null` for a gap. */
function pageWindow(page: number, totalPages: number): (number | null)[] {
    const pages = new Set([1, totalPages, page - 1, page, page + 1].filter(p => p >= 1 && p <= totalPages));
    const sorted = [...pages].sort((a, b) => a - b);
    return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? [null, p] : [p]));
}

function uniquePlaces(places: (ShopPlace | undefined)[]): ShopPlace[] {
    const map = new Map<string, ShopPlace>();
    for (const place of places) if (place) map.set(place._id, place);
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function FilterChip({label, onRemove, removeLabel}: {label: string; onRemove: () => void; removeLabel: string}) {
    return (
        <button type="button" onClick={onRemove} className="inline-flex items-center gap-1 rounded-full bg-shop-cream px-3 py-1.5 font-medium hover:bg-shop-sand" aria-label={removeLabel}>
            {label} <X className="h-3.5 w-3.5" aria-hidden />
        </button>
    );
}

function ServicesPage({resolveLanguageKey}: WithLanguageType) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [result, setResult] = useState<ShopListingsResponse | null>(null);
    const [taxonomy, setTaxonomy] = useState<ShopListingTaxonomyResponse["data"] | null>(null);
    const [loading, setLoading] = useState(true);
    const resultsRef = useRef<HTMLDivElement>(null);

    const search = searchParams.get("search") ?? "";
    const categorySlug = searchParams.get("category") ?? "";
    const countryId = searchParams.get("country") ?? "";
    const stateId = searchParams.get("state") ?? "";
    const cityId = searchParams.get("city") ?? "";
    const pricingType = searchParams.get("type") ?? "";
    const minPrice = searchParams.get("minPrice") ?? "";
    const maxPrice = searchParams.get("maxPrice") ?? "";
    const minRating = searchParams.get("rating") ?? "";
    const sort = searchParams.get("sort") ?? "recommended";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const queryKey = searchParams.toString();

    const [searchInput, setSearchInput] = useState(search);
    const [priceInput, setPriceInput] = useState({min: minPrice, max: maxPrice});
    const [filtersOpen, setFiltersOpen] = useState(Boolean(pricingType || minPrice || maxPrice || minRating));

    useEffect(() => {
        setSearchInput(search);
    }, [search]);
    useEffect(() => {
        setPriceInput({min: minPrice, max: maxPrice});
    }, [minPrice, maxPrice]);

    const updateParams = useCallback(
        (updates: Record<string, string | undefined>) => {
            setSearchParams(prev => {
                const next = new URLSearchParams(prev);
                for (const [key, value] of Object.entries(updates)) {
                    if (value) next.set(key, value);
                    else next.delete(key);
                }
                return next;
            });
        },
        [setSearchParams],
    );

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await apiClient.post<ShopListingTaxonomyResponse>("/api/eCommerceMarketplace/shopListingTaxonomy", {});
                if (!cancelled) setTaxonomy(res.data.data);
            } catch {
                if (!cancelled) setTaxonomy(null);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        const param = (key: string) => searchParams.get(key) || undefined;
        const requestedSort = searchParams.get("sort");
        const requestedType = searchParams.get("type");
        (async () => {
            try {
                const res = await apiClient.post<ShopListingsResponse>("/api/eCommerceMarketplace/shopListings", {
                    search: param("search"),
                    categorySlug: param("category"),
                    countryId: param("country"),
                    stateId: param("state"),
                    cityId: param("city"),
                    pricingType: listingPricingTypes.find(type => type === requestedType),
                    priceMin: param("minPrice") ? Number(param("minPrice")) : undefined,
                    priceMax: param("maxPrice") ? Number(param("maxPrice")) : undefined,
                    minRating: param("rating") ? Number(param("rating")) : undefined,
                    sort: SHOP_LISTING_SORTS.find(option => option === requestedSort) ?? "recommended",
                    page: Math.max(1, Number(searchParams.get("page")) || 1),
                    limit: PAGE_SIZE,
                });
                if (!cancelled) setResult(res.data);
            } catch {
                if (!cancelled) setResult({data: [], total: 0, page: 1, limit: PAGE_SIZE});
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [queryKey, searchParams]);

    // Only categories that lead to at least one service, as in the header menu
    const categories = useMemo(() => {
        const all = taxonomy?.categories ?? [];
        const keep = withListings(all);
        return all.filter(category => keep.has(category._id));
    }, [taxonomy]);
    const locations = taxonomy?.locations ?? [];
    const activeCategory = categories.find(category => category.slug === categorySlug);
    const topCategories = categories.filter(category => !category.parent);
    const activeTopId = activeCategory?.parent ?? activeCategory?._id;
    const subCategories = activeTopId ? categories.filter(category => category.parent === activeTopId) : [];

    // Each level only offers places inside the levels above it
    const countries = useMemo(() => uniquePlaces(locations.map(location => location.country)), [locations]);
    const states = useMemo(
        () => uniquePlaces(locations.filter(location => !countryId || location.country?._id === countryId).map(location => location.state)),
        [locations, countryId],
    );
    const cities = useMemo(
        () => uniquePlaces(locations
            .filter(location => (!countryId || location.country?._id === countryId) && (!stateId || location.state?._id === stateId))
            .map(location => location.city)),
        [locations, countryId, stateId],
    );
    const allPlaces = useMemo(
        () => new Map(uniquePlaces(locations.flatMap(location => [location.country, location.state, location.city])).map(place => [place._id, place.name])),
        [locations],
    );
    const placeId = cityId || stateId || countryId;
    const placeName = placeId ? allPlaces.get(placeId) : undefined;

    const totalPages = result ? Math.max(1, Math.ceil(result.total / PAGE_SIZE)) : 1;
    const hasFilters = FILTER_PARAMS.some(key => searchParams.get(key));

    function goToPage(next: number) {
        updateParams({page: next > 1 ? String(next) : undefined});
        resultsRef.current?.scrollIntoView({block: "start"});
    }

    function applyPrice(event: FormEvent) {
        event.preventDefault();
        updateParams({minPrice: priceInput.min || undefined, maxPrice: priceInput.max || undefined, page: undefined});
    }

    const clearAll = () => updateParams({...Object.fromEntries(FILTER_PARAMS.map(key => [key, undefined])), page: undefined});
    const removeLabel = (filter: string) => resolveLanguageKey("removeFilter").replace("{filter}", filter);

    const title = activeCategory?.name ?? resolveLanguageKey("title");

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex flex-col gap-2">
                    <h1 className="font-shop-display text-4xl font-bold tracking-tight sm:text-5xl">
                        {placeName ? resolveLanguageKey("titleIn").replace("{title}", title).replace("{place}", placeName) : title}
                    </h1>
                    <p className="text-shop-ink-muted" aria-live="polite">
                        {result && !loading ? resolveLanguageKey(result.total === 1 ? "countOne" : "count").replace("{count}", String(result.total)) : " "}
                    </p>
                </div>
                <Link to="/account/jobs/new" className={cn(SHOP_BUTTON_SECONDARY_CLASS, "self-start sm:self-auto")}>
                    {resolveLanguageKey("postJob")}
                </Link>
            </div>

            <div className="flex flex-col gap-4 border-y border-shop-border py-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <form
                        role="search"
                        className="relative flex-1"
                        onSubmit={event => {
                            event.preventDefault();
                            updateParams({search: searchInput.trim() || undefined, page: undefined});
                        }}
                    >
                        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-shop-ink-faded" aria-hidden />
                        <input
                            type="search"
                            value={searchInput}
                            onChange={event => setSearchInput(event.target.value)}
                            placeholder={resolveLanguageKey("searchPlaceholder")}
                            aria-label={resolveLanguageKey("searchLabel")}
                            className={cn(SHOP_FIELD_INPUT_CLASS, "pl-10 lg:max-w-sm")}
                        />
                    </form>
                    <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
                        {countries.length > 0 && (
                            <div className="relative col-span-2 flex items-center sm:col-span-1">
                                <MapPin className="pointer-events-none absolute left-3.5 h-4 w-4 text-shop-ink-faded" aria-hidden />
                                <select
                                    value={countryId}
                                    onChange={event => updateParams({country: event.target.value || undefined, state: undefined, city: undefined, page: undefined})}
                                    aria-label={resolveLanguageKey("countryLabel")}
                                    className={cn(SHOP_FIELD_INPUT_CLASS, "w-full pl-10 sm:w-auto")}
                                >
                                    <option value="">{resolveLanguageKey("anyCountry")}</option>
                                    {countries.map(place => <option key={place._id} value={place._id}>{place.name}</option>)}
                                </select>
                            </div>
                        )}
                        {states.length > 0 && (
                            <select
                                value={stateId}
                                onChange={event => updateParams({state: event.target.value || undefined, city: undefined, page: undefined})}
                                aria-label={resolveLanguageKey("stateLabel")}
                                className={cn(SHOP_FIELD_INPUT_CLASS, "w-full sm:w-auto")}
                            >
                                <option value="">{resolveLanguageKey("anyState")}</option>
                                {states.map(place => <option key={place._id} value={place._id}>{place.name}</option>)}
                            </select>
                        )}
                        {cities.length > 0 && (
                            <select
                                value={cityId}
                                onChange={event => updateParams({city: event.target.value || undefined, page: undefined})}
                                aria-label={resolveLanguageKey("cityLabel")}
                                className={cn(SHOP_FIELD_INPUT_CLASS, "w-full sm:w-auto")}
                            >
                                <option value="">{resolveLanguageKey("anyCity")}</option>
                                {cities.map(place => <option key={place._id} value={place._id}>{place.name}</option>)}
                            </select>
                        )}
                        <select
                            value={sort}
                            onChange={event => updateParams({sort: event.target.value === "recommended" ? undefined : event.target.value, page: undefined})}
                            aria-label={resolveLanguageKey("sortLabel")}
                            className={cn(SHOP_FIELD_INPUT_CLASS, "w-full sm:w-auto")}
                        >
                            {SHOP_LISTING_SORTS.map(option => (
                                <option key={option} value={option}>{resolveLanguageKey(`sort.${option}`)}</option>
                            ))}
                        </select>
                        <button
                            type="button"
                            aria-expanded={filtersOpen}
                            aria-controls="shop-service-filters"
                            onClick={() => setFiltersOpen(open => !open)}
                            className={cn(SHOP_BUTTON_SECONDARY_CLASS, "w-full shrink-0 px-4 sm:w-auto")}
                        >
                            <SlidersHorizontal className="h-4 w-4" aria-hidden />
                            {resolveLanguageKey("filters")}
                        </button>
                    </div>
                </div>

                {filtersOpen && (
                    <div id="shop-service-filters" className="grid gap-4 rounded-2xl bg-shop-cream/60 p-4 sm:grid-cols-[auto_auto_1fr] sm:items-end sm:p-5">
                        <label className={SHOP_FIELD_LABEL_CLASS}>
                            {resolveLanguageKey("pricingTypeLabel")}
                            <select
                                value={pricingType}
                                onChange={event => updateParams({type: event.target.value || undefined, page: undefined})}
                                className={cn(SHOP_FIELD_INPUT_CLASS, "sm:w-44")}
                            >
                                <option value="">{resolveLanguageKey("anyPricing")}</option>
                                {listingPricingTypes.map(type => (
                                    <option key={type} value={type}>{resolveLanguageKey(`pricingType.${type}`)}</option>
                                ))}
                            </select>
                        </label>
                        <label className={SHOP_FIELD_LABEL_CLASS}>
                            {resolveLanguageKey("ratingLabel")}
                            <select
                                value={minRating}
                                onChange={event => updateParams({rating: event.target.value || undefined, page: undefined})}
                                className={cn(SHOP_FIELD_INPUT_CLASS, "sm:w-44")}
                            >
                                <option value="">{resolveLanguageKey("anyRating")}</option>
                                {[4, 3, 2].map(value => (
                                    <option key={value} value={value}>{resolveLanguageKey("ratingAtLeast").replace("{rating}", String(value))}</option>
                                ))}
                            </select>
                        </label>
                        <form onSubmit={applyPrice} className="flex flex-col gap-1.5">
                            <span className="text-sm font-medium">{resolveLanguageKey("priceLabel")}</span>
                            <div className="flex flex-wrap items-center gap-2">
                                <input
                                    type="number"
                                    min={0}
                                    inputMode="decimal"
                                    value={priceInput.min}
                                    onChange={event => setPriceInput(current => ({...current, min: event.target.value}))}
                                    placeholder={resolveLanguageKey("priceMin")}
                                    aria-label={resolveLanguageKey("priceMin")}
                                    className={cn(SHOP_FIELD_INPUT_CLASS, "w-28")}
                                />
                                <span className="text-shop-ink-faded" aria-hidden>–</span>
                                <input
                                    type="number"
                                    min={0}
                                    inputMode="decimal"
                                    value={priceInput.max}
                                    onChange={event => setPriceInput(current => ({...current, max: event.target.value}))}
                                    placeholder={resolveLanguageKey("priceMax")}
                                    aria-label={resolveLanguageKey("priceMax")}
                                    className={cn(SHOP_FIELD_INPUT_CLASS, "w-28")}
                                />
                                <button type="submit" className={cn(SHOP_BUTTON_CLASS, "px-5")}>{resolveLanguageKey("apply")}</button>
                            </div>
                        </form>
                    </div>
                )}

                {topCategories.length > 0 && (
                    <nav aria-label={resolveLanguageKey("categoriesLabel")} className="-mx-4 flex flex-col gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                        <ul className="flex gap-2 sm:flex-wrap">
                            <li>
                                <button
                                    type="button"
                                    onClick={() => updateParams({category: undefined, page: undefined})}
                                    aria-pressed={!categorySlug}
                                    className={cn(CHIP_CLASS, !categorySlug ? "border-shop-ink bg-shop-ink text-white" : "border-shop-border hover:border-shop-ink")}
                                >
                                    {resolveLanguageKey("allCategories")}
                                </button>
                            </li>
                            {topCategories.map(category => (
                                <li key={category._id}>
                                    <button
                                        type="button"
                                        onClick={() => updateParams({category: category.slug, page: undefined})}
                                        aria-pressed={category._id === activeTopId}
                                        className={cn(CHIP_CLASS, category._id === activeTopId ? "border-shop-ink bg-shop-ink text-white" : "border-shop-border hover:border-shop-ink")}
                                    >
                                        {category.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                        {subCategories.length > 0 && (
                            <ul className="flex gap-2 sm:flex-wrap" aria-label={resolveLanguageKey("subcategoriesLabel")}>
                                {subCategories.map(category => (
                                    <li key={category._id}>
                                        <button
                                            type="button"
                                            onClick={() => updateParams({category: category.slug, page: undefined})}
                                            aria-pressed={category.slug === categorySlug}
                                            className={cn(CHIP_CLASS, "h-9 text-[13px]", category.slug === categorySlug ? "border-shop-accent bg-shop-accent/10 text-shop-accent" : "border-shop-border hover:border-shop-ink")}
                                        >
                                            {category.name}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </nav>
                )}

                {hasFilters && (
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="text-shop-ink-muted">{resolveLanguageKey("activeFilters")}</span>
                        {search && <FilterChip label={`“${search}”`} onRemove={() => updateParams({search: undefined, page: undefined})} removeLabel={removeLabel(search)} />}
                        {activeCategory && <FilterChip label={activeCategory.name} onRemove={() => updateParams({category: undefined, page: undefined})} removeLabel={removeLabel(activeCategory.name)} />}
                        {placeName && (
                            <FilterChip
                                label={placeName}
                                onRemove={() => updateParams({country: undefined, state: undefined, city: undefined, page: undefined})}
                                removeLabel={removeLabel(placeName)}
                            />
                        )}
                        {pricingType && (
                            <FilterChip
                                label={resolveLanguageKey(`pricingType.${pricingType}`)}
                                onRemove={() => updateParams({type: undefined, page: undefined})}
                                removeLabel={removeLabel(resolveLanguageKey(`pricingType.${pricingType}`))}
                            />
                        )}
                        {(minPrice || maxPrice) && (
                            <FilterChip
                                label={[minPrice, maxPrice].map(value => value || "…").join(" – ")}
                                onRemove={() => updateParams({minPrice: undefined, maxPrice: undefined, page: undefined})}
                                removeLabel={removeLabel(resolveLanguageKey("priceLabel"))}
                            />
                        )}
                        {minRating && (
                            <FilterChip
                                label={resolveLanguageKey("ratingAtLeast").replace("{rating}", minRating)}
                                onRemove={() => updateParams({rating: undefined, page: undefined})}
                                removeLabel={removeLabel(resolveLanguageKey("ratingLabel"))}
                            />
                        )}
                        <button type="button" onClick={clearAll} className="ml-1 font-medium underline underline-offset-4 hover:text-shop-accent">
                            {resolveLanguageKey("clearAll")}
                        </button>
                    </div>
                )}
            </div>

            <div ref={resultsRef} className="scroll-mt-24">
                {loading ? (
                    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-busy="true" aria-label={resolveLanguageKey("loading")}>
                        {Array.from({length: 8}, (_, i) => (
                            <div key={i} className="flex flex-col gap-3">
                                <div className="aspect-[4/3] animate-pulse rounded-2xl bg-shop-cream" />
                                <div className="h-4 w-1/2 animate-pulse rounded bg-shop-cream" />
                                <div className="h-4 w-3/4 animate-pulse rounded bg-shop-cream" />
                            </div>
                        ))}
                    </div>
                ) : result && result.data.length > 0 ? (
                    <div className="flex flex-col gap-12">
                        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {result.data.map(listing => (
                                <ShopListingCard key={listing._id} listing={listing} />
                            ))}
                        </div>
                        {totalPages > 1 && (
                            <nav className="flex items-center justify-center gap-1" aria-label={resolveLanguageKey("pagination")}>
                                <button
                                    type="button"
                                    disabled={page <= 1}
                                    onClick={() => goToPage(page - 1)}
                                    className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-shop-cream disabled:opacity-30"
                                    aria-label={resolveLanguageKey("previousPage")}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                {pageWindow(page, totalPages).map((p, i) => p == null ? (
                                    <span key={`gap-${i}`} className="w-6 text-center text-shop-ink-faded" aria-hidden>…</span>
                                ) : (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => goToPage(p)}
                                        aria-current={p === page ? "page" : undefined}
                                        aria-label={resolveLanguageKey("pageNumber").replace("{page}", String(p))}
                                        className={cn("flex h-10 min-w-10 items-center justify-center rounded-full px-2 text-sm font-medium tabular-nums", p === page ? "bg-shop-ink text-white" : "hover:bg-shop-cream")}
                                    >
                                        {p}
                                    </button>
                                ))}
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
                ) : (
                    <div className="flex flex-col items-center gap-4 rounded-3xl bg-shop-cream px-6 py-20 text-center">
                        <p className="font-shop-display text-2xl font-semibold">{resolveLanguageKey("emptyTitle")}</p>
                        <p className="max-w-md text-shop-ink-muted">{resolveLanguageKey(hasFilters ? "emptyFiltered" : "emptyCatalog")}</p>
                        <div className="flex flex-wrap justify-center gap-3">
                            {hasFilters && (
                                <button type="button" onClick={clearAll} className={SHOP_BUTTON_SECONDARY_CLASS}>
                                    {resolveLanguageKey("clearAll")}
                                </button>
                            )}
                            <Link to="/account/jobs/new" className={SHOP_BUTTON_CLASS}>{resolveLanguageKey("postJob")}</Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default compose(
    withLanguage(LANGUAGE_PATH),
    withDebug(true, true),
)(ServicesPage);
