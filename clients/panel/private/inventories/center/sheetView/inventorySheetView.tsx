import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {Inventory} from "armonia/src/modules/eCommerce/api/eCommerce/private/inventory/inventory.dto.ts";
import type {DeleteResponse} from "armonia/src/modules/core/types/shared.types.ts";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";

export type InventorySheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    inventory?: Inventory;
    hideActions?: boolean;
    onDelete?: (response?: DeleteResponse) => void;
    onRestore?: () => void;
    fetchId?: string;
};

function InventorySheetView({
    open,
    onOpenChange,
    inventory: inventoryProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    fetchId,
}: InventorySheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(inventoryProp || {_id: fetchId});
    const access = useAccess("inventories");
    const viewConfig = useViewConfig("inventories", "sheet");

    useEffect(() => {
        if (!inventoryProp) return;
        setSheetData(inventoryProp);
    }, [inventoryProp]);

    const entityId = inventoryProp?._id ?? fetchId;

    if (!viewConfig) return null;
    if (!entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/eCommerce/inventory/single"
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
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/inventories/center/sheetView/inventorySheetView.tsx"),
    withDebug(true, true),
)(InventorySheetView);
