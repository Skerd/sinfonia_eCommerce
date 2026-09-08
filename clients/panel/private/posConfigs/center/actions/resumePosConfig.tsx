import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/context/accessContext.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {PlayCircle} from "lucide-react";
import type {PosConfig} from "armonia/src/modules/eCommerce/api/eCommerce/private/posConfig/posConfig.dto.ts";

type Props = WithLanguageType & {
    entity: Pick<PosConfig, "_id" | "isPaused" | "isCompanyPaused" | "pausedAt" | "deletedAt">;
    onAction: (action: string) => void;
};

function ResumePosConfig({entity, resolveLanguageKey, onAction}: Props) {
    const {write} = useAccess("posConfigs");

    if (!(write?.pausedAt || write?.isActive)) return null;
    if (entity.deletedAt) return null;
    // Company lock must be cleared via Resume all — not per-till resume.
    if (entity.isCompanyPaused) return null;
    // Resume clears this config's pause only; show when this config has pausedAt.
    if (!entity.pausedAt) return null;

    return (
        <DropdownMenuItem onClick={() => onAction("resumePosConfig")}>
            <PlayCircle className="text-success" size={16} />
            {resolveLanguageKey("title")}
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/posConfigs/center/actions/resumePosConfig.tsx"),
    withDebug(true, true, "posConfigs"),
)(ResumePosConfig);
