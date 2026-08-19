import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useKeyboardShortcuts} from "@coreModule/helpers/hooks/useKeyboardShortcut.ts";
import {DropdownMenuItem, DropdownMenuShortcut} from "@coreModule/components/ui/dropdown-menu.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {ProductOrder} from "armonia/src/modules/eCommerce/api/eCommerce/private/productOrder/productOrder.dto.ts";
import {RotateCcw} from "lucide-react";

type RefundOrderDropdownProps = WithLanguageType & {
    order: ProductOrder;
    onAction: (action: string) => void;
};

function RefundOrderDropdown({order, onAction, resolveLanguageKey}: RefundOrderDropdownProps) {
    const actionKey = "refund";
    const shortcut = "5";
    const {write} = useAccess("productOrders");

    const canRun = !!write && ["paid", "partially_refunded"].includes(order.paymentStatus);

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
            <RotateCcw size={16} className="text-warning" />
            <span className="text-warning">{resolveLanguageKey("title")}</span>
            <DropdownMenuShortcut>⌘{shortcut}</DropdownMenuShortcut>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/productOrders/center/actions/refundOrderDropdown.tsx"),
    withDebug(true, true, "productOrders"),
)(RefundOrderDropdown);
