import {IconCategory2, IconPlug, IconCreditCard, IconCurrencyDollar, IconDownload, IconWorld, IconStack2, IconLayoutGrid, IconBooks, IconMapPin, IconDeviceDesktop, IconPercentage, IconAdjustments, IconShoppingBag, IconTag, IconTruck, IconUsers, IconBuildingWarehouse, IconGift, IconFileCertificate} from "@tabler/icons-react";
import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";
import type {NavSubCollapsible} from "@coreModule/helpers/types/sidebarNav.types.ts";
import {FISCALIZATION_AVAILABLE} from "armonia/src/modules/finance/helpers/fiscalAvailability.ts";

/** Nested under Tenancy → Configurations (owned by eCommerce). */
export function buildECommerceTenancySettingsSubCollapsible(
    resolveLanguageKey: ResolveLanguageKey,
): NavSubCollapsible {
    return {
        title: resolveLanguageKey("menus.tenancy.systemSettings.eCommerce.title"),
        icon: IconShoppingBag,
        permissions: [],
        usersPermissions: [],
        atLeastOnePermission: true,
        items: [
            {
                title: resolveLanguageKey("menus.tenancy.systemSettings.categories.title"),
                url: "/tenancy/systemSettings/categories",
                icon: IconCategory2,
                permissions: ["productcategories"],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
            {
                title: resolveLanguageKey("menus.tenancy.systemSettings.productattributes.title"),
                url: "/tenancy/systemSettings/productattributes",
                icon: IconTag,
                permissions: ["productAttributes"],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
            {
                title: resolveLanguageKey("menus.tenancy.systemSettings.productvariants.title"),
                url: "/tenancy/systemSettings/productvariants",
                icon: IconStack2,
                permissions: ["productVariants"],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
            {
                title: resolveLanguageKey("menus.tenancy.systemSettings.collections.title"),
                url: "/tenancy/systemSettings/collections",
                icon: IconBooks,
                permissions: ["productCollections"],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
            {
                title: resolveLanguageKey("menus.tenancy.systemSettings.customergroups.title"),
                url: "/tenancy/systemSettings/customergroups",
                icon: IconUsers,
                permissions: ["customerGroups"],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
            {
                title: resolveLanguageKey("menus.tenancy.systemSettings.customeraddresses.title"),
                url: "/tenancy/systemSettings/customeraddresses",
                icon: IconMapPin,
                // Buyers' address books (core, D163), read through the orders: both reads are needed.
                permissions: ["productOrders", "userAddresses"],
                usersPermissions: [],
                atLeastOnePermission: false,
            },
            {
                title: resolveLanguageKey("menus.tenancy.systemSettings.discounts.title"),
                url: "/tenancy/systemSettings/discounts",
                icon: IconPercentage,
                permissions: ["discounts"],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
            // Gift cards are issued by shop orders and spent at checkout: a shop's setting, though finance keeps the pages (TD-F153).
            {
                title: resolveLanguageKey("menus.tenancy.systemSettings.giftcards.title"),
                url: "/tenancy/systemSettings/giftcards",
                icon: IconGift,
                permissions: ["giftCards"],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
            {
                title: resolveLanguageKey("menus.tenancy.systemSettings.pricingrules.title"),
                url: "/tenancy/systemSettings/pricingrules",
                icon: IconCurrencyDollar,
                permissions: ["pricingRules"],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
            {
                title: resolveLanguageKey("menus.tenancy.systemSettings.taxzones.title"),
                url: "/tenancy/systemSettings/taxzones",
                icon: IconWorld,
                permissions: ["taxZones"],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
            {
                title: resolveLanguageKey("menus.tenancy.systemSettings.shippingzones.title"),
                url: "/tenancy/systemSettings/shippingzones",
                icon: IconTruck,
                permissions: ["shippingZones"],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
            {
                title: resolveLanguageKey("menus.tenancy.systemSettings.warehouses.title"),
                url: "/tenancy/systemSettings/warehouses",
                icon: IconBuildingWarehouse,
                permissions: ["warehouses"],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
            {
                title: resolveLanguageKey("menus.tenancy.systemSettings.cmsblocks.title"),
                url: "/tenancy/systemSettings/cmsblocks",
                icon: IconLayoutGrid,
                permissions: ["cmsBlocks"],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
            {
                title: resolveLanguageKey("menus.tenancy.systemSettings.externalImports.title"),
                icon: IconDownload,
                permissions: ["odooconnections"],
                usersPermissions: [],
                atLeastOnePermission: true,
                items: [
                    {
                        title: resolveLanguageKey("menus.tenancy.systemSettings.odooconnection.title"),
                        url: "/tenancy/systemSettings/odooconnection",
                        icon: IconPlug,
                        permissions: ["odooconnections"],
                        usersPermissions: [],
                        atLeastOnePermission: true,
                    },
                    {
                        title: resolveLanguageKey("menus.tenancy.systemSettings.odooimport.title"),
                        url: "/tenancy/systemSettings/odooimport",
                        icon: IconDownload,
                        permissions: ["odooconnections"],
                        usersPermissions: [],
                        atLeastOnePermission: true,
                    },
                ],
            },
            // The till's setup waits for fiscalization's certification, under "Coming soon" in the sidebar (D186)
            ...(FISCALIZATION_AVAILABLE ? [{
                title: resolveLanguageKey("menus.tenancy.systemSettings.pos.title"),
                icon: IconDeviceDesktop,
                // Shown to whoever may open any page below (TD-F151).
                permissions: ["posConfigs", "posPaymentMethods", "fiscalConfigs"],
                usersPermissions: [],
                atLeastOnePermission: true,
                items: [
                    {
                        title: resolveLanguageKey("menus.tenancy.systemSettings.posconfigs.title"),
                        url: "/tenancy/systemSettings/posconfigs",
                        icon: IconAdjustments,
                        permissions: ["posConfigs"],
                        usersPermissions: [],
                        atLeastOnePermission: true,
                    },
                    {
                        title: resolveLanguageKey("menus.tenancy.systemSettings.pospaymentmethods.title"),
                        url: "/tenancy/systemSettings/pospaymentmethods",
                        icon: IconCreditCard,
                        permissions: ["posPaymentMethods"],
                        usersPermissions: [],
                        atLeastOnePermission: true,
                    },
                    // The till signs its receipts with it (Albanian fiscalization): the shop's, though finance keeps the page (TD-F153).
                    {
                        title: resolveLanguageKey("menus.tenancy.systemSettings.fiscalconfigs.title"),
                        url: "/tenancy/systemSettings/fiscalconfigs",
                        icon: IconFileCertificate,
                        permissions: ["fiscalConfigs"],
                        usersPermissions: [],
                        atLeastOnePermission: true,
                    },
                ],
            }] : []),
        ],
    };
}
