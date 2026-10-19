import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {Order} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/order/order.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import OrderSheetView from "@eCommerceModule/clients/panel/private/orders/center/sheetView/orderSheetView.tsx";
import AcceptOrderDropdown from "@eCommerceModule/clients/panel/private/orders/center/actions/acceptOrderDropdown.tsx";
import StartOrderDropdown from "@eCommerceModule/clients/panel/private/orders/center/actions/startOrderDropdown.tsx";
import CancelOrderDropdown from "@eCommerceModule/clients/panel/private/orders/center/actions/cancelOrderDropdown.tsx";
import ExtendOrderDropdown from "@eCommerceModule/clients/panel/private/orders/center/actions/extendOrderDropdown.tsx";
import SubmitOrderDeliveryDropdown from "@eCommerceModule/clients/panel/private/orders/center/actions/submitOrderDeliveryDropdown.tsx";
import AcceptOrderDeliveryDropdown from "@eCommerceModule/clients/panel/private/orders/center/actions/acceptOrderDeliveryDropdown.tsx";
import RequestRevisionDropdown from "@eCommerceModule/clients/panel/private/orders/center/actions/requestRevisionDropdown.tsx";
import RaiseDisputeDropdown from "@eCommerceModule/clients/panel/private/orders/center/actions/raiseDisputeDropdown.tsx";
import OrderActionConfirmAction from "@eCommerceModule/components/custom/orders/orderActionConfirmAction.tsx";
import OrderExtendAction from "@eCommerceModule/components/custom/orders/orderExtendAction.tsx";
import SubmitOrderDeliveryAction from "@eCommerceModule/components/custom/orders/submitOrderDeliveryAction.tsx";
import RequestRevisionAction from "@eCommerceModule/components/custom/orders/requestRevisionAction.tsx";
import RaiseDisputeAction from "@eCommerceModule/components/custom/disputes/raiseDisputeAction.tsx";
import type {OrderConfirmActionKey} from "@eCommerceModule/components/custom/orders/orderActionConfirmAction.tsx";
import type {OrderStatus} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/order/order.schema-def.ts";
import {IconBriefcase, IconCalendar, IconCurrencyDollar, IconTag, IconUser} from "@tabler/icons-react";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import {accessFieldPathExists} from "@coreModule/helpers/context/accessContext.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

function orderTitle(order: Order) {
    return order.listing?.title || order.taskRequest?.title || order._id;
}

/** The listing title, else the task request title, each only when the session may read it. */
function orderCardTitle(order: Order, read: unknown) {
    if (accessFieldPathExists(read, "listing.title") && order.listing?.title) return order.listing.title;
    return accessFieldPathExists(read, "taskRequest.title") ? order.taskRequest?.title : undefined;
}

type OrderCardProps = WithLanguageType & {
    order: Order;
    fetchId?: string;
    onDelete?: (deleted?: Order, response?: DeletedData) => void;
    onRestore?: () => void;
    onOrderUpdated?: (order: Order) => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<Order> | null>;
};

function OrderCard({
    order,
    resolveLanguageKey,
    fetchId,
    onDelete,
    onRestore,
    onOrderUpdated,
    hideActions = false,
    sheetOnly = false,
    innerRef,
}: OrderCardProps) {
    return (
        <EntityCard
            resource="orders"
            entity={order}
            fetchId={fetchId}
            singleUrl="/api/eCommerceMarketplace/order/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            hideEdit
            sheetOnly={sheetOnly}
            editPath={() => ""}
            Sheet={OrderSheetView}
            sheetEntityProp="order"
            deleteUrl="/api/eCommerceMarketplace/order"
            restoreUrl="/api/eCommerceMarketplace/order/restore"
            failedTitle=""
            failedDescription=""
            titlePath="listing.title"
            innerRef={innerRef}
            sheetProps={({entity: row, setEntity}) => ({
                fetchId,
                onOrderUpdated: (updated: Order) => {
                    setEntity({...row, ...updated});
                    onOrderUpdated?.(updated);
                },
                onSheetRowPatched: (patch: Partial<Order>) => {
                    const updated = {...row, ...patch};
                    setEntity(updated);
                    onOrderUpdated?.(updated);
                },
            })}
            extraDialogs={({action, setAction, entity: row, setEntity}) => {
                const applyPatch = (patch: Partial<Order>) => {
                    const updated = {...row, ...patch};
                    setEntity(updated);
                    onOrderUpdated?.(updated);
                };
                const title = orderTitle(row);
                return (
                    <>
                        {(action === "accept" ||
                            action === "start" ||
                            action === "cancel" ||
                            action === "acceptDelivery") && (
                            <OrderActionConfirmAction
                                orderId={row._id}
                                displayName={title}
                                actionKey={action as OrderConfirmActionKey}
                                openAlert
                                url={`/api/eCommerceMarketplace/order/${action}`}
                                onSuccess={(newStatus: OrderStatus) => {
                                    applyPatch({status: newStatus});
                                    setAction("");
                                }}
                                onCancel={() => setAction("")}
                            />
                        )}
                        {action === "submitDelivery" && (
                            <SubmitOrderDeliveryAction
                                orderId={row._id}
                                displayName={title}
                                openAlert
                                url="/api/eCommerceMarketplace/order/submitDelivery"
                                onSuccess={() => {
                                    applyPatch({deliverySubmitted: true});
                                    setAction("");
                                }}
                                onCancel={() => setAction("")}
                            />
                        )}
                        {action === "extend" && (
                            <OrderExtendAction
                                orderId={row._id}
                                displayName={title}
                                currentDueDate={row.deliveryDueDate}
                                openAlert
                                url="/api/eCommerceMarketplace/order/extend"
                                onSuccess={(newDueDate: string) => {
                                    applyPatch({deliveryDueDate: newDueDate});
                                    setAction("");
                                }}
                                onCancel={() => setAction("")}
                            />
                        )}
                        {action === "requestRevision" && (
                            <RequestRevisionAction
                                orderId={row._id}
                                displayName={title}
                                openAlert
                                url="/api/eCommerceMarketplace/order/requestRevision"
                                onSuccess={() => {
                                    applyPatch({deliverySubmitted: false});
                                    setAction("");
                                }}
                                onCancel={() => setAction("")}
                            />
                        )}
                        {action === "raiseDispute" && (
                            <RaiseDisputeAction
                                orderId={row._id}
                                displayName={title}
                                openAlert
                                url="/api/eCommerceMarketplace/dispute"
                                onSuccess={() => {
                                    applyPatch({hasActiveDispute: true});
                                    setAction("");
                                }}
                                onCancel={() => setAction("")}
                            />
                        )}
                    </>
                );
            }}
        >
            {({entity: row, read, setAction}) => (
                <>
                    <EntityCard.Header titlePath={["listing.title", "taskRequest.title"]} title={orderCardTitle(row, read)}>
                        <AcceptOrderDropdown order={row} onAction={setAction} />
                        <StartOrderDropdown order={row} onAction={setAction} />
                        <CancelOrderDropdown order={row} onAction={setAction} />
                        <ExtendOrderDropdown order={row} onAction={setAction} />
                        <SubmitOrderDeliveryDropdown order={row} onAction={setAction} />
                        <AcceptOrderDeliveryDropdown order={row} onAction={setAction} />
                        <RequestRevisionDropdown order={row} onAction={setAction} />
                        <RaiseDisputeDropdown order={row} onAction={setAction} />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        <EntityCardRow
                            icon={IconTag}
                            label={resolveLanguageKey("status")}
                            tooltip={resolveLanguageKey("status")}
                            path="status"
                            type="enum"
                            languageKeyCategory="statuses"
                            value={row.status}
                        />
                        <EntityCardRow
                            icon={IconUser}
                            label={resolveLanguageKey("customer")}
                            tooltip={resolveLanguageKey("customer")}
                            path="customer"
                            type="user"
                            value={row.customer}
                        />
                        <EntityCardRow
                            icon={IconBriefcase}
                            label={resolveLanguageKey("provider")}
                            tooltip={resolveLanguageKey("provider")}
                            path="provider"
                            type="user"
                            value={row.provider}
                        />
                        <EntityCardRow
                            icon={IconCalendar}
                            label={resolveLanguageKey("dueDate")}
                            tooltip={resolveLanguageKey("dueDate")}
                            path="deliveryDueDate"
                            type="date"
                            value={row.deliveryDueDate}
                        />
                        <EntityCardRow
                            icon={IconCurrencyDollar}
                            label={resolveLanguageKey("total")}
                            tooltip={resolveLanguageKey("total")}
                            path="amount"
                            type="currency"
                            value={{amount: row.amount, currency: row.currency}}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/orders/center/cardView/orderCard.tsx"),
    withDebug(true, true, "orders"),
)(OrderCard);
