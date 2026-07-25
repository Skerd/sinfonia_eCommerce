import type {SiteRoomContribution} from "@coreModule/clients/panel/moduleContributions/siteRoomContribution.types.ts";

const eCommerceSiteRoomContribution: SiteRoomContribution = {
    id: "eCommerce",
    order: 35,
    systemSettingsRooms: {
        categories: "categories_configurations",
    },
};

export default eCommerceSiteRoomContribution;
