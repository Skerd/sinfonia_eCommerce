import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import type {ProductOrder} from "armonia/src/modules/eCommerce/api/eCommerce/private/productOrder/productOrder.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ProductOrderCard from "./center/cardView/productOrderCard.tsx";
import ConfirmOrderDropdown from "./center/actions/confirmOrderDropdown.tsx";
import MarkProcessingDropdown from "./center/actions/markProcessingDropdown.tsx";
import ShipOrderDropdown from "./center/actions/shipOrderDropdown.tsx";
import CancelOrderDropdown from "./center/actions/cancelOrderDropdown.tsx";
import RefundOrderDropdown from "./center/actions/refundOrderDropdown.tsx";
import ProductOrderActionConfirmAction, {type ProductOrderConfirmActionKey} from "@eCommerceModule/components/custom/productOrders/productOrderActionConfirmAction.tsx";
import ShipProductOrderAction from "@eCommerceModule/components/custom/productOrders/shipProductOrderAction.tsx";
import RefundProductOrderAction from "@eCommerceModule/components/custom/productOrders/refundProductOrderAction.tsx";

function AllProductOrders({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<ProductOrder>
            apiUrl="/api/eCommerce/productOrder"
            collectionName="productOrders"
            accessModel="productOrders"
            tableConfigKey="productOrders"
            buildEditPath={() => ""}
            rowActionMenu={{hideEdit: true, allowMenuForCustomChildren: true}}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerce/clients/panel/private/productOrders/center/sheetView/productOrderSheetView.tsx"
            renderActionMenuChildren={(order, bindRowAction) => (
                <>
                    <ConfirmOrderDropdown order={order} onAction={bindRowAction} />
                    <MarkProcessingDropdown order={order} onAction={bindRowAction} />
                    <ShipOrderDropdown order={order} onAction={bindRowAction} />
                    <CancelOrderDropdown order={order} onAction={bindRowAction} />
                    <RefundOrderDropdown order={order} onAction={bindRowAction} />
                </>
            )}
            renderFloatingModals={({action, entity, resetAction, listRef}) => {
                if (action === "confirm" || action === "markProcessing" || action === "cancel") {
                    return (
                        <ProductOrderActionConfirmAction
                            orderId={entity._id}
                            displayName={entity.orderNumber}
                            actionKey={action as ProductOrderConfirmActionKey}
                            openAlert
                            url={`/api/eCommerce/productOrder/${action}`}
                            onSuccess={(newStatus: ProductOrder["status"]) => {
                                listRef.current?.updateRow?.(entity._id, {status: newStatus} as Partial<ProductOrder>);
                                resetAction();
                            }}
                            onCancel={resetAction}
                        />
                    );
                }
                if (action === "ship") {
                    return (
                        <ShipProductOrderAction
                            orderId={entity._id}
                            displayName={entity.orderNumber}
                            openAlert
                            url="/api/eCommerce/productOrder/ship"
                            onSuccess={() => {
                                listRef.current?.updateRow?.(entity._id, {
                                    status: "shipped",
                                    fulfillmentStatus: "fulfilled",
                                } as Partial<ProductOrder>);
                                resetAction();
                            }}
                            onCancel={resetAction}
                        />
                    );
                }
                if (action === "refund") {
                    return (
                        <RefundProductOrderAction
                            orderId={entity._id}
                            displayName={entity.orderNumber}
                            openAlert
                            url="/api/eCommerce/productOrder/refund"
                            onSuccess={(fullRefund: boolean) => {
                                listRef.current?.updateRow?.(
                                    entity._id,
                                    (fullRefund
                                        ? {paymentStatus: "refunded", status: "refunded"}
                                        : {paymentStatus: "partially_refunded"}) as Partial<ProductOrder>,
                                );
                                resetAction();
                            }}
                            onCancel={resetAction}
                        />
                    );
                }
                return null;
            }}
            renderCard={(order, onDelete, onRestore, listRef) => (
                <ProductOrderCard
                    order={order}
                    onDelete={(row: ProductOrder | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(order)}
                    onOrderUpdated={(updated: ProductOrder) => listRef.current?.updateRow?.(order._id, updated as Partial<ProductOrder>)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/productOrders/index.tsx"),
    withDebug(true, true, "productOrders"),
)(AllProductOrders);
