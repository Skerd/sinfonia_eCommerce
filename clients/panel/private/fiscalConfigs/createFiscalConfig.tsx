import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
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
        fiscalizationUrl: "https://einvoice-test.tatime.gov.al:443/FiscalizationService-v3",
        einvoiceUrl: "https://einvoice-test.tatime.gov.al:443/EinvoiceService-v1",
        selfcareUrl: "https://einvoice-test.tatime.gov.al/invoice-check/",
        sellerCountry: "ALB",
        environment: "test",
        isVatRegistered: true,
        autoFiscalizePos: false,
        autoEinvoice: false,
        isActive: true,
    } as unknown as CreateFiscalConfigFormType,
    successPath: "/eCommerce/fiscalconfigs",
    submitIcon: <IconPlus />,
});
