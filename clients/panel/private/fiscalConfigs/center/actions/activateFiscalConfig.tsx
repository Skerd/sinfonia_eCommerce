import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
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
            <Power className="text-green-600" size={16} />
            {resolveLanguageKey("title")}
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/fiscalConfigs/center/actions/activateFiscalConfig.tsx"),
    withDebug(true, true),
)(ActivateFiscalConfig);
