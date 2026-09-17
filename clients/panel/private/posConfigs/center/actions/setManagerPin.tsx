import withLanguage, {WithLanguageType} from "@baseModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@baseModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {KeyRound} from "lucide-react";

type Props = WithLanguageType & {
    onAction: (action: string) => void;
};

function SetManagerPinMenuItem({onAction, resolveLanguageKey}: Props) {
    return (
        <DropdownMenuItem onClick={() => onAction("setManagerPin")}>
            <KeyRound size={16} />
            <p>{resolveLanguageKey("title")}</p>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/posConfigs/center/actions/setManagerPin.tsx"),
    withDebug(true, true, "posConfigs"),
)(SetManagerPinMenuItem);
