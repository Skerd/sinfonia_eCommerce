import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/context/accessContext.tsx";
import type {ReturnRequest} from "armonia/src/modules/eCommerce/api/eCommerce/private/returnRequest/returnRequest.dto.ts";
import type {DeleteResponse} from "armonia/src/modules/core/types/shared.types.ts";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import ApproveReturnRequest from "@eCommerceModule/clients/panel/private/returnRequests/center/actions/approveReturnRequest.tsx";
import RejectReturnRequest from "@eCommerceModule/clients/panel/private/returnRequests/center/actions/rejectReturnRequest.tsx";
import ApproveReturnRequestDialog from "@eCommerceModule/clients/panel/private/returnRequests/center/dialogs/approveReturnRequestDialog.tsx";
import RejectReturnRequestDialog from "@eCommerceModule/clients/panel/private/returnRequests/center/dialogs/rejectReturnRequestDialog.tsx";

const LIST_BASE = "/eCommerce/returnrequests";

export type ReturnRequestSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entity?: ReturnRequest;
    hideActions?: boolean;
    onDelete?: (response?: DeleteResponse) => void;
    onRestore?: () => void;
    fetchId?: string;
    onSheetRowPatched?: (row: Record<string, unknown>) => void;
};

function returnRequestEditPath(entity: ReturnRequest) {
    const params = new URLSearchParams();
    params.set("returnRequestId", entity._id);
    if (entity.type) params.set("returnRequestTitle", encodeURIComponent(String(entity.type)));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

function ReturnRequestSheetView({
    open,
    onOpenChange,
    entity: entityProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    fetchId,
    onSheetRowPatched,
}: ReturnRequestSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(entityProp || {_id: fetchId});
    const [action, setAction] = useState("");
    const access = useAccess("returnRequests");
    const viewConfig = useViewConfig("returnRequests", "sheet");

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

    const asEntity = sheetData as ReturnRequest;

    return (
        <>
            <SheetViewRenderer
                config={viewConfig}
                url="/api/eCommerce/returnRequest/single"
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
                editPath={returnRequestEditPath(asEntity)}
                onSheetRowPatched={onSheetRowPatched}
                actionMenuAllowCustomChildren
                actionMenuChildren={
                    <>
                        <ApproveReturnRequest entity={asEntity} onAction={(a: string) => setAction(a)} />
                        <RejectReturnRequest entity={asEntity} onAction={(a: string) => setAction(a)} />
                    </>
                }
            />
            {action === "approveReturnRequest" && (
                <ApproveReturnRequestDialog
                    open={true}
                    onClose={() => setAction("")}
                    entity={asEntity}
                    onSuccess={(patch: Partial<ReturnRequest>) => {
                        const next = {...sheetData, ...patch};
                        setSheetData(next);
                        onSheetRowPatched?.(next);
                    }}
                />
            )}
            {action === "rejectReturnRequest" && (
                <RejectReturnRequestDialog
                    open={true}
                    onClose={() => setAction("")}
                    entity={asEntity}
                    onSuccess={(patch: Partial<ReturnRequest>) => {
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
    withLanguage("src/modules/eCommerce/clients/panel/private/returnRequests/center/sheetView/returnRequestSheetView.tsx"),
    withDebug(true, true, "returnRequests"),
)(ReturnRequestSheetView);
