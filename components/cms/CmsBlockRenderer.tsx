import type {CmsBlock} from "armonia/src/modules/eCommerce/api/eCommerce/private/cmsBlock/cmsBlock.dto.ts";
import {cn} from "@coreModule/components/lib/utils.ts";

type CmsBlockRendererProps = {
    block: CmsBlock;
    className?: string;
};

function renderBlockContent(block: CmsBlock) {
    const config = block.config ?? {};

    switch (block.type) {
        case "hero_banner":
        case "slider":
        case "featured_collection":
        case "trending":
        case "best_sellers":
        case "flash_sale":
        case "category_showcase":
        case "promotional_section":
            return (
                <div className="flex flex-col gap-y-1">
                    <p className="text-lg font-semibold">{block.title}</p>
                    {typeof config.headline === "string" && <p className="text-muted-foreground">{config.headline}</p>}
                    {typeof config.subheadline === "string" && <p className="text-sm">{config.subheadline}</p>}
                </div>
            );
        case "announcement_bar":
            return (
                <p className="text-center text-sm font-medium">
                    {typeof config.message === "string" ? config.message : block.title}
                </p>
            );
        case "custom_html":
            return typeof config.html === "string" ? (
                <div dangerouslySetInnerHTML={{__html: config.html}} />
            ) : (
                <p className="text-sm text-muted-foreground">{block.title}</p>
            );
        case "video":
            return typeof config.url === "string" ? (
                <div className="aspect-video w-full overflow-hidden rounded-md bg-muted">
                    <iframe
                        title={block.title}
                        src={config.url}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">{block.title}</p>
            );
        default:
            return (
                <div className="flex flex-col gap-y-1">
                    <p className="font-medium">{block.title}</p>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{block.type}</p>
                </div>
            );
    }
}

export default function CmsBlockRenderer({block, className}: CmsBlockRendererProps) {
    return (
        <section
            data-cms-block-id={block._id}
            data-cms-block-type={block.type}
            className={cn("rounded-lg border bg-card p-4", className)}
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
