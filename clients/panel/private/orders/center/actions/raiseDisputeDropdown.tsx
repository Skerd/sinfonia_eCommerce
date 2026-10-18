import {compose} from "redux";
import {useSelector} from "react-redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import type {RootState} from "@coreModule/helpers/redux/store/generalStore.ts";
import type {Order} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/order/order.dto.ts";
import {AlertTriangle} from "lucide-react";

type Props = WithLanguageType & {
    order: Order;
    onAction: (action: string) => void;
};

function RaiseDisputeDropdown({order, onAction, resolveLanguageKey}: Props) {
    const actionKey = "raiseDispute";
    const {create} = useAccess("disputes");
    const {id: currentUserId} = useSelector((state: RootState) => state.authentication.user);

    const isProvider = order.provider?._id === currentUserId;
    const isCustomer = order.customer?._id === currentUserId;
    const isFinal = order.status === "completed" || order.status === "cancelled";

    const canRaise =
        !!create &&
        (isProvider || isCustomer) &&
        !isFinal &&
        !order.hasActiveDispute &&
        !!order.status;

    if (!canRaise) {
        return null;
    }

    return (
        <DropdownMenuItem onClick={() => onAction(actionKey)}>
            <AlertTriangle size={16} className="text-warning" />
            <span>{resolveLanguageKey("title")}</span>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/orders/center/actions/raiseDisputeDropdown.tsx"),
    withDebug(true, true, "disputes"),
)(RaiseDisputeDropdown);
