import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {CircleCheck} from "lucide-react";

type ActivateListingDropdownProps = WithLanguageType & {
    onAction: (action: string) => void;
};

function ActivateListingDropdown({onAction, resolveLanguageKey}: ActivateListingDropdownProps) {
    return (
        <DropdownMenuItem onClick={() => onAction("activate")}>
            <CircleCheck size={16} className="text-success" />
            <span>{resolveLanguageKey("title")}</span>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/listings/center/actions/activateListingDropdown.tsx"),
    withDebug(true, true, "listings"),
)(ActivateListingDropdown);
