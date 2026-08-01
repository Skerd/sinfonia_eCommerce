import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {ProductOrder} from "armonia/src/modules/eCommerce/api/eCommerce/private/productOrder/productOrder.dto.ts";
import type {DeleteResponse} from "armonia/src/modules/core/types/shared.types.ts";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import ConfirmOrderDropdown from "@eCommerceModule/clients/panel/private/productOrders/center/actions/confirmOrderDropdown.tsx";
import MarkProcessingDropdown from "@eCommerceModule/clients/panel/private/productOrders/center/actions/markProcessingDropdown.tsx";
import ShipOrderDropdown from "@eCommerceModule/clients/panel/private/productOrders/center/actions/shipOrderDropdown.tsx";
import CancelOrderDropdown from "@eCommerceModule/clients/panel/private/productOrders/center/actions/cancelOrderDropdown.tsx";
import RefundOrderDropdown from "@eCommerceModule/clients/panel/private/productOrders/center/actions/refundOrderDropdown.tsx";
import ProductOrderActionConfirmAction, {type ProductOrderConfirmActionKey} from "@eCommerceModule/components/custom/productOrders/productOrderActionConfirmAction.tsx";
import ShipProductOrderAction from "@eCommerceModule/components/custom/productOrders/shipProductOrderAction.tsx";
import RefundProductOrderAction from "@eCommerceModule/components/custom/productOrders/refundProductOrderAction.tsx";

export type ProductOrderSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    order?: ProductOrder;
    hideActions?: boolean;
    onDelete?: (response?: DeleteResponse) => void;
    onRestore?: () => void;
    fetchId?: string;
};

function ProductOrderSheetView({
    open,
    onOpenChange,
    order: orderProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    fetchId,
}: ProductOrderSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(orderProp || {_id: fetchId});
    const [action, setAction] = useState<string>("");
    const access = useAccess("productOrders");
    const viewConfig = useViewConfig("productOrders", "sheet");

    useEffect(() => {
        if (!orderProp) return;
        setSheetData((prev) => ({
            ...orderProp,
            // Keep /single enrichments (list rows don't include related payment txs).
            paymentTransactions:
                (orderProp as ProductOrder).paymentTransactions ??
                (prev as ProductOrder).paymentTransactions,
        }));
    }, [orderProp]);

    const entityId = orderProp?._id ?? fetchId;

    if (!viewConfig) return null;
    if (!entityId) return null;

    const asOrder = sheetData as ProductOrder;

    const applyOrderUpdate = (patch: Partial<ProductOrder>) => {
        setSheetData((prev) => ({...prev, ...patch}));
    };

    return (
        <>
            <SheetViewRenderer
                config={viewConfig}
                url="/api/eCommerce/productOrder/single"
                fetchId={fetchId ?? orderProp?._id}
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
                    <>
                        <ConfirmOrderDropdown order={asOrder} onAction={setAction} />
                        <MarkProcessingDropdown order={asOrder} onAction={setAction} />
                        <ShipOrderDropdown order={asOrder} onAction={setAction} />
                        <CancelOrderDropdown order={asOrder} onAction={setAction} />
                        <RefundOrderDropdown order={asOrder} onAction={setAction} />
                    </>
                }
            />
            {(action === "confirm" || action === "markProcessing" || action === "cancel") && (
                <ProductOrderActionConfirmAction
                    orderId={String(asOrder._id)}
                    displayName={asOrder.orderNumber}
                    actionKey={action as ProductOrderConfirmActionKey}
                    openAlert
                    url={`/api/eCommerce/productOrder/${action}`}
                    onSuccess={(newStatus) => {
                        applyOrderUpdate({status: newStatus});
                        setAction("");
                    }}
                    onCancel={() => setAction("")}
                />
            )}
            {action === "ship" && (
                <ShipProductOrderAction
                    orderId={String(asOrder._id)}
                    displayName={asOrder.orderNumber}
                    openAlert
                    url="/api/eCommerce/productOrder/ship"
                    onSuccess={() => {
                        applyOrderUpdate({status: "shipped", fulfillmentStatus: "fulfilled"});
                        setAction("");
                    }}
                    onCancel={() => setAction("")}
                />
            )}
            {action === "refund" && (
                <RefundProductOrderAction
                    orderId={String(asOrder._id)}
                    displayName={asOrder.orderNumber}
                    openAlert
                    url="/api/eCommerce/productOrder/refund"
                    onSuccess={(fullRefund) => {
                        applyOrderUpdate(
                            fullRefund
                                ? {paymentStatus: "refunded", status: "refunded"}
                                : {paymentStatus: "partially_refunded"},
                        );
                        setAction("");
                    }}
                    onCancel={() => setAction("")}
                />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/productOrders/center/sheetView/productOrderSheetView.tsx"),
    withDebug(true, true),
)(ProductOrderSheetView);
