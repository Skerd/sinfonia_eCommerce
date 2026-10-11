import {compose} from "redux";
import {IconPlus} from "@tabler/icons-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import type {SavedSearch} from "armonia/src/modules/eCommerce/api/eCommerce/private/savedSearch/savedSearch.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import SavedSearchCard from "./center/cardView/savedSearchCard.tsx";

export function savedSearchEditPath(search: {_id: string; name?: string}) {
    const params = new URLSearchParams();
    params.set("savedSearchId", search._id);
    if (search.name) params.set("savedSearchName", encodeURIComponent(search.name));
    return `/eCommerce/savedsearches/edit?${params.toString()}`;
}

function AllSavedSearches({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<SavedSearch>
            apiUrl="/api/eCommerce/savedSearch"
            collectionName="savedsearches"
            accessModel="savedsearches"
            tableConfigKey="savedsearches"
            createPath="/eCommerce/savedsearches/create"
            createIcon={<IconPlus />}
            createLanguageKey="createSavedSearch"
            buildEditPath={savedSearchEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerce/clients/panel/private/savedSearches/center/sheetView/savedSearchSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderCard={(search, onDelete, onRestore) => (
                <SavedSearchCard
                    entity={search}
                    onDelete={(row: SavedSearch | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(search)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/savedSearches/index.tsx"),
    withDebug(true, true, "savedsearches"),
)(AllSavedSearches);
