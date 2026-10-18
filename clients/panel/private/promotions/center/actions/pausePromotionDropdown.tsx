import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {CirclePause} from "lucide-react";

type PausePromotionDropdownProps = WithLanguageType & {
    onAction: (action: string) => void;
};

function PausePromotionDropdown({onAction, resolveLanguageKey}: PausePromotionDropdownProps) {
    return (
        <DropdownMenuItem onClick={() => onAction("pause")}>
            <CirclePause size={16} className="text-warning" />
            <span>{resolveLanguageKey("title")}</span>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/promotions/center/actions/pausePromotionDropdown.tsx"),
    withDebug(true, true, "promotions"),
)(PausePromotionDropdown);
