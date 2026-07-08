import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {ProductAttribute} from "armonia/src/modules/eCommerce/api/eCommerce/private/productAttribute/productAttribute.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ProductAttributeCard from "./center/cardView/productAttributeCard.tsx";

export function productAttributeEditPath(attr: {_id: string; name?: string}) {
    const params = new URLSearchParams();
    params.set("attributeId", attr._id);
    if (attr.name) params.set("attributeName", encodeURIComponent(attr.name));
    return `/eCommerce/productattributes/edit?${params.toString()}`;
}

function AllProductAttributes({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<ProductAttribute>
            apiUrl="/api/eCommerce/productAttribute"
            collectionName="productAttributes"
            accessModel="productAttributes"
            tableConfigKey="productAttributes"
            createPath="/eCommerce/productattributes/create"
            createIcon={<IconPlus />}
            createLanguageKey="createProductAttribute"
            buildEditPath={productAttributeEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerce/clients/panel/private/productAttributes/center/sheetView/productAttributeSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderCard={(productAttribute, onDelete, onRestore) => (
                <ProductAttributeCard
                    productAttribute={productAttribute}
                    onDelete={(row: ProductAttribute | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(productAttribute)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/productAttributes/index.tsx"),
    withDebug(true, true),
)(AllProductAttributes);
