import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editReturnRequestFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/returnRequest/editReturnRequest.form.validator.ts";
import type {EditReturnRequestFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/returnRequest/returnRequest.schema-def.ts";
import type {ReturnRequest} from "armonia/src/modules/eCommerce/api/eCommerce/private/returnRequest/returnRequest.dto.ts";

export default createGenericEditPage<ReturnRequest, EditReturnRequestFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/returnRequests/editReturnRequest.tsx",
    collectionName: "returnRequests",
    accessModel: "returnRequests",
    apiUrl: "/api/eCommerce/returnRequest",
    schema: editReturnRequestFormSchema,
    mapEntityData: (data: any) => ({
        ...data,
        order: data.order?._id ?? data.order,
    }),
    submitIcon: <Save />,
});
