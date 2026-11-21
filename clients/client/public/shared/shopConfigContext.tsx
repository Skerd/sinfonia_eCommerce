import {createContext, useContext, useMemo, type ReactNode} from "react";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import {formatRecordMoney, type PortalMoneyCurrency} from "@coreModule/clients/portal/shared/portalMoney.ts";
import type {ShopConfigResponse} from "armonia/src/modules/eCommerce/api/eCommerce/public/shopCatalog/shopCatalog.types.ts";

type ShopConfig = ShopConfigResponse["data"];

export type ShopMoneyCurrency = PortalMoneyCurrency;

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

const CONFIG_REQUEST: HttpRequest = {method: "GET", url: "/api/eCommerce/shopConfig", cache: true};

export function ShopConfigProvider({children}: {children: ReactNode}) {
    const {data, loading} = useHttpRequest<ShopConfigResponse>(CONFIG_REQUEST, {}, 1);
    const config = data?.data ?? null;

    const value = useMemo<ShopConfigContextValue>(() => ({
        config,
        loading,
        // Never falls back to the shop currency: a price without a currency must not borrow one.
        formatMoney: formatRecordMoney,
    }), [config, loading]);

    return <ShopConfigContext.Provider value={value}>{children}</ShopConfigContext.Provider>;
}

export function useShopConfig(): ShopConfigContextValue {
    return useContext(ShopConfigContext);
}
