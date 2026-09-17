import withLanguage, {WithLanguageType} from "@baseModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@baseModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {IconUsers} from "@tabler/icons-react";

type Props = WithLanguageType & {
    onAction: (action: string) => void;
};

function ManageMembersMenuItem({onAction, resolveLanguageKey}: Props) {
    return (
        <DropdownMenuItem onClick={() => onAction("manageMembers")}>
            <IconUsers size={16} />
            <p>{resolveLanguageKey("title")}</p>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/customerGroups/center/actions/manageMembers.tsx"),
    withDebug(true, true, "customerGroups"),
)(ManageMembersMenuItem);
