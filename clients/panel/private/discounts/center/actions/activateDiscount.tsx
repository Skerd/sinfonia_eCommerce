import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {Power} from "lucide-react";
import type {Discount} from "armonia/src/modules/eCommerce/api/eCommerce/private/discount/discount.dto.ts";

type ActivateDiscountProps = WithLanguageType & {
    entity: Pick<Discount, "_id" | "isActive">;
    onAction: (action: string) => void;
};

function ActivateDiscount({entity, resolveLanguageKey, onAction}: ActivateDiscountProps) {
    const {write} = useAccess("discounts");

    if (!write?.isActive) return null;
    if (entity.isActive) return null;

    return (
        <DropdownMenuItem onClick={() => onAction("activateDiscount")}>
            <Power className="text-success" size={16} />
            {resolveLanguageKey("title")}
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/discounts/center/actions/activateDiscount.tsx"),
    withDebug(true, true),
)(ActivateDiscount);
