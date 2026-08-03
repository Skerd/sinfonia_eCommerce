import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useEffect, useState} from "react";
import {Card} from "@coreModule/components/ui/card.tsx";
import ValueNotSet from "@coreModule/components/custom/valueNotSet.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {ProductOrder} from "armonia/src/modules/eCommerce/api/eCommerce/private/productOrder/productOrder.dto.ts";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import {IconPackage, IconUser} from "@tabler/icons-react";
import ProductOrderSheetView from "@eCommerceModule/clients/panel/private/productOrders/center/sheetView/productOrderSheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import ConfirmOrderDropdown from "@eCommerceModule/clients/panel/private/productOrders/center/actions/confirmOrderDropdown.tsx";
import MarkProcessingDropdown from "@eCommerceModule/clients/panel/private/productOrders/center/actions/markProcessingDropdown.tsx";
import ShipOrderDropdown from "@eCommerceModule/clients/panel/private/productOrders/center/actions/shipOrderDropdown.tsx";
import CancelOrderDropdown from "@eCommerceModule/clients/panel/private/productOrders/center/actions/cancelOrderDropdown.tsx";
import RefundOrderDropdown from "@eCommerceModule/clients/panel/private/productOrders/center/actions/refundOrderDropdown.tsx";
import ProductOrderActionConfirmAction, {type ProductOrderConfirmActionKey} from "@eCommerceModule/components/custom/productOrders/productOrderActionConfirmAction.tsx";
import ShipProductOrderAction from "@eCommerceModule/components/custom/productOrders/shipProductOrderAction.tsx";
import RefundProductOrderAction from "@eCommerceModule/components/custom/productOrders/refundProductOrderAction.tsx";

function statusColor(status: string): string {
    switch (status) {
        case "delivered":
            return "text-success bg-success";
        case "shipped":
        case "processing":
        case "confirmed":
            return "text-info bg-info";
        case "cancelled":
        case "refunded":
            return "text-destructive bg-destructive";
        default:
            return "text-warning bg-warning";
    }
}

function formatMoney(
    order: ProductOrder,
    currencyRead?: {keys?: {symbol?: unknown; abbreviation?: unknown}},
): string {
    const c = order.currency;
    const symbol = currencyRead?.keys?.symbol ? c?.symbol?.trim() : undefined;
    const abbreviation = currencyRead?.keys?.abbreviation ? c?.abbreviation?.trim() : undefined;
    const prefix = symbol || abbreviation;
    const n = (order.grandTotal ?? 0).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2});
    return prefix ? `${prefix} ${n}` : n;
}

type ProductOrderCardProps = WithLanguageType & {
    order: ProductOrder;
    onDelete?: (deleted?: ProductOrder, response?: DeletedData) => void;
    onRestore?: () => void;
    onOrderUpdated?: (order: ProductOrder) => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
};

function ProductOrderCard({
    order: orderProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    onOrderUpdated,
    hideActions = false,
    sheetOnly = false,
}: ProductOrderCardProps) {
    const [action, setAction] = useState<string>("");
    const [order, setOrder] = useState<ProductOrder>(orderProp);
    const [hideAfterDeletion, setHideAfterDeletion] = useState(false);

    const onDelete = (data: DeletedData) => {
        if (!data.deletedBy && !data.deletedAt) {
            setHideAfterDeletion(true);
        } else if (onDeleteProp) {
            onDeleteProp(order, data);
        } else {
            setOrder({...order, ...data});
        }
    };

    const onRestore = () => {
        if (onRestoreProp) {
            onRestoreProp();
        } else {
            setOrder({...order, deletedAt: undefined, deletedBy: undefined});
        }
    };

    const {read, restore} = useAccess("productOrders");

    useEffect(() => {
        setOrder(orderProp);
    }, [orderProp]);

    if (hideAfterDeletion) {
        return <></>;
    }
    if (!restore && order.deletedAt != null) {
        return <></>;
    }
    if (!read || !Object.keys(read).length) {
        return <HiddenElement />;
    }

    const colors = statusColor(order.status);
    const itemCount = order.items?.length;

    const applyOrderUpdate = (patch: Partial<ProductOrder>) => {
        setOrder((prev) => {
            const updated = {...prev, ...patch};
            onOrderUpdated?.(updated);
            return updated;
        });
    };

    return (
        <>
            {!sheetOnly && (
                <Card
                    className={cn("group p-0 h-full relative transition-[box-shadow,--tw-ring-color] duration-200 hover:cursor-pointer hover:shadow-md hover:ring-primary/40")}
                    onClick={() => setAction("view")}
                >
                    <div className="flex w-full items-stretch">
                        {(read.deletedBy || read.deletedAt) && (
                            <DeletedInfo deletedAt={order.deletedAt} deletedBy={order.deletedBy} />
                        )}
                        <div className="w-full min-w-0 py-3 px-4">
                            <div className="flex justify-between items-start gap-2">
                                <div className="min-w-0 flex-1">
                                    <HiddenElement randomLength={10}>
                                        {read?.orderNumber ? (
                                            <div className="font-semibold text-base leading-tight truncate">
                                                {order.orderNumber || <ValueNotSet />}
                                            </div>
                                        ) : null}
                                    </HiddenElement>
                                    {(!!order.customer || !read?.customer) && (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                            <IconUser className="w-3.5 h-3.5 shrink-0" />
                                            <HiddenElement randomLength={read?.customer ? 0 : 8}>
                                                {!!read?.customer ? (
                                                    <span className="truncate">
                                                        {read?.customer?.keys?.name ? order.customer?.name ?? "" : ""}
                                                        {read?.customer?.keys?.name && read?.customer?.keys?.surname ? " " : ""}
                                                        {read?.customer?.keys?.surname ? order.customer?.surname ?? "" : ""}
                                                    </span>
                                                ) : null}
                                            </HiddenElement>
                                        </div>
                                    )}
                                </div>
                                {!hideActions && (
                                    <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                                        <ActionMenu
                                            accessModel={"productOrders"}
                                            deletedData={order}
                                            onAction={(a: string) => setAction(a)}
                                            editPath=""
                                            hideEdit
                                            allowMenuForCustomChildren
                                        >
                                            <ConfirmOrderDropdown order={order} onAction={(a: string) => setAction(a)} />
                                            <MarkProcessingDropdown order={order} onAction={(a: string) => setAction(a)} />
                                            <ShipOrderDropdown order={order} onAction={(a: string) => setAction(a)} />
                                            <CancelOrderDropdown order={order} onAction={(a: string) => setAction(a)} />
                                            <RefundOrderDropdown order={order} onAction={(a: string) => setAction(a)} />
                                        </ActionMenu>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between gap-2 mt-3">
                                <HiddenElement randomLength={read?.status ? 0 : 6}>
                                    {!!read?.status && order.status ? (
                                        <span
                                            className={cn(
                                                "inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide",
                                                colors.split(" ")[0],
                                            )}
                                        >
                                            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", colors.split(" ")[1])} />
                                            {resolveLanguageKey("orderStatus." + order.status)}
                                        </span>
                                    ) : null}
                                </HiddenElement>
                                <HiddenElement randomLength={read?.grandTotal ? 0 : 8}>
                                    {!!read?.grandTotal ? (
                                        <span className="font-bold text-base text-foreground leading-none ml-auto">
                                            {formatMoney(order, read?.currency)}
                                        </span>
                                    ) : null}
                                </HiddenElement>
                            </div>

                            {(itemCount != null || !read?.items) && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                                    <IconPackage className="w-3.5 h-3.5 shrink-0" />
                                    <HiddenElement randomLength={read?.items ? 0 : 6}>
                                        {!!read?.items && itemCount != null ? (
                                            <span>
                                                {itemCount} {resolveLanguageKey("items")}
                                            </span>
                                        ) : null}
                                    </HiddenElement>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            )}

            {!!action && (
                <>
                    {action === "view" && (
                        <ProductOrderSheetView
                            open={action === "view"}
                            onOpenChange={() => setAction("")}
                            order={order}
                            fetchId={order._id}
                            onDelete={onDelete}
                            onRestore={onRestore}
                        />
                    )}
                    {action === "delete" && (
                        <DeleteAction
                            accessModel={"productOrders"}
                            deleteId={order._id}
                            openAlert={action === "delete"}
                            name={read?.orderNumber && order.orderNumber}
                            confirmName={read?.orderNumber && order.orderNumber}
                            onSuccess={onDelete}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/productOrder"
                        />
                    )}
                    {action === "restore" && (
                        <RestoreAction
                            accessModel={"productOrders"}
                            deleteId={order._id}
                            openAlert={action === "restore"}
                            name={read?.orderNumber && order.orderNumber}
                            confirmName={read?.orderNumber && order.orderNumber}
                            onSuccess={onRestore}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/productOrder/restore"
                        />
                    )}
                    {(action === "confirm" || action === "markProcessing" || action === "cancel") && (
                        <ProductOrderActionConfirmAction
                            orderId={order._id}
                            displayName={order.orderNumber}
                            actionKey={action as ProductOrderConfirmActionKey}
                            openAlert
                            url={`/api/eCommerce/productOrder/${action}`}
                            onSuccess={(newStatus: ProductOrder["status"]) => {
                                applyOrderUpdate({status: newStatus});
                                setAction("");
                            }}
                            onCancel={() => setAction("")}
                        />
                    )}
                    {action === "ship" && (
                        <ShipProductOrderAction
                            orderId={order._id}
                            displayName={order.orderNumber}
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
                            orderId={order._id}
                            displayName={order.orderNumber}
                            openAlert
                            url="/api/eCommerce/productOrder/refund"
                            onSuccess={(fullRefund: boolean) => {
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
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/productOrders/center/cardView/productOrderCard.tsx"),
    withDebug(true, true),
)(ProductOrderCard);
