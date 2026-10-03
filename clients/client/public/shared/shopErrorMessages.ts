import {normalizeError} from "@coreModule/helpers/general/errors.ts";

/**
 * Buyer-facing text for the reason codes the cart API returns as *values*
 * (`{valid: false, message: "<code>"}` from apply-discount / apply-gift-card,
 * and `notices.discountRemoved`). Thrown API errors already carry a localized
 * server message, so they go through handleError instead.
 */
const REASON_MESSAGES: Record<string, string> = {
    discount_not_found: "That discount code doesn't exist.",
    discount_inactive: "That discount code is no longer active.",
    discount_not_started: "That discount code isn't active yet.",
    discount_expired: "That discount code has expired.",
    discount_usage_limit_reached: "That discount code has been fully used.",
    discount_customer_limit_reached: "You've already used that discount code.",
    discount_not_applicable_to_cart: "That discount code doesn't apply to the items in your cart.",
    minimum_order_amount_not_met: "Your cart doesn't reach the minimum amount for that code.",
    minimum_quantity_not_met: "Your cart doesn't have enough items for that code.",
    buy_x_get_y_misconfigured: "That discount code can't be used right now.",
    gift_card_not_redeemable: "That gift card is not valid or has no balance left.",
};

/** Message for a reason code, else the fallback. */
export function shopReasonMessage(code: string | undefined | null, fallback: string): string {
    return (code && REASON_MESSAGES[code]) || fallback;
}

/** The API error code of a failed request (e.g. "checkout_cart_changed"), if any. */
export function shopErrorCode(err: unknown): string | undefined {
    return normalizeError(err).code;
}
