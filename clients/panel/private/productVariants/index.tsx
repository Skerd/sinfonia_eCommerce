import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {ProductVariant} from "armonia/src/modules/eCommerce/api/eCommerce/private/productVariant/productVariant.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ProductVariantCard from "./center/cardView/productVariantCard.tsx";

export function productVariantEditPath(entity: {_id: string; sku?: string}) {
    const params = new URLSearchParams();
    params.set("productVariantId", entity._id);
    if (entity.sku) params.set("productVariantTitle", encodeURIComponent(String(entity.sku)));
    return `/tenancy/systemSettings/productvariants/edit?${params.toString()}`;
}

function AllProductVariants({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<ProductVariant>
            apiUrl="/api/eCommerce/productVariant"
            collectionName="productVariants"
            accessModel="productVariants"
            tableConfigKey="productVariants"
            createPath="/tenancy/systemSettings/productvariants/create"
            createIcon={<IconPlus />}
            createLanguageKey="createProductVariant"
            buildEditPath={productVariantEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerce/clients/panel/private/productVariants/center/sheetView/productVariantSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderCard={(entity, onDelete, onRestore) => (
                <ProductVariantCard
                    entity={entity}
                    onDelete={(row: ProductVariant | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(entity)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/productVariants/index.tsx"),
    withDebug(true, true, "productVariants"),
)(AllProductVariants);
