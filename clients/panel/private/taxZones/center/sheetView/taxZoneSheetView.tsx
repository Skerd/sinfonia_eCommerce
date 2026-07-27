import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {TaxZone} from "armonia/src/modules/eCommerce/api/eCommerce/private/taxZone/taxZone.dto.ts";
import type {DeleteResponse} from "armonia/src/modules/core/types/shared.types.ts";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";

const LIST_BASE = "/tenancy/systemSettings/taxzones";

export type TaxZoneSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    taxZone?: TaxZone;
    hideActions?: boolean;
    onDelete?: (response?: DeleteResponse) => void;
    onRestore?: () => void;
    fetchId?: string;
};

function taxZoneEditPath(taxZone: TaxZone) {
    const params = new URLSearchParams();
    params.set("taxZoneId", taxZone._id);
    if (taxZone.name) params.set("taxZoneName", encodeURIComponent(taxZone.name));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

function TaxZoneSheetView({
    open,
    onOpenChange,
    taxZone: taxZoneProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    fetchId,
}: TaxZoneSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(taxZoneProp || {_id: fetchId});
    const access = useAccess("taxZones");
    const viewConfig = useViewConfig("taxZones", "sheet");

    useEffect(() => {
        if (!taxZoneProp) return;
        setSheetData(taxZoneProp);
    }, [taxZoneProp]);

    const entityId = taxZoneProp?._id ?? fetchId;

    if (!viewConfig) return null;
    if (!entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/eCommerce/taxZone/single"
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
            editPath={taxZoneEditPath(sheetData as TaxZone)}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/taxZones/center/sheetView/taxZoneSheetView.tsx"),
    withDebug(true, true),
)(TaxZoneSheetView);
