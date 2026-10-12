import {ShoppingBag, Boxes, Warehouse, BarChart3, PackageCheck, Undo2, Star, Network, Monitor, Receipt, Clock, ArrowLeftRight, Bookmark, Truck, ClipboardList} from "lucide-react";
import type {SidebarContribution} from "@coreModule/helpers/types/sidebarContribution.types.ts";
import type {NavGroup, NavItem} from "@coreModule/helpers/types/sidebarNav.types.ts";
import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {registerECommerceRefSelects} from "armonia/src/modules/eCommerce/database/filter/refSelect.ts";

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
                icon: Boxes,
                permissions: ["products"],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
            {
                title: resolveLanguageKey("menus.eCommerce.orders.title"),
                icon: ShoppingBag,
                ...emptyGuard,
                items: [
                    {title: resolveLanguageKey("menus.eCommerce.productorders.title"), url: "/eCommerce/productorders", icon: ShoppingBag, permissions: ["productOrders"], usersPermissions: [], atLeastOnePermission: true},
                    {title: resolveLanguageKey("menus.eCommerce.fulfillments.title"), url: "/eCommerce/fulfillments", icon: PackageCheck, permissions: ["fulfillments"], usersPermissions: [], atLeastOnePermission: true},
                    {title: resolveLanguageKey("menus.eCommerce.returnrequests.title"), url: "/eCommerce/returnrequests", icon: Undo2, permissions: ["returnRequests"], usersPermissions: [], atLeastOnePermission: true},
                ],
            },
            {
                title: resolveLanguageKey("menus.eCommerce.posGroup.title"),
                icon: Monitor,
                ...emptyGuard,
                items: [
                    {title: resolveLanguageKey("menus.eCommerce.pos.title"), url: "/eCommerce/pos", icon: Monitor, permissions: ["posOrders"], usersPermissions: [], atLeastOnePermission: true},
                    {title: resolveLanguageKey("menus.eCommerce.posorders.title"), url: "/eCommerce/posorders", icon: Receipt, permissions: ["posOrders"], usersPermissions: [], atLeastOnePermission: true},
                    {title: resolveLanguageKey("menus.eCommerce.possessions.title"), url: "/eCommerce/possessions", icon: Clock, permissions: ["posSessions"], usersPermissions: [], atLeastOnePermission: true},
                ],
            },
            {
                title: resolveLanguageKey("menus.eCommerce.stock.title"),
                icon: Warehouse,
                ...emptyGuard,
                items: [
                    {title: resolveLanguageKey("menus.eCommerce.inventories.title"), url: "/eCommerce/inventories", icon: Warehouse, permissions: ["inventories"], usersPermissions: [], atLeastOnePermission: true},
                    {title: resolveLanguageKey("menus.eCommerce.inventorymovements.title"), url: "/eCommerce/inventorymovements", icon: ArrowLeftRight, permissions: ["inventoryMovements"], usersPermissions: [], atLeastOnePermission: true},
                    {title: resolveLanguageKey("menus.eCommerce.stocktransfers.title"), url: "/eCommerce/stocktransfers", icon: Truck, permissions: ["stockTransfers"], usersPermissions: [], atLeastOnePermission: true},
                    {title: resolveLanguageKey("menus.eCommerce.stockcounts.title"), url: "/eCommerce/stockcounts", icon: ClipboardList, permissions: ["stockCounts"], usersPermissions: [], atLeastOnePermission: true},
                ],
            },
            {
                title: resolveLanguageKey("menus.eCommerce.insight.title"),
                icon: BarChart3,
                ...emptyGuard,
                items: [
                    {title: resolveLanguageKey("menus.eCommerce.analytics.title"), url: "/eCommerce/analytics", icon: BarChart3, permissions: [], usersPermissions: [], atLeastOnePermission: true},
                    {title: resolveLanguageKey("menus.eCommerce.productreviews.title"), url: "/eCommerce/productreviews", icon: Star, permissions: ["productReviews"], usersPermissions: [], atLeastOnePermission: true},
                    {title: resolveLanguageKey("menus.eCommerce.savedsearches.title"), url: "/eCommerce/savedsearches", icon: Bookmark, permissions: ["savedsearches"], usersPermissions: [], atLeastOnePermission: true},
                    {title: resolveLanguageKey("menus.eCommerce.systemMap.title"), url: "/eCommerce/systemmap", icon: Network, permissions: ["products"], usersPermissions: [], atLeastOnePermission: true},
                ],
            },
        ];

        return [{
            title: resolveLanguageKey("menus.eCommerce.productCommerce.title"),
            permissions: [],
            usersPermissions: [],
            atLeastOnePermission: true,
            items: productCommerceItems,
        }];
    },
};

export default eCommerceSidebarContribution;
