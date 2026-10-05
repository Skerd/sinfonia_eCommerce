import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import type {CmsBlock, CmsBlockConfig, CmsBlockGridItem, CmsBlockSlide} from "armonia/src/modules/eCommerce/api/eCommerce/private/cmsBlock/cmsBlock.dto.ts";
import type {CollectionSimple} from "armonia/src/modules/eCommerce/dto/collection.dto.ts";
import type {CategorySimple} from "armonia/src/modules/eCommerce/dto/category.dto.ts";
import type {
    ShopProductCard as ShopProductCardType,
    ShopProductsResponse,
} from "armonia/src/modules/eCommerce/api/eCommerce/public/shopCatalog/shopCatalog.types.ts";
import type {ShopProductSort} from "armonia/src/modules/eCommerce/api/eCommerce/public/shopCatalog/shopProducts.form.validator.ts";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {cn} from "@coreModule/components/lib/utils.ts";
import ShopProductCard from "@eCommerceModule/clients/client/public/shared/shopProductCard.tsx";

type CmsBlockRendererProps = {
    block: CmsBlock;
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

function CmsCta({href, label}: {href?: string; label?: string}) {
    if (!href || !label) return null;
    const isInternal = href.startsWith("/");
    const className = "mt-4 inline-flex rounded-full bg-shop-accent px-5 py-2 text-sm font-semibold text-white";
    if (isInternal) {
        return (
            <Link to={href} className={className}>
                {label}
            </Link>
        );
    }
    return (
        <a href={href} className={className}>
            {label}
        </a>
    );
}

function CmsHero({title, config}: {title: string; config: CmsBlockConfig}) {
    return (
        <div className="overflow-hidden rounded-2xl bg-shop-cream">
            {config.imageUrl ? (
                <img src={config.imageUrl} alt={config.headline ?? title} className="h-56 w-full object-cover sm:h-72" />
            ) : null}
            <div className="flex flex-col items-start gap-y-1 px-8 py-10">
                <p className="font-shop-display text-3xl font-bold tracking-tight">{config.headline ?? title}</p>
                {config.subheadline ? <p className="max-w-xl text-shop-ink-muted">{config.subheadline}</p> : null}
                <CmsCta href={config.ctaHref} label={config.ctaLabel} />
            </div>
        </div>
    );
}

function CmsSlider({title, slides}: {title: string; slides: CmsBlockSlide[]}) {
    const [index, setIndex] = useState(0);
    const slide = slides[index];
    if (!slide) return <p className="font-medium">{title}</p>;

    return (
        <div className="flex flex-col gap-3">
            <CmsHero title={title} config={slide} />
            {slides.length > 1 ? (
                <div className="flex justify-center gap-2">
                    {slides.map((item, slideIndex) => (
                        <button
                            key={`${item.headline ?? "slide"}-${slideIndex}`}
                            type="button"
                            aria-label={`Slide ${slideIndex + 1}`}
                            className={cn(
                                "h-2 w-2 rounded-full",
                                slideIndex === index ? "bg-shop-accent" : "bg-shop-border",
                            )}
                            onClick={() => setIndex(slideIndex)}
                        />
                    ))}
                </div>
            ) : null}
        </div>
    );
}

function CmsGrid({items}: {items: CmsBlockGridItem[]}) {
    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {items.map((item, index) => {
                const body = (
                    <>
                        {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.title ?? ""} className="aspect-square w-full rounded-xl object-cover" />
                        ) : (
                            <div className="aspect-square rounded-xl bg-shop-cream" />
                        )}
                        {item.title ? <p className="mt-2 text-sm font-medium">{item.title}</p> : null}
                    </>
                );
                if (item.href?.startsWith("/")) {
                    return (
                        <Link key={`${item.title ?? "item"}-${index}`} to={item.href} className="block">
                            {body}
                        </Link>
                    );
                }
                if (item.href) {
                    return (
                        <a key={`${item.title ?? "item"}-${index}`} href={item.href} className="block">
                            {body}
                        </a>
                    );
                }
                return (
                    <div key={`${item.title ?? "item"}-${index}`}>{body}</div>
                );
            })}
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

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await apiClient.post<ShopProductsResponse>("/api/eCommerce/shopProducts", {
                    sort,
                    limit,
                    collectionId,
                    categoryIds: categoryIds && categoryIds.length > 0 ? categoryIds : undefined,
                });
                if (!cancelled) setProducts(res.data.data ?? []);
            } catch {
                if (!cancelled) setProducts([]);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [sort, limit, collectionId, categoryIds?.join(",")]);

    return (
        <div className="flex flex-col gap-y-4">
            <div>
                <h2 className="font-shop-display text-2xl font-semibold">{headline ?? title}</h2>
                {subheadline ? <p className="mt-1 text-sm text-shop-ink-muted">{subheadline}</p> : null}
            </div>
            {products.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {products.map((product) => (
                        <ShopProductCard key={product._id} product={product} />
                    ))}
                </div>
            ) : null}
        </div>
    );
}

function renderBlockContent(block: CmsBlock) {
    const config = block.config ?? {};

    switch (block.type) {
        case "hero_banner":
        case "promotional_section":
            return <CmsHero title={block.title} config={config} />;
        case "slider":
            return <CmsSlider title={block.title} slides={config.slides ?? []} />;
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
            if (config.linkHref?.startsWith("/")) {
                return (
                    <p className="text-center text-sm font-medium">
                        <Link to={config.linkHref} className="hover:underline">
                            {message}
                        </Link>
                    </p>
                );
            }
            if (config.linkHref) {
                return (
                    <p className="text-center text-sm font-medium">
                        <a href={config.linkHref} className="hover:underline">
                            {message}
                        </a>
                    </p>
                );
            }
            return <p className="text-center text-sm font-medium">{message}</p>;
        }
        case "custom_html":
            return config.html ? (
                <div dangerouslySetInnerHTML={{__html: config.html}} />
            ) : (
                <p className="text-sm text-shop-ink-muted">{block.title}</p>
            );
        case "video":
            return config.url ? (
                <div className="aspect-video w-full overflow-hidden rounded-md bg-shop-cream">
                    <iframe
                        title={block.title}
                        src={config.url}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            ) : (
                <p className="text-sm text-shop-ink-muted">{block.title}</p>
            );
        case "grid":
            return (
                <div className="flex flex-col gap-y-4">
                    <h2 className="font-shop-display text-2xl font-semibold">{block.title}</h2>
                    <CmsGrid items={config.items ?? []} />
                </div>
            );
        default:
            return (
                <div className="flex flex-col gap-y-1">
                    <p className="font-medium">{block.title}</p>
                    <p className="text-xs uppercase tracking-wide text-shop-ink-muted">{block.type}</p>
                </div>
            );
    }
}

export default function CmsBlockRenderer({block, className}: CmsBlockRendererProps) {
    return (
        <section
            data-cms-block-id={block._id}
            data-cms-block-type={block.type}
            className={cn("w-full", className)}
        >
            {renderBlockContent(block)}
        </section>
    );
}

type CmsBlocksListProps = {
    blocks: CmsBlock[];
    className?: string;
};

export function CmsBlocksList({blocks, className}: CmsBlocksListProps) {
    if (blocks.length === 0) return null;

    return (
        <div className={cn("flex flex-col gap-4", className)}>
            {blocks.map((block) => (
                <CmsBlockRenderer key={block._id} block={block} />
            ))}
        </div>
    );
}
