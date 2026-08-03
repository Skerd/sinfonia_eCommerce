import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useKeyboardShortcuts} from "@coreModule/helpers/hooks/useKeyboardShortcut.ts";
import {DropdownMenuItem, DropdownMenuShortcut} from "@coreModule/components/ui/dropdown-menu.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {ProductOrder} from "armonia/src/modules/eCommerce/api/eCommerce/private/productOrder/productOrder.dto.ts";
import {CircleX} from "lucide-react";

type CancelOrderDropdownProps = WithLanguageType & {
    order: ProductOrder;
    onAction: (action: string) => void;
};

function CancelOrderDropdown({order, onAction, resolveLanguageKey}: CancelOrderDropdownProps) {
    const actionKey = "cancel";
    const shortcut = "4";
    const {write} = useAccess("productOrders");

    const canRun = !!write && !["shipped", "delivered", "cancelled", "refunded"].includes(order.status) && !["paid", "partially_refunded"].includes(order.paymentStatus);

    const triggerAction = () => {
        if (!canRun) return;
        onAction(actionKey);
    };
    useKeyboardShortcuts(shortcut, triggerAction);

    if (!canRun) {
        return null;
    }

    return (
        <DropdownMenuItem onClick={() => triggerAction()}>
            <CircleX size={16} className="text-destructive" />
            <span className="text-destructive">{resolveLanguageKey("title")}</span>
            <DropdownMenuShortcut>⌘{shortcut}</DropdownMenuShortcut>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/productOrders/center/actions/cancelOrderDropdown.tsx"),
    withDebug(true, true),
)(CancelOrderDropdown);
