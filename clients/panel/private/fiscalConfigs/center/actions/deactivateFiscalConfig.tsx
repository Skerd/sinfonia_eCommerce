import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/context/accessContext.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {PowerOff} from "lucide-react";
import type {FiscalConfig} from "armonia/src/modules/eCommerce/api/eCommerce/private/fiscalConfig/fiscalConfig.dto.ts";

type DeactivateFiscalConfigProps = WithLanguageType & {
    entity: Pick<FiscalConfig, "_id" | "isActive">;
    onAction: (action: string) => void;
};

function DeactivateFiscalConfig({entity, resolveLanguageKey, onAction}: DeactivateFiscalConfigProps) {
    const {write} = useAccess("fiscalConfigs");

    if (!write?.isActive) return null;
    if (!entity.isActive) return null;

    return (
        <DropdownMenuItem onClick={() => onAction("deactivateFiscalConfig")}>
            <PowerOff className="text-destructive" size={16} />
            {resolveLanguageKey("title")}
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/fiscalConfigs/center/actions/deactivateFiscalConfig.tsx"),
    withDebug(true, true, "fiscalConfigs"),
)(DeactivateFiscalConfig);
