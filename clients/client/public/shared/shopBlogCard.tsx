import {Link} from "react-router-dom";
import {compose} from "redux";
import {ImageOff} from "lucide-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import {formatDate} from "@coreModule/helpers/general/dateTime.ts";
import {resolveShopMediaUrl} from "./shopMedia.ts";
import type {PublicBlogPostItem} from "armonia/src/modules/core/api/auxiliary/public/blog/blog.form.response.type.ts";

const LANGUAGE_PATH = "src/modules/eCommerce/clients/client/public/shared/shopBlogCard.tsx";

const WORDS_PER_MINUTE = 220;

export const BLOG_DATE_FORMAT: Intl.DateTimeFormatOptions = {year: "numeric", month: "long", day: "numeric"};

/** Whole minutes to read the post, at least one. */
export function blogReadingMinutes(content: string | undefined): number {
    const words = (content ?? "").trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

/** Date · reading time line shared by the cards and the article header. */
export function blogMetaLine(resolveLanguageKey: WithLanguageType["resolveLanguageKey"], post: PublicBlogPostItem): string {
    const minutes = resolveLanguageKey("readingTime").replace("{minutes}", String(blogReadingMinutes(post.content)));
    const date = formatDate(post.publishedAt, {format: BLOG_DATE_FORMAT});
    return date ? `${date} · ${minutes}` : minutes;
}

type ShopBlogCardProps = WithLanguageType & {
    post: PublicBlogPostItem;
    /** The page's lead story: a wide two-column card. */
    featured?: boolean;
};

function ShopBlogCardInner({resolveLanguageKey, post, featured = false}: ShopBlogCardProps) {
    const imageUrl = resolveShopMediaUrl(post.mainImage);
    const TitleTag = featured ? "h2" : "h3";

    return (
        <Link
            to={`/blog/${encodeURIComponent(post.slug)}`}
            className={cn(
                "group flex flex-col gap-4",
                featured && "overflow-hidden rounded-3xl bg-shop-cream lg:grid lg:grid-cols-[1.25fr_1fr] lg:items-stretch lg:gap-0",
            )}
        >
            <div className={cn(
                "relative w-full overflow-hidden bg-shop-cream",
                featured ? "aspect-[16/10] lg:aspect-auto lg:min-h-[420px]" : "aspect-[16/10] rounded-2xl",
            )}>
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt=""
                        loading={featured ? "eager" : "lazy"}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-shop-ink-faded">
                        <ImageOff className="h-6 w-6" aria-hidden />
                        <span className="text-xs">{resolveLanguageKey("noImage")}</span>
                    </div>
                )}
            </div>
            <div className={cn("flex flex-col gap-3", featured ? "justify-center p-6 sm:p-10" : "px-0.5")}>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    {post.category && (
                        <span className="rounded-full bg-shop-ink px-2.5 py-1 font-semibold text-white">{post.category.name}</span>
                    )}
                    <span className="text-shop-ink-faded">{blogMetaLine(resolveLanguageKey, post)}</span>
                </div>
                <TitleTag
                    className={cn(
                        "font-shop-display font-semibold tracking-tight underline-offset-4 group-hover:underline",
                        featured ? "text-3xl leading-tight sm:text-4xl" : "line-clamp-2 text-xl leading-snug",
                    )}
                >
                    {post.title}
                </TitleTag>
                {post.excerpt && (
                    <p className={cn("leading-relaxed text-shop-ink-muted", featured ? "text-base sm:text-lg" : "line-clamp-3 text-[15px]")}>
                        {post.excerpt}
                    </p>
                )}
                {featured && (
                    <span className="mt-2 text-sm font-semibold text-shop-accent">{resolveLanguageKey("readStory")} →</span>
                )}
                {post.authorName && !featured && (
                    <span className="text-xs text-shop-ink-faded">{resolveLanguageKey("byAuthor").replace("{author}", post.authorName)}</span>
                )}
            </div>
        </Link>
    );
}

export default compose(withLanguage(LANGUAGE_PATH), withDebug(true, true))(ShopBlogCardInner);
