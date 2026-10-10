import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {PackageCheck} from "lucide-react";
import type {ReturnRequest} from "armonia/src/modules/eCommerce/api/eCommerce/private/returnRequest/returnRequest.dto.ts";

type Props = WithLanguageType & {
    entity: Pick<ReturnRequest, "_id" | "status" | "deletedAt">;
    onAction: (action: string) => void;
};

function ReceiveReturnRequest({entity, resolveLanguageKey, onAction}: Props) {
    const {write} = useAccess("returnRequests");

    if (!write?.status) return null;
    if (entity.deletedAt) return null;
    if (entity.status !== "approved") return null;

    return (
        <DropdownMenuItem onClick={() => onAction("receiveReturnRequest")}>
            <PackageCheck size={16} />
            {resolveLanguageKey("title")}
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/returnRequests/center/actions/receiveReturnRequest.tsx"),
    withDebug(true, true, "returnRequests"),
)(ReceiveReturnRequest);
