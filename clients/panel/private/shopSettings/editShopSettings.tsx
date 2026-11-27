import {IconDeviceFloppy} from "@tabler/icons-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import {FORM_EXTRAS_OBJECT_ID_CHIP_LABEL_REFS} from "@coreModule/components/custom/inputs/objectIdChipsInput.tsx";
import {editShopSettingsFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/shopSettings/editShopSettings.form.validator.ts";
import type {EditShopSettingsFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/shopSettings/shopSettings.schema-def.ts";
import type {ShopSettings} from "armonia/src/modules/eCommerce/api/eCommerce/private/shopSettings/shopSettings.dto.ts";

const chipLabelState = {
    loadedId: null as string | null,
    branches: {current: {} as Record<string, string>},
};

export default createGenericEditPage<ShopSettings, EditShopSettingsFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/shopSettings/editShopSettings.tsx",
    collectionName: "shopsettings",
    accessModel: "shopsettings",
    apiUrl: "/api/eCommerce/shopSettings",
    schema: editShopSettingsFormSchema,
    mapEntityData: (data) => ({...data, branches: data.branches?.map((branch) => branch._id) ?? []}),
    buildFormExtras: (_entityId, _params, entity) => {
        if (entity && chipLabelState.loadedId !== entity._id) {
            chipLabelState.loadedId = entity._id;
            chipLabelState.branches.current = {};
        }
        const branches = entity?.branches ?? [];
        for (const branch of branches) chipLabelState.branches.current[branch._id] = branch.name;
        return {
            branches: branches.map((branch) => ({value: branch._id, label: branch.name})),
            [FORM_EXTRAS_OBJECT_ID_CHIP_LABEL_REFS]: {branches: chipLabelState.branches},
        };
    },
    submitIcon: <IconDeviceFloppy />,
    stayAfterSave: true,
});
