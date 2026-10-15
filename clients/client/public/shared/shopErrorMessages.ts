import {useCallback, useMemo} from "react";
import {normalizeError} from "@coreModule/helpers/general/errors.ts";
import {useDynamicLanguage} from "@coreModule/helpers/hooks/useDynamicLanguage.ts";

const LANGUAGE_PATH = "src/modules/eCommerce/clients/client/public/shared/shopErrorMessages.ts";

/**
 * Buyer-facing text for the reason codes the cart API returns as *values*
 * (`{valid: false, message: "<code>"}` from apply-discount / apply-gift-card,
 * and `notices.discountRemoved`). Thrown API errors already carry a localized
 * server message, so they go through handleError instead.
 *
 * `reasonMessage(code, fallbackKey)` gives the text for a known code, else the
 * text under `fallbacks.<fallbackKey>`.
 */
export function useShopReasonMessage() {
    const {resolveLanguageKey, loading} = useDynamicLanguage(LANGUAGE_PATH);
    const reasonMessage = useCallback(
        (code: string | undefined | null, fallbackKey: "discount" | "discountRemoved" | "giftCard"): string =>
            (code && resolveLanguageKey(`reasons.${code}`, true)) || resolveLanguageKey(`fallbacks.${fallbackKey}`),
        [resolveLanguageKey],
    );
    return useMemo(() => ({reasonMessage, loading}), [reasonMessage, loading]);
}

/** The API error code of a failed request (e.g. "checkout_cart_changed"), if any. */
export function shopErrorCode(err: unknown): string | undefined {
    return normalizeError(err).code;
}
