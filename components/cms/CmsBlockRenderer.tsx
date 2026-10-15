import {useEffect, useState, type MouseEvent} from "react";
import {Link, useNavigate} from "react-router-dom";
import {ArrowRight, ChevronLeft, ChevronRight} from "lucide-react";
import type {CmsBlock, CmsBlockConfig, CmsBlockGridItem, CmsBlockSlide} from "armonia/src/modules/eCommerce/api/eCommerce/private/cmsBlock/cmsBlock.dto.ts";
import type {CollectionSimple} from "armonia/src/modules/eCommerce/dto/collection.dto.ts";
import type {CategorySimple} from "armonia/src/modules/eCommerce/dto/category.dto.ts";
import type {
    ShopProductCard as ShopProductCardType,
    ShopProductsResponse,
} from "armonia/src/modules/eCommerce/api/eCommerce/public/shopCatalog/shopCatalog.types.ts";
import type {ShopProductSort} from "armonia/src/modules/eCommerce/api/eCommerce/public/shopCatalog/shopProducts.form.validator.ts";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {useDynamicLanguage} from "@coreModule/helpers/hooks/useDynamicLanguage.ts";
import {cn} from "@coreModule/components/lib/utils.ts";
import ShopProductCard from "@eCommerceModule/clients/client/public/shared/shopProductCard.tsx";
import {SHOP_BUTTON_CLASS} from "@eCommerceModule/clients/client/public/shared/shopAuthChrome.tsx";

const LANGUAGE_PATH = "src/modules/eCommerce/components/cms/CmsBlockRenderer.tsx";

type HeadingLevel = "h1" | "h2";

type CmsBlockRendererProps = {
    block: CmsBlock;
    /** `h1` for the block that heads the page (the home page's first hero). */
    headingLevel?: HeadingLevel;
    className?: string;
};

function configLimit(config: CmsBlockConfig): number {
    if (typeof config.limit === "number" && config.limit >= 1) {
        return Math.min(config.limit, 24);
    }
    return 8;
}

function collectionRefId(value: CollectionSimple | undefined): string | undefined {
    return value?._id;
}

function categoryRefIds(values: CategorySimple[] | undefined): string[] {
    if (!values) return [];
    return values.map((category) => category._id).filter((id) => id.length > 0);
}

/** In-app link for site paths, a plain anchor for anything else. */
function CmsLink({href, className, children}: {href: string; className?: string; children: React.ReactNode}) {
    if (href.startsWith("/") && !href.startsWith("//")) {
        return <Link to={href} className={className}>{children}</Link>;
    }
    return <a href={href} className={className}>{children}</a>;
}

function CmsHero({title, config, headingLevel = "h2"}: {title: string; config: CmsBlockConfig; headingLevel?: HeadingLevel}) {
    const Heading = headingLevel;
    return (
        <div className="grid overflow-hidden rounded-3xl bg-shop-cream md:min-h-[440px] md:grid-cols-2">
            {config.imageUrl ? (
                <img
                    src={config.imageUrl}
                    alt=""
                    className="aspect-[4/3] h-full w-full object-cover md:order-2 md:aspect-auto"
                />
            ) : null}
            <div className={cn("flex flex-col items-start justify-center gap-4 px-6 py-10 sm:px-10 md:py-14 lg:px-14", !config.imageUrl && "md:col-span-2")}>
                <Heading className="max-w-xl font-shop-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                    {config.headline ?? title}
                </Heading>
                {config.subheadline ? <p className="max-w-md text-base leading-relaxed text-shop-ink-muted sm:text-lg">{config.subheadline}</p> : null}
                {config.ctaHref && config.ctaLabel ? (
                    <CmsLink href={config.ctaHref} className={cn(SHOP_BUTTON_CLASS, "mt-2")}>
                        {config.ctaLabel}
                        <ArrowRight className="h-4 w-4" aria-hidden />
                    </CmsLink>
                ) : null}
            </div>
        </div>
    );
}

function CmsSlider({title, slides, headingLevel}: {title: string; slides: CmsBlockSlide[]; headingLevel?: HeadingLevel}) {
    const {resolveLanguageKey} = useDynamicLanguage(LANGUAGE_PATH);
    const [index, setIndex] = useState(0);
    const slide = slides[index];
    if (!slide) return null;
    const go = (next: number) => setIndex((next + slides.length) % slides.length);

    return (
        <div className="relative" role="group" aria-roledescription="carousel" aria-label={title}>
            <div aria-live="polite">
                <CmsHero title={title} config={slide} headingLevel={headingLevel} />
            </div>
            {slides.length > 1 ? (
                <div className="mt-4 flex items-center justify-center gap-3">
                    <button
                        type="button"
                        onClick={() => go(index - 1)}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-shop-border bg-white hover:border-shop-ink"
                        aria-label={resolveLanguageKey("previousSlide")}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    {slides.map((item, slideIndex) => (
                        <button
                            key={`${item.headline ?? "slide"}-${slideIndex}`}
                            type="button"
                            aria-label={resolveLanguageKey("slide").replace("{number}", String(slideIndex + 1)).replace("{total}", String(slides.length))}
                            aria-current={slideIndex === index}
                            className={cn("h-2 rounded-full transition-all", slideIndex === index ? "w-6 bg-shop-ink" : "w-2 bg-shop-ink/25")}
                            onClick={() => setIndex(slideIndex)}
                        />
                    ))}
                    <button
                        type="button"
                        onClick={() => go(index + 1)}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-shop-border bg-white hover:border-shop-ink"
                        aria-label={resolveLanguageKey("nextSlide")}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            ) : null}
        </div>
    );
}

function CmsGrid({items}: {items: CmsBlockGridItem[]}) {
    return (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
            {items.map((item, index) => {
                const body = (
                    <>
                        <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-shop-cream">
                            {item.imageUrl ? (
                                <img src={item.imageUrl} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                            ) : null}
                        </div>
                        {item.title ? <p className="mt-3 text-[15px] font-medium underline-offset-4 group-hover:underline">{item.title}</p> : null}
                    </>
                );
                const key = `${item.title ?? "item"}-${index}`;
                return item.href ? (
                    <CmsLink key={key} href={item.href} className="group block">{body}</CmsLink>
                ) : (
                    <div key={key}>{body}</div>
                );
            })}
        </div>
    );
}

function CmsSectionHeading({title, subtitle}: {title: string; subtitle?: string}) {
    return (
        <div className="flex flex-col gap-1.5">
            <h2 className="font-shop-display text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
            {subtitle ? <p className="max-w-2xl text-shop-ink-muted">{subtitle}</p> : null}
        </div>
    );
}

function CmsProductStrip({
    title,
    headline,
    subheadline,
    sort,
    limit,
    collectionId,
    categoryIds,
}: {
    title: string;
    headline?: string;
    subheadline?: string;
    sort: ShopProductSort;
    limit: number;
    collectionId?: string;
    categoryIds?: string[];
}) {
    const [products, setProducts] = useState<ShopProductCardType[]>([]);
    const categoryKey = categoryIds?.join(",");

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await apiClient.post<ShopProductsResponse>("/api/eCommerce/shopProducts", {
                    sort,
                    limit,
                    collectionId,
                    categoryIds: categoryKey ? categoryKey.split(",") : undefined,
                });
                if (!cancelled) setProducts(res.data.data ?? []);
            } catch {
                if (!cancelled) setProducts([]);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [sort, limit, collectionId, categoryKey]);

    if (products.length === 0) return null;

    return (
        <div className="flex flex-col gap-6">
            <CmsSectionHeading title={headline ?? title} subtitle={subheadline} />
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
                {products.map((product) => (
                    <ShopProductCard key={product._id} product={product} />
                ))}
            </div>
        </div>
    );
}

/** Merchant HTML (sanitized by the API); its site links navigate in-app instead of reloading the shop. */
function CmsCustomHtml({html}: {html: string}) {
    const navigate = useNavigate();

    function handleClick(event: MouseEvent<HTMLDivElement>) {
        const anchor = (event.target as HTMLElement).closest("a");
        const href = anchor?.getAttribute("href");
        if (!anchor || !href || anchor.target || event.defaultPrevented || event.button !== 0
            || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (href.startsWith("/") && !href.startsWith("//")) {
            event.preventDefault();
            navigate(href);
        }
    }

    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- delegates to the anchors inside, which keep their own keyboard behaviour
    return <div className="text-[15px] leading-relaxed [&_a]:text-shop-accent [&_a]:underline" onClick={handleClick} dangerouslySetInnerHTML={{__html: html}} />;
}

function renderBlockContent(block: CmsBlock, headingLevel: HeadingLevel | undefined) {
    const config = block.config ?? {};

    switch (block.type) {
        case "hero_banner":
        case "promotional_section":
            return <CmsHero title={block.title} config={config} headingLevel={headingLevel} />;
        case "slider":
            return <CmsSlider title={block.title} slides={config.slides ?? []} headingLevel={headingLevel} />;
        case "featured_collection":
        case "flash_sale":
            return (
                <CmsProductStrip
                    title={block.title}
                    headline={config.headline}
                    subheadline={config.subheadline}
                    sort="featured"
                    limit={configLimit(config)}
                    collectionId={collectionRefId(config.collectionId)}
                />
            );
        case "trending":
            return (
                <CmsProductStrip
                    title={block.title}
                    headline={config.headline}
                    subheadline={config.subheadline}
                    sort="newest"
                    limit={configLimit(config)}
                />
            );
        case "best_sellers":
            return (
                <CmsProductStrip
                    title={block.title}
                    headline={config.headline}
                    subheadline={config.subheadline}
                    sort="featured"
                    limit={configLimit(config)}
                />
            );
        case "category_showcase":
            return (
                <CmsProductStrip
                    title={block.title}
                    headline={config.headline}
                    subheadline={config.subheadline}
                    sort="featured"
                    limit={configLimit(config)}
                    categoryIds={categoryRefIds(config.categoryIds)}
                />
            );
        case "announcement_bar": {
            const message = config.message ?? block.title;
            return (
                <p className="rounded-full bg-shop-ink px-5 py-3 text-center text-sm font-medium text-white">
                    {config.linkHref ? (
                        <CmsLink href={config.linkHref} className="underline-offset-4 hover:underline">{message}</CmsLink>
                    ) : message}
                </p>
            );
        }
        case "custom_html":
            return config.html ? <CmsCustomHtml html={config.html} /> : null;
        case "video":
            return config.url ? (
                <div className="aspect-video w-full overflow-hidden rounded-3xl bg-shop-cream">
                    <iframe
                        title={block.title}
                        src={config.url}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            ) : null;
        case "grid":
            return (
                <div className="flex flex-col gap-6">
                    <CmsSectionHeading title={block.title} />
                    <CmsGrid items={config.items ?? []} />
                </div>
            );
        default:
            // A block type this storefront doesn't render yet is skipped, never shown raw to buyers
            return null;
    }
}

export default function CmsBlockRenderer({block, headingLevel, className}: CmsBlockRendererProps) {
    return (
        <section
            data-cms-block-id={block._id}
            data-cms-block-type={block.type}
            className={cn("w-full", className)}
        >
            {renderBlockContent(block, headingLevel)}
        </section>
    );
}
