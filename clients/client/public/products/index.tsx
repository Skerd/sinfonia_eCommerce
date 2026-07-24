import {useCallback, useEffect, useState} from "react";
import {useSearchParams} from "react-router-dom";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import ShopProductCard from "@eCommerceModule/clients/client/public/shared/shopProductCard.tsx";
import type {
    ShopProductsResponse,
    ShopTaxonomyResponse,
} from "armonia/src/modules/eCommerce/api/eCommerce/public/shopCatalog/shopCatalog.types.ts";

const PAGE_SIZE = 24;

const SORT_OPTIONS = [
    {value: "newest", label: "Newest"},
    {value: "featured", label: "Featured"},
    {value: "priceAsc", label: "Price: low to high"},
    {value: "priceDesc", label: "Price: high to low"},
];

function ProductsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [result, setResult] = useState<ShopProductsResponse | null>(null);
    const [taxonomy, setTaxonomy] = useState<ShopTaxonomyResponse["data"] | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");

    const search = searchParams.get("search") ?? "";
    const categorySlug = searchParams.get("category") ?? "";
    const sort = searchParams.get("sort") ?? "newest";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);

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
    }, [search, categorySlug, sort, page]);

    const totalPages = result ? Math.max(1, Math.ceil(result.total / PAGE_SIZE)) : 1;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="font-shop-display text-3xl font-semibold">Products</h1>
                    {result && <p className="mt-1 text-sm text-shop-ink-muted">{result.total} products</p>}
                </div>
                <form
                    className="flex flex-wrap items-center gap-2"
                    onSubmit={event => {
                        event.preventDefault();
                        updateParams({search: searchInput || undefined, page: undefined});
                    }}
                >
                    <input
                        value={searchInput}
                        onChange={event => setSearchInput(event.target.value)}
                        placeholder="Search products…"
                        className="h-9 rounded-md border border-shop-border px-3 text-sm outline-none focus:border-shop-accent"
                    />
                    <select
                        value={categorySlug}
                        onChange={event => updateParams({category: event.target.value || undefined, page: undefined})}
                        className="h-9 rounded-md border border-shop-border bg-white px-2 text-sm outline-none focus:border-shop-accent"
                    >
                        <option value="">All categories</option>
                        {taxonomy?.categories.map(category => (
                            <option key={category._id} value={category.slug}>{category.name}</option>
                        ))}
                    </select>
                    <select
                        value={sort}
                        onChange={event => updateParams({sort: event.target.value, page: undefined})}
                        className="h-9 rounded-md border border-shop-border bg-white px-2 text-sm outline-none focus:border-shop-accent"
                    >
                        {SORT_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                    <button
                        type="submit"
                        className="h-9 rounded-md bg-shop-ink px-4 text-sm font-medium text-white transition-opacity hover:opacity-90"
                    >
                        Search
                    </button>
                </form>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {Array.from({length: 8}, (_, i) => (
                        <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-shop-cream" />
                    ))}
                </div>
            ) : result && result.data.length > 0 ? (
                <>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {result.data.map(product => (
                            <ShopProductCard key={product._id} product={product} />
                        ))}
                    </div>
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-3 pt-4">
                            <button
                                disabled={page <= 1}
                                onClick={() => updateParams({page: String(page - 1)})}
                                className="rounded-md border border-shop-border px-3 py-1.5 text-sm disabled:opacity-40"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-shop-ink-muted">Page {page} of {totalPages}</span>
                            <button
                                disabled={page >= totalPages}
                                onClick={() => updateParams({page: String(page + 1)})}
                                className="rounded-md border border-shop-border px-3 py-1.5 text-sm disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="rounded-xl border border-dashed border-shop-border py-16 text-center text-shop-ink-muted">
                    No products found.
                </div>
            )}
        </div>
    );
}

export default ProductsPage;
