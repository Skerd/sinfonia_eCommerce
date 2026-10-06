import {MapPin} from "lucide-react";
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
                permissions: [],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
        ];
    },
};

export default eCommerceAccountNavContribution;
