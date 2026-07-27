import type {SiteRoomContribution} from "@coreModule/clients/panel/moduleContributions/siteRoomContribution.types.ts";

const eCommerceSiteRoomContribution: SiteRoomContribution = {
    id: "eCommerce",
    order: 35,
    systemSettingsRooms: {
        categories: "categories_configurations",
        productattributes: "productAttributes_configurations",
        customergroups: "customerGroups_configurations",
        discounts: "discounts_configurations",
        pricingrules: "pricingRules_configurations",
        warehouses: "warehouses_configurations",
        shippingzones: "shippingZones_configurations",
        taxzones: "taxZones_configurations",
        productvariants: "productVariants_configurations",
        posconfigs: "posConfigs_configurations",
        pospaymentmethods: "posPaymentMethods_configurations",
    },
};

export default eCommerceSiteRoomContribution;
