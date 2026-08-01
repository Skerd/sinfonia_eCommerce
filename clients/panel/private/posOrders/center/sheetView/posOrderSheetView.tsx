import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {PosOrder} from "armonia/src/modules/eCommerce/api/eCommerce/private/posOrder/posOrder.dto.ts";
import type {DeleteResponse} from "armonia/src/modules/core/types/shared.types.ts";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import ReprintPosOrder from "@eCommerceModule/clients/panel/private/posOrders/center/actions/reprintPosOrder.tsx";
import ReprintPosOrderDialog from "@eCommerceModule/clients/panel/private/posOrders/center/dialogs/reprintPosOrderDialog.tsx";

export type PosOrderSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entity?: PosOrder;
    hideActions?: boolean;
    onDelete?: (response?: DeleteResponse) => void;
    onRestore?: () => void;
    fetchId?: string;
};

function PosOrderSheetView({
    open,
    onOpenChange,
    entity: entityProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    fetchId,
}: PosOrderSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(entityProp || {_id: fetchId});
    const [action, setAction] = useState("");
    const access = useAccess("posOrders");
    const viewConfig = useViewConfig("posOrders", "sheet");

    useEffect(() => {
        if (!open) setAction("");
    }, [open]);

    useEffect(() => {
        if (!entityProp) return;
        setSheetData((prev) => ({
            ...entityProp,
            // Keep /single enrichments (list rows may omit nested refs).
            productOrder: entityProp.productOrder ?? (prev as PosOrder).productOrder,
            refundOf: entityProp.refundOf ?? (prev as PosOrder).refundOf,
            session: entityProp.session ?? (prev as PosOrder).session,
            config: entityProp.config ?? (prev as PosOrder).config,
        }));
    }, [entityProp]);

    const entityId = entityProp?._id ?? fetchId;

    if (!viewConfig) return null;
    if (!entityId) return null;

    const asOrder = sheetData as PosOrder;

    return (
        <>
            <SheetViewRenderer
                config={viewConfig}
                url="/api/eCommerce/posOrder/single"
                fetchId={fetchId ?? entityProp?._id}
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
                hideEdit
                actionMenuAllowCustomChildren
                actionMenuChildren={
                    <ReprintPosOrder entity={asOrder} onAction={(a: string) => setAction(a)} />
                }
            />
            {action === "reprintPosOrder" && (
                <ReprintPosOrderDialog
                    open={true}
                    onClose={() => setAction("")}
                    entity={asOrder}
                />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/posOrders/center/sheetView/posOrderSheetView.tsx"),
    withDebug(true, true),
)(PosOrderSheetView);
