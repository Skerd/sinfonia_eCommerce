import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useKeyboardShortcuts} from "@coreModule/helpers/hooks/useKeyboardShortcut.ts";
import {DropdownMenuItem, DropdownMenuShortcut} from "@coreModule/components/ui/dropdown-menu.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import type {TaskRequest} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/taskRequest/taskRequest.dto.ts";
import {LockOpen} from "lucide-react";

type ReopenTaskRequestDropdownProps = WithLanguageType & {
    entity: TaskRequest;
    onAction: (action: string) => void;
};

function ReopenTaskRequestDropdown({entity, onAction, resolveLanguageKey}: ReopenTaskRequestDropdownProps) {
    const actionKey = "reopen";
    const shortcut = "2";
    const {write} = useAccess("taskRequests");

    const canReopen = entity.status === "closed" && !!write?.status;

    const triggerAction = () => {
        if (!canReopen) return;
        onAction(actionKey);
    };
    useKeyboardShortcuts(shortcut, triggerAction);

    if (!canReopen) {
        return null;
    }

    return (
        <DropdownMenuItem
            onClick={() => {triggerAction();}}
        >
            <LockOpen className="size-4" />
            {resolveLanguageKey("title")}
            <DropdownMenuShortcut>⌘{shortcut}</DropdownMenuShortcut>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/taskRequests/center/actions/reopenTaskRequestDropdown.tsx"),
    withDebug(true, true, "taskRequests"),
)(ReopenTaskRequestDropdown);
