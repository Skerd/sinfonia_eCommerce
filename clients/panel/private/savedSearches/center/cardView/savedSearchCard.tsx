import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {SavedSearch} from "armonia/src/modules/eCommerce/api/eCommerce/private/savedSearch/savedSearch.dto.ts";
import {IconArrowsSort, IconCategory2, IconHash, IconStack2, IconUser} from "@tabler/icons-react";
import SavedSearchSheetView from "@eCommerceModule/clients/panel/private/savedSearches/center/sheetView/savedSearchSheetView.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";
import {getName} from "@coreModule/helpers/general/names.ts";

function savedSearchEditPath(search: SavedSearch) {
    const params = new URLSearchParams();
    params.set("savedSearchId", search._id);
    if (search.name) params.set("savedSearchName", encodeURIComponent(search.name));
    return `/eCommerce/savedsearches/edit?${params.toString()}`;
}

type SavedSearchCardProps = WithLanguageType & {
    entity: SavedSearch;
    fetchId?: string;
    onDelete?: (deleted?: SavedSearch, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<SavedSearch> | null>;
};

function SavedSearchCard({
    entity,
    resolveLanguageKey,
    fetchId,
    onDelete,
    onRestore,
    hideActions = false,
    sheetOnly = false,
    innerRef,
}: SavedSearchCardProps) {
    return (
        <EntityCard
            resource="savedsearches"
            entity={entity}
            fetchId={fetchId}
            singleUrl="/api/eCommerce/savedSearch/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={savedSearchEditPath}
            Sheet={SavedSearchSheetView}
            sheetEntityProp="entity"
            deleteUrl="/api/eCommerce/savedSearch"
            restoreUrl="/api/eCommerce/savedSearch/restore"
            failedTitle=""
            failedDescription=""
            titlePath="name"
            innerRef={innerRef}
            sheetProps={() => ({fetchId})}
        >
            {({entity: row}) => {
                const customerName = getName(row.customer);
                const categoryNames = row.categoryIds?.map((category) => category.name).filter(Boolean).join(", ");
                const collectionName = row.collectionId?.name;
                return (
                    <>
                        <EntityCard.Header titlePath="name" title={row.name} />
                        <EntityCard.Body>
                            {customerName ? (
                                <EntityCardRow
                                    icon={IconUser}
                                    label={resolveLanguageKey("customer")}
                                    tooltip={resolveLanguageKey("customer")}
                                    path="customer"
                                    value={customerName}
                                />
                            ) : null}
                            {categoryNames ? (
                                <EntityCardRow
                                    icon={IconCategory2}
                                    label={resolveLanguageKey("categoryIds")}
                                    tooltip={resolveLanguageKey("categoryIds")}
                                    path="categoryIds"
                                    value={categoryNames}
                                />
                            ) : null}
                            {collectionName ? (
                                <EntityCardRow
                                    icon={IconStack2}
                                    label={resolveLanguageKey("collectionId")}
                                    tooltip={resolveLanguageKey("collectionId")}
                                    path="collectionId"
                                    value={collectionName}
                                />
                            ) : null}
                            {typeof row.priceMin === "number" ? (
                                <EntityCardRow
                                    icon={IconHash}
                                    label={resolveLanguageKey("priceMin")}
                                    tooltip={resolveLanguageKey("priceMin")}
                                    path="priceMin"
                                    type="number"
                                    value={row.priceMin}
                                />
                            ) : null}
                            {typeof row.priceMax === "number" ? (
                                <EntityCardRow
                                    icon={IconHash}
                                    label={resolveLanguageKey("priceMax")}
                                    tooltip={resolveLanguageKey("priceMax")}
                                    path="priceMax"
                                    type="number"
                                    value={row.priceMax}
                                />
                            ) : null}
                            {row.sort ? (
                                <EntityCardRow
                                    icon={IconArrowsSort}
                                    label={resolveLanguageKey("sort")}
                                    tooltip={resolveLanguageKey("sort")}
                                    path="sort"
                                    value={resolveLanguageKey(row.sort)}
                                />
                            ) : null}
                        </EntityCard.Body>
                    </>
                );
            }}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/savedSearches/center/cardView/savedSearchCard.tsx"),
    withDebug(true, true, "savedsearches"),
)(SavedSearchCard);
