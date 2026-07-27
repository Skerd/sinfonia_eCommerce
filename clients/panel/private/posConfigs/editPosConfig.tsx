import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {FORM_EXTRAS_OBJECT_ID_CHIP_LABEL_REFS} from "@coreModule/components/custom/formObjectIdChips.tsx";
import {editPosConfigFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/posConfig/editPosConfig.form.validator.ts";
import type {EditPosConfigFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/posConfig/posConfig.schema-def.ts";
import type {PosConfig, PosConfigManager} from "armonia/src/modules/eCommerce/api/eCommerce/private/posConfig/posConfig.dto.ts";

const posConfigChipLabelState = {
    loadedId: null as string | null,
    paymentMethods: {current: {} as Record<string, string>},
    managers: {current: {} as Record<string, string>},
    warehouses: {current: {} as Record<string, string>},
};

function managerDisplayName(m: PosConfigManager): string {
    const full = [m.name, m.surname].filter(Boolean).join(" ").trim();
    return full || m.username || m._id;
}

export default createGenericEditPage<PosConfig, EditPosConfigFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/posConfigs/editPosConfig.tsx",
    collectionName: "posConfigs",
    accessModel: "posConfigs",
    apiUrl: "/api/eCommerce/posConfig",
    schema: editPosConfigFormSchema,
    mapEntityData: (data) => ({
        ...data,
        paymentMethods: data.paymentMethods ?? data.paymentMethodLabels?.map((m) => m._id),
        managers: data.managers?.map((m) => m._id) ?? [],
        warehouses: data.warehouses?.map((w) => w._id) ?? [],
        currency: data.currency?._id,
    }),
    buildFormExtras: (_entityId, _params, entity) => {
        if (entity) {
            if (posConfigChipLabelState.loadedId !== entity._id) {
                posConfigChipLabelState.loadedId = entity._id;
                posConfigChipLabelState.paymentMethods.current = {};
                posConfigChipLabelState.managers.current = {};
                posConfigChipLabelState.warehouses.current = {};
            }
            for (const method of entity.paymentMethodLabels ?? []) {
                if (method?._id && method.name) {
                    posConfigChipLabelState.paymentMethods.current[method._id] = method.name;
                }
            }
            for (const manager of entity.managers ?? []) {
                if (manager?._id) {
                    posConfigChipLabelState.managers.current[manager._id] = managerDisplayName(manager);
                }
            }
            for (const warehouse of entity.warehouses ?? []) {
                if (warehouse?._id && warehouse.name) {
                    posConfigChipLabelState.warehouses.current[warehouse._id] = warehouse.code
                        ? `${warehouse.name} (${warehouse.code})`
                        : warehouse.name;
                }
            }
        }
        const paymentMethodOptions =
            entity?.paymentMethodLabels
                ?.filter((m) => !!m?._id && !!m.name)
                .map((m) => ({value: m._id, label: m.name})) ?? [];
        const managerOptions =
            entity?.managers
                ?.filter((m) => !!m?._id)
                .map((m) => ({value: m._id, label: managerDisplayName(m)})) ?? [];
        const warehouseOptions =
            entity?.warehouses
                ?.filter((w) => !!w?._id && !!w.name)
                .map((w) => ({
                    value: w._id,
                    label: w.code ? `${w.name} (${w.code})` : w.name,
                })) ?? [];
        return {
            hasManagerPin: !!entity?.hasManagerPin,
            paymentMethods: paymentMethodOptions,
            managers: managerOptions,
            warehouses: warehouseOptions,
            [FORM_EXTRAS_OBJECT_ID_CHIP_LABEL_REFS]: {
                paymentMethods: posConfigChipLabelState.paymentMethods,
                managers: posConfigChipLabelState.managers,
                warehouses: posConfigChipLabelState.warehouses,
            },
        };
    },
    submitIcon: <Save />,
});
