import {useEffect, useState} from "react";
import {Link, useParams} from "react-router-dom";
import {compose} from "redux";
import {toast} from "sonner";
import {ArrowLeft, ChevronRight, Link2} from "lucide-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {resolveShopMediaUrl} from "@eCommerceModule/clients/client/public/shared/shopMedia.ts";
import ShopBlogCard, {blogMetaLine} from "@eCommerceModule/clients/client/public/shared/shopBlogCard.tsx";
import {SHOP_BUTTON_SECONDARY_CLASS, SHOP_LINK_CLASS} from "@eCommerceModule/clients/client/public/shared/shopAuthChrome.tsx";
import type {
    PublicBlogFormResponseType,
    PublicBlogPostItem,
} from "armonia/src/modules/core/api/auxiliary/public/blog/blog.form.response.type.ts";
import type {PublicBlogSingleFormResponseType} from "armonia/src/modules/core/api/auxiliary/public/blog/blogSingle.form.response.type.ts";

const LANGUAGE_PATH = "src/modules/eCommerce/clients/client/public/blog/article.tsx";

const MORE_STORIES = 3;

/** Post content is plain text: blank lines separate paragraphs, single newlines stay line breaks. */
function paragraphs(content: string): string[] {
    return content.split(/\n\s*\n/).map(block => block.trim()).filter(Boolean);
}

function BlogArticlePage({resolveLanguageKey}: WithLanguageType) {
    const {slug = ""} = useParams();
    const [post, setPost] = useState<PublicBlogPostItem | null>(null);
    const [more, setMore] = useState<PublicBlogPostItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setPost(null);
        setMore([]);
        (async () => {
            try {
                const res = await apiClient.post<PublicBlogSingleFormResponseType>("/api/auxiliary/public/blog/single", {slug});
                if (cancelled) return;
                const current = res.data.post;
                setPost(current);
                const related = await apiClient.post<PublicBlogFormResponseType>("/api/auxiliary/public/blog", {
                    categorySlug: current.category?.slug,
                    limit: MORE_STORIES + 1,
                });
                if (!cancelled) setMore((related.data.posts ?? []).filter(item => item._id !== current._id).slice(0, MORE_STORIES));
            } catch {
                if (!cancelled) setPost(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [slug]);

    async function copyLink() {
        try {
            await navigator.clipboard.writeText(window.location.href);
            toast.success(resolveLanguageKey("linkCopied"));
        } catch {
            toast.error(resolveLanguageKey("linkCopyFailed"));
        }
    }

    if (loading) {
        return (
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-5" aria-busy="true" aria-label={resolveLanguageKey("loading")}>
                <div className="h-4 w-1/4 animate-pulse rounded bg-shop-cream" />
                <div className="h-12 w-full animate-pulse rounded bg-shop-cream" />
                <div className="h-4 w-1/3 animate-pulse rounded bg-shop-cream" />
                <div className="mt-6 aspect-[16/9] animate-pulse rounded-3xl bg-shop-cream" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
                <h1 className="font-shop-display text-3xl font-semibold">{resolveLanguageKey("notFound")}</h1>
                <p className="text-shop-ink-muted">{resolveLanguageKey("notFoundMessage")}</p>
                <Link to="/blog" className={SHOP_LINK_CLASS}>{resolveLanguageKey("backToBlog")}</Link>
            </div>
        );
    }

    const cover = resolveShopMediaUrl(post.mainImage);
    const gallery = (post.imageGallery ?? []).map(resolveShopMediaUrl).filter((url): url is string => Boolean(url));

    return (
        <div className="flex flex-col gap-16 sm:gap-20">
            <article className="flex flex-col gap-10">
                <header className="mx-auto flex w-full max-w-3xl flex-col gap-5">
                    <nav aria-label={resolveLanguageKey("breadcrumb")} className="text-sm text-shop-ink-muted">
                        <ol className="flex flex-wrap items-center gap-1.5">
                            <li><Link to="/blog" className="hover:text-shop-ink">{resolveLanguageKey("blog")}</Link></li>
                            {post.category && (
                                <>
                                    <li aria-hidden><ChevronRight className="h-3.5 w-3.5" /></li>
                                    <li>
                                        <Link to={`/blog?category=${encodeURIComponent(post.category.slug)}`} className="hover:text-shop-ink">
                                            {post.category.name}
                                        </Link>
                                    </li>
                                </>
                            )}
                        </ol>
                    </nav>
                    <h1 className="font-shop-display text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">{post.title}</h1>
                    {post.excerpt && <p className="text-lg leading-relaxed text-shop-ink-muted sm:text-xl">{post.excerpt}</p>}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-y border-shop-border py-4">
                        <div className="flex flex-col text-sm">
                            {post.authorName && <span className="font-semibold">{post.authorName}</span>}
                            <span className="text-shop-ink-muted">{blogMetaLine(resolveLanguageKey, post)}</span>
                        </div>
                        <button type="button" onClick={copyLink} className={SHOP_BUTTON_SECONDARY_CLASS}>
                            <Link2 className="h-4 w-4" aria-hidden />
                            {resolveLanguageKey("copyLink")}
                        </button>
                    </div>
                </header>

                {cover && (
                    <img src={cover} alt="" className="aspect-[16/9] w-full rounded-3xl bg-shop-cream object-cover" />
                )}

                <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 text-[17px] leading-[1.75] text-shop-ink/90">
                    {paragraphs(post.content).map((block, index) => (
                        <p key={index} className="whitespace-pre-line">{block}</p>
                    ))}
                </div>

                {gallery.length > 0 && (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {gallery.map(url => (
                            <img key={url} src={url} alt="" loading="lazy" className="aspect-[4/3] w-full rounded-2xl bg-shop-cream object-cover" />
                        ))}
                    </div>
                )}

                <div className="mx-auto w-full max-w-2xl">
                    <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm font-medium text-shop-ink-muted hover:text-shop-ink">
                        <ArrowLeft className="h-4 w-4" aria-hidden />
                        {resolveLanguageKey("backToBlog")}
                    </Link>
                </div>
            </article>

            {more.length > 0 && (
                <section className="flex flex-col gap-6 border-t border-shop-border pt-12" aria-labelledby="shop-blog-more">
                    <h2 id="shop-blog-more" className="font-shop-display text-2xl font-semibold tracking-tight sm:text-3xl">
                        {resolveLanguageKey("moreStories")}
                    </h2>
                    <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                        {more.map(item => (
                            <ShopBlogCard key={item._id} post={item} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

export default compose(
    withLanguage(LANGUAGE_PATH),
    withDebug(true, true),
)(BlogArticlePage);
