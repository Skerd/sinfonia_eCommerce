import {compose} from "redux";
import {useMemo} from "react";
import {useSelector} from "react-redux";
import {IconPlus} from "@tabler/icons-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {RootState} from "@coreModule/helpers/redux/store/generalStore.ts";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import type {SavedSearch} from "armonia/src/modules/eCommerce/api/eCommerce/private/savedSearch/savedSearch.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import SavedSearchCard from "./center/cardView/savedSearchCard.tsx";
import SavedSearchSheetView from "./center/sheetView/savedSearchSheetView.tsx";

export const SAVED_SEARCH_FORM_BASE = "/eCommerce/savedsearches";

export function savedSearchEditPath(
    search: {_id: string; name?: string},
    lockCustomer = false,
) {
    const params = new URLSearchParams();
    params.set("savedSearchId", search._id);
    if (search.name) params.set("savedSearchName", encodeURIComponent(search.name));
    if (lockCustomer) params.set("lockCustomer", "1");
    return `${SAVED_SEARCH_FORM_BASE}/edit?${params.toString()}`;
}

type AllSavedSearchesProps = WithLanguageType & {
    specificUserId?: string;
    /** Company catalog: every saved search, with a customer picker on create and edit. */
    companyWide?: boolean;
};

function AllSavedSearches({resolveLanguageKey, specificUserId, companyWide}: AllSavedSearchesProps) {
    const currentUserId = useSelector((state: RootState) => state.authentication.user.id);
    const ownerId = specificUserId || currentUserId;
    const lockCustomer = !companyWide;
    const extraParams = useMemo(
        () => (companyWide || !ownerId ? undefined : {customerId: ownerId}),
        [companyWide, ownerId],
    );
    if (!companyWide && !ownerId) return null;

    return (
        <EntityListPage<SavedSearch>
            apiUrl="/api/eCommerce/savedSearch"
            collectionName="savedsearches"
            accessModel="savedsearches"
            tableConfigKey="savedsearches"
            selfAccess={!specificUserId}
            extraParams={extraParams}
            headerTitle={companyWide ? resolveLanguageKey("catalogTitle") : undefined}
            headerDescription={companyWide ? resolveLanguageKey("catalogDescription") : undefined}
            createPath={
                lockCustomer
                    ? `${SAVED_SEARCH_FORM_BASE}/create?specificUserId=${ownerId}`
                    : `${SAVED_SEARCH_FORM_BASE}/create`
            }
            createIcon={<IconPlus />}
            createLanguageKey="createSavedSearch"
            buildEditPath={(entity) => savedSearchEditPath(entity, lockCustomer)}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerce/clients/panel/private/savedSearches/center/sheetView/savedSearchSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderCard={(search, onDelete, onRestore) => (
                <SavedSearchCard
                    entity={search}
                    lockCustomer={lockCustomer}
                    onDelete={(row: SavedSearch | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(search)}
                />
            )}
            renderSheet={({entity, open, onOpenChange, onDelete, onRestore}) => (
                <SavedSearchSheetView
                    open={open}
                    onOpenChange={(opened: boolean) => {
                        if (!opened) onOpenChange();
                    }}
                    entity={entity}
                    lockCustomer={lockCustomer}
                    onDelete={onDelete}
                    onRestore={onRestore}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/savedSearches/index.tsx"),
    withDebug(true, true, "savedsearches"),
)(AllSavedSearches);
