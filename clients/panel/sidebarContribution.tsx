import {ShoppingBag, Tag, DollarSign, Boxes, Warehouse, LayoutGrid, Percent, Truck, Globe, BarChart3, Users, PackageCheck, Undo2, CreditCard, Layers, MapPin, FolderTree, Star, Gift, Network, Monitor, Settings2, Receipt, Clock, FileBadge} from "lucide-react";
import type {SidebarContribution} from "@coreModule/clients/panel/moduleContributions/sidebarContribution.types.ts";
import type {NavGroup, NavItem} from "@coreModule/helpers/panel/sidebarNav.types.ts";
import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";

const eCommerceSidebarContribution: SidebarContribution = {
    id: "eCommerce",
    order: 35,
    getNavGroups(resolveLanguageKey: ResolveLanguageKey): NavGroup[] {
        const productCommerceItems: NavItem[] = [
            {title: resolveLanguageKey("menus.eCommerce.systemMap.title"), url: "/eCommerce/systemmap", icon: Network, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.escrowDashboard.title"), url: "/eCommerce/escrowdashboard", icon: DollarSign, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.pos.title"), url: "/eCommerce/pos", icon: Monitor, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.pospaymentmethods.title"), url: "/eCommerce/pospaymentmethods", icon: CreditCard, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.posconfigs.title"), url: "/eCommerce/posconfigs", icon: Settings2, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.possessions.title"), url: "/eCommerce/possessions", icon: Clock, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.posorders.title"), url: "/eCommerce/posorders", icon: Receipt, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.fiscalconfigs.title"), url: "/eCommerce/fiscalconfigs", icon: FileBadge, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.products.title"), url: "/eCommerce/products", icon: Boxes, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.collections.title"), url: "/eCommerce/collections", icon: LayoutGrid, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.categories.title"), url: "/eCommerce/categories", icon: FolderTree, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.productvariants.title"), url: "/eCommerce/productvariants", icon: Layers, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.productorders.title"), url: "/eCommerce/productorders", icon: ShoppingBag, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.fulfillments.title"), url: "/eCommerce/fulfillments", icon: PackageCheck, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.returnrequests.title"), url: "/eCommerce/returnrequests", icon: Undo2, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.paymenttransactions.title"), url: "/eCommerce/paymenttransactions", icon: CreditCard, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.inventories.title"), url: "/eCommerce/inventories", icon: Warehouse, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.warehouses.title"), url: "/eCommerce/warehouses", icon: Warehouse, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.productattributes.title"), url: "/eCommerce/productattributes", icon: Tag, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.discounts.title"), url: "/eCommerce/discounts", icon: Percent, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.taxzones.title"), url: "/eCommerce/taxzones", icon: Globe, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.shippingzones.title"), url: "/eCommerce/shippingzones", icon: Truck, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.cmsblocks.title"), url: "/eCommerce/cmsblocks", icon: LayoutGrid, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.customergroups.title"), url: "/eCommerce/customergroups", icon: Users, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.customeraddresses.title"), url: "/eCommerce/customeraddresses", icon: MapPin, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.productreviews.title"), url: "/eCommerce/productreviews", icon: Star, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.giftcards.title"), url: "/eCommerce/giftcards", icon: Gift, permissions: [], usersPermissions: [], atLeastOnePermission: true},
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
