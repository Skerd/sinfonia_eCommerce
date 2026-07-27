import {ShoppingBag, Boxes, Warehouse, LayoutGrid, BarChart3, PackageCheck, Undo2, CreditCard, MapPin, Star, Gift, Network, Monitor, Receipt, Clock, FileBadge, ClipboardCheck, ClipboardX, ArrowLeftRight} from "lucide-react";
import type {SidebarContribution} from "@coreModule/clients/panel/moduleContributions/sidebarContribution.types.ts";
import type {NavGroup, NavItem} from "@coreModule/helpers/panel/sidebarNav.types.ts";
import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";

const eCommerceSidebarContribution: SidebarContribution = {
    id: "eCommerce",
    order: 35,
    getNavGroups(resolveLanguageKey: ResolveLanguageKey): NavGroup[] {
        const productCommerceItems: NavItem[] = [
            {title: resolveLanguageKey("menus.eCommerce.systemMap.title"), url: "/eCommerce/systemmap", icon: Network, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            // TEMP: nest under "Checked Temp" while verifying language/UI fixes — revert when done
            {
                title: "Checked Temp",
                icon: ClipboardCheck,
                permissions: [],
                usersPermissions: [],
                atLeastOnePermission: true,
                items: [
                    {title: resolveLanguageKey("menus.eCommerce.products.title"), url: "/eCommerce/products", icon: Boxes, permissions: [], usersPermissions: [], atLeastOnePermission: true},
                    {title: resolveLanguageKey("menus.eCommerce.collections.title"), url: "/eCommerce/collections", icon: LayoutGrid, permissions: [], usersPermissions: [], atLeastOnePermission: true},
                    {title: resolveLanguageKey("menus.eCommerce.productorders.title"), url: "/eCommerce/productorders", icon: ShoppingBag, permissions: [], usersPermissions: [], atLeastOnePermission: true},
                    {title: resolveLanguageKey("menus.eCommerce.posorders.title"), url: "/eCommerce/posorders", icon: Receipt, permissions: [], usersPermissions: [], atLeastOnePermission: true},
                    {title: resolveLanguageKey("menus.eCommerce.possessions.title"), url: "/eCommerce/possessions", icon: Clock, permissions: [], usersPermissions: [], atLeastOnePermission: true},
                    {title: resolveLanguageKey("menus.eCommerce.paymenttransactions.title"), url: "/eCommerce/paymenttransactions", icon: CreditCard, permissions: [], usersPermissions: [], atLeastOnePermission: true},
                    {title: resolveLanguageKey("menus.eCommerce.productreviews.title"), url: "/eCommerce/productreviews", icon: Star, permissions: [], usersPermissions: [], atLeastOnePermission: true},
                    {title: resolveLanguageKey("menus.eCommerce.returnrequests.title"), url: "/eCommerce/returnrequests", icon: Undo2, permissions: [], usersPermissions: [], atLeastOnePermission: true},
                    {title: resolveLanguageKey("menus.eCommerce.fulfillments.title"), url: "/eCommerce/fulfillments", icon: PackageCheck, permissions: [], usersPermissions: [], atLeastOnePermission: true},
                    {title: resolveLanguageKey("menus.eCommerce.customeraddresses.title"), url: "/eCommerce/customeraddresses", icon: MapPin, permissions: [], usersPermissions: [], atLeastOnePermission: true},
                    {title: resolveLanguageKey("menus.eCommerce.inventories.title"), url: "/eCommerce/inventories", icon: Warehouse, permissions: [], usersPermissions: [], atLeastOnePermission: true},
                    {title: resolveLanguageKey("menus.eCommerce.inventorymovements.title"), url: "/eCommerce/inventorymovements", icon: ArrowLeftRight, permissions: [], usersPermissions: [], atLeastOnePermission: true},
                    {title: resolveLanguageKey("menus.eCommerce.fiscalconfigs.title"), url: "/eCommerce/fiscalconfigs", icon: FileBadge, permissions: [], usersPermissions: [], atLeastOnePermission: true},
                    {title: resolveLanguageKey("menus.eCommerce.cmsblocks.title"), url: "/eCommerce/cmsblocks", icon: LayoutGrid, permissions: [], usersPermissions: [], atLeastOnePermission: true},
                    {title: resolveLanguageKey("menus.eCommerce.giftcards.title"), url: "/eCommerce/giftcards", icon: Gift, permissions: [], usersPermissions: [], atLeastOnePermission: true},
                    {title: resolveLanguageKey("menus.eCommerce.analytics.title"), url: "/eCommerce/analytics", icon: BarChart3, permissions: [], usersPermissions: [], atLeastOnePermission: true},
                ],
            },
            {
                title: "Not Checked",
                icon: ClipboardX,
                permissions: [],
                usersPermissions: [],
                atLeastOnePermission: true,
                items: [
                    {title: resolveLanguageKey("menus.eCommerce.pos.title"), url: "/eCommerce/pos", icon: Monitor, permissions: [], usersPermissions: [], atLeastOnePermission: true},
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
