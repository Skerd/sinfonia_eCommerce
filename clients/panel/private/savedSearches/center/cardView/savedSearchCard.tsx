import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {SavedSearch} from "armonia/src/modules/eCommerce/api/eCommerce/private/savedSearch/savedSearch.dto.ts";
import {IconCategory2, IconCurrencyDollar, IconStack2, IconUser} from "@tabler/icons-react";
import SavedSearchSheetView from "@eCommerceModule/clients/panel/private/savedSearches/center/sheetView/savedSearchSheetView.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";
import {accessFieldPathExists} from "@coreModule/helpers/context/accessContext.tsx";
import {getName} from "@coreModule/helpers/general/names.ts";
import {formatCurrency, formatNumber} from "@coreModule/helpers/general/numbers.ts";

/** "€10 – €50", "from €10" or "up to €50" in the shop currency the route adds (UX-07). */
function savedSearchPriceRange(search: SavedSearch, resolveLanguageKey: WithLanguageType["resolveLanguageKey"]): string | undefined {
    const abbreviation = search.currency?.abbreviation;
    const money = (amount: number) => (abbreviation ? formatCurrency(amount, abbreviation, {maximumFractionDigits: 2}) : formatNumber(amount));
    const {priceMin, priceMax} = search;
    if (priceMin != null && priceMax != null) return `${money(priceMin)} – ${money(priceMax)}`;
    if (priceMin != null) return `${String(resolveLanguageKey("priceFrom"))} ${money(priceMin)}`;
    if (priceMax != null) return `${String(resolveLanguageKey("priceUpTo"))} ${money(priceMax)}`;
    return undefined;
}

function savedSearchEditPath(search: SavedSearch, lockCustomer: boolean) {
    const params = new URLSearchParams();
    params.set("savedSearchId", search._id);
    if (search.name) params.set("savedSearchName", encodeURIComponent(search.name));
    if (lockCustomer) params.set("lockCustomer", "1");
    return `/eCommerce/savedsearches/edit?${params.toString()}`;
}

type SavedSearchCardProps = WithLanguageType & {
    entity: SavedSearch;
    fetchId?: string;
    lockCustomer?: boolean;
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
    lockCustomer = false,
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
            editPath={(row) => savedSearchEditPath(row, lockCustomer)}
            Sheet={SavedSearchSheetView}
            sheetEntityProp="entity"
            deleteUrl="/api/eCommerce/savedSearch"
            restoreUrl="/api/eCommerce/savedSearch/restore"
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
            titlePath="name"
            innerRef={innerRef}
            sheetProps={() => ({fetchId, lockCustomer})}
        >
            {({entity: row, read}) => {
                const customerName = getName(row.customer);
                const categoryNames = row.categoryIds?.map((category) => category.name).filter(Boolean).join(", ");
                const collectionName = row.collectionId?.name;
                const priceRange = savedSearchPriceRange(row, resolveLanguageKey);
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
                            {priceRange ? (
                                <EntityCardRow
                                    icon={IconCurrencyDollar}
                                    label={resolveLanguageKey("priceRange")}
                                    tooltip={resolveLanguageKey("priceRange")}
                                    show={accessFieldPathExists(read, "priceMin") || accessFieldPathExists(read, "priceMax")}
                                    value={priceRange}
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
