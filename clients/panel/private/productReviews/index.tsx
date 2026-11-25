import {compose} from "redux";
import {useMemo} from "react";
import {useSelector} from "react-redux";
import {IconPlus} from "@tabler/icons-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage, {EntityListCreateButton, EntityListHeader, type QuickFilterDef} from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {COLUMN_TYPE} from "armonia/src/modules/core/database/filter/typeOperators.ts";
import type {ProductReview} from "armonia/src/modules/eCommerce/api/eCommerce/private/productReview/productReview.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import type {RootState} from "@coreModule/helpers/redux/store/generalStore.ts";
import ProductReviewCard from "./center/cardView/productReviewCard.tsx";

export function productReviewEditPath(review: {_id: string; title?: string}) {
    const params = new URLSearchParams();
    params.set("productReviewId", review._id);
    if (review.title) params.set("productReviewTitle", encodeURIComponent(review.title));
    return `/eCommerce/productreviews/edit?${params.toString()}`;
}

function AllProductReviews({resolveLanguageKey}: WithLanguageType) {
    const currentUserId = useSelector((state: RootState) => state.authentication.user.id);
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
            header={(ctx) => (
                <EntityListHeader ctx={ctx}>
                    <EntityListCreateButton
                        ctx={ctx}
                        path="/eCommerce/productreviews/create"
                        icon={<IconPlus />}
                        labelKey="createProductReview"
                    />
                </EntityListHeader>
            )}
            buildEditPath={productReviewEditPath}
            // Only the buyer who wrote a review may change its words (the update route refuses anyone else).
            rowActionMenu={{hideEdit: (review) => review.reviewer?._id !== currentUserId}}
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
