import type {HttpRequest} from "@coreModule/helpers/types/httpRequest.types.ts";

export const ORDERS_PAGE_SIZE = 10;

/** The buyer's orders, a page at a time; the shop asks the page ahead for a hovered "My orders" link. */
export const ORDERS_REQUEST: HttpRequest = {method: "POST", url: "/api/eCommerce/productOrder/my", cache: true};

/** The page of orders an address asks for (`?page=`). */
export function ordersRequestBody(params: URLSearchParams) {
    return {page: Math.max(1, Number(params.get("page")) || 1), limit: ORDERS_PAGE_SIZE};
}
