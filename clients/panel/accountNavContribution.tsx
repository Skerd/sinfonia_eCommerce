import {Bookmark, MapPin} from "lucide-react";
import type {AccountNavContribution} from "@coreModule/helpers/types/accountNavContribution.types.ts";

const eCommerceAccountNavContribution: AccountNavContribution = {
    id: "eCommerce",
    order: 30,
    getAccountNavItems(resolveLanguageKey) {
        return [
            {
                title: resolveLanguageKey("menus.eCommerce.customeraddresses.title"),
                url: "/account/addresses",
                icon: MapPin,
                permissions: ["customerAddresses"],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
            {
                title: resolveLanguageKey("menus.eCommerce.savedsearches.title"),
                url: "/account/savedsearches",
                icon: Bookmark,
                permissions: ["savedsearches"],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
        ];
    },
};

export default eCommerceAccountNavContribution;
