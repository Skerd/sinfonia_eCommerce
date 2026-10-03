import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useKeyboardShortcuts} from "@coreModule/helpers/hooks/useKeyboardShortcut.ts";
import {DropdownMenuItem, DropdownMenuShortcut} from "@coreModule/components/ui/dropdown-menu.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import type {ProductOrder} from "armonia/src/modules/eCommerce/api/eCommerce/private/productOrder/productOrder.dto.ts";
import {Banknote} from "lucide-react";

type MarkPaidDropdownProps = WithLanguageType & {
    order: ProductOrder;
    onAction: (action: string) => void;
};

function MarkPaidDropdown({order, onAction, resolveLanguageKey}: MarkPaidDropdownProps) {
    const actionKey = "markPaid";
    const shortcut = "6";
    const {write} = useAccess("productOrders");

    // Offline payments (cash on delivery / bank transfer) are recorded by staff
    const canRun = !!write?.paymentStatus && order.paymentStatus === "unpaid" && !["cancelled", "refunded"].includes(order.status);

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
            <Banknote size={16} className="text-success" />
            <span className="text-success">{resolveLanguageKey("title")}</span>
            <DropdownMenuShortcut>⌘{shortcut}</DropdownMenuShortcut>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/productOrders/center/actions/markPaidDropdown.tsx"),
    withDebug(true, true, "productOrders"),
)(MarkPaidDropdown);
