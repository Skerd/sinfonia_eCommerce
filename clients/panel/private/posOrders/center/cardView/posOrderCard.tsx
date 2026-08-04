import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useState} from "react";
import ValueNotSet from "@coreModule/components/custom/valueNotSet.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {PosOrder} from "armonia/src/modules/eCommerce/api/eCommerce/private/posOrder/posOrder.dto.ts";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import {IconCash, IconPackage, IconUser} from "@tabler/icons-react";
import PosOrderSheetView from "@eCommerceModule/clients/panel/private/posOrders/center/sheetView/posOrderSheetView.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import ReprintPosOrder from "@eCommerceModule/clients/panel/private/posOrders/center/actions/reprintPosOrder.tsx";
import ReprintPosOrderDialog from "@eCommerceModule/clients/panel/private/posOrders/center/dialogs/reprintPosOrderDialog.tsx";
import {InfoRowGroup} from "@coreModule/components/custom/infoRowGroup.tsx";
import {useEntityCard} from "@coreModule/helpers/hooks/useEntityCard.ts";
import {EntityCardShell} from "@coreModule/components/custom/cards/EntityCardShell.tsx";
import {EntityTextCardHeader} from "@coreModule/components/custom/cards/EntityTextCardHeader.tsx";
import {CARD_BODY_CLASS} from "@coreModule/components/custom/cards/entityCard.constants.ts";
import {Separator} from "@coreModule/components/ui/separator.tsx";

function stateColor(state: string): string {
    switch (state) {
        case "paid":
            return "text-success bg-success";
        case "draft":
            return "text-warning bg-warning";
        case "cancel":
        case "refunded":
            return "text-destructive bg-destructive";
        default:
            return "text-info bg-info";
    }
}

function formatMoney(amount: number | undefined | null): string {
    const n = (amount ?? 0).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2});
    return n;
}

type PosOrderCardProps = WithLanguageType & {
    entity: PosOrder;
    onDelete?: (deleted?: PosOrder, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
};

function PosOrderCard({
    entity: entityProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    hideActions = false,
    sheetOnly = false,
}: PosOrderCardProps) {
    const {action, setAction, entity: entity, setEntity, hideAfterDeletion, onDelete, onRestore} = useEntityCard({
        entityProp: entityProp,
        onDeleteProp,
        onRestoreProp,
    });

    const {read, restore} = useAccess("posOrders");


    if (hideAfterDeletion) {
        return <></>;
    }
    if (!restore && entity.deletedAt != null) {
        return <></>;
    }
    if (!read || !Object.keys(read).length) {
        return <HiddenElement />;
    }

    const canReadCustomer = !!(read?.customer || read?.customerName);
    const customerFromName = read?.customerName && entity.customerName ? entity.customerName : undefined;
    const customerFromRef =
        read?.customer && (read?.customer?.keys?.name || read?.customer?.keys?.surname)
            ? [
                  read?.customer?.keys?.name ? entity.customer?.name : "",
                  read?.customer?.keys?.surname ? entity.customer?.surname : "",
              ]
                  .filter(Boolean)
                  .join(" ") || undefined
            : undefined;
    const customerDisplay = customerFromName || customerFromRef;
    const colors = stateColor(entity.state);
    const lineCount = entity.lines?.length;

    return (
        <>
            {!sheetOnly && (
                <EntityCardShell onClick={() => setAction("view")}>
                    <div className="flex w-full items-stretch">
                        {(read.deletedBy || read.deletedAt) && (
                            <DeletedInfo deletedAt={entity.deletedAt} deletedBy={entity.deletedBy} />
                        )}
                        <div className="w-full min-w-0 py-3 px-4">
                            <div className="flex justify-between items-start gap-2">
                                <div className="min-w-0 flex-1">
                                    <HiddenElement randomLength={10}>
                                        {read?.name ? (
                                            <div className="font-semibold text-base leading-tight truncate">
                                                {entity.name || <ValueNotSet />}
                                            </div>
                                        ) : null}
                                    </HiddenElement>
                                    {(!!customerDisplay || !canReadCustomer) && (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                            <IconUser className="w-3.5 h-3.5 shrink-0" />
                                            <HiddenElement randomLength={canReadCustomer ? 0 : 8}>
                                                {canReadCustomer && customerDisplay ? (
                                                    <span className="truncate">{customerDisplay}</span>
                                                ) : null}
                                            </HiddenElement>
                                        </div>
                                    )}
                                </div>
                                {!hideActions && (
                                    <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                                        <ActionMenu
                                            accessModel={"posOrders"}
                                            deletedData={entity}
                                            onAction={(a: string) => setAction(a)}
                                            editPath=""
                                            hideEdit
                                            allowMenuForCustomChildren
                                        >
                                            <ReprintPosOrder entity={entity} onAction={(a: string) => setAction(a)} />
                                        </ActionMenu>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between gap-2 mt-3">
                                <HiddenElement randomLength={read?.state ? 0 : 6}>
                                    {!!read?.state && entity.state ? (
                                        <span
                                            className={cn(
                                                "inline-flex items-center gap-1.5 text-3xs font-semibold uppercase tracking-wide",
                                                colors.split(" ")[0],
                                            )}
                                        >
                                            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", colors.split(" ")[1])} />
                                            {resolveLanguageKey("orderState." + entity.state)}
                                        </span>
                                    ) : null}
                                </HiddenElement>
                                <HiddenElement randomLength={read?.amountTotal ? 0 : 8}>
                                    {!!read?.amountTotal ? (
                                        <span className="font-bold text-base text-foreground leading-none ml-auto inline-flex items-center gap-1">
                                            <IconCash className="w-3.5 h-3.5 text-muted-foreground" />
                                            {formatMoney(entity.amountTotal)}
                                        </span>
                                    ) : null}
                                </HiddenElement>
                            </div>

                            {(lineCount != null || !read?.lines) && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                                    <IconPackage className="w-3.5 h-3.5 shrink-0" />
                                    <HiddenElement randomLength={read?.lines ? 0 : 6}>
                                        {!!read?.lines && lineCount != null ? (
                                            <span>
                                                {lineCount} {resolveLanguageKey("items")}
                                            </span>
                                        ) : null}
                                    </HiddenElement>
                                </div>
                            )}
                        </div>
                    </div>
                </EntityCardShell>
            )}

            {!!action && (
                <>
                    {action === "view" && (
                        <PosOrderSheetView
                            open={action === "view"}
                            onOpenChange={() => setAction("")}
                            entity={entity}
                            fetchId={entity._id}
                            onDelete={onDelete}
                            onRestore={onRestore}
                        />
                    )}
                    {action === "delete" && (
                        <DeleteAction
                            accessModel={"posOrders"}
                            deleteId={entity._id}
                            openAlert={action === "delete"}
                            name={read?.name && entity.name}
                            confirmName={read?.name && entity.name}
                            onSuccess={onDelete}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/posOrder"
                        />
                    )}
                    {action === "restore" && (
                        <RestoreAction
                            accessModel={"posOrders"}
                            deleteId={entity._id}
                            openAlert={action === "restore"}
                            name={read?.name && entity.name}
                            confirmName={read?.name && entity.name}
                            onSuccess={onRestore}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/posOrder/restore"
                        />
                    )}
                    {action === "reprintPosOrder" && (
                        <ReprintPosOrderDialog
                            open={true}
                            onClose={() => setAction("")}
                            entity={entity}
                        />
                    )}
                </>
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/posOrders/center/cardView/posOrderCard.tsx"),
    withDebug(true, true),
)(PosOrderCard);
