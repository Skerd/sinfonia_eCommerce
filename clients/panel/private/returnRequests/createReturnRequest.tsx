import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createReturnRequestFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/returnRequest/createReturnRequest.form.validator.ts";
import type {CreateReturnRequestFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/returnRequest/returnRequest.schema-def.ts";

export default createGenericCreatePage<CreateReturnRequestFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/returnRequests/createReturnRequest.tsx",
    collectionName: "returnRequests",
    accessModel: "returnRequests",
    apiUrl: "/api/eCommerce/returnRequest",
    schema: createReturnRequestFormSchema,
    defaultValues: {order: "", type: "return", status: "pending", items: [{orderItemId: "", quantity: 1, reason: ""}]} as unknown as CreateReturnRequestFormType,
    successPath: "/eCommerce/returnrequests",
    submitIcon: <IconPlus />,
});
