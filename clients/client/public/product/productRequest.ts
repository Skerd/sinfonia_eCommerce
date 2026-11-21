import type {HttpRequest} from "@coreModule/helpers/types/httpRequest.types.ts";

/** A product page's read; the shop's portal section asks it ahead for a hovered product link. */
export const PRODUCT_REQUEST: HttpRequest = {method: "POST", url: "/api/eCommerce/shopProduct", cache: true};

/** What a product page asks for, from its address (`?id=…&slug=…&seller=…`). */
export function productRequestBody(params: URLSearchParams) {
    const id = params.get("id");
    const slug = params.get("slug");
    const sellerCompanyId = params.get("seller");
    return {...(id ? {id} : {}), ...(slug ? {slug} : {}), ...(sellerCompanyId ? {sellerCompanyId} : {})};
}
