import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editFulfillmentFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/fulfillment/editFulfillment.form.validator.ts";
import type {EditFulfillmentFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/fulfillment/fulfillment.schema-def.ts";
import type {Fulfillment} from "armonia/src/modules/eCommerce/api/eCommerce/private/fulfillment/fulfillment.dto.ts";

export default createGenericEditPage<Fulfillment, EditFulfillmentFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/fulfillments/editFulfillment.tsx",
    collectionName: "fulfillments",
    accessModel: "fulfillments",
    apiUrl: "/api/eCommerce/fulfillment",
    schema: editFulfillmentFormSchema,
    mapEntityData: (data: any) => ({
        ...data,
        order: data.order?._id ?? data.order,
        shippedAt: data.shippedAt ? new Date(data.shippedAt).toISOString().split("T")[0] : undefined,
        estimatedDeliveryAt: data.estimatedDeliveryAt ? new Date(data.estimatedDeliveryAt).toISOString().split("T")[0] : undefined,
        deliveredAt: data.deliveredAt ? new Date(data.deliveredAt).toISOString().split("T")[0] : undefined,
    }),
    submitIcon: <Save />,
});
