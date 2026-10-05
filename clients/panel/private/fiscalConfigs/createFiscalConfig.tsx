import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createFiscalConfigFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/fiscalConfig/createFiscalConfig.form.validator.ts";
import type {CreateFiscalConfigFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/fiscalConfig/fiscalConfig.schema-def.ts";

export default createGenericCreatePage<CreateFiscalConfigFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/fiscalConfigs/createFiscalConfig.tsx",
    collectionName: "fiscalConfigs",
    accessModel: "fiscalConfigs",
    apiUrl: "/api/eCommerce/fiscalConfig",
    schema: createFiscalConfigFormSchema,
    defaultValues: {
        name: "",
        softCode: "",
        businessUnitCode: "",
        operatorCode: "",
        tcrType: "REGULAR",
        fiscalizationUrl: "",
        einvoiceUrl: "",
        selfcareUrl: "",
        sellerCountry: "",
        environment: "test",
        isVatRegistered: true,
        certificate: [],
    } as unknown as CreateFiscalConfigFormType,
    successPath: "/tenancy/systemSettings/fiscalconfigs",
    submitIcon: <IconPlus />,
});
