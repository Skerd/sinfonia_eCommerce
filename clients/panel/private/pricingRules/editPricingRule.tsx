import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editPricingRuleFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/pricingRule/editPricingRule.form.validator";
import type {PricingRule} from "armonia/src/modules/eCommerce/api/eCommerce/private/pricingRule/pricingRule.dto";
import type {EditPricingRuleFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/pricingRule/pricingRule.schema-def";

export default createGenericEditPage<PricingRule, EditPricingRuleFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/pricingRules/editPricingRule.tsx",
    collectionName: "pricingRules",
    accessModel: "pricingRules",
    apiUrl: "/api/eCommerce/pricingRule",
    schema: editPricingRuleFormSchema,
    mapEntityData: (data) => ({
        ...data,
        targetIds: data.targetIds ?? data.targetLabels?.map((t) => t._id),
        customerGroups: data.customerGroups ?? data.customerGroupLabels?.map((g) => g._id),
        startsAt: data.startsAt ? new Date(data.startsAt).toISOString().split("T")[0] : undefined,
        endsAt: data.endsAt ? new Date(data.endsAt).toISOString().split("T")[0] : undefined,
    }),
    submitIcon: <Save />,
});
