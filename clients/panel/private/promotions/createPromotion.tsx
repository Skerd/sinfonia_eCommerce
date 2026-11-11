import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createPromotionFormSchema} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/promotion/createPromotion.form.validator.ts";
import type {CreatePromotionFormType} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/promotion/promotion.schema-def.ts";

export default createGenericCreatePage<CreatePromotionFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/promotions/createPromotion.tsx",
    collectionName: "promotions",
    accessModel: "promotions",
    apiUrl: "/api/eCommerceMarketplace/promotion",
    schema: createPromotionFormSchema,
    // No promotion type is preselected: featured and sponsored cost and place differently (UX-06).
    defaultValues: {listing: "", startAt: "", endAt: ""},
    submitIcon: <IconPlus />,
    successPath: "/eCommerceMarketplace/promotions",
});
