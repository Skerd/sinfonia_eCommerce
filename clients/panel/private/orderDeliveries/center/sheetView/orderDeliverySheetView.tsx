import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import type {OrderDelivery} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/orderDelivery/orderDelivery.dto.ts";

/** Read-only: delivery rows are written by order actions, never edited or deleted from the panel. */
type OrderDeliverySheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    delivery?: OrderDelivery;
    fetchId?: string;
};

function OrderDeliverySheetView({
    open,
    onOpenChange,
    delivery: deliveryProp,
    resolveLanguageKey,
    fetchId,
}: OrderDeliverySheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(deliveryProp || {_id: fetchId});
    const access = useAccess("orderDeliveries");
    const viewConfig = useViewConfig("orderdeliveries", "sheet");

    useEffect(() => {
        if (!deliveryProp) return;
        setSheetData(deliveryProp);
    }, [deliveryProp]);

    const entityId = deliveryProp?._id ?? fetchId;

    if (!viewConfig || !entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/eCommerceMarketplace/orderDelivery/single"
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
    withLanguage("src/modules/eCommerce/clients/panel/private/orderDeliveries/center/sheetView/orderDeliverySheetView.tsx"),
    withDebug(true, true, "orderDeliveries"),
)(OrderDeliverySheetView);
