import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {PosConfig} from "armonia/src/modules/eCommerce/api/eCommerce/private/posConfig/posConfig.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import PosConfigCard from "./center/cardView/posConfigCard.tsx";

export function posConfigEditPath(entity: {_id: string; name?: string}) {
    const params = new URLSearchParams();
    params.set("posConfigId", entity._id);
    if (entity.name) params.set("posConfigTitle", encodeURIComponent(entity.name));
    return `/eCommerce/posconfigs/edit?${params.toString()}`;
}

function AllPosConfigs({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<PosConfig>
            apiUrl="/api/eCommerce/posConfig"
            collectionName="posConfigs"
            accessModel="posConfigs"
            tableConfigKey="posConfigs"
            createPath="/eCommerce/posconfigs/create"
            createIcon={<IconPlus />}
            createLanguageKey="createPosConfig"
            buildEditPath={posConfigEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerce/clients/panel/private/posConfigs/center/sheetView/posConfigSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderCard={(entity, onDelete, onRestore) => (
                <PosConfigCard
                    entity={entity}
                    onDelete={(row: PosConfig | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(entity)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/posConfigs/index.tsx"),
    withDebug(true, true),
)(AllPosConfigs);
