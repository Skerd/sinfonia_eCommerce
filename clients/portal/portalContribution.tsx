import type {PortalContribution} from "@coreModule/helpers/types/portalContribution.types.ts";
import ShopSiteRoutes from "@eCommerceModule/clients/client/public/shared/shopSiteRoutes.tsx";
import ShopAccountLinks from "./shopAccountLinks.tsx";

/** The shop on the portal: every live seller's products in one shop, with one cart and checkout. */
const contribution: PortalContribution = {
    id: "shop",
    order: 10,
    section: "shop",
    path: "shop",
    SectionSite: ShopSiteRoutes,
    AccountSection: ShopAccountLinks,
};

export default contribution;
