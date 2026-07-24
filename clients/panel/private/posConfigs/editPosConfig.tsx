import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editPosConfigFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/posConfig/editPosConfig.form.validator.ts";
import type {EditPosConfigFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/posConfig/posConfig.schema-def.ts";
import type {PosConfig} from "armonia/src/modules/eCommerce/api/eCommerce/private/posConfig/posConfig.dto.ts";

export default createGenericEditPage<PosConfig, EditPosConfigFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/posConfigs/editPosConfig.tsx",
    collectionName: "posConfigs",
    accessModel: "posConfigs",
    apiUrl: "/api/eCommerce/posConfig",
    schema: editPosConfigFormSchema,
    mapEntityData: (data) => ({
        ...data,
        paymentMethods: data.paymentMethods ?? data.paymentMethodLabels?.map((m) => m._id),
        warehouse: data.warehouse ?? data.warehouseLabel?._id,
        currency: data.currency ?? data.currencyLabel?._id,
        managerPin: "",
        clearManagerPin: false,
    }),
    submitIcon: <Save />,
});
