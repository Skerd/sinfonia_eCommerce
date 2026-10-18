import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import type {Listing} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/listing/listing.dto.ts";
import type {DeleteResponse} from "armonia/src/modules/core/types/shared.types.ts";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import ActivateListingDropdown from "@eCommerceModule/clients/panel/private/listings/center/actions/activateListingDropdown.tsx";
import DeactivateListingDropdown from "@eCommerceModule/clients/panel/private/listings/center/actions/deactivateListingDropdown.tsx";
import ChangeListingStatusAction from "@eCommerceModule/components/custom/listings/changeListingStatusAction.tsx";

export type ListingSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    listing?: Listing;
    hideActions?: boolean;
    onDelete?: (response?: DeleteResponse) => void;
    onRestore?: () => void;
    onSheetRowPatched?: (patch: Partial<Listing>) => void;
    fetchId?: string;
};

function listingEditPath(row: Listing) {
    const params = new URLSearchParams();
    params.set("listingId", row._id);
    if (row.title) params.set("listingTitle", row.title);
    return `/eCommerceMarketplace/listings/edit?${params.toString()}`;
}

function ListingSheetView({
    open,
    onOpenChange,
    listing: listingProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    onSheetRowPatched,
    fetchId,
}: ListingSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(listingProp || {_id: fetchId});
    const [action, setAction] = useState("");
    const access = useAccess("listings");
    const viewConfig = useViewConfig("listings", "sheet");

    useEffect(() => {
        if (!listingProp) return;
        setSheetData(listingProp);
    }, [listingProp]);

    useEffect(() => {
        if (!open) setAction("");
    }, [open]);

    const entityId = listingProp?._id ?? fetchId;
    const asListing = sheetData as Listing;

    if (!viewConfig) return null;
    if (!entityId) return null;

    return (
        <>
            <SheetViewRenderer
                config={viewConfig}
                url="/api/eCommerceMarketplace/listing/single"
                fetchId={fetchId ?? entityId}
                onDataFetched={(data) => setSheetData(data)}
                data={sheetData}
                open={open}
                onOpenChange={onOpenChange}
                resolveLanguageKey={resolveLanguageKey}
                access={access}
                hideActions={hideActions}
                onDelete={onDelete}
                onRestore={onRestore}
                editPath={listingEditPath(asListing)}
                onSheetRowPatched={(row) => {
                    setSheetData(row);
                    onSheetRowPatched?.(row as Partial<Listing>);
                }}
                actionMenuAllowCustomChildren
                actionMenuChildren={
                    <>
                        {asListing.status !== "active" && !asListing.deletedAt && (
                            <ActivateListingDropdown onAction={setAction} />
                        )}
                        {asListing.status !== "inactive" && !asListing.deletedAt && (
                            <DeactivateListingDropdown onAction={setAction} />
                        )}
                    </>
                }
            />
            {(action === "activate" || action === "deactivate") && (
                <ChangeListingStatusAction
                    listingId={asListing._id}
                    listingTitle={asListing.title}
                    targetStatus={action === "activate" ? "active" : "inactive"}
                    openAlert
                    url={`/api/eCommerceMarketplace/listing/${action}`}
                    onSuccess={(newStatus: string) => {
                        const patch = {status: newStatus};
                        setSheetData({...sheetData, ...patch});
                        onSheetRowPatched?.(patch);
                        setAction("");
                    }}
                    onCancel={() => setAction("")}
                />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/listings/center/sheetView/listingSheetView.tsx"),
    withDebug(true, true, "listings"),
)(ListingSheetView);
