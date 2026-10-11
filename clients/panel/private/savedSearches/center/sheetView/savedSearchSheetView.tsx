import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import type {SavedSearch} from "armonia/src/modules/eCommerce/api/eCommerce/private/savedSearch/savedSearch.dto.ts";
import type {DeleteResponse} from "armonia/src/modules/core/types/shared.types.ts";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";

function savedSearchEditPath(search: {_id: string; name?: string}, lockCustomer: boolean) {
    const params = new URLSearchParams();
    params.set("savedSearchId", search._id);
    if (search.name) params.set("savedSearchName", encodeURIComponent(search.name));
    if (lockCustomer) params.set("lockCustomer", "1");
    return `/eCommerce/savedsearches/edit?${params.toString()}`;
}

export type SavedSearchSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entity?: SavedSearch;
    hideActions?: boolean;
    lockCustomer?: boolean;
    onDelete?: (response?: DeleteResponse) => void;
    onRestore?: () => void;
    fetchId?: string;
};

function SavedSearchSheetView({
    open,
    onOpenChange,
    entity: entityProp,
    resolveLanguageKey,
    hideActions = false,
    lockCustomer = false,
    onDelete = () => {},
    onRestore = () => {},
    fetchId,
}: SavedSearchSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(
        entityProp ?? {_id: fetchId},
    );
    const access = useAccess("savedsearches");
    const viewConfig = useViewConfig("savedsearches", "sheet");

    useEffect(() => {
        if (!entityProp) return;
        setSheetData(entityProp);
    }, [entityProp]);

    const entityId = entityProp?._id ?? fetchId;

    if (!viewConfig) return null;
    if (!entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/eCommerce/savedSearch/single"
            fetchId={fetchId ?? entityProp?._id}
            onDataFetched={(data) => {
                setSheetData(data as SavedSearch);
            }}
            data={sheetData}
            open={open}
            onOpenChange={onOpenChange}
            resolveLanguageKey={resolveLanguageKey}
            access={access}
            hideActions={hideActions}
            editPath={savedSearchEditPath(
                {
                    _id: entityId,
                    name: typeof sheetData.name === "string" ? sheetData.name : undefined,
                },
                lockCustomer,
            )}
            onDelete={onDelete}
            onRestore={onRestore}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/savedSearches/center/sheetView/savedSearchSheetView.tsx"),
    withDebug(true, true, "savedsearches"),
)(SavedSearchSheetView);
