import {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode} from "react";
import {toast} from "sonner";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {getToken} from "@coreModule/helpers/context/localStorage/authenticationStorage.ts";
import type {CartNotices} from "armonia/src/modules/eCommerce/api/eCommerce/private/cart/cart.dto.ts";
import {shopReasonMessage} from "./shopErrorMessages.ts";

export type ShopCartItem = {
    _id: string;
    product: {_id: string; title?: string};
    variant?: {_id: string} | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    snapshot?: {title?: string; sku?: string; imageUrl?: string};
};

export type ShopCart = {
    _id: string;
    items: ShopCartItem[];
    subtotal: number;
    discountTotal: number;
    appliedDiscounts: {code?: string; amount: number}[];
    appliedGiftCard?: {code: string; amount: number};
    notices?: CartNotices;
};

/** sessionStorage key the checkout page uses to resume one checkout per cart version. */
export const CHECKOUT_IDEMPOTENCY_STORAGE_KEY = "shop-checkout-idempotency-key";

/**
 * Any cart change makes the current checkout stale: dropping the key makes the
 * next visit to /checkout start (or re-sync) a checkout for the new contents.
 */
export function clearCheckoutIdempotencyKey(): void {
    try {
        sessionStorage.removeItem(CHECKOUT_IDEMPOTENCY_STORAGE_KEY);
    } catch {
        // storage unavailable (private mode) — the server re-syncs pending checkouts anyway
    }
}

/** Tells the buyer about changes the server made while re-pricing their cart. */
function announceNotices(notices: CartNotices | undefined): void {
    if (!notices) return;
    if (notices.removedItems?.length) {
        toast.info(`No longer available and removed from your cart: ${notices.removedItems.join(", ")}`);
    }
    if (notices.discountRemoved) {
        toast.info(`Your discount code was removed: ${shopReasonMessage(notices.discountRemoved, "it no longer applies to this cart")}`);
    }
    if (notices.giftCardRemoved) {
        toast.info("Your gift card was removed because it has no balance left.");
    }
}

type ShopCartContextValue = {
    cart: ShopCart | null;
    loading: boolean;
    /** True when the visitor has no auth token — cart requires sign-in. */
    signInRequired: boolean;
    itemCount: number;
    /** Line ids with a quantity change in flight (buttons stay disabled meanwhile). */
    pendingItemIds: ReadonlySet<string>;
    refresh: () => Promise<void>;
    addItem: (productId: string, variantId: string | undefined, quantity: number) => Promise<void>;
    updateItem: (itemId: string, quantity: number) => Promise<void>;
    removeItem: (itemId: string) => Promise<void>;
    applyDiscount: (code: string) => Promise<{valid: boolean; message?: string}>;
    removeDiscount: () => Promise<void>;
    applyGiftCard: (code: string) => Promise<{valid: boolean; message?: string}>;
    removeGiftCard: () => Promise<void>;
    clear: () => Promise<void>;
};

const ShopCartContext = createContext<ShopCartContextValue | null>(null);

export function ShopCartProvider({children}: {children: ReactNode}) {
    const [cart, setCart] = useState<ShopCart | null>(null);
    const [loading, setLoading] = useState(true);
    const [pendingItemIds, setPendingItemIds] = useState<ReadonlySet<string>>(new Set());
    const pendingRef = useRef(new Set<string>());
    const signInRequired = !getToken();

    /** Stores a mutated cart: announces server notices and invalidates the open checkout. */
    const acceptMutation = useCallback((next: ShopCart | null) => {
        clearCheckoutIdempotencyKey();
        announceNotices(next?.notices);
        setCart(next);
    }, []);

    const refresh = useCallback(async () => {
        if (!getToken()) {
            setCart(null);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const res = await apiClient.get<{data: ShopCart | null}>("/api/eCommerce/cart");
            announceNotices(res.data.data?.notices);
            setCart(res.data.data ?? null);
        } catch {
            setCart(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    /** Runs one request per cart line at a time, so rapid clicks can't send stale quantities. */
    const withItemLock = useCallback(async (itemId: string, run: () => Promise<void>) => {
        if (pendingRef.current.has(itemId)) return;
        pendingRef.current.add(itemId);
        setPendingItemIds(new Set(pendingRef.current));
        try {
            await run();
        } finally {
            pendingRef.current.delete(itemId);
            setPendingItemIds(new Set(pendingRef.current));
        }
    }, []);

    const addItem = useCallback(async (productId: string, variantId: string | undefined, quantity: number) => {
        const res = await apiClient.put<{data: ShopCart}>("/api/eCommerce/cart/item", {productId, variantId, quantity});
        acceptMutation(res.data.data);
    }, [acceptMutation]);

    const updateItem = useCallback((itemId: string, quantity: number) => withItemLock(itemId, async () => {
        const res = await apiClient.patch<{data: ShopCart}>("/api/eCommerce/cart/item", {itemId, quantity});
        acceptMutation(res.data.data);
    }), [acceptMutation, withItemLock]);

    const removeItem = useCallback((itemId: string) => withItemLock(itemId, async () => {
        const res = await apiClient.delete<{data: ShopCart}>(`/api/eCommerce/cart/item/${itemId}`);
        acceptMutation(res.data.data);
    }), [acceptMutation, withItemLock]);

    const applyDiscount = useCallback(async (code: string) => {
        const res = await apiClient.post<{valid: boolean; data?: ShopCart; message?: string}>("/api/eCommerce/cart/apply-discount", {code});
        if (res.data.valid && res.data.data) acceptMutation(res.data.data);
        return {valid: res.data.valid, message: res.data.message};
    }, [acceptMutation]);

    const removeDiscount = useCallback(async () => {
        const res = await apiClient.delete<{data: ShopCart}>("/api/eCommerce/cart/discount");
        acceptMutation(res.data.data);
    }, [acceptMutation]);

    const applyGiftCard = useCallback(async (code: string) => {
        const res = await apiClient.post<{valid: boolean; data?: ShopCart; message?: string}>("/api/eCommerce/cart/apply-gift-card", {code});
        if (res.data.valid && res.data.data) acceptMutation(res.data.data);
        return {valid: res.data.valid, message: res.data.message};
    }, [acceptMutation]);

    const removeGiftCard = useCallback(async () => {
        const res = await apiClient.delete<{data: ShopCart}>("/api/eCommerce/cart/gift-card");
        acceptMutation(res.data.data);
    }, [acceptMutation]);

    const clear = useCallback(async () => {
        await apiClient.delete("/api/eCommerce/cart/clear");
        clearCheckoutIdempotencyKey();
        await refresh();
    }, [refresh]);

    const itemCount = useMemo(
        () => (cart?.items ?? []).reduce((sum, item) => sum + item.quantity, 0),
        [cart],
    );

    const value = useMemo<ShopCartContextValue>(
        () => ({
            cart, loading, signInRequired, itemCount, pendingItemIds, refresh, addItem, updateItem, removeItem,
            applyDiscount, removeDiscount, applyGiftCard, removeGiftCard, clear,
        }),
        [cart, loading, signInRequired, itemCount, pendingItemIds, refresh, addItem, updateItem, removeItem,
            applyDiscount, removeDiscount, applyGiftCard, removeGiftCard, clear],
    );

    return <ShopCartContext.Provider value={value}>{children}</ShopCartContext.Provider>;
}

export function useShopCart(): ShopCartContextValue {
    const ctx = useContext(ShopCartContext);
    if (!ctx) {
        throw new Error("useShopCart must be used within ShopCartProvider");
    }
    return ctx;
}
