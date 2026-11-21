import type {PortalContribution} from "@coreModule/helpers/types/portalContribution.types.ts";
import {prefetchHttpRequest} from "@coreModule/helpers/apiClient/responseCache.ts";
import ShopSiteRoutes from "@eCommerceModule/clients/client/public/shared/shopSiteRoutes.tsx";
import ShopMiniCart from "@eCommerceModule/clients/client/public/shared/shopMiniCart.tsx";
import ShopSiteProvider from "./shopSiteProvider.tsx";
import ShopAccountLinks from "./shopAccountLinks.tsx";
import ShopHome from "./shopHome.tsx";
import ShopProductFilters from "./shopProductFilters.tsx";
import {PRODUCT_REQUEST, productRequestBody} from "@eCommerceModule/clients/client/public/product/productRequest.ts";
import {ORDERS_REQUEST, ordersRequestBody} from "@eCommerceModule/clients/client/public/account/orders/ordersRequest.ts";

/** The buyer's own pages (behind sign-in), by path: their code is loaded ahead of a click. */
const ACCOUNT_PAGES: Record<string, () => Promise<unknown>> = {
    "/account/orders": () => import("@eCommerceModule/clients/client/public/account/orders/index.tsx"),
    "/account/giftcards": () => import("@eCommerceModule/clients/client/public/account/giftCards/index.tsx"),
    "/account/addresses": () => import("@eCommerceModule/clients/client/public/account/addresses/index.tsx"),
};

/** The shop on the portal: every listed seller's products on the apex, one company's on its own site; one cart and checkout. */
const contribution: PortalContribution = {
    id: "shop",
    order: 10,
    section: "shop",
    path: "shop",
    SectionSite: ShopSiteRoutes,
    catalogs: [{kind: "product", Filters: ShopProductFilters}],
    Home: ShopHome,
    Provider: ShopSiteProvider,
    NavAction: ShopMiniCart,
    AccountSection: ShopAccountLinks,
    // A link about to be followed: a product's page and product, or one of the buyer's own pages (orders with their first page).
    prefetch: ({path, params}) => {
        if (path === "/product") {
            void import("@eCommerceModule/clients/client/public/product/index.tsx");
            prefetchHttpRequest(PRODUCT_REQUEST, productRequestBody(params));
            return;
        }
        const accountPage = ACCOUNT_PAGES[path] ?? (path.startsWith("/account/orders/")
            ? () => import("@eCommerceModule/clients/client/public/account/orders/orderDetail.tsx")
            : undefined);
        if (!accountPage) return;
        void import("@eCommerceModule/clients/client/public/account/accountLayout.tsx");
        void accountPage();
        if (path === "/account/orders") prefetchHttpRequest(ORDERS_REQUEST, ordersRequestBody(params));
    },
};

export default contribution;
