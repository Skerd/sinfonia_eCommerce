import {IconBookmark} from "@tabler/icons-react";
import type {AccountSettingsContribution} from "@coreModule/helpers/types/accountSettingsContribution.types.ts";
import AllSavedSearches from "@eCommerceModule/clients/panel/private/savedSearches/index.tsx";

const eCommerceAccountSettingsContribution: AccountSettingsContribution = {
    id: "eCommerce",
    order: 30,
    getPages({specificUserId}) {
        return [
            {
                id: "savedsearches",
                titleKey: "savedsearches",
                icon: <IconBookmark size={18} />,
                render: () => <AllSavedSearches specificUserId={specificUserId} />,
            },
        ];
    },
};

export default eCommerceAccountSettingsContribution;
