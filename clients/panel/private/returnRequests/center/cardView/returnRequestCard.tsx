import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {ReturnRequest} from "armonia/src/modules/eCommerce/api/eCommerce/private/returnRequest/returnRequest.dto.ts";
import {IconCalendarEvent, IconCreditCard, IconPackage} from "@tabler/icons-react";
import StatusBadge from "@coreModule/components/entityPage/sheet/statusBadge.tsx";
import ReturnRequestSheetView from "@eCommerceModule/clients/panel/private/returnRequests/center/sheetView/returnRequestSheetView.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ApproveReturnRequest from "@eCommerceModule/clients/panel/private/returnRequests/center/actions/approveReturnRequest.tsx";
import RejectReturnRequest from "@eCommerceModule/clients/panel/private/returnRequests/center/actions/rejectReturnRequest.tsx";
import ApproveReturnRequestDialog from "@eCommerceModule/clients/panel/private/returnRequests/center/dialogs/approveReturnRequestDialog.tsx";
import RejectReturnRequestDialog from "@eCommerceModule/clients/panel/private/returnRequests/center/dialogs/rejectReturnRequestDialog.tsx";
import ReceiveReturnRequest from "@eCommerceModule/clients/panel/private/returnRequests/center/actions/receiveReturnRequest.tsx";
import CompleteReturnRequest from "@eCommerceModule/clients/panel/private/returnRequests/center/actions/completeReturnRequest.tsx";
import ReceiveReturnRequestDialog from "@eCommerceModule/clients/panel/private/returnRequests/center/dialogs/receiveReturnRequestDialog.tsx";
import CompleteReturnRequestDialog from "@eCommerceModule/clients/panel/private/returnRequests/center/dialogs/completeReturnRequestDialog.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

const LIST_BASE = "/eCommerce/returnrequests";

function returnRequestEditPath(entity: ReturnRequest) {
    const params = new URLSearchParams();
    params.set("returnRequestId", entity._id);
    if (entity.type) params.set("returnRequestTitle", encodeURIComponent(String(entity.type)));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

type ReturnRequestCardProps = WithLanguageType & {
    entity: ReturnRequest;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: ReturnRequest, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<ReturnRequest> | null>;
};

function ReturnRequestCard({
    entity,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: ReturnRequestCardProps) {
    return (
        <EntityCard
            resource="returnRequests"
            entity={entity}
            fetchId={fetchId}
            singleUrl="/api/eCommerce/returnRequest/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={returnRequestEditPath}
            Sheet={ReturnRequestSheetView}
            sheetEntityProp="entity"
            deleteUrl="/api/eCommerce/returnRequest"
            restoreUrl="/api/eCommerce/returnRequest/restore"
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
            titlePath="type"
            innerRef={innerRef}
            sheetProps={({entity: row, setEntity}) => ({
                fetchId,
                onSheetRowPatched: (patched: Partial<ReturnRequest>) => {
                    setEntity({...row, ...patched});
                },
            })}
            extraDialogs={({action, setAction, entity: row, setEntity}) => (
                <>
                    {action === "approveReturnRequest" && (
                        <ApproveReturnRequestDialog
                            open
                            onClose={() => setAction("")}
                            entity={row}
                            onSuccess={(patch: Partial<ReturnRequest>) => setEntity({...row, ...patch})}
                        />
                    )}
                    {action === "receiveReturnRequest" && (
                        <ReceiveReturnRequestDialog
                            open
                            onClose={() => setAction("")}
                            entity={row}
                            onSuccess={(patch: Partial<ReturnRequest>) => setEntity({...row, ...patch})}
                        />
                    )}
                    {action === "completeReturnRequest" && (
                        <CompleteReturnRequestDialog
                            open
                            onClose={() => setAction("")}
                            entity={row}
                            onSuccess={(patch: Partial<ReturnRequest>) => setEntity({...row, ...patch})}
                        />
                    )}
                    {action === "rejectReturnRequest" && (
                        <RejectReturnRequestDialog
                            open
                            onClose={() => setAction("")}
                            entity={row}
                            onSuccess={(patch: Partial<ReturnRequest>) => setEntity({...row, ...patch})}
                        />
                    )}
                </>
            )}
        >
            {({entity: row, setAction}) => {
                // Its order and what is asked for, not just "Return" (UX-01).
                const typeText = row.type ? String(resolveLanguageKey(`returnType.${row.type}`)) : "";
                                const itemCount = row.items?.length ?? 0;
                return (
                    <>
                        <EntityCard.Header
                            titlePath={["order", "type"]}
                            title={[row.order?.orderNumber, typeText].filter(Boolean).join(" · ")}
                            badgesBesideTitle
                            badges={<StatusBadge tableConfigKey="returnRequests" field="status" value={row.status} label={String(resolveLanguageKey(`returnStatus.${row.status}`))} />}
                        >
                            <ApproveReturnRequest entity={row} onAction={setAction} />
                            <RejectReturnRequest entity={row} onAction={setAction} />
                            <ReceiveReturnRequest entity={row} onAction={setAction} />
                            <CompleteReturnRequest entity={row} onAction={setAction} />
                        </EntityCard.Header>
                        <EntityCard.Body>
                            {itemCount ? (
                                <EntityCardRow
                                    icon={IconPackage}
                                    label={resolveLanguageKey("items")}
                                    tooltip={resolveLanguageKey("items")}
                                    path="items"
                                    type="number"
                                    value={itemCount}
                                />
                            ) : null}
                            <EntityCardRow
                                icon={IconCalendarEvent}
                                label={resolveLanguageKey("requestedAt")}
                                tooltip={resolveLanguageKey("requestedAt")}
                                path="createdAt"
                                type="date"
                                value={row.createdAt}
                            />
                            {row.refundAmount != null ? (
                                <EntityCardRow
                                    icon={IconCreditCard}
                                    label={resolveLanguageKey("refundAmount")}
                                    tooltip={resolveLanguageKey("refundAmount")}
                                    path="refundAmount"
                                    type="currency"
                                    value={{amount: row.refundAmount, currency: row.order?.currency}}
                                />
                            ) : null}
                        </EntityCard.Body>
                    </>
                );
            }}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/returnRequests/center/cardView/returnRequestCard.tsx"),
    withDebug(true, true, "returnRequests"),
)(ReturnRequestCard);
