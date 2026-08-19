import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {Product} from "armonia/src/modules/eCommerce/api/eCommerce/private/product/product.dto.ts";
import type {DeleteResponse} from "armonia/src/modules/core/types/shared.types.ts";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";

const LIST_BASE = "/eCommerce/products";

export type ProductSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product?: Product;
    hideActions?: boolean;
    onDelete?: (response?: DeleteResponse) => void;
    onRestore?: () => void;
    fetchId?: string;
};

function productEditPath(product: Product) {
    const params = new URLSearchParams();
    params.set("productId", product._id);
    if (product.title) params.set("productTitle", encodeURIComponent(product.title));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

function ProductSheetView({
    open,
    onOpenChange,
    product: productProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    fetchId,
}: ProductSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(productProp || {_id: fetchId});
    const access = useAccess("products");
    const viewConfig = useViewConfig("products", "sheet");

    useEffect(() => {
        if (!productProp) return;
        setSheetData(productProp);
    }, [productProp]);

    const entityId = productProp?._id ?? fetchId;

    if (!viewConfig) return null;
    if (!entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/eCommerce/product/single"
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
            editPath={productEditPath(sheetData as Product)}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/products/center/sheetView/productSheetView.tsx"),
    withDebug(true, true, "products"),
)(ProductSheetView);
