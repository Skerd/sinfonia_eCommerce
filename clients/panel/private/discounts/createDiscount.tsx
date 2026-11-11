import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {companyToday, fromZonedWallClock} from "@coreModule/helpers/general/dateTime.ts";
import {createDiscountFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/discount/createDiscount.form.validator.ts";
import type {CreateDiscountFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/discount/discount.schema-def.ts";

/** The start of the company's today (GLB-09), as the instant the form's DateInput holds. */
function startOfCompanyToday(timeZone: string): string | undefined {
    const [year, month, day] = companyToday(timeZone).split("-").map(Number);
    return fromZonedWallClock(timeZone, year, month, day, 0, 0)?.toISOString();
}

export default createGenericCreatePage<CreateDiscountFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/discounts/createDiscount.tsx",
    collectionName: "discounts",
    accessModel: "discounts",
    apiUrl: "/api/eCommerce/discount",
    schema: createDiscountFormSchema,
    // No type is preselected: the kind of discount is the first choice (UX-06). The whole order is the common scope.
    defaultValues: (_params, {timeZone}) => ({
        title: "",
        value: 0,
        appliesTo: "order",
        startsAt: startOfCompanyToday(timeZone),
        customerGroups: [],
        targetIds: [],
    }),
    successPath: "/tenancy/systemSettings/discounts",
    submitIcon: <IconPlus />,
});
