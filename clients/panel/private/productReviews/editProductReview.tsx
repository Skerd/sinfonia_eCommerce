import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import {editProductReviewFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/productReview/editProductReview.form.validator.ts";
import type {EditProductReviewFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/productReview/productReview.schema-def.ts";
import type {ProductReview} from "armonia/src/modules/eCommerce/api/eCommerce/private/productReview/productReview.dto.ts";

export default createGenericEditPage<ProductReview, EditProductReviewFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/productReviews/editProductReview.tsx",
    collectionName: "productReviews",
    accessModel: "productReviews",
    apiUrl: "/api/eCommerce/productReview",
    schema: editProductReviewFormSchema,
    buildInitialValues: (data) => ({
        _id: data._id,
        rating: data.rating,
        title: data.title,
        comment: data.comment,
    }),
    submitIcon: <Save />,
});
