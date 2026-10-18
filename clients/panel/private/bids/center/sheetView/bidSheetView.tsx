import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import type {Bid} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/bid/bid.dto.ts";
import type {DeleteResponse} from "armonia/src/modules/core/types/shared.types.ts";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import AcceptBidDropdown from "@eCommerceModule/clients/panel/private/bids/center/actions/acceptBidDropdown.tsx";
import RejectBidDropdown from "@eCommerceModule/clients/panel/private/bids/center/actions/rejectBidDropdown.tsx";
import BidActionConfirmAction from "@eCommerceModule/components/custom/bids/bidActionConfirmAction.tsx";

export type BidSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    bid?: Bid;
    hideActions?: boolean;
    onDelete?: (response?: DeleteResponse) => void;
    onRestore?: () => void;
    onSheetRowPatched?: (patch: Partial<Bid>) => void;
    onBidUpdated?: (bid: Bid) => void;
    fetchId?: string;
};

function BidSheetView({
    open,
    onOpenChange,
    bid: bidProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    onSheetRowPatched,
    onBidUpdated,
    fetchId,
}: BidSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(bidProp || {_id: fetchId});
    const [action, setAction] = useState("");
    const access = useAccess("marketplacebids");
    const viewConfig = useViewConfig("marketplacebids", "sheet");

    useEffect(() => {
        if (!bidProp) return;
        setSheetData(bidProp);
    }, [bidProp]);

    useEffect(() => {
        if (!open) setAction("");
    }, [open]);

    const entityId = bidProp?._id ?? fetchId;
    const asBid = sheetData as Bid;
    const displayLabel = asBid.name || asBid.taskRequest?.title || String(entityId ?? "");

    if (!viewConfig) return null;
    if (!entityId) return null;

    const applyBidUpdate = (updated: Bid) => {
        setSheetData(updated);
        onSheetRowPatched?.(updated);
        onBidUpdated?.(updated);
    };

    return (
        <>
            <SheetViewRenderer
                config={viewConfig}
                url="/api/eCommerceMarketplace/bid/single"
                fetchId={fetchId}
                onDataFetched={(data) => setSheetData(data)}
                onSheetRowPatched={onSheetRowPatched}
                data={sheetData}
                open={open}
                onOpenChange={onOpenChange}
                resolveLanguageKey={resolveLanguageKey}
                access={access}
                hideActions={hideActions}
                onDelete={onDelete}
                onRestore={onRestore}
                editPath=""
                deleteRestoreConfirmLabel={displayLabel}
                actionMenuAllowCustomChildren
                actionMenuChildren={
                    <>
                        <AcceptBidDropdown bid={asBid} onAction={setAction} />
                        <RejectBidDropdown bid={asBid} onAction={setAction} />
                    </>
                }
            />
            {(action === "accept" || action === "reject") && (
                <BidActionConfirmAction
                    bidId={String(asBid._id)}
                    displayName={displayLabel}
                    actionKey={action}
                    openAlert
                    url={`/api/eCommerceMarketplace/bid/${action}`}
                    onSuccess={(updated: Bid) => {
                        applyBidUpdate(updated);
                        setAction("");
                    }}
                    onCancel={() => setAction("")}
                />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/bids/center/sheetView/bidSheetView.tsx"),
    withDebug(true, true, "marketplacebids"),
)(BidSheetView);
