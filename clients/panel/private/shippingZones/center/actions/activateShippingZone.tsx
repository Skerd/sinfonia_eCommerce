import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {Power} from "lucide-react";
import type {ShippingZone} from "armonia/src/modules/eCommerce/api/eCommerce/private/shippingZone/shippingZone.dto.ts";

type Props = WithLanguageType & {
    entity: Pick<ShippingZone, "_id" | "isActive">;
    onAction: (action: string) => void;
};

function ActivateShippingZone({entity, resolveLanguageKey, onAction}: Props) {
    const {write} = useAccess("shippingZones");

    if (!write?.isActive) return null;
    if (entity.isActive) return null;

    return (
        <DropdownMenuItem onClick={() => onAction("activateShippingZone")}>
            <Power className="text-success" size={16} />
            {resolveLanguageKey("title")}
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/shippingZones/center/actions/activateShippingZone.tsx"),
    withDebug(true, true, "shippingZones"),
)(ActivateShippingZone);
