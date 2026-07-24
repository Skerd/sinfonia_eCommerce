import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import type {PosSession} from "armonia/src/modules/eCommerce/api/eCommerce/private/posSession/posSession.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import PosSessionCard from "./center/cardView/posSessionCard.tsx";

export function posSessionEditPath(entity: {_id: string; name?: string}) {
    const params = new URLSearchParams();
    params.set("posSessionId", entity._id);
    if (entity.name) params.set("posSessionTitle", encodeURIComponent(entity.name));
    return `/eCommerce/possessions/edit?${params.toString()}`;
}

function AllPosSessions({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<PosSession>
            apiUrl="/api/eCommerce/posSession"
            collectionName="posSessions"
            accessModel="posSessions"
            tableConfigKey="posSessions"
            hideCreate
            buildEditPath={posSessionEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerce/clients/panel/private/posSessions/center/sheetView/posSessionSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderCard={(entity, onDelete, onRestore) => (
                <PosSessionCard
                    entity={entity}
                    onDelete={(row: PosSession | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(entity)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/posSessions/index.tsx"),
    withDebug(true, true),
)(AllPosSessions);
