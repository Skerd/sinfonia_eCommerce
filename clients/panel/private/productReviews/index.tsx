import {compose} from "redux";
import {useMemo} from "react";
import {IconPlus} from "@tabler/icons-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage, {type QuickFilterDef} from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {COLUMN_TYPE} from "armonia/src/modules/core/database/filter/typeOperators.ts";
import type {ProductReview} from "armonia/src/modules/eCommerce/api/eCommerce/private/productReview/productReview.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ProductReviewCard from "./center/cardView/productReviewCard.tsx";

export function productReviewEditPath(review: {_id: string; title?: string}) {
    const params = new URLSearchParams();
    params.set("productReviewId", review._id);
    if (review.title) params.set("productReviewTitle", encodeURIComponent(review.title));
    return `/eCommerce/productreviews/edit?${params.toString()}`;
}

function AllProductReviews({resolveLanguageKey}: WithLanguageType) {
    const quickFilters = useMemo<QuickFilterDef[]>(() => [
        {
            field: "product",
            label: String(resolveLanguageKey("fields.product")),
            type: COLUMN_TYPE.OBJECT_ID,
            apiUrl: "/api/eCommerce/product/select",
        },
    ], [resolveLanguageKey]);

    return (
        <EntityListPage<ProductReview>
            apiUrl="/api/eCommerce/productReview"
            collectionName="productReviews"
            accessModel="productReviews"
            tableConfigKey="productReviews"
            createPath="/eCommerce/productreviews/create"
            createIcon={<IconPlus />}
            createLanguageKey="createProductReview"
            buildEditPath={productReviewEditPath}
            resolveLanguageKey={resolveLanguageKey}
            quickFilters={quickFilters}
            sheetLanguagePath="src/modules/eCommerce/clients/panel/private/productReviews/center/sheetView/productReviewSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderCard={(review, onDelete, onRestore) => (
                <ProductReviewCard
                    review={review}
                    onDelete={(row: ProductReview | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(review)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/productReviews/index.tsx"),
    withDebug(true, true, "productReviews"),
)(AllProductReviews);
