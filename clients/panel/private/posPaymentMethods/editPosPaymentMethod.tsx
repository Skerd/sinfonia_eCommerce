import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editPosPaymentMethodFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/posPaymentMethod/editPosPaymentMethod.form.validator.ts";
import type {EditPosPaymentMethodFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/posPaymentMethod/posPaymentMethod.schema-def.ts";
import type {PosPaymentMethod} from "armonia/src/modules/eCommerce/api/eCommerce/private/posPaymentMethod/posPaymentMethod.dto.ts";

export default createGenericEditPage<PosPaymentMethod, EditPosPaymentMethodFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/posPaymentMethods/editPosPaymentMethod.tsx",
    collectionName: "posPaymentMethods",
    accessModel: "posPaymentMethods",
    apiUrl: "/api/eCommerce/posPaymentMethod",
    schema: editPosPaymentMethodFormSchema,
    mapEntityData: (data) => ({
        ...data,
    }),
    submitIcon: <Save />,
});
