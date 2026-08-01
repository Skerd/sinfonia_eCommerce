import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createPosPaymentMethodFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/posPaymentMethod/createPosPaymentMethod.form.validator.ts";
import type {CreatePosPaymentMethodFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/posPaymentMethod/posPaymentMethod.schema-def.ts";

export default createGenericCreatePage<CreatePosPaymentMethodFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/posPaymentMethods/createPosPaymentMethod.tsx",
    collectionName: "posPaymentMethods",
    accessModel: "posPaymentMethods",
    apiUrl: "/api/eCommerce/posPaymentMethod",
    schema: createPosPaymentMethodFormSchema,
    defaultValues: {
        name: "",
        type: "cash",
        sequence: 0,
        cashQuickAmounts: "0.1,0.2,0.5,1,5,10,20,50,100",
        terminalEnabled: false,
        terminalProvider: "manual",
        terminalProtocol: "http",
        terminalHost: "",
        terminalPort: 8080,
        terminalId: "",
        terminalPath: "/payment",
    } as unknown as CreatePosPaymentMethodFormType,
    successPath: "/tenancy/systemSettings/pospaymentmethods",
    submitIcon: <IconPlus />,
});
