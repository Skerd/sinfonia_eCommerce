import {compose} from "redux";
import {useMemo} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage, {type QuickFilterDef} from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {COLUMN_TYPE} from "armonia/src/modules/core/database/filter/typeOperators.ts";
import {IconPlus} from "@tabler/icons-react";
import type {Product} from "armonia/src/modules/eCommerce/api/eCommerce/private/product/product.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ProductCard from "./center/cardView/productCard.tsx";
import ProductSheetView from "./center/sheetView/productSheetView.tsx";
import PublishProduct from "./center/actions/publishProduct.tsx";
import ArchiveProduct from "./center/actions/archiveProduct.tsx";
import RevertToDraftProduct from "./center/actions/revertToDraftProduct.tsx";
import DuplicateProduct from "./center/actions/duplicateProduct.tsx";
import PublishProductDialog from "./center/dialogs/publishProductDialog.tsx";
import ArchiveProductDialog from "./center/dialogs/archiveProductDialog.tsx";
import RevertToDraftProductDialog from "./center/dialogs/revertToDraftProductDialog.tsx";
import DuplicateProductDialog from "./center/dialogs/duplicateProductDialog.tsx";

export function productEditPath(product: {_id: string; title?: string}) {
    const params = new URLSearchParams();
    params.set("productId", product._id);
    if (product.title) params.set("productTitle", encodeURIComponent(product.title));
    return `/eCommerce/products/edit?${params.toString()}`;
}

function AllProducts({resolveLanguageKey}: WithLanguageType) {
    const quickFilters = useMemo<QuickFilterDef[]>(() => [
        {
            field: "status",
            label: String(resolveLanguageKey("fields.status")),
            type: COLUMN_TYPE.ENUM,
            enumValues: ["draft", "active", "archived"].map((value) => ({
                value,
                label: String(resolveLanguageKey(`fields.!enums.status.${value}`)),
            })),
        },
        {
            field: "categories",
            label: String(resolveLanguageKey("fields.categories")),
            type: COLUMN_TYPE.OBJECT_ID,
            apiUrl: "/api/eCommerce/category/select",
        },
    ], [resolveLanguageKey]);

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
            quickFilters={quickFilters}
            rowActionMenu={{allowMenuForCustomChildren: true}}
            sheetLanguagePath="src/modules/eCommerce/clients/panel/private/products/center/sheetView/productSheetView.tsx"
            renderActionMenuChildren={(product, bindRowAction) => (
                <>
                    <PublishProduct entity={product} onAction={bindRowAction} />
                    <ArchiveProduct entity={product} onAction={bindRowAction} />
                    <RevertToDraftProduct entity={product} onAction={bindRowAction} />
                    <DuplicateProduct entity={product} onAction={bindRowAction} />
                </>
            )}
            renderFloatingModals={({action, entity, resetAction, listRef}) => (
                <>
                    {action === "publishProduct" && (
                        <PublishProductDialog
                            open
                            onClose={resetAction}
                            entity={entity}
                            onSuccess={() => listRef.current?.updateRow?.(entity._id, {status: "active"})}
                        />
                    )}
                    {action === "archiveProduct" && (
                        <ArchiveProductDialog
                            open
                            onClose={resetAction}
                            entity={entity}
                            onSuccess={() => listRef.current?.updateRow?.(entity._id, {status: "archived"})}
                        />
                    )}
                    {action === "revertToDraftProduct" && (
                        <RevertToDraftProductDialog
                            open
                            onClose={resetAction}
                            entity={entity}
                            onSuccess={() => listRef.current?.updateRow?.(entity._id, {status: "draft"})}
                        />
                    )}
                    {action === "duplicateProduct" && (
                        <DuplicateProductDialog
                            open
                            onClose={resetAction}
                            entity={entity}
                            onSuccess={() => listRef.current?.refetch()}
                        />
                    )}
                </>
            )}
            renderCard={(product, onDelete, onRestore, listRef) => (
                <ProductCard
                    product={product}
                    onDelete={(row: Product | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(product)}
                    onRowPatched={(patch: Partial<Product>) => listRef.current?.updateRow?.(product._id, patch)}
                    onDuplicated={() => listRef.current?.refetch()}
                />
            )}
            renderSheet={({entity, open, onOpenChange, onDelete, onRestore, listRef}) => (
                <ProductSheetView
                    open={open}
                    onOpenChange={(opened: boolean) => {
                        if (!opened) onOpenChange();
                    }}
                    product={entity}
                    onDelete={onDelete}
                    onRestore={onRestore}
                    onSheetRowPatched={(row: Product) => listRef.current?.updateRow?.(entity._id, row)}
                    onDuplicated={() => listRef.current?.refetch()}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/products/index.tsx"),
    withDebug(true, true, "products"),
)(AllProducts);
