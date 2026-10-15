import {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode} from "react";
import {useSelector} from "react-redux";
import {toast} from "sonner";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {useDynamicLanguage} from "@coreModule/helpers/hooks/useDynamicLanguage.ts";
import {RootState} from "@coreModule/helpers/redux/store/generalStore.ts";
import type {Cart, CartNotices} from "armonia/src/modules/eCommerce/api/eCommerce/private/cart/cart.dto.ts";
import {useShopReasonMessage} from "./shopErrorMessages.ts";

const LANGUAGE_PATH = "src/modules/eCommerce/clients/client/public/shared/shopCartContext.tsx";

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

type ShopCartContextValue = {
    cart: Cart | null;
    loading: boolean;
    /** True when the visitor has no auth token — cart requires sign-in. */
    signInRequired: boolean;
    itemCount: number;
    /** Line ids with a quantity change in flight (buttons stay disabled meanwhile). */
    pendingItemIds: ReadonlySet<string>;
    /** The slide-over cart opened after adding a product. */
    miniCartOpen: boolean;
    setMiniCartOpen: (open: boolean) => void;
    refresh: () => Promise<void>;
    addItem: (productId: string, variantId: string | undefined, quantity: number) => Promise<void>;
    updateItem: (itemId: string, quantity: number) => Promise<void>;
    removeItem: (itemId: string) => Promise<void>;
    applyDiscount: (code: string) => Promise<{valid: boolean; message?: string}>;
    removeDiscount: () => Promise<void>;
    applyGiftCard: (code: string) => Promise<{valid: boolean; message?: string}>;
    removeGiftCard: () => Promise<void>;
};

const ShopCartContext = createContext<ShopCartContextValue | null>(null);

export function ShopCartProvider({children}: {children: ReactNode}) {
    const token = useSelector((state: RootState) => state.authentication.token);
    const {resolveLanguageKey, loading: languageLoading} = useDynamicLanguage(LANGUAGE_PATH);
    const {reasonMessage, loading: reasonsLoading} = useShopReasonMessage();
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(true);
    const [miniCartOpen, setMiniCartOpen] = useState(false);
    const [notices, setNotices] = useState<CartNotices | null>(null);
    const [pendingItemIds, setPendingItemIds] = useState<ReadonlySet<string>>(new Set());
    const pendingRef = useRef(new Set<string>());
    const signInRequired = !token;

    // Changes the server made while re-pricing; held until the copy has loaded so none is announced blank
    useEffect(() => {
        if (!notices || languageLoading || reasonsLoading) return;
        if (notices.removedItems?.length) {
            toast.info(resolveLanguageKey("removedItems").replace("{items}", notices.removedItems.join(", ")));
        }
        if (notices.discountRemoved) {
            toast.info(resolveLanguageKey("discountRemoved").replace("{reason}", reasonMessage(notices.discountRemoved, "discountRemoved")));
        }
        if (notices.giftCardRemoved) {
            toast.info(resolveLanguageKey("giftCardRemoved"));
        }
        setNotices(null);
    }, [notices, languageLoading, reasonsLoading, resolveLanguageKey, reasonMessage]);

    /** Stores a server cart, queueing its notices for announcement. */
    const acceptCart = useCallback((next: Cart | null) => {
        if (next?.notices) setNotices(next.notices);
        setCart(next);
    }, []);

    /** Stores a mutated cart; any change also invalidates the open checkout. */
    const acceptMutation = useCallback((next: Cart | null) => {
        clearCheckoutIdempotencyKey();
        acceptCart(next);
    }, [acceptCart]);

    const refresh = useCallback(async () => {
        if (!token) {
            setCart(null);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const res = await apiClient.get<{data: Cart | null}>("/api/eCommerce/cart");
            acceptCart(res.data.data ?? null);
        } catch {
            setCart(null);
        } finally {
            setLoading(false);
        }
    }, [token, acceptCart]);

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
        const res = await apiClient.put<{data: Cart}>("/api/eCommerce/cart/item", {productId, variantId, quantity});
        acceptMutation(res.data.data);
    }, [acceptMutation]);

    const updateItem = useCallback((itemId: string, quantity: number) => withItemLock(itemId, async () => {
        const res = await apiClient.patch<{data: Cart}>("/api/eCommerce/cart/item", {itemId, quantity});
        acceptMutation(res.data.data);
    }), [acceptMutation, withItemLock]);

    const removeItem = useCallback((itemId: string) => withItemLock(itemId, async () => {
        const res = await apiClient.delete<{data: Cart}>(`/api/eCommerce/cart/item/${itemId}`);
        acceptMutation(res.data.data);
    }), [acceptMutation, withItemLock]);

    const applyDiscount = useCallback(async (code: string) => {
        const res = await apiClient.post<{valid: boolean; data?: Cart; message?: string}>("/api/eCommerce/cart/apply-discount", {code});
        if (res.data.valid && res.data.data) acceptMutation(res.data.data);
        return {valid: res.data.valid, message: res.data.message};
    }, [acceptMutation]);

    const removeDiscount = useCallback(async () => {
        const res = await apiClient.delete<{data: Cart}>("/api/eCommerce/cart/discount");
        acceptMutation(res.data.data);
    }, [acceptMutation]);

    const applyGiftCard = useCallback(async (code: string) => {
        const res = await apiClient.post<{valid: boolean; data?: Cart; message?: string}>("/api/eCommerce/cart/apply-gift-card", {code});
        if (res.data.valid && res.data.data) acceptMutation(res.data.data);
        return {valid: res.data.valid, message: res.data.message};
    }, [acceptMutation]);

    const removeGiftCard = useCallback(async () => {
        const res = await apiClient.delete<{data: Cart}>("/api/eCommerce/cart/gift-card");
        acceptMutation(res.data.data);
    }, [acceptMutation]);

    const itemCount = useMemo(
        () => (cart?.items ?? []).reduce((sum, item) => sum + item.quantity, 0),
        [cart],
    );

    const value = useMemo<ShopCartContextValue>(
        () => ({
            cart, loading, signInRequired, itemCount, pendingItemIds, miniCartOpen, setMiniCartOpen, refresh, addItem,
            updateItem, removeItem, applyDiscount, removeDiscount, applyGiftCard, removeGiftCard,
        }),
        [cart, loading, signInRequired, itemCount, pendingItemIds, miniCartOpen, refresh, addItem, updateItem, removeItem,
            applyDiscount, removeDiscount, applyGiftCard, removeGiftCard],
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
