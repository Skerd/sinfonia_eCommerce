import {createContext, useContext, useEffect, useMemo, useState, type ReactNode} from "react";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {formatCurrency} from "@coreModule/helpers/general/numbers.ts";
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
        const code = config?.currency?.abbreviation;
        const symbol = config?.currency?.symbol ?? "";
        const decimals = config?.currency?.decimalPlaces ?? 2;
        return {
            config,
            loading,
            // Locale-aware via the ISO code ("1.234,50 €" / "€1,234.50"); the bare symbol only when there is no code
            formatMoney: (amount) => {
                if (amount == null || Number.isNaN(amount)) return "";
                if (code) return formatCurrency(amount, code, {minimumFractionDigits: decimals, maximumFractionDigits: decimals});
                return `${symbol}${amount.toFixed(decimals)}`;
            },
        };
    }, [config, loading]);

    return <ShopConfigContext.Provider value={value}>{children}</ShopConfigContext.Provider>;
}

export function useShopConfig(): ShopConfigContextValue {
    return useContext(ShopConfigContext);
}
