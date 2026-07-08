import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {Warehouse} from "armonia/src/modules/eCommerce/api/eCommerce/private/warehouse/warehouse.dto.ts";
import type {DeleteResponse} from "armonia/src/modules/core/types/shared.types.ts";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";

const LIST_BASE = "/eCommerce/warehouses";

export type WarehouseSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    warehouse?: Warehouse;
    hideActions?: boolean;
    onDelete?: (response?: DeleteResponse) => void;
    onRestore?: () => void;
    fetchId?: string;
};

function warehouseEditPath(warehouse: Warehouse) {
    const params = new URLSearchParams();
    params.set("warehouseId", warehouse._id);
    if (warehouse.name) params.set("warehouseName", encodeURIComponent(warehouse.name));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

function WarehouseSheetView({
    open,
    onOpenChange,
    warehouse: warehouseProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    fetchId,
}: WarehouseSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(warehouseProp || {_id: fetchId});
    const access = useAccess("warehouses");
    const viewConfig = useViewConfig("warehouses", "sheet");

    useEffect(() => {
        if (!warehouseProp) return;
        setSheetData(warehouseProp);
    }, [warehouseProp]);

    const entityId = warehouseProp?._id ?? fetchId;

    if (!viewConfig) return null;
    if (!entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/eCommerce/warehouse/single"
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
            editPath={warehouseEditPath(sheetData as Warehouse)}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/warehouses/center/sheetView/warehouseSheetView.tsx"),
    withDebug(true, true),
)(WarehouseSheetView);
