import {
    ShoppingBag, Boxes, Warehouse, BarChart3, PackageCheck, Undo2, Star, Monitor, Receipt, Clock,
    ArrowLeftRight, Bookmark, Truck, ClipboardList, AlertTriangle, Gavel, Tag, Flag, Calendar, User, Package, Network,
} from "lucide-react";
import {IconListDetails} from "@tabler/icons-react";
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
                    {title: resolveLanguageKey("menus.eCommerce.analytics.title"), url: "/eCommerce/analytics", icon: BarChart3, permissions: ["productOrders", "products", "inventories", "carts"], usersPermissions: [], atLeastOnePermission: false},
                    {title: resolveLanguageKey("menus.eCommerce.productreviews.title"), url: "/eCommerce/productreviews", icon: Star, permissions: ["productReviews"], usersPermissions: [], atLeastOnePermission: true},
                    {title: resolveLanguageKey("menus.eCommerce.savedsearches.title"), url: "/eCommerce/savedsearches", icon: Bookmark, permissions: ["savedsearches"], usersPermissions: [], atLeastOnePermission: true},
                ],
            },
        ];

        const marketplaceItems: NavItem[] = [
            {title: resolveLanguageKey("menus.eCommerceMarketplace.marketplacesystemmap.title"), url: "/eCommerceMarketplace/marketplacesystemmap", icon: Network, permissions: ["listings"], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerceMarketplace.listings.title"), url: "/eCommerceMarketplace/listings", icon: IconListDetails, permissions: ["listings"], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerceMarketplace.listingaddons.title"), url: "/eCommerceMarketplace/listingaddons", icon: Package, permissions: ["listingaddons"], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerceMarketplace.listingpackages.title"), url: "/eCommerceMarketplace/listingpackages", icon: Package, permissions: ["listingpackages"], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerceMarketplace.listingflags.title"), url: "/eCommerceMarketplace/listingflags", icon: Flag, permissions: ["listingflags"], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerceMarketplace.promotions.title"), url: "/eCommerceMarketplace/promotions", icon: Tag, permissions: ["promotions"], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerceMarketplace.taskrequests.title"), url: "/eCommerceMarketplace/taskrequests", icon: ClipboardList, permissions: ["taskRequests"], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerceMarketplace.bids.title"), url: "/eCommerceMarketplace/bids", icon: Gavel, permissions: ["marketplacebids"], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerceMarketplace.orders.title"), url: "/eCommerceMarketplace/orders", icon: ShoppingBag, permissions: ["orders"], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerceMarketplace.disputes.title"), url: "/eCommerceMarketplace/disputes", icon: AlertTriangle, permissions: ["disputes"], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerceMarketplace.reviews.title"), url: "/eCommerceMarketplace/reviews", icon: Star, permissions: ["reviews"], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerceMarketplace.bookings.title"), url: "/eCommerceMarketplace/bookings", icon: Calendar, permissions: ["bookings"], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerceMarketplace.providerprofile.title"), url: "/eCommerceMarketplace/providerprofile", icon: User, permissions: ["providerprofiles"], usersPermissions: [], atLeastOnePermission: true},
        ];

        return [
            {
                title: resolveLanguageKey("menus.eCommerce.productCommerce.title"),
                permissions: [],
                usersPermissions: [],
                atLeastOnePermission: true,
                items: productCommerceItems,
            },
            {
                title: resolveLanguageKey("menus.eCommerceMarketplace.title"),
                permissions: [],
                usersPermissions: [],
                atLeastOnePermission: true,
                items: marketplaceItems,
            },
        ];
    },
};

export default eCommerceSidebarContribution;
