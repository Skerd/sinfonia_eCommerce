import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useKeyboardShortcuts} from "@coreModule/helpers/hooks/useKeyboardShortcut.ts";
import {DropdownMenuItem, DropdownMenuShortcut} from "@coreModule/components/ui/dropdown-menu.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {ProductOrder} from "armonia/src/modules/eCommerce/api/eCommerce/private/productOrder/productOrder.dto.ts";
import {Package} from "lucide-react";

type MarkProcessingDropdownProps = WithLanguageType & {
    order: ProductOrder;
    onAction: (action: string) => void;
};

function MarkProcessingDropdown({order, onAction, resolveLanguageKey}: MarkProcessingDropdownProps) {
    const actionKey = "markProcessing";
    const shortcut = "2";
    const {write} = useAccess("productOrders");

    const canRun = !!write && order.status === "confirmed";

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
            <Package size={16} className="text-info" />
            <span className="text-info">{resolveLanguageKey("title")}</span>
            <DropdownMenuShortcut>⌘{shortcut}</DropdownMenuShortcut>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/productOrders/center/actions/markProcessingDropdown.tsx"),
    withDebug(true, true),
)(MarkProcessingDropdown);
