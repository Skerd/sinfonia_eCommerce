import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useKeyboardShortcuts} from "@coreModule/helpers/hooks/useKeyboardShortcut.ts";
import {DropdownMenuItem, DropdownMenuShortcut} from "@coreModule/components/ui/dropdown-menu.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import type {Bid} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/bid/bid.dto.ts";
import {CircleCheck} from "lucide-react";

type AcceptBidDropdownProps = WithLanguageType & {
    bid: Bid;
    onAction: (action: string) => void;
};

function AcceptBidDropdown({bid, onAction, resolveLanguageKey}: AcceptBidDropdownProps) {
    const actionKey = "accept";
    const shortcut = "1";
    const {write} = useAccess("marketplacebids");

    const canAccept = bid.status === "pending" && !!write;

    const triggerAction = () => {
        if (!canAccept) return;
        onAction(actionKey);
    };
    useKeyboardShortcuts(shortcut, triggerAction);

    if (!canAccept) {
        return null;
    }

    return (
        <DropdownMenuItem onClick={() => triggerAction()}>
            <CircleCheck size={16} className="text-success" />
            <span className="text-success">{resolveLanguageKey("title")}</span>
            <DropdownMenuShortcut>⌘{shortcut}</DropdownMenuShortcut>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/bids/center/actions/acceptBidDropdown.tsx"),
    withDebug(true, true, "marketplacebids"),
)(AcceptBidDropdown);
