import {useCallback, useEffect, useRef, useState} from "react";
import {useSearchParams} from "react-router-dom";
import {compose} from "redux";
import {ChevronLeft, ChevronRight, Search, X} from "lucide-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import ShopProductCard from "@eCommerceModule/clients/client/public/shared/shopProductCard.tsx";
import {SHOP_BUTTON_SECONDARY_CLASS, SHOP_FIELD_INPUT_CLASS} from "@eCommerceModule/clients/client/public/shared/shopAuthChrome.tsx";
import type {
    ShopProductsResponse,
    ShopTaxonomyResponse,
} from "armonia/src/modules/eCommerce/api/eCommerce/public/shopCatalog/shopCatalog.types.ts";
import {SHOP_PRODUCT_SORTS} from "armonia/src/modules/eCommerce/api/eCommerce/public/shopCatalog/shopProducts.form.validator.ts";

const LANGUAGE_PATH = "src/modules/eCommerce/clients/client/public/products/index.tsx";

const PAGE_SIZE = 24;

const CHIP_CLASS = "inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-colors";

/** Page numbers to show around the current page, with `null` for a gap. */
function pageWindow(page: number, totalPages: number): (number | null)[] {
    const pages = new Set([1, totalPages, page - 1, page, page + 1].filter(p => p >= 1 && p <= totalPages));
    const sorted = [...pages].sort((a, b) => a - b);
    return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? [null, p] : [p]));
}

function ProductsPage({resolveLanguageKey}: WithLanguageType) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [result, setResult] = useState<ShopProductsResponse | null>(null);
    const [taxonomy, setTaxonomy] = useState<ShopTaxonomyResponse["data"] | null>(null);
    const [loading, setLoading] = useState(true);
    const resultsRef = useRef<HTMLDivElement>(null);

    const search = searchParams.get("search") ?? "";
    const categorySlug = searchParams.get("category") ?? "";
    const collectionSlug = searchParams.get("collection") ?? "";
    const sort = searchParams.get("sort") ?? "newest";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const [searchInput, setSearchInput] = useState(search);

    // Back/forward changes the URL search; keep the search box showing it.
    useEffect(() => {
        setSearchInput(search);
    }, [search]);

    const updateParams = useCallback(
        (updates: Record<string, string | undefined>) => {
            const next = new URLSearchParams(searchParams);
            for (const [key, value] of Object.entries(updates)) {
                if (value) next.set(key, value);
                else next.delete(key);
            }
            setSearchParams(next);
        },
        [searchParams, setSearchParams],
    );

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await apiClient.post<ShopTaxonomyResponse>("/api/eCommerce/shopTaxonomy", {});
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
        (async () => {
            try {
                const res = await apiClient.post<ShopProductsResponse>("/api/eCommerce/shopProducts", {
                    search: search || undefined,
                    categorySlug: categorySlug || undefined,
                    collectionSlug: collectionSlug || undefined,
                    sort,
                    page,
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
    }, [search, categorySlug, collectionSlug, sort, page]);

    const totalPages = result ? Math.max(1, Math.ceil(result.total / PAGE_SIZE)) : 1;
    const categories = taxonomy?.categories ?? [];
    const collections = taxonomy?.collections ?? [];
    const activeCategory = categories.find(category => category.slug === categorySlug);
    // Top-level chips first; the selected branch's subcategories in a second row
    const topCategories = categories.filter(category => !category.parent);
    const activeTopId = activeCategory?.parent ?? activeCategory?._id;
    const subCategories = activeTopId ? categories.filter(category => category.parent === activeTopId) : [];
    const activeCollection = collections.find(collection => collection.slug === collectionSlug);
    const hasFilters = Boolean(search || categorySlug || collectionSlug);

    function goToPage(next: number) {
        updateParams({page: next > 1 ? String(next) : undefined});
        resultsRef.current?.scrollIntoView({block: "start"});
    }

    const clearAll = () => updateParams({search: undefined, category: undefined, collection: undefined, page: undefined});

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
                <h1 className="font-shop-display text-4xl font-bold tracking-tight sm:text-5xl">
                    {activeCategory?.name ?? activeCollection?.title ?? resolveLanguageKey("title")}
                </h1>
                <p className="text-shop-ink-muted" aria-live="polite">
                    {result && !loading ? resolveLanguageKey(result.total === 1 ? "countOne" : "count").replace("{count}", String(result.total)) : " "}
                </p>
            </div>

            <div className="flex flex-col gap-4 border-y border-shop-border py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
                            className={cn(SHOP_FIELD_INPUT_CLASS, "pl-10 sm:max-w-sm")}
                        />
                    </form>
                    <div className="flex gap-3">
                        {collections.length > 0 && (
                            <select
                                value={collectionSlug}
                                onChange={event => updateParams({collection: event.target.value || undefined, page: undefined})}
                                aria-label={resolveLanguageKey("collectionLabel")}
                                className={cn(SHOP_FIELD_INPUT_CLASS, "w-auto min-w-0 flex-1 sm:flex-none")}
                            >
                                <option value="">{resolveLanguageKey("allCollections")}</option>
                                {collections.map(collection => (
                                    <option key={collection._id} value={collection.slug}>{collection.title}</option>
                                ))}
                            </select>
                        )}
                        <select
                            value={sort}
                            onChange={event => updateParams({sort: event.target.value, page: undefined})}
                            aria-label={resolveLanguageKey("sortLabel")}
                            className={cn(SHOP_FIELD_INPUT_CLASS, "w-auto min-w-0 flex-1 sm:flex-none")}
                        >
                            {SHOP_PRODUCT_SORTS.map(option => (
                                <option key={option} value={option}>{resolveLanguageKey(`sort.${option}`)}</option>
                            ))}
                        </select>
                    </div>
                </div>

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
                        {search && (
                            <button type="button" onClick={() => updateParams({search: undefined, page: undefined})} className="inline-flex items-center gap-1 rounded-full bg-shop-cream px-3 py-1.5 font-medium hover:bg-shop-sand" aria-label={resolveLanguageKey("removeFilter").replace("{filter}", search)}>
                                “{search}” <X className="h-3.5 w-3.5" aria-hidden />
                            </button>
                        )}
                        {activeCategory && (
                            <button type="button" onClick={() => updateParams({category: undefined, page: undefined})} className="inline-flex items-center gap-1 rounded-full bg-shop-cream px-3 py-1.5 font-medium hover:bg-shop-sand" aria-label={resolveLanguageKey("removeFilter").replace("{filter}", activeCategory.name)}>
                                {activeCategory.name} <X className="h-3.5 w-3.5" aria-hidden />
                            </button>
                        )}
                        {activeCollection && (
                            <button type="button" onClick={() => updateParams({collection: undefined, page: undefined})} className="inline-flex items-center gap-1 rounded-full bg-shop-cream px-3 py-1.5 font-medium hover:bg-shop-sand" aria-label={resolveLanguageKey("removeFilter").replace("{filter}", activeCollection.title)}>
                                {activeCollection.title} <X className="h-3.5 w-3.5" aria-hidden />
                            </button>
                        )}
                        <button type="button" onClick={clearAll} className="ml-1 font-medium underline underline-offset-4 hover:text-shop-accent">
                            {resolveLanguageKey("clearAll")}
                        </button>
                    </div>
                )}
            </div>

            <div ref={resultsRef} className="scroll-mt-24">
                {loading ? (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4" aria-busy="true" aria-label={resolveLanguageKey("loading")}>
                        {Array.from({length: 8}, (_, i) => (
                            <div key={i} className="flex flex-col gap-3">
                                <div className="aspect-[4/5] animate-pulse rounded-2xl bg-shop-cream" />
                                <div className="h-4 w-3/4 animate-pulse rounded bg-shop-cream" />
                                <div className="h-4 w-1/3 animate-pulse rounded bg-shop-cream" />
                            </div>
                        ))}
                    </div>
                ) : result && result.data.length > 0 ? (
                    <div className="flex flex-col gap-12">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
                            {result.data.map(product => (
                                <ShopProductCard key={product._id} product={product} />
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
                        {hasFilters && (
                            <button type="button" onClick={clearAll} className={SHOP_BUTTON_SECONDARY_CLASS}>
                                {resolveLanguageKey("clearAll")}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default compose(
    withLanguage(LANGUAGE_PATH),
    withDebug(true, true),
)(ProductsPage);
