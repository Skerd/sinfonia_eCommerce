import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createPricingRuleFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/pricingRule/createPricingRule.form.validator";
import type {CreatePricingRuleFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/pricingRule/pricingRule.schema-def";

export default createGenericCreatePage<CreatePricingRuleFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/pricingRules/createPricingRule.tsx",
    collectionName: "pricingRules",
    accessModel: "pricingRules",
    apiUrl: "/api/eCommerce/pricingRule",
    schema: createPricingRuleFormSchema,
    defaultValues: {
        name: "",
        type: "percentage_discount",
        value: 0,
        appliesTo: "all",
        priority: 0,
        customerGroups: [],
        targetIds: [],
    } as unknown as CreatePricingRuleFormType,
    successPath: "/tenancy/systemSettings/pricingrules",
    submitIcon: <IconPlus />,
});
