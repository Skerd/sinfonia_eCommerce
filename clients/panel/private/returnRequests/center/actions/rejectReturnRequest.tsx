import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {X} from "lucide-react";
import type {ReturnRequest} from "armonia/src/modules/eCommerce/api/eCommerce/private/returnRequest/returnRequest.dto.ts";

type RejectReturnRequestProps = WithLanguageType & {
    entity: Pick<ReturnRequest, "_id" | "status" | "deletedAt">;
    onAction: (action: string) => void;
};

function RejectReturnRequest({entity, resolveLanguageKey, onAction}: RejectReturnRequestProps) {
    const {write} = useAccess("returnRequests");

    if (!write?.status) return null;
    if (entity.deletedAt) return null;
    if (entity.status !== "pending") return null;

    return (
        <DropdownMenuItem onClick={() => onAction("rejectReturnRequest")}>
            <X className="text-destructive" size={16} />
            {resolveLanguageKey("title")}
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/returnRequests/center/actions/rejectReturnRequest.tsx"),
    withDebug(true, true),
)(RejectReturnRequest);
