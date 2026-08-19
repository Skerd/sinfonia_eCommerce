import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {ProductAttribute} from "armonia/src/modules/eCommerce/api/eCommerce/private/productAttribute/productAttribute.dto.ts";
import {IconEye, IconHash, IconList, IconStack} from "@tabler/icons-react";
import ProductAttributeSheetView from "@eCommerceModule/clients/panel/private/productAttributes/center/sheetView/productAttributeSheetView.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import DisplayRow from "@coreModule/components/custom/displayValue/displayRow.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

const LIST_BASE = "/tenancy/systemSettings/productattributes";
const VALUE_PREVIEW_LIMIT = 4;

function productAttributeEditPath(attribute: ProductAttribute) {
    const params = new URLSearchParams();
    params.set("attributeId", attribute._id);
    if (attribute.name) params.set("attributeName", encodeURIComponent(attribute.name));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

function valuesPreview(values: string[]) {
    const preview = values.slice(0, VALUE_PREVIEW_LIMIT);
    const remaining = values.length - preview.length;
    return (
        <span className="flex flex-wrap gap-1">
            {preview.map((value, index) => (
                <Badge key={`${value}-${index}`} variant="outline" className="font-normal">
                    {value}
                </Badge>
            ))}
            {remaining > 0 && (
                <Badge variant="secondary" className="font-normal tabular-nums">
                    +{remaining}
                </Badge>
            )}
        </span>
    );
}

type ProductAttributeCardProps = WithLanguageType & {
    productAttribute: ProductAttribute;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: ProductAttribute, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<ProductAttribute> | null>;
};

function ProductAttributeCard({
    productAttribute,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: ProductAttributeCardProps) {
    return (
        <EntityCard
            resource="productAttributes"
            entity={productAttribute}
            fetchId={fetchId}
            singleUrl="/api/eCommerce/productAttribute/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={productAttributeEditPath}
            Sheet={ProductAttributeSheetView}
            sheetEntityProp="productAttribute"
            deleteUrl="/api/eCommerce/productAttribute"
            restoreUrl="/api/eCommerce/productAttribute/restore"
            failedTitle=""
            failedDescription=""
            titlePath="name"
            innerRef={innerRef}
            sheetProps={() => ({fetchId})}
        >
            {({entity}) => {
                const values = entity.values ?? [];
                return (
                    <>
                        <EntityCard.Header titlePath="name" title={entity.name} />
                        <EntityCard.Body>
                            <DisplayRow
                                icon={IconHash}
                                label={resolveLanguageKey("position")}
                                tooltip={resolveLanguageKey("position")}
                                path="position"
                                type="number"
                                value={entity.position}
                            />
                            <DisplayRow
                                icon={IconEye}
                                label={resolveLanguageKey("visible")}
                                tooltip={resolveLanguageKey("visible")}
                                path="isVisibleOnProductPage"
                                type="boolean"
                                value={entity.isVisibleOnProductPage}
                            />
                            <DisplayRow
                                icon={IconStack}
                                label={resolveLanguageKey("variants")}
                                tooltip={resolveLanguageKey("variants")}
                                path="isUsedForVariants"
                                type="boolean"
                                value={entity.isUsedForVariants}
                            />
                            <DisplayRow
                                icon={IconList}
                                label={resolveLanguageKey("values")}
                                tooltip={resolveLanguageKey("values")}
                                path="values"
                                value={values.length > 0 ? valuesPreview(values) : null}
                            />
                        </EntityCard.Body>
                    </>
                );
            }}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/productAttributes/center/cardView/productAttributeCard.tsx"),
    withDebug(true, true, "productAttributes"),
)(ProductAttributeCard);
