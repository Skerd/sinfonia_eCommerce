import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {Mail} from "lucide-react";

type Props = WithLanguageType & {
    onAction: (action: string) => void;
};

function RequestManagerPinResetMenuItem({onAction, resolveLanguageKey}: Props) {
    return (
        <DropdownMenuItem onClick={() => onAction("requestManagerPinReset")}>
            <Mail size={16} />
            <p>{resolveLanguageKey("title")}</p>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/posConfigs/center/actions/requestManagerPinReset.tsx"),
    withDebug(true, true),
)(RequestManagerPinResetMenuItem);
