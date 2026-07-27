import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {InventoryMovement} from "armonia/src/modules/eCommerce/api/eCommerce/private/inventoryMovement/inventoryMovement.dto.ts";
import type {DeleteResponse} from "armonia/src/modules/core/types/shared.types.ts";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";

export type InventoryMovementSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    movement?: InventoryMovement;
    hideActions?: boolean;
    onDelete?: (response?: DeleteResponse) => void;
    onRestore?: () => void;
    fetchId?: string;
};

function InventoryMovementSheetView({
    open,
    onOpenChange,
    movement: movementProp,
    resolveLanguageKey,
    hideActions = true,
    onDelete = () => {},
    onRestore = () => {},
    fetchId,
}: InventoryMovementSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(movementProp || {_id: fetchId});
    const access = useAccess("inventoryMovements");
    const viewConfig = useViewConfig("inventoryMovements", "sheet");

    useEffect(() => {
        if (!movementProp) return;
        setSheetData(movementProp);
    }, [movementProp]);

    const entityId = movementProp?._id ?? fetchId;

    if (!viewConfig) return null;
    if (!entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/eCommerce/inventoryMovement/single"
            fetchId={fetchId ?? movementProp?._id}
            onDataFetched={(data) => setSheetData(data)}
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
    withLanguage(
        "src/modules/eCommerce/clients/panel/private/inventoryMovements/center/sheetView/inventoryMovementSheetView.tsx",
    ),
    withDebug(true, true),
)(InventoryMovementSheetView);
