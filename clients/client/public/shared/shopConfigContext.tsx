import {createContext, useContext, useEffect, useMemo, useState, type ReactNode} from "react";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import type {ShopConfigResponse} from "armonia/src/modules/eCommerce/api/eCommerce/public/shopCatalog/shopCatalog.types.ts";

type ShopConfig = ShopConfigResponse["data"];

type ShopConfigContextValue = {
    config: ShopConfig | null;
    loading: boolean;
    formatMoney: (amount: number | undefined | null) => string;
};

const ShopConfigContext = createContext<ShopConfigContextValue>({
    config: null,
    loading: true,
    formatMoney: () => "",
});

export function ShopConfigProvider({children}: {children: ReactNode}) {
    const [config, setConfig] = useState<ShopConfig | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await apiClient.get<ShopConfigResponse>("/api/eCommerce/shopConfig");
                if (!cancelled) setConfig(res.data.data ?? null);
            } catch {
                if (!cancelled) setConfig(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const value = useMemo<ShopConfigContextValue>(() => {
        const symbol = config?.currency?.symbol ?? "$";
        const decimals = config?.currency?.decimalPlaces ?? 2;
        return {
            config,
            loading,
            formatMoney: (amount) => {
                if (amount == null || Number.isNaN(amount)) return "";
                return `${symbol}${amount.toFixed(decimals)}`;
            },
        };
    }, [config, loading]);

    return <ShopConfigContext.Provider value={value}>{children}</ShopConfigContext.Provider>;
}

export function useShopConfig(): ShopConfigContextValue {
    return useContext(ShopConfigContext);
}
