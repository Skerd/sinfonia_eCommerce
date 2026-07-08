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

function statusColor(status: string): string {
    switch (status) {
        case "delivered":
            return "text-emerald-600 bg-emerald-500";
        case "shipped":
        case "processing":
        case "confirmed":
            return "text-sky-600 bg-sky-500";
        case "cancelled":
        case "refunded":
            return "text-red-600 bg-red-500";
        default:
            return "text-amber-600 bg-amber-500";
    }
}

function formatMoney(order: ProductOrder): string {
    const c = order.currency;
    const prefix = c?.symbol?.trim() || c?.abbreviation?.trim();
    const n = (order.grandTotal ?? 0).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2});
    return prefix ? `${prefix} ${n}` : n;
}

type ProductOrderCardProps = WithLanguageType & {
    order: ProductOrder;
    onDelete?: (deleted?: ProductOrder, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
};

function ProductOrderCard({
    order: orderProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
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

    return (
        <>
            {!sheetOnly && (
                <Card
                    className={cn("group p-0 h-full relative transition-all duration-300 hover:shadow-md hover:cursor-pointer")}
                    onClick={() => setAction("view")}
                >
                    <div className="flex w-full items-stretch">
                        {(read.deletedBy || read.deletedAt) && (
                            <DeletedInfo deletedAt={order.deletedAt} deletedBy={order.deletedBy} />
                        )}
                        <div className="w-full min-w-0 py-3 px-4">
                            <div className="flex justify-between items-start gap-2">
                                <div className="min-w-0 flex-1">
                                    <HiddenElement showLock randomLength={0}>
                                        {read?.orderNumber && (
                                            <div className="font-semibold text-base leading-tight truncate">
                                                {order.orderNumber || <ValueNotSet />}
                                            </div>
                                        )}
                                    </HiddenElement>
                                    {read?.customer && order.customer && (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                            <IconUser className="w-3.5 h-3.5 shrink-0" />
                                            <span className="truncate">
                                                {order.customer.name} {order.customer.surname}
                                            </span>
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
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between gap-2 mt-3">
                                {read?.status && order.status && (
                                    <span
                                        className={cn(
                                            "inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide",
                                            colors.split(" ")[0],
                                        )}
                                    >
                                        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", colors.split(" ")[1])} />
                                        {resolveLanguageKey("orderStatus." + order.status)}
                                    </span>
                                )}
                                {read?.grandTotal && (
                                    <span className="font-bold text-base text-foreground leading-none ml-auto">
                                        {formatMoney(order)}
                                    </span>
                                )}
                            </div>

                            {read?.items && order.items && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                                    <IconPackage className="w-3.5 h-3.5 shrink-0" />
                                    <span>
                                        {order.items.length} {resolveLanguageKey("items")}
                                    </span>
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
                </>
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/productOrders/center/cardView/productOrderCard.tsx"),
    withDebug(true, true),
)(ProductOrderCard);
