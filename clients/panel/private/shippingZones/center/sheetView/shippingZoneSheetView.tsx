import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {ShippingZone} from "armonia/src/modules/eCommerce/api/eCommerce/private/shippingZone/shippingZone.dto.ts";
import type {DeleteResponse} from "armonia/src/modules/core/types/shared.types.ts";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";

const LIST_BASE = "/eCommerce/shippingzones";

export type ShippingZoneSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    shippingZone?: ShippingZone;
    hideActions?: boolean;
    onDelete?: (response?: DeleteResponse) => void;
    onRestore?: () => void;
    fetchId?: string;
};

function shippingZoneEditPath(shippingZone: ShippingZone) {
    const params = new URLSearchParams();
    params.set("shippingZoneId", shippingZone._id);
    if (shippingZone.name) params.set("shippingZoneName", encodeURIComponent(shippingZone.name));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

function ShippingZoneSheetView({
    open,
    onOpenChange,
    shippingZone: shippingZoneProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    fetchId,
}: ShippingZoneSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(shippingZoneProp || {_id: fetchId});
    const access = useAccess("shippingZones");
    const viewConfig = useViewConfig("shippingZones", "sheet");

    useEffect(() => {
        if (!shippingZoneProp) return;
        setSheetData(shippingZoneProp);
    }, [shippingZoneProp]);

    const entityId = shippingZoneProp?._id ?? fetchId;

    if (!viewConfig) return null;
    if (!entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/eCommerce/shippingZone/single"
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
            editPath={shippingZoneEditPath(sheetData as ShippingZone)}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/shippingZones/center/sheetView/shippingZoneSheetView.tsx"),
    withDebug(true, true),
)(ShippingZoneSheetView);
