import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import type {Product} from "armonia/src/modules/eCommerce/api/eCommerce/private/product/product.dto.ts";
import type {DeleteResponse} from "armonia/src/modules/core/types/shared.types.ts";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import PublishProduct from "@eCommerceModule/clients/panel/private/products/center/actions/publishProduct.tsx";
import ArchiveProduct from "@eCommerceModule/clients/panel/private/products/center/actions/archiveProduct.tsx";
import RevertToDraftProduct from "@eCommerceModule/clients/panel/private/products/center/actions/revertToDraftProduct.tsx";
import DuplicateProduct from "@eCommerceModule/clients/panel/private/products/center/actions/duplicateProduct.tsx";
import PublishProductDialog from "@eCommerceModule/clients/panel/private/products/center/dialogs/publishProductDialog.tsx";
import ArchiveProductDialog from "@eCommerceModule/clients/panel/private/products/center/dialogs/archiveProductDialog.tsx";
import RevertToDraftProductDialog from "@eCommerceModule/clients/panel/private/products/center/dialogs/revertToDraftProductDialog.tsx";
import DuplicateProductDialog from "@eCommerceModule/clients/panel/private/products/center/dialogs/duplicateProductDialog.tsx";

const LIST_BASE = "/eCommerce/products";

export type ProductSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product?: Product;
    hideActions?: boolean;
    onDelete?: (response?: DeleteResponse) => void;
    onRestore?: () => void;
    fetchId?: string;
    onSheetRowPatched?: (row: Record<string, unknown>) => void;
};

function productEditPath(product: {_id: string; title?: string}) {
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
    onSheetRowPatched,
}: ProductSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Product | undefined>(productProp);
    const [action, setAction] = useState("");
    const access = useAccess("products");
    const viewConfig = useViewConfig("products", "sheet");

    useEffect(() => {
        if (!open) setAction("");
    }, [open]);

    useEffect(() => {
        if (!productProp) return;
        setSheetData((prev) => ({
            ...productProp,
            variants: productProp.variants ?? prev?.variants,
            inventories: productProp.inventories ?? prev?.inventories,
            reviews: productProp.reviews ?? prev?.reviews,
        }));
    }, [productProp]);

    const entityId = productProp?._id ?? fetchId ?? sheetData?._id;

    if (!viewConfig) return null;
    if (!entityId) return null;

    return (
        <>
            <SheetViewRenderer
                config={viewConfig}
                url="/api/eCommerce/product/single"
                fetchId={fetchId}
                onDataFetched={(data) => {
                    setSheetData(data);
                }}
                data={sheetData ?? {_id: entityId}}
                open={open}
                onOpenChange={onOpenChange}
                resolveLanguageKey={resolveLanguageKey}
                access={access}
                hideActions={hideActions}
                onDelete={onDelete}
                onRestore={onRestore}
                editPath={productEditPath({_id: entityId, title: sheetData?.title})}
                onSheetRowPatched={onSheetRowPatched}
                actionMenuAllowCustomChildren
                actionMenuChildren={sheetData ? (
                    <>
                        <PublishProduct entity={sheetData} onAction={setAction} />
                        <ArchiveProduct entity={sheetData} onAction={setAction} />
                        <RevertToDraftProduct entity={sheetData} onAction={setAction} />
                        <DuplicateProduct entity={sheetData} onAction={setAction} />
                    </>
                ) : undefined}
            />
            {sheetData && action === "publishProduct" && (
                <PublishProductDialog
                    open={true}
                    onClose={() => setAction("")}
                    entity={sheetData}
                    onSuccess={() => {
                        const next = {...sheetData, status: "active" as const};
                        setSheetData(next);
                        onSheetRowPatched?.(next);
                    }}
                />
            )}
            {sheetData && action === "archiveProduct" && (
                <ArchiveProductDialog
                    open={true}
                    onClose={() => setAction("")}
                    entity={sheetData}
                    onSuccess={() => {
                        const next = {...sheetData, status: "archived" as const};
                        setSheetData(next);
                        onSheetRowPatched?.(next);
                    }}
                />
            )}
            {sheetData && action === "revertToDraftProduct" && (
                <RevertToDraftProductDialog
                    open={true}
                    onClose={() => setAction("")}
                    entity={sheetData}
                    onSuccess={() => {
                        const next = {...sheetData, status: "draft" as const};
                        setSheetData(next);
                        onSheetRowPatched?.(next);
                    }}
                />
            )}
            {sheetData && action === "duplicateProduct" && (
                <DuplicateProductDialog
                    open={true}
                    onClose={() => setAction("")}
                    entity={sheetData}
                />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/products/center/sheetView/productSheetView.tsx"),
    withDebug(true, true, "products"),
)(ProductSheetView);
