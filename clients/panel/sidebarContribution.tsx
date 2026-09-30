import {ShoppingBag, Boxes, Warehouse, LayoutGrid, BarChart3, PackageCheck, Undo2, MapPin, Star, Network, Monitor, Receipt, Clock, ArrowLeftRight} from "lucide-react";
import type {SidebarContribution} from "@coreModule/helpers/types/sidebarContribution.types.ts";
import type {NavGroup, NavItem} from "@coreModule/helpers/types/sidebarNav.types.ts";
import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {registerECommerceRefSelects} from "armonia/src/modules/eCommerce/database/filter/refSelect.ts";

registerECommerceRefSelects();

const eCommerceSidebarContribution: SidebarContribution = {
    id: "eCommerce",
    order: 35,
    getNavGroups(resolveLanguageKey: ResolveLanguageKey): NavGroup[] {
        const productCommerceItems: NavItem[] = [
            {title: resolveLanguageKey("menus.eCommerce.systemMap.title"), url: "/eCommerce/systemmap", icon: Network, permissions: ["productReviews"], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.products.title"), url: "/eCommerce/products", icon: Boxes, permissions: ["products"], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.collections.title"), url: "/eCommerce/collections", icon: LayoutGrid, permissions: ["productCollections"], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.productorders.title"), url: "/eCommerce/productorders", icon: ShoppingBag, permissions: ["productOrders"], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.pos.title"), url: "/eCommerce/pos", icon: Monitor, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.posorders.title"), url: "/eCommerce/posorders", icon: Receipt, permissions: ["posOrders"], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.possessions.title"), url: "/eCommerce/possessions", icon: Clock, permissions: ["posSessions"], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.productreviews.title"), url: "/eCommerce/productreviews", icon: Star, permissions: ["returnRequests"], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.returnrequests.title"), url: "/eCommerce/returnrequests", icon: Undo2, permissions: ["fulfillments"], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.fulfillments.title"), url: "/eCommerce/fulfillments", icon: PackageCheck, permissions: ["customerAddresses"], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.customeraddresses.title"), url: "/eCommerce/customeraddresses", icon: MapPin, permissions: ["inventories"], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.inventories.title"), url: "/eCommerce/inventories", icon: Warehouse, permissions: ["inventoryMovements"], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.inventorymovements.title"), url: "/eCommerce/inventorymovements", icon: ArrowLeftRight, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.analytics.title"), url: "/eCommerce/analytics", icon: BarChart3, permissions: [], usersPermissions: [], atLeastOnePermission: true},
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
