import {useEffect, useState} from "react";
import {Link, useParams} from "react-router-dom";
import {compose} from "redux";
import {toast} from "sonner";
import {IconArrowLeft, IconChevronRight, IconLink} from "@tabler/icons-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import {resolvePublicMediaUrl} from "@coreModule/clients/portal/shared/portalMedia.ts";
import ShopBlogCard, {blogMetaLine} from "@eCommerceModule/clients/client/public/shared/shopBlogCard.tsx";
import PortalSellerCard from "@coreModule/clients/portal/shared/portalSellerCard.tsx";
import type {
    PublicBlogFormResponseType,
    PublicBlogPostItem,
} from "armonia/src/modules/core/api/auxiliary/public/blog/blog.form.response.type.ts";
import type {PublicBlogSingleFormResponseType} from "armonia/src/modules/core/api/auxiliary/public/blog/blogSingle.form.response.type.ts";
import {useSectionBase} from "@coreModule/clients/portal/shared/sectionBase.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {GalleryDialog, type GalleryMediaItem} from "@coreModule/components/viewEngine/widgets/gallery/galleryDialog.tsx";

const LANGUAGE_PATH = "src/modules/eCommerce/clients/client/public/blog/article.tsx";

const MORE_STORIES = 3;
const POST_REQUEST: HttpRequest = {method: "POST", url: "/api/auxiliary/public/blog/single"};
const RELATED_REQUEST: HttpRequest = {method: "POST", url: "/api/auxiliary/public/blog"};

/** Post content is plain text: blank lines separate paragraphs, single newlines stay line breaks. */
function paragraphs(content: string): string[] {
    return content.split(/\n\s*\n/).map(block => block.trim()).filter(Boolean);
}

function BlogArticlePage({resolveLanguageKey}: WithLanguageType) {
    const base = useSectionBase();
    const {slug = ""} = useParams();
    const [postCount, setPostCount] = useState(0);
    useEffect(() => {
        setPostCount((count) => count + 1);
    }, [slug]);
    const postRequest = useHttpRequest<PublicBlogSingleFormResponseType>(POST_REQUEST, {slug}, postCount, true, {
        success: () => setRelatedCount((count) => count + 1),
    });
    const post: PublicBlogPostItem | null = postRequest.loading || postRequest.error ? null : postRequest.data?.post ?? null;

    // More stories from the same category, once the post is known.
    const [relatedCount, setRelatedCount] = useState(0);
    const relatedRequest = useHttpRequest<PublicBlogFormResponseType>(
        RELATED_REQUEST,
        {categorySlug: post?.category?.slug, limit: MORE_STORIES + 1},
        relatedCount,
    );
    const more: PublicBlogPostItem[] = post && !relatedRequest.loading
        ? (relatedRequest.data?.posts ?? []).filter(item => item._id !== post._id).slice(0, MORE_STORIES)
        : [];
    const loading = postCount === 0 || postRequest.loading || relatedRequest.loading;
    /** The photo open in the gallery dialog, by its place among the post's photos. */
    const [viewing, setViewing] = useState<number | null>(null);

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
                <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
                <div className="h-12 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
                <div className="mt-6 aspect-[16/9] animate-pulse rounded-3xl bg-muted" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
                <h1 className="font-display text-3xl font-semibold">{resolveLanguageKey("notFound")}</h1>
                <p className="text-muted-foreground">{resolveLanguageKey("notFoundMessage")}</p>
                <Button asChild variant="link" className="h-auto p-0"><Link to={`${base}/blog`}>{resolveLanguageKey("backToBlog")}</Link></Button>
            </div>
        );
    }

    const cover = resolvePublicMediaUrl(post.mainImage);
    const gallery = (post.imageGallery ?? []).map(resolvePublicMediaUrl).filter((url): url is string => Boolean(url));
    const photos: GalleryMediaItem[] = [
        ...(cover ? [{key: "cover", src: cover, video: false}] : []),
        ...gallery.map((src, index) => ({key: `gallery-${index}`, src, video: false})),
    ];
    const galleryStart = cover ? 1 : 0;
    const viewLabel = (index: number) => resolveLanguageKey("viewImage")
        .replace("{number}", String(index + 1))
        .replace("{total}", String(photos.length));

    return (
        <div className="flex flex-col gap-16 sm:gap-20">
            <article className="flex flex-col gap-10">
                <header className="mx-auto flex w-full max-w-3xl flex-col gap-5">
                    <nav aria-label={resolveLanguageKey("breadcrumb")} className="text-sm text-muted-foreground">
                        <ol className="flex flex-wrap items-center gap-1.5">
                            <li><Link to={`${base}/blog`} className="hover:text-foreground">{resolveLanguageKey("blog")}</Link></li>
                            {post.category && (
                                <>
                                    <li aria-hidden><IconChevronRight className="h-3.5 w-3.5" /></li>
                                    <li>
                                        <Link to={`${base}/blog?category=${encodeURIComponent(post.category.slug)}`} className="hover:text-foreground">
                                            {post.category.name}
                                        </Link>
                                    </li>
                                </>
                            )}
                        </ol>
                    </nav>
                    <h1 className="font-display text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">{post.title}</h1>
                    {post.excerpt && <p className="text-lg leading-relaxed text-muted-foreground sm:text-xl">{post.excerpt}</p>}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-y border-border py-4">
                        <div className="flex min-w-0 flex-col gap-2 text-sm">
                            {post.authorName && <span className="font-semibold">{post.authorName}</span>}
                            <span className="text-muted-foreground">{blogMetaLine(resolveLanguageKey, post)}</span>
                            {post.seller ? (
                                <PortalSellerCard sectionPath="shop" seller={post.seller} kind="blog" size="compact" />
                            ) : null}
                        </div>
                        <Button variant="outline" size="lg" type="button" onClick={copyLink} >
                            <IconLink className="h-4 w-4" aria-hidden />
                            {resolveLanguageKey("copyLink")}
                        </Button>
                    </div>
                </header>

                {cover && (
                    <Button variant="bare" type="button" onClick={() => setViewing(0)} aria-label={viewLabel(0)} className="block w-full cursor-zoom-in overflow-hidden rounded-3xl">
                        <img src={cover} alt="" className="block aspect-[16/9] w-full bg-muted object-cover" />
                    </Button>
                )}

                <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 text-[17px] leading-[1.75] text-foreground/90">
                    {paragraphs(post.content).map((block, index) => (
                        <p key={index} className="whitespace-pre-line">{block}</p>
                    ))}
                </div>

                {gallery.length > 0 && (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {gallery.map((url, index) => (
                            <Button
                                key={url}
                                variant="bare"
                                type="button"
                                onClick={() => setViewing(galleryStart + index)}
                                aria-label={viewLabel(galleryStart + index)}
                                className="block w-full cursor-zoom-in overflow-hidden rounded-2xl"
                            >
                                <img src={url} alt="" loading="lazy" className="block aspect-[4/3] w-full bg-muted object-cover" />
                            </Button>
                        ))}
                    </div>
                )}

                <div className="mx-auto w-full max-w-2xl">
                    <Link to={`${base}/blog`} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
                        <IconArrowLeft className="h-4 w-4" aria-hidden />
                        {resolveLanguageKey("backToBlog")}
                    </Link>
                </div>
            </article>

            {more.length > 0 && (
                <section className="flex flex-col gap-6 border-t border-border pt-12" aria-labelledby="shop-blog-more">
                    <h2 id="shop-blog-more" className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                        {resolveLanguageKey("moreStories")}
                    </h2>
                    <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                        {more.map(item => (
                            <ShopBlogCard key={item._id} post={item} />
                        ))}
                    </div>
                </section>
            )}
            <GalleryDialog
                items={photos}
                open={viewing !== null}
                onOpenChange={(open) => !open && setViewing(null)}
                startIndex={viewing ?? 0}
                title={post.title}
            />
        </div>
    );
}

export default compose(
    withLanguage(LANGUAGE_PATH),
    withDebug(true, true),
)(BlogArticlePage);
