import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createProductReviewFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/productReview/createProductReview.form.validator.ts";
import type {CreateProductReviewFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/productReview/productReview.schema-def.ts";

export default createGenericCreatePage<CreateProductReviewFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/productReviews/createProductReview.tsx",
    collectionName: "productReviews",
    accessModel: "productReviews",
    apiUrl: "/api/eCommerce/productReview",
    schema: createProductReviewFormSchema,
    successPath: "/eCommerce/productreviews",
    submitIcon: <IconPlus />,
});
