import {IconShoppingBag, IconBoxMultiple, IconBuildingWarehouse, IconChartBar, IconPackageImport, IconArrowBackUp, IconStar, IconDeviceDesktop, IconReceipt, IconClock, IconArrowsLeftRight, IconBookmark, IconTruck, IconClipboardList, IconFileCertificate} from "@tabler/icons-react";
import type {SidebarContribution} from "@coreModule/helpers/types/sidebarContribution.types.ts";
import type {NavGroup, NavItem} from "@coreModule/helpers/types/sidebarNav.types.ts";
import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {registerECommerceRefSelects} from "armonia/src/modules/eCommerce/database/filter/refSelect.ts";
import {FISCALIZATION_AVAILABLE} from "armonia/src/modules/finance/helpers/fiscalAvailability.ts";

registerECommerceRefSelects();

const emptyGuard = {permissions: [] as string[], usersPermissions: [] as string[], atLeastOnePermission: true};

const eCommerceSidebarContribution: SidebarContribution = {
    id: "eCommerce",
    order: 35,
    getNavGroups(resolveLanguageKey: ResolveLanguageKey): NavGroup[] {
        const productCommerceItems: NavItem[] = [
            {
                title: resolveLanguageKey("menus.eCommerce.products.title"),
                url: "/eCommerce/products",
                icon: IconBoxMultiple,
                permissions: ["products"],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
            {
                title: resolveLanguageKey("menus.eCommerce.orders.title"),
                icon: IconShoppingBag,
                ...emptyGuard,
                items: [
                    {title: resolveLanguageKey("menus.eCommerce.productorders.title"), url: "/eCommerce/productorders", icon: IconShoppingBag, permissions: ["productOrders"], usersPermissions: [], atLeastOnePermission: true},
                    {title: resolveLanguageKey("menus.eCommerce.fulfillments.title"), url: "/eCommerce/fulfillments", icon: IconPackageImport, permissions: ["fulfillments"], usersPermissions: [], atLeastOnePermission: true},
                    {title: resolveLanguageKey("menus.eCommerce.returnrequests.title"), url: "/eCommerce/returnrequests", icon: IconArrowBackUp, permissions: ["returnRequests"], usersPermissions: [], atLeastOnePermission: true},
                ],
            },
            // The till waits for fiscalization's certification, under "Coming soon" below (D186)
            ...(FISCALIZATION_AVAILABLE ? [{
                title: resolveLanguageKey("menus.eCommerce.posGroup.title"),
                icon: IconDeviceDesktop,
                ...emptyGuard,
                items: [
                    {title: resolveLanguageKey("menus.eCommerce.pos.title"), url: "/eCommerce/pos", icon: IconDeviceDesktop, permissions: ["posOrders"], usersPermissions: [], atLeastOnePermission: true},
                    {title: resolveLanguageKey("menus.eCommerce.posorders.title"), url: "/eCommerce/posorders", icon: IconReceipt, permissions: ["posOrders"], usersPermissions: [], atLeastOnePermission: true},
                    {title: resolveLanguageKey("menus.eCommerce.possessions.title"), url: "/eCommerce/possessions", icon: IconClock, permissions: ["posSessions"], usersPermissions: [], atLeastOnePermission: true},
                ],
            }] : []),
            {
                title: resolveLanguageKey("menus.eCommerce.stock.title"),
                icon: IconBuildingWarehouse,
                ...emptyGuard,
                items: [
                    {title: resolveLanguageKey("menus.eCommerce.inventories.title"), url: "/eCommerce/inventories", icon: IconBuildingWarehouse, permissions: ["inventories"], usersPermissions: [], atLeastOnePermission: true},
                    {title: resolveLanguageKey("menus.eCommerce.inventorymovements.title"), url: "/eCommerce/inventorymovements", icon: IconArrowsLeftRight, permissions: ["inventoryMovements"], usersPermissions: [], atLeastOnePermission: true},
                    {title: resolveLanguageKey("menus.eCommerce.stocktransfers.title"), url: "/eCommerce/stocktransfers", icon: IconTruck, permissions: ["stockTransfers"], usersPermissions: [], atLeastOnePermission: true},
                    {title: resolveLanguageKey("menus.eCommerce.stockcounts.title"), url: "/eCommerce/stockcounts", icon: IconClipboardList, permissions: ["stockCounts"], usersPermissions: [], atLeastOnePermission: true},
                ],
            },
            {
                title: resolveLanguageKey("menus.eCommerce.insight.title"),
                icon: IconChartBar,
                ...emptyGuard,
                items: [
                    {title: resolveLanguageKey("menus.eCommerce.analytics.title"), url: "/eCommerce/analytics", icon: IconChartBar, permissions: ["productOrders", "products", "inventories", "carts"], usersPermissions: [], atLeastOnePermission: false},
                    {title: resolveLanguageKey("menus.eCommerce.productreviews.title"), url: "/eCommerce/productreviews", icon: IconStar, permissions: ["productReviews"], usersPermissions: [], atLeastOnePermission: true},
                    {title: resolveLanguageKey("menus.eCommerce.savedsearches.title"), url: "/eCommerce/savedsearches", icon: IconBookmark, permissions: ["savedsearches"], usersPermissions: [], atLeastOnePermission: true},
                ],
            },
        ];

        const groups: NavGroup[] = [
            {
                title: resolveLanguageKey("menus.eCommerce.productCommerce.title"),
                permissions: [],
                usersPermissions: [],
                atLeastOnePermission: true,
                items: productCommerceItems,
            },
        ];
        if (!FISCALIZATION_AVAILABLE) {
            // Both open once Arpeggio is certified as fiscal software (D186); each link shows what is coming
            const soon = resolveLanguageKey("menus.eCommerce.comingSoon.badge");
            groups.push({
                title: resolveLanguageKey("menus.eCommerce.comingSoon.title"),
                permissions: [],
                usersPermissions: [],
                atLeastOnePermission: true,
                items: [
                    {title: resolveLanguageKey("menus.eCommerce.posGroup.title"), url: "/eCommerce/pos", icon: IconDeviceDesktop, badge: soon, permissions: ["posOrders", "posConfigs"], usersPermissions: [], atLeastOnePermission: true},
                    {title: resolveLanguageKey("menus.tenancy.systemSettings.fiscalconfigs.title"), url: "/tenancy/systemSettings/fiscalconfigs", icon: IconFileCertificate, badge: soon, permissions: ["fiscalConfigs"], usersPermissions: [], atLeastOnePermission: true},
                ],
            });
        }
        return groups;
    },
};

export default eCommerceSidebarContribution;
