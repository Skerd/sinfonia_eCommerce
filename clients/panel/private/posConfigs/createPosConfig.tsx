import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createPosConfigFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/posConfig/createPosConfig.form.validator.ts";
import type {CreatePosConfigFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/posConfig/posConfig.schema-def.ts";

export default createGenericCreatePage<CreatePosConfigFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/posConfigs/createPosConfig.tsx",
    collectionName: "posConfigs",
    accessModel: "posConfigs",
    apiUrl: "/api/eCommerce/posConfig",
    schema: createPosConfigFormSchema,
    defaultValues: {
        name: "",
        ifaceBarcodeScanner: true,
        ifaceCashControl: true,
        allowDiscount: true,
        allowQuantityChange: true,
        allowOversell: false,
        pinForDiscount: false,
        pinForCashOut: false,
        pinForRefund: false,
        isActive: true,
    } as unknown as CreatePosConfigFormType,
    successPath: "/eCommerce/posconfigs",
    submitIcon: <IconPlus />,
});
