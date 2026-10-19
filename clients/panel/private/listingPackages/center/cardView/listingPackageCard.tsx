import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconClock, IconCurrencyDollar, IconHash, IconLayoutList, IconUser} from "@tabler/icons-react";
import type {ListingPackage} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/listingPackage/listingPackage.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ListingPackageSheetView from "@eCommerceModule/clients/panel/private/listingPackages/center/sheetView/listingPackageSheetView.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

function listingPackageEditPath(pkg: ListingPackage) {
    const params = new URLSearchParams();
    params.set("listingPackageId", pkg._id);
    return `/eCommerceMarketplace/listingpackages/edit?${params.toString()}`;
}

type ListingPackageCardProps = WithLanguageType & {
    listingPackage: ListingPackage;
    fetchId?: string;
    onDelete?: (deleted?: ListingPackage, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<ListingPackage> | null>;
};

function ListingPackageCard({
    listingPackage,
    resolveLanguageKey,
    fetchId,
    onDelete,
    onRestore,
    hideActions = false,
    sheetOnly = false,
    innerRef,
}: ListingPackageCardProps) {
    return (
        <EntityCard
            resource="listingPackages"
            entity={listingPackage}
            fetchId={fetchId}
            singleUrl="/api/eCommerceMarketplace/listingPackage/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={listingPackageEditPath}
            Sheet={ListingPackageSheetView}
            sheetEntityProp="listingPackage"
            deleteUrl="/api/eCommerceMarketplace/listingPackage"
            restoreUrl="/api/eCommerceMarketplace/listingPackage/restore"
            failedTitle=""
            failedDescription=""
            titlePath="name"
            innerRef={innerRef}
            sheetProps={({entity: row, setEntity}) => ({
                fetchId,
                onSheetRowPatched: (patch: Partial<ListingPackage>) => setEntity({...row, ...patch}),
            })}
        >
            {({entity: row}) => (
                <>
                    <EntityCard.Header titlePath="name" title={row.name} />
                    <EntityCard.Body>
                        <EntityCardRow
                            icon={IconLayoutList}
                            label={resolveLanguageKey("listing")}
                            tooltip={resolveLanguageKey("listing")}
                            path="listing.title"
                            value={row.listing?.title}
                        />
                        <EntityCardRow
                            icon={IconUser}
                            label={resolveLanguageKey("provider")}
                            tooltip={resolveLanguageKey("provider")}
                            path="provider"
                            type="user"
                            value={row.provider}
                        />
                        <EntityCardRow
                            icon={IconCurrencyDollar}
                            label={resolveLanguageKey("priceAmount")}
                            tooltip={resolveLanguageKey("priceAmount")}
                            path="price"
                            type="currency"
                            value={{amount: row.price?.amount, currency: row.price?.currency}}
                        />
                        <EntityCardRow
                            icon={IconClock}
                            label={resolveLanguageKey("deliveryDays")}
                            tooltip={resolveLanguageKey("deliveryDays")}
                            path="deliveryDays"
                            type="number"
                            value={row.deliveryDays}
                        >
                            {(formatted) => (
                                <>
                                    {formatted} {resolveLanguageKey("days")}
                                </>
                            )}
                        </EntityCardRow>
                        <EntityCardRow
                            icon={IconHash}
                            label={resolveLanguageKey("displayOrder")}
                            tooltip={resolveLanguageKey("displayOrder")}
                            path="order"
                            type="number"
                            value={row.order}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/listingPackages/center/cardView/listingPackageCard.tsx"),
    withDebug(true, true, "listingPackages"),
)(ListingPackageCard);
