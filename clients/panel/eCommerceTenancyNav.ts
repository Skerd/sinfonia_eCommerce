import {CreditCard, DollarSign, FileBadge, Globe, Layers, LayoutGrid, Monitor, Percent, Settings2, ShoppingBag, Tag, Truck, Users, Warehouse} from "lucide-react";
import {IconCategory2} from "@tabler/icons-react";
import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";
import type {NavSubCollapsible} from "@coreModule/helpers/panel/sidebarNav.types.ts";

/** Nested under Tenancy → Configurations (owned by eCommerce). */
export function buildECommerceTenancySettingsSubCollapsible(
    resolveLanguageKey: ResolveLanguageKey,
): NavSubCollapsible {
    return {
        title: resolveLanguageKey("menus.tenancy.systemSettings.eCommerce.title"),
        icon: ShoppingBag,
        permissions: [],
        usersPermissions: [],
        atLeastOnePermission: true,
        items: [
            {
                title: resolveLanguageKey("menus.tenancy.systemSettings.categories.title"),
                url: "/tenancy/systemSettings/categories",
                icon: IconCategory2,
                permissions: [],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
            {
                title: resolveLanguageKey("menus.tenancy.systemSettings.productattributes.title"),
                url: "/tenancy/systemSettings/productattributes",
                icon: Tag,
                permissions: [],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
            {
                title: resolveLanguageKey("menus.tenancy.systemSettings.productvariants.title"),
                url: "/tenancy/systemSettings/productvariants",
                icon: Layers,
                permissions: [],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
            {
                title: resolveLanguageKey("menus.tenancy.systemSettings.customergroups.title"),
                url: "/tenancy/systemSettings/customergroups",
                icon: Users,
                permissions: [],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
            {
                title: resolveLanguageKey("menus.tenancy.systemSettings.discounts.title"),
                url: "/tenancy/systemSettings/discounts",
                icon: Percent,
                permissions: [],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
            {
                title: resolveLanguageKey("menus.tenancy.systemSettings.pricingrules.title"),
                url: "/tenancy/systemSettings/pricingrules",
                icon: DollarSign,
                permissions: [],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
            {
                title: resolveLanguageKey("menus.tenancy.systemSettings.taxzones.title"),
                url: "/tenancy/systemSettings/taxzones",
                icon: Globe,
                permissions: [],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
            {
                title: resolveLanguageKey("menus.tenancy.systemSettings.shippingzones.title"),
                url: "/tenancy/systemSettings/shippingzones",
                icon: Truck,
                permissions: [],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
            {
                title: resolveLanguageKey("menus.tenancy.systemSettings.warehouses.title"),
                url: "/tenancy/systemSettings/warehouses",
                icon: Warehouse,
                permissions: [],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
            {
                title: resolveLanguageKey("menus.tenancy.systemSettings.fiscalconfigs.title"),
                url: "/tenancy/systemSettings/fiscalconfigs",
                icon: FileBadge,
                permissions: [],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
            {
                title: resolveLanguageKey("menus.tenancy.systemSettings.cmsblocks.title"),
                url: "/tenancy/systemSettings/cmsblocks",
                icon: LayoutGrid,
                permissions: [],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
            {
                title: resolveLanguageKey("menus.tenancy.systemSettings.pos.title"),
                icon: Monitor,
                permissions: [],
                usersPermissions: [],
                atLeastOnePermission: true,
                items: [
                    {
                        title: resolveLanguageKey("menus.tenancy.systemSettings.posconfigs.title"),
                        url: "/tenancy/systemSettings/posconfigs",
                        icon: Settings2,
                        permissions: [],
                        usersPermissions: [],
                        atLeastOnePermission: true,
                    },
                    {
                        title: resolveLanguageKey("menus.tenancy.systemSettings.pospaymentmethods.title"),
                        url: "/tenancy/systemSettings/pospaymentmethods",
                        icon: CreditCard,
                        permissions: [],
                        usersPermissions: [],
                        atLeastOnePermission: true,
                    },
                ],
            },
        ],
    };
}
