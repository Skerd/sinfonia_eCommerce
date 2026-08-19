import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {ProductVariant} from "armonia/src/modules/eCommerce/api/eCommerce/private/productVariant/productVariant.dto.ts";
import {IconBarcode, IconCurrencyDollar, IconTag} from "@tabler/icons-react";
import ProductVariantSheetView from "@eCommerceModule/clients/panel/private/productVariants/center/sheetView/productVariantSheetView.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import DisplayRow from "@coreModule/components/custom/displayValue/displayRow.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

const LIST_BASE = "/tenancy/systemSettings/productvariants";

function productVariantEditPath(entity: ProductVariant) {
    const params = new URLSearchParams();
    params.set("productVariantId", entity._id);
    if (entity.sku) params.set("productVariantTitle", encodeURIComponent(entity.sku));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

type ProductVariantCardProps = WithLanguageType & {
    entity: ProductVariant;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: ProductVariant, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<ProductVariant> | null>;
};

function ProductVariantCard({
    entity,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: ProductVariantCardProps) {
    return (
        <EntityCard
            resource="productVariants"
            entity={entity}
            fetchId={fetchId}
            singleUrl="/api/eCommerce/productVariant/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={productVariantEditPath}
            Sheet={ProductVariantSheetView}
            sheetEntityProp="entity"
            deleteUrl="/api/eCommerce/productVariant"
            restoreUrl="/api/eCommerce/productVariant/restore"
            failedTitle=""
            failedDescription=""
            titlePath="sku"
            innerRef={innerRef}
            sheetProps={() => ({fetchId})}
        >
            {({entity: row}) => (
                <>
                    <EntityCard.Header titlePath="sku" title={row.sku} />
                    <EntityCard.Body>
                        <DisplayRow
                            icon={IconBarcode}
                            label={resolveLanguageKey("sku")}
                            tooltip={resolveLanguageKey("sku")}
                            path="sku"
                            value={row.sku}
                        />
                        <DisplayRow
                            icon={IconCurrencyDollar}
                            label={resolveLanguageKey("price")}
                            tooltip={resolveLanguageKey("price")}
                            path="price"
                            type="number"
                            value={row.price}
                        />
                        <DisplayRow
                            icon={IconTag}
                            label={resolveLanguageKey("status")}
                            tooltip={resolveLanguageKey("status")}
                            path="status"
                            type="enum"
                            languageKeyCategory="variantStatus"
                            value={row.status}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/productVariants/center/cardView/productVariantCard.tsx"),
    withDebug(true, true, "productVariants"),
)(ProductVariantCard);
