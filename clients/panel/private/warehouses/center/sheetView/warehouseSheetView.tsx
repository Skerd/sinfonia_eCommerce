import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {Warehouse} from "armonia/src/modules/eCommerce/api/eCommerce/private/warehouse/warehouse.dto.ts";
import type {DeleteResponse} from "armonia/src/modules/core/types/shared.types.ts";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import ActivateWarehouse from "@eCommerceModule/clients/panel/private/warehouses/center/actions/activateWarehouse.tsx";
import DeactivateWarehouse from "@eCommerceModule/clients/panel/private/warehouses/center/actions/deactivateWarehouse.tsx";
import ActivateWarehouseDialog from "@eCommerceModule/clients/panel/private/warehouses/center/dialogs/activateWarehouseDialog.tsx";
import DeactivateWarehouseDialog from "@eCommerceModule/clients/panel/private/warehouses/center/dialogs/deactivateWarehouseDialog.tsx";

const LIST_BASE = "/tenancy/systemSettings/warehouses";

export type WarehouseSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    warehouse?: Warehouse;
    hideActions?: boolean;
    onDelete?: (response?: DeleteResponse) => void;
    onRestore?: () => void;
    fetchId?: string;
    onSheetRowPatched?: (row: Record<string, unknown>) => void;
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
    onSheetRowPatched,
}: WarehouseSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(warehouseProp || {_id: fetchId});
    const [action, setAction] = useState("");
    const access = useAccess("warehouses");
    const viewConfig = useViewConfig("warehouses", "sheet");

    useEffect(() => {
        if (!open) setAction("");
    }, [open]);

    useEffect(() => {
        if (!warehouseProp) return;
        setSheetData(warehouseProp);
    }, [warehouseProp]);

    const entityId = warehouseProp?._id ?? fetchId;

    if (!viewConfig) return null;
    if (!entityId) return null;

    const asEntity = sheetData as Warehouse;

    return (
        <>
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
                editPath={warehouseEditPath(asEntity)}
                onSheetRowPatched={onSheetRowPatched}
                actionMenuAllowCustomChildren
                actionMenuChildren={
                    <>
                        <ActivateWarehouse entity={asEntity} onAction={(a: string) => setAction(a)} />
                        <DeactivateWarehouse entity={asEntity} onAction={(a: string) => setAction(a)} />
                    </>
                }
            />
            {action === "activateWarehouse" && (
                <ActivateWarehouseDialog
                    open={true}
                    onClose={() => setAction("")}
                    entity={asEntity}
                    onSuccess={(row) => {
                        setSheetData(row);
                        onSheetRowPatched?.(row);
                    }}
                />
            )}
            {action === "deactivateWarehouse" && (
                <DeactivateWarehouseDialog
                    open={true}
                    onClose={() => setAction("")}
                    entity={asEntity}
                    onSuccess={(row) => {
                        setSheetData(row);
                        onSheetRowPatched?.(row);
                    }}
                />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/warehouses/center/sheetView/warehouseSheetView.tsx"),
    withDebug(true, true),
)(WarehouseSheetView);
