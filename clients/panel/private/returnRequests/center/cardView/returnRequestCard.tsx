import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {ReturnRequest} from "armonia/src/modules/eCommerce/api/eCommerce/private/returnRequest/returnRequest.dto.ts";
import {IconCurrencyDollar, IconTag} from "@tabler/icons-react";
import ReturnRequestSheetView from "@eCommerceModule/clients/panel/private/returnRequests/center/sheetView/returnRequestSheetView.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ApproveReturnRequest from "@eCommerceModule/clients/panel/private/returnRequests/center/actions/approveReturnRequest.tsx";
import RejectReturnRequest from "@eCommerceModule/clients/panel/private/returnRequests/center/actions/rejectReturnRequest.tsx";
import ApproveReturnRequestDialog from "@eCommerceModule/clients/panel/private/returnRequests/center/dialogs/approveReturnRequestDialog.tsx";
import RejectReturnRequestDialog from "@eCommerceModule/clients/panel/private/returnRequests/center/dialogs/rejectReturnRequestDialog.tsx";
import DisplayRow from "@coreModule/components/custom/displayValue/displayRow.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
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
            failedTitle=""
            failedDescription=""
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
            {({entity: row, setAction}) => (
                <>
                    <EntityCard.Header
                        titlePath="type"
                        title={
                            row.type
                                ? String(resolveLanguageKey(`returnType.${row.type}`))
                                : ""
                        }
                    >
                        <ApproveReturnRequest entity={row} onAction={setAction} />
                        <RejectReturnRequest entity={row} onAction={setAction} />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        <DisplayRow
                            icon={IconTag}
                            label={resolveLanguageKey("status")}
                            tooltip={resolveLanguageKey("status")}
                            path="status"
                            type="enum"
                            languageKeyCategory="returnStatus"
                            value={row.status}
                        />
                        <DisplayRow
                            icon={IconCurrencyDollar}
                            label={resolveLanguageKey("refundAmount")}
                            tooltip={resolveLanguageKey("refundAmount")}
                            path="refundAmount"
                            type="locale"
                            value={row.refundAmount}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/returnRequests/center/cardView/returnRequestCard.tsx"),
    withDebug(true, true, "returnRequests"),
)(ReturnRequestCard);
