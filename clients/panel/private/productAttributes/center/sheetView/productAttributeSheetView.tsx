import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {ProductAttribute} from "armonia/src/modules/eCommerce/api/eCommerce/private/productAttribute/productAttribute.dto.ts";
import type {DeleteResponse} from "armonia/src/modules/core/types/shared.types.ts";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";

const LIST_BASE = "/tenancy/systemSettings/productattributes";

export type ProductAttributeSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    productAttribute?: ProductAttribute;
    hideActions?: boolean;
    onDelete?: (response?: DeleteResponse) => void;
    onRestore?: () => void;
    fetchId?: string;
};

function productAttributeEditPath(attribute: ProductAttribute) {
    const params = new URLSearchParams();
    params.set("attributeId", attribute._id);
    if (attribute.name) params.set("attributeName", encodeURIComponent(attribute.name));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

function ProductAttributeSheetView({
    open,
    onOpenChange,
    productAttribute: productAttributeProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    fetchId,
}: ProductAttributeSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(productAttributeProp || {_id: fetchId});
    const access = useAccess("productAttributes");
    const viewConfig = useViewConfig("productAttributes", "sheet");

    useEffect(() => {
        if (!productAttributeProp) return;
        setSheetData(productAttributeProp);
    }, [productAttributeProp]);

    const entityId = productAttributeProp?._id ?? fetchId;

    if (!viewConfig) return null;
    if (!entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/eCommerce/productAttribute/single"
            fetchId={fetchId}
            onDataFetched={(data) => {
                setSheetData(data);
            }}
            data={sheetData}
            open={open}
            onOpenChange={onOpenChange}
            resolveLanguageKey={resolveLanguageKey}
            access={access}
            hideActions={hideActions}
            onDelete={onDelete}
            onRestore={onRestore}
            editPath={productAttributeEditPath(sheetData as ProductAttribute)}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/productAttributes/center/sheetView/productAttributeSheetView.tsx"),
    withDebug(true, true),
)(ProductAttributeSheetView);
