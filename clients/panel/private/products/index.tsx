import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {Product} from "armonia/src/modules/eCommerce/api/eCommerce/private/product/product.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ProductCard from "./center/cardView/productCard.tsx";

export function productEditPath(product: {_id: string; title?: string}) {
    const params = new URLSearchParams();
    params.set("productId", product._id);
    if (product.title) params.set("productTitle", encodeURIComponent(product.title));
    return `/eCommerce/products/edit?${params.toString()}`;
}

function AllProducts({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<Product>
            apiUrl="/api/eCommerce/product"
            collectionName="products"
            accessModel="products"
            tableConfigKey="products"
            createPath="/eCommerce/products/create"
            createIcon={<IconPlus />}
            createLanguageKey="createProduct"
            buildEditPath={productEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerce/clients/panel/private/products/center/sheetView/productSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderCard={(product, onDelete, onRestore) => (
                <ProductCard
                    product={product}
                    onDelete={(row: Product | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(product)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/products/index.tsx"),
    withDebug(true, true),
)(AllProducts);
