import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {Cable} from "lucide-react";
import type {PosPaymentMethod} from "armonia/src/modules/eCommerce/api/eCommerce/private/posPaymentMethod/posPaymentMethod.dto.ts";

type TestPosTerminalConnectionProps = WithLanguageType & {
    entity: Pick<PosPaymentMethod, "_id" | "terminalEnabled" | "type">;
    onAction: (action: string) => void;
};

function TestPosTerminalConnection({entity, onAction, resolveLanguageKey}: TestPosTerminalConnectionProps) {
    if (!entity.terminalEnabled) return null;
    if (entity.type !== "card" && entity.type !== "bank") return null;

    return (
        <DropdownMenuItem onClick={() => onAction("testPosTerminalConnection")}>
            <Cable size={16} />
            {resolveLanguageKey("title")}
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/posPaymentMethods/center/actions/testPosTerminalConnection.tsx"),
    withDebug(true, true),
)(TestPosTerminalConnection);
