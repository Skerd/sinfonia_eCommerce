import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import type {OrderRevision} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/orderRevision/orderRevision.dto.ts";

/** Read-only: revision rows are written by order actions, never edited or deleted from the panel. */
type OrderRevisionSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    revision?: OrderRevision;
    fetchId?: string;
};

function OrderRevisionSheetView({
    open,
    onOpenChange,
    revision: revisionProp,
    resolveLanguageKey,
    fetchId,
}: OrderRevisionSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(revisionProp || {_id: fetchId});
    const access = useAccess("orderRevisions");
    const viewConfig = useViewConfig("orderrevisions", "sheet");

    useEffect(() => {
        if (!revisionProp) return;
        setSheetData(revisionProp);
    }, [revisionProp]);

    const entityId = revisionProp?._id ?? fetchId;

    if (!viewConfig || !entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/eCommerceMarketplace/orderRevision/single"
            fetchId={fetchId ?? entityId}
            onDataFetched={(data) => setSheetData(data)}
            data={sheetData}
            open={open}
            onOpenChange={onOpenChange}
            resolveLanguageKey={resolveLanguageKey}
            access={access}
            hideEdit
            hideDelete
            hideRestore
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/orderRevisions/center/sheetView/orderRevisionSheetView.tsx"),
    withDebug(true, true, "orderRevisions"),
)(OrderRevisionSheetView);
