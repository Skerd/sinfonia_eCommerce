import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editFiscalConfigFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/fiscalConfig/editFiscalConfig.form.validator.ts";
import type {EditFiscalConfigFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/fiscalConfig/fiscalConfig.schema-def.ts";
import type {FiscalConfig} from "armonia/src/modules/eCommerce/api/eCommerce/private/fiscalConfig/fiscalConfig.dto.ts";

export default createGenericEditPage<FiscalConfig, EditFiscalConfigFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/fiscalConfigs/editFiscalConfig.tsx",
    collectionName: "fiscalConfigs",
    accessModel: "fiscalConfigs",
    apiUrl: "/api/eCommerce/fiscalConfig",
    schema: editFiscalConfigFormSchema,
    mapEntityData: data => ({
        ...data,
        certificateBase64: "",
        certificatePassword: "",
        clearCertificate: false,
    }),
    submitIcon: <Save />,
});
