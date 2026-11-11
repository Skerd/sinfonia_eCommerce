import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {ProductOrder} from "armonia/src/modules/eCommerce/api/eCommerce/private/productOrder/productOrder.dto.ts";
import {IconCalendarEvent, IconCreditCard, IconPackage} from "@tabler/icons-react";
import StatusBadge from "@coreModule/components/entityPage/sheet/statusBadge.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import {productOrderCustomerName} from "@eCommerceModule/clients/panel/private/productOrders/center/productOrderCustomerName.ts";
import ProductOrderSheetView from "@eCommerceModule/clients/panel/private/productOrders/center/sheetView/productOrderSheetView.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ConfirmOrderDropdown from "@eCommerceModule/clients/panel/private/productOrders/center/actions/confirmOrderDropdown.tsx";
import MarkProcessingDropdown from "@eCommerceModule/clients/panel/private/productOrders/center/actions/markProcessingDropdown.tsx";
import ShipOrderDropdown from "@eCommerceModule/clients/panel/private/productOrders/center/actions/shipOrderDropdown.tsx";
import CancelOrderDropdown from "@eCommerceModule/clients/panel/private/productOrders/center/actions/cancelOrderDropdown.tsx";
import RefundOrderDropdown from "@eCommerceModule/clients/panel/private/productOrders/center/actions/refundOrderDropdown.tsx";
import MarkPaidDropdown from "@eCommerceModule/clients/panel/private/productOrders/center/actions/markPaidDropdown.tsx";
import ProductOrderActionConfirmAction from "@eCommerceModule/components/custom/productOrders/productOrderActionConfirmAction.tsx";
import ShipProductOrderAction from "@eCommerceModule/components/custom/productOrders/shipProductOrderAction.tsx";
import RefundProductOrderAction from "@eCommerceModule/components/custom/productOrders/refundProductOrderAction.tsx";
import {accessFieldPathExists} from "@coreModule/helpers/context/accessContext.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

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
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
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
                        {(action === "confirm" || action === "markProcessing" || action === "cancel" || action === "markPaid") && (
                            <ProductOrderActionConfirmAction
                                orderId={row._id}
                                displayName={row.orderNumber}
                                actionKey={action}
                                orderStatus={row.status}
                                openAlert
                                url={`/api/eCommerce/productOrder/${action}`}
                                onSuccess={(patch: Partial<ProductOrder>) => {
                                    applyPatch(patch);
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
            {({entity: row, read, setAction}) => {
                const customerName = productOrderCustomerName(row);
                const currency = accessFieldPathExists(read, "currency") ? row.currency : undefined;
                const itemCount = row.items?.length ?? 0;
                return (
                    <>
                        {/* The customer is who the shop looks for; the order number is the subtitle (UX-01). */}
                        <EntityCard.Header
                            titlePath={customerName ? ["shippingAddress", "billingAddress", "customer", "email"] : "orderNumber"}
                            title={customerName || row.orderNumber}
                            subtitlePath="orderNumber"
                            subtitle={customerName ? row.orderNumber : undefined}
                            badgesBesideTitle
                            badges={
                                <>
                                    {accessFieldPathExists(read, "status") ? (
                                        <StatusBadge tableConfigKey="productOrders" field="status" value={row.status} label={String(resolveLanguageKey(`orderStatus.${row.status}`))} />
                                    ) : null}
                                    {accessFieldPathExists(read, "paymentStatus") ? (
                                        <StatusBadge tableConfigKey="productOrders" field="paymentStatus" value={row.paymentStatus} label={String(resolveLanguageKey(`paymentStatus.${row.paymentStatus}`))} />
                                    ) : null}
                                </>
                            }
                        >
                            <ConfirmOrderDropdown order={row} onAction={setAction} />
                            <MarkPaidDropdown order={row} onAction={setAction} />
                            <MarkProcessingDropdown order={row} onAction={setAction} />
                            <ShipOrderDropdown order={row} onAction={setAction} />
                            <CancelOrderDropdown order={row} onAction={setAction} />
                            <RefundOrderDropdown order={row} onAction={setAction} />
                        </EntityCard.Header>
                        <EntityCard.Body>
                            {itemCount ? (
                                <EntityCardRow
                                    icon={IconPackage}
                                    label={resolveLanguageKey("itemsLabel")}
                                    tooltip={resolveLanguageKey("itemsLabel")}
                                    path="items"
                                    type="number"
                                    value={itemCount}
                                />
                            ) : null}
                            <EntityCardRow
                                icon={IconCalendarEvent}
                                label={resolveLanguageKey("placedAt")}
                                tooltip={resolveLanguageKey("placedAt")}
                                path="createdAt"
                                type="dateTime"
                                value={row.createdAt}
                            />
                            <EntityCardRow
                                icon={IconCreditCard}
                                label={resolveLanguageKey("total")}
                                tooltip={resolveLanguageKey("total")}
                                path="grandTotal"
                                type="currency"
                                value={{amount: row.grandTotal, currency}}
                            />
                        </EntityCard.Body>
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
