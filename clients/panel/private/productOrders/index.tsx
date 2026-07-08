import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import type {ProductOrder} from "armonia/src/modules/eCommerce/api/eCommerce/private/productOrder/productOrder.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ProductOrderCard from "./center/cardView/productOrderCard.tsx";

function AllProductOrders({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<ProductOrder>
            apiUrl="/api/eCommerce/productOrder"
            collectionName="productOrders"
            accessModel="productOrders"
            tableConfigKey="productOrders"
            buildEditPath={() => ""}
            rowActionMenu={{hideEdit: true}}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerce/clients/panel/private/productOrders/center/sheetView/productOrderSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderCard={(order, onDelete, onRestore) => (
                <ProductOrderCard
                    order={order}
                    onDelete={(row: ProductOrder | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(order)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/productOrders/index.tsx"),
    withDebug(true, true),
)(AllProductOrders);
