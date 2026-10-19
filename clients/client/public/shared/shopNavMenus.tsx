import {useEffect, useState} from "react";
import {Link, useLocation} from "react-router-dom";
import {ArrowRight, ChevronDown, MapPin} from "lucide-react";
import {Popover, PopoverContent, PopoverTrigger} from "@coreModule/components/ui/popover.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import type {ShopTaxonomyResponse} from "armonia/src/modules/eCommerce/api/eCommerce/public/shopCatalog/shopCatalog.types.ts";
import type {
    ShopListingCategory,
    ShopListingTaxonomyResponse,
} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/public/shopMarketplace/shopMarketplace.types.ts";

/** Top-level columns a menu shows before "View all" takes over. */
const MAX_GROUPS = 8;
const MAX_CHILDREN = 6;
const MAX_PLACES = 8;

export type ShopMenuLink = {key: string; label: string; to: string};
export type ShopMenuGroup = ShopMenuLink & {children: ShopMenuLink[]};

export type ShopMenu = {
    groups: ShopMenuGroup[];
    /** Secondary column: product collections, or the places services are offered in. */
    extras: ShopMenuLink[];
};

export type ShopNavMenus = {
    products: ShopMenu;
    /** Null while loading and when the shop has no active listings: the Services entry is hidden. */
    services: ShopMenu | null;
};

/** Listing categories that have an active listing in themselves or below. */
export function withListings(categories: ShopListingCategory[]): Set<string> {
    const keep = new Set<string>();
    const parentOf = new Map(categories.map(category => [category._id, category.parent]));
    for (const category of categories) {
        if (category.listingCount === 0) continue;
        for (let id: string | undefined = category._id; id && !keep.has(id); id = parentOf.get(id)) keep.add(id);
    }
    return keep;
}

function categoryTree<T extends {_id: string; name: string; slug: string; parent?: string}>(categories: T[], basePath: string): ShopMenuGroup[] {
    const link = (category: T): ShopMenuLink => ({
        key: category._id,
        label: category.name,
        to: `${basePath}?category=${encodeURIComponent(category.slug)}`,
    });
    return categories
        .filter(category => !category.parent)
        .map(category => ({
            ...link(category),
            children: categories.filter(child => child.parent === category._id).map(link),
        }));
}

/** Both header menus, loaded once for the layout. */
export function useShopNavMenus(): ShopNavMenus {
    const [menus, setMenus] = useState<ShopNavMenus>({products: {groups: [], extras: []}, services: null});

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const [products, services] = await Promise.allSettled([
                apiClient.post<ShopTaxonomyResponse>("/api/eCommerce/shopTaxonomy", {}),
                apiClient.post<ShopListingTaxonomyResponse>("/api/eCommerceMarketplace/shopListingTaxonomy", {}),
            ]);
            if (cancelled) return;

            const productData = products.status === "fulfilled" ? products.value.data.data : null;
            const serviceData = services.status === "fulfilled" ? services.value.data.data : null;

            let serviceMenu: ShopMenu | null = null;
            if (serviceData && serviceData.listingCount > 0) {
                const keep = withListings(serviceData.categories);
                const seen = new Set<string>();
                const places: ShopMenuLink[] = [];
                for (const location of serviceData.locations) {
                    const place = location.city ?? location.state ?? location.country;
                    if (!place || seen.has(place._id)) continue;
                    seen.add(place._id);
                    const param = location.city ? "city" : location.state ? "state" : "country";
                    const region = location.city ? (location.country ?? location.state)?.name : location.state ? location.country?.name : undefined;
                    places.push({
                        key: place._id,
                        label: region ? `${place.name}, ${region}` : place.name,
                        to: `/services?${param}=${encodeURIComponent(place._id)}`,
                    });
                }
                serviceMenu = {
                    groups: categoryTree(serviceData.categories.filter(category => keep.has(category._id)), "/services"),
                    extras: places.sort((a, b) => a.label.localeCompare(b.label)),
                };
            }

            setMenus({
                products: {
                    groups: productData ? categoryTree(productData.categories, "/products") : [],
                    extras: (productData?.collections ?? []).map(collection => ({
                        key: collection._id,
                        label: collection.title,
                        to: `/products?collection=${encodeURIComponent(collection.slug)}`,
                    })),
                },
                services: serviceMenu,
            });
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    return menus;
}

type ShopMenuLabels = {
    label: string;
    viewAll: string;
    extrasHeading: string;
    /** Extra call to action under the columns (Services: post a job). */
    cta?: ShopMenuLink;
};

const MENU_LINK_CLASS = "rounded-md text-shop-ink-muted transition-colors hover:text-shop-ink hover:underline underline-offset-4";

/**
 * Desktop dropdown: category columns plus a secondary column. With no
 * categories it falls back to the plain link, like the old flat nav.
 */
export function ShopDesktopMenu({menu, to, activePaths, labels, linkClassName}: {
    menu: ShopMenu;
    to: string;
    /** Routes that highlight this entry (the list page and its detail pages). */
    activePaths: string[];
    labels: ShopMenuLabels;
    linkClassName: (state: {isActive: boolean}) => string;
}) {
    const {pathname} = useLocation();
    const [open, setOpen] = useState(false);
    const isActive = activePaths.includes(pathname);

    // Close on navigation; the panel's links change the route
    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    if (menu.groups.length === 0 && menu.extras.length === 0) {
        return <Link to={to} className={linkClassName({isActive})}>{labels.label}</Link>;
    }

    const groups = menu.groups.slice(0, MAX_GROUPS);
    const extras = menu.extras.slice(0, MAX_PLACES);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button type="button" className={cn(linkClassName({isActive}), "inline-flex items-center gap-1")} aria-expanded={open}>
                    {labels.label}
                    <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} aria-hidden />
                </button>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                sideOffset={18}
                className="w-[min(92vw,760px)] gap-0 rounded-2xl border border-shop-border bg-white p-0 text-shop-ink shadow-xl ring-0"
            >
                <div className={cn("grid gap-8 p-6", extras.length > 0 ? "grid-cols-[1fr_200px]" : "grid-cols-1")}>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3">
                        {groups.map(group => (
                            <div key={group.key} className="flex flex-col gap-2 text-sm">
                                <Link to={group.to} className="font-semibold text-shop-ink hover:underline underline-offset-4">{group.label}</Link>
                                {group.children.slice(0, MAX_CHILDREN).map(child => (
                                    <Link key={child.key} to={child.to} className={MENU_LINK_CLASS}>{child.label}</Link>
                                ))}
                            </div>
                        ))}
                    </div>
                    {extras.length > 0 && (
                        <div className="flex flex-col gap-2 border-l border-shop-border pl-6 text-sm">
                            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-shop-ink-faded">{labels.extrasHeading}</p>
                            {extras.map(extra => (
                                <Link key={extra.key} to={extra.to} className={cn(MENU_LINK_CLASS, "inline-flex items-start gap-1.5")}>
                                    {to === "/services" && <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />}
                                    {extra.label}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-b-2xl border-t border-shop-border bg-shop-cream/60 px-6 py-3.5 text-sm">
                    <Link to={to} className="inline-flex items-center gap-1 font-semibold text-shop-accent hover:underline underline-offset-4">
                        {labels.viewAll}
                        <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                    {labels.cta && (
                        <Link to={labels.cta.to} className="font-medium text-shop-ink hover:underline underline-offset-4">{labels.cta.label}</Link>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}

/** Mobile drawer group: the section link plus its top-level categories behind a toggle. */
export function ShopMobileMenu({menu, to, labels, onNavigate}: {
    menu: ShopMenu;
    to: string;
    labels: ShopMenuLabels;
    onNavigate?: () => void;
}) {
    const [open, setOpen] = useState(false);
    const hasItems = menu.groups.length > 0;

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
                <Link to={to} onClick={onNavigate} className="text-lg font-medium text-shop-ink">{labels.label}</Link>
                {hasItems && (
                    <button
                        type="button"
                        onClick={() => setOpen(current => !current)}
                        aria-expanded={open}
                        aria-label={labels.label}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-shop-ink-muted hover:bg-shop-cream"
                    >
                        <ChevronDown className={cn("h-5 w-5 transition-transform", open && "rotate-180")} aria-hidden />
                    </button>
                )}
            </div>
            {open && (
                <ul className="flex flex-col gap-3 border-l border-shop-border pl-4">
                    {menu.groups.map(group => (
                        <li key={group.key}>
                            <Link to={group.to} onClick={onNavigate} className="text-[15px] text-shop-ink-muted hover:text-shop-ink">{group.label}</Link>
                        </li>
                    ))}
                    {labels.cta && (
                        <li>
                            <Link to={labels.cta.to} onClick={onNavigate} className="text-[15px] font-medium text-shop-accent">{labels.cta.label}</Link>
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
}
