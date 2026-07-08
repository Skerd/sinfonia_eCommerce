import {ShoppingBag} from "lucide-react";
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
        ],
    };
}
