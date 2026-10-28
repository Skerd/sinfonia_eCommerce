import type {PortalContribution} from "@coreModule/helpers/types/portalContribution.types.ts";
import ShopSiteRoutes from "@eCommerceModule/clients/client/public/shared/shopSiteRoutes.tsx";
import ShopMiniCart from "@eCommerceModule/clients/client/public/shared/shopMiniCart.tsx";
import ShopSiteProvider from "./shopSiteProvider.tsx";
import ShopAccountLinks from "./shopAccountLinks.tsx";
import ShopHome from "./shopHome.tsx";
import ShopProductFilters from "./shopProductFilters.tsx";
import ShopServiceFilters from "./shopServiceFilters.tsx";

/** The shop on the portal: every listed seller's products on the apex, one company's on its own site; one cart and checkout. */
const contribution: PortalContribution = {
    id: "shop",
    order: 10,
    section: "shop",
    path: "shop",
    SectionSite: ShopSiteRoutes,
    catalogs: [{kind: "product", Filters: ShopProductFilters}, {kind: "service", Filters: ShopServiceFilters}],
    Home: ShopHome,
    Provider: ShopSiteProvider,
    NavAction: ShopMiniCart,
    AccountSection: ShopAccountLinks,
};

export default contribution;
