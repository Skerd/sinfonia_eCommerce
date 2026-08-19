import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {PowerOff} from "lucide-react";
import type {TaxZone} from "armonia/src/modules/eCommerce/api/eCommerce/private/taxZone/taxZone.dto.ts";

type Props = WithLanguageType & {
    entity: Pick<TaxZone, "_id" | "isActive">;
    onAction: (action: string) => void;
};

function DeactivateTaxZone({entity, resolveLanguageKey, onAction}: Props) {
    const {write} = useAccess("taxZones");

    if (!write?.isActive) return null;
    if (!entity.isActive) return null;

    return (
        <DropdownMenuItem onClick={() => onAction("deactivateTaxZone")}>
            <PowerOff className="text-destructive" size={16} />
            {resolveLanguageKey("title")}
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/taxZones/center/actions/deactivateTaxZone.tsx"),
    withDebug(true, true, "taxZones"),
)(DeactivateTaxZone);
