import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {Collection} from "armonia/src/modules/eCommerce/api/eCommerce/private/collection/collection.dto.ts";
import type {DeleteResponse} from "armonia/src/modules/core/types/shared.types.ts";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";

const LIST_BASE = "/eCommerce/collections";

export type CollectionSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    collection?: Collection;
    hideActions?: boolean;
    onDelete?: (response?: DeleteResponse) => void;
    onRestore?: () => void;
    fetchId?: string;
};

function collectionEditPath(collection: Collection) {
    const params = new URLSearchParams();
    params.set("collectionId", collection._id);
    if (collection.name) params.set("collectionName", encodeURIComponent(collection.name));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

function CollectionSheetView({
    open,
    onOpenChange,
    collection: collectionProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    fetchId,
}: CollectionSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(collectionProp || {_id: fetchId});
    const access = useAccess("productCollections");
    const viewConfig = useViewConfig("productCollections", "sheet");

    useEffect(() => {
        if (!collectionProp) return;
        setSheetData(collectionProp);
    }, [collectionProp]);

    const entityId = collectionProp?._id ?? fetchId;

    if (!viewConfig) return null;
    if (!entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/eCommerce/collection/single"
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
            editPath={collectionEditPath(sheetData as Collection)}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/collections/center/sheetView/collectionSheetView.tsx"),
    withDebug(true, true, "productCollections"),
)(CollectionSheetView);
