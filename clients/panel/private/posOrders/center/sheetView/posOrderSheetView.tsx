import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import type {PosOrder} from "armonia/src/modules/eCommerce/api/eCommerce/private/posOrder/posOrder.dto.ts";
import type {DeleteResponse} from "armonia/src/modules/core/types/shared.types.ts";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import SheetNameTitle from "@coreModule/components/entityPage/sheet/sheetNameTitle.tsx";
import StatusBadge from "@coreModule/components/entityPage/sheet/statusBadge.tsx";
import {DATE_FORMATS, formatDate} from "@coreModule/helpers/general/dateTime.ts";
import {useCompanyTimeZone} from "@coreModule/helpers/hooks/useCompanyTimeZone.ts";
import {getName} from "@coreModule/helpers/general/names.ts";
import ReprintPosOrder from "@eCommerceModule/clients/panel/private/posOrders/center/actions/reprintPosOrder.tsx";
import ReprintPosOrderDialog from "@eCommerceModule/clients/panel/private/posOrders/center/dialogs/reprintPosOrderDialog.tsx";
import PosOrderFiscalActions from "@eCommerceModule/clients/panel/private/posOrders/center/actions/posOrderFiscalActions.tsx";
import RecordPosOrderFiscalCodesDialog from "@eCommerceModule/clients/panel/private/posOrders/center/dialogs/recordPosOrderFiscalCodesDialog.tsx";
import ResendPosOrderFiscalDialog from "@eCommerceModule/clients/panel/private/posOrders/center/dialogs/resendPosOrderFiscalDialog.tsx";

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
    const companyZone = useCompanyTimeZone();

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
    // "Besa Leka · 5.11.2026, 14:32" (or "Walk-in · …") with the order number as a badge, state in tone (UX-01, UX-02).
    // Until the order has loaded there is nobody to call "Walk-in".
    const customerLabel = asOrder.name ? asOrder.customerName || getName(asOrder.customer) || String(resolveLanguageKey("walkIn")) : "";
    const soldAt = formatDate(asOrder.createdAt, {timeZone: companyZone, format: DATE_FORMATS.dateTime});

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
                headerTitle={<SheetNameTitle name={[customerLabel, soldAt].filter(Boolean).join(" · ")} code={asOrder.name} typeLabel={String(resolveLanguageKey("typeLabel"))} />}
                headerDescription={<StatusBadge tableConfigKey="posOrders" field="state" value={asOrder.state} label={String(resolveLanguageKey(`posOrderState.${asOrder.state}`))} />}
                access={access}
                hideActions={hideActions}
                onDelete={onDelete}
                onRestore={onRestore}
                hideEdit
                hideDelete
                hideRestore
                actionMenuAllowCustomChildren
                actionMenuChildren={
                    <>
                        <ReprintPosOrder entity={asOrder} onAction={(a: string) => setAction(a)} />
                        <PosOrderFiscalActions entity={asOrder} onAction={(a: string) => setAction(a)} />
                    </>
                }
            />
            {action === "reprintPosOrder" && (
                <ReprintPosOrderDialog
                    open={true}
                    onClose={() => setAction("")}
                    entity={asOrder}
                />
            )}
            {action === "recordPosOrderFiscalCodes" && (
                <RecordPosOrderFiscalCodesDialog
                    open={true}
                    onClose={() => setAction("")}
                    entity={asOrder}
                    onSuccess={(order: PosOrder) => setSheetData({...order})}
                />
            )}
            {action === "resendPosOrderFiscal" && (
                <ResendPosOrderFiscalDialog
                    open={true}
                    onClose={() => setAction("")}
                    entity={asOrder}
                    onSuccess={(order: PosOrder) => setSheetData({...order})}
                />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/posOrders/center/sheetView/posOrderSheetView.tsx"),
    withDebug(true, true, "posOrders"),
)(PosOrderSheetView);
