import {compose} from "redux";
import {useSelector} from "react-redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import type {RootState} from "@coreModule/helpers/redux/store/generalStore.ts";
import type {Order} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/order/order.dto.ts";
import {Milestone} from "lucide-react";

type CreateMilestoneDropdownProps = WithLanguageType & {
    order: Order;
    onAction: (action: string) => void;
};

/** The customer of an accepted or in-progress order may split it into milestones. */
function CreateMilestoneDropdown({order, onAction, resolveLanguageKey}: CreateMilestoneDropdownProps) {
    const {write} = useAccess("orders");
    const {id: currentUserId} = useSelector((state: RootState) => state.authentication.user);

    const isCustomer = order.customer?._id === currentUserId;
    const canCreate = isCustomer && (order.status === "accepted" || order.status === "in_progress") && !!write;

    if (!canCreate) {
        return null;
    }

    return (
        <DropdownMenuItem onClick={() => onAction("createMilestone")}>
            <Milestone size={16} className="text-primary" />
            <span>{resolveLanguageKey("title")}</span>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/orders/center/actions/createMilestoneDropdown.tsx"),
    withDebug(true, true, "orders"),
)(CreateMilestoneDropdown);
