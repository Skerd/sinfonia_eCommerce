import {createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode} from "react";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import {getToken} from "@coreModule/helpers/context/localStorage/authenticationStorage.ts";

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
};

type ShopCartContextValue = {
    cart: ShopCart | null;
    loading: boolean;
    /** True when the visitor has no auth token — cart requires sign-in. */
    signInRequired: boolean;
    itemCount: number;
    refresh: () => Promise<void>;
    addItem: (productId: string, variantId: string | undefined, quantity: number) => Promise<void>;
    updateItem: (itemId: string, quantity: number) => Promise<void>;
    removeItem: (itemId: string) => Promise<void>;
    applyDiscount: (code: string) => Promise<{valid: boolean; message?: string}>;
    applyGiftCard: (code: string) => Promise<{valid: boolean; message?: string}>;
    removeGiftCard: () => Promise<void>;
    clear: () => Promise<void>;
};

const ShopCartContext = createContext<ShopCartContextValue | null>(null);

export function ShopCartProvider({children}: {children: ReactNode}) {
    const [cart, setCart] = useState<ShopCart | null>(null);
    const [loading, setLoading] = useState(true);
    const signInRequired = !getToken();

    const refresh = useCallback(async () => {
        if (!getToken()) {
            setCart(null);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const res = await apiClient.get<{data: ShopCart | null}>("/api/eCommerce/cart");
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

    const addItem = useCallback(async (productId: string, variantId: string | undefined, quantity: number) => {
        const res = await apiClient.put<{data: ShopCart}>("/api/eCommerce/cart/item", {productId, variantId, quantity});
        setCart(res.data.data);
    }, []);

    const updateItem = useCallback(async (itemId: string, quantity: number) => {
        const res = await apiClient.patch<{data: ShopCart}>("/api/eCommerce/cart/item", {itemId, quantity});
        setCart(res.data.data);
    }, []);

    const removeItem = useCallback(async (itemId: string) => {
        const res = await apiClient.delete<{data: ShopCart}>(`/api/eCommerce/cart/item/${itemId}`);
        setCart(res.data.data);
    }, []);

    const applyDiscount = useCallback(async (code: string) => {
        const res = await apiClient.post<{valid: boolean; data?: ShopCart; message?: string}>("/api/eCommerce/cart/apply-discount", {code});
        if (res.data.valid && res.data.data) setCart(res.data.data);
        return {valid: res.data.valid, message: res.data.message};
    }, []);

    const applyGiftCard = useCallback(async (code: string) => {
        const res = await apiClient.post<{valid: boolean; data?: ShopCart; message?: string}>("/api/eCommerce/cart/apply-gift-card", {code});
        if (res.data.valid && res.data.data) setCart(res.data.data);
        return {valid: res.data.valid, message: res.data.message};
    }, []);

    const removeGiftCard = useCallback(async () => {
        const res = await apiClient.delete<{data: ShopCart}>("/api/eCommerce/cart/gift-card");
        setCart(res.data.data);
    }, []);

    const clear = useCallback(async () => {
        await apiClient.delete("/api/eCommerce/cart/clear");
        await refresh();
    }, [refresh]);

    const itemCount = useMemo(
        () => (cart?.items ?? []).reduce((sum, item) => sum + item.quantity, 0),
        [cart],
    );

    const value = useMemo<ShopCartContextValue>(
        () => ({cart, loading, signInRequired, itemCount, refresh, addItem, updateItem, removeItem, applyDiscount, applyGiftCard, removeGiftCard, clear}),
        [cart, loading, signInRequired, itemCount, refresh, addItem, updateItem, removeItem, applyDiscount, applyGiftCard, removeGiftCard, clear],
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
