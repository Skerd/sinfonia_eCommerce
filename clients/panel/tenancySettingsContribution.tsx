import type {TenancySettingsContribution} from "@coreModule/helpers/types/tenancySettingsContribution.types.ts";
import {buildECommerceTenancySettingsSubCollapsible} from "@eCommerceModule/clients/panel/eCommerceTenancyNav.ts";

const eCommerceTenancySettingsContribution: TenancySettingsContribution = {
    id: "eCommerce",
    order: 40,
    getTenancySettingsItems: buildECommerceTenancySettingsSubCollapsible,
};

export default eCommerceTenancySettingsContribution;
