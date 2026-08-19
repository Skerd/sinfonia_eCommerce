import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {ProductOrder} from "armonia/src/modules/eCommerce/api/eCommerce/private/productOrder/productOrder.dto.ts";
import {IconPackage, IconUser} from "@tabler/icons-react";
import ProductOrderSheetView from "@eCommerceModule/clients/panel/private/productOrders/center/sheetView/productOrderSheetView.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ConfirmOrderDropdown from "@eCommerceModule/clients/panel/private/productOrders/center/actions/confirmOrderDropdown.tsx";
import MarkProcessingDropdown from "@eCommerceModule/clients/panel/private/productOrders/center/actions/markProcessingDropdown.tsx";
import ShipOrderDropdown from "@eCommerceModule/clients/panel/private/productOrders/center/actions/shipOrderDropdown.tsx";
import CancelOrderDropdown from "@eCommerceModule/clients/panel/private/productOrders/center/actions/cancelOrderDropdown.tsx";
import RefundOrderDropdown from "@eCommerceModule/clients/panel/private/productOrders/center/actions/refundOrderDropdown.tsx";
import ProductOrderActionConfirmAction, {type ProductOrderConfirmActionKey} from "@eCommerceModule/components/custom/productOrders/productOrderActionConfirmAction.tsx";
import ShipProductOrderAction from "@eCommerceModule/components/custom/productOrders/shipProductOrderAction.tsx";
import RefundProductOrderAction from "@eCommerceModule/components/custom/productOrders/refundProductOrderAction.tsx";
import DisplayValue from "@coreModule/components/custom/displayValue/displayValue.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

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

type ProductOrderCardProps = WithLanguageType & {
    order: ProductOrder;
    fetchId?: string;
    onDelete?: (deleted?: ProductOrder, response?: DeletedData) => void;
    onRestore?: () => void;
    onOrderUpdated?: (order: ProductOrder) => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<ProductOrder> | null>;
};

function ProductOrderCard({
    order,
    resolveLanguageKey,
    fetchId,
    onDelete,
    onRestore,
    onOrderUpdated,
    hideActions = false,
    sheetOnly = false,
    innerRef,
}: ProductOrderCardProps) {
    return (
        <EntityCard
            resource="productOrders"
            entity={order}
            fetchId={fetchId}
            singleUrl="/api/eCommerce/productOrder/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            hideEdit
            sheetOnly={sheetOnly}
            editPath={() => ""}
            Sheet={ProductOrderSheetView}
            sheetEntityProp="order"
            deleteUrl="/api/eCommerce/productOrder"
            restoreUrl="/api/eCommerce/productOrder/restore"
            failedTitle=""
            failedDescription=""
            titlePath="orderNumber"
            innerRef={innerRef}
            sheetProps={() => ({fetchId})}
            extraDialogs={({action, setAction, entity: row, setEntity}) => {
                const applyPatch = (patch: Partial<ProductOrder>) => {
                    const updated = {...row, ...patch};
                    setEntity(updated);
                    onOrderUpdated?.(updated);
                };
                return (
                    <>
                        {(action === "confirm" || action === "markProcessing" || action === "cancel") && (
                            <ProductOrderActionConfirmAction
                                orderId={row._id}
                                displayName={row.orderNumber}
                                actionKey={action as ProductOrderConfirmActionKey}
                                openAlert
                                url={`/api/eCommerce/productOrder/${action}`}
                                onSuccess={(newStatus: ProductOrder["status"]) => {
                                    applyPatch({status: newStatus});
                                    setAction("");
                                }}
                                onCancel={() => setAction("")}
                            />
                        )}
                        {action === "ship" && (
                            <ShipProductOrderAction
                                orderId={row._id}
                                displayName={row.orderNumber}
                                openAlert
                                url="/api/eCommerce/productOrder/ship"
                                onSuccess={() => {
                                    applyPatch({status: "shipped", fulfillmentStatus: "fulfilled"});
                                    setAction("");
                                }}
                                onCancel={() => setAction("")}
                            />
                        )}
                        {action === "refund" && (
                            <RefundProductOrderAction
                                orderId={row._id}
                                displayName={row.orderNumber}
                                openAlert
                                url="/api/eCommerce/productOrder/refund"
                                onSuccess={(fullRefund: boolean) => {
                                    applyPatch(
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
            }}
        >
            {({entity: row, setAction}) => {
                const colors = statusColor(row.status);
                return (
                    <>
                        <EntityCard.Header titlePath="orderNumber" title={row.orderNumber}>
                            <ConfirmOrderDropdown order={row} onAction={setAction} />
                            <MarkProcessingDropdown order={row} onAction={setAction} />
                            <ShipOrderDropdown order={row} onAction={setAction} />
                            <CancelOrderDropdown order={row} onAction={setAction} />
                            <RefundOrderDropdown order={row} onAction={setAction} />
                        </EntityCard.Header>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <IconUser className="h-3.5 w-3.5 shrink-0" />
                                <DisplayValue path="customer" type="user" value={row.customer} />
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <span
                                    className={cn(
                                        "inline-flex items-center gap-1.5 text-3xs font-semibold uppercase tracking-wide",
                                        colors.split(" ")[0],
                                    )}
                                >
                                    <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", colors.split(" ")[1])} />
                                    <DisplayValue
                                        path="status"
                                        type="enum"
                                        languageKeyCategory="orderStatus"
                                        value={row.status}
                                    />
                                </span>
                                <span className="ml-auto text-base font-bold leading-none text-foreground">
                                    <DisplayValue
                                        path="grandTotal"
                                        type="currency"
                                        value={{amount: row.grandTotal, currency: row.currency}}
                                    />
                                </span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <IconPackage className="h-3.5 w-3.5 shrink-0" />
                                <DisplayValue path="items" type="number" value={row.items?.length} />
                                <span>{resolveLanguageKey("items")}</span>
                            </div>
                        </div>
                    </>
                );
            }}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/productOrders/center/cardView/productOrderCard.tsx"),
    withDebug(true, true, "productOrders"),
)(ProductOrderCard);
