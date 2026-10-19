/** Storefront product URL. Prefer `id` so platform apex can disambiguate shared slugs. */
export function shopProductHref(product: {_id: string; slug?: string; seller?: {_id: string}}): string {
    const params = new URLSearchParams();
    params.set("id", product._id);
    if (product.slug) params.set("slug", product.slug);
    if (product.seller?._id) params.set("seller", product.seller._id);
    return `/product?${params.toString()}`;
}
