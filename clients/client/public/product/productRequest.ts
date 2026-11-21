import type {HttpRequest} from "@coreModule/helpers/types/httpRequest.types.ts";

/** A product page's read; the shop's portal section asks it ahead for a hovered product link. */
export const PRODUCT_REQUEST: HttpRequest = {method: "POST", url: "/api/eCommerce/shopProduct", cache: true};

/** A product's reviews (the first 20); asked ahead with the product, so they arrive with it (TD-F146). */
export const REVIEWS_REQUEST: HttpRequest = {method: "POST", url: "/api/eCommerce/shopProductReviews", cache: true};

/** Which product's reviews: the product's id, its slug, and the seller it is sold by. */
export function reviewsRequestBody(productId: string, slug: string | undefined, sellerCompanyId: string | undefined) {
    return {id: productId, slug, ...(sellerCompanyId ? {sellerCompanyId} : {}), limit: 20};
}

/** What a product page asks for, from its address (`?id=…&slug=…&seller=…`). */
export function productRequestBody(params: URLSearchParams) {
    const id = params.get("id");
    const slug = params.get("slug");
    const sellerCompanyId = params.get("seller");
    return {...(id ? {id} : {}), ...(slug ? {slug} : {}), ...(sellerCompanyId ? {sellerCompanyId} : {})};
}
