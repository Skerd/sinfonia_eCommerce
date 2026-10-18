import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {ClipboardList} from "lucide-react";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import type {Dispute} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/dispute/dispute.dto.ts";

type Props = WithLanguageType & {
    dispute: Dispute;
    onAction: (action: string) => void;
};

function StartReviewDisputeDropdown({dispute, onAction, resolveLanguageKey}: Props) {
    const {write} = useAccess("disputes");

    const canShow =
        !!write && !dispute.deletedAt && dispute.status === "open";

    if (!canShow) {
        return null;
    }

    return (
        <DropdownMenuItem onClick={() => onAction("startReview")}>
            <ClipboardList size={16} />
            <span>{resolveLanguageKey("title")}</span>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/disputes/center/actions/startReviewDisputeDropdown.tsx"),
    withDebug(true, true, "disputes"),
)(StartReviewDisputeDropdown);
