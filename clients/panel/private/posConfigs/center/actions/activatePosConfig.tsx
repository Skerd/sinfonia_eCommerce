import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {Power} from "lucide-react";
import type {PosConfig} from "armonia/src/modules/eCommerce/api/eCommerce/private/posConfig/posConfig.dto.ts";

type Props = WithLanguageType & {
    entity: Pick<PosConfig, "_id" | "isActive">;
    onAction: (action: string) => void;
};

function ActivatePosConfig({entity, resolveLanguageKey, onAction}: Props) {
    const {write} = useAccess("posConfigs");

    if (!write?.isActive) return null;
    if (entity.isActive) return null;

    return (
        <DropdownMenuItem onClick={() => onAction("activatePosConfig")}>
            <Power className="text-success" size={16} />
            {resolveLanguageKey("title")}
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/posConfigs/center/actions/activatePosConfig.tsx"),
    withDebug(true, true),
)(ActivatePosConfig);
