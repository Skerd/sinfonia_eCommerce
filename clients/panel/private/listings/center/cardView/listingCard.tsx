import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {Listing} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/listing/listing.dto.ts";
import {IconClock, IconFolder, IconMapPin, IconPhoto, IconSparkles} from "@tabler/icons-react";
import ListingSheetView from "@eCommerceModule/clients/panel/private/listings/center/sheetView/listingSheetView.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ActivateListingDropdown from "@eCommerceModule/clients/panel/private/listings/center/actions/activateListingDropdown.tsx";
import DeactivateListingDropdown from "@eCommerceModule/clients/panel/private/listings/center/actions/deactivateListingDropdown.tsx";
import CreateOrderFromListingDropdown from "@eCommerceModule/clients/panel/private/listings/center/actions/createOrderFromListingDropdown.tsx";
import ChangeListingStatusAction from "@eCommerceModule/components/custom/listings/changeListingStatusAction.tsx";
import CreateOrderFromListingAction from "@eCommerceModule/components/custom/listings/createOrderFromListingAction.tsx";
import DisplayValue from "@coreModule/components/viewEngine/widgets/display/displayValue.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

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
            {({entity: row, setAction}) => {
                const isFeatured = row.promotions?.some((p) => p.type === "featured");
                const isSponsored = row.promotions?.some((p) => p.type === "sponsored");
                const providerInitials = [row.provider?.name?.[0], row.provider?.surname?.[0]]
                    .filter(Boolean)
                    .join("")
                    .toUpperCase();
                return (
                    <>
                        <div className="relative h-50 overflow-hidden bg-muted">
                            {row.mainImage ? (
                                <img
                                    src={`/api/auxiliary/public/media/${row.mainImage._id}`}
                                    alt={row.title ?? ""}
                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-muted via-muted/70 to-muted/40">
                                    <IconPhoto className="h-14 w-14 text-muted-foreground/15" />
                                </div>
                            )}
                            <div className="pointer-events-none absolute inset-0 transform-gpu bg-linear-to-t from-black/65 via-black/10 to-transparent" />
                            <div className="absolute right-2 bottom-2 left-2 flex items-end justify-between gap-2">
                                {row.category?.name ? (
                                    <span className="inline-flex max-w-[60%] items-center gap-1 truncate rounded-full border border-overlay-foreground/20 bg-overlay-foreground/15 px-2.5 py-1 text-2xs font-medium text-overlay-foreground shadow-sm backdrop-blur-sm">
                                        <IconFolder className="h-3 w-3 shrink-0" />
                                        <span className="truncate">{row.category.name}</span>
                                    </span>
                                ) : null}
                                {isFeatured || isSponsored ? (
                                    <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-warning/20 px-2.5 py-1 text-3xs font-bold tracking-wide text-warning uppercase shadow-sm">
                                        <IconSparkles className="h-3 w-3" />
                                        {isFeatured ? resolveLanguageKey("featured") : resolveLanguageKey("sponsored")}
                                    </span>
                                ) : null}
                            </div>
                        </div>
                        <EntityCard.Header titlePath="title" title={row.title}>
                            {row.status !== "active" && !row.deletedAt && (
                                <ActivateListingDropdown onAction={setAction} />
                            )}
                            {row.status !== "inactive" && !row.deletedAt && (
                                <DeactivateListingDropdown onAction={setAction} />
                            )}
                            <CreateOrderFromListingDropdown listing={row} onAction={setAction} />
                        </EntityCard.Header>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between gap-2">
                                {row.provider ? (
                                    <div className="flex min-w-0 items-center gap-2">
                                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
                                            <span className="text-3xs font-bold leading-none text-primary">
                                                {providerInitials || "?"}
                                            </span>
                                        </div>
                                        <DisplayValue path="provider" type="user" value={row.provider} />
                                    </div>
                                ) : null}
                                <span
                                    className={cn(
                                        "inline-flex shrink-0 items-center gap-1.5 text-3xs font-semibold tracking-wide uppercase",
                                        row.status === "active"
                                            ? "text-success"
                                            : row.status === "inactive"
                                              ? "text-warning"
                                              : "text-muted-foreground",
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "h-1.5 w-1.5 shrink-0 rounded-full",
                                            row.status === "active"
                                                ? "animate-pulse bg-success"
                                                : row.status === "inactive"
                                                  ? "bg-warning"
                                                  : "bg-muted-foreground/40",
                                        )}
                                    />
                                    <DisplayValue
                                        path="status"
                                        type="enum"
                                        languageKeyCategory="statuses"
                                        value={row.status}
                                    />
                                </span>
                            </div>
                            {row.description ? (
                                <DisplayValue path="description" value={row.description}>
                                    {(text) => (
                                        <p className="-mt-0.5 line-clamp-1 text-xs leading-normal text-muted-foreground">
                                            {text}
                                        </p>
                                    )}
                                </DisplayValue>
                            ) : null}
                            {row.tags && row.tags.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                    {row.tags.slice(0, 3).map((tag, i) => (
                                        <span
                                            key={i}
                                            className="rounded-full bg-primary/10 px-2 py-0.5 text-3xs font-medium text-primary/80"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                    {row.tags.length > 3 ? (
                                        <span className="self-center text-3xs font-medium text-muted-foreground">
                                            +{row.tags.length - 3}
                                        </span>
                                    ) : null}
                                </div>
                            ) : null}
                            <div className="flex items-end justify-between gap-2">
                                <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                    {row.address?.city?.name ? (
                                        <span className="flex items-center gap-1 truncate">
                                            <IconMapPin className="h-3.5 w-3.5 shrink-0" />
                                            <DisplayValue path="address.city.name" value={row.address.city.name} />
                                        </span>
                                    ) : null}
                                    {row.deliveryDays != null ? (
                                        <span className="flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-0.5">
                                            <IconClock className="h-3 w-3" />
                                            <DisplayValue path="deliveryDays" type="number" value={row.deliveryDays} />
                                            {resolveLanguageKey("days")}
                                        </span>
                                    ) : null}
                                </div>
                                <div className="shrink-0 text-right">
                                    <div className="mb-0.5 text-3xs leading-none tracking-wide text-muted-foreground uppercase">
                                        {resolveLanguageKey("from")}
                                    </div>
                                    <div className="flex items-baseline gap-0.5">
                                        <span className="text-base font-bold leading-none text-foreground">
                                            <DisplayValue
                                                path="price"
                                                type="currency"
                                                value={{amount: row.price, currency: row.priceCurrency}}
                                            />
                                        </span>
                                        {row.pricingType === "hourly" ? (
                                            <span className="text-3xs text-muted-foreground">
                                                /{resolveLanguageKey("perHour")}
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        </div>
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
