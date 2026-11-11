import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {StockTransfer} from "armonia/src/modules/eCommerce/api/eCommerce/private/stockTransfer/stockTransfer.dto.ts";
import {IconCalendarEvent} from "@tabler/icons-react";
import StatusBadge from "@coreModule/components/entityPage/sheet/statusBadge.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {accessFieldPathExists} from "@coreModule/helpers/context/accessContext.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import StockDocumentActionItems from "@eCommerceModule/components/custom/stockDocuments/stockDocumentActionItems.tsx";
import StockDocumentActionDialog from "@eCommerceModule/components/custom/stockDocuments/stockDocumentActionDialog.tsx";
import StockTransferSheetView, {stockTransferEditPath} from "@eCommerceModule/clients/panel/private/stockTransfers/center/sheetView/stockTransferSheetView.tsx";
import {isStockDocumentAction} from "@eCommerceModule/components/custom/stockDocuments/stockDocumentActions.ts";

type StockTransferCardProps = WithLanguageType & {
    entity: StockTransfer;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: StockTransfer, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
};

function StockTransferCard({entity, resolveLanguageKey, fetchId, hideActions = false, onDelete, onRestore, sheetOnly = false}: StockTransferCardProps) {
    return (
        <EntityCard
            resource="stockTransfers"
            entity={entity}
            fetchId={fetchId}
            singleUrl="/api/eCommerce/stockTransfer/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={stockTransferEditPath}
            hideEdit={(row) => row.status !== "draft"}
            Sheet={StockTransferSheetView}
            sheetEntityProp="entity"
            deleteUrl="/api/eCommerce/stockTransfer"
            restoreUrl="/api/eCommerce/stockTransfer/restore"
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
            titlePath={["fromWarehouse.name", "toWarehouse.name"]}
            sheetProps={({entity: row, setEntity}) => ({
                fetchId,
                onSheetRowPatched: (patched: Partial<StockTransfer>) => setEntity({...row, ...patched}),
            })}
            extraDialogs={({action, setAction, entity: row, setEntity}) => isStockDocumentAction("stockTransfers", action) ? (
                <StockDocumentActionDialog
                    resource="stockTransfers"
                    action={action}
                    entity={row}
                    onClose={() => setAction("")}
                    onSuccess={(patch) => setEntity({...row, ...patch} as StockTransfer)}
                />
            ) : null}
        >
            {({entity: row, read, setAction}) => {
                const fromName = accessFieldPathExists(read, "fromWarehouse.name") ? row.fromWarehouse?.name ?? "" : "";
                const toName = accessFieldPathExists(read, "toWarehouse.name") ? row.toWarehouse?.name ?? "" : "";
                const title = [fromName, toName].filter((part) => part.length > 0).join(" → ");
                return (
                <>
                    <EntityCard.Header
                        titlePath={["fromWarehouse.name", "toWarehouse.name"]}
                        title={title}
                        badgesBesideTitle
                        badges={<StatusBadge tableConfigKey="stockTransfers" field="status" value={row.status} label={String(resolveLanguageKey(`stockTransferStatus.${row.status}`))} />}
                    >
                        <StockDocumentActionItems resource="stockTransfers" entity={row} onAction={setAction} />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        {/* The destination is already in the title; the card adds when it moved (UX-02). */}
                        <EntityCardRow
                            icon={IconCalendarEvent}
                            label={resolveLanguageKey("date")}
                            tooltip={resolveLanguageKey("date")}
                            path={row.doneAt ? "doneAt" : "createdAt"}
                            type="date"
                            value={row.doneAt ?? row.createdAt}
                        />
                    </EntityCard.Body>
                </>
                );
            }}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/stockTransfers/center/cardView/stockTransferCard.tsx"),
    withDebug(true, true, "stockTransfers"),
)(StockTransferCard);
