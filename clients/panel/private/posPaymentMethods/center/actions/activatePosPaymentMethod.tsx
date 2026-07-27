import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {Power} from "lucide-react";
import type {PosPaymentMethod} from "armonia/src/modules/eCommerce/api/eCommerce/private/posPaymentMethod/posPaymentMethod.dto.ts";

type ActivatePosPaymentMethodProps = WithLanguageType & {
    entity: Pick<PosPaymentMethod, "_id" | "isActive">;
    onAction: (action: string) => void;
};

function ActivatePosPaymentMethod({entity, resolveLanguageKey, onAction}: ActivatePosPaymentMethodProps) {
    const {write} = useAccess("posPaymentMethods");

    if (!write?.isActive) return null;
    if (entity.isActive) return null;

    return (
        <DropdownMenuItem onClick={() => onAction("activatePosPaymentMethod")}>
            <Power className="text-green-600" size={16} />
            {resolveLanguageKey("title")}
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/posPaymentMethods/center/actions/activatePosPaymentMethod.tsx"),
    withDebug(true, true),
)(ActivatePosPaymentMethod);
