import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@baseModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@baseModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@baseModule/helpers/hooks/useAccess.ts";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {Power} from "lucide-react";
import type {FiscalConfig} from "armonia/src/modules/eCommerce/api/eCommerce/private/fiscalConfig/fiscalConfig.dto.ts";

type ActivateFiscalConfigProps = WithLanguageType & {
    entity: Pick<FiscalConfig, "_id" | "isActive">;
    onAction: (action: string) => void;
};

function ActivateFiscalConfig({entity, resolveLanguageKey, onAction}: ActivateFiscalConfigProps) {
    const {write} = useAccess("fiscalConfigs");

    if (!write?.isActive) return null;
    if (entity.isActive) return null;

    return (
        <DropdownMenuItem onClick={() => onAction("activateFiscalConfig")}>
            <Power className="text-success" size={16} />
            {resolveLanguageKey("title")}
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/fiscalConfigs/center/actions/activateFiscalConfig.tsx"),
    withDebug(true, true, "fiscalConfigs"),
)(ActivateFiscalConfig);
