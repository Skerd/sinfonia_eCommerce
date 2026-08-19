import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {X} from "lucide-react";
import type {Fulfillment} from "armonia/src/modules/eCommerce/api/eCommerce/private/fulfillment/fulfillment.dto.ts";

type MarkFailedFulfillmentProps = WithLanguageType & {
    entity: Pick<Fulfillment, "_id" | "status" | "deletedAt">;
    onAction: (action: string) => void;
};

function MarkFailedFulfillment({entity, resolveLanguageKey, onAction}: MarkFailedFulfillmentProps) {
    const {write} = useAccess("fulfillments");

    if (!write?.status) return null;
    if (entity.deletedAt) return null;
    if (entity.status !== "pending" && entity.status !== "shipped") return null;

    return (
        <DropdownMenuItem onClick={() => onAction("markFailedFulfillment")}>
            <X className="text-destructive" size={16} />
            {resolveLanguageKey("title")}
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/fulfillments/center/actions/markFailedFulfillment.tsx"),
    withDebug(true, true, "fulfillments"),
)(MarkFailedFulfillment);
