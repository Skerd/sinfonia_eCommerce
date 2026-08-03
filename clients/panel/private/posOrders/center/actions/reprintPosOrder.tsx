import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {Printer} from "lucide-react";
import type {PosOrder} from "armonia/src/modules/eCommerce/api/eCommerce/private/posOrder/posOrder.dto.ts";

type ReprintPosOrderProps = WithLanguageType & {
    entity: Pick<PosOrder, "_id" | "state" | "deletedAt" | "name">;
    onAction: (action: string) => void;
};

function ReprintPosOrder({entity, resolveLanguageKey, onAction}: ReprintPosOrderProps) {
    const {read} = useAccess("posOrders");

    if (!read) return null;
    if (entity.deletedAt) return null;
    if (!["paid", "refunded"].includes(entity.state)) return null;

    return (
        <DropdownMenuItem onClick={() => onAction("reprintPosOrder")}>
            <Printer className="text-info" size={16} />
            {resolveLanguageKey("title")}
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/posOrders/center/actions/reprintPosOrder.tsx"),
    withDebug(true, true),
)(ReprintPosOrder);
