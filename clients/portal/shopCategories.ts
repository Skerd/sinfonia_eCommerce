import type {ShopListingCategory} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/public/shopMarketplace/shopMarketplace.types.ts";

/** Ids of the categories that lead to at least one service: those with listings, and every parent above them. */
export function withListings(categories: readonly ShopListingCategory[]): Set<string> {
    const byId = new Map(categories.map((category) => [category._id, category]));
    const keep = new Set<string>();
    for (const category of categories) {
        if (category.listingCount === 0) continue;
        for (let node: ShopListingCategory | undefined = category; node && !keep.has(node._id); node = node.parent ? byId.get(node.parent) : undefined) {
            keep.add(node._id);
        }
    }
    return keep;
}

/** One entry per slug: sellers on the apex can share a category name, and an ambiguous slug matches nothing. */
export function uniqueBySlug<Category extends {slug: string}>(categories: readonly Category[]): Category[] {
    return [...new Map(categories.map((category) => [category.slug, category])).values()];
}
