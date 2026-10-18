import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {Bid} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/bid/bid.dto.ts";
import TableAvatar from "@coreModule/components/entityPage/list/tableAvatar.tsx";
import BidSheetView from "@eCommerceModule/clients/panel/private/bids/center/sheetView/bidSheetView.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import AcceptBidDropdown from "@eCommerceModule/clients/panel/private/bids/center/actions/acceptBidDropdown.tsx";
import RejectBidDropdown from "@eCommerceModule/clients/panel/private/bids/center/actions/rejectBidDropdown.tsx";
import BidActionConfirmAction from "@eCommerceModule/components/custom/bids/bidActionConfirmAction.tsx";
import DisplayValue from "@coreModule/components/viewEngine/widgets/display/displayValue.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

const STATUS_CONFIG: Record<string, {dot: string; dotAnim: string; text: string}> = {
    pending: {dot: "bg-warning", dotAnim: "animate-pulse", text: "text-warning"},
    accepted: {dot: "bg-success", dotAnim: "", text: "text-success"},
    rejected: {dot: "bg-muted-foreground/40", dotAnim: "", text: "text-muted-foreground"},
};

type BidCardProps = WithLanguageType & {
    bid: Bid;
    fetchId?: string;
    onDelete?: (deleted?: Bid, response?: DeletedData) => void;
    onRestore?: () => void;
    onBidUpdated?: (bid: Bid) => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<Bid> | null>;
};

function BidCard({
    bid,
    fetchId,
    onDelete,
    onRestore,
    onBidUpdated,
    hideActions = false,
    sheetOnly = false,
    innerRef,
}: BidCardProps) {
    return (
        <EntityCard
            resource="marketplacebids"
            entity={bid}
            fetchId={fetchId}
            singleUrl="/api/eCommerceMarketplace/bid/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            hideEdit
            sheetOnly={sheetOnly}
            editPath={() => ""}
            Sheet={BidSheetView}
            sheetEntityProp="bid"
            deleteUrl="/api/eCommerceMarketplace/bid"
            restoreUrl="/api/eCommerceMarketplace/bid/restore"
            failedTitle=""
            failedDescription=""
            titlePath="name"
            innerRef={innerRef}
            sheetProps={({entity: row, setEntity}) => ({
                fetchId,
                onBidUpdated: (updated: Bid) => {
                    setEntity({...row, ...updated});
                    onBidUpdated?.(updated);
                },
                onSheetRowPatched: (patch: Partial<Bid>) => setEntity({...row, ...patch}),
            })}
            extraDialogs={({action, setAction, entity: row, setEntity}) => (
                <>
                    {(action === "accept" || action === "reject") && (
                        <BidActionConfirmAction
                            bidId={row._id}
                            displayName={row.name}
                            actionKey={action}
                            openAlert
                            url={`/api/eCommerceMarketplace/bid/${action}`}
                            onSuccess={(updated: Bid) => {
                                setEntity({...row, ...updated});
                                onBidUpdated?.(updated);
                                setAction("");
                            }}
                            onCancel={() => setAction("")}
                        />
                    )}
                </>
            )}
        >
            {({entity: row, setAction}) => {
                const statusCfg = STATUS_CONFIG[row.status] ?? STATUS_CONFIG.pending;
                const taskTitle = row.taskRequest?.title || row.name || row._id;
                const bidderInitials = [row.bidder?.name?.[0], row.bidder?.surname?.[0]]
                    .filter(Boolean)
                    .join("")
                    .toUpperCase();
                return (
                    <>
                        <EntityCard.Header
                            titlePath="bidder"
                            title={<DisplayValue path="bidder" type="user" value={row.bidder} />}
                            icon={
                                row.bidder?.photo ? (
                                    <TableAvatar mediaId={row.bidder.photo} />
                                ) : (
                                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
                                        <span className="text-3xs font-bold leading-none text-primary">
                                            {bidderInitials || "?"}
                                        </span>
                                    </div>
                                )
                            }
                        >
                            <AcceptBidDropdown bid={row} onAction={setAction} />
                            <RejectBidDropdown bid={row} onAction={setAction} />
                        </EntityCard.Header>
                        <div className="flex flex-col gap-1.5">
                            <span
                                className={cn(
                                    "inline-flex items-center gap-1 text-3xs font-semibold uppercase tracking-wide",
                                    statusCfg.text,
                                )}
                            >
                                <span className={cn("h-1.5 w-1.5 rounded-full", statusCfg.dot, statusCfg.dotAnim)} />
                                <DisplayValue
                                    path="status"
                                    type="enum"
                                    languageKeyCategory="statuses"
                                    value={row.status}
                                />
                            </span>
                            <div className="flex items-end justify-between gap-2">
                                <span className="min-w-0 truncate text-xs text-muted-foreground">{taskTitle}</span>
                                <span className="shrink-0 text-sm font-bold leading-none text-foreground">
                                    <DisplayValue
                                        path="amount"
                                        type="currency"
                                        value={{amount: row.amount, currency: row.currency}}
                                    />
                                </span>
                            </div>
                        </div>
                    </>
                );
            }}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/bids/center/cardView/bidCard.tsx"),
    withDebug(true, true, "marketplacebids"),
)(BidCard);
