import {useEffect, useState} from "react";
import {useSearchParams} from "react-router-dom";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import ShopBlogCard from "@eCommerceModule/clients/client/public/shared/shopBlogCard.tsx";
import {SHOP_BUTTON_SECONDARY_CLASS} from "@eCommerceModule/clients/client/public/shared/shopAuthChrome.tsx";
import type {
    PublicBlogCategoryItem,
    PublicBlogFormResponseType,
    PublicBlogPostItem,
} from "armonia/src/modules/core/api/auxiliary/public/blog/blog.form.response.type.ts";

const LANGUAGE_PATH = "src/modules/eCommerce/clients/client/public/blog/index.tsx";

const PAGE_SIZE = 12;

const CHIP_CLASS = "inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-colors";

function BlogPage({resolveLanguageKey}: WithLanguageType) {
    const [searchParams, setSearchParams] = useSearchParams();
    const categorySlug = searchParams.get("category") ?? "";

    const [posts, setPosts] = useState<PublicBlogPostItem[]>([]);
    const [categories, setCategories] = useState<PublicBlogCategoryItem[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setPage(1);
        (async () => {
            try {
                const res = await apiClient.post<PublicBlogFormResponseType>("/api/auxiliary/public/blog", {
                    categorySlug: categorySlug || undefined,
                    limit: PAGE_SIZE,
                });
                if (cancelled) return;
                setPosts(res.data.posts ?? []);
                setTotal(res.data.total ?? 0);
                setCategories(res.data.categories ?? []);
            } catch {
                if (!cancelled) setPosts([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [categorySlug]);

    async function loadMore() {
        const next = page + 1;
        setLoadingMore(true);
        try {
            const res = await apiClient.post<PublicBlogFormResponseType>("/api/auxiliary/public/blog", {
                categorySlug: categorySlug || undefined,
                limit: PAGE_SIZE,
                page: next,
            });
            setPosts(current => [...current, ...(res.data.posts ?? [])]);
            setPage(next);
        } catch {
            // The button stays for another try
        } finally {
            setLoadingMore(false);
        }
    }

    const selectCategory = (slug: string) => setSearchParams(slug ? {category: slug} : {});
    const activeCategory = categories.find(category => category.slug === categorySlug);
    // The newest story leads the unfiltered first page
    const [lead, ...rest] = posts;
    const showLead = !categorySlug && Boolean(lead);
    const gridPosts = showLead ? rest : posts;

    return (
        <div className="flex flex-col gap-10 sm:gap-14">
            <header className="flex flex-col gap-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-shop-ink-faded">{resolveLanguageKey("eyebrow")}</p>
                <h1 className="max-w-3xl font-shop-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
                    {activeCategory?.name ?? resolveLanguageKey("title")}
                </h1>
                <p className="max-w-2xl text-lg leading-relaxed text-shop-ink-muted">{resolveLanguageKey("lead")}</p>
            </header>

            {categories.length > 0 && (
                <nav aria-label={resolveLanguageKey("categoriesLabel")} className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                    <ul className="flex gap-2 sm:flex-wrap">
                        <li>
                            <button
                                type="button"
                                onClick={() => selectCategory("")}
                                aria-pressed={!categorySlug}
                                className={cn(CHIP_CLASS, !categorySlug ? "border-shop-ink bg-shop-ink text-white" : "border-shop-border hover:border-shop-ink")}
                            >
                                {resolveLanguageKey("allStories")}
                            </button>
                        </li>
                        {categories.map(category => (
                            <li key={category._id}>
                                <button
                                    type="button"
                                    onClick={() => selectCategory(category.slug)}
                                    aria-pressed={category.slug === categorySlug}
                                    className={cn(CHIP_CLASS, category.slug === categorySlug ? "border-shop-ink bg-shop-ink text-white" : "border-shop-border hover:border-shop-ink")}
                                >
                                    {category.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            )}

            {loading ? (
                <div className="flex flex-col gap-10" aria-busy="true" aria-label={resolveLanguageKey("loading")}>
                    <div className="aspect-[16/7] animate-pulse rounded-3xl bg-shop-cream" />
                    <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({length: 3}, (_, i) => (
                            <div key={i} className="flex flex-col gap-3">
                                <div className="aspect-[16/10] animate-pulse rounded-2xl bg-shop-cream" />
                                <div className="h-5 w-3/4 animate-pulse rounded bg-shop-cream" />
                                <div className="h-4 w-full animate-pulse rounded bg-shop-cream" />
                            </div>
                        ))}
                    </div>
                </div>
            ) : posts.length === 0 ? (
                <div className="flex flex-col items-center gap-4 rounded-3xl bg-shop-cream px-6 py-20 text-center">
                    <p className="font-shop-display text-2xl font-semibold">{resolveLanguageKey("emptyTitle")}</p>
                    <p className="max-w-md text-shop-ink-muted">{resolveLanguageKey(categorySlug ? "emptyCategory" : "emptyMessage")}</p>
                    {categorySlug && (
                        <button type="button" onClick={() => selectCategory("")} className={SHOP_BUTTON_SECONDARY_CLASS}>
                            {resolveLanguageKey("allStories")}
                        </button>
                    )}
                </div>
            ) : (
                <div className="flex flex-col gap-12 sm:gap-16">
                    {showLead && <ShopBlogCard post={lead} featured />}
                    {gridPosts.length > 0 && (
                        <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                            {gridPosts.map(post => (
                                <ShopBlogCard key={post._id} post={post} />
                            ))}
                        </div>
                    )}
                    {posts.length < total && (
                        <div className="flex flex-col items-center gap-2">
                            <button type="button" onClick={loadMore} disabled={loadingMore} className={SHOP_BUTTON_SECONDARY_CLASS}>
                                {resolveLanguageKey(loadingMore ? "loadingMore" : "loadMore")}
                            </button>
                            <p className="text-xs text-shop-ink-faded">
                                {resolveLanguageKey("shownOf").replace("{shown}", String(posts.length)).replace("{total}", String(total))}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default compose(
    withLanguage(LANGUAGE_PATH),
    withDebug(true, true),
)(BlogPage);
