import {ShoppingBag, Tag, DollarSign, Boxes, Warehouse, LayoutGrid, Percent, Truck, Globe, BarChart3, Users} from "lucide-react";
import type {SidebarContribution} from "@coreModule/clients/panel/moduleContributions/sidebarContribution.types.ts";
import type {NavGroup, NavItem} from "@coreModule/helpers/panel/sidebarNav.types.ts";
import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";

const eCommerceSidebarContribution: SidebarContribution = {
    id: "eCommerce",
    order: 35,
    getNavGroups(resolveLanguageKey: ResolveLanguageKey): NavGroup[] {
        const productCommerceItems: NavItem[] = [
            {title: resolveLanguageKey("menus.eCommerce.escrowDashboard.title"), url: "/eCommerce/escrowdashboard", icon: DollarSign, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.products.title"), url: "/eCommerce/products", icon: Boxes, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.collections.title"), url: "/eCommerce/collections", icon: LayoutGrid, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.productorders.title"), url: "/eCommerce/productorders", icon: ShoppingBag, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.inventories.title"), url: "/eCommerce/inventories", icon: Warehouse, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.warehouses.title"), url: "/eCommerce/warehouses", icon: Warehouse, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.productattributes.title"), url: "/eCommerce/productattributes", icon: Tag, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.discounts.title"), url: "/eCommerce/discounts", icon: Percent, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.taxzones.title"), url: "/eCommerce/taxzones", icon: Globe, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.shippingzones.title"), url: "/eCommerce/shippingzones", icon: Truck, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.cmsblocks.title"), url: "/eCommerce/cmsblocks", icon: LayoutGrid, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.customergroups.title"), url: "/eCommerce/customergroups", icon: Users, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.pricingrules.title"), url: "/eCommerce/pricingrules", icon: DollarSign, permissions: [], usersPermissions: [], atLeastOnePermission: true},
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
