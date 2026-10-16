import {compose} from "redux";
import {useMemo} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage, {type QuickFilterDef} from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {COLUMN_TYPE} from "armonia/src/modules/core/database/filter/typeOperators.ts";
import type {PosSession} from "armonia/src/modules/eCommerce/api/eCommerce/private/posSession/posSession.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import PosSessionCard from "./center/cardView/posSessionCard.tsx";

function AllPosSessions({resolveLanguageKey}: WithLanguageType) {
    const quickFilters = useMemo<QuickFilterDef[]>(() => [
        {
            field: "state",
            label: String(resolveLanguageKey("fields.state")),
            type: COLUMN_TYPE.ENUM,
            enumValues: ["opening_control", "opened", "closing_control", "closed"].map((value) => ({
                value,
                label: String(resolveLanguageKey(`fields.!enums.state.${value}`)),
            })),
        },
        {
            field: "config",
            label: String(resolveLanguageKey("fields.config")),
            type: COLUMN_TYPE.OBJECT_ID,
            apiUrl: "/api/eCommerce/posConfig/select",
        },
    ], [resolveLanguageKey]);

    return (
        <EntityListPage<PosSession>
            apiUrl="/api/eCommerce/posSession"
            collectionName="posSessions"
            accessModel="posSessions"
            tableConfigKey="posSessions"
            hideCreate
            buildEditPath={() => ""}
            rowActionMenu={{hideEdit: true, hideDelete: true, hideRestore: true}}
            resolveLanguageKey={resolveLanguageKey}
            quickFilters={quickFilters}
            sheetLanguagePath="src/modules/eCommerce/clients/panel/private/posSessions/center/sheetView/posSessionSheetView.tsx"
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
    withDebug(true, true, "posSessions"),
)(AllPosSessions);
