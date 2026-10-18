import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
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
import {IconArrowRight, IconCalendar} from "@tabler/icons-react";
import DisplayValue from "@coreModule/components/viewEngine/widgets/display/displayValue.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

const STATUS_CONFIG: Record<string, {dot: string; dotAnim: string; text: string}> = {
    pending: {dot: "bg-warning", dotAnim: "", text: "text-warning"},
    accepted: {dot: "bg-info", dotAnim: "animate-pulse", text: "text-info"},
    in_progress: {dot: "bg-primary", dotAnim: "animate-pulse", text: "text-primary"},
    completed: {dot: "bg-success", dotAnim: "", text: "text-success"},
    cancelled: {dot: "bg-muted-foreground/40", dotAnim: "", text: "text-muted-foreground"},
};

function orderTitle(order: Order) {
    return order.listing?.title || order.taskRequest?.title || order._id;
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
            {({entity: row, setAction}) => {
                const statusCfg = STATUS_CONFIG[row.status ?? ""] ?? STATUS_CONFIG.pending;
                const customerInitials = [row.customer?.name?.[0], row.customer?.surname?.[0]]
                    .filter(Boolean)
                    .join("")
                    .toUpperCase();
                const providerInitials = [row.provider?.name?.[0], row.provider?.surname?.[0]]
                    .filter(Boolean)
                    .join("")
                    .toUpperCase();
                return (
                    <>
                        <EntityCard.Header titlePath="listing.title" title={orderTitle(row)}>
                            <AcceptOrderDropdown order={row} onAction={setAction} />
                            <StartOrderDropdown order={row} onAction={setAction} />
                            <CancelOrderDropdown order={row} onAction={setAction} />
                            <ExtendOrderDropdown order={row} onAction={setAction} />
                            <SubmitOrderDeliveryDropdown order={row} onAction={setAction} />
                            <AcceptOrderDeliveryDropdown order={row} onAction={setAction} />
                            <RequestRevisionDropdown order={row} onAction={setAction} />
                            <RaiseDisputeDropdown order={row} onAction={setAction} />
                        </EntityCard.Header>
                        <div className="flex flex-col gap-2">
                            <span
                                className={cn(
                                    "inline-flex items-center gap-1.5 text-3xs font-semibold tracking-wide uppercase",
                                    statusCfg.text,
                                )}
                            >
                                <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", statusCfg.dot, statusCfg.dotAnim)} />
                                <DisplayValue
                                    path="status"
                                    type="enum"
                                    languageKeyCategory="statuses"
                                    value={row.status}
                                />
                            </span>
                            {(row.customer || row.provider) && (
                                <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                                    {row.customer ? (
                                        <span className="flex min-w-0 items-center gap-1.5 truncate">
                                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted ring-1 ring-border">
                                                <span className="text-3xs font-bold leading-none text-foreground">
                                                    {customerInitials || "?"}
                                                </span>
                                            </div>
                                            <DisplayValue path="customer" type="user" value={row.customer} />
                                        </span>
                                    ) : null}
                                    {row.customer && row.provider ? (
                                        <IconArrowRight className="h-3 w-3 shrink-0 text-muted-foreground/40" />
                                    ) : null}
                                    {row.provider ? (
                                        <span className="flex min-w-0 items-center gap-1.5 truncate">
                                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
                                                <span className="text-3xs font-bold leading-none text-primary">
                                                    {providerInitials || "?"}
                                                </span>
                                            </div>
                                            <DisplayValue path="provider" type="user" value={row.provider} />
                                        </span>
                                    ) : null}
                                </div>
                            )}
                            <div className="h-px bg-border" />
                            <div className="flex items-end justify-between gap-2">
                                {row.deliveryDueDate ? (
                                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                        <IconCalendar className="h-3 w-3" />
                                        <DisplayValue path="deliveryDueDate" type="date" value={row.deliveryDueDate} />
                                    </span>
                                ) : null}
                                {row.amount != null ? (
                                    <div className="ml-auto shrink-0 text-right">
                                        <div className="mb-0.5 text-3xs leading-none tracking-wide text-muted-foreground uppercase">
                                            {resolveLanguageKey("total")}
                                        </div>
                                        <span className="text-base font-bold leading-none text-foreground">
                                            <DisplayValue
                                                path="amount"
                                                type="currency"
                                                value={{amount: row.amount, currency: row.currency}}
                                            />
                                        </span>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </>
                );
            }}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/orders/center/cardView/orderCard.tsx"),
    withDebug(true, true, "orders"),
)(OrderCard);
