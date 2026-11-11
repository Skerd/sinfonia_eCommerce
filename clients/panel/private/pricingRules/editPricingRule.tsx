import {IconDeviceFloppy} from "@tabler/icons-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import {FORM_EXTRAS_OBJECT_ID_CHIP_LABEL_REFS} from "@coreModule/components/custom/inputs/objectIdChipsInput.tsx";
import {editPricingRuleFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/pricingRule/editPricingRule.form.validator";
import type {PricingRule} from "armonia/src/modules/eCommerce/api/eCommerce/private/pricingRule/pricingRule.dto";
import type {EditPricingRuleFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/pricingRule/pricingRule.schema-def";

const pricingRuleChipLabelState = {
    loadedId: null as string | null,
    targetIds: {current: {} as Record<string, string>},
    customerGroups: {current: {} as Record<string, string>},
};

function fillLabelMap(
    map: Record<string, string>,
    labels: {_id: string; name: string}[] | undefined,
) {
    for (const item of labels ?? []) {
        if (item?._id && item.name) map[item._id] = item.name;
    }
}

export default createGenericEditPage<PricingRule, EditPricingRuleFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/pricingRules/editPricingRule.tsx",
    collectionName: "pricingRules",
    accessModel: "pricingRules",
    apiUrl: "/api/eCommerce/pricingRule",
    schema: editPricingRuleFormSchema,
    mapEntityData: (data) => ({
        ...data,
        targetIds: data.targetIds ?? data.targets?.map((t) => t._id),
        customerGroups: data.customerGroups ?? data.customerGroupRefs?.map((g) => g._id),
    }),
    buildFormExtras: (_entityId, _params, entity) => {
        if (entity) {
            if (pricingRuleChipLabelState.loadedId !== entity._id) {
                pricingRuleChipLabelState.loadedId = entity._id;
                pricingRuleChipLabelState.targetIds.current = {};
                pricingRuleChipLabelState.customerGroups.current = {};
            }
            fillLabelMap(pricingRuleChipLabelState.targetIds.current, entity.targets);
            fillLabelMap(pricingRuleChipLabelState.customerGroups.current, entity.customerGroupRefs);
        }

        const targetOptions =
            entity?.targets
                ?.filter((t) => !!t?._id && !!t.name)
                .map((t) => ({value: t._id, label: t.name})) ?? [];
        const customerGroupOptions =
            entity?.customerGroupRefs
                ?.filter((g) => !!g?._id && !!g.name)
                .map((g) => ({value: g._id, label: g.name})) ?? [];

        return {
            targetIds: targetOptions,
            customerGroups: customerGroupOptions,
            [FORM_EXTRAS_OBJECT_ID_CHIP_LABEL_REFS]: {
                targetIds: pricingRuleChipLabelState.targetIds,
                customerGroups: pricingRuleChipLabelState.customerGroups,
            },
        };
    },
    submitIcon: <IconDeviceFloppy />,
});
