import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createFulfillmentFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/fulfillment/createFulfillment.form.validator.ts";
import type {CreateFulfillmentFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/fulfillment/fulfillment.schema-def.ts";

export default createGenericCreatePage<CreateFulfillmentFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/fulfillments/createFulfillment.tsx",
    collectionName: "fulfillments",
    accessModel: "fulfillments",
    apiUrl: "/api/eCommerce/fulfillment",
    schema: createFulfillmentFormSchema,
    defaultValues: {order: "", status: "pending", items: [{orderItemId: "", quantity: 1}]} as unknown as CreateFulfillmentFormType,
    successPath: "/eCommerce/fulfillments",
    submitIcon: <IconPlus />,
});
