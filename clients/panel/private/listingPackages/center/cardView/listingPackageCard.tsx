import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconClock, IconLayoutList} from "@tabler/icons-react";
import type {ListingPackage} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/listingPackage/listingPackage.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ListingPackageSheetView from "@eCommerceModule/clients/panel/private/listingPackages/center/sheetView/listingPackageSheetView.tsx";
import DisplayValue from "@coreModule/components/viewEngine/widgets/display/displayValue.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
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
                    <EntityCard.Header
                        titlePath="name"
                        title={row.name}
                        badges={
                            row.order != null ? (
                                <DisplayValue path="order" value={`#${row.order}`} />
                            ) : undefined
                        }
                    />
                    <div className="flex flex-col gap-2">
                        {row.description ? (
                            <DisplayValue path="description" value={row.description}>
                                {(text) => (
                                    <p className="line-clamp-2 text-xs leading-normal text-muted-foreground">{text}</p>
                                )}
                            </DisplayValue>
                        ) : null}
                        <DisplayValue path="provider" type="user" value={row.provider} />
                        <div className="flex items-end justify-between gap-2">
                            <span className="flex min-w-0 items-center gap-1 truncate text-xs text-muted-foreground">
                                <IconLayoutList className="h-3 w-3 shrink-0" />
                                <DisplayValue path="listing.title" value={row.listing?.title} />
                            </span>
                            <div className="ml-auto flex shrink-0 items-center gap-2">
                                {row.deliveryDays != null ? (
                                    <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                        <IconClock className="h-3 w-3" />
                                        <DisplayValue path="deliveryDays" type="number" value={row.deliveryDays} />
                                        {resolveLanguageKey("days")}
                                    </span>
                                ) : null}
                                <span className="text-base font-bold leading-none text-foreground">
                                    <DisplayValue
                                        path="price"
                                        type="currency"
                                        value={{amount: row.price?.amount, currency: row.price?.currency}}
                                    />
                                </span>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/listingPackages/center/cardView/listingPackageCard.tsx"),
    withDebug(true, true, "listingPackages"),
)(ListingPackageCard);
