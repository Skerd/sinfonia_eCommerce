import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {FiscalConfig} from "armonia/src/modules/eCommerce/api/eCommerce/private/fiscalConfig/fiscalConfig.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import FiscalConfigCard from "./center/cardView/fiscalConfigCard.tsx";

export function fiscalConfigEditPath(entity: {_id: string; name?: string}) {
    const params = new URLSearchParams();
    params.set("fiscalConfigId", entity._id);
    if (entity.name) params.set("fiscalConfigTitle", encodeURIComponent(entity.name));
    return `/eCommerce/fiscalconfigs/edit?${params.toString()}`;
}

function AllFiscalConfigs({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<FiscalConfig>
            apiUrl="/api/eCommerce/fiscalConfig"
            collectionName="fiscalConfigs"
            accessModel="fiscalConfigs"
            tableConfigKey="fiscalConfigs"
            createPath="/eCommerce/fiscalconfigs/create"
            createIcon={<IconPlus />}
            createLanguageKey="createFiscalConfig"
            buildEditPath={fiscalConfigEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerce/clients/panel/private/fiscalConfigs/center/sheetView/fiscalConfigSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderCard={(entity, onDelete, onRestore) => (
                <FiscalConfigCard
                    entity={entity}
                    onDelete={(row: FiscalConfig | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(entity)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/fiscalConfigs/index.tsx"),
    withDebug(true, true),
)(AllFiscalConfigs);
