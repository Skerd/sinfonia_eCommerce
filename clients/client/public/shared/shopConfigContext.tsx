import {createContext, useContext, useMemo, type ReactNode} from "react";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import {formatCurrency, formatNumber} from "@coreModule/helpers/general/numbers.ts";
import type {ShopConfigResponse} from "armonia/src/modules/eCommerce/api/eCommerce/public/shopCatalog/shopCatalog.types.ts";
import type {PortalCurrency} from "armonia/src/modules/core/api/portal/public/portal/portal.dto.ts";

type ShopConfig = ShopConfigResponse["data"];

export type ShopMoneyCurrency = Pick<PortalCurrency, "symbol" | "abbreviation" | "decimalPlaces">;

type ShopConfigContextValue = {
    config: ShopConfig | null;
    loading: boolean;
    /** Formats in the record's own currency; without one the amount is a plain number. */
    formatMoney: (amount: number | undefined | null, currency?: ShopMoneyCurrency | null) => string;
};

const ShopConfigContext = createContext<ShopConfigContextValue>({
    config: null,
    loading: true,
    formatMoney: () => "",
});

const CONFIG_REQUEST: HttpRequest = {method: "GET", url: "/api/eCommerce/shopConfig"};

export function ShopConfigProvider({children}: {children: ReactNode}) {
    const {data, loading} = useHttpRequest<ShopConfigResponse>(CONFIG_REQUEST, {}, 1);
    const config = data?.data ?? null;

    const value = useMemo<ShopConfigContextValue>(() => ({
        config,
        loading,
        // Locale-aware via the ISO code ("1.234,50 €" / "€1,234.50"); the bare symbol only when there is no code.
        // Never falls back to the shop currency: a price without a currency must not borrow one.
        formatMoney: (amount, currency) => {
            if (amount == null || Number.isNaN(amount)) return "";
            const decimals = currency?.decimalPlaces ?? 2;
            const digits = {minimumFractionDigits: decimals, maximumFractionDigits: decimals};
            if (currency?.abbreviation) return formatCurrency(amount, currency.abbreviation, digits);
            if (currency?.symbol) return `${currency.symbol}${amount.toFixed(decimals)}`;
            return formatNumber(amount, digits);
        },
    }), [config, loading]);

    return <ShopConfigContext.Provider value={value}>{children}</ShopConfigContext.Provider>;
}

export function useShopConfig(): ShopConfigContextValue {
    return useContext(ShopConfigContext);
}
