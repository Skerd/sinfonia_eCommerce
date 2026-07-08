import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editDiscountFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/discount/editDiscount.form.validator.ts";
import type {EditDiscountFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/discount/discount.schema-def.ts";
import type {Discount} from "armonia/src/modules/eCommerce/api/eCommerce/private/discount/discount.dto.ts";

export default createGenericEditPage<Discount, EditDiscountFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/discounts/editDiscount.tsx",
    collectionName: "discounts",
    accessModel: "discounts",
    apiUrl: "/api/eCommerce/discount",
    schema: editDiscountFormSchema,
    mapEntityData: (data) => ({
        ...data,
        targetIds: data.targetIds ?? data.targetLabels?.map((t) => t._id),
        customerGroups: data.customerGroups ?? data.customerGroupLabels?.map((g) => g._id),
        startsAt: data.startsAt ? new Date(data.startsAt).toISOString().split("T")[0] : undefined,
        endsAt: data.endsAt ? new Date(data.endsAt).toISOString().split("T")[0] : undefined,
    }),
    submitIcon: <Save />,
});
