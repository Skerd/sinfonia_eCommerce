import type {ProductOrder} from "armonia/src/modules/eCommerce/api/eCommerce/private/productOrder/productOrder.dto.ts";

const fullName = (first?: string, last?: string) => [first, last].filter(Boolean).join(" ").trim();

/**
 * Who an order is for, the way the shop says it (UX-01): the name it ships to, else the billing name, else the
 * customer's account name, else the email. Empty when none was readable, so the title falls back to the order number.
 */
export function productOrderCustomerName(order: Partial<ProductOrder>): string {
    return (
        fullName(order.shippingAddress?.firstName, order.shippingAddress?.lastName) ||
        fullName(order.billingAddress?.firstName, order.billingAddress?.lastName) ||
        fullName(order.customer?.name, order.customer?.surname) ||
        order.email ||
        ""
    );
}
