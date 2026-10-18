import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {Dispute} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/dispute/dispute.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import DisputeCard from "./center/cardView/disputeCard.tsx";
import ChangeDisputeLifecycleAction from "@eCommerceModule/components/custom/disputes/changeDisputeLifecycleAction.tsx";
import StartReviewDisputeDropdown from "@eCommerceModule/clients/panel/private/disputes/center/actions/startReviewDisputeDropdown.tsx";
import ResolveDisputeDropdown from "@eCommerceModule/clients/panel/private/disputes/center/actions/resolveDisputeDropdown.tsx";
import CloseDisputeDropdown from "@eCommerceModule/clients/panel/private/disputes/center/actions/closeDisputeDropdown.tsx";
import DisputeSheetView from "./center/sheetView/disputeSheetView.tsx";

/** Disputes are not edited via a form page; lifecycle uses actions only (mirrors promotions). */
function noopDisputeEditPath(_dispute: Pick<Dispute, "_id">): string {
    return "";
}

function disputeRowLabel(dispute: Dispute): string {
    return dispute.reason?.trim() ? dispute.reason.slice(0, 80) + (dispute.reason.length > 80 ? "…" : "") : dispute._id;
}

function AllDisputes({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<Dispute>
            apiUrl="/api/eCommerceMarketplace/dispute"
            collectionName="disputes"
            accessModel="disputes"
            tableConfigKey="disputes"
            createPath="/eCommerceMarketplace/disputes/create"
            createIcon={<IconPlus />}
            createLanguageKey="createDispute"
            buildEditPath={noopDisputeEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerce/clients/panel/private/disputes/center/sheetView/disputeSheetView.tsx"
            rowActionMenu={{allowMenuForCustomChildren: true, hideEdit: true}}
            renderActionMenuChildren={(dispute, bindRowAction) => (
                <>
                    <StartReviewDisputeDropdown dispute={dispute} onAction={bindRowAction} />
                    <ResolveDisputeDropdown dispute={dispute} onAction={bindRowAction} />
                    <CloseDisputeDropdown dispute={dispute} onAction={bindRowAction} />
                </>
            )}
            renderFloatingModals={({action, entity, resetAction, listRef}) => {
                if (action !== "startReview" && action !== "resolve" && action !== "close") {
                    return null;
                }
                const label = disputeRowLabel(entity);
                return (
                    <ChangeDisputeLifecycleAction
                        disputeId={entity._id}
                        disputeTitle={label}
                        verb={action}
                        openAlert
                        url={`/api/eCommerceMarketplace/dispute/${action}`}
                        onSuccess={(patch: Partial<Dispute>) => {
                            listRef.current?.updateRow?.(entity._id, patch);
                            resetAction();
                        }}
                        onCancel={resetAction}
                    />
                );
            }}
            buildDeleteConfirmLabel={(entity) => entity.reason ?? entity._id}
            renderSheet={({entity, open, onOpenChange, onDelete, onRestore, listRef}) => (
                <DisputeSheetView
                    open={open}
                    onOpenChange={(opened: boolean) => {
                        if (!opened) {
                            onOpenChange();
                        }
                    }}
                    dispute={entity}
                    onDelete={onDelete}
                    onRestore={onRestore}
                    onListLifecyclePatched={(patch: Partial<Dispute>) => {
                        listRef.current?.updateRow?.(entity._id, patch);
                    }}
                />
            )}
            renderCard={(disputeRow, onDelete, onRestore, listRef) => (
                <DisputeCard
                    dispute={disputeRow}
                    onDelete={(row: Dispute | undefined, response?: DeletedData) => onDelete(row ?? disputeRow, response)}
                    onRestore={() => onRestore(disputeRow)}
                    onLifecyclePatched={(patch: Partial<Dispute>) => listRef?.current?.updateRow?.(disputeRow._id, patch)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/disputes/index.tsx"),
    withDebug(true, true, "disputes"),
)(AllDisputes);
