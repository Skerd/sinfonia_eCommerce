import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {Listing} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/listing/listing.dto.ts";
import {IconClock, IconCurrencyDollar, IconFolder, IconMapPin, IconSparkles, IconTag, IconUser} from "@tabler/icons-react";
import ListingSheetView from "@eCommerceModule/clients/panel/private/listings/center/sheetView/listingSheetView.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ActivateListingDropdown from "@eCommerceModule/clients/panel/private/listings/center/actions/activateListingDropdown.tsx";
import DeactivateListingDropdown from "@eCommerceModule/clients/panel/private/listings/center/actions/deactivateListingDropdown.tsx";
import CreateOrderFromListingDropdown from "@eCommerceModule/clients/panel/private/listings/center/actions/createOrderFromListingDropdown.tsx";
import ChangeListingStatusAction from "@eCommerceModule/components/custom/listings/changeListingStatusAction.tsx";
import CreateOrderFromListingAction from "@eCommerceModule/components/custom/listings/createOrderFromListingAction.tsx";
import DisplayValue from "@coreModule/components/viewEngine/widgets/display/displayValue.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import {AccessGatedGalleryCarousel} from "@coreModule/components/viewEngine/widgets/gallery/galleryCarousel.tsx";
import {accessFieldPathExists} from "@coreModule/helpers/context/accessContext.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {ReactNode, RefObject} from "react";

function listingEditPath(listing: Listing) {
    const params = new URLSearchParams();
    params.set("listingId", listing._id);
    if (listing.title) params.set("listingTitle", listing.title);
    return `/eCommerceMarketplace/listings/edit?${params.toString()}`;
}

type ListingCardProps = WithLanguageType & {
    listing: Listing;
    fetchId?: string;
    onDelete?: (deleted?: Listing, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<Listing> | null>;
};

function ListingCard({
    listing,
    resolveLanguageKey,
    fetchId,
    onDelete,
    onRestore,
    hideActions = false,
    sheetOnly = false,
    innerRef,
}: ListingCardProps) {
    return (
        <EntityCard
            resource="listings"
            entity={listing}
            fetchId={fetchId}
            singleUrl="/api/eCommerceMarketplace/listing/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={listingEditPath}
            Sheet={ListingSheetView}
            sheetEntityProp="listing"
            deleteUrl="/api/eCommerceMarketplace/listing"
            restoreUrl="/api/eCommerceMarketplace/listing/restore"
            failedTitle=""
            failedDescription=""
            titlePath="title"
            innerRef={innerRef}
            sheetProps={({entity: row, setEntity}) => ({
                fetchId,
                onSheetRowPatched: (patch: Partial<Listing>) => setEntity({...row, ...patch}),
            })}
            extraDialogs={({action, setAction, entity: row, setEntity}) => (
                <>
                    {(action === "activate" || action === "deactivate") && (
                        <ChangeListingStatusAction
                            listingId={row._id}
                            listingTitle={row.title}
                            targetStatus={action === "activate" ? "active" : "inactive"}
                            openAlert
                            url={`/api/eCommerceMarketplace/listing/${action}`}
                            onSuccess={(newStatus: string) => {
                                setEntity({...row, status: newStatus});
                                setAction("");
                            }}
                            onCancel={() => setAction("")}
                        />
                    )}
                    {action === "createOrderFromListing" && (
                        <CreateOrderFromListingAction
                            listingId={row._id}
                            displayName={row.title}
                            openAlert
                            url="/api/eCommerceMarketplace/order/createFromListing"
                            onSuccess={() => setAction("")}
                            onCancel={() => setAction("")}
                        />
                    )}
                </>
            )}
        >
            {({entity: row, read, setAction}) => {
                const promotionType = row.promotions?.some((p) => p.type === "featured")
                    ? "featured"
                    : row.promotions?.some((p) => p.type === "sponsored")
                      ? "sponsored"
                      : undefined;
                const isHourly = accessFieldPathExists(read, "pricingType") && row.pricingType === "hourly";
                return (
                    <>
                        <AccessGatedGalleryCarousel
                            read={read}
                            mainImage={row.mainImage}
                            imageGallery={row.imageGallery || []}
                            videoGallery={row.videoGallery || []}
                            showThumbnails={false}
                            allowFullScreen={false}
                            coverAfterFirst
                        />
                        <EntityCard.Header
                            titlePath="title"
                            title={row.title}
                            badgesBesideTitle
                            badges={
                                accessFieldPathExists(read, "promotions") && promotionType ? (
                                    <DisplayValue path="promotions" value={resolveLanguageKey(promotionType)}>
                                        {(formatted: ReactNode) => (
                                            <span className="inline-flex items-center gap-1 text-3xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-warning/20 text-warning shrink-0">
                                                <IconSparkles className="w-3 h-3" />
                                                {formatted}
                                            </span>
                                        )}
                                    </DisplayValue>
                                ) : undefined
                            }
                        >
                            {row.status !== "active" && !row.deletedAt && (
                                <ActivateListingDropdown onAction={setAction} />
                            )}
                            {row.status !== "inactive" && !row.deletedAt && (
                                <DeactivateListingDropdown onAction={setAction} />
                            )}
                            <CreateOrderFromListingDropdown listing={row} onAction={setAction} />
                        </EntityCard.Header>
                        <EntityCard.Body>
                            <EntityCardRow
                                icon={IconTag}
                                label={resolveLanguageKey("status")}
                                tooltip={resolveLanguageKey("status")}
                                path="status"
                                type="enum"
                                languageKeyCategory="statuses"
                                value={row.status}
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
                                icon={IconFolder}
                                label={resolveLanguageKey("category")}
                                tooltip={resolveLanguageKey("category")}
                                path="category.name"
                                value={row.category?.name}
                            />
                            <EntityCardRow
                                icon={IconCurrencyDollar}
                                label={resolveLanguageKey("price")}
                                tooltip={resolveLanguageKey("price")}
                                path="price"
                                type="currency"
                                value={{amount: row.price, currency: row.priceCurrency}}
                            >
                                {(formatted) => (
                                    <>
                                        {formatted}
                                        {isHourly ? ` / ${resolveLanguageKey("perHour")}` : null}
                                    </>
                                )}
                            </EntityCardRow>
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
                                icon={IconMapPin}
                                label={resolveLanguageKey("city")}
                                tooltip={resolveLanguageKey("city")}
                                path="address.city.name"
                                value={row.address?.city?.name}
                            />
                        </EntityCard.Body>
                    </>
                );
            }}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/listings/center/cardView/listingCard.tsx"),
    withDebug(true, true, "listings"),
)(ListingCard);
