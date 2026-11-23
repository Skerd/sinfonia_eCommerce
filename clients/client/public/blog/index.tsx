import {useEffect, useState} from "react";
import {useSearchParams} from "react-router-dom";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import {usePortalTitle} from "@coreModule/clients/portal/shared/portalTitle.ts";
import ShopBlogCard from "@eCommerceModule/clients/client/public/shared/shopBlogCard.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import type {
    PublicBlogCategoryItem,
    PublicBlogFormResponseType,
    PublicBlogPostItem,
} from "armonia/src/modules/core/api/auxiliary/public/blog/blog.form.response.type.ts";

const LANGUAGE_PATH = "src/modules/eCommerce/clients/client/public/blog/index.tsx";

const PAGE_SIZE = 12;
const BLOG_REQUEST: HttpRequest = {method: "POST", url: "/api/auxiliary/public/blog", cache: true};

function BlogPage({resolveLanguageKey}: WithLanguageType) {
    const [searchParams, setSearchParams] = useSearchParams();
    const categorySlug = searchParams.get("category") ?? "";

    const [posts, setPosts] = useState<PublicBlogPostItem[]>([]);
    const [categories, setCategories] = useState<PublicBlogCategoryItem[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);

    // The first page (with the categories) for the chosen category.
    const [firstPageCount, setFirstPageCount] = useState(0);
    useEffect(() => {
        setPage(1);
        setFirstPageCount((count) => count + 1);
    }, [categorySlug]);
    const firstPage = useHttpRequest<PublicBlogFormResponseType>(BLOG_REQUEST, {categorySlug: categorySlug || undefined, limit: PAGE_SIZE}, firstPageCount, true, {
        success: (response) => {
            setPosts(response.posts ?? []);
            setTotal(response.total ?? 0);
            setCategories(response.categories ?? []);
        },
        error: () => setPosts([]),
    });
    const loading = firstPage.loading || firstPageCount === 0;

    // Further pages append; on failure the button stays for another try.
    const [moreCount, setMoreCount] = useState(0);
    const {loading: loadingMore} = useHttpRequest<PublicBlogFormResponseType>(
        BLOG_REQUEST,
        {categorySlug: categorySlug || undefined, limit: PAGE_SIZE, page: page + 1},
        moreCount,
        true,
        {
            success: (response) => {
                setPosts(current => [...current, ...(response.posts ?? [])]);
                setPage(current => current + 1);
            },
        },
    );
    const loadMore = () => setMoreCount((count) => count + 1);

    const selectCategory = (slug: string) => setSearchParams(slug ? {category: slug} : {});
    const activeCategory = categories.find(category => category.slug === categorySlug);
    usePortalTitle(activeCategory?.name ?? resolveLanguageKey("title"));
    // The newest story leads the unfiltered first page
    const [lead, ...rest] = posts;
    const showLead = !categorySlug && Boolean(lead);
    const gridPosts = showLead ? rest : posts;

    return (
        <div className="flex flex-col gap-10 sm:gap-14">
            <header className="flex flex-col gap-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{resolveLanguageKey("eyebrow")}</p>
                <h1 className="max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
                    {activeCategory?.name ?? resolveLanguageKey("title")}
                </h1>
                <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">{resolveLanguageKey("lead")}</p>
            </header>

            {categories.length > 0 && (
                <nav aria-label={resolveLanguageKey("categoriesLabel")} className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                    <ul className="flex gap-2 sm:flex-wrap">
                        <li>
                            <Button
                                type="button"
                                onClick={() => selectCategory("")}
                                aria-pressed={!categorySlug}
                                variant={!categorySlug ? "default" : "outline"}
                                size="lg"
                            >
                                {resolveLanguageKey("allStories")}
                            </Button>
                        </li>
                        {categories.map(category => (
                            <li key={category._id}>
                                <Button
                                    type="button"
                                    onClick={() => selectCategory(category.slug)}
                                    aria-pressed={category.slug === categorySlug}
                                    variant={category.slug === categorySlug ? "default" : "outline"}
                                    size="lg"
                                >
                                    {category.name}
                                </Button>
                            </li>
                        ))}
                    </ul>
                </nav>
            )}

            {loading ? (
                <div className="flex flex-col gap-10" aria-busy="true" aria-label={resolveLanguageKey("loading")}>
                    <div className="aspect-[16/7] animate-pulse rounded-3xl bg-muted" />
                    <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({length: 3}, (_, i) => (
                            <div key={i} className="flex flex-col gap-3">
                                <div className="aspect-[16/10] animate-pulse rounded-2xl bg-muted" />
                                <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
                                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                            </div>
                        ))}
                    </div>
                </div>
            ) : posts.length === 0 ? (
                <div className="flex flex-col items-center gap-4 rounded-3xl bg-muted px-6 py-20 text-center">
                    <p className="font-display text-2xl font-semibold">{resolveLanguageKey("emptyTitle")}</p>
                    <p className="max-w-md text-muted-foreground">{resolveLanguageKey(categorySlug ? "emptyCategory" : "emptyMessage")}</p>
                    {categorySlug && (
                        <Button variant="outline" size="lg" type="button" onClick={() => selectCategory("")} >
                            {resolveLanguageKey("allStories")}
                        </Button>
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
                            <Button variant="outline" size="lg" type="button" onClick={loadMore} disabled={loadingMore} >
                                {resolveLanguageKey(loadingMore ? "loadingMore" : "loadMore")}
                            </Button>
                            <p className="text-xs text-muted-foreground">
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
