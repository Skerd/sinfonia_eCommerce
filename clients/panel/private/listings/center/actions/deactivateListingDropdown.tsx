import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {CircleX} from "lucide-react";

type DeactivateListingDropdownProps = WithLanguageType & {
    onAction: (action: string) => void;
};

function DeactivateListingDropdown({onAction, resolveLanguageKey}: DeactivateListingDropdownProps) {
    return (
        <DropdownMenuItem onClick={() => onAction("deactivate")}>
            <CircleX size={16} className="text-warning" />
            <span>{resolveLanguageKey("title")}</span>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/listings/center/actions/deactivateListingDropdown.tsx"),
    withDebug(true, true, "listings"),
)(DeactivateListingDropdown);
