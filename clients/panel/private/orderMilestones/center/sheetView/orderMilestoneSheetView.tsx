import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import type {OrderMilestone} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/orderMilestone/orderMilestone.dto.ts";

/** Read-only: milestone rows are written by order actions, never edited or deleted from the panel. */
type OrderMilestoneSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    milestone?: OrderMilestone;
    fetchId?: string;
};

function OrderMilestoneSheetView({
    open,
    onOpenChange,
    milestone: milestoneProp,
    resolveLanguageKey,
    fetchId,
}: OrderMilestoneSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(milestoneProp || {_id: fetchId});
    const access = useAccess("orderMilestones");
    const viewConfig = useViewConfig("ordermilestones", "sheet");

    useEffect(() => {
        if (!milestoneProp) return;
        setSheetData(milestoneProp);
    }, [milestoneProp]);

    const entityId = milestoneProp?._id ?? fetchId;

    if (!viewConfig || !entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/eCommerceMarketplace/orderMilestone/single"
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
    withLanguage("src/modules/eCommerce/clients/panel/private/orderMilestones/center/sheetView/orderMilestoneSheetView.tsx"),
    withDebug(true, true, "orderMilestones"),
)(OrderMilestoneSheetView);
