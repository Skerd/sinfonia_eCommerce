import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createDiscountFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/discount/createDiscount.form.validator.ts";
import type {CreateDiscountFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/discount/discount.schema-def.ts";

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
        isActive: true,
        startsAt: new Date().toISOString().split("T")[0],
    } as unknown as CreateDiscountFormType,
    successPath: "/eCommerce/discounts",
    submitIcon: <IconPlus />,
});
