import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createPosPaymentMethodFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/posPaymentMethod/createPosPaymentMethod.form.validator.ts";
import type {CreatePosPaymentMethodFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/posPaymentMethod/posPaymentMethod.schema-def.ts";

export default createGenericCreatePage<CreatePosPaymentMethodFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/posPaymentMethods/createPosPaymentMethod.tsx",
    collectionName: "posPaymentMethods",
    accessModel: "posPaymentMethods",
    apiUrl: "/api/eCommerce/posPaymentMethod",
    schema: createPosPaymentMethodFormSchema,
    // No type until one is picked, and no tender chips: an empty list means the till's own defaults (UX-06).
    defaultValues: {
        name: "",
        sequence: 0,
        cashQuickAmounts: "",
        terminalEnabled: false,
        terminalProvider: "manual",
        terminalProtocol: "http",
        terminalHost: "",
        terminalPort: 8080,
        terminalId: "",
        terminalPath: "/payment",
    },
    successPath: "/tenancy/systemSettings/pospaymentmethods",
    submitIcon: <IconPlus />,
});
