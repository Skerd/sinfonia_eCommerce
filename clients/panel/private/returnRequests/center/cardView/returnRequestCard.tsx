import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useState} from "react";
import TooltipDisplayer from "@coreModule/components/custom/tooltipDisplayer.tsx";
import ValueNotSet from "@coreModule/components/custom/valueNotSet.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {ReturnRequest} from "armonia/src/modules/eCommerce/api/eCommerce/private/returnRequest/returnRequest.dto.ts";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import InfoRow from "@coreModule/components/custom/infoRow.tsx";
import {IconTag, IconCurrencyDollar} from "@tabler/icons-react";
import ReturnRequestSheetView from "@eCommerceModule/clients/panel/private/returnRequests/center/sheetView/returnRequestSheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import ApproveReturnRequest from "@eCommerceModule/clients/panel/private/returnRequests/center/actions/approveReturnRequest.tsx";
import RejectReturnRequest from "@eCommerceModule/clients/panel/private/returnRequests/center/actions/rejectReturnRequest.tsx";
import ApproveReturnRequestDialog from "@eCommerceModule/clients/panel/private/returnRequests/center/dialogs/approveReturnRequestDialog.tsx";
import RejectReturnRequestDialog from "@eCommerceModule/clients/panel/private/returnRequests/center/dialogs/rejectReturnRequestDialog.tsx";
import {InfoRowGroup} from "@coreModule/components/custom/infoRowGroup.tsx";
import {useEntityCard} from "@coreModule/helpers/hooks/useEntityCard.ts";
import {EntityCardShell} from "@coreModule/components/custom/cards/EntityCardShell.tsx";
import {EntityTextCardHeader} from "@coreModule/components/custom/cards/EntityTextCardHeader.tsx";
import {CARD_BODY_CLASS} from "@coreModule/components/custom/cards/entityCard.constants.ts";
import {Separator} from "@coreModule/components/ui/separator.tsx";

const LIST_BASE = "/eCommerce/returnrequests";

function returnRequestEditPath(entity: ReturnRequest) {
    const params = new URLSearchParams();
    params.set("returnRequestId", entity._id);
    if (entity.type) params.set("returnRequestTitle", encodeURIComponent(String(entity.type)));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

type ReturnRequestCardProps = WithLanguageType & {
    entity: ReturnRequest;
    onDelete?: (deleted?: ReturnRequest, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
};

function ReturnRequestCard({
    entity: entityProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    hideActions = false,
    sheetOnly = false,
}: ReturnRequestCardProps) {
    const {action, setAction, entity: entity, setEntity, hideAfterDeletion, onDelete, onRestore} = useEntityCard({
        entityProp: entityProp,
        onDeleteProp,
        onRestoreProp,
    });

    const {read, restore} = useAccess("returnRequests");


    if (hideAfterDeletion) {
        return <></>;
    }
    if (!restore && entity.deletedAt != null) {
        return <></>;
    }
    if (!read || !Object.keys(read).length) {
        return <HiddenElement />;
    }

    return (
        <>
            {!sheetOnly && (
                <EntityCardShell onClick={() => setAction("view")}>
                    <div className="flex w-full items-stretch">
                        {(read.deletedBy || read.deletedAt) && (
                            <DeletedInfo deletedAt={entity.deletedAt} deletedBy={entity.deletedBy} />
                        )}
                        <div className="w-full min-w-0">
                            <EntityTextCardHeader
                                title={null}
                                showTitle={true}
                                badges={undefined}
                                showBadges={false}
                                hideActions={hideActions}
                                actionMenu={
                                    <ActionMenu
                                            accessModel={"returnRequests"}
                                            deletedData={entity}
                                            onAction={(a: string) => setAction(a)}
                                            editPath={returnRequestEditPath(entity)}
                                            allowMenuForCustomChildren
                                        >
                                            <ApproveReturnRequest entity={entity} onAction={(a: string) => setAction(a)} />
                                            <RejectReturnRequest entity={entity} onAction={(a: string) => setAction(a)} />
                                        </ActionMenu>
                                }
                            />
                            <div className={CARD_BODY_CLASS}>
                                <Separator />
                                <div className="flex flex-col gap-y-1">
                                    <InfoRowGroup>
<InfoRow
                                        label={resolveLanguageKey("status")}
                                        icon={IconTag}
                                        show
                                        value={
                                            <HiddenElement randomLength={read?.status ? 0 : 6}>
                                                {!!read?.status && entity.status
                                                    ? resolveLanguageKey("returnStatus." + entity.status)
                                                    : null}
                                            </HiddenElement>
                                        }
                                    />
                                </InfoRowGroup>
                                    <InfoRow
                                        label={resolveLanguageKey("refundAmount")}
                                        icon={IconCurrencyDollar}
                                        show
                                        value={
                                            <HiddenElement randomLength={read?.refundAmount ? 0 : 8}>
                                                {!!read?.refundAmount && entity.refundAmount != null
                                                    ? String(entity.refundAmount)
                                                    : null}
                                            </HiddenElement>
                                        }
                                    />
                            </div>
                        </div>
                        </div>
                    </div>
                </EntityCardShell>
            )}

            {!!action && (
                <>
                    {action === "view" && (
                        <ReturnRequestSheetView
                            open={action === "view"}
                            onOpenChange={() => setAction("")}
                            entity={entity}
                            fetchId={entity._id}
                            onDelete={onDelete}
                            onRestore={onRestore}
                            onSheetRowPatched={(row: Partial<ReturnRequest>) => setEntity(row as ReturnRequest)}
                        />
                    )}
                    {action === "delete" && (
                        <DeleteAction
                            accessModel={"returnRequests"}
                            deleteId={entity._id}
                            openAlert={action === "delete"}
                            name={read?.type && String(entity.type ?? "")}
                            confirmName={read?.type && String(entity.type ?? "")}
                            onSuccess={onDelete}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/returnRequest"
                        />
                    )}
                    {action === "restore" && (
                        <RestoreAction
                            accessModel={"returnRequests"}
                            deleteId={entity._id}
                            openAlert={action === "restore"}
                            name={read?.type && String(entity.type ?? "")}
                            confirmName={read?.type && String(entity.type ?? "")}
                            onSuccess={onRestore}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/returnRequest/restore"
                        />
                    )}
                    {action === "approveReturnRequest" && (
                        <ApproveReturnRequestDialog
                            open={true}
                            onClose={() => setAction("")}
                            entity={entity}
                            onSuccess={(patch: Partial<ReturnRequest>) => setEntity({...entity, ...patch})}
                        />
                    )}
                    {action === "rejectReturnRequest" && (
                        <RejectReturnRequestDialog
                            open={true}
                            onClose={() => setAction("")}
                            entity={entity}
                            onSuccess={(patch: Partial<ReturnRequest>) => setEntity({...entity, ...patch})}
                        />
                    )}
                </>
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/returnRequests/center/cardView/returnRequestCard.tsx"),
    withDebug(true, true),
)(ReturnRequestCard);
