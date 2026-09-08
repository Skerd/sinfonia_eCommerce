import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/context/accessContext.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {PauseCircle} from "lucide-react";
import type {PosConfig} from "armonia/src/modules/eCommerce/api/eCommerce/private/posConfig/posConfig.dto.ts";

type Props = WithLanguageType & {
    entity: Pick<PosConfig, "_id" | "isPaused" | "deletedAt">;
    onAction: (action: string) => void;
};

function PausePosConfig({entity, resolveLanguageKey, onAction}: Props) {
    const {write} = useAccess("posConfigs");

    if (!(write?.pausedAt || write?.isActive)) return null;
    if (entity.deletedAt) return null;
    if (entity.isPaused) return null;

    return (
        <DropdownMenuItem onClick={() => onAction("pausePosConfig")}>
            <PauseCircle className="text-warning" size={16} />
            {resolveLanguageKey("title")}
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/posConfigs/center/actions/pausePosConfig.tsx"),
    withDebug(true, true, "posConfigs"),
)(PausePosConfig);
