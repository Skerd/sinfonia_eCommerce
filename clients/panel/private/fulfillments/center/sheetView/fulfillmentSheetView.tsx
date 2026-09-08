import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/context/accessContext.tsx";
import type {Fulfillment} from "armonia/src/modules/eCommerce/api/eCommerce/private/fulfillment/fulfillment.dto.ts";
import type {DeleteResponse} from "armonia/src/modules/core/types/shared.types.ts";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import ShipFulfillment from "@eCommerceModule/clients/panel/private/fulfillments/center/actions/shipFulfillment.tsx";
import MarkDeliveredFulfillment from "@eCommerceModule/clients/panel/private/fulfillments/center/actions/markDeliveredFulfillment.tsx";
import MarkFailedFulfillment from "@eCommerceModule/clients/panel/private/fulfillments/center/actions/markFailedFulfillment.tsx";
import ShipFulfillmentDialog from "@eCommerceModule/clients/panel/private/fulfillments/center/dialogs/shipFulfillmentDialog.tsx";
import MarkDeliveredFulfillmentDialog from "@eCommerceModule/clients/panel/private/fulfillments/center/dialogs/markDeliveredFulfillmentDialog.tsx";
import MarkFailedFulfillmentDialog from "@eCommerceModule/clients/panel/private/fulfillments/center/dialogs/markFailedFulfillmentDialog.tsx";

const LIST_BASE = "/eCommerce/fulfillments";

export type FulfillmentSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entity?: Fulfillment;
    hideActions?: boolean;
    onDelete?: (response?: DeleteResponse) => void;
    onRestore?: () => void;
    fetchId?: string;
    onSheetRowPatched?: (row: Record<string, unknown>) => void;
};

function fulfillmentEditPath(entity: Fulfillment) {
    const params = new URLSearchParams();
    params.set("fulfillmentId", entity._id);
    if (entity.trackingNumber) params.set("fulfillmentTitle", encodeURIComponent(String(entity.trackingNumber)));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

function FulfillmentSheetView({
    open,
    onOpenChange,
    entity: entityProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    fetchId,
    onSheetRowPatched,
}: FulfillmentSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(entityProp || {_id: fetchId});
    const [action, setAction] = useState("");
    const access = useAccess("fulfillments");
    const viewConfig = useViewConfig("fulfillments", "sheet");

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

    const asEntity = sheetData as Fulfillment;

    return (
        <>
            <SheetViewRenderer
                config={viewConfig}
                url="/api/eCommerce/fulfillment/single"
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
                editPath={fulfillmentEditPath(asEntity)}
                onSheetRowPatched={onSheetRowPatched}
                actionMenuAllowCustomChildren
                actionMenuChildren={
                    <>
                        <ShipFulfillment entity={asEntity} onAction={(a: string) => setAction(a)} />
                        <MarkDeliveredFulfillment entity={asEntity} onAction={(a: string) => setAction(a)} />
                        <MarkFailedFulfillment entity={asEntity} onAction={(a: string) => setAction(a)} />
                    </>
                }
            />
            {action === "shipFulfillment" && (
                <ShipFulfillmentDialog
                    open={true}
                    onClose={() => setAction("")}
                    entity={asEntity}
                    onSuccess={(patch: Partial<Fulfillment>) => {
                        const next = {...sheetData, ...patch};
                        setSheetData(next);
                        onSheetRowPatched?.(next);
                    }}
                />
            )}
            {action === "markDeliveredFulfillment" && (
                <MarkDeliveredFulfillmentDialog
                    open={true}
                    onClose={() => setAction("")}
                    entity={asEntity}
                    onSuccess={(patch: Partial<Fulfillment>) => {
                        const next = {...sheetData, ...patch};
                        setSheetData(next);
                        onSheetRowPatched?.(next);
                    }}
                />
            )}
            {action === "markFailedFulfillment" && (
                <MarkFailedFulfillmentDialog
                    open={true}
                    onClose={() => setAction("")}
                    entity={asEntity}
                    onSuccess={(patch: Partial<Fulfillment>) => {
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
    withLanguage("src/modules/eCommerce/clients/panel/private/fulfillments/center/sheetView/fulfillmentSheetView.tsx"),
    withDebug(true, true, "fulfillments"),
)(FulfillmentSheetView);
