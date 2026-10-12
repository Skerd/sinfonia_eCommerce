import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import type {StockTransfer} from "armonia/src/modules/eCommerce/api/eCommerce/private/stockTransfer/stockTransfer.dto.ts";
import type {DeleteResponse} from "armonia/src/modules/core/types/shared.types.ts";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import StockDocumentActionItems from "@eCommerceModule/components/custom/stockDocuments/stockDocumentActionItems.tsx";
import StockDocumentActionDialog from "@eCommerceModule/components/custom/stockDocuments/stockDocumentActionDialog.tsx";
import {isStockDocumentAction} from "@eCommerceModule/components/custom/stockDocuments/stockDocumentActions.ts";

export function stockTransferEditPath(entity: {_id: string}) {
    const params = new URLSearchParams();
    params.set("stockTransferId", entity._id);
    return `/eCommerce/stocktransfers/edit?${params.toString()}`;
}

export type StockTransferSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entity?: StockTransfer;
    hideActions?: boolean;
    onDelete?: (response?: DeleteResponse) => void;
    onRestore?: () => void;
    fetchId?: string;
    onSheetRowPatched?: (row: Record<string, unknown>) => void;
};

function StockTransferSheetView({
    open,
    onOpenChange,
    entity: entityProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    fetchId,
    onSheetRowPatched,
}: StockTransferSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(entityProp || {_id: fetchId});
    const [action, setAction] = useState("");
    const access = useAccess("stockTransfers");
    const viewConfig = useViewConfig("stockTransfers", "sheet");

    useEffect(() => {
        if (!open) setAction("");
    }, [open]);

    useEffect(() => {
        if (!entityProp) return;
        setSheetData(entityProp);
    }, [entityProp]);

    const entityId = entityProp?._id ?? fetchId;

    if (!viewConfig) return null;
    if (!entityId) return null;

    const asEntity = sheetData as StockTransfer;

    return (
        <>
            <SheetViewRenderer
                config={viewConfig}
                url="/api/eCommerce/stockTransfer/single"
                fetchId={fetchId}
                onDataFetched={(data) => setSheetData(data)}
                data={sheetData}
                open={open}
                onOpenChange={onOpenChange}
                resolveLanguageKey={resolveLanguageKey}
                access={access}
                hideActions={hideActions}
                onDelete={onDelete}
                onRestore={onRestore}
                editPath={stockTransferEditPath(asEntity)}
                hideEdit={asEntity.status !== "draft"}
                onSheetRowPatched={onSheetRowPatched}
                actionMenuAllowCustomChildren
                actionMenuChildren={<StockDocumentActionItems resource="stockTransfers" entity={asEntity} onAction={setAction} />}
            />
            {isStockDocumentAction("stockTransfers", action) && (
                <StockDocumentActionDialog
                    resource="stockTransfers"
                    action={action}
                    entity={asEntity}
                    onClose={() => setAction("")}
                    onSuccess={(patch) => {
                        const next = {...sheetData, ...patch};
                        setSheetData(next);
                        onSheetRowPatched?.(next);
                    }}
                />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/stockTransfers/center/sheetView/stockTransferSheetView.tsx"),
    withDebug(true, true, "stockTransfers"),
)(StockTransferSheetView);
