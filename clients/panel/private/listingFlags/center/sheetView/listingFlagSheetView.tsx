import {compose} from "redux";
import {useCallback, useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import ResolveListingFlagDropdown from "@eCommerceModule/clients/panel/private/listingFlags/center/actions/resolveListingFlagDropdown.tsx";
import DismissListingFlagDropdown from "@eCommerceModule/clients/panel/private/listingFlags/center/actions/dismissListingFlagDropdown.tsx";
import ChangeListingFlagLifecycleAction from "@eCommerceModule/components/custom/listingFlags/changeListingFlagLifecycleAction.tsx";
import type {ListingFlag} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/listingFlag/listingFlag.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";

export type ListingFlagSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    listingFlag?: ListingFlag;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    onListLifecyclePatched?: (patch: Partial<ListingFlag>) => void;
    fetchId?: string;
};

function listingFlagRowTitle(flag: ListingFlag): string {
    const title = flag.listing?.title?.trim();
    return title || flag._id;
}

function ListingFlagSheetView({
    open,
    onOpenChange,
    listingFlag: flagProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    onListLifecyclePatched,
    fetchId,
}: ListingFlagSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(flagProp || {_id: fetchId});
    const [action, setAction] = useState("");
    const access = useAccess("listingflags");
    const viewConfig = useViewConfig("listingflags", "sheet");

    useEffect(() => {
        if (!flagProp) return;
        setSheetData(flagProp);
    }, [flagProp]);

    useEffect(() => {
        if (!open) setAction("");
    }, [open]);

    const handleDelete = useCallback(
        (response?: DeletedData) => {
            if (response?.deletedAt != null || response?.deletedBy != null) {
                setSheetData((prev) => ({...prev, ...response}));
            }
            onDelete(response);
        },
        [onDelete],
    );

    const handleRestore = useCallback(() => {
        setSheetData((prev) => ({
            ...prev,
            deletedAt: undefined,
            deletedBy: undefined,
        }));
        onRestore();
    }, [onRestore]);

    const entityId = flagProp?._id ?? fetchId;
    const asFlag = sheetData as ListingFlag;
    const title = listingFlagRowTitle(asFlag);

    if (!viewConfig || !entityId) return null;

    const row =
        asFlag._id
            ? asFlag
            : ({_id: entityId, reason: "other", status: "pending"} as ListingFlag);

    const editPath = (() => {
        const params = new URLSearchParams();
        params.set("listingFlagId", String(entityId));
        return `/eCommerceMarketplace/listingflags/edit?${params.toString()}`;
    })();

    return (
        <>
            <SheetViewRenderer
                config={viewConfig}
                url="/api/eCommerceMarketplace/listingFlag/single"
                fetchId={fetchId}
                onDataFetched={setSheetData}
                data={sheetData}
                open={open}
                onOpenChange={onOpenChange}
                resolveLanguageKey={resolveLanguageKey}
                access={access}
                hideActions={hideActions}
                onDelete={handleDelete}
                onRestore={handleRestore}
                editPath={editPath}
                hideEdit={row.status !== "pending"}
                deleteRestoreConfirmLabel={title}
                actionMenuAllowCustomChildren
                actionMenuChildren={
                    <>
                        <ResolveListingFlagDropdown listingFlag={row} onAction={setAction} />
                        <DismissListingFlagDropdown listingFlag={row} onAction={setAction} />
                    </>
                }
                onSheetRowPatched={setSheetData}
            />
            {(action === "resolve" || action === "dismiss") && (
                <ChangeListingFlagLifecycleAction
                    listingFlagId={String(row._id)}
                    listingFlagTitle={title}
                    verb={action}
                    openAlert
                    url={`/api/eCommerceMarketplace/listingFlag/${action}`}
                    onSuccess={(patch: Partial<ListingFlag>) => {
                        setSheetData({...sheetData, ...patch});
                        onListLifecyclePatched?.(patch);
                        setAction("");
                    }}
                    onCancel={() => setAction("")}
                />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/listingFlags/center/sheetView/listingFlagSheetView.tsx"),
    withDebug(true, true, "listingflags"),
)(ListingFlagSheetView);
