import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import type {ProductReview} from "armonia/src/modules/eCommerce/api/eCommerce/private/productReview/productReview.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ProductReviewCard from "./center/cardView/productReviewCard.tsx";

function AllProductReviews({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<ProductReview>
            apiUrl="/api/eCommerce/productReview"
            collectionName="productReviews"
            accessModel="productReviews"
            tableConfigKey="productReviews"
            hideCreate
            buildEditPath={() => ""}
            rowActionMenu={{hideEdit: true}}
            resolveLanguageKey={resolveLanguageKey}
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
