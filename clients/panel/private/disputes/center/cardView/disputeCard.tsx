import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {Dispute} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/dispute/dispute.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import DisputeSheetView from "../sheetView/disputeSheetView.tsx";
import ChangeDisputeLifecycleAction from "@eCommerceModule/components/custom/disputes/changeDisputeLifecycleAction.tsx";
import StartReviewDisputeDropdown from "@eCommerceModule/clients/panel/private/disputes/center/actions/startReviewDisputeDropdown.tsx";
import ResolveDisputeDropdown from "@eCommerceModule/clients/panel/private/disputes/center/actions/resolveDisputeDropdown.tsx";
import CloseDisputeDropdown from "@eCommerceModule/clients/panel/private/disputes/center/actions/closeDisputeDropdown.tsx";
import type {DisputeLifecycleVerb} from "@eCommerceModule/components/custom/disputes/changeDisputeLifecycleAction.tsx";
import {IconPackage} from "@tabler/icons-react";
import DisplayValue from "@coreModule/components/viewEngine/widgets/display/displayValue.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

const STATUS_CONFIG: Record<string, {dot: string; dotAnim: string; text: string}> = {
    open: {dot: "bg-destructive", dotAnim: "animate-pulse", text: "text-destructive"},
    under_review: {dot: "bg-warning", dotAnim: "animate-pulse", text: "text-warning"},
    resolved: {dot: "bg-success", dotAnim: "", text: "text-success"},
    closed: {dot: "bg-muted-foreground/40", dotAnim: "", text: "text-muted-foreground"},
};

function disputeRowTitle(dispute: Dispute): string {
    const r = dispute.reason?.trim();
    return r ? (r.length > 80 ? `${r.slice(0, 80)}…` : r) : dispute._id;
}

type DisputeCardProps = WithLanguageType & {
    dispute: Dispute;
    fetchId?: string;
    onDelete?: (deleted?: Dispute, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
    onLifecyclePatched?: (patch: Partial<Dispute>) => void;
    innerRef?: RefObject<WithAxiosLifecycleRef<Dispute> | null>;
};

function DisputeCard({
    dispute,
    resolveLanguageKey,
    fetchId,
    onDelete,
    onRestore,
    hideActions = false,
    sheetOnly = false,
    onLifecyclePatched,
    innerRef,
}: DisputeCardProps) {
    return (
        <EntityCard
            resource="disputes"
            entity={dispute}
            fetchId={fetchId}
            singleUrl="/api/eCommerceMarketplace/dispute/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            hideEdit
            sheetOnly={sheetOnly}
            editPath={() => ""}
            Sheet={DisputeSheetView}
            sheetEntityProp="dispute"
            deleteUrl="/api/eCommerceMarketplace/dispute"
            restoreUrl="/api/eCommerceMarketplace/dispute/restore"
            failedTitle=""
            failedDescription=""
            titlePath="reason"
            innerRef={innerRef}
            sheetProps={({entity: row, setEntity}) => ({
                fetchId,
                onListLifecyclePatched: (patch: Partial<Dispute>) => {
                    setEntity({...row, ...patch});
                    onLifecyclePatched?.(patch);
                },
            })}
            extraDialogs={({action, setAction, entity: row, setEntity}) => (
                <>
                    {(action === "startReview" || action === "resolve" || action === "close") && (
                        <ChangeDisputeLifecycleAction
                            disputeId={row._id}
                            disputeTitle={disputeRowTitle(row)}
                            verb={action as DisputeLifecycleVerb}
                            openAlert
                            url={`/api/eCommerceMarketplace/dispute/${action}`}
                            onSuccess={(patch: Partial<Dispute>) => {
                                setEntity({...row, ...patch});
                                onLifecyclePatched?.(patch);
                                setAction("");
                            }}
                            onCancel={() => setAction("")}
                        />
                    )}
                </>
            )}
        >
            {({entity: row, setAction}) => {
                const statusCfg = STATUS_CONFIG[row.status] ?? STATUS_CONFIG.closed;
                const initiatorInitials = [row.initiator?.name?.[0], row.initiator?.surname?.[0]]
                    .filter(Boolean)
                    .join("")
                    .toUpperCase();
                const orderTitle =
                    row.order?.listing?.title ||
                    row.order?.taskRequest?.title ||
                    row.order?.name ||
                    row.order?._id;
                return (
                    <>
                        <EntityCard.Header titlePath="reason" title={row.reason}>
                            <StartReviewDisputeDropdown dispute={row} onAction={setAction} />
                            <ResolveDisputeDropdown dispute={row} onAction={setAction} />
                            <CloseDisputeDropdown dispute={row} onAction={setAction} />
                        </EntityCard.Header>
                        <div className="flex flex-col gap-2">
                            <span
                                className={cn(
                                    "inline-flex items-center gap-1.5 text-3xs font-semibold tracking-wide uppercase",
                                    statusCfg.text,
                                )}
                            >
                                <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", statusCfg.dot, statusCfg.dotAnim)} />
                                <DisplayValue
                                    path="status"
                                    type="enum"
                                    languageKeyCategory="status_values"
                                    value={row.status}
                                />
                            </span>
                            {row.initiator ? (
                                <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted ring-1 ring-border">
                                        <span className="text-3xs font-bold leading-none text-foreground">
                                            {initiatorInitials || "?"}
                                        </span>
                                    </div>
                                    <DisplayValue path="initiator" type="user" value={row.initiator} />
                                </div>
                            ) : null}
                            <div className="h-px bg-border" />
                            <div className="flex items-end justify-between gap-2">
                                {orderTitle ? (
                                    <span className="flex min-w-0 items-center gap-1 truncate text-xs text-muted-foreground">
                                        <IconPackage className="h-3 w-3 shrink-0" />
                                        <DisplayValue path="order.listing.title" value={orderTitle} />
                                    </span>
                                ) : null}
                                {row.order?.amount != null ? (
                                    <div className="ml-auto shrink-0 text-right">
                                        <div className="mb-0.5 text-3xs leading-none tracking-wide text-muted-foreground uppercase">
                                            {resolveLanguageKey("amount")}
                                        </div>
                                        <span className="text-base font-bold leading-none text-foreground">
                                            <DisplayValue
                                                path="order.amount"
                                                type="currency"
                                                value={{amount: row.order.amount, currency: row.order.currency}}
                                            />
                                        </span>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </>
                );
            }}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/disputes/center/cardView/disputeCard.tsx"),
    withDebug(true, true, "disputes"),
)(DisputeCard);
