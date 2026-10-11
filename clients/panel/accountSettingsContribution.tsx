import {Bookmark, MapPin} from "lucide-react";
import type {AccountSettingsContribution} from "@coreModule/helpers/types/accountSettingsContribution.types.ts";
import AllCustomerAddresses from "@eCommerceModule/clients/panel/private/customerAddresses/index.tsx";
import AllSavedSearches from "@eCommerceModule/clients/panel/private/savedSearches/index.tsx";

const eCommerceAccountSettingsContribution: AccountSettingsContribution = {
    id: "eCommerce",
    order: 30,
    getPages({specificUserId}) {
        return [
            {
                id: "addresses",
                titleKey: "addresses",
                icon: <MapPin size={18} />,
                render: () => <AllCustomerAddresses specificUserId={specificUserId} />,
            },
            {
                id: "savedsearches",
                titleKey: "savedsearches",
                icon: <Bookmark size={18} />,
                render: () => <AllSavedSearches specificUserId={specificUserId} />,
            },
        ];
    },
};

export default eCommerceAccountSettingsContribution;
