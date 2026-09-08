import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/context/accessContext.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {PowerOff} from "lucide-react";
import type {PosPaymentMethod} from "armonia/src/modules/eCommerce/api/eCommerce/private/posPaymentMethod/posPaymentMethod.dto.ts";

type DeactivatePosPaymentMethodProps = WithLanguageType & {
    entity: Pick<PosPaymentMethod, "_id" | "isActive">;
    onAction: (action: string) => void;
};

function DeactivatePosPaymentMethod({entity, resolveLanguageKey, onAction}: DeactivatePosPaymentMethodProps) {
    const {write} = useAccess("posPaymentMethods");

    if (!write?.isActive) return null;
    if (!entity.isActive) return null;

    return (
        <DropdownMenuItem onClick={() => onAction("deactivatePosPaymentMethod")}>
            <PowerOff className="text-destructive" size={16} />
            {resolveLanguageKey("title")}
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/posPaymentMethods/center/actions/deactivatePosPaymentMethod.tsx"),
    withDebug(true, true, "posPaymentMethods"),
)(DeactivatePosPaymentMethod);
