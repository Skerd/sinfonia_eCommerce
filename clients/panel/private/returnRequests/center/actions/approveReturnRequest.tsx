import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {Check} from "lucide-react";
import type {ReturnRequest} from "armonia/src/modules/eCommerce/api/eCommerce/private/returnRequest/returnRequest.dto.ts";

type ApproveReturnRequestProps = WithLanguageType & {
    entity: Pick<ReturnRequest, "_id" | "status" | "deletedAt">;
    onAction: (action: string) => void;
};

function ApproveReturnRequest({entity, resolveLanguageKey, onAction}: ApproveReturnRequestProps) {
    const {write} = useAccess("returnRequests");

    if (!write?.status) return null;
    if (entity.deletedAt) return null;
    if (entity.status !== "pending") return null;

    return (
        <DropdownMenuItem onClick={() => onAction("approveReturnRequest")}>
            <Check className="text-green-600" size={16} />
            {resolveLanguageKey("title")}
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/returnRequests/center/actions/approveReturnRequest.tsx"),
    withDebug(true, true),
)(ApproveReturnRequest);
