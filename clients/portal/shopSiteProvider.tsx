import type {ReactNode} from "react";
import {ShopConfigProvider} from "@eCommerceModule/clients/client/public/shared/shopConfigContext.tsx";
import {ShopCartProvider} from "@eCommerceModule/clients/client/public/shared/shopCartContext.tsx";

/** The shop's state the whole site shares: its config (currency) and the visitor's cart, which the navbar shows. */
export default function ShopSiteProvider({children}: {children: ReactNode}) {
    return (
        <ShopConfigProvider>
            <ShopCartProvider>{children}</ShopCartProvider>
        </ShopConfigProvider>
    );
}
