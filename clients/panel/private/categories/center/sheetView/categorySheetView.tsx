import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {Category} from "armonia/src/modules/eCommerce/api/eCommerce/private/category/category.dto.ts";
import type {DeleteResponse} from "armonia/src/modules/core/types/shared.types.ts";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";

const LIST_BASE = "/tenancy/systemSettings/categories";

export type CategorySheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category?: Category;
    hideActions?: boolean;
    onDelete?: (response?: DeleteResponse) => void;
    onRestore?: () => void;
    fetchId?: string;
};

function categoryEditPath(cat: Category) {
    const params = new URLSearchParams();
    params.set("categoryId", cat._id);
    if (cat.name) params.set("categoryName", cat.name);
    return `${LIST_BASE}/edit?${params.toString()}`;
}

function CategorySheetView({
    open,
    onOpenChange,
    category: categoryProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    fetchId,
}: CategorySheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(categoryProp || {_id: fetchId});
    const access = useAccess("listingCategories");
    const viewConfig = useViewConfig("listingcategories", "sheet");

    useEffect(() => {
        if (!categoryProp) return;
        setSheetData(categoryProp);
    }, [categoryProp]);

    const entityId = categoryProp?._id ?? fetchId;

    if (!viewConfig) return null;
    if (!entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/eCommerce/category/single"
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
            editPath={categoryEditPath(sheetData as Category)}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/categories/center/sheetView/categorySheetView.tsx"),
    withDebug(true, true),
)(CategorySheetView);
