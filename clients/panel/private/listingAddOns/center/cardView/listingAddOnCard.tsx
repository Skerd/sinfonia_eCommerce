import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconClock, IconLayoutList} from "@tabler/icons-react";
import type {ListingAddOn} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/listingAddOn/listingAddOn.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ListingAddOnSheetView from "@eCommerceModule/clients/panel/private/listingAddOns/center/sheetView/listingAddOnSheetView.tsx";
import DisplayValue from "@coreModule/components/viewEngine/widgets/display/displayValue.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

function listingAddOnEditPath(addOn: ListingAddOn) {
    const params = new URLSearchParams();
    params.set("listingAddOnId", addOn._id);
    return `/eCommerceMarketplace/listingaddons/edit?${params.toString()}`;
}

type ListingAddOnCardProps = WithLanguageType & {
    listingAddOn: ListingAddOn;
    fetchId?: string;
    onDelete?: (deleted?: ListingAddOn, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<ListingAddOn> | null>;
};

function ListingAddOnCard({
    listingAddOn,
    resolveLanguageKey,
    fetchId,
    onDelete,
    onRestore,
    hideActions = false,
    sheetOnly = false,
    innerRef,
}: ListingAddOnCardProps) {
    return (
        <EntityCard
            resource="listingAddOns"
            entity={listingAddOn}
            fetchId={fetchId}
            singleUrl="/api/eCommerceMarketplace/listingAddOn/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={listingAddOnEditPath}
            Sheet={ListingAddOnSheetView}
            sheetEntityProp="listingAddOn"
            deleteUrl="/api/eCommerceMarketplace/listingAddOn"
            restoreUrl="/api/eCommerceMarketplace/listingAddOn/restore"
            failedTitle=""
            failedDescription=""
            titlePath="name"
            innerRef={innerRef}
            sheetProps={({entity: row, setEntity}) => ({
                fetchId,
                onSheetRowPatched: (patch: Partial<ListingAddOn>) => setEntity({...row, ...patch}),
            })}
        >
            {({entity: row}) => (
                <>
                    <EntityCard.Header titlePath="name" title={row.name} />
                    <div className="flex flex-col gap-2">
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
    withLanguage("src/modules/eCommerce/clients/panel/private/listingAddOns/center/cardView/listingAddOnCard.tsx"),
    withDebug(true, true, "listingAddOns"),
)(ListingAddOnCard);
