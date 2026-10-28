import type {KeyboardEvent, MouseEvent, ReactNode} from "react";
import {compose} from "redux";
import {Store} from "lucide-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {ShopSeller} from "armonia/src/modules/eCommerce/api/eCommerce/public/shopCatalog/shopCatalog.types.ts";
import type {PublicBlogSeller} from "armonia/src/modules/core/api/auxiliary/public/blog/blog.form.response.type.ts";
import {companySiteOrigin} from "@coreModule/clients/portal/shared/portalZone.ts";
import {useShopConfig} from "./shopConfigContext.tsx";
import {resolveShopMediaUrl} from "./shopMedia.ts";
import {ShopProviderAvatar} from "./shopMarketplace.tsx";

const LANGUAGE_PATH = "src/modules/eCommerce/clients/client/public/shared/shopSellerCard.tsx";

type SellerRef = ShopSeller | PublicBlogSeller;

/**
 * The seller's own shop, the same way car rental and dental open "Visit site":
 * `{slug}.{portal zone}/shop`. A stored host covers a build with no portal zone.
 */
export function sellerShopHref(seller: Pick<SellerRef, "siteHost" | "siteSlug">): string | undefined {
    const slug = seller.siteSlug?.trim();
    if (slug) {
        const origin = companySiteOrigin(slug);
        if (origin) return `${origin}/shop`;
    }
    const host = seller.siteHost?.trim();
    if (!host) return undefined;
    const {protocol, port} = window.location;
    const portSuffix = port ? `:${port}` : "";
    return `${protocol}//${host}${portSuffix}/shop`;
}

function SellerMark({seller, size}: {seller: SellerRef; size: "sm" | "md"}) {
    const logoUrl = resolveShopMediaUrl(seller.logo);
    if (logoUrl) {
        return (
            <span
                className={cn(
                    "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-card ring-1 ring-border",
                    size === "sm" && "h-7 w-7",
                    size === "md" && "h-11 w-11",
                )}
            >
                <img src={logoUrl} alt="" className="h-full w-full object-contain p-0.5" />
            </span>
        );
    }
    return <ShopProviderAvatar name={seller.name} size={size} />;
}

type ShopSellerCardProps = WithLanguageType & {
    seller?: SellerRef;
    /** Product / service listing / blog post. */
    kind?: "product" | "service" | "blog";
    /** Compact line for catalog cards; card for detail pages. */
    size?: "compact" | "card";
    /**
     * When true, company click uses a button + stopPropagation so it works inside a parent `<Link>`
     * (product/blog cards) without nested anchors.
     */
    nestedInLink?: boolean;
    className?: string;
};

const KIND_LABEL: Record<NonNullable<ShopSellerCardProps["kind"]>, string> = {
    product: "soldBy",
    service: "offeredBy",
    blog: "publishedBy",
};

function openSellerShop(event: MouseEvent | KeyboardEvent, href: string) {
    event.preventDefault();
    event.stopPropagation();
    window.location.assign(href);
}

function SellerShopControl({
    href,
    nestedInLink,
    className,
    ariaLabel,
    children,
}: {
    href: string;
    nestedInLink: boolean;
    className?: string;
    ariaLabel: string;
    children: ReactNode;
}) {
    if (nestedInLink) {
        return (
            <button
                type="button"
                aria-label={ariaLabel}
                className={cn("cursor-pointer text-left", className)}
                onClick={(event) => openSellerShop(event, href)}
                onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") openSellerShop(event, href);
                }}
            >
                {children}
            </button>
        );
    }

    return (
        <a href={href} aria-label={ariaLabel} className={className}>
            {children}
        </a>
    );
}

/**
 * Platform-apex only: shows which company owns the listing.
 * Hidden on tenant shops (everything is already that company).
 */
function ShopSellerCardInner({
    resolveLanguageKey,
    seller,
    kind = "product",
    size = "compact",
    nestedInLink = false,
    className,
}: ShopSellerCardProps) {
    const {config} = useShopConfig();
    if (config?.mode !== "platform" || !seller?.name) return null;

    const label = resolveLanguageKey(KIND_LABEL[kind]);
    const shopHref = sellerShopHref(seller);
    const visitLabel = resolveLanguageKey("visitShop").replace("{name}", seller.name);

    if (size === "compact") {
        const body = (
            <>
                <SellerMark seller={seller} size="sm" />
                <span className="min-w-0 truncate">
                    <span className="text-muted-foreground">{label} </span>
                    <span className={cn("font-medium text-foreground", shopHref && "underline-offset-2 group-hover/seller:underline")}>
                        {seller.name}
                    </span>
                </span>
            </>
        );

        if (!shopHref) {
            return (
                <span className={cn("inline-flex max-w-full items-center gap-2 text-xs text-muted-foreground", className)}>
                    {body}
                </span>
            );
        }

        return (
            <SellerShopControl
                href={shopHref}
                nestedInLink={nestedInLink}
                ariaLabel={visitLabel}
                className={cn(
                    "group/seller inline-flex max-w-full items-center gap-2 text-xs text-muted-foreground hover:text-foreground",
                    className,
                )}
            >
                {body}
            </SellerShopControl>
        );
    }

    const identity = (
        <>
            <SellerMark seller={seller} size="md" />
            <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
                <p className={cn(
                    "truncate font-display text-base font-semibold tracking-tight",
                    shopHref && "underline-offset-2 group-hover/seller:underline",
                )}>
                    {seller.name}
                </p>
            </div>
        </>
    );

    return (
        <div className={cn("flex items-center gap-3 rounded-2xl border border-border bg-muted/60 px-4 py-3", className)}>
            {shopHref ? (
                <SellerShopControl
                    href={shopHref}
                    nestedInLink={nestedInLink}
                    ariaLabel={visitLabel}
                    className="group/seller flex min-w-0 flex-1 items-center gap-3"
                >
                    {identity}
                </SellerShopControl>
            ) : (
                <div className="flex min-w-0 flex-1 items-center gap-3">{identity}</div>
            )}
            {shopHref ? (
                <a
                    href={shopHref}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:border-foreground"
                >
                    <Store className="h-3.5 w-3.5" aria-hidden />
                    {resolveLanguageKey("visitShopShort")}
                </a>
            ) : null}
        </div>
    );
}

export default compose(withLanguage(LANGUAGE_PATH), withDebug(true, true))(ShopSellerCardInner);
