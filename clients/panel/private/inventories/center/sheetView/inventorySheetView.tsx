import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {Inventory} from "armonia/src/modules/eCommerce/api/eCommerce/private/inventory/inventory.dto.ts";
import type {DeleteResponse} from "armonia/src/modules/core/types/shared.types.ts";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import RestockInventoryDropdown from "@eCommerceModule/clients/panel/private/inventories/center/actions/restockInventoryDropdown.tsx";
import DeductInventoryDropdown from "@eCommerceModule/clients/panel/private/inventories/center/actions/deductInventoryDropdown.tsx";
import ViewInventoryMovementsMenuItem from "@eCommerceModule/clients/panel/private/inventories/center/actions/viewInventoryMovements.tsx";
import InventoryStockMoveAction from "@eCommerceModule/components/custom/inventories/inventoryStockMoveAction.tsx";
import ViewInventoryMovementsDialog from "@eCommerceModule/clients/panel/private/inventories/center/dialogs/viewInventoryMovementsDialog.tsx";

export type InventorySheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    inventory?: Inventory;
    hideActions?: boolean;
    onDelete?: (response?: DeleteResponse) => void;
    onRestore?: () => void;
    fetchId?: string;
    onInventoryUpdated?: (updated?: Inventory) => void;
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
    onInventoryUpdated,
}: InventorySheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(inventoryProp || {_id: fetchId});
    const [action, setAction] = useState<string>("");
    const [fetchKey, setFetchKey] = useState(0);
    const access = useAccess("inventories");
    const viewConfig = useViewConfig("inventories", "sheet");

    useEffect(() => {
        if (!inventoryProp) return;
        setSheetData((prev) => {
            const next: Record<string, unknown> = {
                ...inventoryProp,
            };
            for (const [key, value] of Object.entries(prev)) {
                if (!(key in inventoryProp) || (inventoryProp as Record<string, unknown>)[key] === undefined) {
                    next[key] = value;
                }
            }
            return next;
        });
    }, [inventoryProp]);

    const entityId = inventoryProp?._id ?? fetchId;

    if (!viewConfig) return null;
    if (!entityId) return null;

    const asInventory = sheetData as Inventory;

    return (
        <>
            <SheetViewRenderer
                key={fetchKey}
                config={viewConfig}
                url="/api/eCommerce/inventory/single"
                fetchId={fetchId ?? inventoryProp?._id}
                onDataFetched={(data) => setSheetData(data || {})}
                data={sheetData}
                open={open}
                onOpenChange={onOpenChange}
                resolveLanguageKey={resolveLanguageKey}
                access={access}
                hideActions={hideActions}
                onDelete={onDelete}
                onRestore={onRestore}
                actionMenuAllowCustomChildren
                actionMenuChildren={
                    <>
                        <ViewInventoryMovementsMenuItem inventory={asInventory} onAction={setAction} />
                        <RestockInventoryDropdown inventory={asInventory} onAction={setAction} />
                        <DeductInventoryDropdown inventory={asInventory} onAction={setAction} />
                    </>
                }
            />
            {action === "viewInventoryMovements" && (
                <ViewInventoryMovementsDialog
                    open
                    onClose={() => setAction("")}
                    inventory={asInventory}
                />
            )}
            {(action === "restock" || action === "deduct") && (
                <InventoryStockMoveAction
                    inventoryId={String(asInventory._id)}
                    displayName={asInventory.product?.title}
                    mode={action}
                    openAlert
                    url={`/api/eCommerce/inventory/${action}`}
                    onSuccess={(updated) => {
                        setAction("");
                        setFetchKey((k) => k + 1);
                        onInventoryUpdated?.(updated);
                    }}
                    onCancel={() => setAction("")}
                />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/inventories/center/sheetView/inventorySheetView.tsx"),
    withDebug(true, true),
)(InventorySheetView);
