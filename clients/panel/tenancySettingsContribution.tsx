import type {TenancySettingsContribution} from "@coreModule/clients/panel/moduleContributions/tenancySettingsContribution.types.ts";
import {buildECommerceTenancySettingsSubCollapsible} from "@eCommerceModule/clients/panel/eCommerceTenancyNav.ts";

const eCommerceTenancySettingsContribution: TenancySettingsContribution = {
    id: "eCommerce",
    order: 40,
    getTenancySettingsItems: buildECommerceTenancySettingsSubCollapsible,
};

export default eCommerceTenancySettingsContribution;
