import {IconBookmark, IconMapPin} from "@tabler/icons-react";
import type {AccountNavContribution} from "@coreModule/helpers/types/accountNavContribution.types.ts";

const eCommerceAccountNavContribution: AccountNavContribution = {
    id: "eCommerce",
    order: 30,
    getAccountNavItems(resolveLanguageKey) {
        return [
            {
                title: resolveLanguageKey("menus.eCommerce.customeraddresses.title"),
                url: "/account/addresses",
                icon: IconMapPin,
                permissions: ["customerAddresses"],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
            {
                title: resolveLanguageKey("menus.eCommerce.savedsearches.title"),
                url: "/account/savedsearches",
                icon: IconBookmark,
                permissions: ["savedsearches"],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
        ];
    },
};

export default eCommerceAccountNavContribution;
