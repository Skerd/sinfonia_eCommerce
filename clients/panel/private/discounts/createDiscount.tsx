import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createDiscountFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/discount/createDiscount.form.validator.ts";
import type {CreateDiscountFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/discount/discount.schema-def.ts";

function toFormDateTime(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default createGenericCreatePage<CreateDiscountFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/discounts/createDiscount.tsx",
    collectionName: "discounts",
    accessModel: "discounts",
    apiUrl: "/api/eCommerce/discount",
    schema: createDiscountFormSchema,
    defaultValues: {
        title: "",
        type: "percentage",
        value: 0,
        appliesTo: "order",
        startsAt: toFormDateTime(new Date()),
        customerGroups: [],
        targetIds: [],
    } as unknown as CreateDiscountFormType,
    successPath: "/tenancy/systemSettings/discounts",
    submitIcon: <IconPlus />,
});
