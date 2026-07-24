import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useKeyboardShortcuts} from "@coreModule/helpers/hooks/useKeyboardShortcut.ts";
import {DropdownMenuItem, DropdownMenuShortcut} from "@coreModule/components/ui/dropdown-menu.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {ProductOrder} from "armonia/src/modules/eCommerce/api/eCommerce/private/productOrder/productOrder.dto.ts";
import {CircleCheck} from "lucide-react";

type ConfirmOrderDropdownProps = WithLanguageType & {
    order: ProductOrder;
    onAction: (action: string) => void;
};

function ConfirmOrderDropdown({order, onAction, resolveLanguageKey}: ConfirmOrderDropdownProps) {
    const actionKey = "confirm";
    const shortcut = "1";
    const {write} = useAccess("productOrders");

    const canRun = !!write && order.status === "pending";

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
            <CircleCheck size={16} className="text-green-600" />
            <span className="text-green-600">{resolveLanguageKey("title")}</span>
            <DropdownMenuShortcut>⌘{shortcut}</DropdownMenuShortcut>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/productOrders/center/actions/confirmOrderDropdown.tsx"),
    withDebug(true, true),
)(ConfirmOrderDropdown);
