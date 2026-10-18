import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import type {Order} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/order/order.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import type {OrderStatus} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/order/order.schema-def.ts";
import AcceptOrderDropdown from "@eCommerceModule/clients/panel/private/orders/center/actions/acceptOrderDropdown.tsx";
import StartOrderDropdown from "@eCommerceModule/clients/panel/private/orders/center/actions/startOrderDropdown.tsx";
import CancelOrderDropdown from "@eCommerceModule/clients/panel/private/orders/center/actions/cancelOrderDropdown.tsx";
import ExtendOrderDropdown from "@eCommerceModule/clients/panel/private/orders/center/actions/extendOrderDropdown.tsx";
import SubmitOrderDeliveryDropdown from "@eCommerceModule/clients/panel/private/orders/center/actions/submitOrderDeliveryDropdown.tsx";
import AcceptOrderDeliveryDropdown from "@eCommerceModule/clients/panel/private/orders/center/actions/acceptOrderDeliveryDropdown.tsx";
import RaiseDisputeDropdown from "@eCommerceModule/clients/panel/private/orders/center/actions/raiseDisputeDropdown.tsx";
import OrderActionConfirmAction from "@eCommerceModule/components/custom/orders/orderActionConfirmAction.tsx";
import SubmitOrderDeliveryAction from "@eCommerceModule/components/custom/orders/submitOrderDeliveryAction.tsx";
import OrderExtendAction from "@eCommerceModule/components/custom/orders/orderExtendAction.tsx";
import RequestRevisionAction from "@eCommerceModule/components/custom/orders/requestRevisionAction.tsx";
import RaiseDisputeAction from "@eCommerceModule/components/custom/disputes/raiseDisputeAction.tsx";
import type {OrderConfirmActionKey} from "@eCommerceModule/components/custom/orders/orderActionConfirmAction.tsx";

import RequestRevisionDropdown from "@eCommerceModule/clients/panel/private/orders/center/actions/requestRevisionDropdown.tsx";

export type OrderSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    order?: Order;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    onOrderUpdated?: (order: Order) => void;
    onSheetRowPatched?: (patch: Partial<Order>) => void;
    fetchId?: string;
};

function orderEditPath(row: Order) {
    const params = new URLSearchParams();
    params.set("orderId", row._id);
    return `/eCommerceMarketplace/orders/edit?${params.toString()}`;
}

function OrderSheetView({
    open,
    onOpenChange,
    order: orderProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    onOrderUpdated,
    onSheetRowPatched,
    fetchId,
}: OrderSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(orderProp || {_id: fetchId});
    const [action, setAction] = useState("");
    const access = useAccess("orders");
    const viewConfig = useViewConfig("orders", "sheet");

    useEffect(() => {
        if (!orderProp) return;
        setSheetData(orderProp);
    }, [orderProp]);

    useEffect(() => {
        if (!open) setAction("");
    }, [open]);

    const entityId = orderProp?._id ?? fetchId;
    const asOrder = sheetData as Order;
    const displayLabel = asOrder.listing?.title || asOrder.taskRequest?.title || String(entityId ?? "");

    if (!viewConfig) return null;
    if (!entityId) return null;

    const applyOrderUpdate = (patch: Partial<Order>) => {
        setSheetData((prev) => {
            const updated = {...(prev as Order), ...patch};
            onSheetRowPatched?.(patch);
            onOrderUpdated?.(updated);
            return updated;
        });
    };

    return (
        <>
            <SheetViewRenderer
                config={viewConfig}
                url="/api/eCommerceMarketplace/order/single"
                fetchId={fetchId}
                onDataFetched={(data) => setSheetData(data)}
                onSheetRowPatched={onSheetRowPatched}
                data={sheetData}
                open={open}
                onOpenChange={onOpenChange}
                resolveLanguageKey={resolveLanguageKey}
                access={access}
                hideActions={hideActions}
                onDelete={onDelete}
                onRestore={onRestore}
                editPath={orderEditPath(asOrder)}
                actionMenuAllowCustomChildren
                actionMenuChildren={
                    <>
                        <AcceptOrderDropdown order={asOrder} onAction={setAction} />
                        <StartOrderDropdown order={asOrder} onAction={setAction} />
                        <CancelOrderDropdown order={asOrder} onAction={setAction} />
                        <ExtendOrderDropdown order={asOrder} onAction={setAction} />
                        <SubmitOrderDeliveryDropdown order={asOrder} onAction={setAction} />
                        <AcceptOrderDeliveryDropdown order={asOrder} onAction={setAction} />
                        <RequestRevisionDropdown order={asOrder} onAction={setAction} />
                        <RaiseDisputeDropdown order={asOrder} onAction={setAction} />
                    </>
                }
            />
            {(action === "accept" || action === "start" || action === "cancel" || action === "acceptDelivery") && (
                <OrderActionConfirmAction
                    orderId={String(asOrder._id)}
                    displayName={displayLabel}
                    actionKey={action as OrderConfirmActionKey}
                    openAlert
                    url={`/api/eCommerceMarketplace/order/${action}`}
                    onSuccess={(newStatus: OrderStatus) => {
                        applyOrderUpdate({status: newStatus});
                        setAction("");
                    }}
                    onCancel={() => setAction("")}
                />
            )}
            {action === "submitDelivery" && (
                <SubmitOrderDeliveryAction
                    orderId={String(asOrder._id)}
                    displayName={displayLabel}
                    openAlert
                    url="/api/eCommerceMarketplace/order/submitDelivery"
                    onSuccess={() => {
                        applyOrderUpdate({deliverySubmitted: true});
                        setAction("");
                    }}
                    onCancel={() => setAction("")}
                />
            )}
            {action === "extend" && (
                <OrderExtendAction
                    orderId={String(asOrder._id)}
                    displayName={displayLabel}
                    currentDueDate={asOrder.deliveryDueDate}
                    openAlert
                    url="/api/eCommerceMarketplace/order/extend"
                    onSuccess={(newDueDate: string) => {
                        applyOrderUpdate({deliveryDueDate: newDueDate});
                        setAction("");
                    }}
                    onCancel={() => setAction("")}
                />
            )}
            {action === "requestRevision" && (
                <RequestRevisionAction
                    orderId={String(asOrder._id)}
                    displayName={displayLabel}
                    openAlert
                    url="/api/eCommerceMarketplace/order/requestRevision"
                    onSuccess={() => {
                        applyOrderUpdate({deliverySubmitted: false});
                        setAction("");
                    }}
                    onCancel={() => setAction("")}
                />
            )}
            {action === "raiseDispute" && (
                <RaiseDisputeAction
                    orderId={String(asOrder._id)}
                    displayName={displayLabel}
                    openAlert
                    url="/api/eCommerceMarketplace/dispute"
                    onSuccess={() => {
                        applyOrderUpdate({hasActiveDispute: true});
                        setAction("");
                    }}
                    onCancel={() => setAction("")}
                />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/orders/center/sheetView/orderSheetView.tsx"),
    withDebug(true, true, "orders"),
)(OrderSheetView);
